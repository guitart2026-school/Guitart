import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/guitart_academy';

/**
 * Global cache across hot-reloads in development.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || 'guitart',
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ Successfully connected to MongoDB:', MONGODB_URI.split('@').pop() || 'localhost');
        return mongooseInstance;
      })
      .catch((e) => {
        cached.promise = null;
        cached.conn = null;
        throw e;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.warn('⚠️ MongoDB Notice (Atlas cluster offline or IP not whitelisted):', (e as any)?.message || e);
    throw e;
  }

  return cached.conn;
}
