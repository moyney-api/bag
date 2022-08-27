import * as express from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import { bagRoutes } from './routes';

const moyBag = express();
moyBag.use(express.json());
moyBag.use(bagRoutes());

export const bag = onRequest(moyBag);
