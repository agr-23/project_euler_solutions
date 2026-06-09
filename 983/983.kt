// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/983.py

val OFF = 1 shl 15
val SHIFT = 17

fun encodeCoord(x: Int, y: Int): Int {
    return ((x + OFF) shl SHIFT) or (y + OFF)
}

fun circlePoints(m: Int): List<Pair<Int, Int>> {
    val lim = Math.sqrt(m.toDouble()).toInt()
    val pts = mutableListOf<Pair<Int, Int>>()
    for (x in -lim..lim) {
        val y2 = m - x * x
        if (y2 < 0) continue
        val y = Math.sqrt(y2.toDouble()).toInt()
        if (y * y == y2) {
            pts.add(Pair(x, y))
            if (y != 0) pts.add(Pair(x, -y))
        }
    }
    return pts
}

fun computeOppositePairs(points: List<Pair<Int, Int>>): List<Pair<Pair<Int, Int>, Pair<Int, Int>>> {
    val pairs = mutableListOf<Pair<Pair<Int, Int>, Pair<Int, Int>>>()
    val used = mutableSetOf<Int>()
    val sorted = points.sortedWith(compareBy({ it.first }, { it.second }))
    for (v in sorted) {
        val vk = encodeCoord(v.first, v.second)
        if (vk in used) continue
        val w = Pair(-v.first, -v.second)
        used.add(vk)
        used.add(encodeCoord(w.first, w.second))
        pairs.add(Pair(v, w))
    }
    return pairs
}

fun countAntipodalPairs(m: Int): Int {
    var x = m
    while (x % 2 == 0) x /= 2
    var product = 1
    var p = 3
    while (p * p <= x) {
        if (x % p == 0) {
            var exponent = 0
            while (x % p == 0) { x /= p; exponent++ }
            if (p % 4 == 1) {
                product *= exponent + 1
            } else if ((exponent and 1) != 0) {
                return 0
            }
        }
        p += 2
    }
    if (x > 1) {
        if (x % 4 == 1) product *= 2
        else if (x % 4 == 3) return 0
    }
    return 2 * product
}

fun buildDisplacementSet(points: List<Pair<Int, Int>>): Set<Int> {
    val deltas = mutableSetOf<Int>()
    for ((ax, ay) in points) {
        for ((bx, by) in points) {
            if (ax != bx || ay != by) {
                deltas.add(encodeCoord(ax - bx, ay - by))
            }
        }
    }
    return deltas
}

fun checkFourVectorPrune(selected: List<Pair<Int, Int>>, candidate: Pair<Int, Int>, deltas: Set<Int>): Boolean {
    if (selected.size < 3) return true
    val (vx, vy) = candidate
    val sel = selected.size
    for (i in 0 until sel - 2) {
        val (ax, ay) = selected[i]
        for (j in i + 1 until sel - 1) {
            val (bx, by) = selected[j]
            for (k in j + 1 until sel) {
                val (cx, cy) = selected[k]
                for (sa in intArrayOf(1, -1)) {
                    val x1 = vx + sa * ax
                    val y1 = vy + sa * ay
                    for (sb in intArrayOf(1, -1)) {
                        val x2 = x1 + sb * bx
                        val y2 = y1 + sb * by
                        var xv = x2 + cx
                        var yv = y2 + cy
                        if ((xv != 0 || yv != 0) && encodeCoord(xv, yv) in deltas) return false
                        xv = x2 - cx
                        yv = y2 - cy
                        if ((xv != 0 || yv != 0) && encodeCoord(xv, yv) in deltas) return false
                    }
                }
            }
        }
    }
    return true
}

fun buildEvenMasks(k: Int): List<Int> {
    val masks = mutableListOf<Int>()
    for (mask in 0 until (1 shl k)) {
        var bits = 0; var mm = mask
        while (mm != 0) { bits += mm and 1; mm = mm ushr 1 }
        if ((bits and 1) == 0) masks.add(mask)
    }
    return masks
}

fun computeCenters(vectors: List<Pair<Int, Int>>, masks: List<Int>): List<Pair<Int, Int>> {
    val centers = mutableListOf<Pair<Int, Int>>()
    for (mask in masks) {
        var x = 0; var y = 0; var mm = mask
        while (mm != 0) {
            val lsb = mm and -mm
            var idx = 0; var tmp = lsb; while (tmp > 1) { tmp = tmp ushr 1; idx++ }
            x += vectors[idx].first
            y += vectors[idx].second
            mm -= lsb
        }
        centers.add(Pair(x, y))
    }
    return centers
}

