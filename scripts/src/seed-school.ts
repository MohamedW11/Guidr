/**
 * School Seed Script Placeholder
 */

export async function seedSchoolMain() {
  console.log("School seed script ready.");
}

if (process.argv[1]?.includes("seed-school")) {
  seedSchoolMain().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
}
