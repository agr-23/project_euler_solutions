// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/984.py

val MODVAL: Long = 1_000_000_007L
val TARGET_N: Long = 1_000_000_000_000_000_000L

val EVEN_POLY: List<Triple<Long, Long, Int>> = listOf(
    Triple(31L, 40320L, 8),
    Triple(31L, 3360L, 7),
    Triple(67L, 1440L, 6),
    Triple(41L, 320L, 5),
    Triple(313L, 1440L, 4),
    Triple(-5699L, 240L, 3),
    Triple(16049L, 420L, 2),
    Triple(29413L, 140L, 1),
)

fun modpow(base: Long, exp: Long, modulus: Long): Long {
    var result = 1L
    var b = ((base % modulus) + modulus) % modulus
    var e = exp
    while (e > 0L) {
        if (e % 2L == 1L) result = (result.toBigInteger() * b.toBigInteger() % modulus.toBigInteger()).toLong()
        b = (b.toBigInteger() * b.toBigInteger() % modulus.toBigInteger()).toLong()
        e /= 2L
    }
    return result
}

fun computeEvenMod(n: Long, modulus: Long): Long {
    val powers = mutableListOf(1L)
    val x = ((n % modulus) + modulus) % modulus
    for (i in 0 until 8) {
        val last = powers.last()
        powers.add((last.toBigInteger() * x.toBigInteger() % modulus.toBigInteger()).toLong())
    }
    var total = -419L
    for ((numerator, denominator, power) in EVEN_POLY) {
        val invDen = modpow(denominator, modulus - 2L, modulus)
        val term = (numerator.toBigInteger() * powers[power].toBigInteger() % modulus.toBigInteger() * invDen.toBigInteger() % modulus.toBigInteger()).toLong()
        total += term
        total = ((total % modulus) + modulus) % modulus
    }
    return total
}

fun gcdBig(a: java.math.BigInteger, b: java.math.BigInteger): java.math.BigInteger {
    var aa = if (a < java.math.BigInteger.ZERO) -a else a
    var bb = if (b < java.math.BigInteger.ZERO) -b else b
    while (bb != java.math.BigInteger.ZERO) {
        val t = bb
        bb = aa % bb
        aa = t
    }
    return aa
}

fun computeEvenInt(n: Long): java.math.BigInteger {
    val nBig = n.toBigInteger()
    var numTotal = (-419).toBigInteger()
    var denTotal = java.math.BigInteger.ONE
    for ((numerator, denominator, power) in EVEN_POLY) {
        val termNum = numerator.toBigInteger() * nBig.pow(power)
        val termDen = denominator.toBigInteger()
        numTotal = numTotal * termDen + termNum * denTotal
        denTotal = denTotal * termDen
        val g = gcdBig(
            if (numTotal < java.math.BigInteger.ZERO) -numTotal else numTotal,
            if (denTotal < java.math.BigInteger.ZERO) -denTotal else denTotal
        )
        numTotal = numTotal / g
        denTotal = denTotal / g
    }
    check(denTotal == java.math.BigInteger.ONE || denTotal == (-1).toBigInteger()) {
        "Expected integral closed-form value"
    }
    return if (denTotal == (-1).toBigInteger()) -numTotal else numTotal
}

fun runSolve(): Long {
    val check1 = computeEvenInt(100L)
    check(check1 == 8658918531876L.toBigInteger()) { "Expected 8658918531876 got $check1" }
    val check2 = computeEvenMod(10000L, MODVAL)
    check(check2 == 377956308L) { "Expected 377956308 got $check2" }
    return computeEvenMod(TARGET_N, MODVAL)
}

fun main() {
    println(runSolve())
}
