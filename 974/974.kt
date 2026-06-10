// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/974.py

val DIGITS_LIST = listOf(1, 3, 5, 7, 9)
val BIT_TABLE = mapOf(1 to 0, 3 to 1, 5 to 2, 7 to 3, 9 to 4)
val ALL_MASK = (1 shl 5) - 1

fun computeCountLen(bigL: Int): Long {
    val memo = HashMap<Long, Long>()
    fun encode(pos: Int, m3: Int, m7: Int, msk: Int): Long =
        pos.toLong() * (3L * 7L * 32L) + m3.toLong() * (7L * 32L) + m7.toLong() * 32L + msk.toLong()
    fun dp(pos: Int, mod3: Int, mod7: Int, mask: Int): Long {
        if (pos == bigL) {
            return if (mod3 == 0 && mod7 == 0 && mask == ALL_MASK) 1L else 0L
        }
        val key = encode(pos, mod3, mod7, mask)
        memo[key]?.let { return it }
        val choices = if (pos == bigL - 1) listOf(5) else DIGITS_LIST
        var total = 0L
        for (d in choices) {
            total += dp(pos + 1, (mod3 * 10 + d) % 3, (mod7 * 10 + d) % 7, mask xor (1 shl BIT_TABLE[d]!!))
        }
        memo[key] = total
        return total
    }
    return dp(0, 0, 0, 0)
}

fun performUnrank(bigL: Int, kVal: Long): String {
    val memo = HashMap<Long, Long>()
    fun encode(pos: Int, m3: Int, m7: Int, msk: Int): Long =
        pos.toLong() * (3L * 7L * 32L) + m3.toLong() * (7L * 32L) + m7.toLong() * 32L + msk.toLong()
    fun dp(pos: Int, mod3: Int, mod7: Int, mask: Int): Long {
        if (pos == bigL) {
            return if (mod3 == 0 && mod7 == 0 && mask == ALL_MASK) 1L else 0L
        }
        val key = encode(pos, mod3, mod7, mask)
        memo[key]?.let { return it }
        val choices = if (pos == bigL - 1) listOf(5) else DIGITS_LIST
        var total = 0L
        for (d in choices) {
            total += dp(pos + 1, (mod3 * 10 + d) % 3, (mod7 * 10 + d) % 7, mask xor (1 shl BIT_TABLE[d]!!))
        }
        memo[key] = total
        return total
    }
    var mod3 = 0
    var mod7 = 0
    var mask = 0
    val out = StringBuilder()
    var remaining = kVal
    for (pos in 0 until bigL) {
        val choices = if (pos == bigL - 1) listOf(5) else DIGITS_LIST
        var found = false
        for (d in choices) {
            val cnt = dp(pos + 1, (mod3 * 10 + d) % 3, (mod7 * 10 + d) % 7, mask xor (1 shl BIT_TABLE[d]!!))
            if (remaining > cnt) {
                remaining -= cnt
            } else {
                out.append(d.toString())
                mod3 = (mod3 * 10 + d) % 3
                mod7 = (mod7 * 10 + d) % 7
                mask = mask xor (1 shl BIT_TABLE[d]!!)
                found = true
                break
            }
        }
        if (!found) throw RuntimeException("RuntimeError")
    }
    return out.toString()
}

fun computeTheta(n: Long, maxL: Int = 200): String {
    var cum = 0L
    var L = 1
    while (L <= maxL) {
        val c = computeCountLen(L)
        if (cum + c >= n) {
            return performUnrank(L, n - cum)
        }
        cum += c
        L += 2
    }
    throw Exception("ValueError")
}

fun main() {
    val r1 = computeTheta(1L, 40)
    check(r1 == "1117935") { "assert failed: $r1" }
    val r2 = computeTheta(1000L, 40)
    check(r2 == "11137955115") { "assert failed: $r2" }
    println(computeTheta(10_000_000_000_000_000L, 200))
}
