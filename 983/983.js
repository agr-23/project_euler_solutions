// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/983.py

const OFF = 1 << 15;
const SHIFT = 17;

function encodePoint(x, y) {
    return ((x + OFF) * (1 << SHIFT)) + (y + OFF);
}

function latticePointsOnCircle(m) {
    const lim = Math.floor(Math.sqrt(m));
    const points = [];
    for (let x = -lim; x <= lim; x++) {
        const y2 = m - x * x;
        if (y2 < 0) continue;
        const y = Math.floor(Math.sqrt(y2));
        if (y * y === y2) {
            points.push([x, y]);
            if (y !== 0) points.push([x, -y]);
        }
    }
    return points;
}

function oppositePairs(points) {
    const pairs = [];
    const used = new Set();
    const sorted = [...points].sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);
    for (const v of sorted) {
        const vk = encodePoint(v[0], v[1]);
        if (used.has(vk)) continue;
        const w = [-v[0], -v[1]];
        used.add(vk);
        used.add(encodePoint(w[0], w[1]));
        pairs.push([v, w]);
    }
    return pairs;
}

function antipodalPairCount(m) {
    let x = m;
    while (x % 2 === 0) x = Math.floor(x / 2);
    let product = 1;
    let p = 3;
    while (p * p <= x) {
        if (x % p === 0) {
            let exponent = 0;
            while (x % p === 0) { x = Math.floor(x / p); exponent++; }
            if (p % 4 === 1) {
                product *= exponent + 1;
            } else if (exponent & 1) {
                return 0;
            }
        }
        p += 2;
    }
    if (x > 1) {
        if (x % 4 === 1) product *= 2;
        else if (x % 4 === 3) return 0;
    }
    return 2 * product;
}

function displacementSet(points) {
    const deltas = new Set();
    for (const [ax, ay] of points) {
        for (const [bx, by] of points) {
            if (ax !== bx || ay !== by) {
                deltas.add(encodePoint(ax - bx, ay - by));
            }
        }
    }
    return deltas;
}

function passesFourVectorPrune(selected, candidate, deltas) {
    if (selected.length < 3) return true;
    const [vx, vy] = candidate;
    const selectedLen = selected.length;
    for (let i = 0; i < selectedLen - 2; i++) {
        const [ax, ay] = selected[i];
        for (let j = i + 1; j < selectedLen - 1; j++) {
            const [bx, by] = selected[j];
            for (let k = j + 1; k < selectedLen; k++) {
                const [cx, cy] = selected[k];
                for (const sa of [1, -1]) {
                    const x1 = vx + sa * ax;
                    const y1 = vy + sa * ay;
                    for (const sb of [1, -1]) {
                        const x2 = x1 + sb * bx;
                        const y2 = y1 + sb * by;
                        let xv = x2 + cx;
                        let yv = y2 + cy;
                        if ((xv || yv) && deltas.has(encodePoint(xv, yv))) return false;
                        xv = x2 - cx;
                        yv = y2 - cy;
                        if ((xv || yv) && deltas.has(encodePoint(xv, yv))) return false;
                    }
                }
            }
        }
    }
    return true;
}

function evenMasks(k) {
    const masks = [];
    for (let mask = 0; mask < (1 << k); mask++) {
        let bits = 0;
        let mm = mask;
        while (mm) { bits += mm & 1; mm >>= 1; }
        if ((bits & 1) === 0) masks.push(mask);
    }
    return masks;
}

function centersFromVectors(vectors, masks) {
    const centers = [];
    for (const mask of masks) {
        let x = 0, y = 0;
        let mm = mask;
        while (mm) {
            const lsb = mm & -mm;
            const idx = Math.log2(lsb) | 0;
            x += vectors[idx][0];
            y += vectors[idx][1];
            mm -= lsb;
        }
        centers.push([x, y]);
    }
    return centers;
}

function quickHarmonyCountEqualsN(centers, circlePoints, n) {
    const counts = new Map();
    let harmonyCount = 0;
    for (const [cx, cy] of centers) {
        for (const [vx, vy] of circlePoints) {
            const key = encodePoint(cx + vx, cy + vy);
            const cur = counts.get(key);
            if (cur === undefined) {
                counts.set(key, 1);
            } else if (cur === 1) {
                counts.set(key, 2);
                harmonyCount++;
                if (harmonyCount > n) return false;
            } else {
                counts.set(key, cur + 1);
            }
        }
    }
    return harmonyCount === n;
}

