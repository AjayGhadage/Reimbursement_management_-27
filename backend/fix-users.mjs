import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB");

const db = mongoose.connection.db;

// 1. Create a company since none exists
let companies = await db.collection("companies").find({}).toArray();
let companyId;

if (companies.length === 0) {
  console.log("No company found. Creating default company...");
  const result = await db.collection("companies").insertOne({
    name: "Default Company",
    country: "India",
    baseCurrency: "INR",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  companyId = result.insertedId;
  console.log("Company created:", companyId.toString());
} else {
  companyId = companies[0]._id;
  console.log("Using existing company:", companyId.toString());
}

// 2. Make the first user ADMIN and assign companyId to all users
const users = await db.collection("users").find({}).sort({ createdAt: 1 }).toArray();

if (users.length > 0) {
  // Make the first user ADMIN
  await db.collection("users").updateOne(
    { _id: users[0]._id },
    { $set: { role: "ADMIN", companyId: companyId } }
  );
  console.log(`Set ${users[0].name} (${users[0].email}) as ADMIN`);

  // Assign companyId to all other users who lack one
  const updateResult = await db.collection("users").updateMany(
    { $or: [
        { companyId: { $in: [null, undefined, ""] } },
        { companyId: { $exists: false } }
    ]},
    { $set: { companyId: companyId } }
  );
  console.log(`Assigned companyId to ${updateResult.modifiedCount} additional users.`);
}

// 3. Verify
const updatedUsers = await db.collection("users").find({}).toArray();
console.log("\n=== Final State ===");
updatedUsers.forEach(u => {
  console.log(`  ${u.name} | ${u.email} | role: ${u.role} | companyId: ${u.companyId}`);
});

await mongoose.disconnect();
