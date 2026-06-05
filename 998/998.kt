// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/998.py

import java.math.BigInteger

fun gcdLong(a: Long, b: Long): Long {
    var x = a; var y = b
    while (y != 0L) { val t = y; y = x % y; x = t }
    return x
}

fun isqrtLong(n: Long): Long {
    if (n < 0L) throw IllegalArgumentException("isqrt of negative")
    if (n == 0L) return 0L
    var x = Math.sqrt(n.toDouble()).toLong()
    while (x * x > n) x--
    while ((x + 1) * (x + 1) <= n) x++
    return x
}

fun pythagoreanPartners(limit: Int): Array<MutableList<Long>> {
    val partners = Array(limit + 1) { mutableListOf<Long>() }
    val rMax = isqrtLong(2L * limit) + 3L
    for (r in 2L..rMax) {
        val rr = r * r
        for (s in 1L until r) {
            if (((r - s) and 1L) == 0L || gcdLong(r, s) != 1L) continue
            val a = rr - s * s
            val b = 2L * r * s
            val m = if (a > b) a else b
            val x = if (a > b) b else a
            if (m > limit) continue
            var km = m
            while (km <= limit) {
                partners[km.toInt()].add((km / m) * x)
                km += m
            }
        }
    }
    for (row in partners) row.sort()
    return partners
}

fun isMinimumSquare(sides: LongArray, twiceArea: Long, squareSide: Long): Boolean {
    val ss = sides
    val m = squareSide
    val m2 = m * m
    val dArea = twiceArea
    var hasEqualCandidate = false

    for (i in 0..2) {
        val d = ss[i]
        val e = ss[(i + 1) % 3]
        val f = ss[(i + 2) % 3]
        val den = 2L * d
        val tNum = d * d + e * e - f * f
        val dNum = d * den
        val spanMax = maxOf(0L, dNum, tNum)
        val spanMin = minOf(0L, dNum, tNum)
        val widthNum = spanMax - spanMin
        val widthCmp = widthNum - m * den
        val heightCmp = dArea - m * d
        if (widthCmp < 0L && heightCmp < 0L) return false
        if (widthCmp <= 0L && heightCmp <= 0L && (widthCmp == 0L || heightCmp == 0L)) {
            hasEqualCandidate = true
        }
    }

    for (i in 0..2) {
        val r = ss[i]
        val p = ss[(i + 1) % 3]
        val q = ss[(i + 2) % 3]
        val kNum = p * p + q * q - r * r
        if (kNum <= 0L) continue
        val rDenPart = p * p + q * q - 2L * dArea
        if (rDenPart <= 0L) continue
        val num = BigInteger.valueOf(kNum) * BigInteger.valueOf(kNum)
        val den = BigInteger.valueOf(4L) * BigInteger.valueOf(rDenPart)
        val p2 = BigInteger.valueOf(p * p)
        val q2 = BigInteger.valueOf(q * q)
        val dAreaBig = BigInteger.valueOf(dArea)
        if (num < dAreaBig * den) continue
        if (num > p2 * den || num > q2 * den) continue
        if (p2 * den > BigInteger.TWO * num || q2 * den > BigInteger.TWO * num) continue
        val target = BigInteger.valueOf(m2) * den
        if (num < target) return false
        if (num == target) hasEqualCandidate = true
    }

    return hasEqualCandidate
}

fun solve(limit: Int): Long {
    val partners = pythagoreanPartners(limit)
    val seen = HashSet<Triple<Long, Long, Long>>()
    var total = 0L

    for (mInt in 1..limit) {
        val m = mInt.toLong()
        val mm = m * m
        val row = mutableListOf(Pair(0L, m))
        for (x in partners[mInt]) {
            row.add(Pair(x, isqrtLong(mm + x * x)))
        }
        val rowLen = row.size

        for (i in 0 until rowLen) {
            val (x, hx) = row[i]
            for (j in i until rowLen) {
                val (y, hy) = row[j]
                val base = x + y
                if (base == 0L) continue
                if (base > m) break
                if (x * y < m * (m - base)) continue
                val arr = longArrayOf(base, hx, hy).also { it.sort() }
                val key = Triple(arr[0], arr[1], arr[2])
                if (!seen.contains(key)) {
                    seen.add(key)
                    total += arr[0] + arr[1] + arr[2]
                }
            }
        }

        for (i in 0 until rowLen) {
            val (u, hu) = row[i]
            for (j in i until rowLen) {
                val (v, hv) = row[j]
                val twiceArea = mm - u * v
                if (twiceArea <= 0L) continue
                val p = m - u
                val q = m - v
                val third2 = p * p + q * q
                val third = isqrtLong(third2)
                if (third * third != third2 || third == 0L) continue
                val arr = longArrayOf(third, hu, hv).also { it.sort() }
                val key = Triple(arr[0], arr[1], arr[2])
                if (seen.contains(key)) continue
                if (isMinimumSquare(arr, twiceArea, m)) {
                    seen.add(key)
                    total += arr[0] + arr[1] + arr[2]
                }
            }
        }
    }

    return total
}

fun main() {
    check(solve(40) == 346L)
    check(solve(400) == 76402L)
    check(solve(2000) == 3237036L)
    println(solve(1_000_000))
}