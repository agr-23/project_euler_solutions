// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/994.py

import java.math.BigInteger

val MOD: Long = 1_000_000_007L
val INV2: Long = (MOD + 1L) / 2L

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

val INV6: Long = modPow(6L, MOD - 2L, MOD)

fun c2Mod(x: Long): Long {
    val xm = ((x % MOD) + MOD) % MOD
    return xm * ((xm - 1L + MOD) % MOD) % MOD * INV2 % MOD
}

fun c3Mod(x: Long): Long {
    val xm = ((x % MOD) + MOD) % MOD
    return xm * ((xm - 1L + MOD) % MOD) % MOD * ((xm - 2L + MOD) % MOD) % MOD * INV6 % MOD
}

fun p1(n: Long): Long {
    val nm = ((n % MOD) + MOD) % MOD
    return nm * ((nm + 1L) % MOD) % MOD * INV2 % MOD
}

fun p2(n: Long): Long {
    val nm = ((n % MOD) + MOD) % MOD
    return nm * ((nm + 1L) % MOD) % MOD * ((2L * nm + 1L) % MOD) % MOD * INV6 % MOD
}

fun p3(n: Long): Long {
    val s = p1(n)
    return s * s % MOD
}

class TotientPrefix(val limit: Int) {
    val pref0: IntArray
    val pref1: IntArray
    val pref2: IntArray
    val cache: HashMap<Long, Triple<Long, Long, Long>> = HashMap()

    init {
        val (p0, p1a, p2a) = build(limit)
        pref0 = p0; pref1 = p1a; pref2 = p2a
    }

    companion object {
        fun build(limit: Int): Triple<IntArray, IntArray, IntArray> {
            val phi = IntArray(limit + 1) { it }
            for (p in 2..limit) {
                if (phi[p] == p) {
                    var j = p
                    while (j <= limit) { phi[j] -= phi[j] / p; j += p }
                }
            }
            val pref0 = IntArray(limit + 1)
            val pref1 = IntArray(limit + 1)
            val pref2 = IntArray(limit + 1)
            var s0 = 0L; var s1 = 0L; var s2 = 0L
            for (i in 1..limit) {
                val ph = phi[i].toLong() % MOD
                val im = i.toLong() % MOD
                s0 = (s0 + ph) % MOD
                s1 = (s1 + im * ph) % MOD
                s2 = (s2 + im * im % MOD * ph) % MOD
                pref0[i] = s0.toInt()
                pref1[i] = s1.toInt()
                pref2[i] = s2.toInt()
            }
            return Triple(pref0, pref1, pref2)
        }
    }

    fun values(n: Long): Triple<Long, Long, Long> {
        if (n <= 0L) return Triple(0L, 0L, 0L)
        if (n <= limit.toLong()) {
            val ni = n.toInt()
            return Triple(pref0[ni].toLong(), pref1[ni].toLong(), pref2[ni].toLong())
        }
        cache[n]?.let { return it }
        var f0 = p1(n)
        var f1 = p2(n)
        var f2 = p3(n)
        var l = 2L
        while (l <= n) {
            val q = n / l
            val r = n / q
            val sum0 = ((r - l + 1L) % MOD + MOD) % MOD
            val sum1 = (p1(r) - p1(l - 1L) + MOD) % MOD
            val sum2 = (p2(r) - p2(l - 1L) + MOD) % MOD
            val (sub0, sub1, sub2) = values(q)
            f0 = (f0 - sum0 * sub0 % MOD + MOD) % MOD
            f1 = (f1 - sum1 * sub1 % MOD + MOD) % MOD
            f2 = (f2 - sum2 * sub2 % MOD + MOD) % MOD
            l = r + 1L
        }
        val out = Triple(f0, f1, f2)
        cache[n] = out
        return out
    }
}

fun nonconcurrentCandidateCount(m: Long, n: Long): Long {
    val mm = ((m % MOD) + MOD) % MOD
    val mm1 = ((m - 1L) % MOD + MOD) % MOD
    val nm = ((n % MOD) + MOD) % MOD
    val nm1 = ((n - 1L) % MOD + MOD) % MOD
    val np1 = ((n + 1L) % MOD + MOD) % MOD
    val twoSameBottom = mm * mm1 % MOD * nm % MOD * nm1 % MOD * np1 % MOD * INV6 % MOD
    val distinctBottoms = c3Mod(m) * ((c3Mod(n + 2L) - nm + MOD) % MOD) % MOD
    return (twoSameBottom + distinctBottoms) % MOD
}

fun weightedGcdSum(m: Long, n: Long, tp: TotientPrefix): Long {
    val m1 = m - 1L
    val n1 = n - 1L
    val upper = minOf(m1, n1)
    var total = 0L
    var l = 1L
    while (l <= upper) {
        val qm = m1 / l
        val qn = n1 / l
        val r = minOf(m1 / qm, n1 / qn, upper)
        val (r0, r1, r2) = tp.values(r)
        val (l0, l1, l2) = tp.values(l - 1L)
        val s0 = (r0 - l0 + MOD) % MOD
        val s1 = (r1 - l1 + MOD) % MOD
        val s2 = (r2 - l2 + MOD) % MOD
        val qmMod = qm % MOD
        val qnMod = qn % MOD
        val mm = m % MOD
        val nm = n % MOD
        val a0m = qmMod * mm % MOD
        val a1m = (MOD - qmMod * ((qm + 1L) % MOD) % MOD * INV2 % MOD) % MOD
        val a0n = qnMod * nm % MOD
        val a1n = (MOD - qnMod * ((qn + 1L) % MOD) % MOD * INV2 % MOD) % MOD
        val c0 = a0m * a0n % MOD
        val c1 = (a0m * a1n + a1m * a0n) % MOD
        val c2 = a1m * a1n % MOD
        total = (total + c0 * s0 % MOD + c1 * s1 % MOD + c2 * s2 % MOD) % MOD
        l = r + 1L
    }
    return total
}

fun concurrentTripleCount(m: Long, n: Long, tp: TotientPrefix): Long {
    val gcdPart = weightedGcdSum(m, n, tp)
    val ep = c2Mod(m) * c2Mod(n) % MOD
    return (gcdPart - ep + MOD) % MOD
}

fun tFunc(m: Long, n: Long, tp: TotientPrefix): Long {
    val ncc = nonconcurrentCandidateCount(m, n)
    val ctc = concurrentTripleCount(m, n, tp)
    return (ncc - ctc + MOD) % MOD
}

fun main() {
    val sieveLimitStr = System.getenv("SIEVE_LIMIT") ?: "10000000"
    val sieveLimit = sieveLimitStr.toInt()
    val tp = TotientPrefix(sieveLimit)
    check(tFunc(2L, 3L, tp) == 8L)
    check(tFunc(3L, 5L, tp) == 146L)
    check(tFunc(12L, 23L, tp) == 756716L)
    println(tFunc(1234L * 100_000_000L, 2345L * 100_000_000L, tp))
}
