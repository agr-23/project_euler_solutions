// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/990.py

const MOD: bigint = 1_000_000_007n;
const MAX_N: number = 50;
const MAX_TERMS: number = Math.floor((MAX_N + 1) / 2);
const MAX_CARRY: number = 25;
const CARRY_MIN: number = -MAX_CARRY;
const CARRY_MAX: number = MAX_CARRY;

function buildBinom(limit: number): bigint[][] {
    const comb: bigint[][] = Array.from({ length: limit + 1 }, () => new Array(limit + 1).fill(0n));
    for (let n = 0; n <= limit; n++) {
        comb[n][0] = 1n;
        comb[n][n] = 1n;
        for (let k = 1; k < n; k++) {
            comb[n][k] = (comb[n - 1][k - 1] + comb[n - 1][k]) % MOD;
        }
    }
    return comb;
}

function convolveSmall(poly: bigint[], width: number): bigint[] {
    const out: bigint[] = new Array(poly.length + width - 1).fill(0n);
    for (let i = 0; i < poly.length; i++) {
        if (poly[i] === 0n) continue;
        for (let digit = 0; digit < width; digit++) {
            out[i + digit] = (out[i + digit] + poly[i]) % MOD;
        }
    }
    return out;
}

function buildSumTables(limit: number): bigint[][][] {
    const ways0to9: bigint[][] = new Array(limit + 1);
    ways0to9[0] = [1n];
    for (let p = 1; p <= limit; p++) {
        ways0to9[p] = convolveSmall(ways0to9[p - 1], 10);
    }
    const tables: bigint[][][] = Array.from({ length: limit + 1 }, () => new Array(limit + 1));
    for (let p = 0; p <= limit; p++) {
        tables[p][0] = ways0to9[p];
        for (let q = 1; q <= limit; q++) {
            tables[p][q] = convolveSmall(tables[p][q - 1], 9);
        }
    }
    return tables;
}

const BINOM: bigint[][] = buildBinom(MAX_TERMS);
const SUM_TABLES: bigint[][][] = buildSumTables(2 * MAX_TERMS);
const transCache: Map<string, [number, number, number, bigint][]> = new Map();

function getTransitions(activeLeft: number, activeRight: number, carry: number): [number, number, number, bigint][] {
    const key = `${activeLeft},${activeRight},${carry}`;
    if (transCache.has(key)) return transCache.get(key)!;
    if (activeLeft === 0 && activeRight === 0) {
        transCache.set(key, []);
        return [];
    }
    const result: [number, number, number, bigint][] = [];
    for (let nextLeft = 0; nextLeft <= activeLeft; nextLeft++) {
        const chooseLeft = BINOM[activeLeft][nextLeft];
        const endingLeft = activeLeft - nextLeft;
        for (let nextRight = 0; nextRight <= activeRight; nextRight++) {
            const chooseTerms = (chooseLeft * BINOM[activeRight][nextRight]) % MOD;
            const continuing = nextLeft + nextRight;
            const ending = (activeLeft - nextLeft) + (activeRight - nextRight);
            const counts = SUM_TABLES[continuing][ending];
            const base = BigInt(-carry - endingLeft + 9 * activeRight);
            for (let nextCarry = CARRY_MIN; nextCarry <= CARRY_MAX; nextCarry++) {
                const index = Number(10n * BigInt(nextCarry) + base);
                if (index >= 0 && index < counts.length) {
                    const ways = counts[index];
                    if (ways !== 0n) {
                        const weight = (chooseTerms * ways) % MOD;
                        result.push([nextLeft, nextRight, nextCarry, weight]);
                    }
                }
            }
        }
    }
    transCache.set(key, result);
    return result;
}

function solve(limit: number): bigint {
    const dp: Map<string, bigint>[] = Array.from({ length: limit + 1 }, () => new Map());
    for (let leftTerms = 1; leftTerms <= MAX_TERMS; leftTerms++) {
        for (let rightTerms = 1; rightTerms <= MAX_TERMS; rightTerms++) {
            const baseLength = leftTerms + rightTerms - 1;
            if (baseLength <= limit) {
                const stateKey = `${leftTerms},${rightTerms},0`;
                dp[baseLength].set(stateKey, ((dp[baseLength].get(stateKey) || 0n) + 1n) % MOD);
            }
        }
    }
    let answer = 0n;
    for (let usedLength = 0; usedLength <= limit; usedLength++) {
        const current = dp[usedLength];
        if (current.size === 0) continue;
        const zeroKey = '0,0,0';
        if (current.has(zeroKey)) {
            answer = (answer + current.get(zeroKey)!) % MOD;
        }
        for (const [stateKey, waysSoFar] of current.entries()) {
            if (waysSoFar === 0n) continue;
            const parts = stateKey.split(',');
            const activeLeft = parseInt(parts[0]);
            const activeRight = parseInt(parts[1]);
            const carry = parseInt(parts[2]);
            if (activeLeft === 0 && activeRight === 0) continue;
            const nextLength = usedLength + activeLeft + activeRight;
            if (nextLength > limit) continue;
            const bucket = dp[nextLength];
            for (const [nextLeft, nextRight, nextCarry, weight] of getTransitions(activeLeft, activeRight, carry)) {
                const newKey = `${nextLeft},${nextRight},${nextCarry}`;
                bucket.set(newKey, ((bucket.get(newKey) || 0n) + waysSoFar * weight) % MOD);
            }
        }
    }
    return answer;
}

function runSelfChecks(): void {
    console.assert(solve(3) === 9n, `Expected 9, got ${solve(3)}`);
    console.assert(solve(5) === 171n, `Expected 171, got ${solve(5)}`);
    console.assert(solve(7) === 4878n, `Expected 4878, got ${solve(7)}`);
}

runSelfChecks();
console.log(solve(50).toString());
