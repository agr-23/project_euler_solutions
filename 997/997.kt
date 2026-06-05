// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/997.py

fun compute(px: Long, py: Long, pz: Long): Long {
    return 3L * (1L shl (px + py + pz - 1).toInt()) * ((1L shl px.toInt()) + (1L shl py.toInt()) + (1L shl pz.toInt()) - 4L)
}

fun main() {
    check(compute(1L, 1L, 1L) == 24L)
    check(compute(2L, 3L, 4L) == 18432L)
    println(compute(9L, 10L, 11L))
}