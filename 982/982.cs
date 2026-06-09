// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/982.py

using System;
using System.Collections.Generic;
using System.Linq;

class Program982 {
    const double EPS_VAL = 1e-9;

    static void DoPivot(List<List<double>> tableau, List<int> basis, int row, int col) {
        double pivotVal = tableau[row][col];
        double inv = 1.0 / pivotVal;
        int nCols = tableau[0].Count;
        for (int j = 0; j < nCols; j++) tableau[row][j] *= inv;
        for (int i = 0; i < tableau.Count; i++) {
            if (i == row) continue;
            double factor = tableau[i][col];
            if (Math.Abs(factor) > EPS_VAL) {
                for (int j = 0; j < nCols; j++) tableau[i][j] -= factor * tableau[row][j];
            }
        }
        basis[row] = col;
    }

    static void SetObjective(List<List<double>> tableau, List<int> basis, List<double> c) {
        int m = basis.Count;
        int n = tableau[0].Count - 1;
        List<double> obj = new List<double>();
        for (int j = 0; j < n; j++) obj.Add(-c[j]);
        obj.Add(0.0);
        for (int i = 0; i < m; i++) {
            double cb = c[basis[i]];
            if (Math.Abs(cb) > EPS_VAL) {
                List<double> row = tableau[i];
                for (int j = 0; j <= n; j++) obj[j] += cb * row[j];
            }
        }
        if (tableau.Count == m) tableau.Add(obj);
        else tableau[m] = obj;
    }

    static bool SimplexMax(List<List<double>> tableau, List<int> basis) {
        int m = basis.Count;
        int n = tableau[0].Count - 1;
        int maxIter = 200000;
        for (int iter = 0; iter < maxIter; iter++) {
            int entering = -1;
            for (int j = 0; j < n; j++) {
                if (tableau[m][j] < -EPS_VAL) { entering = j; break; }
            }
            if (entering == -1) return true;
            double minRatio = double.PositiveInfinity;
            int leaving = -1;
            for (int i = 0; i < m; i++) {
                double a = tableau[i][entering];
                if (a > EPS_VAL) {
                    double ratio = tableau[i][tableau[i].Count - 1] / a;
                    if (ratio < minRatio - EPS_VAL) { minRatio = ratio; leaving = i; }
                }
            }
            if (leaving == -1) return false;
            DoPivot(tableau, basis, leaving, entering);
        }
        throw new Exception("Simplex did not converge");
    }

    static (List<List<double>> tableau, List<int> basis, List<int> artIndices, int nTotal)
    BuildTableau(int nVars, List<(List<double> coeffs, string sense, double b)> constraints) {
        List<List<double>> rows = new List<List<double>>();
        List<double> rhs = new List<double>();
        List<int> basis = new List<int>();
        List<int> artIndices = new List<int>();
        int nTotal = nVars;

        void AddVar() {
            foreach (var r in rows) r.Add(0.0);
            nTotal += 1;
        }

        for (int ci = 0; ci < constraints.Count; ci++) {
            List<double> coeffs = new List<double>(constraints[ci].coeffs);
            string sense = constraints[ci].sense;
            double b = constraints[ci].b;
            if (b < 0) {
                coeffs = coeffs.Select(v => -v).ToList();
                b = -b;
                if (sense == "<=") sense = ">=";
                else if (sense == ">=") sense = "<=";
            }
            List<double> row = new List<double>(coeffs);
            while (row.Count < nTotal) row.Add(0.0);
            if (sense == "<=") {
                AddVar();
                row.Add(1.0);
                basis.Add(nTotal - 1);
            } else if (sense == ">=") {
                AddVar();
                row.Add(-1.0);
                AddVar();
                row.Add(1.0);
                basis.Add(nTotal - 1);
                artIndices.Add(nTotal - 1);
            } else if (sense == "=") {
                AddVar();
                row.Add(1.0);
                basis.Add(nTotal - 1);
                artIndices.Add(nTotal - 1);
            } else {
                throw new Exception("Unknown constraint sense");
            }
            rows.Add(row);
            rhs.Add(b);
        }
        List<List<double>> tableau = rows.Select((r, i) => { var nr = new List<double>(r); nr.Add(rhs[i]); return nr; }).ToList();
        return (tableau, basis, artIndices, nTotal);
    }

