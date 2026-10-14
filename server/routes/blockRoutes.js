import { Router } from 'express';
import { createBlock, listBlocks } from '../controllers/blockController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const blockRoutes = Router();

blockRoutes.get('/', requireAuth, listBlocks);
blockRoutes.post('/', requireAuth, createBlock);

export default blockRoutes;
