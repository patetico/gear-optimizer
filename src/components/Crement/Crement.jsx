import React from 'react';
import PropTypes from 'prop-types';


export default function Crement(props) {
  const {
    min, handleClick, max, name, value, header,
  } = props;
  return (
    <>
      <button type="button" onClick={() => handleClick(name, -1, min, max)}>
        -
      </button>
      <button type="button" onClick={() => handleClick(name, 1, min, max)}>
        +
      </button>
      {` ${header}: ${value}`}
    </>
  );
}

Crement.propTypes = {
  header: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
