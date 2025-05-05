import { storage } from '../server/storage.js';
import { insertKeywordSchema } from '../shared/schema.js';

export default async function handler(req, res) {
  // GET request - fetch all keywords
  if (req.method === 'GET') {
    try {
      const keywords = await storage.getKeywords();
      res.status(200).json(keywords);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching keywords', error: error.message });
    }
  } 
  // POST request - create a new keyword
  else if (req.method === 'POST') {
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
      res.status(500).json({ message: 'Error creating keyword', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
