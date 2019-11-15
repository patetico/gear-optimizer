import { NGUs } from './assets/ItemAux';


export default class NGU {
  constructor(ngustats) {
    this.ngustats = ngustats;
  }

  static bonus(ngu, levels) {
    return NGU.nbonus(ngu, Number(levels.normal))
      * NGU.ebonus(ngu, Number(levels.evil))
      * NGU.sbonus(ngu, Number(levels.sadistic));
  }

  static nbonus(ngu, level) {
    return NGU.vbonus('normal', ngu, level);
  }

  static ebonus(ngu, level) {
    return NGU.vbonus('evil', ngu, level);
  }

  static sbonus(ngu, level) {
    return NGU.vbonus('sadistic', ngu, level);
  }

  static vbonus(version, ngu, level) {
    if (ngu.name === 'Respawn') {
      return NGU.respawnbonus(version, ngu, level);
    }
    if (level <= 0) {
      return 1;
    }
    if (level > 1e9) {
      return 1e9;
    }
    if (Number.isNaN(level)) {
      return 1;
    }
    const data = ngu[version];
    if (level <= data.softcap) {
      return 1 + level * data.bonus;
    }
    return 1 + level ** data.scexponent * data.scbonus * data.bonus;
  }

  static respawnbonus(version, ngu, level) {
    if (level <= 0) {
      return 1;
    }
    if (level > 1e9) {
      return 1e9;
    }
    if (Number.isNaN(level)) {
      return 1;
    }
    const data = ngu[version];
    if (level <= data.softcap) {
      const result = 1 - level * data.bonus;
      const cap = {
        normal: 0.8,
        evil: 0.925,
        sadistic: 0.925,
      }[version];
      return Math.max(result, cap);
    }
    const result = 1 - level / (level * data.scbonus + 200000) - data.scexponent;
    const cap = {
      normal: 0.6,
      evil: 0.9,
      sadistic: 0.9,
    }[version];
    return Math.max(result, cap);
  }

  reachableBonus(levels, min, idx, isMagic, quirk) {
    const reachable = this.reachable(levels, min, idx, isMagic);
    const resource = isMagic
      ? 'magic'
      : 'energy';
    return {
      level: reachable,
      bonus: {
        normal: NGU.bonus(NGUs[resource][idx], {
          ...levels,
          normal: reachable.normal,
        }),
        evil: NGU.bonus(NGUs[resource][idx], {
          ...levels,
          normal: quirk.e2n
            ? Math.min(1e9, Number(levels.normal) + reachable.evil - Number(levels.evil))
            : levels.normal,
          evil: reachable.evil,
        }),
        sadistic: NGU.bonus(NGUs[resource][idx], {
          ...levels,
          normal: quirk.s2e && quirk.e2n
            ? Math.min(1e9, Number(levels.normal) + reachable.sadistic - Number(levels.sadistic))
            : levels.normal,
          evil: quirk.s2e
            ? Math.min(1e9, Number(levels.evil) + reachable.sadistic - Number(levels.sadistic))
            : levels.evil,
          sadistic: reachable.sadistic,
        }),
      },
    };
  }

  reachable(levels, mins, idx, isMagic) {
    const resource = isMagic
      ? 'magic'
      : 'energy';
    return {
      normal: this.vreachable(
        Number(levels.normal), mins, 1, NGUs[resource][idx].normal.cost, resource,
      ),
      evil: this.vreachable(
        Number(levels.evil), mins, 1, NGUs[resource][idx].evil.cost, resource,
      ),
      sadistic: this.vreachable(
        Number(levels.sadistic), mins, 1e7, NGUs[resource][idx].sadistic.cost, resource,
      ),
    };
  }

  static bbtill(base, level, factor, cap, speed) {
    return (cap * speed) / factor / base;
  }

  vreachable(level, mins, factor, base, resource) {
    const { cap } = this.ngustats[resource];
    const speed = this.ngustats[resource].nguspeed;
    let newLvl = level;
    let ticks = mins * 60 * 50;
    const bbtill = (cap * speed) / factor / base;
    if (500 * bbtill > newLvl) {
      // handle bar fills up to 0.1s
      for (let i = 1; i < 501; i++) {
        if (i * bbtill >= newLvl + Math.floor(ticks / i)) {
          return Math.min(1e9, newLvl + Math.floor(ticks / i));
        }
        if (Math.floor(i * bbtill) > newLvl) {
          ticks -= i * (Math.floor(i * bbtill) - newLvl);
          newLvl = Math.floor(i * bbtill);
        }
      }
    }
    // handle slow bar fills
    while (ticks > 0 && newLvl < 1e9) {
      ticks -= Math.ceil((base * (newLvl + 1) * factor) / (cap * speed));
      newLvl += 1;
    }
    // correct overfill
    if (ticks < 0) {
      newLvl -= 1;
    }
    return Math.min(1e9, newLvl);
  }
}
