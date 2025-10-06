// Node 18+ required (built-in fetch & Web Streams)
// Usage: COMPANY_AI_URL="https://ai.internal/v1/chat" COMPANY_AI_TOKEN="Bearer xxx" node test-ai.js "your prompt"

(async function () {
  const url = process.env.COMPANY_AI_URL;            // e.g. https://ai.internal/v1/chat
  if (!url) { console.error("Set COMPANY_AI_URL"); process.exit(1); }

  const rawToken = process.env.COMPANY_AI_TOKEN || ""; // can be "Bearer xxx" or just "xxx"
  const tokenHeader = rawToken
    ? (rawToken.toLowerCase().startsWith("bearer ") ? rawToken : `Bearer ${rawToken}`)
    : null;

  const prompt = process.argv.slice(2).join(" ") || "ping";

  // Adjust payload shape to your provider if needed
  const payload = {
    model: process.env.COMPANY_AI_MODEL || "gpt-4o-mini",
    stream: true,
    messages: [{ role: "user", content: prompt }],
    // If your API wants a single field instead of messages, use:
    // input: prompt,
  };

  const headers = { "Content-Type": "application/json" };
  if (tokenHeader) headers.Authorization = tokenHeader;

  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Request failed:", e?.message || e);
    process.exit(1);
  }

  if (!resp.ok) {
    const err = await resp.text().catch(() => "");
    console.error("Upstream error", resp.status, err || resp.statusText);
    process.exit(1);
  }

  const ct = (resp.headers.get("content-type") || "").toLowerCase();

  if (resp.body && ct.includes("text/event-stream")) {
    await pumpSSE(resp.body);
  } else if (resp.body && (ct.includes("ndjson") || ct.includes("jsonl"))) {
    await pumpNDJSON(resp.body);
  } else if (resp.body && ct.includes("text/plain")) {
    await pumpText(resp.body);
  } else if (ct.includes("application/json")) {
    const text = await resp.text();
    try { process.stdout.write(extract(JSON.parse(text)) + "\n"); }
    catch { process.stdout.write(text + "\n"); }
  } else if (resp.body) {
    // Fallback: treat as plain text stream
    await pumpText(resp.body);
  } else {
    console.error("No response body received.");
  }

  // ---------- helpers ----------
  function extract(obj) {
    if (obj?.choices?.[0]?.delta?.content) return obj.choices[0].delta.content;
    if (obj?.choices?.[0]?.message?.content) return obj.choices[0].message.content;
    if (typeof obj?.content === "string") return obj.content;
    if (typeof obj?.text === "string") return obj.text;
    if (Array.isArray(obj?.content)) return obj.content.map(p => p?.text || p?.content || "").join("");
    return JSON.stringify(obj);
  }

  async function pumpSSE(body) {
    const reader = body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });

      let i;
      while ((i = buf.indexOf("\n\n")) !== -1) {
        const event = buf.slice(0, i);
        buf = buf.slice(i + 2);

        const lines = event.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") { process.stdout.write("\n"); return; }
          try { process.stdout.write(extract(JSON.parse(data))); }
          catch { process.stdout.write(data); }
        }
      }
    }
    if (buf.trim()) {
      try { process.stdout.write(extract(JSON.parse(buf))); }
      catch { process.stdout.write(buf); }
      process.stdout.write("\n");
    }
  }

  async function pumpNDJSON(body) {
    const reader = body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });

      let nl;
      while ((nl = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        try { process.stdout.write(extract(JSON.parse(line))); }
        catch { process.stdout.write(line); }
      }
    }
    if (buf.trim()) {
      try { process.stdout.write(extract(JSON.parse(buf))); }
      catch { process.stdout.write(buf); }
    }
    process.stdout.write("\n");
  }

  async function pumpText(body) {
    const reader = body.getReader();
    const dec = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      process.stdout.write(dec.decode(value, { stream: true }));
    }
  }
})().catch((e) => {
  console.error("Fatal:", e?.message || e);
  process.exit(1);
});
