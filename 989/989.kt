// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/989.py

import java.math.BigInteger

val MOD: Long = 1_000_000_009L
val TARGET_LIMIT: Long = 100_000_000_000_000L
val SMALL_NONPRIMITIVE_LIMIT: Int = 8

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

fun tonelliShanks(n: Long, p: Long): Long {
    if (n == 0L) return 0L
    if (modPow(n, (p - 1L) / 2L, p) != 1L) throw Exception("not a quadratic residue")
    if (p % 4L == 3L) return modPow(n, (p + 1L) / 4L, p)
    var q = p - 1L
    var s = 0
    while (q % 2L == 0L) { q /= 2L; s++ }
    var z = 2L
    while (modPow(z, (p - 1L) / 2L, p) != p - 1L) z++
    var m = s
    var c = modPow(z, q, p)
    var t = modPow(n, q, p)
    var r = modPow(n, (q + 1L) / 2L, p)
    while (t != 1L) {
        var i = 1
        var t2i = t * t % p
        while (t2i != 1L) { t2i = t2i * t2i % p; i++ }
        val b = modPow(c, 1L shl (m - i - 1), p)
        r = r * b % p
        c = b * b % p
        t = t * c % p
        m = i
    }
    return r
}

fun isqrtL(n: Long): Long {
    if (n == 0L) return 0L
    var x = Math.sqrt(n.toDouble()).toLong()
    while (x * x > n) x--
    while ((x + 1L) * (x + 1L) <= n) x++
    return x
}

fun gcdL(a: Long, b: Long): Long = if (b == 0L) a else gcdL(b, a % b)

val SQRT5_MOD: Long = tonelliShanks(5L, MOD)
val INV_SQRT5_MOD: Long = modPow(SQRT5_MOD, MOD - 2L, MOD)
val INV2_MOD: Long = (MOD + 1L) / 2L
val PHI_MOD: Long = (1L + SQRT5_MOD) % MOD * INV2_MOD % MOD
val PHI_INV_MOD: Long = modPow(PHI_MOD, MOD - 2L, MOD)
val PSI_MOD: Long = (1L - SQRT5_MOD + MOD) % MOD
val PHI_SQUARED_MOD: Long = PHI_MOD * PHI_MOD % MOD
val PHI_INV_SQUARED_MOD: Long = PHI_INV_MOD * PHI_INV_MOD % MOD

fun buildSmallNonprimitiveterms(maxLimit: Int): List<List<Int>> {
    val values = mutableListOf<Int>()
    val maxA = isqrtL(maxLimit.toLong()).toInt() * 2 + 2
    for (a in 2..maxA) {
        for (b in 1..(a / 2)) {
            val q = a * a - a * b - b * b
            if (q > 0 && q <= maxLimit) values.add(q)
        }
    }
    values.sort()
    val terms = ArrayList<List<Int>>(maxLimit + 1)
    for (i in 0..maxLimit) terms.add(emptyList())
    val prefix = mutableListOf<Int>()
    var index = 0
    val total = values.size
    for (limit in 0..maxLimit) {
        while (index < total && values[index] <= limit) { prefix.add(values[index]); index++ }
        terms[limit] = prefix.toList()
    }
    return terms
}

val SMALL_NONPRIMITIVE_TERMS: List<List<Int>> = buildSmallNonprimitiveterms(SMALL_NONPRIMITIVE_LIMIT)

fun evalSmallNonprimitivePair(limit: Int, z1: Long, z2: Long): Pair<Long, Long> {
    val ts = SMALL_NONPRIMITIVE_TERMS[limit]
    var total1 = 0L; var total2 = 0L
    var power1 = 1L; var power2 = 1L
    var exponent = 0L
    for (target in ts) {
        val targetL = target.toLong()
        while (exponent < targetL) {
            power1 = power1 * z1 % MOD
            power2 = power2 * z2 % MOD
            exponent++
        }
        total1 += power1; if (total1 >= MOD) total1 -= MOD
        total2 += power2; if (total2 >= MOD) total2 -= MOD
    }
    return Pair(total1, total2)
}

