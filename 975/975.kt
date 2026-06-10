// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/975.py

import kotlin.math.*

fun primesUpTo(n: Int): List<Int> {
    val sieve = BooleanArray(n + 1) { true }
    if (n >= 0) {
        sieve[0] = false
        if (n >= 1) sieve[1] = false
    }
    val r = sqrt(n.toDouble()).toInt()
    for (p in 2..r) {
        if (sieve[p]) {
            var j = p * p
            while (j <= n) {
                sieve[j] = false
                j += p
            }
        }
    }
    val result = mutableListOf<Int>()
    for (i in 0..n) {
        if (sieve[i]) result.add(i)
    }
    return result
}

fun gcdInt(a: Int, b: Int): Int {
    var aa = a; var bb = b
    while (bb != 0) { val t = bb; bb = aa % bb; aa = t }
    return aa
}

fun normalizedPair(num: Int, den: Int): Pair<Int, Int> {
    val common = gcdInt(abs(num), abs(den))
    return Pair(num / common, den / common)
}

fun heightVal(a: Int, b: Int, point: Pair<Int, Int>): Double {
    val (num, den) = point
    if (num == 0) return 0.0
    if (num == den) return 1.0
    val x = num.toDouble() / den.toDouble()
    var z = 0.5 - (b * cos(a * PI * x) + a * cos(b * PI * x)) / (2.0 * (a + b))
    if (z < 0.0 && z > -1e-14) return 0.0
    if (z > 1.0 && z < 1.0 + 1e-14) return 1.0
    return z
}

fun derivativeIntervalSign(a: Int, b: Int, left: Pair<Int, Int>, right: Pair<Int, Int>): Int {
    val (leftNum, leftDen) = left
    val (rightNum, rightDen) = right
    val x = (leftNum * rightDen + rightNum * leftDen) / (2.0 * leftDen * rightDen)
    val value = sin((a + b) * PI * x * 0.5) * cos(abs(a - b) * PI * x * 0.5)
    return if (value > 0.0) 1 else -1
}

val turningValuesCache = mutableMapOf<Pair<Int, Int>, DoubleArray>()

fun turningValues(a: Int, b: Int): DoubleArray {
    val cacheKey = Pair(a, b)
    turningValuesCache[cacheKey]?.let { return it }

    if (a <= 0 || b <= 0 || (a and 1) == 0 || (b and 1) == 0)
        throw IllegalArgumentException("a,b must be positive odd integers")
    if (a == b) throw IllegalArgumentException("a != b required")
    val s = a + b
    val delta = abs(a - b)
    if (s % 2 != 0 || delta % 2 != 0)
        throw IllegalArgumentException("For odd a,b, a+b and |a-b| must be even")

    val candidates = mutableListOf<Pair<Int, Int>>()
    for (k in 0..s / 2) {
        candidates.add(normalizedPair(2 * k, s))
    }
    for (k in 0 until delta / 2) {
        candidates.add(normalizedPair(2 * k + 1, delta))
    }

    val pointSet = linkedMapOf<Pair<Int, Int>, Pair<Int, Int>>()
    for (p in candidates) {
        if (!pointSet.containsKey(p)) pointSet[p] = p
    }
    val points = pointSet.values.sortedBy { it.first.toDouble() / it.second.toDouble() }

    val intervalSigns = mutableListOf<Int>()
    for (idx in 0 until points.size - 1) {
        intervalSigns.add(derivativeIntervalSign(a, b, points[idx], points[idx + 1]))
    }

    val kept = mutableListOf<Pair<Int, Int>>()
    kept.add(points[0])
    for (idx in 1 until points.size - 1) {
        if (intervalSigns[idx - 1] != intervalSigns[idx]) {
            kept.add(points[idx])
        }
    }
    kept.add(points[points.size - 1])

    val result = DoubleArray(kept.size) { heightVal(a, b, kept[it]) }
    turningValuesCache[cacheKey] = result
    return result
}

fun computeF(a: Int, b: Int, c: Int, d: Int): Double {
    val za = turningValues(a, b)
    val zb = turningValues(c, d)
    var i = 0
    var j = 0
    var current = 0.0
    var total = 0.0
    var upward = true
    val eps = 1e-12
    val maxSteps = 4 * (za.size + zb.size) * (za.size + zb.size)

    for (step in 0 until maxSteps) {
        if (i < 0 || i >= za.size - 1 || j < 0 || j >= zb.size - 1) {
            if (abs(current - 1.0) < 1e-9) return total
            throw RuntimeException("Winding walk left the valid segment range")
        }
        val a0 = za[i]; val a1 = za[i + 1]
        val b0 = zb[j]; val b1 = zb[j + 1]
        val lower = max(min(a0, a1), min(b0, b1))
        val upper = min(max(a0, a1), max(b0, b1))
        val nxt = if (upward) upper else lower
        total += abs(nxt - current)
        var advanced = false
        if (abs(nxt - a0) <= eps) {
            i -= 1
            advanced = true
        } else if (abs(nxt - a1) <= eps) {
            i += 1
            advanced = true
        }
        if (abs(nxt - b0) <= eps) {
            j -= 1
            advanced = true
        } else if (abs(nxt - b1) <= eps) {
            j += 1
            advanced = true
        }
        if (!advanced) throw RuntimeException("Winding walk did not hit a segment endpoint")
        current = nxt
        upward = !upward
    }
    throw RuntimeException("Exceeded maximum winding-walk steps")
}

fun computeG(m: Int, n: Int): Double {
    val ps = primesUpTo(n).filter { it >= m }
    var total = 0.0
    for (i in ps.indices) {
        val p = ps[i]
        for (k in i + 1 until ps.size) {
            val q = ps[k]
            total += computeF(p, q, p, 2 * q - p)
        }
    }
    return total
}

fun main() {
    check(abs(computeF(3, 5, 3, 7) - 7.01772) < 1e-5) { "Assert F(3,5,3,7) failed" }
    check(abs(computeF(7, 17, 9, 19) - 26.79578) < 1e-5) { "Assert F(7,17,9,19) failed" }
    check(abs(computeG(3, 20) - 463.80866) < 1e-5) { "Assert G(3,20) failed" }
    val ans = computeG(500, 1000)
    println("%.5f".format(ans))
}
