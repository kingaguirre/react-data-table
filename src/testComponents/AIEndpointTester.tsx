"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";

/**
 * AIEndpointTester — no Tailwind, no extra deps. Pure React + vanilla CSS.
 * - Streams and renders SSE / NDJSON / text / JSON (auto or forced parser)
 * - Shows request headers/payload, HTTP status, content-type, and friendly hints
 * - Copy-to-clipboard for cURL and Output
 */
export default function AIEndpointTester() {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState(""); // accepts raw token or "Bearer …"
  const [model, setModel] = useState("gpt-4o-mini");
  const [prompt, setPrompt] = useState("say hello in 3 words");
  const [payloadMode, setPayloadMode] = useState<"messages" | "input">(
    "messages"
  );
  const [stream, setStream] = useState(true);
  const [timeoutMs, setTimeoutMs] = useState(30000);
  const [parser, setParser] = useState<"auto" | "sse" | "ndjson" | "text" | "json">(
    "auto"
  );

  const [state, setState] = useState<
    "idle" | "requesting" | "streaming" | "done" | "error" | "aborted"
  >("idle");
  const [httpStatus, setHttpStatus] = useState<string>("");
  const [ctype, setCtype] = useState<string>("");
  const [output, setOutput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [hint, setHint] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const [copiedOut, setCopiedOut] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const headers = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (token.trim()) {
      const t = token.trim();
      h["Authorization"] = t.toLowerCase().startsWith("bearer ") ? t : `Bearer ${t}`;
    }
    return h;
  }, [token]);

  const payload = useMemo(() => {
    if (payloadMode === "messages") {
      return { model, stream, messages: [{ role: "user", content: prompt }] };
    }
    return { model, stream, input: prompt };
  }, [model, stream, payloadMode, prompt]);

  const curl = useMemo(() => {
    if (!url) return "";
    const hdrs = Object.entries(headers)
      .map(([k, v]) => `-H ${JSON.stringify(`${k}: ${v}`)}`)
      .join(" ");
    return `curl -X POST ${hdrs} -d ${JSON.stringify(
      JSON.stringify(payload)
    )} ${JSON.stringify(url)}`;
  }, [url, headers, payload]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState("idle");
    setHttpStatus("");
    setCtype("");
    setOutput("");
    setLogs([]);
    setHint("");
  }, []);

  const appendLog = useCallback((line: string) => setLogs((p) => [...p, line]), []);

  const start = useCallback(async () => {
    if (!url) {
      setHint("Set a valid URL.");
      return;
    }
    setState("requesting");
    setOutput("");
    setLogs([]);
    setHint("");

    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let resp: Response | null = null;
    try {
      appendLog(`[req] POST ${url}`);
      appendLog(`[req] headers ${JSON.stringify(headers)}`);
      appendLog(`[req] payload ${JSON.stringify(payload)}`);

      resp = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      setHttpStatus(`${resp.status} ${resp.statusText}`);
      const ct = (resp.headers.get("content-type") || "").toLowerCase();
      setCtype(ct);

      if (!resp.ok) {
        const text = await safeText(resp);
        setState("error");
        appendLog(`[resp] error body: ${truncate(text, 2000)}`);
        setHint(hintFromHttp(resp.status, ct, text));
        return;
      }

      const mode = parser === "auto" ? detectParser(ct) : parser;
      appendLog(`[resp] content-type: ${ct} → parser: ${mode}`);

      setState("streaming");
      const onChunk = (s: string) => setOutput((prev) => prev + s);

      if (!resp.body) {
        const text = await safeText(resp);
        onChunk(text);
        setState("done");
        return;
      }

      if (mode === "sse") await pumpSSE(resp.body, onChunk);
      else if (mode === "ndjson") await pumpNDJSON(resp.body, onChunk);
      else if (mode === "text") await pumpText(resp.body, onChunk);
      else if (mode === "json") {
        const text = await safeText(resp);
        try { onChunk(extract(JSON.parse(text)) || text); } catch { onChunk(text); }
      }

      setState("done");
    } catch (e: any) {
      clearTimeout(timer);
      setState("error");
      const msg = e?.message || String(e);
      appendLog(`[err] ${msg}`);
      setHint(hintFromFetchError(e));
    }
  }, [url, headers, payload, timeoutMs, parser]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setState("aborted");
  }, []);

  const copy = useCallback(async (text: string, which: "out" | "curl") => {
    try {
      await navigator.clipboard.writeText(text);
      if (which === "out") {
        setCopiedOut(true); setTimeout(() => setCopiedOut(false), 1200);
      } else {
        setCopiedCurl(true); setTimeout(() => setCopiedCurl(false), 1200);
      }
    } catch {}
  }, []);

  return (
    <div className="aiet-container">
      <div className="aiet-header">
        <div className="aiet-badge">AI</div>
        <div>
          <div className="aiet-title">AI Endpoint Tester</div>
          <div className="aiet-sub">Stream, inspect and debug any AI HTTP endpoint — no Tailwind needed.</div>
        </div>
      </div>

      <div className="aiet-card">
        <div className="aiet-grid">
          <Field label="Endpoint URL">
            <input className="aiet-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://ai.internal/v1/chat" />
          </Field>

          <div className="aiet-grid aiet-grid-3">
            <Field label="Auth (optional)">
              <input className="aiet-input" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Bearer xxx (or raw token)" />
            </Field>
            <Field label="Model">
              <input className="aiet-input" value={model} onChange={(e) => setModel(e.target.value)} />
            </Field>
            <Field label="Timeout (ms)">
              <input type="number" className="aiet-input" value={timeoutMs} onChange={(e) => setTimeoutMs(Number(e.target.value || 0))} min={0} />
            </Field>
          </div>

          <div className="aiet-grid aiet-grid-3">
            <Field label="Payload">
              <Segmented value={payloadMode} onChange={(v) => setPayloadMode(v as any)} options={[{ v: "messages", t: "messages[]" }, { v: "input", t: "input" }]} />
            </Field>
            <Field label="Stream">
              <Segmented value={String(stream)} onChange={(v) => setStream(v === "true")} options={[{ v: "true", t: "true" }, { v: "false", t: "false" }]} />
            </Field>
            <Field label="Parser">
              <Segmented value={parser} onChange={(v) => setParser(v as any)} options={[{ v: "auto", t: "auto" }, { v: "sse", t: "sse" }, { v: "ndjson", t: "ndjson" }, { v: "text", t: "text" }, { v: "json", t: "json" }]} />
            </Field>
          </div>

          <Field label="Prompt / Input">
            <textarea className="aiet-input aiet-textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </Field>

          <div className="aiet-actions">
            <Button onClick={start} disabled={state === "streaming" || state === "requesting"}>{state === "streaming" || state === "requesting" ? "Running…" : "Send"}</Button>
            <Button variant="outline" onClick={abort} disabled={state !== "streaming" && state !== "requesting"}>Abort</Button>
            <Button variant="ghost" onClick={reset}>Reset</Button>

            <div className="aiet-statusbar">
              <StatusPill state={state} />
              {httpStatus && <Pill>{httpStatus}</Pill>}
              {ctype && <Pill>{ctype}</Pill>}
            </div>
          </div>
        </div>

        <div className="aiet-split">
          <Panel title="Output (stream)" action={<SmallButton onClick={() => copy(output, "out")}>{copiedOut ? "✓ Copied" : "Copy"}</SmallButton>}>
            <pre className="aiet-pre">{output || "(no output yet)"}</pre>
          </Panel>
          <Panel title="Logs">
            <pre className="aiet-pre aiet-pre-sm">{logs.length ? logs.join("") : "(no logs yet)"}</pre>
          </Panel>
        </div>

        <div className="aiet-split">
          <Panel title="Troubleshooting Hint">
            <div className="aiet-hint">{hint || "—"}</div>
          </Panel>
          <Panel title="cURL (copy to terminal)" action={<SmallButton onClick={() => copy(curl, "curl")}>{copiedCurl ? "✓ Copied" : "Copy"}</SmallButton>}>
            <pre className="aiet-pre aiet-pre-sm">{curl || "(fill URL to generate)"}</pre>
          </Panel>
        </div>
      </div>

      {/* Inline CSS so you don't need any setup. Move to .css if you prefer. */}
      <style>{CSS}</style>
    </div>
  );
}

