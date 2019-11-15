export const LOCK_ITEM = 'Lock item.';

export const LockItem = (lock, slot, idx) => ({
  type: LOCK_ITEM,
  payload: { lock, slot, idx },
});
