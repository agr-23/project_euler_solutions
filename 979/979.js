// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/979.py

const SUBS_TABLE = [
    [0, 0, 1],
    [0, 1],
];

function buildLayers(maxLayer) {
    const typesList = Array.from({length: maxLayer + 1}, () => []);
    const parent1List = Array.from({length: maxLayer + 1}, () => []);
    const parent2List = Array.from({length: maxLayer + 1}, () => []);

    typesList[0] = [0];
    if (maxLayer === 0) {
        return [typesList, parent1List, parent2List];
    }

    typesList[1] = new Array(7).fill(0);
    parent1List[1] = new Array(7).fill(0);
    parent2List[1] = new Array(7).fill(-1);

    for (let k = 2; k <= maxLayer; k++) {
        const prev = typesList[k - 1];
        const m = prev.length;
        const cur = [];
        const p1 = [];
        const p2 = [];

        for (let j = 0; j < prev.length; j++) {
            const t = prev[j];
            const block = SUBS_TABLE[t];
            const blen = block.length;
            for (let pos = 0; pos < blen; pos++) {
                const ct = block[pos];
                cur.push(ct);
                p1.push(j);
                if (pos === blen - 1) {
                    p2.push((j + 1) % m);
                } else {
                    p2.push(-1);
                }
            }
        }

        typesList[k] = cur;
        parent1List[k] = p1;
        parent2List[k] = p2;
    }

    return [typesList, parent1List, parent2List];
}

function buildBallAdjacency(maxLayer) {
    const [typesList, parent1List, parent2List] = buildLayers(maxLayer);
    const sizes = [];
    for (let k = 0; k <= maxLayer; k++) {
        sizes.push(typesList[k].length);
    }

    const offsets = new Array(maxLayer + 1).fill(0);
    let total = 0;
    for (let k = 0; k <= maxLayer; k++) {
        offsets[k] = total;
        total += sizes[k];
    }

    const adj = Array.from({length: total}, () => []);

    function addEdge(u, v) {
        adj[u].push(v);
        adj[v].push(u);
    }

    const origin = offsets[0];

    for (let k = 1; k <= maxLayer; k++) {
        const off = offsets[k];
        const m = sizes[k];
        for (let i = 0; i < m; i++) {
            addEdge(off + i, off + ((i + 1) % m));
        }
    }

    if (maxLayer >= 1) {
        const off1 = offsets[1];
        for (let i = 0; i < sizes[1]; i++) {
            addEdge(origin, off1 + i);
        }
    }

    for (let k = 2; k <= maxLayer; k++) {
        const off = offsets[k];
        const poff = offsets[k - 1];
        for (let i = 0; i < sizes[k]; i++) {
            addEdge(off + i, poff + parent1List[k][i]);
            const p = parent2List[k][i];
            if (p !== -1) {
                addEdge(off + i, poff + p);
            }
        }
    }

    if (maxLayer >= 1) {
        for (let k = 0; k < maxLayer; k++) {
            const off = offsets[k];
            for (let i = 0; i < sizes[k]; i++) {
                const u = off + i;
                if (adj[u].length !== 7) {
                    throw new Error(`Assertion failed: adj degree at (${k},${i}) is ${adj[u].length}`);
                }
            }
        }
    }

    return [adj, origin, offsets];
}

function computeF(n) {
    if (n < 0) return 0n;
    if (n === 0) return 1n;
    const maxLayer = Math.floor(n / 2);
    const [adj, origin] = buildBallAdjacency(maxLayer);
    const nodeCount = adj.length;
    let dp = new Array(nodeCount).fill(0n);
    dp[origin] = 1n;

    for (let step = 0; step < n; step++) {
        const ndp = new Array(nodeCount).fill(0n);
        for (let u = 0; u < nodeCount; u++) {
            const val = dp[u];
            if (val !== 0n) {
                for (const v of adj[u]) {
                    ndp[v] += val;
                }
            }
        }
        dp = ndp;
    }

    return dp[origin];
}

function main() {
    const f4 = computeF(4);
    if (f4 !== 119n) {
        throw new Error(`Assertion failed: F(4) == ${f4}, expected 119`);
    }
    console.log(computeF(20).toString());
}

main();