// ---------------- UI bits ----------------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="aiet-field">
      <span className="aiet-label">{label}</span>
      {children}
    </label>
  );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; t: string }[]; }) {
  return (
    <div className="aiet-seg">
      {options.map((o) => (
        <button
          key={o.v}
          className={"aiet-seg-btn" + (value === o.v ? " aiet-seg-active" : "")}
          onClick={() => onChange(o.v)}
          type="button"
        >
          {o.t}
        </button>
      ))}
    </div>
  );
}

function Button({ children, onClick, disabled, variant = "primary" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: "primary" | "outline" | "ghost"; }) {
  const cls =
    variant === "primary"
      ? "aiet-btn aiet-btn-primary"
      : variant === "outline"
      ? "aiet-btn aiet-btn-outline"
      : "aiet-btn aiet-btn-ghost";
  return (
    <button onClick={onClick} disabled={disabled} className={cls} type="button">
      {children}
    </button>
  );
}

function SmallButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} type="button" className="aiet-btn-sm">
      {children}
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="aiet-pill">{children}</span>;
}

function StatusPill({ state }: { state: string }) {
  const map: Record<string, string> = {
    idle: "#6b7280", // gray
    requesting: "#2563eb", // blue
    streaming: "#7c3aed", // purple
    done: "#059669", // emerald
    error: "#dc2626", // red
    aborted: "#b45309", // amber
  };
  const color = map[state] || map.idle;
  return (
    <span className="aiet-pill" style={{ borderColor: color, color }}>{state}</span>
  );
}

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="aiet-panel">
      <div className="aiet-panel-head">
        <div className="aiet-panel-title">{title}</div>
        <div>{action}</div>
      </div>
      {children}
    </div>
  );
}

