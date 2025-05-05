import express from 'express';
import { registerRoutes } from '../server/routes.js';

const app = express();
app.use(express.json());

// Initialize routes
registerRoutes(app);

export default app;
