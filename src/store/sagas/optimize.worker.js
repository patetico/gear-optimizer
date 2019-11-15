import { ItemNameContainer } from '../../assets/ItemAux';
import Optimizer from '../../Optimizer';
import Augment from '../../Augment';
import Wish from '../../Wish';
import { cleanState } from '../reducers/Items';


function log(...args) {
  // eslint-disable-next-line no-console
  console.log(...args);
}


function optimize(e) {
  const startTime = Date.now();
  const { state } = e.data;
  const optimizer = new Optimizer(state);
  // construct base layout from locks
  let baseLayout = optimizer.constructBase(state.locked, state.equip);
  // optimize the priorities
  for (let idx = 0; idx < state.factors.length; idx++) {
    baseLayout = optimizer.computeOptimal(baseLayout, idx);
  }
  // select random remaining layout
  baseLayout = baseLayout[Math.floor(Math.random() * baseLayout.length)];
  const equip = Optimizer.sortLocks(state.locked, state.equip, baseLayout);
  this.postMessage({ equip });
  log(`${Math.floor((Date.now() - startTime) / 10) / 100} seconds`);
  this.close();
}

function optimizeSaves(e) {
  const startTime = Date.now();
  const savedequip = e.data.state.savedequip.map((save) => {
    if (save.factors === undefined || save.factors.length === 0) {
      log('quit early');
      return save;
    }
    let state = { ...e.data.state };

    // FIXME: will always be false, since save.factors is garanteed to be not undefined
    const hasNoFactors = save.factors === undefined && save.maxslots === undefined;
    const equip = {
      ...ItemNameContainer(state.equip.accessory.length, state.offhand),
    };

    const locked = {};
    if (save.locked !== undefined) {
      Object.getOwnPropertyNames(save.locked).forEach((slot) => {
        equip[slot] = save.locked[slot].concat(equip[slot].slice(save.locked[slot].length));
        locked[slot] = save.locked[slot].map((_, idx) => idx);
      });
    }
    state = cleanState({
      ...state,
      equip,
      locked,
      factors: hasNoFactors ? state.factors : save.factors,
      maxslots: hasNoFactors ? state.maxslots : save.maxslots,
    });

    const optimizer = new Optimizer(state);
    // construct base layout from locks
    let baseLayout = optimizer.constructBase(state.locked, state.equip);
    // optimize the priorities
    for (let idx = 0; idx < state.factors.length; idx++) {
      baseLayout = optimizer.computeOptimal(baseLayout, idx);
    }

    // select random remaining layout
    baseLayout = baseLayout[Math.floor(Math.random() * baseLayout.length)];
    return {
      ...save,
      ...baseLayout,
    };
  });
  this.postMessage({ savedequip });
  log(`${Math.floor((Date.now() - startTime) / 10) / 100} seconds`);
  this.close();
}

function augment(e) {
  const startTime = Date.now();
  const { state } = e.data;
  const newAugment = new Augment(state.augment.lsc, state.augment.time);
  const vals = newAugment.optimize();
  this.postMessage({ vals });
  log(`${Math.floor((Date.now() - startTime) / 10) / 100} seconds`);
  this.close();
}

function wish(e) {
  const startTime = Date.now();
  const { state } = e.data;
  const newWish = new Wish(state.wishstats);
  const vals = newWish.optimize();
  this.postMessage({ vals });
  log(`${Math.floor((Date.now() - startTime) / 10) / 100} seconds`);
  this.close();
}


function choose(e) {
  if (e.data.command === 'optimize') {
    optimize.call(this, e);
  } else if (e.data.command === 'optimizeSaves') {
    optimizeSaves.call(this, e);
  } else if (e.data.command === 'augment') {
    augment.call(this, e);
  } else if (e.data.command === 'wishes') {
    wish.call(this, e);
  } else {
    // eslint-disable-next-line no-console
    log(`Error: invalid web worker command: ${e.data.command}.`);
  }
}

// eslint-disable-next-line no-restricted-globals
self.addEventListener('message', choose);
