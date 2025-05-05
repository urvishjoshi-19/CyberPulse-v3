import { storage } from '../server/storage.js';

export default async function handler(req, res) {
  const limit = req.query.limit ? parseInt(req.query.limit) : 20;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;
  
  try {
    const articles = await storage.getAlertArticles(limit, offset);
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alert articles', error: error.message });
  }
}
