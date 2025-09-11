import React, { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsRight, ChevronRight, ChevronDown, Search as SearchIcon, Folder, FileText, Braces, List, Info, Check, Hash, CornerDownRight } from "lucide-react";

/**
 * PathPicker — Styled Components UI (no external UI libs)
 * - Modal dialog with overlay
 * - Left: tree + search
 * - Right: breadcrumb, path input with validation, previews
 * - Array collection `[]` binding toggle
 */

// ---------------------- Styled Primitives ----------------------

const Page = styled.div`
  padding: 24px; max-width: 1080px; margin: 0 auto; color: #0f172a; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
`;

const H1 = styled.h1`font-size: 24px; font-weight: 600; margin: 0 0 6px;`;
const P = styled.p`font-size: 13px; color: #475569; margin: 0 0 24px;`;

const Card = styled.div`
  border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background: #fff;
`;

const Mono = styled.span`font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;`;

const Button = styled.button<{ $variant?: "primary" | "secondary" | "ghost"; $size?: "sm" | "md" }>`
  border: 1px solid transparent; border-radius: 10px; cursor: pointer; font-weight: 500;
  ${(p) => p.$size === "sm" ? css`padding: 6px 10px; font-size: 12px;` : css`padding: 8px 14px; font-size: 14px;`}
  ${(p) => {
    switch (p.$variant) {
      case "secondary": return css`background: #f1f5f9; color: #0f172a;`;
      case "ghost": return css`background: transparent; color: #0f172a; border-color: #e2e8f0;`;
      default: return css`background: #0ea5e9; color: white;`;
    }
  }}
  &:hover { filter: brightness(0.98); }
`;

const Input = styled.input`
  width: 100%; padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; ${Mono} { font-size: 12px; }
  &:focus { outline: none; border-color: #94a3b8; box-shadow: 0 0 0 3px rgba(14,165,233,0.15); }
`;

const TextArea = styled.pre`
  margin: 0; white-space: pre-wrap; word-break: break-word; font-size: 12px; ${Mono}
`;

const Badge = styled.span<{ $tone?: "neutral" | "success" | "warn" }>`
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 999px; font-size: 11px; text-transform: capitalize; border: 1px solid #e2e8f0; background: #f8fafc;
  ${(p) => p.$tone === "success" && css`background: #ecfdf5; border-color: #a7f3d0; color: #065f46;`}
  ${(p) => p.$tone === "warn" && css`background: #fffbeb; border-color: #fde68a; color: #92400e;`}
`;

const Separator = styled.div`height: 1px; background: #e2e8f0;`;

// Modal
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); display: grid; place-items: center; z-index: 50;
`;

const Modal = styled(motion.div)`
  width: 100%; max-width: 1000px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.24);
`;

const ModalHeader = styled.div`padding: 16px 20px; border-bottom: 1px solid #e2e8f0;`;
const ModalTitle = styled.h2`margin: 0; font-size: 16px; font-weight: 600;`;
const ModalSub = styled.div`font-size: 12px; color: #64748b; margin-top: 4px;`;

const ModalBody = styled.div`display: grid; grid-template-columns: 420px 1fr; height: 70vh;`;
const LeftPane = styled.div`border-right: 1px solid #e2e8f0; display: flex; flex-direction: column;`;
const RightPane = styled.div`display: flex; flex-direction: column;`;

const PaneHeader = styled.div`padding: 12px; display: flex; gap: 8px; align-items: center;`;
const SearchWrap = styled.div`position: relative; flex: 1;`;
const SearchIconWrap = styled.div`position: absolute; left: 10px; top: 50%; transform: translateY(-50%); opacity: 0.6;`;
const SearchInput = styled(Input)`padding-left: 32px;`;

const ScrollArea = styled.div`flex: 1; overflow: auto; padding: 10px;`;

// Tree
const TreeRow = styled.div<{ $selected?: boolean }>`
  display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; cursor: pointer; user-select: none;
  ${(p) => p.$selected ? css`background: #f1f5f9;` : css`&:hover { background: #f8fafc; }`}
`;
const ExpandBtn = styled.button`width: 20px; height: 20px; display: grid; place-items: center; border: none; background: transparent; cursor: pointer;`;
const KeyText = styled(Mono)`font-size: 11px; color: #64748b;`;
const ChildrenWrap = styled(motion.div)`margin-left: 14px; border-left: 1px solid #e2e8f0; padding-left: 8px;`;

