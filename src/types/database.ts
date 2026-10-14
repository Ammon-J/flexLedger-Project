import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId; 
  firstName: string; 
  lastName: string;
  email: string; 
  passwordHash: string; 
  createdAt: Date; 
  defaultVehicle?: string;
}

export interface Block {
  _id?: ObjectId;
  userId: ObjectId; 
  startOdometer: number;
  endOdometer: number;
  milesDriven: number;
  vehicle?: string;
  earnings?: number;
  routeNotes?: string;
  fuelCost?: number;
  date: Date;
  createdAt: Date;
}

export interface Maintenance {
  _id?: ObjectId;
  userId: ObjectId;
  description: string; 
  cost: number;
  date: Date;
}