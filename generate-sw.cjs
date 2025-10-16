const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');


dotenv.config();

const templatePath = path.resolve(__dirname, 'public', 'firebase-messaging-sw.template.js');
const outputPath = path.resolve(__dirname, 'public', 'firebase-messaging-sw.js');


let templateContent = '';
try {
  templateContent = fs.readFileSync(templatePath, 'utf8');
} catch (err) {
  console.error('Error reading template file:', err);
  process.exit(1);
}


const firebaseConfig = {
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID,
};


const generatedContent = templateContent
  .replace(/__VITE_FIREBASE_API_KEY__/g, firebaseConfig.VITE_FIREBASE_API_KEY)
  .replace(/__VITE_FIREBASE_AUTH_DOMAIN__/g, firebaseConfig.VITE_FIREBASE_AUTH_DOMAIN)
  .replace(/__VITE_FIREBASE_PROJECT_ID__/g, firebaseConfig.VITE_FIREBASE_PROJECT_ID)
  .replace(/__VITE_FIREBASE_STORAGE_BUCKET__/g, firebaseConfig.VITE_FIREBASE_STORAGE_BUCKET)
  .replace(/__VITE_FIREBASE_MESSAGING_SENDER_ID__/g, firebaseConfig.VITE_FIREBASE_MESSAGING_SENDER_ID)
  .replace(/__VITE_FIREBASE_APP_ID__/g, firebaseConfig.VITE_FIREBASE_APP_ID);


try {
  fs.writeFileSync(outputPath, generatedContent, 'utf8');
  console.log('Successfully generated firebase-messaging-sw.js');
} catch (err) {
  console.error('Error writing firebase-messaging-sw.js:', err);
  process.exit(1);
}
