import { resourcePriorities, Wishes } from './assets/ItemAux';
import { shortenExponential, toTime } from './util';

// [min, max[
function getRandomInt(min, max) {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt)) + minInt;
}

function log(...args) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

export default class Wish {
  static base(res) {
    return res.map((x) => Math.max(1e3, Math.floor(x / 1e5)));
  }

  static updateRes(r, A) {
    return r.map((ri, i) => r[i] - A.reduce((res, a) => a[i] + res, 0));
  }

  static score(cost, wishcap, res, start, goal, x = -0.17) {
    let result = cost;
    for (let i = 0; i < res.length; i++) {
      result *= res[i] ** x;
    }
    let total = 0;
    for (let i = start + 1; i <= goal; i++) {
      total += Math.max(wishcap, (result / goal) * i);
    }
    return Math.ceil(total);
  }

  // TODO: can this be safely removed?
  static scoreRaw(cost, wishcap, res, start, goal, force = false, x = -0.17) {
    let result = cost;
    for (let i = 0; i < res.length; i++) {
      result *= res[i] ** x;
    }
    let total = 0;
    for (let i = start + 1; i <= goal; i++) {
      if (force || result > wishcap) {
        total += Math.max(wishcap, (result / goal) * i);
      } else {
        total += (result / goal) * i;
      }
    }
    return Math.ceil(total);
  }

  static spreadRes(
    assignments, res, scores,
    resourcePriority, wishcap, exponent,
    l, totres, coef, start, goal, minimal = 0,
  ) {
    const newAssignments = [...assignments];
    let newRes = [...res];
    let newScores = [...scores];

    const mincap = wishcap * Math.max(...coef.map((_, i) => goal[i] - start[i]));

    resourcePriority.forEach((i) => {
      for (let j = l - 1; j >= minimal; j--) {
        // might require quite a few iterations when doing
        // a single wish with multiple levels, but probably less than 20
        for (let count = 0; count < 1e3; count++) {
          if (newRes[i] < l || newScores[l - 1] === wishcap * (goal[j] - start[j])) {
            break;
          }

          let refScore;
          if (j === 0 || newScores[j - 1] === 0) {
            refScore = mincap;
          } else {
            refScore = newScores[j - 1] > mincap ? newScores[j - 1] : mincap;
          }

          if (newScores[j] === refScore) {
            break;
          }

          const ratio = newScores[l - 1] / refScore;
          let factor = ratio ** (1 / exponent);
          let s = 0;
          for (let k = j; k < l; k++) {
            s += newAssignments[k][i];
          }
          factor = Math.min(factor, newRes[i] / s + 1);

          // eslint-disable-next-line no-loop-func
          const required = newAssignments.map((a) => Math.min(a[i] * (factor - 1), newRes[i]));

          // assign additional resources and update remainder and score
          let changed = 0;

          for (let k = j; k < l; k++) {
            changed += Math.floor(required[k] + 1) / newAssignments[k][i];
            newAssignments[k][i] += Math.floor(required[k] + 1);
          }

          if (changed < 1e-4) {
            // nothing much is changing anymore
            break;
          }

          newRes = Wish.updateRes(totres, newAssignments);
          newScores = newAssignments
            .map((a, k) => Wish.score(coef[k], wishcap, a, start[k], goal[k]));
        }
      }
    });
    newRes = Wish.updateRes(totres, newAssignments);
    newScores = newAssignments.map((a, k) => Wish.score(coef[k], wishcap, a, start[k], goal[k]));

    return [newAssignments, newRes, newScores];
  }

  constructor(wishstats) {
    this.wishstats = wishstats;
  }

