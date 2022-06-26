import * as admin from 'firebase-admin';
import * as serviceAccount from './admin-config.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://moyney-balancer.firebaseio.com',
});

export { admin };
