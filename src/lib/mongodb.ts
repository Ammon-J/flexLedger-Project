import { MongoClient } from 'mongodb';

const uri = import.meta.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add your MONGODB_URI to .env");
}

let client: MongoClient;
let db; 

export async function getDb(dbName = 'flexledger') {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  db = client.db(dbName);
  return db;
}