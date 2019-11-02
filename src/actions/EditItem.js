export const EDIT_ITEM = 'Edit item.';

export const EditItem = (val) => ({
  type: EDIT_ITEM,
  payload: {
    val: val.length === 0 ? 0 : Number(val),
  },
});