    static (List<List<double>> tableau, List<int> basis, Dictionary<int,int> mapping)
    RemoveArtificial(List<List<double>> tableau, List<int> basis, List<int> artIndices) {
        HashSet<int> artSet = new HashSet<int>(artIndices);
        int m = basis.Count;
        int i = 0;
        while (i < m) {
            if (artSet.Contains(basis[i])) {
                int n = tableau[0].Count - 1;
                int pivotCol = -1;
                for (int j = 0; j < n; j++) {
                    if (artSet.Contains(j)) continue;
                    if (Math.Abs(tableau[i][j]) > EPS_VAL) { pivotCol = j; break; }
                }
                if (pivotCol != -1) {
                    DoPivot(tableau, basis, i, pivotCol);
                    i++;
                } else {
                    if (Math.Abs(tableau[i][tableau[i].Count - 1]) > EPS_VAL)
                        throw new Exception("Infeasible during artificial removal");
                    tableau.RemoveAt(i);
                    basis.RemoveAt(i);
                    m--;
                    continue;
                }
            } else { i++; }
        }
        int nFinal = tableau[0].Count - 1;
        List<int> keepCols = Enumerable.Range(0, nFinal).Where(j => !artSet.Contains(j)).ToList();
        Dictionary<int,int> mapping = new Dictionary<int,int>();
        for (int newIdx = 0; newIdx < keepCols.Count; newIdx++) mapping[keepCols[newIdx]] = newIdx;
        List<List<double>> newTableau = tableau.Select(row => {
            List<double> newRow = keepCols.Select(j => row[j]).ToList();
            newRow.Add(row[row.Count - 1]);
            return newRow;
        }).ToList();
        List<int> newBasis = basis.Select(b => mapping[b]).ToList();
        return (newTableau, newBasis, mapping);
    }

    static double SolveLP(int nVars, List<(List<double> coeffs, string sense, double b)> constraints, List<double> objective) {
        var (tableau, basis, artIndices, nTotal) = BuildTableau(nVars, constraints);
        Dictionary<int,int> mapping;
        if (artIndices.Count > 0) {
            List<double> cPhase1 = Enumerable.Repeat(0.0, nTotal).ToList();
            foreach (int j in artIndices) cPhase1[j] = -1.0;
            SetObjective(tableau, basis, cPhase1);
            if (!SimplexMax(tableau, basis)) throw new Exception("Unbounded in phase I");
            if (tableau[tableau.Count - 1][tableau[tableau.Count - 1].Count - 1] < -1e-7)
                throw new Exception("Infeasible LP");
            tableau.RemoveAt(tableau.Count - 1);
            var removeResult = RemoveArtificial(tableau, basis, artIndices);
            tableau = removeResult.tableau;
            basis = removeResult.basis;
            mapping = removeResult.mapping;
        } else {
            mapping = new Dictionary<int,int>();
            for (int k = 0; k < nTotal; k++) mapping[k] = k;
        }
        int nTotal2 = tableau[0].Count - 1;
        List<double> cPhase2 = Enumerable.Repeat(0.0, nTotal2).ToList();
        for (int j = 0; j < objective.Count; j++) {
            if (mapping.ContainsKey(j)) cPhase2[mapping[j]] = -objective[j];
        }
        SetObjective(tableau, basis, cPhase2);
        if (!SimplexMax(tableau, basis)) throw new Exception("Unbounded in phase II");
        return -tableau[tableau.Count - 1][tableau[tableau.Count - 1].Count - 1];
    }

