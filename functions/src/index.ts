import * as express from 'express';
import { onRequest } from 'firebase-functions/v2/https';

const moyBag = express();
moyBag.use(express.json());

moyBag.get('/', (req, res) => {
  res.status(200).send('Welcome to moy bag service!!');
});

export const bag = onRequest(moyBag);
