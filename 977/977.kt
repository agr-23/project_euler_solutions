// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/977.py

val MODVAL: Long = 1_000_000_007L

fun modpow(base: Long, exp: Long, modulus: Long): Long {
    var result = 1L
    var b = base % modulus
    var e = exp
    while (e > 0L) {
        if (e % 2L == 1L) {
            result = result * b % modulus
        }
        e /= 2L
        b = b * b % modulus
    }
    return result
}

fun computeMod(n: Int): Long {
    val N = n.toLong()
    if (N == 1L) return 1L
    var total = 0L
    val mVal = N - 2L
    val sumQ = (mVal * (mVal + 1L) * (2L * mVal + 1L) / 6L + mVal * (mVal + 1L) / 2L) % MODVAL
    total = (sumQ + N) % MODVAL
    for (L in 2L..N) {
        val R = N - L
        if (R >= 1L) {
            val qFull = (R - 1L) / L
            val maxA = qFull + 2L
            val powA = LongArray((maxA + 1).toInt())
            if (L == 2L) {
                for (a in 1L..maxA) {
                    powA[a.toInt()] = (a * a) % MODVAL
                }
            } else if (L == 3L) {
                for (a in 1L..maxA) {
                    val aa = a * a % MODVAL
                    powA[a.toInt()] = aa * a % MODVAL
                }
            } else {
                for (a in 1L..maxA) {
                    powA[a.toInt()] = modpow(a, L, MODVAL)
                }
            }
            for (q in 0L until qFull) {
                val A = q + 1L
                val B = q + 2L
                val AL = powA[A.toInt()]
                val BL = powA[B.toInt()]
                val AL1 = AL * A % MODVAL
                val term = ((q * AL + (A * A % MODVAL) * BL - B * AL1) % MODVAL + MODVAL) % MODVAL
                total = (total + term) % MODVAL
            }
            run {
                val q = qFull
                val mInner = (R - 1L) - qFull * L
                val A = q + 1L
                val B = q + 2L
                val AL = powA[A.toInt()]
                var term = q * AL % MODVAL
                if (mInner >= 1L) {
                    val AL1 = AL * A % MODVAL
                    val expVal = L + 1L - mInner
                    val AL1m: Long = when (expVal) {
                        1L -> A % MODVAL
                        2L -> A * A % MODVAL
                        3L -> A * A % MODVAL * A % MODVAL
                        else -> modpow(A, expVal, MODVAL)
                    }
                    val Bm: Long = when (mInner) {
                        1L -> B % MODVAL
                        2L -> B * B % MODVAL
                        3L -> B * B % MODVAL * B % MODVAL
                        else -> modpow(B, mInner, MODVAL)
                    }
                    term = (term + B * ((AL1m * Bm - AL1) % MODVAL + MODVAL) % MODVAL) % MODVAL
                }
                total = (total + term) % MODVAL
            }
        }
        val q = R / L
        val r = R - q * L
        val A = q + 1L
        val B = q + 2L
        val base: Long = if (r == 0L) {
            modpow(A, L, MODVAL)
        } else {
            modpow(A, L - r, MODVAL) * modpow(B, r, MODVAL) % MODVAL
        }
        total = (total + base) % MODVAL
    }
    return total % MODVAL
}

fun computeExact(n: Int): java.math.BigInteger {
    val N = java.math.BigInteger.valueOf(n.toLong())
    val ONE = java.math.BigInteger.ONE
    val TWO = java.math.BigInteger.TWO
    val THREE = java.math.BigInteger.valueOf(3L)
    val SIX = java.math.BigInteger.valueOf(6L)
    if (n == 1) return ONE
    var total = java.math.BigInteger.ZERO
    val mVal = N - TWO
    val sumQ = mVal * (mVal + ONE) * (TWO * mVal + ONE) / SIX + mVal * (mVal + ONE) / TWO
    total = sumQ + N
    var L = TWO
    while (L <= N) {
        val R = N - L
        if (R >= ONE) {
            val qFull = (R - ONE) / L
            val maxA = qFull + TWO
            val powA = arrayOfNulls<java.math.BigInteger>((maxA.toLong() + 1L).toInt())
            var a = ONE
            while (a <= maxA) {
                powA[a.toInt()] = a.pow(L.toInt())
                a += ONE
            }
            var q = java.math.BigInteger.ZERO
            while (q < qFull) {
                val A = q + ONE
                val B = q + TWO
                val AL = powA[A.toInt()]!!
                val BL = powA[B.toInt()]!!
                val term = q * AL + (A * A) * BL - B * (AL * A)
                total += term
                q += ONE
            }
            run {
                val q2 = qFull
                val mInner = (R - ONE) - qFull * L
                val A = q2 + ONE
                val B = q2 + TWO
                val AL = powA[A.toInt()]!!
                var term = q2 * AL
                if (mInner >= ONE) {
                    val AL1 = AL * A
                    val AL1m = A.pow((L + ONE - mInner).toInt())
                    val Bm = B.pow(mInner.toInt())
                    term += B * (AL1m * Bm - AL1)
                }
                total += term
            }
        }
        val q = R / L
        val r = R - q * L
        val A = q + ONE
        val B = q + TWO
        val base = A.pow((L - r).toInt()) * B.pow(r.toInt())
        total += base
        L += ONE
    }
    return total
}

fun main() {
    check(computeExact(3) == java.math.BigInteger.valueOf(8L)) { "assert failed: computeExact(3)" }
    check(computeExact(7) == java.math.BigInteger.valueOf(174L)) { "assert failed: computeExact(7)" }
    check(computeExact(100) == java.math.BigInteger("570271270297640131")) { "assert failed: computeExact(100)" }
    val n = 1_000_000
    println(computeMod(n))
}