function strictPerfectCheck(centers, circlePoints, n) {
    const centerCodes = centers.map(([x, y]) => encodePoint(x, y));
    const centerSet = new Set(centerCodes);
    const tangentDiffs = circlePoints.map(([x, y]) => encodePoint(2 * x, 2 * y));
    for (const c of centerCodes) {
        for (const d of tangentDiffs) {
            const other = c + d;
            if (centerSet.has(other) && c < other) return false;
        }
    }
    const pointToCenters = new Map();
    for (let idx = 0; idx < centers.length; idx++) {
        const [cx, cy] = centers[idx];
        for (const [vx, vy] of circlePoints) {
            const key = encodePoint(cx + vx, cy + vy);
            if (!pointToCenters.has(key)) pointToCenters.set(key, []);
            pointToCenters.get(key).push(idx);
        }
    }
    const harmonyPoints = [];
    for (const [k, v] of pointToCenters) {
        if (v.length >= 2) harmonyPoints.push(k);
    }
    if (harmonyPoints.length !== n) return false;
    const parent = Array.from({length: n}, (_, i) => i);
    const size = new Array(n).fill(1);
    function find(x) {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
    function union(a, b) {
        let ra = find(a), rb = find(b);
        if (ra === rb) return;
        if (size[ra] < size[rb]) { let tmp = ra; ra = rb; rb = tmp; }
        parent[rb] = ra;
        size[ra] += size[rb];
    }
    for (const key of harmonyPoints) {
        const lst = pointToCenters.get(key);
        const base = lst[0];
        for (let j = 1; j < lst.length; j++) union(base, lst[j]);
    }
    const root = find(0);
    for (let i = 1; i < n; i++) {
        if (find(i) !== root) return false;
    }
    return true;
}

function hasUnitCoordinate(points) {
    for (const [x, y] of points) {
        if (Math.abs(x) === 1 || Math.abs(y) === 1) return true;
    }
    return false;
}

function hasValidOrientedVectors(pairs, circlePoints, k, masks, n) {
    const deltas = displacementSet(circlePoints);
    const selected = [];
    function dfs(start) {
        if (selected.length === k) {
            const centers = centersFromVectors(selected, masks);
            return quickHarmonyCountEqualsN(centers, circlePoints, n) &&
                   strictPerfectCheck(centers, circlePoints, n);
        }
        const needed = k - selected.length;
        for (let pairIndex = start; pairIndex <= pairs.length - needed; pairIndex++) {
            const choices = selected.length === 0 ? [pairs[pairIndex][0]] : pairs[pairIndex];
            for (const vector of choices) {
                if (!passesFourVectorPrune(selected, vector, deltas)) continue;
                selected.push(vector);
                if (dfs(pairIndex + 1)) return true;
                selected.pop();
            }
        }
        return false;
    }
    return dfs(0);
}

function findMinRadiusSqForParityFamily(k, mLimit, filtered) {
    const masks = evenMasks(k);
    const n = 1 << (k - 1);
    for (let m = 1; m <= mLimit; m++) {
        const p = antipodalPairCount(m);
        if (p < k) continue;
        if (filtered && p !== k && p !== k + 2) continue;
        const circlePoints = latticePointsOnCircle(m);
        if (filtered && !hasUnitCoordinate(circlePoints)) continue;
        const pairs = oppositePairs(circlePoints);
        if (pairs.length !== p) continue;
        if (hasValidOrientedVectors(pairs, circlePoints, k, masks, n)) return m;
    }
    throw new Error(`No solution found up to m=${mLimit}`);
}

function main() {
    const r1 = findMinRadiusSqForParityFamily(2, 20, false);
    console.assert(r1 === 1, `Expected 1, got ${r1}`);
    const r2 = findMinRadiusSqForParityFamily(3, 50, false);
    console.assert(r2 === 5, `Expected 5, got ${r2}`);
    console.log(findMinRadiusSqForParityFamily(10, 20000, true));
}

main();
