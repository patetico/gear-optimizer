import { Hacks } from './assets/ItemAux';


export default class Hack {
  constructor(hackstats) {
    this.hackstats = hackstats;
  }

  bonus(level, idx) {
    const hack = Hacks[idx];
    return (level * hack[2] + 100) * hack[3] ** this.milestones(level, idx);
  }

  milestones(level, idx) {
    const hack = Hacks[idx];
    const { reducer } = this.hackstats.hacks[idx];
    return Math.floor(level / (hack[4] - reducer));
  }

  milestoneLevel(level, idx) {
    const hack = Hacks[idx];
    const { reducer } = this.hackstats.hacks[idx];
    return Math.floor(level / (hack[4] - reducer)) * (hack[4] - reducer);
  }

  reachable(level, mins, idx) {
    const cap = this.hackstats.rcap;
    const pow = this.hackstats.rpow;
    let speed = this.hackstats.hackspeed;
    let ticks = mins * 60 * 50;
    const base = Hacks[idx][1];

    let sf = 1;
    if (idx === 13) {
      sf = this.bonus(level, idx);
    }
    speed /= sf;

    let newLvl = level;
    while (ticks > 0) {
      ticks -= Math.ceil((base * (newLvl + 1) * 1.0078 ** newLvl) / (cap * pow * speed * sf));
      newLvl += 1;
      if (idx === 13) {
        // update speed factor
        sf = this.bonus(newLvl, idx);
      }
    }
    if (ticks < 0) {
      newLvl -= 1;
    }
    return newLvl;
  }

  time(level, target, idx) {
    const cap = this.hackstats.rcap;
    const pow = this.hackstats.rpow;
    let speed = this.hackstats.hackspeed;
    let ticks = 0;
    const base = Hacks[idx][1];
    let sf = 1;
    if (idx === 13) {
      sf = this.bonus(level, idx);
    }
    speed /= sf;

    let newLvl = level;
    while (newLvl < target) {
      ticks += Math.ceil((base * (newLvl + 1) * 1.0078 ** newLvl) / (cap * pow * speed * sf));
      newLvl += 1;
      if (idx === 13) {
        // update speed factor
        sf = this.bonus(newLvl, idx);
      }
    }
    return ticks;
  }
}