    static List<List<int>> CartesianProduct(List<int> arr, int repeat) {
        List<List<int>> result = new List<List<int>> { new List<int>() };
        for (int r = 0; r < repeat; r++) {
            List<List<int>> next = new List<List<int>>();
            foreach (var prev in result)
                foreach (var v in arr) {
                    var newList = new List<int>(prev); newList.Add(v); next.Add(newList);
                }
            result = next;
        }
        return result;
    }

    static double BuildAndSolve(int numDice) {
        List<int> values = new List<int> { 1, 2, 3, 4, 5, 6 };
        List<List<int>> states = CartesianProduct(values, numDice);
        int numStates = states.Count;
        List<int> hideOptions = Enumerable.Range(0, numDice).ToList();

        HashSet<string> signalSet = new HashSet<string>();
        foreach (var t in states) {
            foreach (var h in hideOptions) {
                var revealed = t.Where((_, i) => i != h).OrderBy(x => x).ToList();
                signalSet.Add(string.Join(",", revealed));
            }
        }
        List<List<int>> signals = signalSet
            .Select(s => s.Split(',').Select(int.Parse).ToList())
            .OrderBy(a => string.Join(",", a.Select(x => x.ToString("D5"))))
            .ToList();
        Dictionary<string, int> signalIndex = new Dictionary<string, int>();
        for (int i = 0; i < signals.Count; i++) signalIndex[string.Join(",", signals[i])] = i;

        int numX = numStates * numDice;
        int numZ = signals.Count;
        int nVars = numX + numZ;

        int XIndex(int stateIdx, int hideIdx) => stateIdx * numDice + hideIdx;
        int ZIndex(int signalIdx) => numX + signalIdx;

        List<(List<double>, string, double)> constraints = new List<(List<double>, string, double)>();
        double pState = 1.0 / numStates;

        for (int sIdx = 0; sIdx < numStates; sIdx++) {
            List<double> coeffs = Enumerable.Repeat(0.0, nVars).ToList();
            foreach (var h in hideOptions) coeffs[XIndex(sIdx, h)] = 1.0;
            constraints.Add((coeffs, "=", pState));
        }

        foreach (var sig in signals) {
            double bVal = sig.Max();
            int sigIdx = signalIndex[string.Join(",", sig)];
            List<double> coeffsVis = Enumerable.Repeat(0.0, nVars).ToList();
            List<double> coeffsHid = Enumerable.Repeat(0.0, nVars).ToList();
            coeffsVis[ZIndex(sigIdx)] = -1.0;
            coeffsHid[ZIndex(sigIdx)] = -1.0;
            for (int sIdx = 0; sIdx < numStates; sIdx++) {
                var t = states[sIdx];
                foreach (var h in hideOptions) {
                    var revealed = t.Where((_, i) => i != h).OrderBy(x => x).ToList();
                    if (string.Join(",", revealed) == string.Join(",", sig)) {
                        coeffsVis[XIndex(sIdx, h)] += bVal;
                        double hiddenVal = t[h];
                        coeffsHid[XIndex(sIdx, h)] += hiddenVal;
                    }
                }
            }
            constraints.Add((new List<double>(coeffsVis), "<=", 0.0));
            constraints.Add((new List<double>(coeffsHid), "<=", 0.0));
        }

        List<double> objective = Enumerable.Repeat(0.0, nVars).ToList();
        for (int sigIdx = 0; sigIdx < numZ; sigIdx++) objective[ZIndex(sigIdx)] = 1.0;

        return SolveLP(nVars, constraints, objective);
    }

    static void Main(string[] args) {
        double valTwo = BuildAndSolve(2);
        double targetExact = 145.0 / 36.0;
        System.Diagnostics.Debug.Assert(Math.Abs(valTwo - targetExact) < 1e-8);
        System.Diagnostics.Debug.Assert(Math.Abs(valTwo - 4.027778) < 1e-6);
        double valThree = BuildAndSolve(3);
        Console.WriteLine(valThree.ToString("F6"));
    }
}