fun mobiusSieve(limit: Int): ByteArray {
    val mu = ByteArray(limit + 1) { 1 }
    val isPrime = BooleanArray(limit + 1) { true }
    if (limit >= 0) isPrime[0] = false
    if (limit >= 1) isPrime[1] = false
    for (p in 2..limit) {
        if (!isPrime[p]) continue
        var multiple = p
        while (multiple <= limit) { mu[multiple] = (-mu[multiple]).toByte(); multiple += p }
        val square = p * p
        if (square <= limit) {
            var m2 = square; while (m2 <= limit) { mu[m2] = 0; m2 += square }
            var m3 = square; while (m3 <= limit) { isPrime[m3] = false; m3 += p }
        }
        var m4 = p + p; while (m4 <= limit) { isPrime[m4] = false; m4 += p }
    }
    return mu
}

fun nonprimitivePair(limit: Long, z1: Long, z1Inv: Long, z2: Long, z2Inv: Long): Pair<Long, Long> {
    if (limit <= SMALL_NONPRIMITIVE_LIMIT.toLong()) {
        return evalSmallNonprimitivePair(limit.toInt(), z1, z2)
    }
    val mod = MOD
    var total1 = 0L; var total2 = 0L
    val z1Sq = z1 * z1 % mod; val z2Sq = z2 * z2 % mod
    val z1InvSq = z1Inv * z1Inv % mod; val z2InvSq = z2Inv * z2Inv % mod
    val z1Inv4 = z1InvSq * z1InvSq % mod; val z2Inv4 = z2InvSq * z2InvSq % mod
    val z1Inv5 = z1Inv4 * z1Inv % mod; val z2Inv5 = z2Inv4 * z2Inv % mod
    val z1Inv10 = z1Inv5 * z1Inv5 % mod; val z2Inv10 = z2Inv5 * z2Inv5 % mod
    val z1Inv15 = z1Inv10 * z1Inv5 % mod; val z2Inv15 = z2Inv10 * z2Inv5 % mod

    var evenWeight1 = z1Inv5; var evenWeight2 = z2Inv5
    var evenDelta1 = z1Inv15; var evenDelta2 = z2Inv15
    var addIndex = 0L; var addTerm1 = 1L; var addTerm2 = 1L; var addStep1 = z1; var addStep2 = z2
    var dropIndex = 0L; var dropTerm1 = 1L; var dropTerm2 = 1L; var dropStep1 = z1; var dropStep2 = z2
    var window1 = 0L; var window2 = 0L
    var t = 1L; var lower = 3L; var upper = 0L
    var rhs = limit + 5L
    while ((upper + 1L) * (upper + 1L) <= rhs) upper++
    while (lower <= upper) {
        while (addIndex <= upper) {
            window1 += addTerm1; if (window1 >= mod) window1 -= mod
            window2 += addTerm2; if (window2 >= mod) window2 -= mod
            addTerm1 = addTerm1 * addStep1 % mod; addStep1 = addStep1 * z1Sq % mod
            addTerm2 = addTerm2 * addStep2 % mod; addStep2 = addStep2 * z2Sq % mod
            addIndex++
        }
        while (dropIndex < lower) {
            window1 -= dropTerm1; if (window1 < 0L) window1 += mod
            window2 -= dropTerm2; if (window2 < 0L) window2 += mod
            dropTerm1 = dropTerm1 * dropStep1 % mod; dropStep1 = dropStep1 * z1Sq % mod
            dropTerm2 = dropTerm2 * dropStep2 % mod; dropStep2 = dropStep2 * z2Sq % mod
            dropIndex++
        }
        total1 = (total1 + window1 * evenWeight1) % mod
        total2 = (total2 + window2 * evenWeight2) % mod
        evenWeight1 = evenWeight1 * evenDelta1 % mod; evenDelta1 = evenDelta1 * z1Inv10 % mod
        evenWeight2 = evenWeight2 * evenDelta2 % mod; evenDelta2 = evenDelta2 * z2Inv10 % mod
        rhs += 10L * t + 5L; t++; lower += 3L
        while ((upper + 1L) * (upper + 1L) <= rhs) upper++
    }

    var oddWeight1 = z1Inv; var oddWeight2 = z2Inv
    var oddDelta1 = z1Inv10; var oddDelta2 = z2Inv10
    addIndex = 0L; addTerm1 = 1L; addTerm2 = 1L; addStep1 = z1Sq; addStep2 = z2Sq
    dropIndex = 0L; dropTerm1 = 1L; dropTerm2 = 1L; dropStep1 = z1Sq; dropStep2 = z2Sq
    window1 = 0L; window2 = 0L
    t = 0L; lower = 1L; upper = 0L
    rhs = limit + 1L
    while ((upper + 1L) * (upper + 2L) <= rhs) upper++
    while (lower <= upper) {
        while (addIndex <= upper) {
            window1 += addTerm1; if (window1 >= mod) window1 -= mod
            window2 += addTerm2; if (window2 >= mod) window2 -= mod
            addTerm1 = addTerm1 * addStep1 % mod; addStep1 = addStep1 * z1Sq % mod
            addTerm2 = addTerm2 * addStep2 % mod; addStep2 = addStep2 * z2Sq % mod
            addIndex++
        }
        while (dropIndex < lower) {
            window1 -= dropTerm1; if (window1 < 0L) window1 += mod
            window2 -= dropTerm2; if (window2 < 0L) window2 += mod
            dropTerm1 = dropTerm1 * dropStep1 % mod; dropStep1 = dropStep1 * z1Sq % mod
            dropTerm2 = dropTerm2 * dropStep2 % mod; dropStep2 = dropStep2 * z2Sq % mod
            dropIndex++
        }
        total1 = (total1 + window1 * oddWeight1) % mod
        total2 = (total2 + window2 * oddWeight2) % mod
        oddWeight1 = oddWeight1 * oddDelta1 % mod; oddDelta1 = oddDelta1 * z1Inv10 % mod
        oddWeight2 = oddWeight2 * oddDelta2 % mod; oddDelta2 = oddDelta2 * z2Inv10 % mod
        rhs += 10L * t + 10L; t++; lower += 3L
        while ((upper + 1L) * (upper + 2L) <= rhs) upper++
    }
    return Pair(total1, total2)
}

