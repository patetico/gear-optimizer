import {
  Item, ItemNameContainer, SetName, Slot, Stat,
} from './assets/ItemAux';
import { LOOTIES, PENDANTS } from './assets/Items';


export function getSlot(name, data) {
  return data[name].slot;
}

export function getLock(slot, idx, locked) {
  if (!Object.getOwnPropertyNames(locked).includes(slot)) {
    return false;
  }
  return locked[slot].includes(idx);
}

export function old2newequip(accslots, offhand, baseLayout) {
  const equip = ItemNameContainer(accslots, offhand);
  const counts = Object.getOwnPropertyNames(Slot).map(() => (0));
  for (let idx = 0; idx < baseLayout.items.length; idx++) {
    const item = baseLayout.items[idx];
    equip[item.slot[0]][counts[item.slot[1]]] = item.name;
    counts[item.slot[1]] += 1;
  }
  return equip;
}

export function clone(obj) {
  let copy;

  // Handle the 3 simple types, and null or undefined
  if (obj == null || typeof obj !== 'object') return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    Object.keys(obj).forEach((attr) => {
      copy[attr] = clone(obj[attr]);
    });
    return copy;
  }

  throw new Error('Unable to clone object! Its type is not supported.');
}

export function getMaxTitan(zone) {
  let maxtitan = 21;
  Object.getOwnPropertyNames(SetName).forEach((x) => {
    if (SetName[x].length === 3 && SetName[x][1] <= zone) {
      maxtitan = maxtitan[1] > SetName[x][1]
        ? maxtitan
        : SetName[x];
    }
  });
  return maxtitan;
}

export function getLimits(state) {
  return {
    zone: state.zone,
    titan: getMaxTitan(state.zone),
    titanversion: state.titanversion,
    looty: state.looty,
    pendant: state.pendant,
  };
}

export function allowedZone(itemdata, limits, name) {
  const { zone } = limits;
  const { titan } = limits;
  const { titanversion } = limits;
  const { looty } = limits;
  const { pendant } = limits;
  const item = itemdata[name];
  if (item.empty) {
    return false;
  }
  if (item.zone[1] > zone) {
    // zone too high
    return false;
  }
  if (item.zone[1] === titan[1] && item.zone[2] > titanversion) {
    // titan version too high
    return false;
  }
  if (item.zone[0] === SetName.LOOTY[0] && LOOTIES.indexOf(name) > looty) {
    return false;
  }
  return !(item.zone[0] === SetName.FOREST_PENDANT[0] && PENDANTS.indexOf(name) > pendant);
}

export function getZone(zone) {
  return SetName[Object.getOwnPropertyNames(SetName).filter((x) => zone === SetName[x][1])[0]];
}

export function getMaxZone() {
  let maxzone = 1;
  Object.getOwnPropertyNames(SetName).forEach((x) => {
    maxzone = SetName[x][1] > maxzone ? SetName[x][1] : maxzone;
  });
  return maxzone;
}

export function scoreVals(vals, factors) {
  let newVals = vals.map((v) => v / 100);
  if (factors.length > 2) {
    const exponents = factors[2];
    newVals = newVals.map((val, idx) => val ** exponents[idx]);
  }
  return newVals.reduce((res, val) => res * val, 1);
}

export function getRawVals(data, equip, factors, offhand) {
  const stats = factors[1];

  const sorted = Object.getOwnPropertyNames(Slot).reduce((res, slot) => {
    if (equip[Slot[slot][0]] !== undefined) {
      return res.concat(equip[Slot[slot][0]]);
    }
    return res;
  }, []);

  const vals = [];

  Object.keys(stats).forEach((idx) => {
    const stat = stats[idx];

    if (stat === 'Respawn' || stat === 'Power' || stat === 'Toughness') {
      vals[idx] = 0;
    } else {
      vals[idx] = 100;
    }

    let mainhand = true;

    Object.keys(sorted).forEach((jdx) => {
      const name = sorted[jdx];
      let val = data[name][stat];
      if (data[name].slot[0] === 'weapon') {
        if (mainhand) {
          mainhand = false;
        } else {
          val *= offhand / 100;
        }
      }
      if (val === undefined || Number.isNaN(val)) {
        return;
      }
      vals[idx] += val;
    });
  });

  return vals;
}

