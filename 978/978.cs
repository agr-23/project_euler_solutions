// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/978.py

using System;
using System.Numerics;

class Program978 {
    static string SkewnessAt(int t) {
        if (t < 0) throw new ArgumentException("t must be non-negative");
        if (t == 0) throw new ArgumentException("Skewness at t=0 is undefined (variance 0).");
        if (t == 1) throw new ArgumentException("Skewness at t=1 is undefined (variance 0).");

        BigInteger a0 = BigInteger.Zero, a1 = BigInteger.One;
        BigInteger m0 = BigInteger.Zero, m1 = BigInteger.One;

        for (int i = 2; i <= t; i++) {
            BigInteger aNew = a1 + a0;
            a0 = a1;
            a1 = aNew;
            BigInteger mNew = m1 + 3 * m0;
            m0 = m1;
            m1 = mNew;
        }

        BigInteger a_t = a1;
        BigInteger m_t = m1;
        BigInteger mu = BigInteger.One;
        BigInteger varVal = a_t - mu * mu;

        if (varVal <= BigInteger.Zero) throw new ArgumentException("Variance is non-positive; skewness undefined.");

        BigInteger central3 = m_t - 3 * a_t + 2;

        int PREC = 110;
        BigInteger SCALE = BigInteger.Pow(10, PREC);

        BigInteger sqrtVar = BigSqrt(varVal, SCALE);
        BigInteger numerator = central3 * SCALE;
        BigInteger denominator = varVal * sqrtVar;
        BigInteger resultScaled = (numerator * SCALE) / denominator;

        string str = resultScaled.ToString();
        bool isNeg = str.StartsWith('-');
        string absStr = isNeg ? str.Substring(1) : str;

        string intPart, fracPart;
        if (absStr.Length <= PREC) {
            intPart = "0";
            fracPart = absStr.PadLeft(PREC, '0');
        } else {
            intPart = absStr.Substring(0, absStr.Length - PREC);
            fracPart = absStr.Substring(absStr.Length - PREC);
        }

        string fracDigits = fracPart.Substring(0, 8);
        int nextDigit = fracPart.Length > 8 ? (int)(fracPart[8] - '0') : 0;
        BigInteger fracNum = BigInteger.Parse(fracDigits);
        if (nextDigit >= 5) fracNum += 1;

        BigInteger intNum = BigInteger.Parse(intPart);
        string fracStr = fracNum.ToString().PadLeft(8, '0');
        if (fracStr.Length > 8) {
            intNum += 1;
            fracStr = fracStr.Substring(1);
        }

        return (isNeg ? "-" : "") + intNum.ToString() + "." + fracStr;
    }

    static BigInteger BigSqrt(BigInteger n, BigInteger scale) {
        if (n == BigInteger.Zero) return BigInteger.Zero;
        BigInteger target = n * scale * scale;
        BigInteger x = (BigInteger)Math.Ceiling(Math.Sqrt((double)n)) * scale;
        while (true) {
            BigInteger xnew = (x + target / x) / 2;
            if (xnew >= x) break;
            x = xnew;
        }
        return x;
    }

    static void Main(string[] args) {
        string sk5 = SkewnessAt(5);
        if (sk5 != "0.75000000") throw new Exception($"Assert failed: sk5={sk5}");

        string sk10 = SkewnessAt(10);
        double sk10num = double.Parse(sk10);
        if (Math.Abs(sk10num - 2.50997097) >= 0.00000001) throw new Exception($"Assert failed: sk10={sk10}");

        string sk50 = SkewnessAt(50);
        Console.WriteLine(sk50);
    }
}
