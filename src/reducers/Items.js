import { LOCALSTORAGE_NAME } from '../constants';
import { ITEMLIST } from '../assets/Items';
import {
  ItemContainer,
  ItemNameContainer,
  Slot,
  EmptySlot,
  updateLevel,
  SetName,
  Factors,
  Hacks,
  NGUs,
} from '../assets/ItemAux';


import { AUGMENT, AUGMENT_SETTINGS } from '../actions/Augment';
import { HACK } from '../actions/Hack';
import { WISH } from '../actions/Wish';
import { SETTINGS, TITAN } from '../actions/Settings';
import { CREMENT } from '../actions/Crement';
import { DISABLE_ITEM } from '../actions/DisableItem';
import { TOGGLE_EDIT } from '../actions/ToggleEdit';
import { EDIT_ITEM } from '../actions/EditItem';
import { EDIT_FACTOR } from '../actions/EditFactor';
import { EQUIP_ITEM } from '../actions/EquipItem';
import { HIDE_ZONE } from '../actions/HideZone';
import { LOCK_ITEM } from '../actions/LockItem';
import { OPTIMIZE_GEAR } from '../actions/OptimizeGear';
import { OPTIMIZE_SAVES } from '../actions/OptimizeSaves';
import { OPTIMIZING_GEAR } from '../actions/OptimizingGear';
import { TERMINATE } from '../actions/Terminate';
import { UNDO } from '../actions/Undo';
import { UNEQUIP_ITEM } from '../actions/UnequipItem';
import { DELETE_SLOT } from '../actions/DeleteSlot';
import { LOAD_SLOT, LOAD_FACTORS } from '../actions/LoadSlot';
import { SAVE_SLOT, SAVE_NAME } from '../actions/SaveSlot';
import { TOGGLE_SAVED, TOGGLE_UNUSED } from '../actions/ToggleSaved';
import { LOAD_STATE_LOCALSTORAGE } from '../actions/LoadStateLocalStorage';
import { SAVE_STATE_LOCALSTORAGE } from '../actions/SaveStateLocalStorage';


const ITEMS = new ItemContainer(ITEMLIST.map((item) => [item.name, item]));

const accslots = 2;
const offhand = 0;
const maxZone = 2;
const zoneDict = {};
Object.getOwnPropertyNames(SetName).forEach((x) => {
  zoneDict[SetName[x][1]] = SetName[x][1] > 0 && SetName[x][1] < maxZone;
});

export function cleanState(state) {
  const newState = { ...state };

  // clean locks
  Object.getOwnPropertyNames(state.locked)
    .forEach((slot) => {
      newState.locked[slot] = state.locked[slot].filter((idx) => {
        if (idx >= state.equip[slot].length) {
          return false;
        }
        return !state.itemdata[state.equip[slot][idx]].empty;
      });
    });

  // clean maxslots
  newState.maxslots = state.maxslots.map((val) => {
    if (val > state.equip.accessory.length && val !== Infinity) {
      return state.equip.accessory.length;
    }
    return val === null ? Infinity : val;
  });

  // clean offhand
  const { offhand: offhandState } = state;
  if (offhandState === 0 && state.equip.weapon.length > 1) {
    newState.equip.weapon = [state.equip.weapon[0]];
  } else if (offhandState > 0 && state.equip.weapon.length < 2) {
    newState.equip.weapon = [
      state.equip.weapon[0],
      new EmptySlot(Slot.WEAPON).name,
    ];
  }

  return newState;
}

// TODO: move this function and add configuration
function log(...args) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

