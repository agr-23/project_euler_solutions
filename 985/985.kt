// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/985.py

import kotlin.math.*

const val EPS: Double = 1e-12

fun clampVal(x: Double): Double {
    if (x < -1.0) return -1.0
    if (x > 1.0) return 1.0
    return x
}

fun computeTriangleAngles(a: Long, b: Long, c: Long): Triple<Double, Double, Double> {
    val af = a.toDouble()
    val bf = b.toDouble()
    val cf = c.toDouble()

    val cosA = clampVal((bf * bf + cf * cf - af * af) / (2.0 * bf * cf))
    val cosB = clampVal((af * af + cf * cf - bf * bf) / (2.0 * af * cf))
    val cosC = clampVal((af * af + bf * bf - cf * cf) / (2.0 * af * bf))

    val angleA = acos(cosA)
    val angleB = acos(cosB)
    val angleC = acos(cosC)

    check(abs((angleA + angleB + angleC) - PI) < 1e-7) {
        "Angle sum is not pi; check input or numerics."
    }

    return Triple(angleA, angleB, angleC)
}

fun advanceAngles(angleA: Double, angleB: Double, angleC: Double): Triple<Double, Double, Double> {
    return Triple(
        PI - 2.0 * angleB,
        PI - 2.0 * angleC,
        PI - 2.0 * angleA
    )
}

fun countValidSteps(a: Long, b: Long, c: Long, maxSteps: Long): Long {
    var (angleA, angleB, angleC) = computeTriangleAngles(a, b, c)
    var steps = 0L
    for (i in 0 until maxSteps) {
        val (na, nb, nc) = advanceAngles(angleA, angleB, angleC)
        angleA = na
        angleB = nb
        angleC = nc
        if (angleA <= EPS || angleB <= EPS || angleC <= EPS) {
            break
        }
        steps += 1
    }
    return steps
}

fun searchMinPerimeter(targetSteps: Long, maxPerimeter: Long): Pair<Long?, List<Triple<Long, Long, Long>>> {
    var bestPerimeter: Long? = null
    val bestTriangles = mutableListOf<String>()

    for (p in 3L..maxPerimeter) {
        val bp = bestPerimeter
        if (bp != null && p > bp) break

        var a = 1L
        while (a <= p / 3) {
            var b = a
            while (b <= (p - a) / 2) {
                val c = p - a - b
                if (c >= b && a + b > c) {
                    val steps = countValidSteps(a, b, c, targetSteps + 2)
                    if (steps == targetSteps) {
                        val sorted = longArrayOf(a, b, c).also { it.sort() }
                        val key = "${sorted[0]},${sorted[1]},${sorted[2]}"
                        val currentBp = bestPerimeter
                        if (currentBp == null || p < currentBp) {
                            bestPerimeter = p
                            bestTriangles.clear()
                            bestTriangles.add(key)
                        } else if (p == currentBp) {
                            bestTriangles.add(key)
                        }
                    }
                }
                b++
            }
            a++
        }
    }

    val uniqueSorted = bestTriangles.toSortedSet().toList()
    val result = uniqueSorted.map { k ->
        val parts = k.split(",").map { it.toLong() }
        Triple(parts[0], parts[1], parts[2])
    }
    return Pair(bestPerimeter, result)
}

fun solveProblem(targetSteps: Long): Pair<Long, Triple<Long, Long, Long>> {
    var bestPerimeter: Long? = null
    var bestTriangle: Triple<Long, Long, Long>? = null
    var n = 2L

    while (true) {
        val candidates = listOf(
            Triple(n, n, n + 1),
            Triple(n, n + 1, n + 1)
        )
        for ((a, b, c) in candidates) {
            val steps = countValidSteps(a, b, c, targetSteps + 2)
            if (steps == targetSteps) {
                val p = a + b + c
                val bp = bestPerimeter
                if (bp == null || p < bp) {
                    bestPerimeter = p
                    bestTriangle = Triple(a, b, c)
                }
            }
        }
        n += 1
        val bp = bestPerimeter
        if (bp != null) {
            if (3 * n + 1 > bp) break
        }
        if (n > 5_000_000L) {
            error("Search did not converge; check logic.")
        }
    }

    return Pair(bestPerimeter!!, bestTriangle!!)
}

fun main() {
    val steps8910 = countValidSteps(8, 9, 10, 10)
    check(steps8910 == 2L) { "Expected 2 steps for (8,9,10), got $steps8910" }

    val (minP2, tris2) = searchMinPerimeter(2, 50)
    check(minP2 == 10L) { "Expected perimeter 10 for target_steps=2, got $minP2" }
    check(tris2.any { it.first == 3L && it.second == 3L && it.third == 4L }) {
        "Expected triangle (3,3,4) to be among minimisers for target_steps=2"
    }

    val (bestPerimeter, _bestTriangle) = solveProblem(20)
    println(bestPerimeter)
}
