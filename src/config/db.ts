import dns from "node:dns";
import mongoose from "mongoose";

// Resolve MongoDB SRV records via public DNS if local ISP DNS blocks SRV lookups
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// The promise, kept. Not the connection -- the promise of one. The
// first caller starts the connect; every caller after it gets this
// same promise back and waits on the connection already being made.
let connection: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and fill it in.",
    );
  }

  if (connection === null) {
    connection = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then((m) => {
        console.log("MongoDB connected:", m.connection.name);
        return m;
      })
      .catch((err: unknown) => {
        connection = null;
        throw err;
      });
  }

  return connection;
}
