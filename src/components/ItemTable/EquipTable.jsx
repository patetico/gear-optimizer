/* eslint-disable max-classes-per-file */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

import Item from '../Item/Item';
import { EmptySlot, Factors, Slot } from '../../assets/ItemAux';
import './ItemTable.css';
import { cubeBaseItemData, scoreEquip, shorten } from '../../util';

import SaveButtons from './SaveButtons';


function compareFactory(key) {
  return (prop) => (keyA, keyB) => {
    const a = prop[keyA];
    const b = prop[keyB];
    if (a === undefined || a[key] === undefined || b === undefined || b[key] === undefined) {
      return true;
    }
    if (a[key][1] !== b[key][1]) {
      return a[key][1] - b[key][1];
    }
    return a.slot[1] - b.slot[1];
  };
}

const formatted = (val, stat, d) => {
  if (val === Infinity) {
    return '(+∞%)';
  }
  let pf = '';
  if (d) pf += val >= 0 ? '(+' : '(-';

  let sf = d ? '%)' : '';
  if (stat === 'Respawn') {
    sf = d ? 'pp)' : '% reduction';
  } else {
    pf = d ? pf : '×';
  }
  return pf + shorten(Math.abs(val)) + sf;
};


class BonusLine extends Component {
  static diffclass(old, val) {
    let className = 'same-stat';
    if (old < val) {
      className = 'increase-stat';
    } else if (old > val) {
      className = 'decrease-stat';
    }
    return className;
  }

  render() {
    const {
      factor, itemdata, equip, offhand, factors, savedequip, capstats,
    } = this.props;

    let val = scoreEquip(itemdata, equip, factor, offhand, capstats);
    let old = scoreEquip(itemdata, savedequip, factor, offhand, capstats);

    const stat = factor[0];
    if (stat === 'Power' || stat === 'Toughness' || stat === 'Respawn') {
      val *= 100;
      old *= 100;
    }

    const diffVal = stat === 'Respawn' || val === old ? val - old : 100 * (val / old - 1);
    const classNameDiff = BonusLine.diffclass(old, val);
    const diff = (
      <span className={classNameDiff}>
        {formatted(diffVal, stat, true)}
      </span>
    );
    let className;
    for (let idx = 0; idx < factors.length; idx++) {
      if (stat === Factors[factors[idx]][0]) {
        className = ' priority-stat';
        break;
      }
    }
    const text = (
      <span className={className}>
        {`${factor[0]}: ${formatted(val, stat, false)} `}
        {diff}
      </span>
    );
    return (
      <>
        {' '}
        {text}
        <br />
      </>
    );
  }
}


BonusLine.propTypes = {
  capstats: PropTypes.objectOf(PropTypes.number).isRequired,
  equip: PropTypes.objectOf(PropTypes.any).isRequired,
  factor: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string, PropTypes.array,
  ])).isRequired,
  factors: PropTypes.arrayOf(PropTypes.string).isRequired,
  itemdata: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.object, PropTypes.array,
  ])).isRequired,
  offhand: PropTypes.number.isRequired,
  savedequip: PropTypes.objectOf(PropTypes.any).isRequired,
};


