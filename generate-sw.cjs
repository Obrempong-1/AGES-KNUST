const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const templatePath = path.resolve(__dirname, 'public', 'firebase-messaging-sw.template.js');
const outputPath = path.resolve(__dirname, 'public', 'firebase-messaging-sw.js');

// Read the .env file
let envFileContent = '';
try {
  envFileContent = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  console.error('Error reading .env file:', err);
  process.exit(1);
}

// Parse the .env file to get the keys
const envConfig = {};
envFileContent.split('\n').forEach(line => {
  const match = line.match(/^(\w+)=(.*)$/);
  if (match) {
    envConfig[match[1]] = match[2];
  }
});

// Read the template file
let templateContent = '';
try {
  templateContent = fs.readFileSync(templatePath, 'utf8');
} catch (err) {
  console.error('Error reading template file:', err);
  process.exit(1);
}

// Replace placeholders with actual values
const generatedContent = templateContent
  .replace(/__VITE_FIREBASE_API_KEY__/g, envConfig.VITE_FIREBASE_API_KEY)
  .replace(/__VITE_FIREBASE_AUTH_DOMAIN__/g, envConfig.VITE_FIREBASE_AUTH_DOMAIN)
  .replace(/__VITE_FIREBASE_PROJECT_ID__/g, envConfig.VITE_FIREBASE_PROJECT_ID)
  .replace(/__VITE_FIREBASE_STORAGE_BUCKET__/g, envConfig.VITE_FIREBASE_STORAGE_BUCKET)
  .replace(/__VITE_FIREBASE_MESSAGING_SENDER_ID__/g, envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID)
  .replace(/__VITE_FIREBASE_APP_ID__/g, envConfig.VITE_FIREBASE_APP_ID);

// Write the final service worker file
try {
  fs.writeFileSync(outputPath, generatedContent, 'utf8');
  console.log('Successfully generated firebase-messaging-sw.js');
} catch (err) {
  console.error('Error writing firebase-messaging-sw.js:', err);
  process.exit(1);
}
