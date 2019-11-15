import {
  EmptySlot, Equip, Factors, Slot,
} from './assets/ItemAux';
import {
  allowedZone,
  clone,
  cubeBaseItemData,
  getLimits,
  getRawVals,
  getVals,
  hardcap,
  old2newequip,
  scoreEquip,
  scoreRawEquip,
  scoreVals,
} from './util';


const EMPTY_ACCESSORY = new EmptySlot(Slot.ACCESSORY).name;


function log(...args) {
  // eslint-disable-next-line no-console
  console.log(...args);
}


export default class Optimizer {
  static addEquip(equip, item, effect = 100) {
    const newEquip = clone(equip);

    if (item.empty) return equip;

    for (let i = 0; i < item.statnames.length; i++) {
      const stat = item.statnames[i];
      newEquip[stat] += (item[stat] * effect) / 100;
    }

    newEquip.items.push(item);
    newEquip.counts[item.slot[0]] += 1;
    return newEquip;
  }

  static filterAccs(candidate, accslots, accs) {
    const candidateAccs = candidate.accessory.filter((x) => accs.includes(x));
    return accs.filter((x) => !candidateAccs.includes(x));
  }

  static removeEquip(equip, item) {
    const newEquip = clone(equip);

    if (item.empty) return newEquip;

    const newItem = equip.items.find(({ name }) => (name === item.name));
    if (newItem === undefined) return newEquip;
    for (let i = 0; i < newItem.statnames.length; i++) {
      const stat = newItem.statnames[i];
      newEquip[stat] -= newItem[stat];
    }
    newEquip.items = newEquip.items.filter((x) => (x.name !== newItem.name));
    newEquip.counts[newItem.slot[0]] -= 1;
    return newEquip;
  }

  static sortLocks(locked, equip, result) {
    const newResult = { ...result };
    // sort locks
    Object.keys(Slot).forEach((slotname) => {
      const slot = Slot[slotname][0];
      const locks = locked[slot];
      if (locks === undefined) {
        return;
      }
      const items = [...result[slot]];
      let itemIdx = locks.length;
      const sorted = [];
      // add the items in the correct order
      for (let slotIdx = 0; slotIdx < equip[slot].length; slotIdx++) {
        if (locks.includes(slotIdx)) {
          const item = equip[slot][slotIdx];
          sorted.push(item);
        } else if (itemIdx < items.length) {
          const item = items[itemIdx];
          sorted.push(item);
          itemIdx += 1;
        } else {
          sorted.push(new EmptySlot(slot).name);
        }
      }
      newResult[slot] = sorted;
    });
    return newResult;
  }

  constructor(state) {
    this.itemnames = state.items;
    this.itemdata = cubeBaseItemData(state.itemdata, state.cubestats, state.basestats);
    this.factorslist = state.factors;
    this.maxslotslist = state.maxslots;
    this.accslots = state.equip.accessory.length;
    this.offhand = state.offhand * 5;
    this.limits = getLimits(state);
    this.capstats = state.capstats;
  }

  constructBase(locked, equip) {
    let base = new Equip();
    Object.getOwnPropertyNames(locked).forEach((slot) => {
      const locks = locked[slot];
      for (let i = 0; i < locks.length; i++) {
        const item = this.itemdata[equip[slot][locks[i]]];
        base = Optimizer.addEquip(base, item);
      }
    });
    base = this.old2newEquip(base);
    // wrap base in an array
    return [base];
  }

  old2newEquip(equip) {
    // create new equip
    return {
      ...old2newequip(this.accslots, this.offhand, equip),
      other: ['Infinity Cube', 'Base Stats'],
    };
  }

  new2oldEquip(equip) {
    const base = new Equip();
    Object.getOwnPropertyNames(Slot)
      .forEach((slot) => {
        for (let i = 0; i < equip[Slot[slot][0]].length; i++) {
          const name = equip[Slot[slot][0]][i];
          const item = this.itemdata[name];
          Optimizer.addEquip(base, item);
        }
      });
    return base;
  }

  scoreEquip(equip) {
    return scoreEquip(this.itemdata, equip, this.factors, this.offhand, this.capstats);
  }

  scoreRawEquip(equip) {
    return scoreRawEquip(this.itemdata, equip, this.factors, this.offhand);
  }