class EquipTable extends Component {
  constructor(props) {
    super(props);
    const { itemdata, cubestats, basestats } = props;
    this.itemdata = cubeBaseItemData(itemdata, cubestats, basestats);
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  renderEquip(equip, prefix, compare, buffer, handleClickItem, lockable) {
    const {
      itemdata, basestats, group, cubestats, handleRightClickItem, locked,
    } = this.props;

    this.itemdata = cubeBaseItemData(
      itemdata,
      cubestats,
      basestats,
    );

    const sorted = Object.getOwnPropertyNames(Slot)
      .sort((a, b) => Slot[a][1] - Slot[b][1])
      .reduce((res, slot) => res.concat(equip[Slot[slot][0]]), []);
    let localbuffer = [];
    let last = new EmptySlot();
    let typeIdx = 0;
    for (let idx = 0; idx < sorted.length; idx++) {
      const name = sorted[idx];
      const item = this.itemdata[name];
      if (item === undefined || item.slot === Slot.OTHER) {
        // TODO: investigate bug and refactor to fix eslint error
        // fixes some bugs when loading new gear optimizer version
        continue; // eslint-disable-line no-continue
      }

      if (
        last[group] !== undefined
        && item[group] !== undefined
        && last[group][1] !== item[group][1]
      ) {
        typeIdx = idx;
        if (item.slot[0] === Slot.ACCESSORY[0]) {
          buffer.push(
            <div className="item-section" key={this.class_idx}>
              <span>
                {`${prefix}Outfit`}
                <br />
              </span>
              {localbuffer}
            </div>,
          );
          this.class_idx += 1;
          localbuffer = [];
        }
      }
      localbuffer.push(<Item
        item={item}
        idx={idx - typeIdx}
        lockable={lockable}
        locked={locked}
        handleClickItem={handleClickItem}
        handleRightClickItem={handleRightClickItem}
        key={name + idx}
      />);
      last = item;
    }
    buffer.push(
      <div className="item-section" key={this.class_idx}>
        <span>
          {`${prefix}Accessories`}
          <br />
        </span>
        {localbuffer}
      </div>,
    );
    this.class_idx += 1;
  }

  renderConditional(condition, title, buffer) {
    const { items, handleEquipItem, handleRightClickItem } = this.props;

    const sorted = items.filter(
      (name) => (condition(name) && this.itemdata[name].level !== undefined),
    );

    const localbuffer = [];
    for (let idx = 0; idx < sorted.length; idx++) {
      const name = sorted[idx];
      const item = this.itemdata[name];
      localbuffer.push(<Item
        item={item}
        handleClickItem={handleEquipItem}
        handleRightClickItem={handleRightClickItem}
        key={name}
      />);
    }
    if (localbuffer.length > 0) {
      buffer.push(
        <div className="item-section" key={this.class_idx}>
          <span>
            {title}
            <br />
          </span>
          {localbuffer}
        </div>,
      );
      this.class_idx += 1;
    }
  }

  render() {
    const {
      capstats, showsaved, savedidx, savedequip: savedequip1, factors, handleClickItem,
      group: group1, handleEquipItem, offhand, equip,
    } = this.props;

    // TODO: sorting on every change is very inefficient
    const buffer = [];
    this.class_idx = 0;
    const compareFn = compareFactory(group1)(this.itemdata);
    const savedequip = savedequip1[savedidx];
    this.renderEquip(equip, '', compareFn, buffer, handleClickItem, true);
    buffer.push(<SaveButtons {...this.props} key="savebuttons" />);
    if (showsaved) {
      this.renderEquip(savedequip, 'Saved ', compareFn, buffer, handleEquipItem, false);
    }
    buffer.push(
      <div className="item-section" key="stats">
        Gear stats (change w.r.t. save slot)
        <br />
        <br />
        {' '}
        {
          Object.getOwnPropertyNames(Factors)
            .map((factor) => (
              (factor === 'NONE' || factor === 'DELETE' || factor === 'INSERT')
                ? <div key={factor} />
                : (
                  <BonusLine
                    itemdata={this.itemdata}
                    equip={equip}
                    savedequip={savedequip}
                    factor={Factors[factor]}
                    factors={factors}
                    capstats={capstats}
                    offhand={offhand * 5}
                    key={factor}
                  />
                )))
        }
      </div>,
    );
    this.renderConditional((name) => this.itemdata[name].level !== 100, 'Not maxed', buffer);
    this.renderConditional((name) => this.itemdata[name].disable, 'Disabled', buffer);
    return (
      <div className="item-table">
        {buffer}
      </div>
    );
  }
}

EquipTable.propTypes = {
  basestats: PropTypes.shape({
    power: PropTypes.number,
    toughness: PropTypes.number,
  }).isRequired,
  capstats: PropTypes.objectOf(PropTypes.number).isRequired,
  cubestats: PropTypes.shape({
    tier: PropTypes.number,
    power: PropTypes.number,
    toughness: PropTypes.number,
  }).isRequired,
  equip: PropTypes.objectOf(PropTypes.any).isRequired,
  factors: PropTypes.arrayOf(PropTypes.string).isRequired,
  group: PropTypes.string.isRequired,
  handleClickItem: PropTypes.func.isRequired,
  handleEquipItem: PropTypes.func.isRequired,
  handleRightClickItem: PropTypes.func.isRequired,
  itemdata: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.object, PropTypes.array,
  ])).isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  locked: PropTypes.objectOf(PropTypes.bool).isRequired,
  offhand: PropTypes.number.isRequired,
  savedequip: PropTypes.arrayOf(PropTypes.object).isRequired,
  savedidx: PropTypes.number.isRequired,
  showsaved: PropTypes.bool.isRequired,
};


export default EquipTable;