fun solve(limit: Long): Long {
    val root = isqrtL(limit).toInt()
    val mu = mobiusSieve(root)
    var pPhi = 0L; var pPsi = 0L
    var phiPowG2 = 1L; var phiInvPowG2 = 1L
    var forwardStep = PHI_MOD; var backwardStep = PHI_INV_MOD
    var gSquare = 1L
    for (g in 1..root) {
        phiPowG2 = phiPowG2 * forwardStep % MOD
        forwardStep = forwardStep * PHI_SQUARED_MOD % MOD
        phiInvPowG2 = phiInvPowG2 * backwardStep % MOD
        backwardStep = backwardStep * PHI_INV_SQUARED_MOD % MOD
        val muG = mu[g].toInt()
        if (muG != 0) {
            val scaledLimit = limit / gSquare
            val psiPowG2: Long; val psiInvPowG2: Long
            if (g and 1 == 1) {
                psiPowG2 = MOD - phiInvPowG2; psiInvPowG2 = MOD - phiPowG2
            } else {
                psiPowG2 = phiInvPowG2; psiInvPowG2 = phiPowG2
            }
            val (nonprimitivePhi, nonprimitivePsi) = nonprimitivePair(scaledLimit, phiPowG2, phiInvPowG2, psiPowG2, psiInvPowG2)
            if (muG == 1) {
                pPhi += nonprimitivePhi; if (pPhi >= MOD) pPhi -= MOD
                pPsi += nonprimitivePsi; if (pPsi >= MOD) pPsi -= MOD
            } else {
                pPhi -= nonprimitivePhi; if (pPhi < 0L) pPhi += MOD
                pPsi -= nonprimitivePsi; if (pPsi < 0L) pPsi += MOD
            }
        }
        gSquare += 2L * g + 1L
    }
    return (pPhi - pPsi + MOD) % MOD * INV_SQRT5_MOD % MOD
}

