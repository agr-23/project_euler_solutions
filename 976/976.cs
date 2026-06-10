// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/976.py

using System;

class P976
{
    const long MODVAL = 1234567891L;

    static long[] BuildInverses(int n, long mod)
    {
        long[] inv = new long[n + 1];
        if (n >= 1)
        {
            inv[1] = 1L;
        }
        for (int i = 2; i <= n; i++)
        {
            inv[i] = mod - (mod / (long)i) * inv[(int)(mod % (long)i)] % mod;
        }
        return inv;
    }

    static void Solve()
    {
        long n = 10_000_000L;
        long k = 10_000_000L;
        long e = n / 2L;
        long aCnt = (n + 3L) / 4L;
        long bCnt = (n + 1L) / 4L;
        long c = bCnt - aCnt;

        if (e == 0L)
        {
            long[] inv = BuildInverses((int)(k + 2L), MODVAL);
            long inv2 = (MODVAL + 1L) / 2L;
            long h = 1L;
            long q = 1L;
            long sumOddA = 0L;
            long ans = 0L;
            for (long s = 0L; s <= k; s++)
            {
                if (s > 0L)
                {
                    h = h * ((aCnt + bCnt + s - 1L) % MODVAL) % MODVAL * inv[(int)s] % MODVAL;
                    if (s % 2L == 0L)
                    {
                        long r = s / 2L;
                        q = q * ((aCnt + r - 1L) % MODVAL) % MODVAL * inv[(int)r] % MODVAL;
                    }
                }
                long coeff;
                if (c == 0L)
                    coeff = (s % 2L == 0L) ? q : 0L;
                else if (c == 1L)
                    coeff = q;
                else
                    coeff = (s % 2L == 0L) ? q : (MODVAL - q);
                long hOddA = (h - coeff + MODVAL) % MODVAL * inv2 % MODVAL;
                sumOddA = (sumOddA + hOddA) % MODVAL;
                ans = sumOddA;
            }
            Console.WriteLine(ans % MODVAL);
            return;
        }

        int maxInv = (int)(e + k + 2L);
        long[] invArr = BuildInverses(maxInv, MODVAL);
        long inv2Main = (MODVAL + 1L) / 2L;

        long totalEven = 1L;
        for (long m = 0L; m < k; m++)
        {
            totalEven = totalEven * ((e + m) % MODVAL) % MODVAL * invArr[(int)(m + 1L)] % MODVAL;
        }

        long qmax = k / 2L;
        long e0 = 1L;
        for (long q2 = 0L; q2 < qmax; q2++)
        {
            e0 = e0 * ((e + q2) % MODVAL) % MODVAL * invArr[(int)(q2 + 1L)] % MODVAL;
        }

        long hMain = 1L;
        long qMain = 1L;
        long qsum = 1L;
        long sumEven = 0L;
        long sumOdd = 0L;
        long sumOddA = 0L;
        long ansMain = 0L;
        long ab = aCnt + bCnt;

        for (long s = 0L; s <= k; s++)
        {
            if (s > 0L)
            {
                hMain = hMain * ((ab + s - 1L) % MODVAL) % MODVAL * invArr[(int)s] % MODVAL;
                if (s % 2L == 0L)
                {
                    long r = s / 2L;
                    qMain = qMain * ((aCnt + r - 1L) % MODVAL) % MODVAL * invArr[(int)r] % MODVAL;
                    if (c == 1L)
                    {
                        qsum = qsum * ((aCnt + r) % MODVAL) % MODVAL * invArr[(int)r] % MODVAL;
                    }
                }
            }
            long coeff;
            if (c == 0L)
                coeff = (s % 2L == 0L) ? qMain : 0L;
            else if (c == 1L)
                coeff = qsum;
            else
                coeff = (s % 2L == 0L) ? qMain : (MODVAL - qMain);
            long hOddA = (hMain - coeff + MODVAL) % MODVAL * inv2Main % MODVAL;
            if (s % 2L == 0L)
                sumEven = (sumEven + hMain) % MODVAL;
            else
                sumOdd = (sumOdd + hMain) % MODVAL;
            sumOddA = (sumOddA + hOddA) % MODVAL;
            long m = k - s;
            long t0, t1;
            if (m % 2L == 0L)
            {
                long e0m = e0;
                t0 = e0m * sumOddA % MODVAL;
                t1 = (totalEven - e0m + MODVAL) % MODVAL * sumEven % MODVAL;
            }
            else
            {
                t0 = 0L;
                t1 = totalEven * sumOdd % MODVAL;
            }
            ansMain = (ansMain + t0 + t1) % MODVAL;
            if (m > 0L)
            {
                totalEven = totalEven * (m % MODVAL) % MODVAL * invArr[(int)(e + m - 1L)] % MODVAL;
            }
            if (m % 2L == 0L && m >= 2L)
            {
                long qcur = m / 2L;
                e0 = e0 * (qcur % MODVAL) % MODVAL * invArr[(int)(e + qcur - 1L)] % MODVAL;
            }
        }
        Console.WriteLine(ansMain % MODVAL);
    }

    static void Main(string[] args)
    {
        Solve();
    }
}
