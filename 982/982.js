// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/982.py

const EPS = 1e-9;

function doPivot(tableau, basis, row, col) {
    const pivotVal = tableau[row][col];
    const inv = 1.0 / pivotVal;
    const nCols = tableau[0].length;
    for (let j = 0; j < nCols; j++) {
        tableau[row][j] *= inv;
    }
    for (let i = 0; i < tableau.length; i++) {
        if (i === row) continue;
        const factor = tableau[i][col];
        if (Math.abs(factor) > EPS) {
            for (let j = 0; j < nCols; j++) {
                tableau[i][j] -= factor * tableau[row][j];
            }
        }
    }
    basis[row] = col;
}

function setObjective(tableau, basis, c) {
    const m = basis.length;
    const n = tableau[0].length - 1;
    const obj = [];
    for (let j = 0; j < n; j++) obj.push(-c[j]);
    obj.push(0.0);
    for (let i = 0; i < m; i++) {
        const cb = c[basis[i]];
        if (Math.abs(cb) > EPS) {
            const row = tableau[i];
            for (let j = 0; j < n + 1; j++) {
                obj[j] += cb * row[j];
            }
        }
    }
    if (tableau.length === m) {
        tableau.push(obj);
    } else {
        tableau[m] = obj;
    }
}

function simplexMax(tableau, basis) {
    const m = basis.length;
    const n = tableau[0].length - 1;
    const maxIter = 200000;
    for (let iter = 0; iter < maxIter; iter++) {
        let entering = null;
        for (let j = 0; j < n; j++) {
            if (tableau[m][j] < -EPS) {
                entering = j;
                break;
            }
        }
        if (entering === null) return true;
        let minRatio = Infinity;
        let leaving = null;
        for (let i = 0; i < m; i++) {
            const a = tableau[i][entering];
            if (a > EPS) {
                const ratio = tableau[i][tableau[i].length - 1] / a;
                if (ratio < minRatio - EPS) {
                    minRatio = ratio;
                    leaving = i;
                }
            }
        }
        if (leaving === null) return false;
        doPivot(tableau, basis, leaving, entering);
    }
    throw new Error("Simplex did not converge");
}

function buildTableau(nVars, constraints) {
    const rows = [];
    const rhs = [];
    const basis = [];
    const artIndices = [];
    let nTotal = nVars;

    function addVar() {
        for (const r of rows) r.push(0.0);
        nTotal += 1;
    }

    for (let ci = 0; ci < constraints.length; ci++) {
        let [coeffs, sense, b] = constraints[ci];
        if (b < 0) {
            coeffs = coeffs.map(v => -v);
            b = -b;
            if (sense === "<=") sense = ">=";
            else if (sense === ">=") sense = "<=";
        }
        const row = coeffs.slice();
        for (let k = row.length; k < nTotal; k++) row.push(0.0);
        if (sense === "<=") {
            addVar();
            row.push(1.0);
            basis.push(nTotal - 1);
        } else if (sense === ">=") {
            addVar();
            row.push(-1.0);
            addVar();
            row.push(1.0);
            basis.push(nTotal - 1);
            artIndices.push(nTotal - 1);
        } else if (sense === "=") {
            addVar();
            row.push(1.0);
            basis.push(nTotal - 1);
            artIndices.push(nTotal - 1);
        } else {
            throw new Error("Unknown constraint sense");
        }
        rows.push(row);
        rhs.push(b);
    }
    const tableau = rows.map((r, i) => r.concat([rhs[i]]));
    return { tableau, basis, artIndices, nTotal };
}

function removeArtificial(tableau, basis, artIndices) {
    const artSet = new Set(artIndices);
    let m = basis.length;
    let n = tableau[0].length - 1;
    let i = 0;
    while (i < m) {
        if (artSet.has(basis[i])) {
            let pivotCol = null;
            for (let j = 0; j < n; j++) {
                if (artSet.has(j)) continue;
                if (Math.abs(tableau[i][j]) > EPS) {
                    pivotCol = j;
                    break;
                }
            }
            if (pivotCol !== null) {
                doPivot(tableau, basis, i, pivotCol);
                i++;
            } else {
                if (Math.abs(tableau[i][tableau[i].length - 1]) > EPS) {
                    throw new Error("Infeasible during artificial removal");
                }
                tableau.splice(i, 1);
                basis.splice(i, 1);
                m--;
                continue;
            }
        } else {
            i++;
        }
    }
    n = tableau[0].length - 1;
    const keepCols = [];
    for (let j = 0; j < n; j++) {
        if (!artSet.has(j)) keepCols.push(j);
    }
    const mapping = new Map();
    for (let newIdx = 0; newIdx < keepCols.length; newIdx++) {
        mapping.set(keepCols[newIdx], newIdx);
    }
    const newTableau = tableau.map(row => {
        const newRow = keepCols.map(j => row[j]);
        newRow.push(row[row.length - 1]);
        return newRow;
    });
    const newBasis = basis.map(b => mapping.get(b));
    return { tableau: newTableau, basis: newBasis, mapping };
}

