import { db } from './server/config/db';
import { sql } from 'drizzle-orm';

async function showColumns() {
    const cols = await db.execute(sql`DESCRIBE quiz_access`);
    console.log('quiz_access columns:', JSON.stringify(cols[0], null, 2));
    process.exit(0);
}
showColumns();
