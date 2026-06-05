// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/998.py

function gcd(a, b) {
    while (b !== 0n) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function isqrt(n) {
    if (n < 0n) throw new Error("isqrt of negative");
    if (n === 0n) return 0n;
    let x = BigInt(Math.floor(Math.sqrt(Number(n))));
    while (x * x > n) x -= 1n;
    while ((x + 1n) * (x + 1n) <= n) x += 1n;
    return x;
}

function pythagoreanPartners(limit) {
    const lim = BigInt(limit);
    const partners = Array.from({ length: limit + 1 }, () => []);
    const rMax = isqrt(2n * lim) + 3n;
    for (let r = 2n; r <= rMax; r++) {
        const rr = r * r;
        for (let s = 1n; s < r; s++) {
            if (((r - s) & 1n) === 0n || gcd(r, s) !== 1n) continue;
            const a = rr - s * s;
            const b = 2n * r * s;
            const m = a > b ? a : b;
            const x = a > b ? b : a;
            if (m > lim) continue;
            for (let km = m; km <= lim; km += m) {
                partners[Number(km)].push((km / m) * x);
            }
        }
    }
    for (const row of partners) {
        row.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    }
    return partners;
}

function isMinimumSquare(sides, twiceArea, squareSide) {
    const ss = sides;
    const m = squareSide;
    const m2 = m * m;
    const dArea = twiceArea;
    let hasEqualCandidate = false;

    for (let i = 0; i < 3; i++) {
        const d = ss[i];
        const e = ss[(i + 1) % 3];
        const f = ss[(i + 2) % 3];
        const den = 2n * d;
        const tNum = d * d + e * e - f * f;
        const dNum = d * den;
        const arr = [0n, dNum, tNum];
        const spanMax = arr.reduce((a, b) => (a > b ? a : b));
        const spanMin = arr.reduce((a, b) => (a < b ? a : b));
        const widthNum = spanMax - spanMin;
        const widthCmp = widthNum - m * den;
        const heightCmp = dArea - m * d;
        if (widthCmp < 0n && heightCmp < 0n) return false;
        if (widthCmp <= 0n && heightCmp <= 0n && (widthCmp === 0n || heightCmp === 0n)) {
            hasEqualCandidate = true;
        }
    }

    for (let i = 0; i < 3; i++) {
        const r = ss[i];
        const p = ss[(i + 1) % 3];
        const q = ss[(i + 2) % 3];
        const kNum = p * p + q * q - r * r;
        if (kNum <= 0n) continue;
        const rDenPart = p * p + q * q - 2n * dArea;
        if (rDenPart <= 0n) continue;
        const num = kNum * kNum;
        const den = 4n * rDenPart;
        const p2 = p * p;
        const q2 = q * q;
        if (num < dArea * den) continue;
        if (num > p2 * den || num > q2 * den) continue;
        if (p2 * den > 2n * num || q2 * den > 2n * num) continue;
        const target = m2 * den;
        if (num < target) return false;
        if (num === target) hasEqualCandidate = true;
    }

    return hasEqualCandidate;
}

function solve(limit) {
    const lim = BigInt(limit);
    const partners = pythagoreanPartners(limit);
    const seen = new Set();
    let total = 0n;

    for (let mNum = 1; mNum <= limit; mNum++) {
        const m = BigInt(mNum);
        const mm = m * m;
        const row = [[0n, m]];
        for (const x of partners[mNum]) {
            row.push([x, isqrt(mm + x * x)]);
        }
        const rowLen = row.length;

        for (let i = 0; i < rowLen; i++) {
            const [x, hx] = row[i];
            for (let j = i; j < rowLen; j++) {
                const [y, hy] = row[j];
                const base = x + y;
                if (base === 0n) continue;
                if (base > m) break;
                if (x * y < m * (m - base)) continue;
                const arr = [base, hx, hy].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
                const key = arr.join(",");
                if (!seen.has(key)) {
                    seen.add(key);
                    total += arr[0] + arr[1] + arr[2];
                }
            }
        }

        for (let i = 0; i < rowLen; i++) {
            const [u, hu] = row[i];
            for (let j = i; j < rowLen; j++) {
                const [v, hv] = row[j];
                const twiceArea = mm - u * v;
                if (twiceArea <= 0n) continue;
                const p = m - u;
                const q = m - v;
                const third2 = p * p + q * q;
                const third = isqrt(third2);
                if (third * third !== third2 || third === 0n) continue;
                const arr = [third, hu, hv].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
                const key = arr.join(",");
                if (seen.has(key)) continue;
                if (isMinimumSquare(arr, twiceArea, m)) {
                    seen.add(key);
                    total += arr[0] + arr[1] + arr[2];
                }
            }
        }
    }

    return total;
}

console.assert(solve(40) === 346n);
console.assert(solve(400) === 76402n);
console.assert(solve(2000) === 3237036n);
console.log(solve(1000000).toString());