// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/991.py

import kotlin.math.sqrt

val LIMIT = 10_000_000L

fun gcdLong(a: Long, b: Long): Long = if (b == 0L) a else gcdLong(b, a % b)

fun isqrtLong(n: Long): Long {
    if (n < 0L) return 0L
    var x = sqrt(n.toDouble()).toLong()
    while (x * x > n) x--
    while ((x + 1) * (x + 1) <= n) x++
    return x
}

fun primitiveSolutions(limit: Long): List<Long> {
    val sums = mutableListOf<Long>()

    val mMax = isqrtLong(limit / 4L) + 2L
    for (m in 1L..mMax) {
        val nMin = isqrtLong(3L * m * m) + 1L
        val nMax = 2L * m - 1L
        for (n in nMin..nMax) {
            if (gcdLong(m, n) != 1L) continue
            val a = 4L * m * m - n * n
            val c = n * n - 3L * m * m
            val b = 5L * m * m - n * n + m * n
            val s = a + b + c
            if (a <= 0L || b <= 0L || c <= 0L) continue
            if (s <= limit) sums.add(s)
        }
    }

    val alpha = 2.0 + sqrt(3.0)
    val beta = (5.0 + sqrt(21.0)) / 2.0
    var k = 1L
    while (true) {
        var low = (alpha * k.toDouble()).toLong() + 1L
        while ((2L * low - k) * (2L * low - k) <= 3L * low * low) {
            low++
        }
        var highPos = (beta * k.toDouble()).toLong()
        while (highPos > 0L && !(-highPos * highPos + 5L * highPos * k - k * k > 0L)) {
            highPos--
        }
        val highSum = (limit + k * k) / (5L * k)
        val high = minOf(highPos, highSum)
        if (low > highSum) break
        for (m in low..high) {
            if (gcdLong(m, k) != 1L) continue
            val n = 2L * m - k
            val a = 4L * m * m - n * n
            val c = n * n - 3L * m * m
            val b = 5L * m * m - n * n - m * n
            val s = a + b + c
            if (a <= 0L || b <= 0L || c <= 0L) continue
            if (s <= limit) sums.add(s)
        }
        k++
    }

    return sums
}

fun solve(limit: Long): Long {
    val primitive = primitiveSolutions(limit)
    var total = 0L
    for (s in primitive) {
        val count = limit / s
        total += s * count * (count + 1L) / 2L
    }
    return total
}

fun bruteForce(limit: Long): Long {
    var total = 0L
    for (a in 1L..limit) {
        for (b in 1L..(limit - a)) {
            val maxC = limit - a - b
            for (c in 1L..maxC) {
                val lhsNum = a * (a + c) + (b + c) * (b + c)
                val lhsDen = (b + c) * (a + c)
                if (lhsNum == 4L * lhsDen) {
                    total += a + b + c
                }
            }
        }
    }
    return total
}

fun runTests() {
    val m = 4L
    val n = 7L
    check((4L*m*m - n*n) == 15L && (5L*m*m - n*n - m*n) == 3L && (n*n - 3L*m*m) == 1L)
    check((4L*m*m - n*n) == 15L && (5L*m*m - n*n + m*n) == 59L && (n*n - 3L*m*m) == 1L)
    check(solve(18L) == 0L)
    check(solve(19L) == bruteForce(19L))
    check(solve(75L) == bruteForce(75L))
    check(solve(200L) == bruteForce(200L))
}

fun main() {
    runTests()
    println(solve(LIMIT))
}
