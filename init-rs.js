const { MongoClient } = require("mongodb");
const URI = "mongodb://127.0.0.1:27018/ticketingSystem?directConnection=true";

async function init() {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 5000, connectTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log("Connected to mongod");
    const adminDb = client.db("admin");

    // Try to initiate
    try {
      const result = await adminDb.command({
        replSetInitiate: {
          _id: "rs0",
          members: [{ _id: 0, host: "127.0.0.1:27018" }],
        },
      });
      console.log("Replica set initiated:", JSON.stringify(result, null, 2));
    } catch (e) {
      if (e.message.includes("ok") && e.message.includes("already")) {
        console.log("Replica set already initiated");
      } else {
        console.error("Initiate error:", e.message);
      }
    }

    // Wait a moment then check status
    await new Promise(r => setTimeout(r, 2000));
    try {
      const status = await adminDb.command({ replSetGetStatus: 1 });
      console.log("Replica set status:", status.myState, status.members?.[0]?.stateStr);
    } catch (e) {
      console.error("Status error:", e.message);
    }

    // Now copy data from the standalone (port 27017) to the replica set (port 27018)
    const srcClient = new MongoClient("mongodb://127.0.0.1:27017/ticketingSystem", { serverSelectionTimeoutMS: 5000 });
    await srcClient.connect();
    console.log("Connected to source (standalone)");

    const srcDb = srcClient.db("ticketingSystem");
    const destDb = client.db("ticketingSystem");

    const srcCollections = await srcDb.collections();
    console.log(`Found ${srcCollections.length} collections in source`);

    for (const coll of srcCollections) {
      const docs = await coll.find({}).toArray();
      if (docs.length > 0) {
        await destDb.collection(coll.collectionName).insertMany(docs, { ordered: false });
        console.log(`  Copied ${docs.length} documents from ${coll.collectionName}`);
      }
    }

    await srcClient.close();
    console.log("Data copy complete");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

init().catch(console.error);
