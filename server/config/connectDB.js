import dns from "node:dns";
import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

const configureMongoDns = (mongoUrl) => {
  if (!mongoUrl.startsWith("mongodb+srv://")) {
    return;
  }

  const dnsServers = (process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers.length) {
    dns.setServers(dnsServers);
  }
};

const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URL;

  if (!mongoUrl) {
    throw new Error("MONGODB_URL is missing in server .env");
  }

  configureMongoDns(mongoUrl);

  try {
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Database Connected!");
  } catch (error) {
    console.error(`Database Error ${error.message || error}`);
    throw error;
  }
};

export default connectDB;
