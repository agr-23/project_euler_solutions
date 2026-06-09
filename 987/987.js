// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/987.py

const WINDOWS = [
    [0, 1, 2, 3, 4],
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
    [3, 4, 5, 6, 7],
    [4, 5, 6, 7, 8],
    [5, 6, 7, 8, 9],
    [6, 7, 8, 9, 10],
    [7, 8, 9, 10, 11],
    [8, 9, 10, 11, 12],
    [9, 10, 11, 12, 0],
];

const OVERLAP = Array.from({ length: 10 }, () => new Array(10).fill(false));
for (let i = 0; i < 10; i++) {
    const setI = new Set(WINDOWS[i]);
    for (let j = 0; j < 10; j++) {
        OVERLAP[i][j] = WINDOWS[j].some(r => setI.has(r));
    }
}

const PERMS = Array.from({ length: 5 }, () => new Array(5).fill(0n));
for (let n = 0; n < 5; n++) {
    PERMS[n][0] = 1n;
    let value = 1n;
    for (let k = 1; k < 5; k++) {
        if (k <= n) {
            value *= BigInt(n - (k - 1));
            PERMS[n][k] = value;
        }
    }
}

function coloringsOfAllSubsets(starts) {
    const k = starts.length;
    const full = 1 << k;
    const adjacency = new Array(k).fill(0);
    for (let i = 0; i < k; i++) {
        for (let j = i + 1; j < k; j++) {
            if (OVERLAP[starts[i]][starts[j]]) {
                adjacency[i] |= 1 << j;
                adjacency[j] |= 1 << i;
            }
        }
    }
    const independent = new Array(full).fill(false);
    independent[0] = true;
    for (let mask = 1; mask < full; mask++) {
        const bit = mask & (-mask);
        const vertex = Math.clz32(bit) ^ 31;
        const rest = mask ^ bit;
        independent[mask] = independent[rest] && ((adjacency[vertex] & rest) === 0);
    }
    let dp = new Array(full).fill(0n);
    dp[0] = 1n;
    for (let c = 0; c < 4; c++) {
        const newDp = new Array(full).fill(0n);
        for (let mask = 0; mask < full; mask++) {
            let total = 0n;
            let sub = mask;
            while (true) {
                if (independent[sub]) {
                    total += dp[mask ^ sub];
                }
                if (sub === 0) break;
                sub = (sub - 1) & mask;
            }
            newDp[mask] = total;
        }
        dp = newDp;
    }
    return dp;
}

function popcount(x) {
    let count = 0;
    while (x) { count += x & 1; x >>>= 1; }
    return count;
}

function labeledCount(starts) {
    const k = starts.length;
    const full = 1 << k;
    const colorings = coloringsOfAllSubsets(starts);
    const totalActive = new Array(13).fill(0);
    const activeMasksByRank = new Array(13).fill(0);
    for (let index = 0; index < starts.length; index++) {
        const bit = 1 << index;
        for (const rank of WINDOWS[starts[index]]) {
            totalActive[rank] += 1;
            activeMasksByRank[rank] |= bit;
        }
    }
    let total = 0n;
    for (let mask = 0; mask < full; mask++) {
        let ways = 1n;
        for (let rank = 0; rank < 13; rank++) {
            const monochromaticHere = popcount(activeMasksByRank[rank] & mask);
            const flexibleHere = totalActive[rank] - monochromaticHere;
            const waysAtRank = PERMS[4 - monochromaticHere][flexibleHere];
            if (waysAtRank === 0n) {
                ways = 0n;
                break;
            }
            ways *= waysAtRank;
        }
        const term = colorings[mask] * ways;
        if (popcount(mask) & 1) {
            total -= term;
        } else {
            total += term;
        }
    }
    return total;
}

function factorial(n) {
    let r = 1n;
    for (let i = 2n; i <= BigInt(n); i++) r *= i;
    return r;
}

function* feasibleTypeCounts(target) {
    const counts = new Array(10).fill(0);
    const coverage = new Array(13).fill(0);
    function* backtrack(pos, remaining) {
        if (pos === 10) {
            if (remaining === 0) yield counts.slice();
            return;
        }
        for (let amount = 0; amount <= remaining; amount++) {
            let ok = true;
            for (const rank of WINDOWS[pos]) {
                coverage[rank] += amount;
                if (coverage[rank] > 4) ok = false;
            }
            counts[pos] = amount;
            if (ok) yield* backtrack(pos + 1, remaining - amount);
            for (const rank of WINDOWS[pos]) {
                coverage[rank] -= amount;
            }
        }
        counts[pos] = 0;
    }
    yield* backtrack(0, target);
}

function countDisjointStraights(target) {
    let total = 0n;
    for (const typeCounts of feasibleTypeCounts(target)) {
        const starts = [];
        let divisor = 1n;
        for (let start = 0; start < typeCounts.length; start++) {
            const amount = typeCounts[start];
            for (let i = 0; i < amount; i++) starts.push(start);
            divisor *= factorial(amount);
        }
        total += labeledCount(starts) / divisor;
    }
    return total;
}

console.assert(countDisjointStraights(1) === 10200n, "Test 1 failed");
console.assert(countDisjointStraights(2) === 31832952n, "Test 2 failed");
console.log(countDisjointStraights(8).toString());
