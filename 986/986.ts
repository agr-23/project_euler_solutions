// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/986.py

const LIMIT: number = 160;
const PREDICT_START_N: number = 33;
const SEARCH_WINDOW: number = 4096;

const EXCEPTION_H: Map<number, number> = new Map([
    [2, 3], [3, 5], [4, 7], [5, 11], [6, 13], [8, 21], [10, 31]
]);

function extinctForK1(n: number, k: number): boolean {
    if (k === 0) return true;
    const size = n + 1;
    const last = size - 1;
    const cells: number[] = new Array(size).fill(0);
    cells[last] = k;
    let zeroCount = last;
    while (true) {
        for (let i = 0; i < last; i++) {
            const old = cells[i];
            const nxt = (old + cells[i + 1]) >> 1;
            cells[i] = nxt;
            if (old !== 0) { if (nxt === 0) zeroCount++; }
            else if (nxt !== 0) zeroCount--;
        }
        const old = cells[last];
        const nxt = (old + cells[0]) >> 1;
        cells[last] = nxt;
        if (old !== 0) { if (nxt === 0) zeroCount++; }
        else if (nxt !== 0) zeroCount--;
        if (zeroCount === size) return true;
        if (zeroCount === 0) return false;
    }
}

function thresholdK1Plain(n: number): number {
    let lo = 0, hi = 1;
    while (extinctForK1(n, hi)) { lo = hi; hi *= 2; }
    while (lo + 1 < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (extinctForK1(n, mid)) lo = mid; else hi = mid;
    }
    return lo;
}

function predictK1FromPrevious(s: number[], n: number): number {
    const a = s[n - 32], b = s[n - 24], c = s[n - 16], d = s[n - 8];
    return d + (d - c) + (d - 2 * c + b) + (d - 3 * c + 3 * b - a);
}

function thresholdK1WithGuess(n: number, guess: number): number {
    let lo = Math.max(0, guess - SEARCH_WINDOW);
    let hi = guess + SEARCH_WINDOW;
    while (lo > 0 && !extinctForK1(n, lo)) { hi = lo; lo = Math.floor(lo / 2); }
    while (extinctForK1(n, hi)) { lo = hi; hi *= 2; }
    while (lo + 1 < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (extinctForK1(n, mid)) lo = mid; else hi = mid;
    }
    return lo;
}

function buildSSequence(maxN: number): number[] {
    const s: number[] = new Array(maxN + 1).fill(0);
    for (let n = 1; n <= maxN; n++) {
        if (n < PREDICT_START_N) s[n] = thresholdK1Plain(n);
        else { const guess = predictK1FromPrevious(s, n); s[n] = thresholdK1WithGuess(n, guess); }
    }
    return s;
}

function hReduced(c: number, d: number, s: number[]): number {
    if (d === 1 && EXCEPTION_H.has(c)) return EXCEPTION_H.get(c)!;
    return s[d + Math.floor((c - 1) / 2)];
}

function gValueFunc(c: number, d: number, s: number[]): number {
    const g = gcd(c, d);
    const cr = Math.floor(c / g), dr = Math.floor(d / g);
    const h = hReduced(cr, dr, s);
    return 2 * h + 1;
}

function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

function solve(limit: number): number {
    const maxN = limit + Math.floor((limit - 1) / 2);
    const s = buildSSequence(maxN);
    console.assert(gValueFunc(2, 1, s) === 7);
    console.assert(gValueFunc(1, 2, s) === 7);
    console.assert(gValueFunc(3, 1, s) === 11);
    console.assert(gValueFunc(2, 2, s) === 3);
    console.assert(gValueFunc(1, 3, s) === 15);
    const memo: Map<string, number> = new Map();
    let total = 0;
    for (let c = 1; c <= limit; c++) {
        for (let d = 1; d <= limit; d++) {
            const g = gcd(c, d);
            const key = `${Math.floor(c / g)},${Math.floor(d / g)}`;
            let val = memo.get(key);
            if (val === undefined) {
                const cr = Math.floor(c / g), dr = Math.floor(d / g);
                val = 2 * hReduced(cr, dr, s) + 1;
                memo.set(key, val);
            }
            total += val;
        }
    }
    return total;
}

console.log(solve(LIMIT));
