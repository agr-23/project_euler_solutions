// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/993.py

val PERIOD_START: Long = 514L
val PERIOD: Long = 71L
val DELTA_PATTERN: LongArray = longArrayOf(
    17, -2, -8, -2, -2, -14, -2, -2, -17, -8, -5, -8, -5, -2, -2, -5, -8,
    50, -8, 23, -13, -2, 67, -5, -2, -2, -5, -8, -5, 21, 29, -11, -2, -2,
    6, -11, 31, -2, -11, 17, -2, -8, -2, -2, -14, -2, -2, -17, -8, -5, -8,
    -8, 8, -13, -5, -2, -2, -5, -2, -11, -8, -8, -5, -2, -11, -8, -8, -5,
    -2, -11, 216,
)
val PATTERN_SUM: Long = DELTA_PATTERN.sum()

data class GameState(val pos: Long, val carry: Long, val bananas: Set<Long>)

fun stepState(pos: Long, carry: Long, bananas: Set<Long>): GameState? {
    val hasX = bananas.contains(pos)
    val hasX1 = bananas.contains(pos + 1L)
    if (hasX && hasX1) {
        val nb = bananas.toMutableSet()
        nb.remove(pos + 1L)
        return GameState(pos - 1L, carry + 1L, nb)
    }
    if (hasX && !hasX1) {
        val nb = bananas.toMutableSet()
        nb.remove(pos)
        return GameState(pos + 2L, carry + 1L, nb)
    }
    if (!hasX && hasX1) {
        val nb = bananas.toMutableSet()
        nb.remove(pos + 1L)
        nb.add(pos)
        return GameState(pos + 2L, carry, nb)
    }
    if (carry >= 3L) {
        val nb = bananas.toMutableSet()
        nb.add(pos - 1L)
        nb.add(pos)
        nb.add(pos + 1L)
        return GameState(pos - 2L, carry - 3L, nb)
    }
    return null
}

fun simulateSteps(initialBananas: Long, steps: Int): GameState {
    var pos = 0L
    var carry = initialBananas
    var bananas: Set<Long> = emptySet()
    for (i in 0 until steps) {
        val nxt = stepState(pos, carry, bananas) ?: break
        pos = nxt.pos; carry = nxt.carry; bananas = nxt.bananas
    }
    return GameState(pos, carry, bananas)
}

fun simulateBbValues(limit: Long): LongArray {
    val bb = mutableListOf(0L)
    var pos = 0L
    var carry = 0L
    var bananas: Set<Long> = emptySet()
    for (n in 1L..limit) {
        carry += 1L
        while (true) {
            val nxt = stepState(pos, carry, bananas)
            if (nxt == null) { bb.add(pos); break }
            pos = nxt.pos; carry = nxt.carry; bananas = nxt.bananas
        }
    }
    return bb.toLongArray()
}

fun buildPrefix(): LongArray = simulateBbValues(PERIOD_START + PERIOD)

fun bbFunc(n: Long, bbPrefix: LongArray): Long {
    if (n <= PERIOD_START) return bbPrefix[n.toInt()]
    val remaining = n - PERIOD_START
    val wholePeriods = remaining / PERIOD
    val tail = (remaining % PERIOD).toInt()
    return bbPrefix[PERIOD_START.toInt()] + wholePeriods * PATTERN_SUM + DELTA_PATTERN.take(tail).sum()
}

fun main() {
    val bbPrefix = buildPrefix()

    val s1 = simulateSteps(3L, 1)
    check(s1.pos == -2L)
    check(s1.carry == 0L)
    check(s1.bananas == setOf(-1L, 0L, 1L))

    val s2 = simulateSteps(5L, 5)
    check(s2.pos == -1L)
    check(s2.carry == 0L)
    check(s2.bananas == setOf(-2L, -1L, 0L, 1L, 2L))

    check(bbFunc(1000L, bbPrefix) == 1499L)

    val deltas = LongArray(bbPrefix.size - 1) { i -> bbPrefix[i + 1] - bbPrefix[i] }
    for (i in DELTA_PATTERN.indices) {
        check(deltas[PERIOD_START.toInt() + i] == DELTA_PATTERN[i])
    }

    println(bbFunc(1_000_000_000_000_000_000L, bbPrefix))
}