  saveRes(
    assignments, res, scores,
    resourcePriority, wishcap,
    exponent, l, totres, coef,
    start, goal, saveidx, spendidx, minimal,
  ) {
    const newAssignments = [...assignments];
    let newRes = [...res];
    let newScores = [...scores];

    const save = resourcePriority[saveidx];
    const spend = spendidx > -1 ? spendidx : resourcePriority[getRandomInt(0, saveidx)];
    let w1 = getRandomInt(minimal, l);
    while (goal[w1] === 0) {
      w1 = getRandomInt(minimal, l);
    }
    let w2 = w1;
    while (w1 === w2 || goal[w2] === 0) {
      w2 = getRandomInt(minimal, l);
    }
    if (
      newAssignments[w1][save] <= this.BASE[save]
      && newAssignments[w2][save] <= this.BASE[save]
    ) {
      return [newAssignments, newRes, newScores];
    }
    newScores = newAssignments.map((a, k) => Wish.score(coef[k], wishcap, a, start[k], goal[k]));
    if (newAssignments[w1][spend] > newAssignments[w2][spend]) {
      const tmp = w1;
      w1 = w2;
      w2 = tmp;
    }
    if (newRes[spend] > 0) {
      [w1, w2].forEach((w) => {
        if (newRes[spend] > 0 && newAssignments[w][save] > 1) {
          const tmp = [...newAssignments[w]];
          newAssignments[w][spend] = Math.ceil(tmp[spend] + newRes[spend]);
          if (tmp[spend] / newAssignments[w][spend] >= 1) {
            log('error in wish assignment');
          }
          newAssignments[w][save] *= tmp[spend] / newAssignments[w][spend];
          newAssignments[w][save] = Math.ceil(newAssignments[w][save]);
          newRes = Wish.updateRes(totres, newAssignments);
        }
      });
    }
    const M1 = newAssignments[w1][spend];
    const M2 = newAssignments[w2][spend];
    const R1 = newAssignments[w1][save];
    const R2 = newAssignments[w2][save];
    const m = M2 / M1;
    const r = R2 / R1;

    if (m * r === 1) {
      return [newAssignments, newRes, newScores];
    }

    const d = (m * r * (m + 1) ** 2) ** 0.5;
    const x1 = (m + 1 + d) / (1 - m * r);
    const x2 = (m + 1 - d) / (1 - m * r);
    let x;
    if (x1 < 0 && x2 < 0) {
      log('Wish error: both negative.');
      return [newAssignments, newRes, newScores];
    }
    if (x1 < 0) {
      x = x2;
    } else if (x2 < 0) {
      x = x1;
    } else {
      x = x1 < x2
        ? x1
        : x2;
    }
    if (x * M1 > M2 + M1 && x * M1 > M2 + M1 + newRes[spend]) {
      log('Wish warning: too many resources requested.');
      return [newAssignments, newRes, newScores];
    }
    newAssignments[w1][spend] = Math.max(this.BASE[spend], Math.ceil(x * M1));
    newAssignments[w2][spend] = Math.max(
      this.BASE[spend],
      Math.ceil(M2 + M1 - newAssignments[w1][spend]),
    );
    newAssignments[w1][save] = Math.max(
      this.BASE[save],
      Math.ceil((M1 * R1) / newAssignments[w1][spend]),
    );
    newAssignments[w2][save] = Math.max(
      this.BASE[save],
      Math.ceil((M2 * R2) / newAssignments[w2][spend]),
    );
    const newr = newAssignments[w1][save] + newAssignments[w2][save];
    const oldr = R1 + R2;

    if (oldr - newr < this.BASE[save]) {
      // oops
      newAssignments[w1][spend] = M1;
      newAssignments[w2][spend] = M2;
      newAssignments[w1][save] = R1;
      newAssignments[w2][save] = R2;
    }
    newRes = Wish.updateRes(totres, newAssignments);
    newScores = newAssignments.map((a, k) => Wish.score(coef[k], wishcap, a, start[k], goal[k]));
    return [newAssignments, newRes, newScores];
  }