  getVals(equip) {
    return getVals(this.itemdata, equip, this.factors, this.offhand, this.capstats);
  }

  getRawVals(equip) {
    return getRawVals(this.itemdata, equip, this.factors, this.offhand);
  }

  scoreEquipWrapper(baseLayout) {
    const equip = this.old2newEquip(baseLayout);
    return this.scoreEquip(equip);
  }

  scoreRawEquipWrapper(baseLayout) {
    const equip = this.old2newEquip(baseLayout);
    return this.scoreRawEquip(equip);
  }

  getValsWrapper(baseLayout) {
    const equip = this.old2newEquip(baseLayout);
    return this.getVals(equip);
  }

  swapVals(vals, a, b) {
    const valsA = this.getVals({ accessory: a });
    const valsB = this.getVals({ accessory: b });

    const newVals = [...vals];
    for (let i = 0; i < vals.length; i++) {
      newVals[i] += valsB[i] - valsA[i];
    }

    return newVals;
  }

  topScorers(optimal) {
    const scores = optimal.map((x) => this.scoreEquip(x));
    const max = Math.max(...scores);
    return optimal.filter((x, idx) => scores[idx] === max);
  }

  sortAccs(equip) {
    const optimalSize = equip.items.length;
    let scores = [];
    for (let jdx = Math.max(0, equip.item_count); jdx < optimalSize; jdx++) {
      const item = equip.items[jdx];
      const score = this.scoreRawEquipWrapper(Optimizer.removeEquip(equip, item));
      scores.push([score, item]);
    }
    for (let jdx = equip.item_count; jdx < optimalSize; jdx++) {
      equip.items.pop();
    }
    scores = scores.sort((a, b) => (a[0] - b[0]));

    for (let i = 0; i < scores.length; i++) {
      equip.items.push(scores[i][1]);
    }

    return equip;
  }

  countAccslots(baseLayout) {
    let accslots = this.accslots - baseLayout.counts.accessory;
    accslots = this.maxslots < accslots ? this.maxslots : accslots;
    return accslots;
  }

  optimizeLayouts(baseLayout, accslots, s) {
    // find all possible items that can be equiped in main slots
    const weapons = baseLayout.counts.weapon;
    const options = [
      ['WEAPON', 100, 'mainhand'],
      ['WEAPON', this.offhand, 'offhand'],
      ['HEAD', 100],
      ['CHEST', 100],
      ['PANTS', 100],
      ['BOOTS', 100],
    ]
      .filter(([slotName, lvl, hand]) => {
        if (lvl === 0) return false;

        const [slot] = Slot[slotName];

        if (slot === 'accessory' || slot === 'other') return false;
        if (slot === 'weapon' && hand === 'mainhand') return weapons === 0;
        if (slot === 'weapon' && hand === 'offhand') return weapons < 2;

        return baseLayout.counts[slot] < 1;
      })
      .map(([slot, lvl]) => ([
        this.gearSlot(Slot[slot], baseLayout),
        lvl,
      ]));

    s.push(options.map((x) => (x[0].length)).reduce((a, b) => (a * b), 1));
    const remaining = options.map((x) => {
      const items = x[0];
      return [
        this.pareto(
          items,
          items[0].slot[0] === 'weapon' ? 2 - baseLayout.counts.weapon : 1,
        ),
        x[1],
      ];
    });

    s.push(remaining.map((x) => (x[0].length)).reduce((a, b) => (a * b), 1));

    // TODO: fix eslint
    // eslint-disable-next-line no-param-reassign
    baseLayout.item_count = baseLayout.items.length;

    let layouts = [baseLayout];
    for (let i = 0; i < remaining.length; i++) {
      const tmp = clone(layouts);
      for (let j = 0; j < layouts.length; j++) {
        for (let k = 0; k < remaining[i][0].length; k++) {
          const item = remaining[i][0][k];

          // eslint-disable-next-line no-continue
          if (item.empty) continue;

          const equip = clone(layouts[j]);
          if (item.slot[0] === 'weapon') {
            // check if weapon is already in mainhand slot
            if (equip.items.filter(({ name }) => name === item.name).length > 0) {
              // eslint-disable-next-line no-continue
              continue;
            }
          }
          Optimizer.addEquip(equip, item);
          equip.item_count = equip.items.length;
          tmp.push(equip);
        }
      }
      layouts = this.pareto(tmp);
    }
    s.push(layouts.length);
    return layouts;
  }