// Breadcrumb
const CrumbBar = styled.div`display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; overflow-x: auto;`;
const CrumbBtn = styled.button`border: none; background: transparent; color: inherit; cursor: pointer; &:hover { color: #0f172a; }`;

// Inspector
const Section = styled.div`padding: 12px; display: grid; gap: 8px;`;
const Label = styled.div`font-size: 11px; color: #64748b;`;
const Kbd = styled(Mono)`background: #f1f5f9; padding: 0 6px; border-radius: 6px;`;

const Flex = styled.div<{ $gap?: number; $justify?: string; $items?: string }>`
  display: flex; gap: ${(p)=>p.$gap ?? 8}px; justify-content: ${(p)=>p.$justify ?? "flex-start"}; align-items: ${(p)=>p.$items ?? "center"};
`;

const PreviewBox = styled.div`
  border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px; height: 200px; overflow: auto; background: #f8fafc; ${Mono} { font-size: 12px; }
`;

const Footer = styled.div`padding: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;`;

// Command (search results)
const CommandWrap = styled.div`padding: 8px;`;
const CommandGroup = styled.div`margin-top: 8px;`;
const CommandItem = styled.div`
  display: grid; grid-template-columns: 20px 1fr auto auto; gap: 8px; align-items: center; padding: 6px 8px; border-radius: 8px; cursor: pointer;
  &:hover { background: #f1f5f9; }
  ${Mono} { font-size: 11px; }
`;
const Muted = styled.span`font-size: 12px; color: #64748b;`;

// ---------------------- Types & utils ----------------------

type NodeType = "object" | "array" | "string" | "number" | "boolean" | "null" | "undefined" | "unknown";

function inferType(value: unknown): NodeType {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  switch (typeof value) {
    case "string": return "string";
    case "number": return "number";
    case "boolean": return "boolean";
    case "undefined": return "undefined";
    case "object": return "object";
    default: return "unknown";
  }
}

export type PathSegment = string | number | "[]";

function parsePath(path: string): PathSegment[] {
  const segments: PathSegment[] = [];
  let i = 0;
  const push = (s: string) => { if (s !== "") segments.push(s); };
  while (i < path.length) {
    if (path[i] === ".") { i++; continue; }
    if (path[i] === "[") {
      let j = i + 1; let quoted = false; let quoteChar = ""; if (path[j] === '"' || path[j] === "'") { quoted = true; quoteChar = path[j]; j++; }
      let buf = ""; while (j < path.length) { const ch = path[j]; if (quoted) { if (ch === quoteChar && path[j-1] !== "\\") break; buf += ch; j++; continue; } if (ch === "]") break; buf += ch; j++; }
      if (quoted) j++;
      const raw = buf.trim(); if (raw === "") segments.push("[]"); else if (/^\d+$/.test(raw)) segments.push(Number(raw)); else segments.push(raw);
      while (j < path.length && path[j] !== "]") j++; if (j < path.length && path[j] === "]") j++; i = j; continue;
    }
    let j = i; let buf = ""; while (j < path.length && path[j] !== "." && path[j] !== "[") { buf += path[j]; j++; }
    push(buf); i = j;
  }
  return segments;
}

function stringifyPath(segments: PathSegment[]): string {
  return segments
    .map((seg, idx) => {
      if (seg === "[]") return "[]";
      if (typeof seg === "number") return `[${seg}]`;
      const safe = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(seg) ? seg : `["${String(seg).replace(/\"/g, '\\"')}"]`;
      return idx === 0 && !safe.startsWith("[") ? safe : (safe.startsWith("[") ? safe : "." + safe);
    })
    .join("")
    .replace(/^\./, "");
}

function getAtPath(obj: any, path: string): unknown {
  const segs = parsePath(path); let cur: any = obj;
  for (const seg of segs) { if (seg === "[]") return cur; if (cur == null) return undefined; if (typeof seg === "number") { if (!Array.isArray(cur)) return undefined; cur = cur[seg]; } else { cur = cur[seg as string]; } }
  return cur;
}

