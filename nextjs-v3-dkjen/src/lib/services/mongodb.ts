// lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/africa";

if (!MONGODB_URI) throw new Error("Please define MONGODB_URI");

let conn: typeof mongoose | null = null;
let promise: Promise<typeof mongoose> | null = null;

export async function connectDB() {
  if (conn) return conn;

  if (!promise) {
    promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  conn = await promise;
  return conn;
}
