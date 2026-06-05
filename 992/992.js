// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/992.py

const MOD = 987_898_789n;

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

function buildCombinatorics(limit, mod) {
    const fact = new Array(limit + 1).fill(0n);
    fact[0] = 1n;
    for (let i = 1; i <= limit; i++) {
        fact[i] = fact[i - 1] * BigInt(i) % mod;
    }
    const invFact = new Array(limit + 1).fill(0n);
    invFact[limit] = modPow(fact[limit], mod - 2n, mod);
    for (let i = limit; i >= 1; i--) {
        invFact[i - 1] = invFact[i] * BigInt(i) % mod;
    }
    return [fact, invFact];
}

class Comb {
    constructor(limit, mod) {
        this.mod = mod;
        [this.fact, this.invFact] = buildCombinatorics(limit, mod);
    }
    call(n, r) {
        if (r < 0n || r > n) return 0n;
        return this.fact[Number(n)] * this.invFact[Number(r)] % this.mod * this.invFact[Number(n - r)] % this.mod;
    }
}

function endpointCount(n, k, end, comb, mod) {
    if (n === 0) return 1n;
    const right = new Array(n).fill(0n);
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

function journeyCount(n, k, comb, mod) {
    let total = 0n;
    for (let end = 0; end <= n; end++) {
        total = (total + endpointCount(n, k, end, comb, mod)) % mod;
    }
    return total;
}

function solve() {
    const n = 500;
    const ks = [1n, 10n, 100n, 1000n, 10000n];
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
