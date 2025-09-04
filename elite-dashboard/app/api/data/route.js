import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data.json");

export async function GET() {
  let data = [];
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  }
  return Response.json({ ok: true, data });
}
