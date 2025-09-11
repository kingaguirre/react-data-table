import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ColumnSetting } from "../interface";

export function useTableColumns<T extends Record<string, any>>(columnSettings: ColumnSetting<T>[]) {
  const columns = useMemo<ColumnDef<T>[]>(() => {
    return columnSettings.map((c) => {
      const accessor = c.accessor ?? ((row: T) => row[c.column]);
      return {
        id: c.column,
        header: c.title ?? c.column,
        accessorFn: accessor,
        size: c.width ?? 120,
        minSize: c.minWidth ?? 40,
        maxSize: c.maxWidth ?? 10000,
      } as ColumnDef<T>;
    });
  }, [columnSettings]);

  const accessorById = useMemo(() => {
    const m = new Map<string, (row: T, i: number) => any>();
    for (const c of columnSettings)
      m.set(c.column, (c.accessor ?? ((r: T) => (r as any)[c.column])) as any);
    return m;
  }, [columnSettings]);

  return { columns, accessorById };
}
