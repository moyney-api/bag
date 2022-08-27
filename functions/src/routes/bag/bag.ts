import { Request, Response, Router, NextFunction } from 'express';
import { AUTH_BASE_URL } from '~/config';
import { BagController } from '~/controllers';
import { BagData } from '~/models';
import { getJsonResponseFromUrl } from '~/utils';

const AUTH_URL = `${AUTH_BASE_URL}/auth/status`;

function checkAuthStatus(req: Request, res: Response, next: NextFunction): void {
  getJsonResponseFromUrl<{ uid: string }>(AUTH_URL, 'You are not logged in', req.headers.authorization).subscribe({
    next: ({ uid }) => {
      if (!uid) {
        res.status(401).send('Unauthorized!');
        return;
      }

      req.body.__userUid = uid;
      next();
    },
    error: (err) => res.status(401).send(err.message),
  });
}

function getBag(req: Request, res: Response): void {
  const { __userUid, uid } = req.body;
  const bagController = new BagController(__userUid);

  bagController.get(uid).subscribe({
    next: (bag: BagData | BagData[]) => res.json(bag),
    error: (error) => res.status(error.status).json(error),
  });
}

function updateBag(req: Request, res: Response): void {
  const bagData = { ...req.body, userUid: req.body.__userUid };
  const bagController = new BagController(bagData.userUid);

  bagController.patch(bagData).subscribe({
    next: ({ create, update }) => res.json({ ...create, ...update }),
    error: (error) => res.status(error.status).send(error),
  });
}

function deleteBag(req: Request, res: Response): void {
  const { __userUid, uid } = req.body;

  const bagController = new BagController(__userUid);

  bagController.delete(uid).subscribe({
    next: (deletedBag) => res.json(deletedBag),
    error: (error) => res.status(500).send(error.message),
  });
}

export function Bag(route: string, router: Router) {
  router
    .all(route, (req: Request, res: Response, next: NextFunction) => checkAuthStatus(req, res, next))
    .get(route, (req: Request, res: Response) => getBag(req, res))
    .post(route, (req: Request, res: Response) => updateBag(req, res))
    .delete(route, (req: Request, res: Response) => deleteBag(req, res));
}
