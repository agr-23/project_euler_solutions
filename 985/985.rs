// Adapted from https://raw.githubusercontent.com/cirosantilli/project-euler-solutions/refs/heads/master/solvers/985.py

use std::f64::consts::PI;

const EPS: f64 = 1e-12;

fn clamp_val(x: f64) -> f64 {
    if x < -1.0 {
        return -1.0;
    }
    if x > 1.0 {
        return 1.0;
    }
    x
}

fn compute_triangle_angles(a: i64, b: i64, c: i64) -> (f64, f64, f64) {
    let af = a as f64;
    let bf = b as f64;
    let cf = c as f64;

    let cos_a = clamp_val((bf * bf + cf * cf - af * af) / (2.0 * bf * cf));
    let cos_b = clamp_val((af * af + cf * cf - bf * bf) / (2.0 * af * cf));
    let cos_c = clamp_val((af * af + bf * bf - cf * cf) / (2.0 * af * bf));

    let angle_a = cos_a.acos();
    let angle_b = cos_b.acos();
    let angle_c = cos_c.acos();

    assert!(
        ((angle_a + angle_b + angle_c) - PI).abs() < 1e-7,
        "Angle sum is not pi; check input or numerics."
    );

    (angle_a, angle_b, angle_c)
}

fn advance_angles(angle_a: f64, angle_b: f64, angle_c: f64) -> (f64, f64, f64) {
    (
        PI - 2.0 * angle_b,
        PI - 2.0 * angle_c,
        PI - 2.0 * angle_a,
    )
}

fn count_valid_steps(a: i64, b: i64, c: i64, max_steps: i64) -> i64 {
    let (mut angle_a, mut angle_b, mut angle_c) = compute_triangle_angles(a, b, c);
    let mut steps = 0i64;
    for _ in 0..max_steps {
        let (na, nb, nc) = advance_angles(angle_a, angle_b, angle_c);
        angle_a = na;
        angle_b = nb;
        angle_c = nc;
        if angle_a <= EPS || angle_b <= EPS || angle_c <= EPS {
            break;
        }
        steps += 1;
    }
    steps
}

fn search_min_perimeter(target_steps: i64, max_perimeter: i64) -> (Option<i64>, Vec<(i64, i64, i64)>) {
    let mut best_perimeter: Option<i64> = None;
    let mut best_triangles: Vec<(i64, i64, i64)> = Vec::new();

    for p in 3..=max_perimeter {
        if let Some(bp) = best_perimeter {
            if p > bp {
                break;
            }
        }
        let mut a = 1i64;
        while a <= p / 3 {
            let mut b = a;
            while b <= (p - a) / 2 {
                let c = p - a - b;
                if c >= b && a + b > c {
                    let steps = count_valid_steps(a, b, c, target_steps + 2);
                    if steps == target_steps {
                        let mut triple = [a, b, c];
                        triple.sort();
                        let t = (triple[0], triple[1], triple[2]);
                        match best_perimeter {
                            None => {
                                best_perimeter = Some(p);
                                best_triangles = vec![t];
                            }
                            Some(bp) if p < bp => {
                                best_perimeter = Some(p);
                                best_triangles = vec![t];
                            }
                            Some(bp) if p == bp => {
                                best_triangles.push(t);
                            }
                            _ => {}
                        }
                    }
                }
                b += 1;
            }
            a += 1;
        }
    }

    best_triangles.sort();
    best_triangles.dedup();
    (best_perimeter, best_triangles)
}

fn solve_problem(target_steps: i64) -> (i64, (i64, i64, i64)) {
    let mut best_perimeter: Option<i64> = None;
    let mut best_triangle: Option<(i64, i64, i64)> = None;
    let mut n = 2i64;

    loop {
        let candidates = [(n, n, n + 1), (n, n + 1, n + 1)];
        for &(a, b, c) in &candidates {
            let steps = count_valid_steps(a, b, c, target_steps + 2);
            if steps == target_steps {
                let p = a + b + c;
                match best_perimeter {
                    None => {
                        best_perimeter = Some(p);
                        best_triangle = Some((a, b, c));
                    }
                    Some(bp) if p < bp => {
                        best_perimeter = Some(p);
                        best_triangle = Some((a, b, c));
                    }
                    _ => {}
                }
            }
        }
        n += 1;
        if let Some(bp) = best_perimeter {
            if 3 * n + 1 > bp {
                break;
            }
        }
        if n > 5_000_000 {
            panic!("Search did not converge; check logic.");
        }
    }

    (best_perimeter.unwrap(), best_triangle.unwrap())
}

fn main() {
    let steps_8_9_10 = count_valid_steps(8, 9, 10, 10);
    assert_eq!(steps_8_9_10, 2, "Expected 2 steps for (8,9,10), got {}", steps_8_9_10);

    let (min_p_2, tris_2) = search_min_perimeter(2, 50);
    assert_eq!(min_p_2, Some(10), "Expected perimeter 10 for target_steps=2, got {:?}", min_p_2);
    assert!(
        tris_2.contains(&(3, 3, 4)),
        "Expected triangle (3,3,4) to be among minimisers for target_steps=2"
    );

    let (best_perimeter, _best_triangle) = solve_problem(20);
    println!("{}", best_perimeter);
}
