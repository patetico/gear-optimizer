import {
  all, put, select, takeEvery,
} from 'redux-saga/effects';

import { AUGMENT, AUGMENT_ASYNC } from '../actions/Augment';
import { OPTIMIZE_GEAR, OPTIMIZE_GEAR_ASYNC } from '../actions/OptimizeGear';
import { OPTIMIZE_SAVES, OPTIMIZE_SAVES_ASYNC } from '../actions/OptimizeSaves';
import { OPTIMIZING_GEAR } from '../actions/OptimizingGear';
import { TERMINATE, TERMINATE_ASYNC } from '../actions/Terminate';

import Worker from './optimize.worker';


let worker;


function doOptimize(command, result, state, workr) {
  return new Promise((resolve) => {
    // eslint-disable-next-line no-param-reassign
    workr.onmessage = (e) => {
      resolve(e.data[result]);
    };
    workr.postMessage({ command, state });
  });
}


export function* optimizeAsync() {
  worker = new Worker();
  yield put({
    type: OPTIMIZING_GEAR,
    payload: {
      worker,
    },
  });
  const store = yield select();
  const state = store.optimizer;
  const equip = yield doOptimize('optimize', 'equip', state, worker);
  yield put({
    type: OPTIMIZE_GEAR,
    payload: {
      equip,
    },
  });
}

export function* optimizeSavesAsync() {
  worker = new Worker();
  yield put({
    type: OPTIMIZING_GEAR,
    payload: {
      worker,
    },
  });
  const store = yield select();
  const state = store.optimizer;
  const savedequip = yield doOptimize('optimizeSaves', 'savedequip', state, worker);
  yield put({
    type: OPTIMIZE_SAVES,
    payload: {
      savedequip,
      savedidx: state.savedidx,
    },
  });
}

export function* augmentAsync() {
  worker = new Worker();
  yield put({
    type: OPTIMIZING_GEAR,
    payload: {
      worker,
    },
  });
  const store = yield select();
  const state = store.optimizer;
  const vals = yield doOptimize('augment', 'vals', state, worker);
  yield put({
    type: AUGMENT,
    payload: {
      vals,
    },
  });
}

export function* terminate() {
  worker.terminate();
  yield put({ type: TERMINATE });
}

export function* watchOptimizeAsync() {
  yield takeEvery(OPTIMIZE_GEAR_ASYNC, optimizeAsync);
}

export function* watchOptimizeSavesAsync() {
  yield takeEvery(OPTIMIZE_SAVES_ASYNC, optimizeSavesAsync);
}

export function* watchAugmentAsync() {
  yield takeEvery(AUGMENT_ASYNC, augmentAsync);
}

export function* watchTerminate() {
  yield takeEvery(TERMINATE_ASYNC, terminate);
}

export default function* rootSaga() {
  yield all([
    watchOptimizeAsync(),
    watchOptimizeSavesAsync(),
    watchAugmentAsync(),
    watchTerminate(),
  ]);
}
