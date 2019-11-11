import React from 'react';
import PropTypes from 'prop-types';


function OptimizeButton(props) {
  const {
    optimize, abort, text, running,
  } = props;

  return (
    <button type="button" onClick={running ? abort : optimize}>
      {running ? 'Abort' : `Optimize ${text}`}
    </button>
  );
}

OptimizeButton.propTypes = {
  running: PropTypes.bool.isRequired,
  abort: PropTypes.func.isRequired,
  optimize: PropTypes.func.isRequired,
  text: PropTypes.string,
};

OptimizeButton.defaultProps = {
  text: '',
};

export default OptimizeButton;
