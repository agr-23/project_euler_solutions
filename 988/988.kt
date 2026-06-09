// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/988.py

fun frogSum(aIn: Long, bIn: Long): Long {
    if (aIn <= 0L || bIn <= 0L) {
        throw IllegalArgumentException("a and b must be positive")
    }
    var a = aIn
    var b = bIn
    if (a > b) {
        val tmp = a; a = b; b = tmp
    }
    if (a == 1L) {
        return 0L
    }
    val width = b - 1L
    val h = LongArray((width + 1).toInt())
    for (i in 1..width.toInt()) {
        h[i] = (a * b - a * i - 1L) / b
    }
    var dp: MutableMap<Long, Pair<Long, Long>> = mutableMapOf()
    for (t in 0L..h[1]) {
        dp[t] = Pair(1L, 0L)
    }
    for (i in 2..width.toInt()) {
        val nextDp: MutableMap<Long, Pair<Long, Long>> = mutableMapOf()
        for ((prevHeight, value) in dp) {
            val (count, total) = value
            val limit = minOf(prevHeight, h[i])
            for (curHeight in 0L..limit) {
                var add = 0L
                if (prevHeight > curHeight && prevHeight > 0L) {
                    add = a * b - a * (i.toLong() - 1L) - b * prevHeight
                }
                val (oldCount, oldTotal) = nextDp.getOrDefault(curHeight, Pair(0L, 0L))
                nextDp[curHeight] = Pair(
                    oldCount + count,
                    oldTotal + total + count * add
                )
            }
        }
        dp = nextDp
    }
    var answer = 0L
    val lastColumn = width
    for ((prevHeight, value) in dp) {
        val (count, total) = value
        var add = 0L
        if (prevHeight > 0L) {
            add = a * b - a * lastColumn - b * prevHeight
        }
        answer += total + count * add
    }
    return answer
}

fun solve() {
    check(frogSum(3L, 5L) == 23L) { "frogSum(3,5) should be 23" }
    check(frogSum(5L, 13L) == 16336L) { "frogSum(5,13) should be 16336" }
    println(frogSum(19L, 53L))
}

fun main() {
    solve()
}