const INITIAL_STATE = {
  itemdata: ITEMS,
  items: ITEMS.names,
  offhand,
  equip: ItemNameContainer(accslots, offhand),
  locked: {},
  lastequip: ItemNameContainer(accslots, offhand),
  savedequip: [ItemNameContainer(accslots, offhand)],
  savedidx: 0,
  maxsavedidx: 0,
  showsaved: false,
  showunused: false,
  factors: [
    'RESPAWN', 'DAYCARE_SPEED', 'HACK', 'NGUS', 'NONE',
  ],
  maxslots: [
    3, 1, 6, accslots, accslots,
  ],
  editItem: [
    false, undefined, undefined, undefined,
  ],
  running: false,
  zone: maxZone,
  looty: 0,
  pendant: 0,
  titanversion: 1,
  hidden: zoneDict,
  augstats: {
    lsc: 20,
    nac: 25,
    time: 1440,
    augspeed: 1,
    ecap: 1,
    gps: 0,
    gold: 0,
    augs: [
      { ratio: 1 / 2 },
      { ratio: 1.1 / 2 },
      { ratio: 1.2 / 2 },
      { ratio: 1.3 / 2 },
      { ratio: 1.4 / 2 },
      { ratio: 1.5 / 2 },
      { ratio: 1.6 / 2 },
    ],
    version: 0,
  },
  wishstats: {
    epow: 1,
    ecap: 1,
    mpow: 1,
    mcap: 1,
    rpow: 1,
    rcap: 1,
    wishspeed: 1,
    wishcap: 4 * 60,
    wishtime: 4 * 60,
    wishidx: 0,
    start: 0,
    goal: 1,
    wishes: [
      {
        wishidx: 0,
        start: 0,
        goal: 1,
      }, {
        wishidx: 1,
        start: 0,
        goal: 1,
      }, {
        wishidx: 2,
        start: 0,
        goal: 1,
      }, {
        wishidx: 3,
        start: 0,
        goal: 1,
      },
    ],
    rpIndex: 0,
  },
  hackstats: {
    rbeta: 0,
    rdelta: 0,
    rpow: 1,
    rcap: 1,
    hackspeed: 1,
    hacktime: 24 * 60,
    hackoption: '0',
    hacks: Hacks.map((hack, hackidx) => ({
      level: 0, reducer: 0, goal: 1, hackidx,
    })),
  },
  cubestats: {
    tier: 0,
    power: 0,
    toughness: 0,
  },
  basestats: {
    power: 0,
    toughness: 0,
  },
  capstats: {
    'Energy Cap Cap': 9e18,
    'Energy Cap Gear': 0,
    'Energy Cap Total': 1,
    'Magic Cap Cap': 9e18,
    'Magic Cap Gear': 0,
    'Magic Cap Total': 1,
  },
  ngustats: {
    nguoption: 0,
    energy: {
      ngus: NGUs.energy.map(() => ({ normal: 0, evil: 0, sadistic: 0 })),
      cap: 1,
      nguspeed: 1,
    },
    magic: {
      ngus: NGUs.magic.map(() => ({ normal: 0, evil: 0, sadistic: 0 })),
      cap: 1,
      nguspeed: 1,
    },
    ngutime: 1440,
    quirk: {
      e2n: false,
      s2e: false,
    },
  },
  version: '1.4.0',
};

const ItemsReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case AUGMENT: {
      if (!state.running) {
        return state;
      }
      log('worker finished');
      return {
        ...state,
        augment: {
          ...state.augment,
          vals: action.payload.vals,
        },
        running: false,
      };
    }

    case AUGMENT_SETTINGS: {
      let lsc = Number(action.payload.lsc);
      let time = Number(action.payload.time);
      if (Math.isNaN(lsc)) {
        lsc = 20;
      }
      if (Math.isNaN(time)) {
        time = 1440;
      }
      return {
        ...state,
        augment: {
          ...state.augment,
          lsc,
          time,
        },
      };
    }

    case HACK: {
      if (!state.running) {
        return state;
      }
      log('worker finished');
      return {
        ...state,
        running: false,
      };
    }

    case WISH: {
      if (!state.running) {
        return state;
      }
      log('worker finished');
      return {
        ...state,
        running: false,
      };
    }

    case SETTINGS: {
      return {
        ...state,
        [action.payload.statname]: {
          ...action.payload.stats,
        },
      };
    }

    case CREMENT: {
      if (action.payload.val < 0 && action.payload.min === state[action.payload.name]) {
        return state;
      }
      if (action.payload.val > 0 && action.payload.max === state[action.payload.name]) {
        return state;
      }
      if (action.payload.name === 'wishslots') {
        const wishes = [...state.wishstats.wishes];
        if (action.payload.val === -1) {
          if (wishes.length === 1) {
            return state;
          }
          wishes.pop();
        } else if (action.payload.val === 1) {
          wishes.push({ wishidx: 0, start: 0, goal: 1 });
        }
        return {
          ...state,
          wishstats: {
            ...state.wishstats,
            wishes,
          },
        };
      }
      if (action.payload.name === 'accslots') {
        let accessory;
        if (action.payload.val === -1) {
          accessory = state.equip.accessory.slice(0, -1);
        } else if (action.payload.val === 1) {
          accessory = state.equip.accessory.concat([new EmptySlot(Slot.ACCESSORY).name]);
        }
        return cleanState({
          ...state,
          equip: {
            ...state.equip,
            accessory,
          },
          lastequip: state.equip,
        });
      }
      if (action.payload.name[0] === 'maxslots') {
        return {
          ...state,
          maxslots: state.maxslots.map((val, idx) => {
            let finalVal = val;
            if (idx === action.payload.name[1]) {
              if (action.payload.val < 0 && val === Infinity) {
                return action.payload.max;
              }
              finalVal += action.payload.val;
              if (finalVal < action.payload.min) {
                return action.payload.min;
              }
              if (finalVal > action.payload.max) {
                return Infinity;
              }
            }
            return finalVal;
          }),
        };
      }
      return cleanState({
        ...state,
        [action.payload.name]: state[action.payload.name] + action.payload.val,
      });
    }

    case DISABLE_ITEM: {
      const { name } = action.payload;
      const item = state.itemdata[name];
      return {
        ...state,
        itemdata: {
          ...state.itemdata,
          [name]: {
            ...item,
            disable: !item.disable,
          },
        },
      };
    }

    case TOGGLE_EDIT: {
      const { name } = action.payload;
      const item = state.itemdata[name];
      return {
        ...state,
        editItem: [
          action.payload.on, name, item === undefined
            ? undefined
            : item.level,
          action.payload.lockable,
        ],
      };
    }

    case EDIT_ITEM: {
      if (Math.isNaN(action.payload.val)) {
        return state;
      }
      if (action.payload.val < 0 || action.payload.val > 100) {
        return state;
      }
      const item = state.itemdata[state.editItem[1]];
      updateLevel(item, action.payload.val);
      return {
        ...state,
        editItem: {
          ...state.editItem,
          2: action.payload.val,
        },
        itemdata: {
          ...state.itemdata,
          [item.name]: item,
        },
      };
    }

    case LOCK_ITEM: {
      const { lock } = action.payload;
      const { slot } = action.payload;
      const { idx } = action.payload;
      let tmp = state.locked[slot];
      if (tmp === undefined) {
        tmp = [];
      }
      if (lock) {
        if (!tmp.includes(idx)) {
          tmp.push(idx);
        }
      } else {
        tmp = tmp.filter((i) => i !== idx);
      }
      return {
        ...state,
        locked: {
          ...state.locked,
          [slot]: tmp,
        },
      };
    }

    case EDIT_FACTOR: {
      let factors = [];
      let maxslots = [];
      if (action.payload.name === 'INSERT') {
        state.factors.forEach((item, idx) => {
          if (idx === action.payload.idx) {
            factors.push('NONE');
            maxslots.push(state.equip.accessory.length);
          }
          factors.push(item);
          maxslots.push(state.maxslots[idx]);
        });
      } else {
        factors = state.factors.map((item, idx) => {
          if (idx === action.payload.idx) {
            return action.payload.name;
          }
          return item;
        });
        maxslots = state.maxslots;
      }
      // clean factors
      const tmpFactors = [];
      const tmpMaxslots = [];
      for (let i = 0; i < factors.length; i++) {
        if (factors[i] !== 'DELETE') {
          tmpFactors.push(factors[i]);
          tmpMaxslots.push(maxslots[i]);
        }
      }
      let i = tmpFactors.length - 1;
      while (tmpFactors.length > 1 && tmpFactors[i - 1] === 'NONE' && tmpFactors[i] === 'NONE') {
        tmpFactors.pop();
        tmpMaxslots.pop();
        i -= 1;
      }
      if (tmpFactors[tmpFactors.length - 1] !== 'NONE') {
        tmpFactors.push('NONE');
        tmpMaxslots.push(state.equip.accessory.length);
      }
      return {
        ...state,
        factors: tmpFactors,
        maxslots: tmpMaxslots,
      };
    }

    case EQUIP_ITEM: {
      const { name } = action.payload;
      const slot = state.itemdata[name].slot[0];
      const count = state.equip[slot].length;
      let sel = count - 1;
      for (let idx = 0; idx < count; idx++) {
        if (state.itemdata[state.equip[slot][idx]].empty) {
          if (sel > idx) {
            sel = idx;
          }
        }
        if (state.equip[slot][idx] === name) {
          return state;
        }
      }
      return {
        ...state,
        equip: {
          ...state.equip,
          [slot]: state.equip[slot].map((tmp, idx) => {
            if (idx === sel) {
              return name;
            }
            return tmp;
          }),
        },
        lastequip: state.equip,
      };
    }

    case HIDE_ZONE: {
      return {
        ...state,
        hidden: {
          ...state.hidden,
          [action.payload.idx]: !state.hidden[action.payload.idx],
        },
      };
    }

    case TITAN: {
      const zone = [
        2, // offset
        8, // GRB
        10, // GCT
        13, // Jake
        16, // UUG
        18, // Walderp
        21, // Beast
        25, // Nerd
        28, // Godmother
        32, // Exile
        36, // It Hungers
      ][action.payload.titan];
      const zoneObj = {};
      Object.getOwnPropertyNames(SetName).forEach((x) => {
        zoneObj[SetName[x][1]] = SetName[x][1] > 0 && SetName[x][1] < zone;
      });
      let accSlots = state.equip.accessory;
      while (accSlots.length < action.payload.accslots) {
        accSlots = accSlots.concat([new EmptySlot(Slot.ACCESSORY).name]);
      }
      while (accSlots.length > action.payload.accslots) {
        accSlots = accSlots.slice(0, -1);
      }
      return cleanState({
        ...state,
        zone,
        looty: action.payload.looty,
        pendant: action.payload.pendant,
        equip: {
          ...state.equip,
          accessory: accSlots,
        },
        hidden: zoneObj,
      });
    }

    case UNDO: {
      return cleanState({
        ...state,
        equip: state.lastequip,
        lastequip: state.equip,
      });
    }

    case UNEQUIP_ITEM: {
      const { name } = action.payload;
      if (state.itemdata[name].empty) {
        return state;
      }
      const item = state.itemdata[name];
      const slot = item.slot[0];
      let sel = 0;
      for (; ; sel++) {
        if (state.equip[slot][sel] === name) {
          break;
        }
      }
      return cleanState({
        ...state,
        equip: {
          ...state.equip,
          [slot]: state.equip[slot].map((tmp, idx) => {
            if (idx === sel) {
              return new EmptySlot(item.slot).name;
            }
            return tmp;
          }),
        },
        lastequip: state.equip,
      });
    }

    case OPTIMIZE_GEAR: {
      if (!state.running) {
        return state;
      }
      log('worker finished');
      const { equip } = action.payload;
      return cleanState({
        ...state,
        equip,
        lastequip: state.equip,
        running: false,
      });
    }

    case OPTIMIZE_SAVES: {
      if (!state.running) {
        return state;
      }
      log('worker finished');
      const { savedequip } = action.payload;
      const { savedidx } = action.payload;
      return cleanState({
        ...state,
        savedequip,
        savedidx,
        running: false,
      });
    }

    case OPTIMIZING_GEAR: {
      if (state.running) {
        return state;
      }
      log('worker running');
      return {
        ...state,
        running: true,
      };
    }

    case TERMINATE: {
      log('terminated worker');
      return {
        ...state,
        running: false,
      };
    }

    case SAVE_NAME: {
      return {
        ...state,
        savedequip: state.savedequip.map((tmp, idx) => {
          if (idx === state.savedidx) {
            return {
              ...tmp,
              name: action.payload.name,
            };
          }
          return tmp;
        }),
      };
    }

    case SAVE_SLOT: {
      const locked = {};
      Object.getOwnPropertyNames(state.locked).forEach((slot) => {
        locked[slot] = state.locked[slot].map((idx) => state.equip[slot][idx]);
      });
      if (state.savedidx === state.maxsavedidx) {
        return {
          ...state,
          savedequip: state.savedequip.map((tmp, idx) => {
            if (idx === state.savedidx) {
              return {
                ...state.equip,
                locked,
                factors: state.factors,
                maxslots: state.maxslots,
                name: tmp.name,
              };
            }
            return tmp;
          }).concat([
            {
              ...ItemNameContainer(state.equip.accessory.length, state.offhand),
              locked: undefined,
              factors: undefined,
              maxslots: undefined,
              name: undefined,
            },
          ]),
          maxsavedidx: state.maxsavedidx + 1,
        };
      }
      return {
        ...state,
        savedequip: state.savedequip.map((tmp, idx) => {
          if (idx === state.savedidx) {
            return {
              ...state.equip,
              locked,
              factors: state.factors,
              maxslots: state.maxslots,
              name: tmp.name,
            };
          }
          return tmp;
        }),
      };
    }

    case LOAD_SLOT: {
      const save = state.savedequip[state.savedidx];
      return cleanState({
        ...state,
        equip: {
          ...save,
        },
      });
    }

    case LOAD_FACTORS: {
      const save = state.savedequip[state.savedidx];
      const hasNoFactors = save.factors === undefined && save.maxslots === undefined;
      const equip = {
        ...ItemNameContainer(state.equip.accessory.length, state.offhand),
      };
      const locked = {};
      if (save.locked === undefined) {
        save.locked = {};
      }
      Object.getOwnPropertyNames(save.locked).forEach((slot) => {
        equip[slot] = save.locked[slot].concat(equip[slot].slice(save.locked[slot].length));
        locked[slot] = save.locked[slot].map((_, idx) => idx);
      });
      return cleanState({
        ...state,
        equip,
        locked,
        factors: hasNoFactors
          ? state.factors
          : save.factors,
        maxslots: hasNoFactors
          ? state.maxslots
          : save.maxslots,
      });
    }

    case DELETE_SLOT: {
      if (state.savedidx === state.savedequip.length - 1) {
        // do not delete the last slot
        return state;
      }
      return {
        ...state,
        savedequip: state.savedequip.map((equip, idx) => {
          if (idx === state.maxsavedidx) {
            return undefined;
          }
          if (idx >= state.savedidx) {
            return state.savedequip[idx + 1];
          }
          return equip;
        }).filter((x) => x !== undefined),
        savedidx: state.savedidx - (
          state.savedidx === state.maxsavedidx
            ? 1
            : 0),
        maxsavedidx: state.maxsavedidx - 1,
      };
    }

    case TOGGLE_SAVED: {
      return {
        ...state,
        showsaved: !state.showsaved,
      };
    }

    case TOGGLE_UNUSED: {
      return {
        ...state,
        showunused: !state.showunused,
      };
    }

    case SAVE_STATE_LOCALSTORAGE: {
      if (document.cookie.includes('accepts-cookies=true')) {
        window.localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(action.payload.state));
      }
      return state;
    }

    case LOAD_STATE_LOCALSTORAGE: {
      const lc = window.localStorage.getItem(LOCALSTORAGE_NAME);
      const localStorageState = JSON.parse(lc);
      if (!localStorageState) {
        log(`No local storage found. Loading fresh v${state.version} state.`);
        return state;
      }
      if (!localStorageState.version) {
        log(`No valid version information found. Loading fresh v${state.version} state.`);
        return state;
      }
      // TODO: Validate local storage state.
      if (localStorageState.version === '1.0.0') {
        log(`Saved local storage is v${localStorageState.version}, incompatible with current version. Loading fresh v${state.version} state.`);
        return state;
      }
      log(`Loading saved v${state.version} state.`);
      // update item store with changed levels and disabled items
      for (let idx = 0; idx < localStorageState.items.length; idx++) {
        const name = localStorageState.items[idx];
        const saveditem = localStorageState.itemdata[name];
        const item = state.itemdata[name];
        if (item === undefined) {
          // item was renamed or removed
          log(`Item ${name} was renamed or removed, this may result in changes in saved or equipped loadouts.`);
          const slot = saveditem.slot[0];
          localStorageState.equip[slot] = localStorageState.equip[slot].map((tmp) => {
            if (tmp === name) {
              return new EmptySlot(saveditem.slot).name;
            }
            return tmp;
          });
          localStorageState.savedequip = localStorageState.savedequip
            .map((save) => {
              const newSave = { ...save };

              newSave[slot] = save[slot].map((tmp) => {
                if (tmp === name) {
                  // FIXME: this is either wrong or stupid
                  return new EmptySlot(saveditem.slot).name;
                }
                return tmp;
              });
              return newSave;
            });

          // eslint-disable-next-line no-continue
          continue;
        }

        if (saveditem.empty) {
          // eslint-disable-next-line no-continue
          continue;
        }
        item.disable = saveditem.disable;
        updateLevel(item, saveditem.level);
      }
      Object.getOwnPropertyNames(state).forEach((name) => {
        if (name === 'version') {
          return;
        }
        if (localStorageState[name] === undefined) {
          localStorageState[name] = state[name];
          log(`Keeping default ${name}: ${state[name]}`);
        }
      });
      if (localStorageState.version === '1.1.0') {
        // update to 1.2.0
        log('Updating local storage for wishes, some wish data might be erased.');
        Object.getOwnPropertyNames(state.wishstats).forEach((name) => {
          if (localStorageState.wishstats[name] === undefined) {
            localStorageState.wishstats[name] = state.wishstats[name];
            log(`Keeping default wishstats ${name}: ${state.wishstats[name]}`);
          }
        });
        Object.getOwnPropertyNames(localStorageState.wishstats).forEach((name) => {
          if (state.wishstats[name] === undefined) {
            log(`Removing saved wishstats ${name}: ${localStorageState.wishstats[name]}`);
            delete localStorageState.wishstats[name];
          }
        });
        localStorageState.wishstats.wishes = localStorageState.wishstats.wishes.map((wish) => {
          const newWish = { ...wish };
          if (wish.start === undefined) {
            newWish.start = 0;
          }
          return newWish;
        });
        log('Wish data:', localStorageState.wishstats);
      }
      if (localStorageState.version === '1.3.0') {
        localStorageState.equip = {
          ...localStorageState.equip,
          other: ['Infinity Cube', 'Base Stats'],
        };
        localStorageState.savedequip = localStorageState.savedequip.map((x) => ({
          ...x,
          other: ['Infinity Cube', 'Base Stats'],
        }));
      }
      while (localStorageState.hackstats.hacks.length < Hacks.length) {
        localStorageState.hackstats.hacks = [
          ...localStorageState.hackstats.hacks, {
            level: 0,
            reducer: 0,
            goal: 1,
            hackidx: localStorageState.hackstats.hacks.length,
          },
        ];
      }
      if (
        localStorageState.augstats !== undefined
        && localStorageState.augstats.nac === undefined
      ) {
        localStorageState.augstats.nac = 25;
      }
      const tmpFactors = Object.getOwnPropertyNames(Factors);
      localStorageState.factors = localStorageState.factors.map((name) => {
        if (!tmpFactors.includes(name)) {
          return 'NONE';
        }
        return name;
      });
      localStorageState.capstats = {
        ...state.capstats,
        ...localStorageState.capstats,
      };
      return cleanState({
        ...state,
        offhand: localStorageState.offhand,
        equip: localStorageState.equip,
        locked: localStorageState.locked,
        savedequip: localStorageState.savedequip,
        savedidx: localStorageState.savedidx,
        maxsavedidx: localStorageState.maxsavedidx,
        showsaved: localStorageState.showsaved,
        factors: localStorageState.factors,
        maxslots: localStorageState.maxslots,
        zone: localStorageState.zone,
        titanversion: localStorageState.titanversion,
        looty: localStorageState.looty,
        pendant: localStorageState.pendant,
        hidden: localStorageState.hidden,
        augstats: localStorageState.augstats,
        basestats: localStorageState.basestats,
        capstats: localStorageState.capstats,
        cubestats: localStorageState.cubestats,
        ngustats: localStorageState.ngustats,
        hackstats: localStorageState.hackstats,
        wishstats: localStorageState.wishstats,
      });
    }

    default: {
      return state;
    }
  }
};

export default ItemsReducer;
