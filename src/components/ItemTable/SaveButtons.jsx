import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Crement from '../Crement/Crement';
import OptimizeButton from '../OptimizeButton/OptimizeButton';


class SaveButtons extends Component {
  static handleFocus(event) {
    event.target.select();
  }

  render() {
    const {
      handleOptimizeSaves, handleTerminate, handleSaveSlot, handleCrement, handleLoadFactors,
      handleToggleUnused, handleToggleSaved, handleSaveName, handleDeleteSlot, handleLoadSlot,
      maxsavedidx, running, savedequip, savedidx, showsaved, showunused,
    } = this.props;

    const name = savedequip[savedidx].name === undefined
      ? 'Slot with no name'
      : savedequip[savedidx].name;
    return (
      <div className="item-section">
        <div style={{ margin: 5 }}>
          <OptimizeButton
            text="All Saves"
            running={running}
            abort={handleTerminate}
            optimize={handleOptimizeSaves}
          />
          {' '}
          <button type="button" onClick={handleToggleUnused}>
            {`${showunused ? 'Unmark' : 'Mark'} unused items`}
          </button>
        </div>
        <input
          style={{
            width: '150px',
            margin: '5px',
          }}
          value={name}
          onFocus={SaveButtons.handleFocus}
          onChange={(e) => handleSaveName(e.target.value)}
        />
        <div
          style={{
            margin: '5px',
          }}
        >
          <Crement
            header="Save slot"
            value={savedidx}
            name="savedidx"
            handleClick={handleCrement}
            min={0}
            max={maxsavedidx}
          />
          <button type="button" onClick={handleSaveSlot}>Save</button>
          <button type="button" onClick={handleLoadSlot}>Load</button>
          <button type="button" onClick={handleDeleteSlot}>Delete</button>
          <button type="button" onClick={handleToggleSaved}>{showsaved ? 'Hide' : 'Show'}</button>
          <button type="button" onClick={handleLoadFactors}>
            {
              savedequip[savedidx].factors === undefined
                ? 'No Priorities Saved...'
                : 'Load Priorities'
            }
          </button>
        </div>
      </div>
    );
  }
}

SaveButtons.propTypes = {
  handleCrement: PropTypes.func.isRequired,
  handleDeleteSlot: PropTypes.func.isRequired,
  handleLoadFactors: PropTypes.func.isRequired,
  handleLoadSlot: PropTypes.func.isRequired,
  handleOptimizeSaves: PropTypes.func.isRequired,
  handleSaveName: PropTypes.func.isRequired,
  handleSaveSlot: PropTypes.func.isRequired,
  handleTerminate: PropTypes.func.isRequired,
  handleToggleSaved: PropTypes.func.isRequired,
  handleToggleUnused: PropTypes.func.isRequired,
  maxsavedidx: PropTypes.number.isRequired,
  running: PropTypes.bool.isRequired,
  savedequip: PropTypes.arrayOf(PropTypes.object).isRequired,
  savedidx: PropTypes.number.isRequired,
  showsaved: PropTypes.bool.isRequired,
  showunused: PropTypes.bool.isRequired,
};


export default SaveButtons;
