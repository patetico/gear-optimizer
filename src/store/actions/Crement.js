export const CREMENT = '[in|de]crement value.';

export const Crement = (name, val, min, max) => ({
  type: CREMENT,
  payload: {
    name, val, min, max,
  },
});
