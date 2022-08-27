import { Router } from 'express';
import { Bag } from './bag/bag';
import { Changelog } from './changelog';
import { Help } from './help';

function bagRoutes(): Router {
  const router = Router();

  Bag('/b', router);
  Changelog('/changelog', router);
  Help('/help', router);

  return router;
}

export { bagRoutes };
