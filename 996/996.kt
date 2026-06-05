// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/996.py

import java.math.BigInteger

val ZERO: BigInteger = BigInteger.ZERO
val ONE: BigInteger = BigInteger.ONE

fun trim(poly: MutableList<BigInteger>): MutableList<BigInteger> {
    while (poly.size > 1 && poly.last() == ZERO) {
        poly.removeAt(poly.size - 1)
    }
    return poly
}

fun addTo(dst: MutableList<BigInteger>, src: List<BigInteger>, modulus: BigInteger?) {
    while (dst.size < src.size) dst.add(ZERO)
    if (modulus == null) {
        for (i in src.indices) dst[i] = dst[i] + src[i]
    } else {
        for (i in src.indices) dst[i] = (dst[i] + src[i]) % modulus
    }
}

fun mulOneMinusQ(poly: List<BigInteger>, modulus: BigInteger?): MutableList<BigInteger> {
    val out = MutableList(poly.size + 1) { ZERO }
    for (i in poly.indices) {
        out[i] = out[i] + poly[i]
        out[i + 1] = out[i + 1] - poly[i]
    }
    val result: MutableList<BigInteger> = if (modulus != null) out.map { it % modulus }.toMutableList() else out
    return trim(result)
}

fun mulPoly(a: List<BigInteger>, b: List<BigInteger>, maxDegree: Int, modulus: BigInteger?): MutableList<BigInteger> {
    if (a.isEmpty() || b.isEmpty()) return mutableListOf(ZERO)
    val outLen = minOf(a.size + b.size - 2, maxDegree) + 1
    val out = MutableList(outLen) { ZERO }
    for (i in a.indices) {
        if (a[i] == ZERO) continue
        val lastJ = minOf(b.size - 1, maxDegree - i)
        for (j in 0..lastJ) {
            if (b[j] != ZERO) {
                out[i + j] = out[i + j] + a[i] * b[j]
                if (modulus != null) out[i + j] = out[i + j] % modulus
            }
        }
    }
    val result: MutableList<BigInteger> = if (modulus != null) out.map { it % modulus }.toMutableList() else out
    return trim(result)
}

fun combBig(n: BigInteger, k: BigInteger): BigInteger {
    var kk = k
    if (kk < ZERO || kk > n) return ZERO
    if (kk == ZERO || kk == n) return ONE
    if (kk > n - kk) kk = n - kk
    var result = ONE
    var i = ZERO
    while (i < kk) {
        result = result * (n - i) / (i + ONE)
        i++
    }
    return result
}

fun blockCount(length: BigInteger, cost: BigInteger): BigInteger {
    if (cost <= ZERO || BigInteger.TWO * cost < length) return ZERO
    val total = combBig(BigInteger.TWO * cost - ONE, length - ONE)
    val tooLarge = if (cost < length) ZERO else combBig(cost - ONE, length - ONE)
    return total - length * tooLarge
}

fun blockNumerator(length: Int, modulus: BigInteger?): MutableList<BigInteger> {
    val coeffs = MutableList(length + 1) { ZERO }
    val lenB = BigInteger.valueOf(length.toLong())
    for (j in 0..length) {
        var value = ZERO
        val jB = BigInteger.valueOf(j.toLong())
        for (i in 0..j) {
            val iB = BigInteger.valueOf(i.toLong())
            val sign = if (i % 2 == 0) ONE else -ONE
            value = value + sign * combBig(lenB, iB) * blockCount(lenB, jB - iB)
        }
        coeffs[j] = if (modulus != null) value % modulus else value
    }
    return trim(coeffs)
}

fun numeratorForAllValidVectors(n: Int, modulus: BigInteger?): MutableList<BigInteger> {
    val blockNum: Array<MutableList<BigInteger>?> = arrayOfNulls(n + 1)
    for (length in 2..n) {
        blockNum[length] = blockNumerator(length, modulus)
    }

    val total: Array<MutableList<BigInteger>> = Array(n + 1) { mutableListOf() }
    val zeroEnd: Array<MutableList<BigInteger>> = Array(n + 1) { mutableListOf() }
    total[0] = mutableListOf(ONE)
    zeroEnd[0] = mutableListOf(ONE)

    for (pos in 0..n) {
        if (pos < n && total[pos].isNotEmpty()) {
            val addZero = mulOneMinusQ(total[pos], modulus)
            addTo(total[pos + 1], addZero, modulus)
            addTo(zeroEnd[pos + 1], addZero, modulus)
        }
        if (zeroEnd[pos].isNotEmpty()) {
            for (length in 2..(n - pos)) {
                val product = mulPoly(zeroEnd[pos], blockNum[length]!!, pos + length, modulus)
                addTo(total[pos + length], product, modulus)
            }
        }
    }

    return total[n]
}

fun countTuples(n: Int, k: Long, modulus: BigInteger?): BigInteger {
    val nB = BigInteger.valueOf(n.toLong())
    val kB = BigInteger.valueOf(k)
    val maxCost = kB / BigInteger.TWO
    val numerator = numeratorForAllValidVectors(n, modulus)
    var answer = ZERO
    for (degree in numerator.indices) {
        val coeff = numerator[degree]
        if (coeff == ZERO || BigInteger.valueOf(degree.toLong()) > maxCost) continue
        val waysUpToCost = combBig(maxCost - BigInteger.valueOf(degree.toLong()) + nB, nB)
        if (modulus == null) {
            answer = answer + coeff * waysUpToCost
        } else {
            answer = (answer + coeff * (waysUpToCost % modulus)) % modulus
        }
    }
    return answer
}

fun runTests() {
    check(countTuples(3, 4L, null) == BigInteger.valueOf(8L))
    check(countTuples(12, 34L, null) == BigInteger.valueOf(2457178250L))
}

fun main() {
    runTests()
    val modVal = BigInteger.valueOf(1234567891L)
    println(countTuples(123, 4567891L, modVal))
}