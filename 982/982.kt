// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/982.py

val EPS_VAL = 1e-9

fun doPivot(tableau: MutableList<MutableList<Double>>, basis: MutableList<Int>, row: Int, col: Int) {
    val pivotVal = tableau[row][col]
    val inv = 1.0 / pivotVal
    val nCols = tableau[0].size
    for (j in 0 until nCols) tableau[row][j] *= inv
    for (i in tableau.indices) {
        if (i == row) continue
        val factor = tableau[i][col]
        if (Math.abs(factor) > EPS_VAL) {
            for (j in 0 until nCols) tableau[i][j] -= factor * tableau[row][j]
        }
    }
    basis[row] = col
}

fun setObjective(tableau: MutableList<MutableList<Double>>, basis: MutableList<Int>, c: List<Double>) {
    val m = basis.size
    val n = tableau[0].size - 1
    val obj = MutableList(n) { j -> -c[j] }
    obj.add(0.0)
    for (i in 0 until m) {
        val cb = c[basis[i]]
        if (Math.abs(cb) > EPS_VAL) {
            val row = tableau[i]
            for (j in 0..n) obj[j] += cb * row[j]
        }
    }
    if (tableau.size == m) tableau.add(obj)
    else tableau[m] = obj
}

fun simplexMax(tableau: MutableList<MutableList<Double>>, basis: MutableList<Int>): Boolean {
    val m = basis.size
    val n = tableau[0].size - 1
    val maxIter = 200000
    for (iter in 0 until maxIter) {
        var entering: Int? = null
        for (j in 0 until n) {
            if (tableau[m][j] < -EPS_VAL) { entering = j; break }
        }
        if (entering == null) return true
        var minRatio = Double.POSITIVE_INFINITY
        var leaving: Int? = null
        for (i in 0 until m) {
            val a = tableau[i][entering]
            if (a > EPS_VAL) {
                val ratio = tableau[i].last() / a
                if (ratio < minRatio - EPS_VAL) { minRatio = ratio; leaving = i }
            }
        }
        if (leaving == null) return false
        doPivot(tableau, basis, leaving, entering)
    }
    throw RuntimeException("Simplex did not converge")
}

data class BuildTableauResult(
    val tableau: MutableList<MutableList<Double>>,
    val basis: MutableList<Int>,
    val artIndices: MutableList<Int>,
    val nTotal: Int
)

fun buildTableau(nVars: Int, constraints: List<Triple<List<Double>, String, Double>>): BuildTableauResult {
    val rows = mutableListOf<MutableList<Double>>()
    val rhs = mutableListOf<Double>()
    val basis = mutableListOf<Int>()
    val artIndices = mutableListOf<Int>()
    var nTotal = nVars

    fun addVar() {
        for (r in rows) r.add(0.0)
        nTotal += 1
    }

    for (ci in constraints.indices) {
        var coeffs = constraints[ci].first.toMutableList()
        var sense = constraints[ci].second
        var b = constraints[ci].third
        if (b < 0) {
            coeffs = coeffs.map { -it }.toMutableList()
            b = -b
            if (sense == "<=") sense = ">=" else if (sense == ">=") sense = "<="
        }
        val row = coeffs.toMutableList()
        while (row.size < nTotal) row.add(0.0)
        when (sense) {
            "<=" -> {
                addVar()
                row.add(1.0)
                basis.add(nTotal - 1)
            }
            ">=" -> {
                addVar()
                row.add(-1.0)
                addVar()
                row.add(1.0)
                basis.add(nTotal - 1)
                artIndices.add(nTotal - 1)
            }
            "=" -> {
                addVar()
                row.add(1.0)
                basis.add(nTotal - 1)
                artIndices.add(nTotal - 1)
            }
            else -> throw IllegalArgumentException("Unknown constraint sense")
        }
        rows.add(row)
        rhs.add(b)
    }
    val tableau = rows.mapIndexed { i, r -> (r + mutableListOf(rhs[i])).toMutableList() }.toMutableList()
    return BuildTableauResult(tableau, basis, artIndices, nTotal)
}

data class RemoveArtResult(
    val tableau: MutableList<MutableList<Double>>,
    val basis: MutableList<Int>,
    val mapping: Map<Int, Int>
)

fun removeArtificial(tableau: MutableList<MutableList<Double>>, basis: MutableList<Int>, artIndices: List<Int>): RemoveArtResult {
    val artSet = artIndices.toHashSet()
    var m = basis.size
    var i = 0
    while (i < m) {
        if (basis[i] in artSet) {
            val n = tableau[0].size - 1
            var pivotCol: Int? = null
            for (j in 0 until n) {
                if (j in artSet) continue
                if (Math.abs(tableau[i][j]) > EPS_VAL) { pivotCol = j; break }
            }
            if (pivotCol != null) {
                doPivot(tableau, basis, i, pivotCol)
                i++
            } else {
                if (Math.abs(tableau[i].last()) > EPS_VAL)
                    throw RuntimeException("Infeasible during artificial removal")
                tableau.removeAt(i)
                basis.removeAt(i)
                m--
                continue
            }
        } else { i++ }
    }
    val n = tableau[0].size - 1
    val keepCols = (0 until n).filter { it !in artSet }
    val mapping = keepCols.mapIndexed { newIdx, old -> old to newIdx }.toMap()
    val newTableau = tableau.map { row ->
        val newRow = keepCols.map { j -> row[j] }.toMutableList()
        newRow.add(row.last())
        newRow
    }.toMutableList()
    val newBasis = basis.map { mapping[it]!! }.toMutableList()
    return RemoveArtResult(newTableau, newBasis, mapping)
}

