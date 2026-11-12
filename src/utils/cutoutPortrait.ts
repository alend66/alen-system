/**
 * Deterministically removes the white outer corners and neutral grey studio backdrop
 * from /alen-davis.jpg using perimeter flood-fill so Alen's real face, hair, and shirt
 * are 100% untouched on a transparent background.
 */
let cachedDataUrl: string | null = null;

export function createTransparentPortraitCutout(srcUrl: string): Promise<string> {
  if (cachedDataUrl) return Promise.resolve(cachedDataUrl);

  return new Promise(resolve => {
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

        const isBackgroundCandidate = (idx: number, y: number): boolean => {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const chroma = max - min;
          const luma = (r * 299 + g * 587 + b * 114) / 1000;

          // White outer corners
          if (luma > 218 && chroma < 24) return true;

          // Neutral grey studio backdrop (chroma is very low and brightness is medium-light grey)
          // Skin has high warm chroma (r - b > 22); hair and black shirt have low luma (< 58)
          const minLuma = y > h * 0.62 ? 64 : 58;
          if (chroma <= 17 && (r - b) <= 18 && luma >= minLuma && luma <= 225) {
            return true;
          }
          return false;
        };

        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const enqueue = (x: number, y: number) => {
          if (x < 0 || x >= w || y < 0 || y >= h) return;
          const p = y * w + x;
          if (visited[p]) return;
          if (isBackgroundCandidate(p * 4, y)) {
            visited[p] = 1;
            queue[tail++] = p;
          }
        };

        // Seed BFS from top, left, right, and upper-bottom edges
        for (let x = 0; x < w; x++) {
          enqueue(x, 0);
          enqueue(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          enqueue(0, y);
          enqueue(w - 1, y);
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

        // Apply transparency and 1px edge feathering
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const p = y * w + x;
            if (visited[p]) {
              data[p * 4 + 3] = 0;
            } else if (x > 0 && x + 1 < w && y > 0 && y + 1 < h) {
              const bgNeighbors =
                visited[p - 1] +
                visited[p + 1] +
                visited[p - w] +
                visited[p + w];
              if (bgNeighbors > 0) {
                data[p * 4 + 3] = Math.round(255 * (1 - bgNeighbors * 0.18));
              }
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