  optimize() {
    const globalStartTime = Date.now();
    const resourcePriority = resourcePriorities[this.wishstats.rpIndex];
    const costs = this.wishstats.wishes.map((wish) => Wishes[wish.wishidx][1] * wish.goal);
    const wishcap = this.wishstats.wishcap/* minutes */ * 60 * 50;
    const mintottime = wishcap * Math.max(
      ...this.wishstats.wishes.map(({ goal, start }) => goal - start),
    );
    const powproduct = (this.wishstats.epow * this.wishstats.mpow * this.wishstats.rpow) ** 0.17;
    const capproduct = (this.wishstats.ecap * this.wishstats.mcap * this.wishstats.rcap) ** 0.17;
    const capreqs = costs.map((cost, k) => [
      cost / this.wishstats.wishspeed / powproduct,
      this.wishstats.wishes[k].start,
      this.wishstats.wishes[k].goal,
    ]).sort((a, b) => a[0] - b[0]);
    const totres = [
      Number(this.wishstats.ecap),
      Number(this.wishstats.mcap),
      Number(this.wishstats.rcap),
    ];
    let res = [...totres];
    const coef = capreqs.map((c) => c[0]);
    const start = capreqs.map((c) => c[1]);
    const goal = capreqs.map((c) => c[2]);
    const exponent = 0.17;

    let assignments = coef.map(() => Wish.base(res));
    this.BASE = Wish.base(res);
    res = Wish.updateRes(totres, assignments);
    const l = coef.length;
    let scores = coef
      .map((_, i) => Wish.score(coef[i], wishcap, assignments[i], start[i], goal[i]));
    let minimal = 0;
    while (minimal < scores.length && scores[minimal] <= mintottime) {
      minimal += 1;
    }
    res = res.map((x) => Math.max(0, x));
    if (powproduct === 1 && capproduct === 1) {
      // quit early
      return [
        toTime(Math.max(...scores)),
        assignments.map((a) => `${shortenExponential(a[0])} E; ${shortenExponential(a[1])} M; ${shortenExponential(a[2])} R3`),
        `${shortenExponential(res[0])} E; ${shortenExponential(res[1])} M; ${shortenExponential(res[2])} R3`,
      ];
    }

    // optimize
    [assignments, res, scores] = Wish.spreadRes(
      assignments, res, scores,
      resourcePriority, wishcap,
      exponent, l, totres, coef,
      start, goal, minimal,
    );
    if (goal.filter((x) => x > 0).length - minimal > 1) {
      const runs = 1000;
      for (let i = 0; i < runs; i++) {
        const save = res[1] <= 0 ? getRandomInt(1, 3) : 1;
        [assignments, res, scores] = this.saveRes(
          assignments, res, scores,
          resourcePriority, wishcap,
          exponent, l, totres, coef,
          start, goal, save, -1, minimal,
        );
        const max = Math.floor(Math.max(...scores));
        for (let k = minimal; k < coef.length; k++) {
          if (coef[k] !== 0) {
            for (let j = 2; j > -1; j--) {
              const spend = resourcePriority[j];
              let s = Wish.score(coef[k], wishcap, assignments[k], start[k], goal[k]);
              const a = assignments[k][spend];
              if (Math.ceil(s) < max) {
                assignments[k][spend] = Math.ceil(
                  assignments[k][spend] * (max / s) ** (-1 / exponent),
                );
                s = Math.ceil(Wish.score(coef[k], wishcap, assignments[k], start[k], goal[k]));
                while (s > max) {
                  assignments[k][spend] = Math.max(
                    Math.ceil((assignments[k][spend] + a) / 2 + a / 1000),
                    a,
                  );
                  s = Math.ceil(Wish.score(coef[k], wishcap, assignments[k], start[k], goal[k]));
                }
                res = Wish.updateRes(totres, assignments);
              }
            }
          }
        }
        if (Math.floor(Math.max(...scores)) === mintottime) {
          for (let k = minimal; k < coef.length; k++) {
            if (!(coef[k] === 0 || scores[k] < mintottime)) {
              for (let j = 2; j > -1; j--) {
                const spend = resourcePriority[j];
                let s = Wish.score(coef[k], wishcap, assignments[k], start[k], goal[k]);
                const a = assignments[k][spend];
                let b = a;
                while (s === mintottime) {
                  b /= 1.1;
                  if (b <= 1) {
                    b = 1;
                    break;
                  }
                  assignments[k][spend] = Math.max(this.BASE[spend], Math.floor(b));
                  s = Wish.score(coef[k], wishcap, assignments[k], start[k], goal[k]);
                }
                b = Math.floor(b);
                if (b === 1 && s === mintottime) {
                  break;
                }
                while (s > mintottime) {
                  b *= 1.05;
                  if (b >= a) {
                    b = a;
                    break;
                  }
                  assignments[k][spend] = Math.max(this.BASE[spend], Math.ceil(b));
                  s = Wish.score(coef[k], wishcap, assignments[k], start[k], goal[k]);
                }
                res = Wish.updateRes(totres, assignments);
              }
            }
          }
        }
        res = Wish.updateRes(totres, assignments);
        scores = assignments.map((a, k) => Wish.score(coef[k], wishcap, a, start[k], goal[k]));
        if (Math.floor(Math.max(...scores)) > mintottime + 100) {
          [assignments, res, scores] = Wish.spreadRes(
            assignments, res, scores,
            resourcePriority, wishcap,
            exponent, l, totres, coef,
            start, goal, minimal,
          );
        }
      }
    }

    /*
    log(coef);
    log(start);
    log(goal);
    log(res);
    scores = assignments.map((a, k) => this.scoreRaw(coef[k], wishcap, a, start[k], goal[k]));
    log(scores.map((x) => Math.floor(x)));
    /* */

    scores = assignments.map((a, k) => Wish.score(coef[k], wishcap, a, start[k], goal[k]));
    // log(scores.map(x => Math.floor(x)));

    // unsort the assigned values
    const idxs = coef.map((_, i) => i).sort((a, b) => costs[a] - costs[b]);
    const tmp = Array(l);
    for (let i = 0; i < l; i++) {
      tmp[idxs[i]] = assignments[i];
    }
    res = res.map((x) => Math.max(0, x));
    log(`${Date.now() - globalStartTime} ms`);
    return [
      toTime(Math.max(...scores)),
      tmp.map((a) => `${shortenExponential(a[0])} E; ${shortenExponential(a[1])} M; ${shortenExponential(a[2])} R3`),
      `${shortenExponential(res[0])} E; ${shortenExponential(res[1])} M; ${shortenExponential(res[2])} R3`,
    ];
  }
}
