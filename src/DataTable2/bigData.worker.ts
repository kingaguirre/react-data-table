// bigData.worker.ts
export type Row = Record<string, string | number>;

self.onmessage = (e: MessageEvent<{ total: number; cols: number; chunk: number }>) => {
  const { total, cols, chunk } = e.data;
  let id = 0;

  const tick = () => {
    const batch: Row[] = [];
    for (let k = 0; k < chunk && id < total; k++, id++) {
      const r: Row = {};
      for (let c = 0; c < cols; c++) {
        switch (c % 6) {
          case 0: r[`c${c}`] = `Row ${id}`; break;
          case 1: r[`c${c}`] = `User ${id}-${c}`; break;
          case 2: r[`c${c}`] = (id * 13 + c) % 100000; break;
          case 3: r[`c${c}`] = new Date(2021, 0, 1 + ((id + c) % 365)).toISOString().slice(0,10); break;
          case 4: r[`c${c}`] = ["KL","Penang","JB","Kuching","KK","Ipoh"][id % 6]; break;
          default: r[`c${c}`] = `C${c}-${(id * 7) % 9999}`;
        }
      }
      batch.push(r);
    }
    // @ts-ignore
    self.postMessage(batch);
    if (id < total) setTimeout(tick, 0);
  };

  tick();
};
export {};
