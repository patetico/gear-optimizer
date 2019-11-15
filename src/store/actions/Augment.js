export const AUGMENT = 'Optimize augments.';
export const AUGMENT_ASYNC = 'Optimize augments async.';
export const AUGMENT_SETTINGS = 'Configure augments.';


export const AugmentSettings = (lsc, time) => ({
  type: AUGMENT_SETTINGS,
  payload: { lsc, time },
});


export const Augment = (vals) => ({
  type: AUGMENT,
  payload: { vals },
});


export const AugmentAsync = () => ({ type: AUGMENT_ASYNC, payload: {} });
