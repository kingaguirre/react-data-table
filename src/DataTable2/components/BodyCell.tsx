import React, { CSSProperties } from "react";

export type BodyCellProps = {
  value: any;
  style: CSSProperties;
  zebra: boolean;
  bg?: string;
  /** Version counter to force rerender only for the affected row */
  v: number;
};

function equalCellStyle(a: CSSProperties, b: CSSProperties) {
  if (a === b) return true;
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height &&
    a.transform === b.transform
  );
}

function BodyCellImpl({ value, style, zebra, bg }: BodyCellProps) {
  console.log(123)
  return (
    <div
      style={{
        ...style,
        padding: "0 8px",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #eee",
        borderRight: "1px solid #f3f3f3",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        boxSizing: "border-box",
        background: bg ?? (zebra ? "#fafafa" : "#fff"),
      }}
      title={value != null ? String(value) : ""}
    >
      {value as any}
    </div>
  );
}

const BodyCell = React.memo(
  BodyCellImpl,
  (prev, next) =>
    prev.value === next.value &&
    prev.zebra === next.zebra &&
    prev.bg === next.bg &&
    prev.v === next.v &&
    equalCellStyle(prev.style, next.style)
);

export default BodyCell;
