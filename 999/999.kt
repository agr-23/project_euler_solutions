// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/999.py

val MOD: Long = 1_234_567_891L
val INV_TWO: Long = (MOD + 1L) / 2L

val SMALL_W: Array<Long> = arrayOf(0L, 1L, 2L, -4L, -32L, -192L, 3584L, 77824L, 262144L)

fun smallW(index: Long): Long {
    if (index < 0L) {
        val pos = smallW(-index)
        return (MOD - pos % MOD) % MOD
    }
    val v = SMALL_W[index.toInt()]
    return if (v < 0L) ((v % MOD) + MOD) % MOD else v % MOD
}

fun powMod(base: Long, exp: Long, modulus: Long): Long {
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

fun edsBlock(n: Long): LongArray {
    if (n <= 4L) {
        return LongArray(8) { i -> smallW(n - 3L + i.toLong()) }
    }

    val middle = n / 2L
    val source = edsBlock(middle)
    val sourceStart = middle - 3L

    fun get(index: Long): Long = source[(index - sourceStart).toInt()]

    fun odd(index: Long): Long {
        val a = get(index + 1L)
        val b = powMod(get(index - 1L), 3L, MOD)
        val c = get(index - 2L)
        val d = powMod(get(index), 3L, MOD)
        return (a * b % MOD + MOD - c * d % MOD) % MOD
    }

    fun even(index: Long): Long {
        val a = get(index)
        val b = get(index + 2L)
        val c = powMod(get(index - 1L), 2L, MOD)
        val d = get(index - 2L)
        val e = powMod(get(index + 1L), 2L, MOD)
        val inner = (b * c % MOD + MOD - d * e % MOD) % MOD
        return a * INV_TWO % MOD * inner % MOD
    }

    return if (n % 2L == 0L) {
        longArrayOf(
            odd(middle - 1L),
            even(middle - 1L),
            odd(middle),
            even(middle),
            odd(middle + 1L),
            even(middle + 1L),
            odd(middle + 2L),
            even(middle + 2L)
        )
    } else {
        longArrayOf(
            even(middle - 1L),
            odd(middle),
            even(middle),
            odd(middle + 1L),
            even(middle + 1L),
            odd(middle + 2L),
            even(middle + 2L),
            odd(middle + 3L)
        )
    }
}

fun wMod(n: Long): Long {
    if (n < 0L) {
        val pos = wMod(-n)
        return (MOD - pos % MOD) % MOD
    }
    return edsBlock(n)[3]
}

fun aMod(n: Long): Long {
    require(n >= 1L)
    val rem = n % 4L
    val signPositive = rem == 1L || rem == 2L
    val exp = n * n / 4L
    val inverseScale = powMod(INV_TWO, exp, MOD)
    val wval = wMod(n)
    return if (signPositive) {
        wval * inverseScale % MOD
    } else {
        (MOD - wval * inverseScale % MOD) % MOD
    }
}

fun main() {
    check(aMod(1L) == 1L)
    check(aMod(2L) == 1L)
    check(aMod(3L) == 1L)
    check(aMod(4L) == 2L)
    check(aMod(13L) == 23321L)
    check(aMod(1003L) == 231906014L)

    println(aMod(1_000_000_000_000_000_003L))
}