// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/976.py

val MODVAL: Long = 1234567891L

fun buildInverses(n: Int, mod: Long): LongArray {
    val inv = LongArray(n + 1)
    if (n >= 1) {
        inv[1] = 1L
    }
    for (i in 2..n) {
        inv[i] = mod - (mod / i.toLong()) * inv[(mod % i.toLong()).toInt()] % mod
    }
    return inv
}

fun solve() {
    val n: Long = 10_000_000L
    val k: Long = 10_000_000L
    val e: Long = n / 2L
    val aCnt: Long = (n + 3L) / 4L
    val bCnt: Long = (n + 1L) / 4L
    val c: Long = bCnt - aCnt

    if (e == 0L) {
        val inv = buildInverses((k + 2L).toInt(), MODVAL)
        val inv2 = (MODVAL + 1L) / 2L
        var h: Long = 1L
        var q: Long = 1L
        var sumOddA: Long = 0L
        var ans: Long = 0L
        for (s in 0L..k) {
            if (s > 0L) {
                h = h * ((aCnt + bCnt + s - 1L) % MODVAL) % MODVAL * inv[s.toInt()] % MODVAL
                if (s % 2L == 0L) {
                    val r = s / 2L
                    q = q * ((aCnt + r - 1L) % MODVAL) % MODVAL * inv[r.toInt()] % MODVAL
                }
            }
            val coeff: Long = when {
                c == 0L -> if (s % 2L == 0L) q else 0L
                c == 1L -> q
                else -> if (s % 2L == 0L) q else (MODVAL - q)
            }
            val hOddA = (h - coeff + MODVAL) % MODVAL * inv2 % MODVAL
            sumOddA = (sumOddA + hOddA) % MODVAL
            ans = sumOddA
        }
        println(ans % MODVAL)
        return
    }

    val maxInv = (e + k + 2L).toInt()
    val inv = buildInverses(maxInv, MODVAL)
    val inv2 = (MODVAL + 1L) / 2L

    var totalEven: Long = 1L
    for (m in 0L until k) {
        totalEven = totalEven * ((e + m) % MODVAL) % MODVAL * inv[(m + 1L).toInt()] % MODVAL
    }

    val qmax = k / 2L
    var e0: Long = 1L
    for (q2 in 0L until qmax) {
        e0 = e0 * ((e + q2) % MODVAL) % MODVAL * inv[(q2 + 1L).toInt()] % MODVAL
    }

    var h: Long = 1L
    var q: Long = 1L
    var qsum: Long = 1L
    var sumEven: Long = 0L
    var sumOdd: Long = 0L
    var sumOddA: Long = 0L
    var ans: Long = 0L
    val ab = aCnt + bCnt

    for (s in 0L..k) {
        if (s > 0L) {
            h = h * ((ab + s - 1L) % MODVAL) % MODVAL * inv[s.toInt()] % MODVAL
            if (s % 2L == 0L) {
                val r = s / 2L
                q = q * ((aCnt + r - 1L) % MODVAL) % MODVAL * inv[r.toInt()] % MODVAL
                if (c == 1L) {
                    qsum = qsum * ((aCnt + r) % MODVAL) % MODVAL * inv[r.toInt()] % MODVAL
                }
            }
        }
        val coeff: Long = when {
            c == 0L -> if (s % 2L == 0L) q else 0L
            c == 1L -> qsum
            else -> if (s % 2L == 0L) q else (MODVAL - q)
        }
        val hOddA = (h - coeff + MODVAL) % MODVAL * inv2 % MODVAL
        if (s % 2L == 0L) {
            sumEven = (sumEven + h) % MODVAL
        } else {
            sumOdd = (sumOdd + h) % MODVAL
        }
        sumOddA = (sumOddA + hOddA) % MODVAL
        val m = k - s
        val t0: Long
        val t1: Long
        if (m % 2L == 0L) {
            val e0m = e0
            t0 = e0m * sumOddA % MODVAL
            t1 = (totalEven - e0m + MODVAL) % MODVAL * sumEven % MODVAL
        } else {
            t0 = 0L
            t1 = totalEven * sumOdd % MODVAL
        }
        ans = (ans + t0 + t1) % MODVAL
        if (m > 0L) {
            totalEven = totalEven * (m % MODVAL) % MODVAL * inv[(e + m - 1L).toInt()] % MODVAL
        }
        if (m % 2L == 0L && m >= 2L) {
            val qcur = m / 2L
            e0 = e0 * (qcur % MODVAL) % MODVAL * inv[(e + qcur - 1L).toInt()] % MODVAL
        }
    }
    println(ans % MODVAL)
}

fun main() {
    solve()
}
