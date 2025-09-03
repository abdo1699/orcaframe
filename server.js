const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

// middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

// save one entry
app.post("/save", (req, res) => {
  try {
    const entry = req.body || {};
    // basic sanitization
    const clean = {
      propertyType: String(entry.propertyType || "").trim(),
      size: Number(entry.size || 0),
      price: Number(entry.price || 0),
      city: String(entry.city || "").trim(),
      ts: Date.now(),
    };
    if (
      !clean.propertyType ||
      !clean.city ||
      clean.size <= 0 ||
      clean.price <= 0
    ) {
      return res.status(400).json({ ok: false, message: "Invalid data." });
    }
    const current = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    current.push(clean);
    fs.writeFileSync(DATA_FILE, JSON.stringify(current, null, 2), "utf8");
    res.json({ ok: true, message: "Data saved successfully." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Server error." });
  }
});

// read all data
app.get("/data", (_req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    res.json({ ok: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, data: [] });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
