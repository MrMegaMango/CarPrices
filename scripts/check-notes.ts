import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const deals: any[] = await sql`
    SELECT d.id, d.notes
    FROM car_deals d
    WHERE d."guestId" = 'forum-import'
    ORDER BY d.id
  `;
  for (const d of deals) {
    // just show the first line (the actual note, not the Source: lines)
    const firstLine = d.notes?.split('\n')[0] || '(empty)';
    console.log(d.id);
    console.log("  " + firstLine);
    console.log();
  }
}
main();
