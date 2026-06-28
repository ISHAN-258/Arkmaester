import { MongoClient } from "mongodb";

let client;
let db;

function buildUriFromParts() {
  const user = process.env.MONGODB_USER?.trim();
  const password = process.env.MONGODB_PASSWORD?.trim();
  if (!user || !password) return null;

  const host = process.env.MONGODB_HOST?.trim() || "arkmaester.1qat0ux.mongodb.net";
  const dbName = process.env.MONGODB_DB?.trim() || "arkmaester";

  const u = encodeURIComponent(user);
  const p = encodeURIComponent(password);
  return `mongodb+srv://${u}:${p}@${host}/${dbName}?retryWrites=true&w=majority&authSource=admin&appName=ARKMAESTER`;
}

function getUri() {
  const fromParts = buildUriFromParts();
  if (fromParts) return fromParts;

  const user = process.env.MONGODB_USER?.trim();
  const password = process.env.MONGODB_PASSWORD?.trim();
  if (user && !password) {
    throw new Error(
      `MONGODB_PASSWORD is empty in .env. Atlas → Database Access → user "${user}" → Edit → reset password → paste it on the MONGODB_PASSWORD= line in .env (not .env.example), save the file, then restart.`
    );
  }

  let uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      "Add your Atlas password to .env: MONGODB_PASSWORD=yourPassword (see .env.example)."
    );
  }

  if (uri.startsWith("MONGODB_URI=")) {
    uri = uri.slice("MONGODB_URI=".length).trim();
  }

  if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
    throw new Error(
      'MONGODB_URI must start with "mongodb://" or "mongodb+srv://". Check for a duplicate MONGODB_URI= prefix.'
    );
  }

  if (!/authSource=/i.test(uri)) {
    const sep = uri.includes("?") ? "&" : "?";
    uri += `${sep}authSource=admin`;
  }

  return uri;
}

export async function connectDb() {
  if (db) return db;
  const uri = getUri();
  client = new MongoClient(uri);
  try {
    await client.connect();
  } catch (err) {
    if (err?.code === 8000 || /bad auth|authentication failed/i.test(err.message)) {
      throw new Error(
        "MongoDB authentication failed. In Atlas: Database Access → confirm username ISHAN, reset password, paste into .env as MONGODB_PASSWORD (no URL encoding needed). Check Network Access allows your IP."
      );
    }
    throw err;
  }
  db = client.db();
  await db.collection("appdata").createIndex({ key: 1 }, { unique: true });
  console.log(`MongoDB connected (database: ${db.databaseName})`);
  return db;
}

export function getDb() {
  if (!db) throw new Error("Database not connected. Call connectDb() first.");
  return db;
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
  }
}
