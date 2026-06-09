// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/981.py

import java.math.BigInteger

val MODVAL: Long = 888888883L

fun qbinomMinus1Int(n: Int, k: Int): BigInteger {
    if ((n and 1) == 0 && (k and 1) == 1) return BigInteger.ZERO
    return bigComb(n shr 1, k shr 1)
}

fun bigComb(n: Int, k: Int): BigInteger {
    if (k < 0 || k > n) return BigInteger.ZERO
    if (k == 0 || k == n) return BigInteger.ONE
    var num = BigInteger.ONE
    var den = BigInteger.ONE
    val kk = if (k < n - k) k else n - k
    for (i in 0 until kk) {
        num = num * BigInteger.valueOf((n - i).toLong())
        den = den * BigInteger.valueOf((i + 1).toLong())
    }
    return num / den
}

fun bigFactorial(n: Int): BigInteger {
    var result = BigInteger.ONE
    for (i in 2..n) result = result * BigInteger.valueOf(i.toLong())
    return result
}

fun nExact(X: Int, Y: Int, Z: Int): BigInteger {
    if ((X and 1) != (Y and 1) || (Y and 1) != (Z and 1)) return BigInteger.ZERO
    val n = X + Y + Z
    val total = bigFactorial(n) / (bigFactorial(X) * bigFactorial(Y) * bigFactorial(Z))
    val diff = qbinomMinus1Int(n, X) * qbinomMinus1Int(n - X, Y)
    val sign = if (((X shr 1) + (Y shr 1) + (Z shr 1) and 1) == 0) BigInteger.ONE else BigInteger.valueOf(-1)
    return (total + sign * diff) / BigInteger.TWO
}

fun modpow(baseVal: Long, exp: Long, mod: Long): Long {
    var result = 1L
    var b = baseVal % mod
    var e = exp
    while (e > 0L) {
        if (e and 1L == 1L) result = (result * b) % mod
        b = (b * b) % mod
        e = e shr 1
    }
    return result
}

fun mainSolve(): Long {
    val assert1 = nExact(2, 2, 2)
    check(assert1 == BigInteger.valueOf(42L)) { "Assert 1 failed: $assert1" }
    val assert2 = nExact(8, 8, 8)
    check(assert2 == BigInteger.valueOf(4732773210L)) { "Assert 2 failed: $assert2" }

    val cubes = IntArray(88) { i -> i * i * i }
    val maxN = 3 * cubes[87]

    val fact = LongArray(maxN + 1)
    fact[0] = 1L
    for (i in 1..maxN) {
        fact[i] = (fact[i - 1] * i.toLong()) % MODVAL
    }

    val invfact = LongArray(maxN + 1)
    invfact[maxN] = modpow(fact[maxN], MODVAL - 2L, MODVAL)
    for (i in maxN downTo 1) {
        invfact[i - 1] = (invfact[i] * i.toLong()) % MODVAL
    }

    val inv2 = (MODVAL + 1L) / 2L

    val halves = IntArray(88) { ai -> cubes[ai] shr 1 }
    val invf = LongArray(88) { ai -> invfact[cubes[ai]] }
    val par = IntArray(88) { i -> i and 1 }

    fun combMod(n: Int, k: Int): Long {
        if (k < 0 || k > n) return 0L
        return fact[n] * invfact[k] % MODVAL * invfact[n - k] % MODVAL
    }

    var totalSum = 0L
    for (ai in 0 until 88) {
        val X = cubes[ai]
        val hx = halves[ai]
        val invX = invf[ai]
        val px = par[ai]
        for (bj in 0 until 88) {
            val Y = cubes[bj]
            val hy = halves[bj]
            val invY = invf[bj]
            val py = par[bj]
            for (ck in 0 until 88) {
                if (px != py || py != par[ck]) continue
                val Z = cubes[ck]
                val hz = halves[ck]
                val invZ = invf[ck]
                val n = X + Y + Z
                var T = fact[n]
                T = (T * invX) % MODVAL
                T = (T * invY) % MODVAL
                T = (T * invZ) % MODVAL
                val D: Long
                if ((n and 1) == 0 && (X and 1) == 1) {
                    D = 0L
                } else {
                    val D1 = combMod(n shr 1, hx)
                    val n2 = n - X
                    if ((n2 and 1) == 0 && (Y and 1) == 1) {
                        D = 0L
                    } else {
                        val D2 = combMod(n2 shr 1, hy)
                        D = (D1 * D2) % MODVAL
                    }
                }
                val Nmod: Long
                if (((hx + hy + hz) and 1) == 0) {
                    Nmod = ((T + D) % MODVAL * inv2) % MODVAL
                } else {
                    Nmod = (((T - D) % MODVAL + MODVAL) % MODVAL * inv2) % MODVAL
                }
                totalSum += Nmod
                if (totalSum >= MODVAL) totalSum -= MODVAL
            }
        }
    }
    return totalSum % MODVAL
}

fun main() {
    println(mainSolve())
}
