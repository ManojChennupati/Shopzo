import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function fixOrphanedReviews() {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const result = await db.collection('reviews').updateMany(
        { userId: new mongoose.Types.ObjectId('6a28e5e77e55a3c43b8642a5') },
        { $set: { userName: 'Deleted User' } }
    );
    console.log('Updated:', result.modifiedCount, 'reviews');
    process.exit(0);
}

fixOrphanedReviews().catch(err => { console.error(err); process.exit(1); });
