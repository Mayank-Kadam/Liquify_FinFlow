const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store of offerings (dev-only)
const offerings = [];

app.get("/offerings", (req, res) => {
  res.json(offerings);
});

app.post("/offerings", (req, res) => {
  const { id, onchainId } = req.body || {};
  if (!id) return res.status(400).json({ error: "missing id" });

  const existing = offerings.find((o) => o.id === id);
  if (!existing) {
    offerings.push({ id, onchainId });
  }

  return res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Offerings server listening on http://127.0.0.1:${PORT}`);
});