fun quickHarmonyCheck(centers: List<Pair<Int, Int>>, pts: List<Pair<Int, Int>>, n: Int): Boolean {
    val counts = mutableMapOf<Int, Int>()
    var harmonyCount = 0
    for ((cx, cy) in centers) {
        for ((vx, vy) in pts) {
            val key = encodeCoord(cx + vx, cy + vy)
            val cur = counts[key]
            if (cur == null) counts[key] = 1
            else if (cur == 1) { counts[key] = 2; harmonyCount++; if (harmonyCount > n) return false }
            else counts[key] = cur + 1
        }
    }
    return harmonyCount == n
}

fun strictCheck(centers: List<Pair<Int, Int>>, pts: List<Pair<Int, Int>>, n: Int): Boolean {
    val centerCodes = centers.map { (x, y) -> encodeCoord(x, y) }
    val centerSet = centerCodes.toHashSet()
    val tangentDiffs = pts.map { (x, y) -> encodeCoord(2 * x, 2 * y) }
    for (c in centerCodes) {
        for (d in tangentDiffs) {
            val other = c + d
            if (other in centerSet && c < other) return false
        }
    }
    val ptToCenters = mutableMapOf<Int, MutableList<Int>>()
    for ((idx, center) in centers.withIndex()) {
        val (cx, cy) = center
        for ((vx, vy) in pts) {
            val key = encodeCoord(cx + vx, cy + vy)
            ptToCenters.getOrPut(key) { mutableListOf() }.add(idx)
        }
    }
    val harmonyPts = ptToCenters.entries.filter { it.value.size >= 2 }.map { it.key }
    if (harmonyPts.size != n) return false
    val parent = IntArray(n) { it }
    val sz = IntArray(n) { 1 }
    fun find(xi: Int): Int {
        var xv = xi
        while (parent[xv] != xv) { parent[xv] = parent[parent[xv]]; xv = parent[xv] }
        return xv
    }
    fun union(a: Int, b: Int) {
        var ra = find(a); var rb = find(b)
        if (ra == rb) return
        if (sz[ra] < sz[rb]) { val tmp = ra; ra = rb; rb = tmp }
        parent[rb] = ra; sz[ra] += sz[rb]
    }
    for (key in harmonyPts) {
        val lst = ptToCenters[key]!!
        val base = lst[0]
        for (j in 1 until lst.size) union(base, lst[j])
    }
    val root = find(0)
    for (i in 1 until n) { if (find(i) != root) return false }
    return true
}

fun hasUnitCoord(points: List<Pair<Int, Int>>): Boolean {
    for ((x, y) in points) { if (Math.abs(x) == 1 || Math.abs(y) == 1) return true }
    return false
}

fun checkValidOrientedVectors(pairs: List<Pair<Pair<Int, Int>, Pair<Int, Int>>>, pts: List<Pair<Int, Int>>, k: Int, masks: List<Int>, n: Int): Boolean {
    val deltas = buildDisplacementSet(pts)
    val selected = mutableListOf<Pair<Int, Int>>()
    fun dfs(start: Int): Boolean {
        if (selected.size == k) {
            val centers = computeCenters(selected, masks)
            return quickHarmonyCheck(centers, pts, n) && strictCheck(centers, pts, n)
        }
        val needed = k - selected.size
        for (pi in start..pairs.size - needed) {
            val choices = if (selected.isEmpty()) listOf(pairs[pi].first) else listOf(pairs[pi].first, pairs[pi].second)
            for (vec in choices) {
                if (!checkFourVectorPrune(selected, vec, deltas)) continue
                selected.add(vec)
                if (dfs(pi + 1)) return true
                selected.removeAt(selected.size - 1)
            }
        }
        return false
    }
    return dfs(0)
}

fun searchMinRadiusSq(k: Int, mLimit: Int, filtered: Boolean): Int {
    val masks = buildEvenMasks(k)
    val n = 1 shl (k - 1)
    for (m in 1..mLimit) {
        val p = countAntipodalPairs(m)
        if (p < k) continue
        if (filtered && p != k && p != k + 2) continue
        val pts = circlePoints(m)
        if (filtered && !hasUnitCoord(pts)) continue
        val pairs = computeOppositePairs(pts)
        if (pairs.size != p) continue
        if (checkValidOrientedVectors(pairs, pts, k, masks, n)) return m
    }
    throw RuntimeException("No solution found up to m=$mLimit")
}

fun main() {
    val r1 = searchMinRadiusSq(2, 20, false)
    check(r1 == 1) { "Expected 1, got $r1" }
    val r2 = searchMinRadiusSq(3, 50, false)
    check(r2 == 5) { "Expected 5, got $r2" }
    println(searchMinRadiusSq(10, 20000, true))
}
