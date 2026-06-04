import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // [RESILIENCE] Never throw at module-level  this kills the server process.
    // Routes that need MongoDB will handle null connections gracefully at request time.
    if (process.env.NODE_ENV === 'production') {
        console.error('[MongoDB] ️ MONGODB_URI not set. MongoDB-dependent routes will return 503.');
        console.error('[MongoDB] Set MONGODB_URI in Railway dashboard to enable database features.');
    }
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectMongoDB() {
    if (!MONGODB_URI) {
        console.error('[MongoDB] connectMongoDB() called but MONGODB_URI is not defined.');
        return null;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log(' MongoDB Atlas Connected');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectMongoDB;

