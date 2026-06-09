// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/981.py

const MODVAL: bigint = 888888883n;

function qbinomMinus1Int(n: number, k: number): bigint {
    if ((n & 1) === 0 && (k & 1) === 1) return 0n;
    return bigComb(n >> 1, k >> 1);
}

function bigComb(n: number, k: number): bigint {
    if (k < 0 || k > n) return 0n;
    if (k === 0 || k === n) return 1n;
    let num = 1n;
    let den = 1n;
    const kk = k < n - k ? k : n - k;
    for (let i = 0; i < kk; i++) {
        num = num * BigInt(n - i);
        den = den * BigInt(i + 1);
    }
    return num / den;
}

function bigFactorial(n: number): bigint {
    let result = 1n;
    for (let i = 2; i <= n; i++) result *= BigInt(i);
    return result;
}

function nExact(X: number, Y: number, Z: number): bigint {
    if ((X & 1) !== (Y & 1) || (Y & 1) !== (Z & 1)) return 0n;
    const n = X + Y + Z;
    const total = bigFactorial(n) / (bigFactorial(X) * bigFactorial(Y) * bigFactorial(Z));
    const diff = qbinomMinus1Int(n, X) * qbinomMinus1Int(n - X, Y);
    const sign = (((X >> 1) + (Y >> 1) + (Z >> 1)) & 1) === 0 ? 1n : -1n;
    return (total + sign * diff) / 2n;
}

function modpow(base: bigint, exp: bigint, mod: bigint): bigint {
    let result = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp & 1n) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1n;
    }
    return result;
}

function mainSolve(): number {
    const assert1 = nExact(2, 2, 2);
    if (assert1 !== 42n) throw new Error("Assert 1 failed: " + assert1);
    const assert2 = nExact(8, 8, 8);
    if (assert2 !== 4732773210n) throw new Error("Assert 2 failed: " + assert2);

    const cubes: number[] = [];
    for (let i = 0; i < 88; i++) cubes.push(i * i * i);
    const maxN = 3 * cubes[cubes.length - 1];

    const fact = new Uint32Array(maxN + 1);
    fact[0] = 1;
    for (let i = 1; i <= maxN; i++) {
        fact[i] = Number(BigInt(fact[i - 1]) * BigInt(i) % MODVAL);
    }

    const invfact = new Uint32Array(maxN + 1);
    invfact[maxN] = Number(modpow(BigInt(fact[maxN]), MODVAL - 2n, MODVAL));
    for (let i = maxN; i > 0; i--) {
        invfact[i - 1] = Number(BigInt(invfact[i]) * BigInt(i) % MODVAL);
    }

    const inv2: number = Number((MODVAL + 1n) / 2n);

    const halves: number[] = cubes.map(c => c >> 1);
    const invf: number[] = cubes.map(c => invfact[c]);
    const par: number[] = [];
    for (let i = 0; i < 88; i++) par.push(i & 1);

    function combMod(n: number, k: number): number {
        if (k < 0 || k > n) return 0;
        return Number(BigInt(fact[n]) * BigInt(invfact[k]) % MODVAL * BigInt(invfact[n - k]) % MODVAL);
    }

    let totalSum = 0;
    for (let ai = 0; ai < 88; ai++) {
        const X = cubes[ai];
        const hx = halves[ai];
        const invX = invf[ai];
        const px = par[ai];
        for (let bj = 0; bj < 88; bj++) {
            const Y = cubes[bj];
            const hy = halves[bj];
            const invY = invf[bj];
            const py = par[bj];
            for (let ck = 0; ck < 88; ck++) {
                if (px !== py || py !== par[ck]) continue;
                const Z = cubes[ck];
                const hz = halves[ck];
                const invZ = invf[ck];
                const n = X + Y + Z;
                let T = fact[n];
                T = Number(BigInt(T) * BigInt(invX) % MODVAL);
                T = Number(BigInt(T) * BigInt(invY) % MODVAL);
                T = Number(BigInt(T) * BigInt(invZ) % MODVAL);
                let D: number;
                if ((n & 1) === 0 && (X & 1) === 1) {
                    D = 0;
                } else {
                    const D1 = combMod(n >> 1, hx);
                    const n2 = n - X;
                    if ((n2 & 1) === 0 && (Y & 1) === 1) {
                        D = 0;
                    } else {
                        const D2 = combMod(n2 >> 1, hy);
                        D = Number(BigInt(D1) * BigInt(D2) % MODVAL);
                    }
                }
                let Nmod: number;
                if (((hx + hy + hz) & 1) === 0) {
                    Nmod = (T + D) % Number(MODVAL);
                } else {
                    Nmod = ((T - D) % Number(MODVAL) + Number(MODVAL)) % Number(MODVAL);
                }
                Nmod = Number(BigInt(Nmod) * BigInt(inv2) % MODVAL);
                totalSum += Nmod;
                if (totalSum >= Number(MODVAL)) totalSum -= Number(MODVAL);
            }
        }
    }
    return totalSum % Number(MODVAL);
}

console.log(mainSolve().toString());
