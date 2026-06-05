// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/995.py

const LIMIT: number = 20000;
const PRIME_SEARCH_LIMIT: number = 2000000;

function sieve(n: number): number[] {
    const isPrime = new Uint8Array(n + 1).fill(1);
    if (n >= 0) isPrime[0] = 0;
    if (n >= 1) isPrime[1] = 0;
    const r = Math.floor(Math.sqrt(n));
    for (let i = 2; i <= r; i++) {
        if (isPrime[i]) {
            for (let j = i * i; j <= n; j += i) isPrime[j] = 0;
        }
    }
    const result: number[] = [];
    for (let i = 0; i <= n; i++) if (isPrime[i]) result.push(i);
    return result;
}

const PRIMES: number[] = sieve(PRIME_SEARCH_LIMIT);

function factorN(n: bigint): [bigint, number][] {
    const out: [bigint, number][] = [];
    let t = n;
    for (const p of PRIMES) {
        const pb = BigInt(p);
        if (pb * pb > t) break;
        if (t % pb === 0n) {
            let e = 0;
            while (t % pb === 0n) { t /= pb; e++; }
            out.push([pb, e]);
        }
    }
    if (t > 1n) out.push([t, 1]);
    return out;
}

function divisorsFromFactorization(factors: [bigint, number][]): bigint[] {
    let divs: bigint[] = [1n];
    for (const [p, e] of factors) {
        const old = divs.slice();
        divs = [];
        let power = 1n;
        for (let i = 0; i <= e; i++) {
            for (const d of old) divs.push(d * power);
            power *= p;
        }
    }
    return divs.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let result = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp & 1n) result = result * base % mod;
        exp >>= 1n;
        base = base * base % mod;
    }
    return result;
}

function primitiveRoot(p: bigint, primeFactorsOfPMinus1: bigint[]): bigint {
    if (p === 2n) return 1n;
    const m = p - 1n;
    for (let g = 2n; g < p; g++) {
        let ok = true;
        for (const q of primeFactorsOfPMinus1) {
            if (modPow(g, m / q, p) === 1n) { ok = false; break; }
        }
        if (ok) return g;
    }
    throw new Error("primitive root not found");
}

function discreteLogTable(p: bigint, root: bigint): bigint[] {
    const table: bigint[] = new Array(Number(p)).fill(-1n);
    let x = 1n;
    for (let k = 0n; k < p - 1n; k++) {
        table[Number(x)] = k;
        x = (x * root) % p;
    }
    return table;
}

function gcdBig(a: bigint, b: bigint): bigint {
    while (b !== 0n) { [a, b] = [b, a % b]; }
    return a;
}

const S_CACHE: Map<number, [bigint, number]> = new Map();

function sForPrime(p: number): [bigint, number] {
    if (S_CACHE.has(p)) return S_CACHE.get(p)!;
    if (p === 2) {
        const res: [bigint, number] = [1n, 0.0];
        S_CACHE.set(p, res);
        return res;
    }
    const pu = BigInt(p);
    const m = pu - 1n;
    const factors = factorN(m);
    const divs = divisorsFromFactorization(factors);
    const primeQs = factors.map(([q]) => q);
    const root = primitiveRoot(pu, primeQs);
    const dlog = discreteLogTable(pu, root);

    const neededCCount = divs.length - 1;
    const leastPrimeForC: Map<bigint, number> = new Map();
    for (const q of PRIMES) {
        if (q === p) continue;
        const qu = BigInt(q);
        const idx = Number(qu % pu);
        if (dlog[idx] === -1n) continue;
        const c = gcdBig(dlog[idx], m);
        if (c < m && !leastPrimeForC.has(c)) {
            leastPrimeForC.set(c, q);
            if (leastPrimeForC.size === neededCCount) break;
        }
    }
    if (leastPrimeForC.size !== neededCCount) throw new Error("increase PRIME_SEARCH_LIMIT");

    const cItems: [bigint, number][] = Array.from(leastPrimeForC.entries());

    const bestByM: Map<bigint, Map<bigint, number>> = new Map();
    for (const mm of divs) {
        if (mm === 1n) continue;
        const best: Map<bigint, number> = new Map();
        for (const [c, q] of cItems) {
            const d = gcdBig(c, mm);
            if (d < mm) {
                if (!best.has(d) || q < best.get(d)!) best.set(d, q);
            }
        }
        bestByM.set(mm, best);
    }

    const dpValue: Map<bigint, bigint> = new Map();
    const dpLog: Map<bigint, number> = new Map();
    dpValue.set(1n, 1n);
    dpLog.set(1n, 0.0);

    for (const h of divs) {
        if (!dpValue.has(h)) continue;
        const mm = m / h;
        if (mm === 1n) continue;
        const best = bestByM.get(mm)!;
        const baseValue = dpValue.get(h)!;
        const baseLog = dpLog.get(h)!;
        for (const l of divs) {
            if (l > 1n && mm % l === 0n) {
                const nextH = h * l;
                const dKey = mm / l;
                if (!best.has(dKey)) continue;
                const q = best.get(dKey)!;
                const qu = BigInt(q);
                let candidate = baseValue;
                for (let i = 0n; i < l - 1n; i++) candidate *= qu;
                const candLog = baseLog + Number(l - 1n) * Math.log10(q);
                if (!dpValue.has(nextH) || candidate < dpValue.get(nextH)!) {
                    dpValue.set(nextH, candidate);
                    dpLog.set(nextH, candLog);
                }
            }
        }
    }

    const res: [bigint, number] = [dpValue.get(m)!, dpLog.get(m)!];
    S_CACHE.set(p, res);
    return res;
}

function productT(limit: number): bigint {
    let product = 1n;
    for (const p of PRIMES) {
        if (p >= limit) break;
        product *= sForPrime(p)[0];
    }
    return product;
}

function scientificFromInt(n: bigint, places: number = 5): string {
    const digits = n.toString();
    const exponent = digits.length - 1;
    const significant = places + 1;
    let mantissaDigits: string;
    let finalExp: number;
    if (digits.length > significant) {
        let head = parseInt(digits.slice(0, significant), 10);
        if (parseInt(digits[significant], 10) >= 5) head += 1;
        if (head === Math.pow(10, significant)) {
            head = Math.floor(head / 10);
            finalExp = exponent + 1;
        } else {
            finalExp = exponent;
        }
        mantissaDigits = head.toString().padStart(significant, '0');
    } else {
        const headVal = parseInt(digits, 10);
        const head = headVal * Math.pow(10, significant - digits.length);
        mantissaDigits = head.toString().padStart(significant, '0');
        finalExp = exponent;
    }
    const mantissa = mantissaDigits[0] + '.' + mantissaDigits.slice(1);
    return `${mantissa}e${finalExp}`;
}

function runTests(): void {
    console.assert(sForPrime(2)[0] === 1n, "S(2) failed");
    console.assert(sForPrime(5)[0] === 8n, "S(5) failed");
    console.assert(productT(20) === 1348422598656n, "product_T(20) failed");
    console.assert(scientificFromInt(productT(100)) === "1.37451e123", "scientific_from_int failed");
}

function main(): void {
    runTests();
    console.log(scientificFromInt(productT(LIMIT)));
}

main();