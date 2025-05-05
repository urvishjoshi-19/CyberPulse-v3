import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { exec } from "child_process";
import path from "path";
import { z } from "zod";
import { insertArticleSchema, insertKeywordSchema } from "@shared/schema";
import { log } from "./vite";

// Helper function to run the Python scraper
function runScraper(): Promise<string> {
  return new Promise((resolve, reject) => {
    const scraperPath = path.resolve("server", "scraper.py");
    exec(`python ${scraperPath}`, (error, stdout, stderr) => {
      if (error) {
        log(`Scraper error: ${error.message}`, 'scraper');
        return reject(error);
      }
      if (stderr) {
        log(`Scraper stderr: ${stderr}`, 'scraper');
      }
      resolve(stdout);
    });
  });
}

// Process scraped articles and check for keyword matches
async function processArticles(articles: any[]): Promise<any[]> {
  const keywords = await storage.getKeywords();
  const enabledKeywords = keywords.filter(k => k.enabled).map(k => k.word.toLowerCase());
  
  const processedArticles = [];
  
  for (const article of articles) {
    try {
      // Check if article already exists by URL
      const existingArticle = await storage.getArticleByUrl(article.url);
      if (existingArticle) {
        processedArticles.push(existingArticle);
        continue;
      }
      
      // Check for keyword matches
      const matchedKeywords: string[] = [];
      const contentToCheck = (article.title + " " + article.summary).toLowerCase();
      
      for (const keyword of enabledKeywords) {
        if (contentToCheck.includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
          // Increment match count for the keyword
          const keywordObj = await storage.getKeywordByWord(keyword);
          if (keywordObj) {
            await storage.incrementKeywordMatch(keywordObj.id);
          }
        }
      }
      
      // Prepare article for storage
      const newArticle = {
        ...article,
        alert: matchedKeywords.length > 0,
        matched_keywords: matchedKeywords
      };
      
      // Save to storage
      const savedArticle = await storage.createArticle(newArticle);
      processedArticles.push(savedArticle);
      
    } catch (error) {
      log(`Error processing article: ${error}`, 'processing');
    }
  }
  
  return processedArticles;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all articles
  app.get('/api/news', async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    try {
      const articles = await storage.getArticles(limit, offset);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching articles', error });
    }
  });
  
  // Get article by ID
  app.get('/api/news/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching article', error });
    }
  });
  
  // Get articles with alerts
  app.get('/api/alerts', async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    try {
      const articles = await storage.getAlertArticles(limit, offset);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching alert articles', error });
    }
  });
  
  // Get articles by tag
  app.get('/api/news/tag/:tag', async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    try {
      const articles = await storage.getArticlesByTag(req.params.tag, limit, offset);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching articles by tag', error });
    }
  });
  
  // Get all keywords
  app.get('/api/keywords', async (req: Request, res: Response) => {
    try {
      const keywords = await storage.getKeywords();
      res.json(keywords);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching keywords', error });
    }
  });
  
  // Add a new keyword
  app.post('/api/keywords', async (req: Request, res: Response) => {
    try {
      const validatedData = insertKeywordSchema.parse(req.body);
      
      // Check if keyword already exists
      const existingKeyword = await storage.getKeywordByWord(validatedData.word);
      if (existingKeyword) {
        return res.status(400).json({ message: 'Keyword already exists' });
      }
      
      const keyword = await storage.createKeyword(validatedData);
      res.status(201).json(keyword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid keyword data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating keyword', error });
    }
  });
  
  // Update a keyword
  app.put('/api/keywords/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const keyword = await storage.getKeywordById(id);
      
      if (!keyword) {
        return res.status(404).json({ message: 'Keyword not found' });
      }
      
      const validatedData = insertKeywordSchema.partial().parse(req.body);
      const updatedKeyword = await storage.updateKeyword(id, validatedData);
      
      res.json(updatedKeyword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid keyword data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating keyword', error });
    }
  });
  
  // Delete a keyword
  app.delete('/api/keywords/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const keyword = await storage.getKeywordById(id);
      
      if (!keyword) {
        return res.status(404).json({ message: 'Keyword not found' });
      }
      
      // Instead of deleting, we just disable it
      await storage.updateKeyword(id, { enabled: false });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting keyword', error });
    }
  });
  
  // Get settings
  app.get('/api/settings', async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching settings', error });
    }
  });
  
  // Update settings
  app.put('/api/settings', async (req: Request, res: Response) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Error updating settings', error });
    }
  });
  
  // Trigger scraping manually
  app.post('/api/scrape', async (req: Request, res: Response) => {
    try {
      log('Starting manual scrape...', 'scraper');
      const scrapedData = await runScraper();
      const parsedData = JSON.parse(scrapedData);
      
      // Process articles and check for keyword matches
      const processedArticles = await processArticles(parsedData);
      
      // Update last scraped timestamp
      await storage.updateLastScraped();
      
      res.json({ 
        message: 'Scraping completed successfully', 
        articlesCount: processedArticles.length,
        alertsCount: processedArticles.filter(a => a.alert).length 
      });
    } catch (error) {
      log(`Error during manual scrape: ${error}`, 'scraper');
      res.status(500).json({ message: 'Error during scraping', error });
    }
  });

  const httpServer = createServer(app);
  
  // Initial scrape on server start
  setTimeout(async () => {
    try {
      log('Performing initial scrape...', 'scraper');
      const scrapedData = await runScraper();
      const parsedData = JSON.parse(scrapedData);
      await processArticles(parsedData);
      await storage.updateLastScraped();
      log('Initial scrape completed successfully', 'scraper');
    } catch (error) {
      log(`Error during initial scrape: ${error}`, 'scraper');
    }
  }, 2000);

  return httpServer;
}
