import { type Db, MongoClient } from "mongodb";

let client: MongoClient | undefined;
let databasePromise: Promise<Db> | undefined;

export function getDatabase(): Promise<Db> {
  if (!databasePromise) {
    const uri = Deno.env.get("MONGODB_URI") ?? Deno.env.get("MONGO_URI");
    if (!uri) {
      const error = new Error(
        "Set MONGODB_URI in the environment to enable database operations.",
      );
      error.name = "DATABASE_CONFIGURATION_MISSING";
      throw error;
    }

    client = new MongoClient(uri);
    databasePromise = (async () => {
      await client!.connect();
      const database = client!.db(Deno.env.get("MONGODB_DB") ?? "flexledger");
      await Promise.all([
        database.collection("users").createIndex({ email: 1 }, {
          unique: true,
        }),
        database.collection("sessions").createIndex(
          { expiresAt: 1 },
          { expireAfterSeconds: 0 },
        ),
      ]);
      return database;
    })();
  }
  return databasePromise;
}
