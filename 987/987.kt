// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/987.py

import java.math.BigInteger

val WINDOWS: Array<IntArray> = arrayOf(
    intArrayOf(0, 1, 2, 3, 4),
    intArrayOf(1, 2, 3, 4, 5),
    intArrayOf(2, 3, 4, 5, 6),
    intArrayOf(3, 4, 5, 6, 7),
    intArrayOf(4, 5, 6, 7, 8),
    intArrayOf(5, 6, 7, 8, 9),
    intArrayOf(6, 7, 8, 9, 10),
    intArrayOf(7, 8, 9, 10, 11),
    intArrayOf(8, 9, 10, 11, 12),
    intArrayOf(9, 10, 11, 12, 0),
)

val OVERLAP: Array<BooleanArray> = Array(10) { BooleanArray(10) }

val PERMS: Array<Array<BigInteger>> = Array(5) { Array(5) { BigInteger.ZERO } }

fun initGlobals() {
    for (i in 0 until 10) {
        val setI = WINDOWS[i].toHashSet()
        for (j in 0 until 10) {
            OVERLAP[i][j] = WINDOWS[j].any { it in setI }
        }
    }
    for (n in 0 until 5) {
        PERMS[n][0] = BigInteger.ONE
        var value = BigInteger.ONE
        for (k in 1 until 5) {
            if (k <= n) {
                value = value * BigInteger.valueOf((n - (k - 1)).toLong())
                PERMS[n][k] = value
            }
        }
    }
}

fun coloringsOfAllSubsets(starts: IntArray): Array<BigInteger> {
    val k = starts.size
    val full = 1 shl k
    val adjacency = IntArray(k)
    for (i in 0 until k) {
        for (j in i + 1 until k) {
            if (OVERLAP[starts[i]][starts[j]]) {
                adjacency[i] = adjacency[i] or (1 shl j)
                adjacency[j] = adjacency[j] or (1 shl i)
            }
        }
    }
    val independent = BooleanArray(full)
    independent[0] = true
    for (mask in 1 until full) {
        val bit = mask and (-mask)
        val vertex = Integer.numberOfTrailingZeros(bit)
        val rest = mask xor bit
        independent[mask] = independent[rest] && ((adjacency[vertex] and rest) == 0)
    }
    var dp = Array(full) { BigInteger.ZERO }
    dp[0] = BigInteger.ONE
    repeat(4) {
        val newDp = Array(full) { BigInteger.ZERO }
        for (mask in 0 until full) {
            var total = BigInteger.ZERO
            var sub = mask
            while (true) {
                if (independent[sub]) {
                    total = total + dp[mask xor sub]
                }
                if (sub == 0) break
                sub = (sub - 1) and mask
            }
            newDp[mask] = total
        }
        dp = newDp
    }
    return dp
}

fun popcount(x: Int): Int = Integer.bitCount(x)

fun labeledCount(starts: IntArray): BigInteger {
    val k = starts.size
    val full = 1 shl k
    val colorings = coloringsOfAllSubsets(starts)
    val totalActive = IntArray(13)
    val activeMasksByRank = IntArray(13)
    for (index in starts.indices) {
        val bit = 1 shl index
        for (rank in WINDOWS[starts[index]]) {
            totalActive[rank] += 1
            activeMasksByRank[rank] = activeMasksByRank[rank] or bit
        }
    }
    var total = BigInteger.ZERO
    for (mask in 0 until full) {
        var ways = BigInteger.ONE
        for (rank in 0 until 13) {
            val monochromaticHere = popcount(activeMasksByRank[rank] and mask)
            val flexibleHere = totalActive[rank] - monochromaticHere
            val waysAtRank = PERMS[4 - monochromaticHere][flexibleHere]
            if (waysAtRank == BigInteger.ZERO) {
                ways = BigInteger.ZERO
                break
            }
            ways = ways * waysAtRank
        }
        val term = colorings[mask] * ways
        if (popcount(mask) and 1 == 1) {
            total = total - term
        } else {
            total = total + term
        }
    }
    return total
}

fun factorial(n: Int): BigInteger {
    var r = BigInteger.ONE
    for (i in 2..n) r = r * BigInteger.valueOf(i.toLong())
    return r
}

fun feasibleTypeCounts(target: Int): List<IntArray> {
    val results = mutableListOf<IntArray>()
    val counts = IntArray(10)
    val coverage = IntArray(13)
    fun backtrack(pos: Int, remaining: Int) {
        if (pos == 10) {
            if (remaining == 0) results.add(counts.copyOf())
            return
        }
        for (amount in 0..remaining) {
            var ok = true
            for (rank in WINDOWS[pos]) {
                coverage[rank] += amount
                if (coverage[rank] > 4) ok = false
            }
            counts[pos] = amount
            if (ok) backtrack(pos + 1, remaining - amount)
            for (rank in WINDOWS[pos]) {
                coverage[rank] -= amount
            }
        }
        counts[pos] = 0
    }
    backtrack(0, target)
    return results
}

fun countDisjointStraights(target: Int): BigInteger {
    var total = BigInteger.ZERO
    for (typeCounts in feasibleTypeCounts(target)) {
        val starts = mutableListOf<Int>()
        var divisor = BigInteger.ONE
        for (start in typeCounts.indices) {
            val amount = typeCounts[start]
            repeat(amount) { starts.add(start) }
            divisor = divisor * factorial(amount)
        }
        total = total + labeledCount(starts.toIntArray()) / divisor
    }
    return total
}

fun main() {
    initGlobals()
    check(countDisjointStraights(1) == BigInteger.valueOf(10200))
    check(countDisjointStraights(2) == BigInteger.valueOf(31832952))
    println(countDisjointStraights(8))
}
