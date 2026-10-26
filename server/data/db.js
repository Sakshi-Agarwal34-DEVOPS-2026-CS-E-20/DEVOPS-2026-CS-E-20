import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = __dirname;

// Helper to ensure file exists with default data
function ensureFile(filename, defaultData) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
  return filePath;
}

export function readData(filename, defaultData = []) {
  try {
    const filePath = ensureFile(filename, defaultData);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultData;
  }
}

export function writeData(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
  
