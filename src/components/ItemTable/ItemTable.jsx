import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

import Item from '../Item/Item';
import { allowedZone, getLimits } from '../../util';

import './ItemTable.css';


function compareFactory(key) {
  return (prop) => (keyA, keyB) => {
    const a = prop[keyA];
    const b = prop[keyB];

    if (a === undefined || a[key] === undefined || b === undefined || b[key] === undefined) {
      return true;
    }

    let result;
    if (a[key][1] !== b[key][1]) {
      // HACK: place items from different titan versions in same bucket
      if (
        a[key][0].substring(0, a[key][0].length - 2)
        === b[key][0].substring(0, b[key][0].length - 2)
      ) {
        result = a.slot[1] - b.slot[1];
      } else if (a[key][1] * b[key][1] < 0) {
        result = a[key][1] - b[key][1];
      } else {
        result = b[key][1] - a[key][1];
      }
    } else {
      result = a.slot[1] - b.slot[1];
    }
    return result;
  };
}

function groupFn(a, b, g) {
  if (a === undefined || b === undefined) {
    return false;
  }
  // HACK: place items from different titan versions in same bucket
  return a[g][0].substring(0, a[g][0].length - 2) !== b[g][0].substring(0, b[g][0].length - 2);
}

class ItemTable extends Component {
  constructor(props) {
    super(props);
    this.localbuffer = [];
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  createSection(buffer, last, classIdx) {
    const { handleHideZone, group, hidden } = this.props;

    if (this.localbuffer.length > 0) {
      buffer.push((
        // TODO: key should not be an index
        <div className="item-section" key={classIdx}>
          {// TODO: fix a11y issues
            /* eslint-disable
            jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */}
          <span onClick={() => handleHideZone(last.zone[1])}>
            {/* eslint-enable */}
            {last[group][0]}
            <br />
          </span>
          {!hidden[last.zone[1]] && this.localbuffer}
        </div>
      ));
      this.localbuffer = [];
    }
    return classIdx + 1;
  }

  render() {
    const {
      itemdata, savedequip, handleClickItem, group,
      handleRightClickItem, items, showunused,
    } = this.props;

    // TODO: sorting on every change is very inefficient
    const buffer = [];
    let classIdx = 0;
    const limits = getLimits(this.props);
    const compare = compareFactory(group)(itemdata);
    const sorted = items.sort(compare);
    let last;
    for (let idx = 0; idx < sorted.length; idx++) {
      const name = sorted[idx];
      const item = itemdata[name];

      if (item.empty) continue; // eslint-disable-line no-continue

      const next = groupFn(last, item, group);
      if (next) {
        classIdx = this.createSection(buffer, last, classIdx);
      }
      let className = '';
      if (!item.disable && showunused) {
        className = ' unused-item';
        savedequip.forEach((save) => {
          if (className === '') {
            return;
          }
          if (save[item.slot[0]] === undefined) {
            return;
          }
          save[item.slot[0]].forEach((i) => {
            if (i === name) {
              className = '';
            }
          });
        });
      }

      if (allowedZone(itemdata, limits, name)) {
        this.localbuffer.push(<Item
          className={className}
          item={item}
          handleClickItem={handleClickItem}
          handleRightClickItem={handleRightClickItem}
          key={name}
        />);
      }

      last = item;
    }

    this.createSection(buffer, last, classIdx);

    return (
      <div className="item-table">
        {buffer}
      </div>
    );
  }
}

ItemTable.propTypes = {
  group: PropTypes.string.isRequired,
  handleClickItem: PropTypes.func.isRequired,
  handleHideZone: PropTypes.func.isRequired,
  handleRightClickItem: PropTypes.func.isRequired,
  hidden: PropTypes.objectOf(PropTypes.bool).isRequired,
  itemdata: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.object,
  ])).isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  savedequip: PropTypes.arrayOf(PropTypes.object).isRequired,
  showunused: PropTypes.bool.isRequired,
};

export default ItemTable;