function validatePath(obj: unknown, path: string): { exists: boolean; type?: NodeType; nearestExisting?: string } {
  const segs = parsePath(path); let cur: any = obj; let built: PathSegment[] = [];
  for (const seg of segs) {
    if (seg === "[]") { const t = inferType(cur); if (t !== "array") return { exists: false, nearestExisting: stringifyPath(built) }; built.push(seg); continue; }
    if (cur == null) return { exists: false, nearestExisting: stringifyPath(built) };
    if (typeof seg === "number") { if (!Array.isArray(cur) || cur[seg] === undefined) return { exists: false, nearestExisting: stringifyPath(built) }; cur = cur[seg]; built.push(seg); }
    else { if (typeof cur !== "object" || !(seg in cur)) return { exists: false, nearestExisting: stringifyPath(built) }; cur = (cur as any)[seg]; built.push(seg); }
  }
  return { exists: true, type: inferType(cur), nearestExisting: stringifyPath(built) };
}

// ---------------------- UI bits ----------------------

function TypeBadge({ type }: { type: NodeType }) {
  const icon = type === "object" ? <Folder size={14} />
    : type === "array" ? <List size={14} />
    : type === "string" ? <FileText size={14} />
    : type === "number" ? <Hash size={14} />
    : type === "boolean" ? <Check size={14} />
    : <Braces size={14} />;
  return <Badge><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{icon}<span>{type}</span></span></Badge>;
}

function Breadcrumb({ segments, onGoTo, rootLabel = "root" }: { segments: { key: string; path: string }[]; onGoTo: (path: string) => void; rootLabel?: string }) {
  return (
    <CrumbBar>
      <CrumbBtn onClick={() => onGoTo("")}>{rootLabel}</CrumbBtn>
      <ChevronsRight size={16} />
      {segments.map((s, i) => (
        <React.Fragment key={s.path}>
          <CrumbBtn onClick={() => onGoTo(s.path)}>{s.key}</CrumbBtn>
          {i < segments.length - 1 && <ChevronsRight size={16} />}
        </React.Fragment>
      ))}
    </CrumbBar>
  );
}

type TreeNodeProps = { label: string; value: unknown; path: string; selectedPath: string; onSelect: (path: string) => void; };

function TreeNode({ label, value, path, selectedPath, onSelect }: TreeNodeProps) {
  const type = inferType(value);
  const [open, setOpen] = React.useState(false);
  const isBranch = type === "object" || type === "array";
  const isSelected = selectedPath === path;
  const childrenEntries = React.useMemo(() => {
    if (type === "object") return Object.entries(value as Record<string, unknown>);
    if (type === "array") return (value as unknown[]).map((v, i) => [String(i), v]) as [string, unknown][];
    return [] as [string, unknown][];
  }, [value, type]);

  return (
    <div>
      <TreeRow $selected={isSelected} onClick={() => onSelect(path)}>
        {isBranch ? (
          <ExpandBtn onClick={(e) => { e.stopPropagation(); setOpen(p => !p); }}>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </ExpandBtn>
        ) : (<div style={{ width: 20, height: 20 }} />)}
        <KeyText>{label}</KeyText>
        <TypeBadge type={type} />
        {type !== "object" && type !== "array" && (
          <div title={typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)} style={{ marginLeft: "auto" }}>
            <Info size={16} />
          </div>
        )}
      </TreeRow>
      <AnimatePresence initial={false}>
        {open && childrenEntries.length > 0 && (
          <ChildrenWrap initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            {childrenEntries.map(([k, v]) => (
              <TreeNode key={path ? path + (isNaN(Number(k)) ? `.${k}` : `[${k}]`) : k} label={k} value={v} path={path ? (isNaN(Number(k)) ? `${path}.${k}` : `${path}[${k}]`) : k} selectedPath={selectedPath} onSelect={onSelect} />
            ))}
          </ChildrenWrap>
        )}
      </AnimatePresence>
    </div>
  );
}

function PathHints({ data, current }: { data: unknown; current: string }) {
  const segs = parsePath(current);
  const parentSegs = segs.slice(0, -1);
  const parentPath = stringifyPath(parentSegs);
  const parentValue = parentPath ? getAtPath(data, parentPath) : data;
  const t = inferType(parentValue);

  const suggestions = React.useMemo(() => {
    if (t === "object") return Object.keys(parentValue as any);
    if (t === "array") return (parentValue as any[]).map((_, i) => String(i));
    return [];
  }, [t, parentValue]);

  if (suggestions.length === 0) return null;

  return (
    <Muted>
      Suggestions at <Mono>{parentPath || "root"}</Mono>:
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
        {suggestions.map((s) => (
          <span key={s} style={{ padding: "2px 6px", borderRadius: 6, background: "#f1f5f9", fontSize: 11 }}><Mono>{String(s)}</Mono></span>
        ))}
      </div>
    </Muted>
  );
}