// ---------------- parsing helpers ----------------
function detectParser(ct: string): "sse" | "ndjson" | "text" | "json" {
  const c = ct || "";
  if (c.includes("text/event-stream")) return "sse";
  if (c.includes("ndjson") || c.includes("jsonl")) return "ndjson";
  if (c.includes("text/plain")) return "text";
  if (c.includes("application/json")) return "json";
  return "text";
}

async function pumpSSE(body: ReadableStream<Uint8Array>, onChunk: (s: string) => void) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("")) !== -1) {
      const event = buf.slice(0, i);
      buf = buf.slice(i + 2);
      for (const line of event.split("")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") return;
        try { onChunk(extract(JSON.parse(data))); } catch { onChunk(data); }
      }
    }
  }
  if (buf.trim()) {
    try { onChunk(extract(JSON.parse(buf))); } catch { onChunk(buf); }
  }
}

async function pumpNDJSON(body: ReadableStream<Uint8Array>, onChunk: (s: string) => void) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf("")) !== -1) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      try { onChunk(extract(JSON.parse(line))); } catch { onChunk(line); }
    }
  }
  if (buf.trim()) {
    try { onChunk(extract(JSON.parse(buf))); } catch { onChunk(buf); }
  }
}

async function pumpText(body: ReadableStream<Uint8Array>, onChunk: (s: string) => void) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    onChunk(dec.decode(value, { stream: true }));
  }
}

function extract(obj: any): string {
  if (obj?.choices?.[0]?.delta?.content) return obj.choices[0].delta.content;
  if (obj?.choices?.[0]?.message?.content) return obj.choices[0].message.content;
  if (typeof obj?.content === "string") return obj.content;
  if (typeof obj?.text === "string") return obj.text;
  if (Array.isArray(obj?.content)) return obj.content.map((p: any) => p?.text || p?.content || "").join("");
  return JSON.stringify(obj);
}

function truncate(s: string, max = 2000) {
  return s.length > max ? s.slice(0, max) + "…(truncated)…" : s;
}

function hintFromHttp(status: number, ct: string, body: string): string {
  if (status === 401 || status === 403) return "Auth failed: check Bearer token / scopes / audience.";
  if (status === 404) return "Wrong path — verify the endpoint URL.";
  if (status === 405) return "Wrong method — should be POST.";
  if (status === 415) return "Unsupported Media Type — set 'Content-Type: application/json'.";
  if (status === 413) return "Payload too large — trim your request or raise server limit.";
  if (status >= 500) return "Server error — upstream crashed or is unavailable.";
  if (ct.includes("html")) return "Got HTML (likely an error page or proxy). Check gateway / auth.";
  if (body && /cors|allow-origin|preflight/i.test(body)) return "CORS rejection — enable CORS on the API or call via a same-origin server proxy.";
  return "Non-OK HTTP status. Inspect logs and body above.";
}

function hintFromFetchError(e: any): string {
  const msg = e?.message || "";
  if (/Failed to fetch/i.test(msg) || /NetworkError/i.test(msg)) {
    return (
      "Fetch failed — in the browser this is usually CORS or mixed content (http on https). " +
      "Use a server-side proxy (e.g., Next.js API route) or enable CORS on the AI endpoint."
    );
  }
  if (/timeout/i.test(msg) || e?.name === "AbortError") return "Timed out — server slow or blocked. Increase timeout or check network.";
  return `Unknown fetch error: ${msg}`;
}

