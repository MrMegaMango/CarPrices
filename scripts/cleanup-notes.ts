import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

// New notes for each forum-import entry (first line only — Source/URL lines will be stripped separately)
const noteRewrites: Record<string, string> = {
  "forum_4runner6g_orp_2025-12-04":
    "MSRP $58,300, got $6,000 off — $52,300 plus tax/title/tags/dealer fees.",
  "forum_4runner6g_platinum_trade_2025-07-01":
    "Invoice/selling price $63,114. Trade-in $19,000. OTD $45,767 includes taxes, title/license, doc fee, minus $1,000 deposit.",
  "forum_4runner6g_trailhunter_offer_2025-12-15":
    "Dealer quote, not yet purchased.",
  "forum_4runner6g_trailhunter_paid_2025-12-15":
    "Paid ~$72,000 and change.",
  "forum_4runner6g_trd_sport_premium_2025-12-04":
    "OTD $62,700. Purchased July 2025, limited inventory at the time.",
  "forum_bronco6g_2025-06-24_bronco_badlands_otd_55000":
    "Paid $55k OTD for a leftover new 2024. Special financing available.",
  "forum_civicxi_2024-05-18_fl5_paid_50000":
    "Paid $50k OTD. Purchase was back in January.",
  "forum_civicxi_2024-05-20_fl5_quote_52500":
    "Out-of-state dealer quoted $52.5k OTD including taxes and fees.",
  "forum_civicxi_2024-05-28_fl5_paid_50000_sc":
    "$50,000 OTD all-in at Superior Honda, Orangeburg SC.",
  "forum_civicxi_2024-09-27_civic_hybrid_st_otd_35500_trade":
    "OTD after trade-in was about $35.5k. Total before trade was a little over $55k.",
  "forum_civicxi_2025-02-06_fl5_paid_44818_73_oh":
    "Breakdown: $44,396.73 + $387 doc + $15 title + $20 registration = $44,818.73 OTD.",
  "forum_civicxi_2025-04-01_fl5_offer_50300":
    "Negotiated to $50,300 OTD and placed a deposit.",
  "forum_civicxi_2025-04-01_fl5_offer_51000":
    "Initial dealer offer was around $51k OTD before negotiating.",
  "forum_civicxi_2025-04-01_fl5_paid_48000":
    "Final deal around $48k OTD after playing two dealers against each other.",
  "forum_civicxi_2025-05-29_fl5_paid_48000_ny_trade":
    "~$48,000 OTD at Saratoga Honda (NY). Had a trade-in.",
  "forum_civicxi_2025-09-29_fl5_offer_51000_cw":
    "Offered $51k OTD on a Championship White in transit.",
  "forum_civicxi_2025-09-xx_fl5_paid_54000":
    "Final negotiated price: $54,000 OTD.",
  "forum_civicxi_2025-09-xx_fl5_quote_54766":
    "Another dealer quoted $54,766 OTD — includes dealer accessories.",
  "forum_civicxi_2025-09-xx_fl5_quote_54800":
    "Talked down from ~$54.8k OTD.",
  "forum_civicxi_2025-12-14_2":
    "OTD based on 8.75% sales tax. Purchased at MSRP, no markup/accessories/tint/trade-in.",
  "forum_civicxi_2026-02-02_fl5_paid_52000_la":
    "$52k flat OTD in Los Angeles. $46,666 before tax.",
  "forum_fordexplorerforum_2024-11-07_2":
    "MSRP $60,995. Dealer price $57,495. Doc fee $585. Out-the-door $58,080. Taxes paid separately.",
  "forum_kiasportageforums_2024-09-27_10":
    "Bought for $40,500 OTD in NC.",
  "forum_kiasportageforums_2024-10-08_12":
    "OTD includes taxes.",
  "forum_kiasportageforums_2024-12-26_14":
    "Sticker $38,500 before taxes/fees. Paid $39,500 OTD including dealer fees, sales tax, tags & title.",
  "forum_kiasportageforums_2025-01-18_16":
    "$41,500 OTD, about $700 under MSRP.",
  "forum_kiasportageforums_2025-01-23_17":
    "Paid sticker ($39,450). OTD not provided.",
  "forum_leasehackr_bmw_x3_2024-07-04":
    "Signed financing deal. Manufacturer rebates $1,500. Dealer add-on $599. Final OTD $61,443.42.",
  "forum_leasehackr_bmw_x7_2025-06-28":
    "~14% off MSRP, OTD around $86,687.66.",
  "forum_leasehackr_bmw_x7_xdrive40i_2025-11-03":
    "Finance deal: selling price $88,327 pre-rebate. 13% dealer discount. Add-ons $1,500. Loyalty rebate $3,000 applied after tax.",
  "forum_leasehackr_crv_sportl_awd_2024-08-23_update":
    "Closing for $38,800 OTD.",
  "forum_leasehackr_crv_sportl_fwd_2024-08-23":
    "OTD computed from line items: MSRP + add-ons - discount + fees + tax.",
  "forum_leasehackr_crv_touring_2024-08-30":
    "Adjusted price $38,378 + fees/tax = $41,000 OTD.",
  "forum_leasehackr_ridgeline_2025-09-25":
    "MSRP $48,200. Selling price $41,346. Taxes/fees $3,183.90. OTD $44,530.",
  "forum_mavericktruckclub_2024-06-26_maverick_xlt_otd_33500":
    "Agreed to $33,500 OTD. Deal pending due to stop-sale/recall.",
  "forum_mavericktruckclub_2024-12-17_maverick_lariat_otd_36000_change":
    "Paid $36k and change OTD for a 2023 Lariat.",
  "forum_mavericktruckclub_paid_2025-12-29":
    "Just under $30,000 OTD with tags.",
  "forum_mavericktruckclub_quote_2025-12-28":
    "Best price found was almost $37k OTD — about $33k before GA taxes/fees. Not yet purchased.",
  "forum_palisadeforum_2024-01-22_palisade_fwd_offer_53500":
    "Offered $53.5K OTD on paper.",
  "forum_trailboss_2024-07-31_colorado_trailboss_offer_46000":
    "Best dealer offer so far: $46k OTD.",
  "forum_trailboss_2024-08-06_silverado_tb_otd_32000_trade":
    "Out the door at ~$32,000 after trade-in and discounts.",
  "forum_trailboss_2024-11-xx_silverado_lt_tb_diesel_otd_64000":
    "New 2024 LT Trail Boss diesel 4WD, $64k OTD, zero miles.",
};

