import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Look for .env or custom env files in workspace root and server directory
const envFiles = [
  path.join(rootDir, '.env'),
  path.join(rootDir, 'ssakshi.env'),
  path.join(__dirname, '..', '.env'),
  path.join(rootDir, '.env.local')
];

let loadedAny = false;
for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
    loadedAny = true;
  }
}

if (!loadedAny) {
  dotenv.config();
}
