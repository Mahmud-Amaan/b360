import "dotenv/config";
import { db } from "../../src/lib/db";
import { agent } from "../../src/db/schema";

async function main() {
    try {
        console.log("Querying agents...");
        const agents = await db.select().from(agent);
        console.log(`Found ${agents.length} agents:`);
        agents.forEach(a => {
            console.log(`- Name: ${a.name}`);
            console.log(`  Phone: '${a.phoneNumber}'`);
            console.log(`  ID: ${a.id}`);
            console.log(`  Vapi Phone ID: ${a.vapiPhoneNumberId || 'N/A'}`);
            console.log("---");
        });
    } catch (error) {
        console.error("Error querying agents:", error);
    }
    process.exit(0);
}

main();
