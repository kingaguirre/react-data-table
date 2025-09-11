// src/DataTable2/dataWorkerClient.ts
import * as Comlink from "comlink";

type WorkerAPI = {
  ingestRows(rows: any[], columnIds: string[]): Promise<void>;
  updateRowText(rowIndex: number, updatedRow: any): Promise<void>;
  sortByVector(values: (string | number | null | undefined)[], desc: boolean): Promise<Int32Array>;
  globalFilter(query: string, order?: Int32Array | null): Promise<Int32Array>;
  generateLargeData(total: number, cols: number, chunk?: number): Promise<any[]>;
  generateLargeDataStream(
    total: number,
    cols: number,
    chunk: number,
    onBatch: (batch: any[]) => void
  ): Promise<void>;
  reset(): Promise<void>;
};

export function createDataWorker() {
  const worker = new Worker(new URL("./sort.worker.ts", import.meta.url), { type: "module" });
  const api = Comlink.wrap<WorkerAPI>(worker);
  return { api, dispose: () => worker.terminate() };
}

export async function generateLargeData(opts: { rows: number; cols: number; chunk?: number }) {
  const w = createDataWorker();
  try {
    return await w.api.generateLargeData(opts.rows, opts.cols, opts.chunk);
  } finally {
    w.dispose();
  }
}

/** Streaming with cancellation + RAF backpressure to avoid churn */
export function generateLargeDataStream(
  opts: { rows: number; cols: number; chunk?: number },
  onBatch: (batch: any[]) => void
): () => void {
  const worker = new Worker(new URL("./sort.worker.ts", import.meta.url), { type: "module" });
  const api = Comlink.wrap<WorkerAPI>(worker);

  let cancelled = false;

  // Buffer incoming batches; flush once per frame.
  const queue: any[][] = [];
  let rafId: number | null = null;

  const flush = () => {
    rafId = null;
    if (cancelled) return;
    if (!queue.length) return;

    // Merge everything we buffered this frame into one append.
    const merged = queue.length === 1 ? queue[0] : queue.flat();
    queue.length = 0;

    try {
      onBatch(merged);
    } catch (e) {
      // don't let user handler break our loop
      console.error(e);
    }
  };

  const append = (batch: any[]) => {
    if (cancelled) return;
    queue.push(batch);
    if (rafId == null) rafId = requestAnimationFrame(flush);
  };

  api.generateLargeDataStream(
    opts.rows,
    opts.cols,
    opts.chunk ?? 2000,
    Comlink.proxy(append)
  )
    .then(() => {
      // one last flush to deliver any leftovers
      if (!cancelled && (queue.length || rafId != null)) {
        if (rafId != null) cancelAnimationFrame(rafId);
        flush();
      }
    })
    .catch((e) => { if (!cancelled) console.error(e); })
    .finally(() => { try { worker.terminate(); } catch {} });

  return () => {
    cancelled = true;
    if (rafId != null) cancelAnimationFrame(rafId);
    try { worker.terminate(); } catch {}
  };
}

