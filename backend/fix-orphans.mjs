import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import Company from './src/models/company.model.js';
import dotenv from 'dotenv';

dotenv.config();

const fixOrphans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        // 1. Find or create a default company
        let defaultCompany = await Company.findOne();
        if (!defaultCompany) {
            defaultCompany = await Company.create({
                name: "ExpenseOS Default",
                country: "System",
                baseCurrency: "USD"
            });
        }

        // 2. Find all admins with null companyId
        const result = await User.updateMany(
            { role: "ADMIN", companyId: null },
            { $set: { companyId: defaultCompany._id } }
        );

        console.log(`Updated ${result.modifiedCount} orphan admins.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixOrphans();
