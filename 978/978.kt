// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/978.py

import java.math.BigDecimal
import java.math.BigInteger
import java.math.MathContext
import java.math.RoundingMode

fun skewnessAt(t: Int): BigDecimal {
    if (t < 0) throw IllegalArgumentException("t must be non-negative")
    if (t == 0) throw IllegalArgumentException("Skewness at t=0 is undefined (variance 0).")
    if (t == 1) throw IllegalArgumentException("Skewness at t=1 is undefined (variance 0).")

    var a0 = BigInteger.ZERO
    var a1 = BigInteger.ONE
    var m0 = BigInteger.ZERO
    var m1 = BigInteger.ONE

    for (i in 2..t) {
        val aNew = a1 + a0
        a0 = a1
        a1 = aNew
        val mNew = m1 + BigInteger.valueOf(3) * m0
        m0 = m1
        m1 = mNew
    }

    val a_t = a1
    val m_t = m1
    val mu = BigInteger.ONE
    val varVal = a_t - mu * mu

    if (varVal <= BigInteger.ZERO) throw IllegalArgumentException("Variance is non-positive; skewness undefined.")

    val central3 = m_t - BigInteger.valueOf(3) * a_t + BigInteger.TWO

    val mc = MathContext(100)
    val varD = BigDecimal(varVal, mc)
    val sigma3 = varD.sqrt(mc).pow(3, mc)
    return BigDecimal(central3, mc).divide(sigma3, mc)
}

fun main() {
    val sk5 = skewnessAt(5)
    val sk5Rounded = sk5.setScale(8, RoundingMode.HALF_UP)
    check(sk5Rounded.compareTo(BigDecimal("0.75000000")) == 0) { "Assert failed: sk5=$sk5Rounded" }

    val sk10 = skewnessAt(10)
    val diff = (sk10 - BigDecimal("2.50997097")).abs()
    check(diff < BigDecimal("0.00000001")) { "Assert failed: sk10=$sk10" }

    val sk50 = skewnessAt(50)
    val ans = sk50.setScale(8, RoundingMode.HALF_UP)
    println(ans)
}
