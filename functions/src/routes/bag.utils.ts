import { Request, Response } from 'express';

function fourHundredAndFour(req: Request, res: Response) {
  res.status(404).send(`route: ${req.path} has no implemented method: ${req.method}`);
}

export { fourHundredAndFour };
