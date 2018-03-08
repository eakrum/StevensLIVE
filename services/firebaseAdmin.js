import * as admin from 'firebase-admin';
import * as Firebase from 'firebase';

var serviceAccount = require('/Users/eakrumawwal/Desktop/StevensLIVE/services/livelecture-2dceb-firebase-adminsdk-602ca-7e090f5e81.json');

export const adminRef = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://livelecture-2dceb.firebaseio.com"
  });