function solveLP(nVars, constraints, objective) {
    let { tableau, basis, artIndices, nTotal } = buildTableau(nVars, constraints);
    let mapping;
    if (artIndices.length > 0) {
        const cPhase1 = new Array(nTotal).fill(0.0);
        for (const j of artIndices) cPhase1[j] = -1.0;
        setObjective(tableau, basis, cPhase1);
        if (!simplexMax(tableau, basis)) throw new Error("Unbounded in phase I");
        if (tableau[tableau.length - 1][tableau[tableau.length - 1].length - 1] < -1e-7) {
            throw new Error("Infeasible LP");
        }
        tableau.pop();
        const result = removeArtificial(tableau, basis, artIndices);
        tableau = result.tableau;
        basis = result.basis;
        mapping = result.mapping;
    } else {
        mapping = new Map();
        for (let i = 0; i < nTotal; i++) mapping.set(i, i);
    }
    const nTotal2 = tableau[0].length - 1;
    const cPhase2 = new Array(nTotal2).fill(0.0);
    for (let j = 0; j < objective.length; j++) {
        if (mapping.has(j)) {
            cPhase2[mapping.get(j)] = -objective[j];
        }
    }
    setObjective(tableau, basis, cPhase2);
    if (!simplexMax(tableau, basis)) throw new Error("Unbounded in phase II");
    return -tableau[tableau.length - 1][tableau[tableau.length - 1].length - 1];
}

function cartesianProduct(arr, repeat) {
    let result = [[]];
    for (let r = 0; r < repeat; r++) {
        const next = [];
        for (const prev of result) {
            for (const val of arr) {
                next.push(prev.concat([val]));
            }
        }
        result = next;
    }
    return result;
}

function buildAndSolve(numDice) {
    const values = [1, 2, 3, 4, 5, 6];
    const states = cartesianProduct(values, numDice);
    const numStates = states.length;
    const hideOptions = [];
    for (let i = 0; i < numDice; i++) hideOptions.push(i);

    const signalSet = new Set();
    for (const t of states) {
        for (const h of hideOptions) {
            const revealed = t.filter((_, i) => i !== h).slice().sort((a, b) => a - b);
            signalSet.add(JSON.stringify(revealed));
        }
    }
    const signals = Array.from(signalSet).map(s => JSON.parse(s)).sort((a, b) => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] !== b[i]) return a[i] - b[i];
        }
        return a.length - b.length;
    });
    const signalIndex = new Map();
    for (let i = 0; i < signals.length; i++) {
        signalIndex.set(JSON.stringify(signals[i]), i);
    }

    const numX = numStates * numDice;
    const numZ = signals.length;
    const nVars = numX + numZ;

    function xIndex(stateIdx, hideIdx) { return stateIdx * numDice + hideIdx; }
    function zIndex(signalIdx) { return numX + signalIdx; }

    const constraints = [];
    const pState = 1.0 / numStates;

    for (let sIdx = 0; sIdx < numStates; sIdx++) {
        const coeffs = new Array(nVars).fill(0.0);
        for (const h of hideOptions) {
            coeffs[xIndex(sIdx, h)] = 1.0;
        }
        constraints.push([coeffs, "=", pState]);
    }

    for (const sig of signals) {
        const bVal = Math.max(...sig);
        const sigIdx = signalIndex.get(JSON.stringify(sig));
        const coeffsVis = new Array(nVars).fill(0.0);
        const coeffsHid = new Array(nVars).fill(0.0);
        coeffsVis[zIndex(sigIdx)] = -1.0;
        coeffsHid[zIndex(sigIdx)] = -1.0;
        for (let sIdx = 0; sIdx < numStates; sIdx++) {
            const t = states[sIdx];
            for (const h of hideOptions) {
                const revealed = t.filter((_, i) => i !== h).slice().sort((a, b) => a - b);
                if (JSON.stringify(revealed) === JSON.stringify(sig)) {
                    coeffsVis[xIndex(sIdx, h)] += bVal;
                    const hiddenVal = t[h];
                    coeffsHid[xIndex(sIdx, h)] += hiddenVal;
                }
            }
        }
        constraints.push([coeffsVis, "<=", 0.0]);
        constraints.push([coeffsHid, "<=", 0.0]);
    }

    const objective = new Array(nVars).fill(0.0);
    for (let sigIdx = 0; sigIdx < numZ; sigIdx++) {
        objective[zIndex(sigIdx)] = 1.0;
    }

    return solveLP(nVars, constraints, objective);
}

function main() {
    const valTwo = buildAndSolve(2);
    const targetExact = 145.0 / 36.0;
    console.assert(Math.abs(valTwo - targetExact) < 1e-8, "valTwo check 1 failed");
    console.assert(Math.abs(valTwo - 4.027778) < 1e-6, "valTwo check 2 failed");
    const valThree = buildAndSolve(3);
    console.log(valThree.toFixed(6));
}

main();