  getAccs(baseLayout, accslots) {
    let accs = this.gearSlot(Slot.ACCESSORY, baseLayout);
    accs = this.pareto(accs, accslots);
    const everything = accs.concat(baseLayout.items).map((x) => (x.name));
    // sort accessories
    accs = accs.map((x, idx) => idx).sort((a, b) => {
      // remove accessory a
      everything[a] = EMPTY_ACCESSORY;
      const ascore = this.scoreEquip({ accessory: everything });
      everything[a] = accs[a].name;
      // remove accessory b
      everything[b] = EMPTY_ACCESSORY;
      const bscore = this.scoreEquip({ accessory: everything });
      everything[b] = accs[b].name;
      // compare scores
      return ascore - bscore;
    }).map((x) => accs[x].name);
    return accs;
  }

  computeOptimal(baseLayouts, factoridx) {
    this.factors = Factors[this.factorslist[factoridx]];
    this.maxslots = this.maxslotslist[factoridx];
    log('Priority', `${factoridx}:`, this.factors[0], this.maxslots);
    if (this.factors[1].length === 0) {
      return baseLayouts;
    }

    // all base layouts should have the same number of available acc slots
    const baseLayout = this.new2oldEquip(baseLayouts[0]);
    const emptyAccslots = this.countAccslots(baseLayout);

    // TODO: clean this
    const lockedAccs = baseLayouts[0].accessory
      .reduce((res, x) => res + (this.itemdata[x].empty ? 0 : 1), 0);

    let candidates = this.topScorers(baseLayouts);
    for (let i = 0; i < candidates.length; i++) {
      candidates[i].accslots = 0;
      candidates[i].accs = [];
    }

    // expand layout and accessory candidate into proper candidate
    for (let layout = 0; layout < baseLayouts.length; layout++) {
      // find and sort possible accessories
      const accs = this.getAccs(this.new2oldEquip(baseLayouts[layout]), emptyAccslots);
      let accslots = Math.min(emptyAccslots, accs.length);
      const accCandidate = accs.slice(0, accslots);
      const s = [];
      const layouts = this.optimizeLayouts(this.new2oldEquip(baseLayouts[layout]), accslots, s)
        .map((x) => this.old2newEquip(x));
      log(`Processing ${s[2]} out of ${s[1]} out of ${s[0]} gear layouts.`);

      for (let i = 0; i < layouts.length; i++) {
        const candidate = layouts[i];
        if (accslots > 0) {
          for (let kdx = 0; kdx < accslots; kdx++) {
            candidate.accessory[lockedAccs + kdx] = accCandidate[kdx];
          }
          let filterAccs = Optimizer.filterAccs(candidate, accslots, accs);
          let filterIdx;
          while (accslots > 0) {
            let riskidx;
            let score = this.scoreEquip(candidate);
            let rawscore = this.scoreRawEquip(candidate);
            let riskscore = -1;
            let rawriskscore = -1;
            const vals = this.getRawVals(candidate);
            for (let kdx = lockedAccs; kdx < lockedAccs + accslots; kdx++) {
              const tmp = this.swapVals(vals, candidate.accessory[kdx], EMPTY_ACCESSORY);
              const tmpscore = scoreVals(hardcap(tmp, this.factors, this.capstats), this.factors);
              const rawtmpscore = scoreVals(tmp, this.factors);
              if (tmpscore > riskscore || (tmpscore === riskscore && rawtmpscore > rawriskscore)) {
                riskidx = kdx;
                riskscore = tmpscore;
                rawriskscore = rawtmpscore;
              }
            }
            const atrisk = candidate.accessory[riskidx];
            let winner;
            filterAccs = [...filterAccs, EMPTY_ACCESSORY];

            for (let j = 0; j < filterAccs.length; j++) {
              const acc = filterAccs[j];

              const tmp = this.swapVals(vals, atrisk, acc);
              const tmpScore = scoreVals(hardcap(tmp, this.factors, this.capstats), this.factors);
              const rawTmpScore = scoreVals(tmp, this.factors);

              if (
                tmpScore > score
                || (tmpScore === score && rawTmpScore > rawscore)
                || (tmpScore === score && this.itemdata[acc].empty)
              ) {
                score = tmpScore;
                rawscore = rawTmpScore;
                winner = acc;
                filterIdx = j;
              }
            }

            if (winner === undefined) {
              candidate.accessory[riskidx] = atrisk;
              break;
            } else {
              candidate.accessory[riskidx] = candidate.accessory[lockedAccs + accslots - 1];
              candidate.accessory[lockedAccs + accslots - 1] = winner;
              filterAccs[filterIdx] = atrisk;
              if (this.itemdata[winner].empty) {
                accslots -= 1;
              }
            }
          }
        }
        candidate.accslots = accslots;
        candidate.accs = [...accs];
        candidates.push(candidate);
        candidates = this.topScorers(candidates);
      }
    }

    // sort new accs per candidate
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const tmp = this.new2oldEquip(candidate);
      tmp.item_count = tmp.items.length - candidate.accslots;
      candidates[i] = {
        ...this.old2newEquip(this.sortAccs(tmp)),
        accslots: candidate.accslots,
        accs: candidate.accs,
      };
    }
    // construct alternative candidates
    const alternatives = [...candidates];
    const score = this.scoreEquip(candidates[0]);
    const rawScore = this.scoreRawEquip(candidates[0]);

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const remainder = candidate.accs.filter((x) => !candidate.accessory.includes(x));
      for (let j = 0; j < candidate.accslots; j++) {
        const tmp = candidate.accessory[lockedAccs + j];
        for (let k = 0; k < remainder.length; k++) {
          candidate.accessory[lockedAccs + j] = remainder[k];
          const tmpScore = this.scoreEquip(candidate);
          const rawTmpScore = this.scoreRawEquip(candidate);
          if (tmpScore === score && rawTmpScore === rawScore) {
            alternatives.push(clone(candidate));
            log('alternative found');
          }
          if (tmpScore > score) {
            log('an error occured');
          }
        }
        candidate.accessory[lockedAccs + j] = tmp;
      }
    }
    return alternatives;
  }

  gearSlot(type, equip) {
    const equiped = equip.items.filter((item) => (item.slot[0] === type[0])).map((x) => (x.name));
    return this.itemnames
      .filter((name) => {
        if (!allowedZone(this.itemdata, this.limits, name)) return false;
        return this.itemdata[name].slot[0] === type[0];
      })
      .map((name) => this.itemdata[name])
      .filter((item) => (!item.disable && !equiped.includes(item.name)));
  }

  // set <equal> to <false> if equal results result in a dominate call
  dominates(major, minor, equal = true) {
    const l = this.factors[1].length;
    const majorStats = [0];
    const minorStats = [0];

    let finalEqual = equal;
    for (let i = 0; i < l; i++) {
      const stat = this.factors[1][i];
      let idx = major.statnames.indexOf(stat);
      const exponent = this.factors.length > 2 ? this.factors[2][i] : 1;

      if (idx >= 0) {
        majorStats[i] = major[stat] ** exponent;
      } else {
        minorStats[i] = exponent > 0 || minor.empty ? 0 : 1;
      }

      idx = minor.statnames.indexOf(stat);

      if (idx >= 0) {
        minorStats[i] = minor[stat] ** exponent;
      } else {
        minorStats[i] = exponent > 0 || major.empty ? 0 : 1;
      }

      if (minorStats[i] > majorStats[i]) {
        return false;
      }

      if (minorStats[i] < majorStats[i]) {
        finalEqual = false;
      }
    }
    return !finalEqual;
  }

  pareto(list, cutoff = 1) {
    const dominated = new Array(list.length).fill(false);
    const empty = list[0].slot === undefined
      ? new Equip()
      : new EmptySlot(list[0].slot);
    for (let i = list.length - 1; i > -1; i--) {
      if (this.dominates(empty, list[i], !empty.empty)) {
        dominated[i] = cutoff;
      }

      if (dominated[i] !== cutoff) {
        for (let j = list.length - 1; j > -1; j--) {
          if (dominated[j] !== cutoff) {
            dominated[j] += this.dominates(list[i], list[j]);
          }
        }
      }
    }
    let result = dominated.map((val, idx) => (
      val < cutoff
        ? list[idx]
        : false)).filter((val) => (val !== false));
    if (result.length === 0) {
      result = [empty];
    }
    return result;
  }
}
