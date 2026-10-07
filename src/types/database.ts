import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId; 
  firstName: string; 
  lastName: string;
  email: string; 
  passwordHash: string; 
  createdAt: Date; 
}

export interface Block {
  _id?: ObjectId;
  userId: ObjectId; 
  milesDriven: number; 
  fuelCost: number; 
  date: Date;
}

export interface Maintenance {
  _id?: ObjectId;
  userId: ObjectId;
  description: string; 
  cost: number;
  date: Date;
}