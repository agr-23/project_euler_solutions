// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/994.py

const MOD = 1_000_000_007n;
const INV2 = (MOD + 1n) / 2n;

function modPow(base, exp, modulus) {
    let result = 1n;
    base = base % modulus;
    while (exp > 0n) {
        if (exp & 1n) result = result * base % modulus;
        exp >>= 1n;
        base = base * base % modulus;
    }
    return result;
}

const INV6 = modPow(6n, MOD - 2n, MOD);

function c2Mod(x) {
    x = ((x % MOD) + MOD) % MOD;
    return x * ((x - 1n + MOD) % MOD) % MOD * INV2 % MOD;
}

function c3Mod(x) {
    x = ((x % MOD) + MOD) % MOD;
    return x * ((x - 1n + MOD) % MOD) % MOD * ((x - 2n + MOD) % MOD) % MOD * INV6 % MOD;
}

function p1(n) {
    n = ((n % MOD) + MOD) % MOD;
    return n * ((n + 1n) % MOD) % MOD * INV2 % MOD;
}

function p2(n) {
    n = ((n % MOD) + MOD) % MOD;
    return n * ((n + 1n) % MOD) % MOD * ((2n * n + 1n) % MOD) % MOD * INV6 % MOD;
}

function p3(n) {
    const s = p1(n);
    return s * s % MOD;
}

class TotientPrefix {
    constructor(limit) {
        this.limit = limit;
        this.cache = new Map();
        const [pref0, pref1, pref2] = TotientPrefix._build(limit);
        this.pref0 = pref0;
        this.pref1 = pref1;
        this.pref2 = pref2;
    }

    static _build(limit) {
        const phi = new Uint32Array(limit + 1);
        for (let i = 0; i <= limit; i++) phi[i] = i;
        for (let p = 2; p <= limit; p++) {
            if (phi[p] === p) {
                for (let j = p; j <= limit; j += p) {
                    phi[j] -= Math.floor(phi[j] / p);
                }
            }
        }
        const pref0 = new Uint32Array(limit + 1);
        const pref1 = new Uint32Array(limit + 1);
        const pref2 = new Uint32Array(limit + 1);
        let s0 = 0n, s1 = 0n, s2 = 0n;
        for (let i = 1; i <= limit; i++) {
            const ph = BigInt(phi[i]);
            const im = BigInt(i) % MOD;
            s0 = (s0 + ph) % MOD;
            s1 = (s1 + im * ph) % MOD;
            s2 = (s2 + im * im % MOD * ph) % MOD;
            pref0[i] = Number(s0);
            pref1[i] = Number(s1);
            pref2[i] = Number(s2);
        }
        return [pref0, pref1, pref2];
    }

    values(n) {
        n = BigInt(n);
        if (n <= 0n) return [0n, 0n, 0n];
        if (n <= BigInt(this.limit)) {
            const ni = Number(n);
            return [BigInt(this.pref0[ni]), BigInt(this.pref1[ni]), BigInt(this.pref2[ni])];
        }
        if (this.cache.has(n)) return this.cache.get(n);
        let f0 = p1(n);
        let f1 = p2(n);
        let f2 = p3(n);
        let l = 2n;
        while (l <= n) {
            const q = n / l;
            const r = n / q;
            const sum0 = ((r - l + 1n) % MOD + MOD) % MOD;
            const sum1 = (p1(r) - p1(l - 1n) + MOD) % MOD;
            const sum2 = (p2(r) - p2(l - 1n) + MOD) % MOD;
            const [sub0, sub1, sub2] = this.values(q);
            f0 = (f0 - sum0 * sub0 % MOD + MOD) % MOD;
            f1 = (f1 - sum1 * sub1 % MOD + MOD) % MOD;
            f2 = (f2 - sum2 * sub2 % MOD + MOD) % MOD;
            l = r + 1n;
        }
        const out = [f0, f1, f2];
        this.cache.set(n, out);
        return out;
    }
}

function nonconcurrentCandidateCount(m, n) {
    m = BigInt(m); n = BigInt(n);
    const mm = ((m % MOD) + MOD) % MOD;
    const mm1 = ((m - 1n) % MOD + MOD) % MOD;
    const nm = ((n % MOD) + MOD) % MOD;
    const nm1 = ((n - 1n) % MOD + MOD) % MOD;
    const np1 = ((n + 1n) % MOD + MOD) % MOD;
    const twoSameBottom = mm * mm1 % MOD * nm % MOD * nm1 % MOD * np1 % MOD * INV6 % MOD;
    const distinctBottoms = c3Mod(m) * ((c3Mod(n + 2n) - nm + MOD) % MOD) % MOD;
    return (twoSameBottom + distinctBottoms) % MOD;
}

function weightedGcdSum(m, n, tp) {
    m = BigInt(m); n = BigInt(n);
    const m1 = m - 1n;
    const n1 = n - 1n;
    const upper = m1 < n1 ? m1 : n1;
    let total = 0n;
    let l = 1n;
    while (l <= upper) {
        const qm = m1 / l;
        const qn = n1 / l;
        let r = m1 / qm;
        if (n1 / qn < r) r = n1 / qn;
        if (upper < r) r = upper;
        const [r0, r1, r2] = tp.values(r);
        const [l0, l1, l2] = tp.values(l - 1n);
        const s0 = (r0 - l0 + MOD) % MOD;
        const s1 = (r1 - l1 + MOD) % MOD;
        const s2 = (r2 - l2 + MOD) % MOD;
        const qmMod = qm % MOD;
        const qnMod = qn % MOD;
        const mm = m % MOD;
        const nm = n % MOD;
        const a0m = qmMod * mm % MOD;
        const a1m = (MOD - qmMod * ((qm + 1n) % MOD) % MOD * INV2 % MOD) % MOD;
        const a0n = qnMod * nm % MOD;
        const a1n = (MOD - qnMod * ((qn + 1n) % MOD) % MOD * INV2 % MOD) % MOD;
        const c0 = a0m * a0n % MOD;
        const c1 = (a0m * a1n + a1m * a0n) % MOD;
        const c2 = a1m * a1n % MOD;
        total = (total + c0 * s0 % MOD + c1 * s1 % MOD + c2 * s2 % MOD) % MOD;
        l = r + 1n;
    }
    return total;
}

function concurrentTripleCount(m, n, tp) {
    const gcdPart = weightedGcdSum(m, n, tp);
    const ep = c2Mod(BigInt(m)) * c2Mod(BigInt(n)) % MOD;
    return (gcdPart - ep + MOD) % MOD;
}

function tFunc(m, n, tp) {
    const ncc = nonconcurrentCandidateCount(m, n);
    const ctc = concurrentTripleCount(m, n, tp);
    return (ncc - ctc + MOD) % MOD;
}

function main() {
    const sieveLimitStr = (typeof process !== 'undefined' && process.env && process.env.SIEVE_LIMIT) ? process.env.SIEVE_LIMIT : "10000000";
    const sieveLimit = parseInt(sieveLimitStr, 10);
    const tp = new TotientPrefix(sieveLimit);
    console.assert(tFunc(2, 3, tp) === 8n, "T(2,3) failed");
    console.assert(tFunc(3, 5, tp) === 146n, "T(3,5) failed");
    console.assert(tFunc(12, 23, tp) === 756716n, "T(12,23) failed");
    console.log(tFunc(1234n * 10n**8n, 2345n * 10n**8n, tp).toString());
}

main();
