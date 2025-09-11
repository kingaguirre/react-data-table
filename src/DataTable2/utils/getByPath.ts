import type { CSSProperties } from "react";

/** Safe dotted-path getter ("a.b.c" ➜ obj.a?.b?.c) */
export function getByPath(obj: any, path: string) {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function equalCellStyle(a: CSSProperties, b: CSSProperties) {
  if (a === b) return true;
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height &&
    a.transform === b.transform
  );
}
