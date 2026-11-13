/**
 * Deterministically removes the white outer corners and cool-slate studio backdrop
 * from /alen-davis.jpg using perimeter flood-fill + multi-pixel smooth feathering
 * + silver halo decontamination so Alen's face, hair, and shirt blend seamlessly
 * into dark #060509 backdrops with zero jagged grey halo.
 */
let cachedDataUrl: string | null = null;

export function createTransparentPortraitCutout(srcUrl: string): Promise<string> {
  if (cachedDataUrl) return Promise.resolve(cachedDataUrl);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(srcUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const isBackgroundCandidate = (idx: number, x: number, y: number): boolean => {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const chroma = max - min;
          const luma = (r * 299 + g * 587 + b * 114) / 1000;

          // White outer corners & bright rim around circular crop
          if (luma >= 210 && chroma <= 34) return true;

          // Protect lower torso black shirt interior so dark highlights stay solid
          const inShirtInterior = y > h * 0.72 && x > w * 0.24 && x < w * 0.76;
          if (inShirtInterior) return false;

          // Protect central eye/skin highlights (warm skin always has r > b)
          const warmDiff = r - b;

          // Studio backdrop is cool-neutral slate (b >= r - 4, chroma <= 28, luma >= 58)
          const minLuma = y > h * 0.56 ? 66 : 56;
          if (chroma <= 28 && warmDiff <= 6 && luma >= minLuma) {
            return true;
          }

          return false;
        };

        const total = w * h;
        const visited = new Uint8Array(total);
        const queue = new Int32Array(total);
        let head = 0;
        let tail = 0;

        const enqueue = (x: number, y: number) => {
          if (x < 0 || x >= w || y < 0 || y >= h) return;
          const p = y * w + x;
          if (visited[p]) return;
          if (isBackgroundCandidate(p * 4, x, y)) {
            visited[p] = 1;
            queue[tail++] = p;
          }
        };

        // Seed BFS from all four image borders
        for (let x = 0; x < w; x++) {
          enqueue(x, 0);
          enqueue(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          enqueue(0, y);
          enqueue(w - 1, y);
        }

        // Seed inside upper-left and upper-right studio arcs in case dark rim touched an edge
        const seedPoints: [number, number][] = [
          [Math.round(w * 0.5), Math.round(h * 0.04)],
          [Math.round(w * 0.24), Math.round(h * 0.22)],
          [Math.round(w * 0.76), Math.round(h * 0.22)],
          [Math.round(w * 0.16), Math.round(h * 0.45)],
          [Math.round(w * 0.84), Math.round(h * 0.45)],
        ];
        for (const [sx, sy] of seedPoints) {
          enqueue(sx, sy);
        }

        while (head < tail) {
          const p = queue[head++];
          const x = p % w;
          const y = (p - x) / w;

          if (x > 0) enqueue(x - 1, y);
          if (x + 1 < w) enqueue(x + 1, y);
          if (y > 0) enqueue(x, y - 1);
          if (y + 1 < h) enqueue(x, y + 1);
        }

        // Compute normalized distance-to-background map up to radius R=4px for silky feathering
        const R = 4;
        const dist = new Uint8Array(total);
        dist.fill(255);
        let bHead = 0;
        let bTail = 0;
        const bQueue = new Int32Array(total);

        for (let p = 0; p < total; p++) {
          if (visited[p]) {
            dist[p] = 0;
            bQueue[bTail++] = p;
          }
        }

        while (bHead < bTail) {
          const p = bQueue[bHead++];
          const d = dist[p];
          if (d >= R) continue;
          const x = p % w;
          const y = (p - x) / w;
          const nd = d + 1;

          const push = (np: number) => {
            if (dist[np] > nd) {
              dist[np] = nd;
              bQueue[bTail++] = np;
            }
          };

          if (x > 0) push(p - 1);
          if (x + 1 < w) push(p + 1);
          if (y > 0) push(p - w);
          if (y + 1 < h) push(p + w);
        }

        // Apply alpha feathering & decontaminate residual neutral studio grey on semi-transparent edges
        const alphaScale = [0, 0.08, 0.34, 0.72, 0.94];
        for (let p = 0; p < total; p++) {
          const idx = p * 4;
          const d = dist[p];
          if (d === 0) {
            data[idx + 3] = 0;
          } else if (d <= R) {
            const a = alphaScale[d];
            data[idx + 3] = Math.round(data[idx + 3] * a);

            // Despill cool slate-grey fringe (pull cool bright fringe toward deep neutral obsidian)
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            if (max - min <= 30 && r - b <= 10 && d <= 3) {
              const keep = 0.25 + (d - 1) * 0.25;
              data[idx] = Math.round(r * keep);
              data[idx + 1] = Math.round(g * keep);
              data[idx + 2] = Math.round(b * keep);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        cachedDataUrl = canvas.toDataURL('image/png');
        resolve(cachedDataUrl);
      } catch {
        resolve(srcUrl);
      }
    };
    img.onerror = () => resolve(srcUrl);
    img.src = srcUrl;
  });
}
