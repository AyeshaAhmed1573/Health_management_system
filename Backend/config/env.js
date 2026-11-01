import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load <backend>/.env regardless of the process working directory.
// Editors on Windows often save .env with a UTF-8 BOM, which makes the first key
// (e.g. PORT) silently load as "\uFEFFPORT" - strip it before parsing.
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
if (fs.existsSync(envPath)) {
  const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8').replace(/^\uFEFF/, ''));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
