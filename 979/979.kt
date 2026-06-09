// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/979.py

val SUBS_TABLE: Array<IntArray> = arrayOf(
    intArrayOf(0, 0, 1),
    intArrayOf(0, 1)
)

fun buildLayers(maxLayer: Int): Triple<Array<MutableList<Int>>, Array<MutableList<Int>>, Array<MutableList<Int>>> {
    val typesList = Array(maxLayer + 1) { mutableListOf<Int>() }
    val parent1List = Array(maxLayer + 1) { mutableListOf<Int>() }
    val parent2List = Array(maxLayer + 1) { mutableListOf<Int>() }

    typesList[0] = mutableListOf(0)
    if (maxLayer == 0) {
        return Triple(typesList, parent1List, parent2List)
    }

    typesList[1] = MutableList(7) { 0 }
    parent1List[1] = MutableList(7) { 0 }
    parent2List[1] = MutableList(7) { -1 }

    for (k in 2..maxLayer) {
        val prev = typesList[k - 1]
        val m = prev.size
        val cur = mutableListOf<Int>()
        val p1 = mutableListOf<Int>()
        val p2 = mutableListOf<Int>()

        for (j in prev.indices) {
            val t = prev[j]
            val block = SUBS_TABLE[t]
            val blen = block.size
            for (pos in 0 until blen) {
                val ct = block[pos]
                cur.add(ct)
                p1.add(j)
                if (pos == blen - 1) {
                    p2.add((j + 1) % m)
                } else {
                    p2.add(-1)
                }
            }
        }

        typesList[k] = cur
        parent1List[k] = p1
        parent2List[k] = p2
    }

    return Triple(typesList, parent1List, parent2List)
}

fun buildBallAdjacency(maxLayer: Int): Triple<Array<MutableList<Int>>, Int, IntArray> {
    val (typesList, parent1List, parent2List) = buildLayers(maxLayer)
    val sizes = IntArray(maxLayer + 1) { k -> typesList[k].size }

    val offsets = IntArray(maxLayer + 1)
    var total = 0
    for (k in 0..maxLayer) {
        offsets[k] = total
        total += sizes[k]
    }

    val adj = Array(total) { mutableListOf<Int>() }

    fun addEdge(u: Int, v: Int) {
        adj[u].add(v)
        adj[v].add(u)
    }

    val origin = offsets[0]

    for (k in 1..maxLayer) {
        val off = offsets[k]
        val m = sizes[k]
        for (i in 0 until m) {
            addEdge(off + i, off + ((i + 1) % m))
        }
    }

    if (maxLayer >= 1) {
        val off1 = offsets[1]
        for (i in 0 until sizes[1]) {
            addEdge(origin, off1 + i)
        }
    }

    for (k in 2..maxLayer) {
        val off = offsets[k]
        val poff = offsets[k - 1]
        for (i in 0 until sizes[k]) {
            addEdge(off + i, poff + parent1List[k][i])
            val p = parent2List[k][i]
            if (p != -1) {
                addEdge(off + i, poff + p)
            }
        }
    }

    if (maxLayer >= 1) {
        for (k in 0 until maxLayer) {
            val off = offsets[k]
            for (i in 0 until sizes[k]) {
                val u = off + i
                check(adj[u].size == 7) { "Assertion failed: adj degree at ($k,$i) is ${adj[u].size}" }
            }
        }
    }

    return Triple(adj, origin, offsets)
}

fun computeF(n: Int): Long {
    if (n < 0) return 0L
    if (n == 0) return 1L
    val maxLayer = n / 2
    val (adj, origin, _) = buildBallAdjacency(maxLayer)
    val nodeCount = adj.size
    var dp = LongArray(nodeCount)
    dp[origin] = 1L

    for (step in 0 until n) {
        val ndp = LongArray(nodeCount)
        for (u in 0 until nodeCount) {
            val v = dp[u]
            if (v != 0L) {
                for (nb in adj[u]) {
                    ndp[nb] += v
                }
            }
        }
        dp = ndp
    }

    return dp[origin]
}

fun main() {
    val f4 = computeF(4)
    check(f4 == 119L) { "Assertion failed: F(4) == $f4, expected 119" }
    println(computeF(20))
}