fun solveLP(nVars: Int, constraints: List<Triple<List<Double>, String, Double>>, objective: List<Double>): Double {
    val buildResult = buildTableau(nVars, constraints)
    var tableau = buildResult.tableau
    var basis = buildResult.basis
    val artIndices = buildResult.artIndices
    var nTotal = buildResult.nTotal
    var mapping: Map<Int, Int>
    if (artIndices.isNotEmpty()) {
        val cPhase1 = MutableList(nTotal) { 0.0 }
        for (j in artIndices) cPhase1[j] = -1.0
        setObjective(tableau, basis, cPhase1)
        if (!simplexMax(tableau, basis)) throw RuntimeException("Unbounded in phase I")
        if (tableau.last().last() < -1e-7) throw RuntimeException("Infeasible LP")
        tableau.removeAt(tableau.size - 1)
        val removeResult = removeArtificial(tableau, basis, artIndices)
        tableau = removeResult.tableau
        basis = removeResult.basis
        mapping = removeResult.mapping
    } else {
        mapping = (0 until nTotal).associateWith { it }
    }
    val nTotal2 = tableau[0].size - 1
    val cPhase2 = MutableList(nTotal2) { 0.0 }
    for (j in objective.indices) {
        if (mapping.containsKey(j)) cPhase2[mapping[j]!!] = -objective[j]
    }
    setObjective(tableau, basis, cPhase2)
    if (!simplexMax(tableau, basis)) throw RuntimeException("Unbounded in phase II")
    return -tableau.last().last()
}

fun cartesianProduct(arr: List<Int>, repeat: Int): List<List<Int>> {
    var result = listOf(listOf<Int>())
    for (r in 0 until repeat) {
        val next = mutableListOf<List<Int>>()
        for (prev in result) for (v in arr) next.add(prev + v)
        result = next
    }
    return result
}

fun buildAndSolve(numDice: Int): Double {
    val values = listOf(1, 2, 3, 4, 5, 6)
    val states = cartesianProduct(values, numDice)
    val numStates = states.size
    val hideOptions = (0 until numDice).toList()

    val signalSet = mutableSetOf<List<Int>>()
    for (t in states) {
        for (h in hideOptions) {
            val revealed = t.filterIndexed { i, _ -> i != h }.sorted()
            signalSet.add(revealed)
        }
    }
    val signals = signalSet.sortedWith(Comparator { a, b ->
        for (i in 0 until minOf(a.size, b.size)) {
            val cmp = a[i].compareTo(b[i])
            if (cmp != 0) return@Comparator cmp
        }
        a.size.compareTo(b.size)
    })
    val signalIndex = signals.mapIndexed { i, s -> s to i }.toMap()

    val numX = numStates * numDice
    val numZ = signals.size
    val nVars = numX + numZ

    fun xIndex(stateIdx: Int, hideIdx: Int) = stateIdx * numDice + hideIdx
    fun zIndex(signalIdx: Int) = numX + signalIdx

    val constraints = mutableListOf<Triple<List<Double>, String, Double>>()
    val pState = 1.0 / numStates

    for (sIdx in 0 until numStates) {
        val coeffs = MutableList(nVars) { 0.0 }
        for (h in hideOptions) coeffs[xIndex(sIdx, h)] = 1.0
        constraints.add(Triple(coeffs, "=", pState))
    }

    for (sig in signals) {
        val bVal = sig.max()!!.toDouble()
        val sigIdx = signalIndex[sig]!!
        val coeffsVis = MutableList(nVars) { 0.0 }
        val coeffsHid = MutableList(nVars) { 0.0 }
        coeffsVis[zIndex(sigIdx)] = -1.0
        coeffsHid[zIndex(sigIdx)] = -1.0
        for (sIdx in states.indices) {
            val t = states[sIdx]
            for (h in hideOptions) {
                val revealed = t.filterIndexed { i, _ -> i != h }.sorted()
                if (revealed == sig) {
                    coeffsVis[xIndex(sIdx, h)] += bVal
                    val hiddenVal = t[h].toDouble()
                    coeffsHid[xIndex(sIdx, h)] += hiddenVal
                }
            }
        }
        constraints.add(Triple(coeffsVis.toList(), "<=", 0.0))
        constraints.add(Triple(coeffsHid.toList(), "<=", 0.0))
    }

    val objective = MutableList(nVars) { 0.0 }
    for (sigIdx in 0 until numZ) objective[zIndex(sigIdx)] = 1.0

    return solveLP(nVars, constraints, objective)
}

fun main() {
    val valTwo = buildAndSolve(2)
    val targetExact = 145.0 / 36.0
    check(Math.abs(valTwo - targetExact) < 1e-8) { "valTwo check 1 failed" }
    check(Math.abs(valTwo - 4.027778) < 1e-6) { "valTwo check 2 failed" }
    val valThree = buildAndSolve(3)
    println("%.6f".format(valThree))
}
