import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { getLock, getSlot } from '../../util';


function LockButton(props) {
  const {
    editItem, handleLockItem, equip, locked, itemdata,
  } = props;

  const name = editItem[1];
  const lockable = editItem[3];
  if (!lockable || itemdata[name].empty) {
    return <></>;
  }
  const slot = getSlot(name, itemdata);
  const idx = equip[slot[0]].indexOf(name);
  const isLocked = getLock(slot[0], idx, locked);
  return (
    <button type="button" onClick={() => handleLockItem(!isLocked, slot[0], idx)}>
      {isLocked ? 'Unlock' : 'Lock'}
    </button>
  );
}


LockButton.propTypes = {
  editItem: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.bool, PropTypes.string, PropTypes.number,
  ])).isRequired,
  equip: PropTypes.objectOf(PropTypes.any).isRequired,
  handleLockItem: PropTypes.func.isRequired,
  itemdata: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.object,
  ])).isRequired,
  locked: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.number)),
};

LockButton.defaultProps = {
  locked: {},
};


class ItemForm extends Component {
  static handleFocus(event) {
    event.target.select();
  }

  constructor(props) {
    super(props);
    const { editItem } = this.props;

    this.state = {
      value: editItem[2],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    const { closeEditModal, handleEditItem } = this.props;

    const { value } = this.state;
    handleEditItem(value);
    closeEditModal();
  }

  handleChange(event) {
    let val = event.target.value;
    while (val[0] === '0') {
      val = val.substr(1);
    }
    if (val.length === 0) {
      val = 0;
    } else {
      val = Number(val);
    }
    if (Number.isNaN(val)) {
      val = 100;
    }
    this.setState({ value: val });
  }

  render() {
    const {
      itemdata, handleDisableItem, closeEditModal, editItem,
    } = this.props;

    const isDisabled = itemdata[editItem[1]] !== undefined && itemdata[editItem[1]].disable;
    const able = isDisabled ? 'Enable' : 'Disable';

    const { value } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        {editItem[1]}
        <br />
        <label>
          Level:
          <input
            style={{ width: 50, margin: 10 }}
            type="text"
            value={value}
            onChange={this.handleChange}
            onFocus={ItemForm.handleFocus}
          />
        </label>
        <br />
        <input type="submit" value="Update" />
        {' '}
        <button type="button" onClick={() => handleDisableItem(editItem[1])}>{able}</button>
        {' '}
        <LockButton {...this.props} />
        <br />
        <button type="button" onClick={closeEditModal}>Cancel</button>
      </form>
    );
  }
}


ItemForm.propTypes = {
  closeEditModal: PropTypes.func.isRequired,
  editItem: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.bool, PropTypes.string, PropTypes.number,
  ])).isRequired,
  equip: PropTypes.objectOf(PropTypes.any).isRequired,
  handleDisableItem: PropTypes.func.isRequired,
  handleEditItem: PropTypes.func.isRequired,
  handleLockItem: PropTypes.func.isRequired,
  itemdata: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.object,
  ])).isRequired,
  locked: PropTypes.objectOf(PropTypes.bool).isRequired,
};

export default ItemForm;