// ---------------- Inline CSS ----------------
const CSS = `
:root {
  --card: #ffffff; --border: #e6e6e6; --muted: #666; --bg: #f7f7f8; --ink: #111;
}
@media (prefers-color-scheme: dark) {
  :root { --card:#0e0e0f; --border:#262626; --muted:#aaa; --bg:#0a0a0b; --ink:#f2f2f2; }
}
.aiet-container { max-width: 1040px; margin: 0 auto; padding: 16px; color: var(--ink); }
.aiet-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.aiet-badge { width: 36px; height: 36px; display:flex; align-items:center; justify-content:center; border-radius: 10px; background: linear-gradient(135deg,#e0f2ff,#eae2ff); color:#2563eb; font-weight:700; border:1px solid var(--border); }
.aiet-title { font-size: 18px; font-weight: 700; }
.aiet-sub { font-size: 13px; color: var(--muted); }

.aiet-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 6px 24px rgba(0,0,0,0.04); overflow: hidden; }

.aiet-grid { display: grid; grid-template-columns: 1fr; gap: 12px; padding: 12px; }
.aiet-grid-3 { grid-template-columns: 1fr; }
@media (min-width: 860px) { .aiet-grid-3 { grid-template-columns: repeat(3, minmax(0,1fr)); } }

.aiet-field { display: flex; flex-direction: column; gap: 6px; }
.aiet-label { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }

.aiet-input { padding: 10px 12px; border-radius: 10px; border:1px solid var(--border); background: rgba(255,255,255); color: black; outline: none; }
.aiet-input:focus { border-color:#7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.18); }
.aiet-textarea { min-height: 96px; resize: vertical; }

.aiet-seg { display: inline-flex; border:1px solid var(--border); border-radius: 10px; overflow: hidden; }
.aiet-seg-btn { padding: 8px 12px; font-size: 13px; background: transparent; border: 0; cursor: pointer; color: var(--muted); }
.aiet-seg-btn + .aiet-seg-btn { border-left:1px solid var(--border); }
.aiet-seg-btn.aiet-seg-active { background: #f3f1ff; color:#4c1d95; font-weight: 600; }
@media (prefers-color-scheme: dark) { .aiet-seg-btn.aiet-seg-active { background:#1a1426; color:#c4b5fd; } }

.aiet-actions { display:flex; align-items:center; gap:8px; padding: 8px 12px; }
.aiet-btn { padding: 10px 14px; border-radius: 10px; font-size: 14px; cursor: pointer; border: 1px solid transparent; }
.aiet-btn-primary { background:#2563eb; color:#fff; }
.aiet-btn-primary:hover { filter: brightness(1.04); }
.aiet-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.aiet-btn-outline { background: transparent; border-color: var(--border); }
.aiet-btn-outline:hover { background: rgba(0,0,0,.04); }
@media (prefers-color-scheme: dark) { .aiet-btn-outline:hover { background: rgba(255,255,255,.05); } }
.aiet-btn-ghost { background: transparent; color: var(--muted); }
.aiet-btn-ghost:hover { background: rgba(0,0,0,.04); }

.aiet-btn-sm { padding: 6px 10px; border-radius: 8px; border:1px solid var(--border); background: transparent; cursor: pointer; font-size: 12px; }
.aiet-btn-sm:hover { background: rgba(0,0,0,.04); }

.aiet-statusbar { margin-left: auto; display:flex; align-items:center; gap:6px; }
.aiet-pill { padding: 4px 8px; border-radius: 999px; border:1px solid var(--border); font-size: 12px; color: var(--muted); }

.aiet-split { display: grid; grid-template-columns: 1fr; gap: 12px; padding: 12px; border-top:1px solid var(--border); }
@media (min-width: 860px) { .aiet-split { grid-template-columns: 1fr 1fr; } }

.aiet-panel { border:1px solid var(--border); border-radius: 12px; padding: 10px; background: rgba(0,0,0,0.02); }
@media (prefers-color-scheme: dark) { .aiet-panel { background: rgba(255,255,255,0.03); } }
.aiet-panel-head { display:flex; align-items:center; justify-content: space-between; margin-bottom: 6px; }
.aiet-panel-title { font-size: 13px; font-weight: 700; color: var(--muted); }

.aiet-pre { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 13px; padding: 10px; border-radius: 10px; border:1px solid var(--border); background: #fcfcfd; color: var(--ink); min-height: 140px; max-height: 300px; overflow: auto; }
@media (prefers-color-scheme: dark) { .aiet-pre { background: #0f0f12; } }
.aiet-pre-sm { min-height: 120px; }

.aiet-hint { font-size: 14px; padding: 10px; border-radius: 10px; background: #fff7ed; border:1px solid #fed7aa; color:#9a3412; }
@media (prefers-color-scheme: dark) { .aiet-hint { background: #2b1d0f; border-color:#a16207; color:#fbbf24; } }
`;
