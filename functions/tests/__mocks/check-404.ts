import { SuperTest, Test } from 'supertest';

export function check404Methods(methods: ('get' | 'post' | 'patch' | 'delete')[], testApp: SuperTest<Test>, route: string) {
    describe(`checking 404 endpoints for ${route}`, () => {
        methods.forEach(call => {
            it(call.toUpperCase(), async() => {
                await testApp[call as 'get' | 'post' | 'patch' | 'delete'](route)
                    .expect(404)
                    .expect((res) => {
                        expect(res.text).toContain('has no implemented method');
                    });
            });
        });
    });
}
