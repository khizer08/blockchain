const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "..", "data", "database.json");

function loadData() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ candidates: { CONGRESS: 0, BJP: 0, JDS: 0 }, status: "not_started" }));
  }
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

app.get("/api/candidates", (req, res) => {
  const data = loadData();
  res.json(data);
});

app.post("/api/vote", (req, res) => {
  const { candidate } = req.body;
  const data = loadData();

  if (data.status !== "started") {
    return res.status(403).json({ message: "Election is not active." });
  }

  if (!data.candidates[candidate]) {
    return res.status(404).json({ message: "Candidate not found." });
  }

  data.candidates[candidate]++;
  saveData(data);
  res.json({ message: "Vote counted!" });
});

app.post("/api/reset", (req, res) => {
  const data = { candidates: { CONGRESS: 0, BJP: 0, JDS: 0 }, status: "not_started" };
  saveData(data);
  res.json({ message: "Votes reset." });
});

app.post("/api/start", (req, res) => {
  const data = loadData();
  data.status = "started";
  saveData(data);
  res.json({ message: "Election started." });
});

app.post("/api/end", (req, res) => {
  const data = loadData();
  data.status = "ended";
  saveData(data);
  res.json({ message: "Election ended." });
});

app.get("/api/results", (req, res) => {
  const data = loadData();
  res.json({ results: data.candidates || {} });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
