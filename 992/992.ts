// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/992.py

const MOD: bigint = 987_898_789n;

function modPow(base: bigint, exp: bigint, modulus: bigint): bigint {
    let result = 1n;
    base = base % modulus;
    while (exp > 0n) {
        if (exp & 1n) result = result * base % modulus;
        exp >>= 1n;
        base = base * base % modulus;
    }
    return result;
}

function buildCombinatorics(limit: number, mod: bigint): [bigint[], bigint[]] {
    const fact: bigint[] = new Array(limit + 1).fill(0n);
    fact[0] = 1n;
    for (let i = 1; i <= limit; i++) {
        fact[i] = fact[i - 1] * BigInt(i) % mod;
    }
    const invFact: bigint[] = new Array(limit + 1).fill(0n);
    invFact[limit] = modPow(fact[limit], mod - 2n, mod);
    for (let i = limit; i >= 1; i--) {
        invFact[i - 1] = invFact[i] * BigInt(i) % mod;
    }
    return [fact, invFact];
}

class Comb {
    mod: bigint;
    fact: bigint[];
    invFact: bigint[];

    constructor(limit: number, mod: bigint) {
        this.mod = mod;
        [this.fact, this.invFact] = buildCombinatorics(limit, mod);
    }

    call(n: bigint, r: bigint): bigint {
        if (r < 0n || r > n) return 0n;
        return this.fact[Number(n)] * this.invFact[Number(r)] % this.mod * this.invFact[Number(n - r)] % this.mod;
    }
}

function endpointCount(n: number, k: bigint, end: number, comb: Comb, mod: bigint): bigint {
    if (n === 0) return 1n;
    const right: bigint[] = new Array(n).fill(0n);
    right[0] = k - (end === 0 ? 1n : 0n);
    if (n >= 2) {
        right[1] = 2n - (end === 1 ? 1n : 0n);
    }
    for (let i = 2; i < n; i++) {
        right[i] = 1n + right[i - 2] - (end === i ? 1n : 0n);
    }
    let ways = 1n;
    for (let v = 1; v < n; v++) {
        const outDegree = k + BigInt(v) - (end === v ? 1n : 0n);
        if (v < end) {
            ways = ways * comb.call(outDegree - 1n, right[v] - 1n) % mod;
        } else if (v === end) {
            ways = ways * comb.call(outDegree, right[v]) % mod;
        } else {
            ways = ways * comb.call(outDegree - 1n, right[v]) % mod;
        }
    }
    return ways;
}

function journeyCount(n: number, k: bigint, comb: Comb, mod: bigint): bigint {
    let total = 0n;
    for (let end = 0; end <= n; end++) {
        total = (total + endpointCount(n, k, end, comb, mod)) % mod;
    }
    return total;
}

function solve(): bigint {
    const n = 500;
    const ks: bigint[] = [1n, 10n, 100n, 1000n, 10000n];
    const maxK = ks.reduce((a, b) => a > b ? a : b);
    const comb = new Comb(Number(maxK) + n, MOD);
    console.assert(journeyCount(3, 2n, comb, MOD) === 17n, "Test 1 failed");
    console.assert(journeyCount(6, 1n, comb, MOD) === 1320n, "Test 2 failed");
    console.assert(journeyCount(6, 5n, comb, MOD) === 16_793_280n, "Test 3 failed");
    let answer = 0n;
    for (const k of ks) {
        answer = (answer + journeyCount(n, k, comb, MOD)) % MOD;
    }
    return answer;
}

console.log(solve().toString());
