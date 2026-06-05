// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/995.py

import java.math.BigInteger
import kotlin.math.sqrt
import kotlin.math.log10
import kotlin.math.floor

val LIMIT = 20000
val PRIME_SEARCH_LIMIT = 2000000

fun sieve(n: Int): List<Int> {
    val isPrime = BooleanArray(n + 1) { true }
    if (n >= 0) isPrime[0] = false
    if (n >= 1) isPrime[1] = false
    val r = sqrt(n.toDouble()).toInt()
    for (i in 2..r) {
        if (isPrime[i]) {
            var j = i * i
            while (j <= n) { isPrime[j] = false; j += i }
        }
    }
    return (0..n).filter { isPrime[it] }
}

val PRIMES: List<Int> = sieve(PRIME_SEARCH_LIMIT)

fun factorN(n: BigInteger): List<Pair<BigInteger, Int>> {
    val out = mutableListOf<Pair<BigInteger, Int>>()
    var t = n
    for (p in PRIMES) {
        val pb = BigInteger.valueOf(p.toLong())
        if (pb * pb > t) break
        if (t % pb == BigInteger.ZERO) {
            var e = 0
            while (t % pb == BigInteger.ZERO) { t = t / pb; e++ }
            out.add(Pair(pb, e))
        }
    }
    if (t > BigInteger.ONE) out.add(Pair(t, 1))
    return out
}

fun divisorsFromFactorization(factors: List<Pair<BigInteger, Int>>): List<BigInteger> {
    var divs = mutableListOf(BigInteger.ONE)
    for ((p, e) in factors) {
        val old = divs.toList()
        divs = mutableListOf()
        var power = BigInteger.ONE
        for (i in 0..e) {
            for (d in old) divs.add(d * power)
            power *= p
        }
    }
    return divs.sortedWith(Comparator { a, b -> a.compareTo(b) })
}

fun modPow(base: BigInteger, exp: BigInteger, mod: BigInteger): BigInteger = base.modPow(exp, mod)

fun primitiveRoot(p: BigInteger, primeFactorsOfPMinus1: List<BigInteger>): BigInteger {
    if (p == BigInteger.TWO) return BigInteger.ONE
    val m = p - BigInteger.ONE
    var g = BigInteger.TWO
    while (g < p) {
        var ok = true
        for (q in primeFactorsOfPMinus1) {
            if (modPow(g, m / q, p) == BigInteger.ONE) { ok = false; break }
        }
        if (ok) return g
        g++
    }
    throw RuntimeException("primitive root not found")
}

fun discreteLogTable(p: BigInteger, root: BigInteger): Array<BigInteger> {
    val size = p.toInt()
    val table = Array(size) { BigInteger.valueOf(-1L) }
    var x = BigInteger.ONE
    var k = BigInteger.ZERO
    while (k < p - BigInteger.ONE) {
        table[x.toInt()] = k
        x = (x * root) % p
        k++
    }
    return table
}

fun gcdBig(a: BigInteger, b: BigInteger): BigInteger = a.gcd(b)

val S_CACHE = HashMap<Int, Pair<BigInteger, Double>>()

