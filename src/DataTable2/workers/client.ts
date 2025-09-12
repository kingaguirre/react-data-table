// src/DataTable2/workers/client.ts
import * as Comlink from "comlink";
import type { Remote } from "comlink";

// Only the methods your table actually calls:
export type WorkerAPI = {
  ingestRows(rows: any[], columnIds: string[]): Promise<void>;
  updateRowText(rowIndex: number, updatedRow: any): Promise<void>;
  sortByVector(values: (string | number | null | undefined)[], desc: boolean): Promise<Int32Array>;
  globalFilter(query: string, order?: Int32Array | null): Promise<Int32Array | null>; // ⟵ changed
  reset(): Promise<void>;
};

export type DataWorkerHandle = {
  api: Remote<WorkerAPI>;
  dispose: () => void;
};

export function createDataWorker(): DataWorkerHandle {
  const worker = new Worker(
    new URL("./table.worker.ts", import.meta.url),
    { type: "module" }
  );
  const api = Comlink.wrap<WorkerAPI>(worker) as Remote<WorkerAPI>;
  return { api, dispose: () => worker.terminate() };
}