export const hardcap = (vals, factors, capstats) => vals.map(
  // handle hardcap
  (val, idx) => {
    const hardCap = capstats[`${factors[1][idx]} Cap`];
    if (hardCap === undefined) return val;

    const gear = 100 * capstats[`${factors[1][idx]} Gear`] + 100;
    const total = Math.max(1, capstats[`${factors[1][idx]} Total`]);
    const maxVal = Math.max(100, (hardCap / total) * gear);

    return Math.min(val, maxVal);
  },
);


export function getVals(data, equip, factors, offhand, capstats) {
  return hardcap(getRawVals(data, equip, factors, offhand), factors, capstats);
}

export function scoreRawEquip(data, equip, factors, offhand) {
  return scoreVals(getRawVals(data, equip, factors, offhand), factors);
}

export function scoreEquip(data, equip, factors, offhand, capstats) {
  return scoreVals(getVals(data, equip, factors, offhand, capstats), factors);
}

export const shorten = (val, mfd = 2) => {
  if (val < 10000) {
    return val.toLocaleString(undefined, { maximumFractionDigits: mfd });
  }
  const units = [
    'k',
    'M',
    'B',
    'T',
    'Qa',
    'Qi',
    'Sx',
    'Sp',
    'Oc',
    'No',
    'Dc',
  ];
  const order = Math.floor(Math.log(val / 10) / Math.log(1000));
  const unitname = units[(order - 1)];
  const num = val / 1000 ** order;
  return num.toLocaleString(undefined, { maximumFractionDigits: mfd }) + unitname;
};

export const shortenExponential = (val, mfd = 3) => {
  if (val < 10000) {
    return val.toLocaleString(undefined, { maximumFractionDigits: mfd });
  }
  return (val - 10 ** Math.floor(Math.log10(val) - mfd)).toExponential(mfd);
};

export const toTime = (ticks) => {
  let result = '';
  let ticksLeft = ticks;

  const days = Math.floor(ticksLeft / 50 / 60 / 60 / 24);
  ticksLeft -= days * 24 * 60 * 60 * 50;

  const hours = Math.floor(ticksLeft / 50 / 60 / 60);
  ticksLeft -= hours * 60 * 60 * 50;

  const mins = Math.floor(ticksLeft / 50 / 60);
  ticksLeft -= mins * 60 * 50;

  if (days >= 100) {
    return `${shorten(days, 0)} days`;
  }
  if (days > 0) {
    result += `${days}d `;
  }
  if (days > 0 || hours > 0) {
    result += `${hours}h `;
  }
  if (days > 0 || hours > 0 || mins > 0) {
    result += `${mins}m `;
  }
  result += `${shortenExponential(ticksLeft / 50, 1)}s`;
  return result;
};

export const cubeBaseItemData = (itemdata, cubestats, basestats) => {
  // make cube stats item
  const tier = Number(cubestats.tier);
  const cube = new Item('Infinity Cube', Slot.OTHER, undefined, 0, [

    [
      Stat.POWER,
      Number(cubestats.power),
    ],
    [
      Stat.TOUGHNESS,
      Number(cubestats.toughness),
    ],
    [
      Stat.DROP_CHANCE, tier <= 0 ? 0 : 50 + (tier - 1) * 20,
    ],
    [
      Stat.GOLD_DROP, tier <= 1 ? 0 : ((tier - 1) ** 1.3) * 50,
    ],
    [
      Stat.HACK_SPEED, tier <= 7 ? 0 : Math.min(20, (tier - 8) * 5 + 10),
    ],
    [
      Stat.WISH_SPEED, tier <= 8 ? 0 : Math.min(20, (tier - 8) * 10),
    ],
  ]);

  // make base stats item
  const base = new Item('Base Stats', Slot.OTHER, undefined, 0, [
    [
      Stat.POWER, Number(basestats.power),
    ],
    [
      Stat.TOUGHNESS, Number(basestats.toughness),
    ],
  ]);
  return {
    ...itemdata,
    'Infinity Cube': cube,
    'Base Stats': base,

  };
};
