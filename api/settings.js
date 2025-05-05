import { storage } from '../server/storage.js';

export default async function handler(req, res) {
  // GET request - fetch settings
  if (req.method === 'GET') {
    try {
      const settings = await storage.getSettings();
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
  } 
  // PUT request - update settings
  else if (req.method === 'PUT') {
    try {
      const settings = await storage.updateSettings(req.body);
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
