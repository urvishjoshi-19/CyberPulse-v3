import { 
  users, type User, type InsertUser,
  articles, type Article, type InsertArticle,
  keywords, type Keyword, type InsertKeyword,
  settings, type Settings, type InsertSettings
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Article operations
  getArticles(limit?: number, offset?: number): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  getArticleByUrl(url: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  getAlertArticles(limit?: number, offset?: number): Promise<Article[]>;
  getArticlesByTag(tag: string, limit?: number, offset?: number): Promise<Article[]>;
  
  // Keyword operations
  getKeywords(): Promise<Keyword[]>;
  getKeywordById(id: number): Promise<Keyword | undefined>;
  getKeywordByWord(word: string): Promise<Keyword | undefined>;
  createKeyword(keyword: InsertKeyword): Promise<Keyword>;
  updateKeyword(id: number, keyword: Partial<InsertKeyword>): Promise<Keyword | undefined>;
  incrementKeywordMatch(id: number): Promise<Keyword | undefined>;
  
  // Settings operations
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings | undefined>;
  updateLastScraped(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private keywords: Map<number, Keyword>;
  private settings: Settings | undefined;
  private userIdCounter: number;
  private articleIdCounter: number;
  private keywordIdCounter: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.keywords = new Map();
    this.userIdCounter = 1;
    this.articleIdCounter = 1;
    this.keywordIdCounter = 1;
    
    // Initialize with default keywords
    const defaultKeywords = ["zero-day", "ransomware", "CVE", "phishing", "APT", "DDoS"];
    defaultKeywords.forEach(word => {
      this.createKeyword({ word, enabled: true });
    });
    
    // Initialize with default settings
    this.settings = {
      id: 1,
      email_alerts: true,
      email_recipients: [],
      smtp_settings: { host: "", port: 587, username: "", password: "" },
      last_scraped: new Date(),
    };
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Article operations
  async getArticles(limit: number = 20, offset: number = 0): Promise<Article[]> {
    const articles = Array.from(this.articles.values())
      .sort((a, b) => {
        // Sort by date descending (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    
    return articles.slice(offset, offset + limit);
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticleByUrl(url: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(
      (article) => article.url === url,
    );
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleIdCounter++;
    const now = new Date();
    const article: Article = { 
      ...insertArticle, 
      id, 
      created_at: now 
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticle(id: number, articleUpdate: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updatedArticle = { ...article, ...articleUpdate };
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  async getAlertArticles(limit: number = 20, offset: number = 0): Promise<Article[]> {
    const alertArticles = Array.from(this.articles.values())
      .filter(article => article.alert)
      .sort((a, b) => {
        // Sort by date descending (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    
    return alertArticles.slice(offset, offset + limit);
  }

  async getArticlesByTag(tag: string, limit: number = 20, offset: number = 0): Promise<Article[]> {
    const taggedArticles = Array.from(this.articles.values())
      .filter(article => article.tags.includes(tag))
      .sort((a, b) => {
        // Sort by date descending (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    
    return taggedArticles.slice(offset, offset + limit);
  }

  // Keyword operations
  async getKeywords(): Promise<Keyword[]> {
    return Array.from(this.keywords.values());
  }

  async getKeywordById(id: number): Promise<Keyword | undefined> {
    return this.keywords.get(id);
  }

  async getKeywordByWord(word: string): Promise<Keyword | undefined> {
    return Array.from(this.keywords.values()).find(
      (keyword) => keyword.word.toLowerCase() === word.toLowerCase(),
    );
  }

  async createKeyword(insertKeyword: InsertKeyword): Promise<Keyword> {
    const id = this.keywordIdCounter++;
    const now = new Date();
    const keyword: Keyword = { 
      ...insertKeyword, 
      id, 
      matches: 0,
      created_at: now 
    };
    this.keywords.set(id, keyword);
    return keyword;
  }

  async updateKeyword(id: number, keywordUpdate: Partial<InsertKeyword>): Promise<Keyword | undefined> {
    const keyword = this.keywords.get(id);
    if (!keyword) return undefined;
    
    const updatedKeyword = { ...keyword, ...keywordUpdate };
    this.keywords.set(id, updatedKeyword);
    return updatedKeyword;
  }

  async incrementKeywordMatch(id: number): Promise<Keyword | undefined> {
    const keyword = this.keywords.get(id);
    if (!keyword) return undefined;
    
    const updatedKeyword = { ...keyword, matches: keyword.matches + 1 };
    this.keywords.set(id, updatedKeyword);
    return updatedKeyword;
  }

  // Settings operations
  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(settingsUpdate: Partial<InsertSettings>): Promise<Settings | undefined> {
    if (!this.settings) return undefined;
    
    this.settings = { ...this.settings, ...settingsUpdate };
    return this.settings;
  }

  async updateLastScraped(): Promise<void> {
    if (this.settings) {
      this.settings.last_scraped = new Date();
    }
  }
}

// Export an instance of the storage
export const storage = new MemStorage();
