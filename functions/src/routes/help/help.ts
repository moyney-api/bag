import { Router } from 'express';
import { fourHundredAndFour } from '../bag.utils';

export const helpMessage = `
            ### Welcome to Moy Bag service! :) ###
            - read[:id]: to get the bag with ':id'.
            - create[:body]: to create a new bag with ':body'.
            - update[:body]: to update bag with ':body.id' and change the values of ':body'.
            - delete[:id]: to delete bag with ':id'.
        `;
export function Help(route: string, router: Router) {
    router.get(route, (_, res) => res.send(helpMessage));
    router.post(route, fourHundredAndFour);
    router.patch(route, fourHundredAndFour);
    router.delete(route, fourHundredAndFour);
}
