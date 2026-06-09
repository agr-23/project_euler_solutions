// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/982.py

const EPS: number = 1e-9;

function doPivot(tableau: number[][], basis: number[], row: number, col: number): void {
    const pivotVal: number = tableau[row][col];
    const inv: number = 1.0 / pivotVal;
    const nCols: number = tableau[0].length;
    for (let j = 0; j < nCols; j++) {
        tableau[row][j] *= inv;
    }
    for (let i = 0; i < tableau.length; i++) {
        if (i === row) continue;
        const factor: number = tableau[i][col];
        if (Math.abs(factor) > EPS) {
            for (let j = 0; j < nCols; j++) {
                tableau[i][j] -= factor * tableau[row][j];
            }
        }
    }
    basis[row] = col;
}

function setObjective(tableau: number[][], basis: number[], c: number[]): void {
    const m: number = basis.length;
    const n: number = tableau[0].length - 1;
    const obj: number[] = [];
    for (let j = 0; j < n; j++) obj.push(-c[j]);
    obj.push(0.0);
    for (let i = 0; i < m; i++) {
        const cb: number = c[basis[i]];
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

function simplexMax(tableau: number[][], basis: number[]): boolean {
    const m: number = basis.length;
    const n: number = tableau[0].length - 1;
    const maxIter: number = 200000;
    for (let iter = 0; iter < maxIter; iter++) {
        let entering: number | null = null;
        for (let j = 0; j < n; j++) {
            if (tableau[m][j] < -EPS) {
                entering = j;
                break;
            }
        }
        if (entering === null) return true;
        let minRatio: number = Infinity;
        let leaving: number | null = null;
        for (let i = 0; i < m; i++) {
            const a: number = tableau[i][entering];
            if (a > EPS) {
                const ratio: number = tableau[i][tableau[i].length - 1] / a;
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

interface BuildTableauResult {
    tableau: number[][];
    basis: number[];
    artIndices: number[];
    nTotal: number;
}

function buildTableau(nVars: number, constraints: [number[], string, number][]): BuildTableauResult {
    const rows: number[][] = [];
    const rhs: number[] = [];
    const basis: number[] = [];
    const artIndices: number[] = [];
    let nTotal: number = nVars;

    function addVar(): void {
        for (const r of rows) r.push(0.0);
        nTotal += 1;
    }

    for (let ci = 0; ci < constraints.length; ci++) {
        let coeffs: number[] = constraints[ci][0].slice();
        let sense: string = constraints[ci][1];
        let b: number = constraints[ci][2];
        if (b < 0) {
            coeffs = coeffs.map((v: number) => -v);
            b = -b;
            if (sense === "<=") sense = ">=";
            else if (sense === ">=") sense = "<=";
        }
        const row: number[] = coeffs.slice();
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
    const tableau: number[][] = rows.map((r, i) => r.concat([rhs[i]]));
    return { tableau, basis, artIndices, nTotal };
}

interface RemoveArtResult {
    tableau: number[][];
    basis: number[];
    mapping: Map<number, number>;
}

function removeArtificial(tableau: number[][], basis: number[], artIndices: number[]): RemoveArtResult {
    const artSet = new Set<number>(artIndices);
    let m: number = basis.length;
    let n: number = tableau[0].length - 1;
    let i: number = 0;
    while (i < m) {
        if (artSet.has(basis[i])) {
            let pivotCol: number | null = null;
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
    const keepCols: number[] = [];
    for (let j = 0; j < n; j++) {
        if (!artSet.has(j)) keepCols.push(j);
    }
    const mapping = new Map<number, number>();
    for (let newIdx = 0; newIdx < keepCols.length; newIdx++) {
        mapping.set(keepCols[newIdx], newIdx);
    }
    const newTableau: number[][] = tableau.map((row: number[]) => {
        const newRow: number[] = keepCols.map((j: number) => row[j]);
        newRow.push(row[row.length - 1]);
        return newRow;
    });
    const newBasis: number[] = basis.map((b: number) => mapping.get(b) as number);
    return { tableau: newTableau, basis: newBasis, mapping };
}

function solveLP(nVars: number, constraints: [number[], string, number][], objective: number[]): number {
    let { tableau, basis, artIndices, nTotal } = buildTableau(nVars, constraints);
    let mapping: Map<number, number>;
    if (artIndices.length > 0) {
        const cPhase1: number[] = new Array(nTotal).fill(0.0);
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
        mapping = new Map<number, number>();
        for (let i = 0; i < nTotal; i++) mapping.set(i, i);
    }
    const nTotal2: number = tableau[0].length - 1;
    const cPhase2: number[] = new Array(nTotal2).fill(0.0);
    for (let j = 0; j < objective.length; j++) {
        if (mapping.has(j)) {
            cPhase2[mapping.get(j) as number] = -objective[j];
        }
    }
    setObjective(tableau, basis, cPhase2);
    if (!simplexMax(tableau, basis)) throw new Error("Unbounded in phase II");
    return -tableau[tableau.length - 1][tableau[tableau.length - 1].length - 1];
}

function cartesianProduct(arr: number[], repeat: number): number[][] {
    let result: number[][] = [[]];
    for (let r = 0; r < repeat; r++) {
        const next: number[][] = [];
        for (const prev of result) {
            for (const val of arr) {
                next.push(prev.concat([val]));
            }
        }
        result = next;
    }
    return result;
}

function buildAndSolve(numDice: number): number {
    const values: number[] = [1, 2, 3, 4, 5, 6];
    const states: number[][] = cartesianProduct(values, numDice);
    const numStates: number = states.length;
    const hideOptions: number[] = [];
    for (let i = 0; i < numDice; i++) hideOptions.push(i);

    const signalSet = new Set<string>();
    for (const t of states) {
        for (const h of hideOptions) {
            const revealed = t.filter((_: number, i: number) => i !== h).slice().sort((a: number, b: number) => a - b);
            signalSet.add(JSON.stringify(revealed));
        }
    }
    const signals: number[][] = Array.from(signalSet).map((s: string) => JSON.parse(s)).sort((a: number[], b: number[]) => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] !== b[i]) return a[i] - b[i];
        }
        return a.length - b.length;
    });
    const signalIndex = new Map<string, number>();
    for (let i = 0; i < signals.length; i++) {
        signalIndex.set(JSON.stringify(signals[i]), i);
    }

    const numX: number = numStates * numDice;
    const numZ: number = signals.length;
    const nVars: number = numX + numZ;

    function xIndex(stateIdx: number, hideIdx: number): number { return stateIdx * numDice + hideIdx; }
    function zIndex(signalIdx: number): number { return numX + signalIdx; }

    const constraints: [number[], string, number][] = [];
    const pState: number = 1.0 / numStates;

    for (let sIdx = 0; sIdx < numStates; sIdx++) {
        const coeffs: number[] = new Array(nVars).fill(0.0);
        for (const h of hideOptions) {
            coeffs[xIndex(sIdx, h)] = 1.0;
        }
        constraints.push([coeffs, "=", pState]);
    }

    for (const sig of signals) {
        const bVal: number = Math.max(...sig);
        const sigIdx: number = signalIndex.get(JSON.stringify(sig)) as number;
        const coeffsVis: number[] = new Array(nVars).fill(0.0);
        const coeffsHid: number[] = new Array(nVars).fill(0.0);
        coeffsVis[zIndex(sigIdx)] = -1.0;
        coeffsHid[zIndex(sigIdx)] = -1.0;
        for (let sIdx = 0; sIdx < numStates; sIdx++) {
            const t: number[] = states[sIdx];
            for (const h of hideOptions) {
                const revealed = t.filter((_: number, i: number) => i !== h).slice().sort((a: number, b: number) => a - b);
                if (JSON.stringify(revealed) === JSON.stringify(sig)) {
                    coeffsVis[xIndex(sIdx, h)] += bVal;
                    const hiddenVal: number = t[h];
                    coeffsHid[xIndex(sIdx, h)] += hiddenVal;
                }
            }
        }
        constraints.push([coeffsVis, "<=", 0.0]);
        constraints.push([coeffsHid, "<=", 0.0]);
    }

    const objective: number[] = new Array(nVars).fill(0.0);
    for (let sigIdx = 0; sigIdx < numZ; sigIdx++) {
        objective[zIndex(sigIdx)] = 1.0;
    }

    return solveLP(nVars, constraints, objective);
}

function main(): void {
    const valTwo: number = buildAndSolve(2);
    const targetExact: number = 145.0 / 36.0;
    console.assert(Math.abs(valTwo - targetExact) < 1e-8, "valTwo check 1 failed");
    console.assert(Math.abs(valTwo - 4.027778) < 1e-6, "valTwo check 2 failed");
    const valThree: number = buildAndSolve(3);
    console.log(valThree.toFixed(6));
}

main();
