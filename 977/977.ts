// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/977.py

const MODVAL: bigint = 1_000_000_007n;

function modpow(base: bigint, exp: bigint, mod: bigint): bigint {
    let result = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) {
            result = (result * base) % mod;
        }
        exp = exp / 2n;
        base = (base * base) % mod;
    }
    return result;
}

function computeMod(n: number): bigint {
    const N = BigInt(n);
    if (N === 1n) return 1n;
    let total = 0n;
    const mVal = N - 2n;
    const sumQ = mVal * (mVal + 1n) * (2n * mVal + 1n) / 6n + mVal * (mVal + 1n) / 2n;
    total = (sumQ + N) % MODVAL;
    for (let L = 2n; L <= N; L++) {
        const R = N - L;
        if (R >= 1n) {
            const qFull = (R - 1n) / L;
            const maxA = qFull + 2n;
            const powA: bigint[] = new Array(Number(maxA) + 1).fill(0n);
            if (L === 2n) {
                for (let a = 1n; a <= maxA; a++) {
                    powA[Number(a)] = (a * a) % MODVAL;
                }
            } else if (L === 3n) {
                for (let a = 1n; a <= maxA; a++) {
                    const aa = (a * a) % MODVAL;
                    powA[Number(a)] = (aa * a) % MODVAL;
                }
            } else {
                for (let a = 1n; a <= maxA; a++) {
                    powA[Number(a)] = modpow(a, L, MODVAL);
                }
            }
            for (let q = 0n; q < qFull; q++) {
                const A = q + 1n;
                const B = q + 2n;
                const AL = powA[Number(A)];
                const BL = powA[Number(B)];
                const AL1 = (AL * A) % MODVAL;
                const term = ((q * AL + (A * A % MODVAL) * BL - B * AL1) % MODVAL + MODVAL) % MODVAL;
                total = (total + term) % MODVAL;
            }
            {
                const q = qFull;
                const mInner = (R - 1n) - qFull * L;
                const A = q + 1n;
                const B = q + 2n;
                const AL = powA[Number(A)];
                let term = (q * AL) % MODVAL;
                if (mInner >= 1n) {
                    const AL1 = (AL * A) % MODVAL;
                    const expVal = L + 1n - mInner;
                    let AL1m: bigint;
                    if (expVal === 1n) {
                        AL1m = A % MODVAL;
                    } else if (expVal === 2n) {
                        AL1m = (A * A) % MODVAL;
                    } else if (expVal === 3n) {
                        AL1m = ((A * A) % MODVAL * A) % MODVAL;
                    } else {
                        AL1m = modpow(A, expVal, MODVAL);
                    }
                    let Bm: bigint;
                    if (mInner === 1n) {
                        Bm = B % MODVAL;
                    } else if (mInner === 2n) {
                        Bm = (B * B) % MODVAL;
                    } else if (mInner === 3n) {
                        Bm = ((B * B) % MODVAL * B) % MODVAL;
                    } else {
                        Bm = modpow(B, mInner, MODVAL);
                    }
                    term = (term + B * (((AL1m * Bm - AL1) % MODVAL + MODVAL) % MODVAL)) % MODVAL;
                }
                total = (total + term) % MODVAL;
            }
        }
        const q = R / L;
        const r = R - q * L;
        const A = q + 1n;
        const B = q + 2n;
        let base: bigint;
        if (r === 0n) {
            base = modpow(A, L, MODVAL);
        } else {
            base = (modpow(A, L - r, MODVAL) * modpow(B, r, MODVAL)) % MODVAL;
        }
        total = (total + base) % MODVAL;
    }
    return total % MODVAL;
}

function computeExact(n: number): bigint {
    const N = BigInt(n);
    if (N === 1n) return 1n;
    let total = 0n;
    const mVal = N - 2n;
    const sumQ = mVal * (mVal + 1n) * (2n * mVal + 1n) / 6n + mVal * (mVal + 1n) / 2n;
    total = sumQ + N;
    for (let L = 2n; L <= N; L++) {
        const R = N - L;
        if (R >= 1n) {
            const qFull = (R - 1n) / L;
            const maxA = qFull + 2n;
            const powA: bigint[] = new Array(Number(maxA) + 1).fill(0n);
            for (let a = 1n; a <= maxA; a++) {
                powA[Number(a)] = a ** L;
            }
            for (let q = 0n; q < qFull; q++) {
                const A = q + 1n;
                const B = q + 2n;
                const AL = powA[Number(A)];
                const BL = powA[Number(B)];
                const term = q * AL + (A * A) * BL - B * (AL * A);
                total += term;
            }
            {
                const q = qFull;
                const mInner = (R - 1n) - qFull * L;
                const A = q + 1n;
                const B = q + 2n;
                const AL = powA[Number(A)];
                let term = q * AL;
                if (mInner >= 1n) {
                    const AL1 = AL * A;
                    const AL1m = A ** (L + 1n - mInner);
                    const Bm = B ** mInner;
                    term += B * (AL1m * Bm - AL1);
                }
                total += term;
            }
        }
        const q = R / L;
        const r = R - q * L;
        const A = q + 1n;
        const B = q + 2n;
        const base = A ** (L - r) * B ** r;
        total += base;
    }
    return total;
}

function main(): void {
    if (computeExact(3) !== 8n) throw new Error("assert failed: computeExact(3)");
    if (computeExact(7) !== 174n) throw new Error("assert failed: computeExact(7)");
    if (computeExact(100) !== 570271270297640131n) throw new Error("assert failed: computeExact(100)");
    const n = 1_000_000;
    console.log(computeMod(n).toString());
}

main();
