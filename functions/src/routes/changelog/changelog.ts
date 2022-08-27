import { Request, Response, Router } from 'express';
import { changelog } from '../../changelog';
import { fourHundredAndFour } from '../bag.utils';

export function Changelog(route: string, router: Router) {
  router.get(route, (_: Request, res: Response) => {
    res.json(changelog.slice(0, 10));
  });
  router.post(route, fourHundredAndFour);
  router.patch(route, fourHundredAndFour);
  router.delete(route, fourHundredAndFour);
}
