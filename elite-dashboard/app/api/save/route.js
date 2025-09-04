import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");

export async function POST(request) {
  const entry = await request.json();
  const clean = {
    propertyType: String(entry.propertyType || "").trim(),
    size: Number(entry.size || 0),
    price: Number(entry.price || 0),
    city: String(entry.city || "").trim(),
    latitude: Number(entry.latitude || 0),
    floors: Number(entry.floors || 0),
    status: String(entry.status || "").trim(),
    parking_spaces: Number(entry.parking_spaces || 0),
    ts: Date.now(),
  };
  if (
    !clean.propertyType ||
    !clean.city ||
    clean.size <= 0 ||
    clean.price <= 0
  ) {
    return Response.json(
      { ok: false, message: "Invalid data." },
      { status: 400 }
    );
  }
  let current = [];
  if (fs.existsSync(DATA_FILE)) {
    current = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  }
  current.push(clean);
  fs.writeFileSync(DATA_FILE, JSON.stringify(current, null, 2), "utf8");
  return Response.json({ ok: true, message: "Data saved successfully." });
}