// Location fixes: id -> corrected dealerLocation
const locationFixes: Record<string, string> = {
  "forum_kiasportageforums_2024-09-27_10": "NC",
  "forum_kiasportageforums_2024-12-26_14": "FL",
  "forum_4runner6g_orp_2025-12-04": "MD",
  "forum_4runner6g_trd_sport_premium_2025-12-04": "Orange County, CA",
  "forum_4runner6g_trailhunter_offer_2025-12-15": "Austin, TX",
  "forum_4runner6g_trailhunter_paid_2025-12-15": "Connecticut",
  "forum_4runner6g_platinum_trade_2025-07-01": "ND",
  "forum_mavericktruckclub_paid_2025-12-29": "Cincinnati, OH",
  "forum_mavericktruckclub_quote_2025-12-28": "Georgia",
  "forum_civicxi_2024-05-18_fl5_paid_50000": "TX",
  "forum_civicxi_2025-02-06_fl5_paid_44818_73_oh": "OH",
  "forum_leasehackr_crv_sportl_fwd_2024-08-23": "NC",
  "forum_leasehackr_crv_sportl_awd_2024-08-23_update": "MD",
  "forum_leasehackr_crv_touring_2024-08-30": "NC",
};

async function main() {
  // 1. Delete seed entries
  const deleted = await sql`DELETE FROM car_deals WHERE "guestId" = 'seed' RETURNING id`;
  console.log(`Deleted ${deleted.length} seed entries.`);

  // 2. Update notes
  let notesUpdated = 0;
  for (const [id, newNote] of Object.entries(noteRewrites)) {
    await sql`UPDATE car_deals SET notes = ${newNote} WHERE id = ${id}`;
    notesUpdated++;
  }
  console.log(`Updated ${notesUpdated} notes.`);

  // 3. Fix locations
  let locsUpdated = 0;
  for (const [id, newLoc] of Object.entries(locationFixes)) {
    await sql`UPDATE car_deals SET "dealerLocation" = ${newLoc} WHERE id = ${id}`;
    locsUpdated++;
  }
  console.log(`Fixed ${locsUpdated} locations.`);

  // 4. Show final count
  const count = await sql`SELECT count(*) as c FROM car_deals`;
  console.log(`\nTotal deals remaining: ${count[0].c}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
