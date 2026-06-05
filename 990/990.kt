// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/990.py

val MOD: Long = 1_000_000_007L
val MAX_N: Int = 50
val MAX_TERMS: Int = (MAX_N + 1) / 2
val MAX_CARRY: Int = 25
val CARRY_MIN: Int = -MAX_CARRY
val CARRY_MAX: Int = MAX_CARRY

fun buildBinom(limit: Int): Array<LongArray> {
    val comb = Array(limit + 1) { LongArray(limit + 1) }
    for (n in 0..limit) {
        comb[n][0] = 1L
        comb[n][n] = 1L
        for (k in 1 until n) {
            comb[n][k] = (comb[n - 1][k - 1] + comb[n - 1][k]) % MOD
        }
    }
    return comb
}

fun convolveSmall(poly: LongArray, width: Int): LongArray {
    val out = LongArray(poly.size + width - 1)
    for (i in poly.indices) {
        if (poly[i] == 0L) continue
        for (digit in 0 until width) {
            out[i + digit] = (out[i + digit] + poly[i]) % MOD
        }
    }
    return out
}

fun buildSumTables(limit: Int): Array<Array<LongArray>> {
    val ways0to9 = arrayOfNulls<LongArray>(limit + 1)
    ways0to9[0] = longArrayOf(1L)
    for (p in 1..limit) {
        ways0to9[p] = convolveSmall(ways0to9[p - 1]!!, 10)
    }
    val tables = Array(limit + 1) { arrayOfNulls<LongArray>(limit + 1) }
    for (p in 0..limit) {
        tables[p][0] = ways0to9[p]!!
        for (q in 1..limit) {
            tables[p][q] = convolveSmall(tables[p][q - 1]!!, 9)
        }
    }
    return Array(limit + 1) { p -> Array(limit + 1) { q -> tables[p][q]!! } }
}

val BINOM: Array<LongArray> = buildBinom(MAX_TERMS)
val SUM_TABLES: Array<Array<LongArray>> = buildSumTables(2 * MAX_TERMS)
val transCache: HashMap<Triple<Int, Int, Int>, List<Quadruple>> = HashMap()

data class Quadruple(val a: Int, val b: Int, val c: Int, val d: Long)

fun getTransitions(activeLeft: Int, activeRight: Int, carry: Int): List<Quadruple> {
    val key = Triple(activeLeft, activeRight, carry)
    transCache[key]?.let { return it }
    if (activeLeft == 0 && activeRight == 0) {
        transCache[key] = emptyList()
        return emptyList()
    }
    val result = mutableListOf<Quadruple>()
    for (nextLeft in 0..activeLeft) {
        val chooseLeft = BINOM[activeLeft][nextLeft]
        val endingLeft = activeLeft - nextLeft
        for (nextRight in 0..activeRight) {
            val chooseTerms = (chooseLeft * BINOM[activeRight][nextRight]) % MOD
            val continuing = nextLeft + nextRight
            val ending = (activeLeft - nextLeft) + (activeRight - nextRight)
            val counts = SUM_TABLES[continuing][ending]
            val base = -carry - endingLeft + 9 * activeRight
            for (nextCarry in CARRY_MIN..CARRY_MAX) {
                val index = 10 * nextCarry + base
                if (index >= 0 && index < counts.size) {
                    val ways = counts[index]
                    if (ways != 0L) {
                        val weight = (chooseTerms * ways) % MOD
                        result.add(Quadruple(nextLeft, nextRight, nextCarry, weight))
                    }
                }
            }
        }
    }
    transCache[key] = result
    return result
}

fun solve(limit: Int): Long {
    val dp: Array<HashMap<Triple<Int, Int, Int>, Long>> = Array(limit + 1) { HashMap() }
    for (leftTerms in 1..MAX_TERMS) {
        for (rightTerms in 1..MAX_TERMS) {
            val baseLength = leftTerms + rightTerms - 1
            if (baseLength <= limit) {
                val state = Triple(leftTerms, rightTerms, 0)
                dp[baseLength][state] = ((dp[baseLength][state] ?: 0L) + 1L) % MOD
            }
        }
    }
    var answer = 0L
    for (usedLength in 0..limit) {
        val current = dp[usedLength]
        if (current.isEmpty()) continue
        answer = (answer + (current[Triple(0, 0, 0)] ?: 0L)) % MOD
        for ((state, waysSoFar) in current.entries.toList()) {
            if (waysSoFar == 0L) continue
            val (activeLeft, activeRight, carry) = state
            if (activeLeft == 0 && activeRight == 0) continue
            val nextLength = usedLength + activeLeft + activeRight
            if (nextLength > limit) continue
            val bucket = dp[nextLength]
            for (quad in getTransitions(activeLeft, activeRight, carry)) {
                val newState = Triple(quad.a, quad.b, quad.c)
                bucket[newState] = ((bucket[newState] ?: 0L) + waysSoFar * quad.d) % MOD
            }
        }
    }
    return answer
}

fun runSelfChecks() {
    check(solve(3) == 9L)
    check(solve(5) == 171L)
    check(solve(7) == 4878L)
}

fun main() {
    runSelfChecks()
    println(solve(50))
}
