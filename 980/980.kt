// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/980.py

fun buildMulTableQ8(): Array<IntArray> {
    val baseArr = Array(4) { IntArray(4) }
    val sgnArr = Array(4) { IntArray(4) { 1 } }
    for (a in 0 until 4) {
        for (b in 0 until 4) {
            if (a == 0) {
                baseArr[a][b] = b
                sgnArr[a][b] = 1
            } else if (b == 0) {
                baseArr[a][b] = a
                sgnArr[a][b] = 1
            } else if (a == b) {
                baseArr[a][b] = 0
                sgnArr[a][b] = -1
            } else {
                when {
                    a == 1 && b == 2 -> { baseArr[a][b] = 3; sgnArr[a][b] = 1 }
                    a == 2 && b == 3 -> { baseArr[a][b] = 1; sgnArr[a][b] = 1 }
                    a == 3 && b == 1 -> { baseArr[a][b] = 2; sgnArr[a][b] = 1 }
                    a == 2 && b == 1 -> { baseArr[a][b] = 3; sgnArr[a][b] = -1 }
                    a == 3 && b == 2 -> { baseArr[a][b] = 1; sgnArr[a][b] = -1 }
                    a == 1 && b == 3 -> { baseArr[a][b] = 2; sgnArr[a][b] = -1 }
                    else -> throw RuntimeException("Unexpected basis multiplication case")
                }
            }
        }
    }
    val mulTable = Array(8) { IntArray(8) }
    for (bigA in 0 until 8) {
        val sa = if (bigA < 4) 1 else -1
        val a = bigA and 3
        for (bigB in 0 until 8) {
            val sb = if (bigB < 4) 1 else -1
            val b = bigB and 3
            val s = sa * sb * sgnArr[a][b]
            val c = baseArr[a][b]
            mulTable[bigA][bigB] = if (s == 1) c else (c xor 4)
        }
    }
    return mulTable
}

fun buildRTable(mulTable: Array<IntArray>, genElems: IntArray): IntArray {
    val rTable = IntArray(8 * 3)
    for (v in 0 until 8) {
        for (b in 0 until 3) {
            rTable[v * 3 + b] = mulTable[v][genElems[b]]
        }
    }
    return rTable
}

fun buildInvTable(mulTable: Array<IntArray>): IntArray {
    val invTable = IntArray(8)
    for (e in 0 until 8) {
        for (f in 0 until 8) {
            if (mulTable[e][f] == 0 && mulTable[f][e] == 0) {
                invTable[e] = f
                break
            }
        }
    }
    return invTable
}

val MUL_TABLE = buildMulTableQ8()
val GEN_ELEMS = intArrayOf(1, 2, 7)
val R_TABLE = buildRTable(MUL_TABLE, GEN_ELEMS)
val INV_TABLE = buildInvTable(MUL_TABLE)

fun computeF(nVal: Int): Long {
    val MOD = 888888883L
    val MULT = 8888L
    var aVal = 88888888L
    val cnts = LongArray(8)
    val R = R_TABLE
    for (iter in 0 until nVal) {
        var v = 0
        for (step in 0 until 50) {
            v = R[v * 3 + (aVal % 3).toInt()]
            aVal = (aVal * MULT) % MOD
        }
        cnts[v]++
    }
    var total = 0L
    val invArr = INV_TABLE
    for (e in 0 until 8) {
        total += cnts[e] * cnts[invArr[e]]
    }
    return total
}

fun main() {
    val r10 = computeF(10)
    check(r10 == 13L) { "Assert F(10) == 13 failed, got $r10" }
    val r100 = computeF(100)
    check(r100 == 1224L) { "Assert F(100) == 1224 failed, got $r100" }
    val result = computeF(1_000_000)
    println(result)
}