fun sForPrime(p: Int): Pair<BigInteger, Double> {
    S_CACHE[p]?.let { return it }
    if (p == 2) {
        val res = Pair(BigInteger.ONE, 0.0)
        S_CACHE[p] = res
        return res
    }
    val pu = BigInteger.valueOf(p.toLong())
    val m = pu - BigInteger.ONE
    val factors = factorN(m)
    val divs = divisorsFromFactorization(factors)
    val primeQs = factors.map { it.first }
    val root = primitiveRoot(pu, primeQs)
    val dlog = discreteLogTable(pu, root)

    val neededCCount = divs.size - 1
    val leastPrimeForC = HashMap<BigInteger, Int>()
    for (q in PRIMES) {
        if (q == p) continue
        val qu = BigInteger.valueOf(q.toLong())
        val idx = (qu % pu).toInt()
        if (dlog[idx] == BigInteger.valueOf(-1L)) continue
        val c = gcdBig(dlog[idx], m)
        if (c < m && !leastPrimeForC.containsKey(c)) {
            leastPrimeForC[c] = q
            if (leastPrimeForC.size == neededCCount) break
        }
    }
    if (leastPrimeForC.size != neededCCount) throw RuntimeException("increase PRIME_SEARCH_LIMIT")

    val cItems = leastPrimeForC.entries.map { Pair(it.key, it.value) }

    val bestByM = HashMap<BigInteger, HashMap<BigInteger, Int>>()
    for (mm in divs) {
        if (mm == BigInteger.ONE) continue
        val best = HashMap<BigInteger, Int>()
        for ((c, q) in cItems) {
            val d = gcdBig(c, mm)
            if (d < mm) {
                if (!best.containsKey(d) || q < best[d]!!) best[d] = q
            }
        }
        bestByM[mm] = best
    }

    val dpValue = HashMap<BigInteger, BigInteger>()
    val dpLog = HashMap<BigInteger, Double>()
    dpValue[BigInteger.ONE] = BigInteger.ONE
    dpLog[BigInteger.ONE] = 0.0

    for (h in divs) {
        if (!dpValue.containsKey(h)) continue
        val mm = m / h
        if (mm == BigInteger.ONE) continue
        val best = bestByM[mm]!!
        val baseValue = dpValue[h]!!
        val baseLog = dpLog[h]!!
        for (l in divs) {
            if (l > BigInteger.ONE && mm % l == BigInteger.ZERO) {
                val nextH = h * l
                val dKey = mm / l
                if (!best.containsKey(dKey)) continue
                val q = best[dKey]!!
                val qu = BigInteger.valueOf(q.toLong())
                var candidate = baseValue
                var i = BigInteger.ZERO
                while (i < l - BigInteger.ONE) { candidate *= qu; i++ }
                val candLog = baseLog + (l - BigInteger.ONE).toDouble() * log10(q.toDouble())
                if (!dpValue.containsKey(nextH) || candidate < dpValue[nextH]!!) {
                    dpValue[nextH] = candidate
                    dpLog[nextH] = candLog
                }
            }
        }
    }

    val res = Pair(dpValue[m]!!, dpLog[m]!!)
    S_CACHE[p] = res
    return res
}

fun productT(limit: Int): BigInteger {
    var product = BigInteger.ONE
    for (p in PRIMES) {
        if (p >= limit) break
        product *= sForPrime(p).first
    }
    return product
}

fun scientificFromInt(n: BigInteger, places: Int = 5): String {
    val digits = n.toString()
    val exponent = digits.length - 1
    val significant = places + 1
    val mantissaDigits: String
    val finalExp: Int
    if (digits.length > significant) {
        var head = digits.substring(0, significant).toLong()
        if (digits[significant].digitToInt() >= 5) head += 1
        if (head == Math.pow(10.0, significant.toDouble()).toLong()) {
            head /= 10
            finalExp = exponent + 1
        } else {
            finalExp = exponent
        }
        mantissaDigits = head.toString().padStart(significant, '0')
    } else {
        val headVal = digits.toLong()
        val head = headVal * Math.pow(10.0, (significant - digits.length).toDouble()).toLong()
        mantissaDigits = head.toString().padStart(significant, '0')
        finalExp = exponent
    }
    val mantissa = mantissaDigits[0] + "." + mantissaDigits.substring(1)
    return "${mantissa}e${finalExp}"
}

fun runTests() {
    check(sForPrime(2).first == BigInteger.ONE)
    check(sForPrime(5).first == BigInteger.valueOf(8L))
    check(productT(20) == BigInteger.valueOf(1348422598656L))
    check(scientificFromInt(productT(100)) == "1.37451e123")
}

fun main() {
    runTests()
    println(scientificFromInt(productT(LIMIT)))
}