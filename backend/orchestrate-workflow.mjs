import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import Expense from './src/models/expense.model.js';
import ApprovalRule from './src/models/approvalRule.model.js';
import dotenv from 'dotenv';

dotenv.config();

const orchestrateWorkflow = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        // 1. Link Yash (Employee) to Avi (Manager)
        const yash = await User.findOne({ email: "yash@gmail.com" });
        const avi = await User.findOne({ email: "avi@gmail.com" });
        const ajay = await User.findOne({ email: "ajay@gmail.com" });

        const companyId = yash?.companyId || ajay?.companyId;

        // Create Finance & Director if missing
        let financeUser = await User.findOne({ email: "finance@gmail.com" });
        if (!financeUser && companyId) {
            financeUser = await User.create({
                name: "Finance Team",
                email: "finance@gmail.com",
                password: "$2b$10$TFGhWfrl7GNxAqzxd8aLHO.uuoaP1Ouu1u9MvvMfztVoWClnDM/ma", // 'password123'
                role: "FINANCE",
                companyId: companyId
            });
            console.log("✅ Created Finance User.");
        }

        let directorUser = await User.findOne({ email: "director@gmail.com" });
        if (!directorUser && companyId) {
            directorUser = await User.create({
                name: "Executive Director",
                email: "director@gmail.com",
                password: "$2b$10$TFGhWfrl7GNxAqzxd8aLHO.uuoaP1Ouu1u9MvvMfztVoWClnDM/ma", // 'password123'
                role: "DIRECTOR",
                companyId: companyId
            });
            console.log("✅ Created Director User.");
        }

        if (yash && avi) {
            yash.managerId = avi._id;
            await yash.save();
            console.log("✅ Linked Yash to Manager Avi.");
        }

        // 2. Ensure a full Interconnected Approval Rule exists for the company
        if (ajay && ajay.companyId) {
            // Clear old rules to ensure clean state
            await ApprovalRule.deleteMany({ companyId: ajay.companyId });
            
            await ApprovalRule.create({
                name: "Standard Interconnected Workflow",
                companyId: ajay.companyId,
                ruleType: "SEQUENTIAL",
                steps: [
                    { role: "MANAGER", order: 1 },
                    { role: "FINANCE", order: 2 },
                    { role: "DIRECTOR", order: 3 }
                ]
            });
            console.log("✅ Created Full Sequential Approval Rule (Manager -> Finance -> Director).");
        }

        // 3. Repair any expenses that were submitted with no approvers
        const brokenExpenses = await Expense.find({ createdBy: yash?._id, approvals: { $size: 0 } });
        for (const exp of brokenExpenses) {
            exp.approvals.push({
                userId: avi._id,
                step: 1,
                status: "PENDING"
            });
            await exp.save();
        }
        console.log(`✅ Repaired ${brokenExpenses.length} orphan expenses.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

orchestrateWorkflow();
