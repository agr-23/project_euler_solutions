// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/980.py

function buildMulTableQ8() {
    const baseArr = Array.from({length: 4}, () => new Array(4).fill(0));
    const sgnArr = Array.from({length: 4}, () => new Array(4).fill(1));
    for (let a = 0; a < 4; a++) {
        for (let b = 0; b < 4; b++) {
            if (a === 0) {
                baseArr[a][b] = b;
                sgnArr[a][b] = 1;
            } else if (b === 0) {
                baseArr[a][b] = a;
                sgnArr[a][b] = 1;
            } else if (a === b) {
                baseArr[a][b] = 0;
                sgnArr[a][b] = -1;
            } else {
                if (a === 1 && b === 2) { baseArr[a][b] = 3; sgnArr[a][b] = 1; }
                else if (a === 2 && b === 3) { baseArr[a][b] = 1; sgnArr[a][b] = 1; }
                else if (a === 3 && b === 1) { baseArr[a][b] = 2; sgnArr[a][b] = 1; }
                else if (a === 2 && b === 1) { baseArr[a][b] = 3; sgnArr[a][b] = -1; }
                else if (a === 3 && b === 2) { baseArr[a][b] = 1; sgnArr[a][b] = -1; }
                else if (a === 1 && b === 3) { baseArr[a][b] = 2; sgnArr[a][b] = -1; }
                else { throw new Error("Unexpected basis multiplication case"); }
            }
        }
    }
    const mulTable = Array.from({length: 8}, () => new Array(8).fill(0));
    for (let A = 0; A < 8; A++) {
        const sa = A < 4 ? 1 : -1;
        const a = A & 3;
        for (let B = 0; B < 8; B++) {
            const sb = B < 4 ? 1 : -1;
            const b = B & 3;
            const s = sa * sb * sgnArr[a][b];
            const c = baseArr[a][b];
            mulTable[A][B] = s === 1 ? c : (c ^ 4);
        }
    }
    return mulTable;
}

const MUL_TABLE = buildMulTableQ8();
const GEN_ELEMS = [1, 2, 7];
const R_TABLE = new Array(8 * 3).fill(0);
for (let v = 0; v < 8; v++) {
    for (let b = 0; b < 3; b++) {
        R_TABLE[v * 3 + b] = MUL_TABLE[v][GEN_ELEMS[b]];
    }
}
const INV_TABLE = new Array(8).fill(0);
for (let e = 0; e < 8; e++) {
    for (let f = 0; f < 8; f++) {
        if (MUL_TABLE[e][f] === 0 && MUL_TABLE[f][e] === 0) {
            INV_TABLE[e] = f;
            break;
        }
    }
}

function computeF(nVal) {
    const MOD = 888888883;
    const MULT = 8888;
    let aVal = 88888888;
    const cnts = new Array(8).fill(0);
    const R = R_TABLE;
    for (let iter = 0; iter < nVal; iter++) {
        let v = 0;
        for (let step = 0; step < 50; step++) {
            v = R[v * 3 + (aVal % 3)];
            aVal = (aVal * MULT) % MOD;
        }
        cnts[v]++;
    }
    let total = 0n;
    const invArr = INV_TABLE;
    for (let e = 0; e < 8; e++) {
        total += BigInt(cnts[e]) * BigInt(cnts[invArr[e]]);
    }
    return total;
}

function runMain() {
    const r10 = computeF(10);
    if (r10 !== 13n) throw new Error("Assert F(10) == 13 failed, got " + r10);
    const r100 = computeF(100);
    if (r100 !== 1224n) throw new Error("Assert F(100) == 1224 failed, got " + r100);
    const result = computeF(1000000);
    process.stdout.write(result.toString() + "\n");
}

runMain();
