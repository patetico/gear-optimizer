import React from 'react';
import PropTypes from 'prop-types';

import { getLock } from '../../util';

import './Item.css';


function importAll(r) {
  const images = {};
  r.keys().forEach((item) => {
    const key = item.replace('./', '').replace(/\.[^/.]+$/, '');
    images[key] = r(item);
  });
  return images;
}

const images = importAll(require.context('../../assets/img/', false, /\.(png|jpe?g|svg)$/));


const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });


function Item(props) {
  const {
    item, lockable, handleClickItem, handleRightClickItem, locked, className, idx,
  } = props;

  let classNames = `item ${className}`;
  if (lockable && getLock(item.slot[0], idx, locked)) {
    classNames += ' lock-item';
  }
  if (item === undefined) {
    return (
      <span>
        <img className={classNames} data-tip="Empty slot" src={images.logo} alt="Empty" />
      </span>
    );
  }

  let tt = `${item.name}${item.empty ? '' : ` lvl ${item.level}`}<br />`;
  item.statnames.forEach((stat) => {
    tt += `<br />${stat}: ${numberFormatter.format(item[stat])}`;
    if (stat === 'Power' || stat === 'Toughness') tt += '%';
  });

  classNames += item.disable ? ' disable-item' : '';
  classNames += ` ${item.slot[0]}`;
  let imgname = item.name;
  imgname = imgname.replace(/[<!]+/g, '');

  return (
    // TODO: fix a11y issues
    /* eslint-disable
        jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    <img
      className={classNames}
      onClick={() => handleClickItem(item.name)}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!item.empty) handleRightClickItem(item.name, lockable);
      }}
      data-tip={tt}
      src={images[imgname]}
      alt={item.name}
      key="item"
    />
    /* eslint-enable */
  );
}


Item.propTypes = {
  className: PropTypes.string,
  handleClickItem: PropTypes.func.isRequired,
  handleRightClickItem: PropTypes.func.isRequired,
  idx: PropTypes.number,
  item: PropTypes.shape({
    name: PropTypes.string,
    level: PropTypes.number,
    slot: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string, PropTypes.number,
    ])).isRequired,
    empty: PropTypes.bool,
    statnames: PropTypes.arrayOf(PropTypes.string),
    disable: PropTypes.bool,
  }).isRequired,
  lockable: PropTypes.bool,
  locked: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.number)),
};

Item.defaultProps = {
  className: '',
  idx: 0,
  lockable: false,
  locked: {},
};


export default Item;
