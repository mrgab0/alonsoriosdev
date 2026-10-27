import { connectToDatabase } from '../lib/mongodb';

export async function connectMongo() {
  return connectToDatabase();
}

export default connectMongo;

