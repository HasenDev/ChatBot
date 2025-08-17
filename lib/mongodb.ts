import { MongoClient, Db, Collection } from "mongodb";
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in environment variables");
}
declare global {
  var _mongoClient: MongoClient | undefined;
}
let cachedClient: MongoClient | undefined = global._mongoClient;
async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log("[MongoDB] Connected");
    cachedClient = client;
    global._mongoClient = client;
    return client;
  } catch (err) {
    console.error("[MongoDB] Connection failed:", err);
    throw err;
  }
}
export async function getCollection<T>(
  dbName: string,
  collectionName: string
): Promise<Collection<T>> {
  const client = await getMongoClient();
  const db: Db = client.db(dbName);
  return db.collection<T>(collectionName);
}