fun bruteG(n: Long): Long {
    var count = 0L
    for (x in 0L until n) if ((x * x - x - 1L).mod(n) == 0L) count++
    return count
}

fun Long.mod(m: Long): Long = ((this % m) + m) % m

fun factorizeSmall(n: Long): List<Pair<Long, Int>> {
    var nn = n
    val factors = mutableListOf<Pair<Long, Int>>()
    var d = 2L
    while (d * d <= nn) {
        if (nn % d == 0L) {
            var e = 0
            while (nn % d == 0L) { nn /= d; e++ }
            factors.add(Pair(d, e))
        }
        d += if (d == 2L) 1L else 2L
    }
    if (nn > 1L) factors.add(Pair(nn, 1))
    return factors
}

fun gFromFactorization(n: Long): Long {
    if (n == 1L) return 1L
    var splitPrimeCount = 0
    for ((prime, exponent) in factorizeSmall(n)) {
        if (prime == 2L) return 0L
        if (prime == 5L) { if (exponent >= 2) return 0L; continue }
        val residue = prime % 5L
        if (residue == 2L || residue == 3L) return 0L
        splitPrimeCount++
    }
    return 1L shl splitPrimeCount
}

fun reducedPairCount(n: Long): Long {
    var count = 0L
    val maxA = isqrtL(n).toInt() * 2 + 2
    for (a in 2..maxA) {
        for (b in 1..(a / 2)) {
            if (gcdL(a.toLong(), b.toLong()) != 1L) continue
            if (a.toLong() * a - a.toLong() * b - b.toLong() * b == n) count++
        }
    }
    return count
}

fun bruteNonprimitivePair(limit: Long, z1: Long, z2: Long): Pair<Long, Long> {
    var total1 = 0L; var total2 = 0L
    val maxA = isqrtL(limit).toInt() * 2 + 2
    for (a in 2..maxA) {
        for (b in 1..(a / 2)) {
            val q = a.toLong() * a - a.toLong() * b - b.toLong() * b
            if (q > 0L && q <= limit) {
                total1 = (total1 + modPow(z1, q, MOD)) % MOD
                total2 = (total2 + modPow(z2, q, MOD)) % MOD
            }
        }
    }
    return Pair(total1, total2)
}

fun bruteFibonacciSum(limit: Long): Long {
    val n = limit.toInt()
    val fib = LongArray(n + 1)
    if (n >= 1) fib[1] = 1L
    if (n >= 2) fib[2] = 1L
    for (i in 3..n) fib[i] = (fib[i - 1] + fib[i - 2]) % MOD
    var total = 0L
    for (i in 1..n) total = (total + fib[i] * bruteG(i.toLong())) % MOD
    return total
}

fun validate() {
    check(PSI_MOD == (MOD - PHI_INV_MOD) % MOD)
    for (n in 1L..199L) {
        val brute = bruteG(n)
        val factorized = gFromFactorization(n)
        val reduced = reducedPairCount(n)
        check(brute == factorized && brute == reduced) { "n=$n" }
    }
    for (limit in 0..SMALL_NONPRIMITIVE_LIMIT) {
        val fastPair = evalSmallNonprimitivePair(limit, 2L, 3L)
        val brutePair = bruteNonprimitivePair(limit.toLong(), 2L, 3L)
        check(fastPair == brutePair) { "limit=$limit" }
    }
    for (limit in listOf(1L, 2L, 5L, 10L, 30L, 100L)) {
        val computed = solve(limit)
        val brute = bruteFibonacciSum(limit)
        check(computed == brute) { "limit=$limit" }
    }
    check(solve(1000L) == 190_950_976L)
}

fun main() {
    validate()
    println(solve(TARGET_LIMIT))
}