// ---------------------- PathPicker ----------------------

type PathPickerProps = { open: boolean; onOpenChange: (v: boolean) => void; data: unknown; initialPath?: string; onConfirm: (path: string) => void; contextLabel?: string };

function PathPicker({ open, onOpenChange, data, initialPath = "", onConfirm, contextLabel = "data" }: PathPickerProps) {
  const [selectedPath, setSelectedPath] = useState<string>(initialPath);
  const [query, setQuery] = useState("");
  const [modeArrayCollection, setModeArrayCollection] = useState(false);

  useEffect(() => { if (open) { setSelectedPath(initialPath); setQuery(""); setModeArrayCollection(false); } }, [open, initialPath]);

  const { exists, type, nearestExisting } = useMemo(() => validatePath(data, selectedPath || ""), [data, selectedPath]);

  const breadcrumb = useMemo(() => {
    const segs = parsePath(selectedPath); const items: { key: string; path: string }[] = []; let acc: PathSegment[] = [];
    for (const seg of segs) { acc.push(seg); items.push({ key: String(seg), path: stringifyPath(acc) }); }
    return items;
  }, [selectedPath]);

  // Flatten for search
  const flat = useMemo(() => {
    const out: { path: string; key: string; type: NodeType; preview: string }[] = [];
    const walk = (val: any, path: string) => {
      const t = inferType(val);
      out.push({ path, key: path.split(".").slice(-1)[0] || "root", type: t, preview: t === "object" || t === "array" ? "" : String(val) });
      if (t === "object") { for (const k of Object.keys(val)) walk(val[k], path ? `${path}.${k}` : k); }
      else if (t === "array") { (val as any[]).forEach((v, i) => walk(v, path + `[${i}]`)); }
    };
    walk(data as any, "");
    return out;
  }, [data]);

  const filtered = useMemo(() => {
    if (!query.trim()) return flat.slice(0, 200);
    const q = query.toLowerCase();
    return flat.filter(x => x.path.toLowerCase().includes(q) || x.key.toLowerCase().includes(q) || x.preview.toLowerCase().includes(q)).slice(0, 200);
  }, [flat, query]);

  const currentValue = selectedPath ? getAtPath(data, selectedPath) : data;
  const currentType = inferType(currentValue);
  const effectivePath = useMemo(() => (modeArrayCollection && currentType === "array") ? (selectedPath || "") + "[]" : selectedPath, [modeArrayCollection, currentType, selectedPath]);

  if (!open) return null;

  return (
    <Overlay onMouseDown={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}>
      <Modal initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}>
        <ModalHeader>
          <ModalTitle>Bind to data path</ModalTitle>
          <ModalSub>Pick a value from your {contextLabel} source</ModalSub>
        </ModalHeader>

        <ModalBody>
          {/* Left */}
          <LeftPane>
            <PaneHeader>
              <SearchWrap>
                <SearchIconWrap><SearchIcon size={16} /></SearchIconWrap>
                <SearchInput placeholder="Search keys or paths…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </SearchWrap>
            </PaneHeader>
            <Separator />
            {!query ? (
              <ScrollArea>
                <TreeNode label={contextLabel} value={data} path="" selectedPath={selectedPath} onSelect={setSelectedPath} />
              </ScrollArea>
            ) : (
              <ScrollArea>
                <CommandWrap>
                  {filtered.length === 0 && <Muted>No matches.</Muted>}
                  <CommandGroup>
                    {filtered.map(item => (
                      <CommandItem key={item.path || "root"} onClick={() => setSelectedPath(item.path)}>
                        <CornerDownRight size={16} />
                        <Mono>{item.path || "root"}</Mono>
                        <div />
                        <Flex $gap={8} $items="center">
                          <TypeBadge type={item.type} />
                          {item.preview && <Muted style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.preview}</Muted>}
                        </Flex>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandWrap>
              </ScrollArea>
            )}
          </LeftPane>

          {/* Right */}
          <RightPane>
            <Section>
              <Breadcrumb segments={breadcrumb} onGoTo={(p) => setSelectedPath(p)} rootLabel={contextLabel} />

              <div>
                <Label>Path</Label>
                <Input value={selectedPath} onChange={(e) => setSelectedPath(e.target.value)} placeholder="e.g. users[0].firstName or users[].firstName" />
                <div style={{ marginTop: 8 }}>
                  <Flex $gap={8}>
                    <Badge $tone={exists ? "success" : "warn"}>{exists ? "Path exists" : `Nearest: ${nearestExisting || "root"}`}</Badge>
                    {type && <TypeBadge type={type} />}
                    {currentType === "array" && (
                      <Button $variant={modeArrayCollection ? "primary" : "secondary"} $size="sm" onClick={() => setModeArrayCollection(v => !v)}>
                        Bind collection []
                      </Button>
                    )}
                  </Flex>
                </div>
                <div style={{ marginTop: 8 }}>
                  <PathHints data={data} current={selectedPath} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <Label>Preview (value)</Label>
                  <PreviewBox>
                    <TextArea>{(() => { const val = getAtPath(data, effectivePath); try { return JSON.stringify(val, null, 2); } catch { return String(val); } })()}</TextArea>
                  </PreviewBox>
                </div>
                <div>
                  <Label>Preview (parent)</Label>
                  <PreviewBox>
                    <TextArea>{(() => {
                      const segs = parsePath(effectivePath); const parentSegs = segs.slice(0, -1);
                      const parent = parentSegs.length ? getAtPath(data, stringifyPath(parentSegs)) : data;
                      try { return JSON.stringify(parent, null, 2); } catch { return String(parent); }
                    })()}</TextArea>
                  </PreviewBox>
                </div>
              </div>
            </Section>

            <Footer>
              <Muted style={{ display: "flex", alignItems: "center", gap: 6 }}><Info size={16} />Use <Kbd>[]</Kbd> to bind the collection itself and drive repeaters.</Muted>
              <Flex $gap={8}>
                <Button $variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={() => onConfirm(effectivePath)} disabled={!exists && !effectivePath.endsWith("[]")}>Confirm</Button>
              </Flex>
            </Footer>
          </RightPane>
        </ModalBody>
      </Modal>
    </Overlay>
  );
}

// ---------------------- Demo Harness ----------------------

type DemoBinding = { path: string };

const demoData = {
  users: [
    { id: "u_1", firstName: "Ada", lastName: "Lovelace", age: 28, address: { city: "London", zip: "SW1" } },
    { id: "u_2", firstName: "Grace", lastName: "Hopper", age: 33, address: { city: "Arlington", zip: "22201" } },
  ],
  stats: { active: true, count: 2, tags: ["alpha", "beta"] },
  settings: { theme: "dark", locale: "en-GB" },
};

export default function PathPickerDemo() {
  const [open, setOpen] = useState(false);
  const [binding, setBinding] = useState<DemoBinding>({ path: "users[0].firstName" });

  return (
    <Page>
      <H1>PathPicker — UI Implementation</H1>
      <P>Pick a deep value from a nested data source. Supports arrays, breadcrumb navigation, search, and path editing.</P>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <div className="text-sm">Current binding</div>
          <Card>
            <Muted>Path</Muted>
            <div><Mono>{binding.path}</Mono></div>
            <div style={{ marginTop: 12 }}><Muted>Resolved value</Muted></div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 8, background: "#f8fafc" }}>
              <TextArea>{JSON.stringify(getAtPath(demoData, binding.path), null, 2)}</TextArea>
            </div>
          </Card>
          <Button onClick={() => setOpen(true)}>Bind to data…</Button>
        </div>
        <div>
          <Muted>Data source</Muted>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, height: 340, overflow: "auto", background: "#f8fafc" }}>
            <TextArea>{JSON.stringify(demoData, null, 2)}</TextArea>
          </div>
        </div>
      </div>

      <PathPicker open={open} onOpenChange={setOpen} data={demoData} initialPath={binding.path} onConfirm={(p) => { setBinding({ path: p }); setOpen(false); }} contextLabel="data" />
    </Page>
  );
}
