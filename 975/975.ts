// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/975.py

function primesUpTo(n: number): number[] {
    const sieve = new Uint8Array(n + 1).fill(1);
    if (n >= 0) {
        sieve[0] = 0;
        if (n >= 1) sieve[1] = 0;
    }
    const r = Math.floor(Math.sqrt(n));
    for (let p = 2; p <= r; p++) {
        if (sieve[p]) {
            for (let j = p * p; j <= n; j += p) {
                sieve[j] = 0;
            }
        }
    }
    const result: number[] = [];
    for (let i = 0; i <= n; i++) {
        if (sieve[i]) result.push(i);
    }
    return result;
}

function gcd(a: number, b: number): number {
    while (b) { [a, b] = [b, a % b]; }
    return a;
}

function normalized(num: number, den: number): [number, number] {
    const common = gcd(Math.abs(num), Math.abs(den));
    return [Math.floor(num / common), Math.floor(den / common)];
}

function height(a: number, b: number, point: [number, number]): number {
    const [num, den] = point;
    if (num === 0) return 0.0;
    if (num === den) return 1.0;
    const x = num / den;
    let z = 0.5 - (b * Math.cos(a * Math.PI * x) + a * Math.cos(b * Math.PI * x)) / (2.0 * (a + b));
    if (z < 0.0 && z > -1e-14) return 0.0;
    if (z > 1.0 && z < 1.0 + 1e-14) return 1.0;
    return z;
}

function derivativeIntervalSign(a: number, b: number, left: [number, number], right: [number, number]): number {
    const [leftNum, leftDen] = left;
    const [rightNum, rightDen] = right;
    const x = (leftNum * rightDen + rightNum * leftDen) / (2.0 * leftDen * rightDen);
    const value = Math.sin((a + b) * Math.PI * x * 0.5) * Math.cos(Math.abs(a - b) * Math.PI * x * 0.5);
    return value > 0.0 ? 1 : -1;
}

const turningValuesCache = new Map<string, number[]>();

function turningValues(a: number, b: number): number[] {
    const key = `${a},${b}`;
    if (turningValuesCache.has(key)) return turningValuesCache.get(key)!;

    if (a <= 0 || b <= 0 || (a & 1) === 0 || (b & 1) === 0) {
        throw new Error("a,b must be positive odd integers");
    }
    if (a === b) throw new Error("a != b required");
    const s = a + b;
    const delta = Math.abs(a - b);
    if (s % 2 !== 0 || delta % 2 !== 0) {
        throw new Error("For odd a,b, a+b and |a-b| must be even");
    }

    const candidates: [number, number][] = [];
    for (let k = 0; k <= Math.floor(s / 2); k++) {
        candidates.push(normalized(2 * k, s));
    }
    for (let k = 0; k < Math.floor(delta / 2); k++) {
        candidates.push(normalized(2 * k + 1, delta));
    }

    const pointSet = new Map<string, [number, number]>();
    for (const [num, den] of candidates) {
        const key2 = `${num},${den}`;
        if (!pointSet.has(key2)) pointSet.set(key2, [num, den]);
    }
    const points = Array.from(pointSet.values()).sort((pa, pb) => (pa[0] / pa[1]) - (pb[0] / pb[1]));

    const intervalSigns: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
        intervalSigns.push(derivativeIntervalSign(a, b, points[i], points[i + 1]));
    }

    const kept: [number, number][] = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
        if (intervalSigns[i - 1] !== intervalSigns[i]) {
            kept.push(points[i]);
        }
    }
    kept.push(points[points.length - 1]);

    const result = kept.map(point => height(a, b, point));
    turningValuesCache.set(key, result);
    return result;
}

function computeF(a: number, b: number, c: number, d: number): number {
    const za = turningValues(a, b);
    const zb = turningValues(c, d);
    let i = 0;
    let j = 0;
    let current = 0.0;
    let total = 0.0;
    let upward = true;
    const eps = 1e-12;
    const maxSteps = 4 * (za.length + zb.length) * (za.length + zb.length);

    for (let step = 0; step < maxSteps; step++) {
        if (i < 0 || i >= za.length - 1 || j < 0 || j >= zb.length - 1) {
            if (Math.abs(current - 1.0) < 1e-9) return total;
            throw new Error("Winding walk left the valid segment range");
        }
        const a0 = za[i], a1 = za[i + 1];
        const b0 = zb[j], b1 = zb[j + 1];
        const lower = Math.max(Math.min(a0, a1), Math.min(b0, b1));
        const upper = Math.min(Math.max(a0, a1), Math.max(b0, b1));
        const nxt = upward ? upper : lower;
        total += Math.abs(nxt - current);
        let advanced = false;
        if (Math.abs(nxt - a0) <= eps) {
            i -= 1;
            advanced = true;
        } else if (Math.abs(nxt - a1) <= eps) {
            i += 1;
            advanced = true;
        }
        if (Math.abs(nxt - b0) <= eps) {
            j -= 1;
            advanced = true;
        } else if (Math.abs(nxt - b1) <= eps) {
            j += 1;
            advanced = true;
        }
        if (!advanced) throw new Error("Winding walk did not hit a segment endpoint");
        current = nxt;
        upward = !upward;
    }
    throw new Error("Exceeded maximum winding-walk steps");
}

function computeG(m: number, n: number): number {
    const ps = primesUpTo(n).filter(p => p >= m);
    let total = 0.0;
    for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        for (let k = i + 1; k < ps.length; k++) {
            const q = ps[k];
            total += computeF(p, q, p, 2 * q - p);
        }
    }
    return total;
}

if (Math.abs(computeF(3, 5, 3, 7) - 7.01772) >= 1e-5) throw new Error("Assert F(3,5,3,7) failed");
if (Math.abs(computeF(7, 17, 9, 19) - 26.79578) >= 1e-5) throw new Error("Assert F(7,17,9,19) failed");
if (Math.abs(computeG(3, 20) - 463.80866) >= 1e-5) throw new Error("Assert G(3,20) failed");

const ans = computeG(500, 1000);
console.log(ans.toFixed(5));
