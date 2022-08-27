import * as express from 'express';
import * as request from 'supertest';
import { changelog } from '../../src/changelog';
import { Changelog } from '../../src/routes/changelog';
import { check404Methods } from '../__mocks/check-404';

const app = express();
Changelog('/changelog', app);
const changelogApp = request(app);

describe('Changelog', () => {
    it('get', async () => {
        await changelogApp.get('/changelog')
            .expect((res) => {
                expect(res.status).toBe(200);
                expect(res.body[0].version).toBe(changelog[0].version);
            });
    });

    check404Methods(['patch', 'post', 'delete'], changelogApp, '/changelog');
});
