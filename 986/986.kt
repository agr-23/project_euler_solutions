// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/986.py

val LIMIT = 160
val PREDICT_START_N = 33
val SEARCH_WINDOW = 4096L

val EXCEPTION_H: Map<Int, Long> = mapOf(2 to 3L, 3 to 5L, 4 to 7L, 5 to 11L, 6 to 13L, 8 to 21L, 10 to 31L)

fun extinctForK1(n: Int, k: Long): Boolean {
    if (k == 0L) return true
    val size = n + 1
    val last = size - 1
    val cells = LongArray(size)
    cells[last] = k
    var zeroCount = last
    while (true) {
        for (i in 0 until last) {
            val old = cells[i]
            val nxt = (old + cells[i + 1]) shr 1
            cells[i] = nxt
            if (old != 0L) { if (nxt == 0L) zeroCount++ }
            else if (nxt != 0L) zeroCount--
        }
        val old = cells[last]
        val nxt = (old + cells[0]) shr 1
        cells[last] = nxt
        if (old != 0L) { if (nxt == 0L) zeroCount++ }
        else if (nxt != 0L) zeroCount--
        if (zeroCount == size) return true
        if (zeroCount == 0) return false
    }
}

fun thresholdK1Plain(n: Int): Long {
    var lo = 0L
    var hi = 1L
    while (extinctForK1(n, hi)) { lo = hi; hi *= 2 }
    while (lo + 1 < hi) {
        val mid = (lo + hi) / 2
        if (extinctForK1(n, mid)) lo = mid else hi = mid
    }
    return lo
}

fun predictK1FromPrevious(s: LongArray, n: Int): Long {
    val a = s[n - 32]; val b = s[n - 24]; val c = s[n - 16]; val d = s[n - 8]
    return d + (d - c) + (d - 2 * c + b) + (d - 3 * c + 3 * b - a)
}

fun thresholdK1WithGuess(n: Int, guess: Long): Long {
    var lo = maxOf(0L, guess - SEARCH_WINDOW)
    var hi = guess + SEARCH_WINDOW
    while (lo > 0 && !extinctForK1(n, lo)) { hi = lo; lo /= 2 }
    while (extinctForK1(n, hi)) { lo = hi; hi *= 2 }
    while (lo + 1 < hi) {
        val mid = (lo + hi) / 2
        if (extinctForK1(n, mid)) lo = mid else hi = mid
    }
    return lo
}

fun buildSSequence(maxN: Int): LongArray {
    val s = LongArray(maxN + 1)
    for (n in 1..maxN) {
        if (n < PREDICT_START_N) s[n] = thresholdK1Plain(n)
        else { val guess = predictK1FromPrevious(s, n); s[n] = thresholdK1WithGuess(n, guess) }
    }
    return s
}

fun hReduced(c: Int, d: Int, s: LongArray): Long {
    if (d == 1 && EXCEPTION_H.containsKey(c)) return EXCEPTION_H[c]!!
    return s[d + (c - 1) / 2]
}

fun gValueFunc(c: Int, d: Int, s: LongArray): Long {
    val g = gcdInt(c, d); val cr = c / g; val dr = d / g
    val h = hReduced(cr, dr, s); return 2 * h + 1
}

fun gcdInt(a: Int, b: Int): Int = if (b == 0) a else gcdInt(b, a % b)

fun solve(limit: Int): Long {
    val maxN = limit + (limit - 1) / 2
    val s = buildSSequence(maxN)
    check(gValueFunc(2, 1, s) == 7L)
    check(gValueFunc(1, 2, s) == 7L)
    check(gValueFunc(3, 1, s) == 11L)
    check(gValueFunc(2, 2, s) == 3L)
    check(gValueFunc(1, 3, s) == 15L)
    val memo = HashMap<Pair<Int, Int>, Long>()
    var total = 0L
    for (c in 1..limit) {
        for (d in 1..limit) {
            val g = gcdInt(c, d)
            val key = Pair(c / g, d / g)
            val v = memo.getOrPut(key) { 2 * hReduced(key.first, key.second, s) + 1 }
            total += v
        }
    }
    return total
}

fun main() { println(solve(LIMIT)) }
