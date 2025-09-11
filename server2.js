// server2.mjs
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: true })); // wide-open for local dev

function makeRow(i, cols) {
  const r = {};
  for (let c = 0; c < cols; c++) {
    switch (c % 6) {
      case 0: r[`c${c}`] = `Row ${i}`; break;
      case 1: r[`c${c}`] = `User ${i}-${c}`; break;
      case 2: r[`c${c}`] = (i * 13 + c) % 100000; break;
      case 3: {
        const d = new Date(2021, 0, 1 + ((i + c) % 365));
        r[`c${c}`] = d.toISOString().slice(0, 10);
        break;
      }
      case 4: r[`c${c}`] = ["KL","Penang","JB","Kuching","KK","Ipoh"][i % 6]; break;
      default: r[`c${c}`] = `C${c}-${(i * 7) % 9999}`;
    }
  }
  return r;
}

// ✅ Windowed endpoint (use this in the app)
app.get('/rows/window', (req, res) => {
  const start = Math.max(0, parseInt(req.query.start ?? '0', 10));
  const limit = Math.max(1, Math.min(100000, parseInt(req.query.limit ?? '5000', 10)));
  const cols  = Math.max(1, parseInt(req.query.cols ?? '100', 10));
  const total = Math.max(start + limit, parseInt(req.query.total ?? '100000', 10));

  const end = Math.min(total, start + limit);
  const out = new Array(end - start);
  for (let i = start; i < end; i++) out[i - start] = makeRow(i, cols);
  res.json({ rows: out, start, end, total, cols });
});

// ⚠️ All-in-one JSON array (huge; for testing only)
app.get('/rows/all', async (req, res) => {
  const total = Math.max(0, parseInt(req.query.rows ?? '100000', 10));
  const cols  = Math.max(1, parseInt(req.query.cols ?? '100', 10));

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.write('[');
  for (let i = 0; i < total; i++) {
    const chunk = JSON.stringify(makeRow(i, cols));
    if (i > 0) res.write(',');
    if (!res.write(chunk)) await new Promise(r => res.once('drain', r)); // backpressure
    if ((i & 2047) === 0) await new Promise(r => setImmediate(r));      // yield
  }
  res.end(']');
});

const port = process.env.PORT ?? 3001;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
