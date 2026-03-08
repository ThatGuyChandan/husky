import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, requireRole('employer'), (req, res) => {
  res.json({ message: 'User list endpoint (extend as needed)' });
});

export default router;
