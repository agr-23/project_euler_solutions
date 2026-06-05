// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/992.py

val MOD: Long = 987_898_789L

fun modPow(base: Long, exp: Long, modulus: Long): Long {
    var result = 1L
    var b = base % modulus
    var e = exp
    while (e > 0L) {
        if (e and 1L == 1L) result = result * b % modulus
        e = e shr 1
        b = b * b % modulus
    }
    return result
}

fun buildCombinatorics(limit: Int, modv: Long): Pair<LongArray, LongArray> {
    val fact = LongArray(limit + 1)
    fact[0] = 1L
    for (i in 1..limit) {
        fact[i] = fact[i - 1] * i.toLong() % modv
    }
    val invFact = LongArray(limit + 1)
    invFact[limit] = modPow(fact[limit], modv - 2L, modv)
    for (i in limit downTo 1) {
        invFact[i - 1] = invFact[i] * i.toLong() % modv
    }
    return Pair(fact, invFact)
}

class Comb(limit: Int, val modv: Long) {
    val fact: LongArray
    val invFact: LongArray

    init {
        val (f, inv) = buildCombinatorics(limit, modv)
        fact = f
        invFact = inv
    }

    fun call(n: Long, r: Long): Long {
        if (r < 0L || r > n) return 0L
        return fact[n.toInt()] * invFact[r.toInt()] % modv * invFact[(n - r).toInt()] % modv
    }
}

fun endpointCount(n: Int, k: Long, end: Int, comb: Comb, modv: Long): Long {
    if (n == 0) return 1L
    val right = LongArray(n)
    right[0] = k - (if (end == 0) 1L else 0L)
    if (n >= 2) {
        right[1] = 2L - (if (end == 1) 1L else 0L)
    }
    for (i in 2 until n) {
        right[i] = 1L + right[i - 2] - (if (end == i) 1L else 0L)
    }
    var ways = 1L
    for (v in 1 until n) {
        val outDegree = k + v.toLong() - (if (end == v) 1L else 0L)
        if (v < end) {
            ways = ways * comb.call(outDegree - 1L, right[v] - 1L) % modv
        } else if (v == end) {
            ways = ways * comb.call(outDegree, right[v]) % modv
        } else {
            ways = ways * comb.call(outDegree - 1L, right[v]) % modv
        }
    }
    return ways
}

fun journeyCount(n: Int, k: Long, comb: Comb, modv: Long): Long {
    var total = 0L
    for (end in 0..n) {
        total = (total + endpointCount(n, k, end, comb, modv)) % modv
    }
    return total
}

fun solve(): Long {
    val n = 500
    val ks = listOf(1L, 10L, 100L, 1000L, 10000L)
    val maxK = ks.max()!!
    val comb = Comb((maxK + n).toInt(), MOD)
    check(journeyCount(3, 2L, comb, MOD) == 17L)
    check(journeyCount(6, 1L, comb, MOD) == 1320L)
    check(journeyCount(6, 5L, comb, MOD) == 16_793_280L)
    var answer = 0L
    for (k in ks) {
        answer = (answer + journeyCount(n, k, comb, MOD)) % MOD
    }
    return answer
}

fun main() {
    println(solve())
}
