import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");
const examplePath = path.join(root, ".env.example");

if (!fs.existsSync(envPath)) {
  console.error(`
[arkmaester] Missing .env file at:
  ${envPath}

Copy the example and set your Atlas password:
  copy .env.example .env

Then edit MONGODB_URI (URL-encode special characters in the password).
`);
} else {
  dotenv.config({ path: envPath });
}

export { root, envPath, examplePath };
