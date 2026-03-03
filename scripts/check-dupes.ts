import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const deals: any[] = await sql`
    SELECT d.id, d.year, d.trim, d.msrp, d."sellingPrice", d."otdPrice", d."dealerLocation", d.notes,
      m.name as make, mo.name as model
    FROM car_deals d
    JOIN car_makes m ON m.id = d."makeId"
    JOIN car_models mo ON mo.id = d."modelId"
    WHERE d."guestId" = 'forum-import'
    ORDER BY m.name, mo.name, d.year, d.id
  `;

  const byUrl: Record<string, any[]> = {};
  for (const d of deals) {
    const urlMatch = d.notes?.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0].replace(/\/page-\d+$/, '') : "no-url";
    if (!byUrl[url]) byUrl[url] = [];
    byUrl[url].push(d);
  }

  for (const [url, entries] of Object.entries(byUrl)) {
    if (entries.length > 1) {
      console.log("\n=== " + url + " (" + entries.length + " entries) ===");
      for (const e of entries) {
        console.log("  " + e.id);
        console.log("    " + e.year + " " + e.make + " " + e.model + " " + (e.trim || "(no trim)"));
        console.log("    MSRP: $" + e.msrp/100 + " | Selling: $" + e.sellingPrice/100 + " | OTD: " + (e.otdPrice ? "$"+e.otdPrice/100 : "null"));
        console.log("    Loc: " + e.dealerLocation);
        console.log();
      }
    }
  }
}
main();
