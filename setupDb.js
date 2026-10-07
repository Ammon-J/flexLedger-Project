import { MongoClient } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
if (!uri) {
  throw new Error('Set MONGODB_URI in .env before applying database schemas.');
}
const client = new MongoClient(uri);

async function applySchemas() {
  try {
    await client.connect();
    const db = client.db('flexledger');

    // 1. Users Schema
    const usersValidator = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['firstName', 'lastName', 'email', 'passwordHash', 'createdAt'],
        properties: {
          firstName: {
            bsonType: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'First name is required'
          },
          lastName: {
            bsonType: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Last name is required'
          },
          email: {
            bsonType: 'string',
            description: 'Email is required'
          },
          passwordHash: {
            bsonType: 'string',
            description: 'Password hash is required'
          },
          createdAt: {
            bsonType: 'date',
            description: 'Creation date is required'
          }
        }
      }
    };
    const usersCollectionExists = await db.listCollections({ name: 'users' }, { nameOnly: true }).hasNext();
    if (usersCollectionExists) {
      await db.command({
        collMod: 'users',
        validator: usersValidator
      });
    } else {
      await db.createCollection('users', { validator: usersValidator });
    }

    // 2. Users Indexes
    await db.collection('users').createIndex(
      { email: 1 }, 
      { unique: true } 
    );

    // 3. Blocks Schema
    await db.createCollection('blocks', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'milesDriven', 'date'],
          properties: {
            userId: { bsonType: 'objectId' },
            milesDriven: { bsonType: 'number' },
            fuelCost: { bsonType: 'number' },
            date: { bsonType: 'date' }
          }
        }
      }
    });

    // 4. Maintenance Schema
    await db.createCollection('maintenance', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'description', 'cost', 'date'],
          properties: {
            userId: { bsonType: 'objectId' },
            description: { bsonType: 'string' },
            cost: { bsonType: 'number' },
            date: { bsonType: 'date' }
          }
        }
      }
    });

    console.log("Successfully created MongoDB schemas and indexes.");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await client.close();
  }
}

applySchemas();