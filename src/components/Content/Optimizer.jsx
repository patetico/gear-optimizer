import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';

import Modal from 'react-modal';

import { getMaxTitan, getMaxZone, getZone } from '../../util';
import { LOOTIES, PENDANTS } from '../../assets/Items';

import Crement from '../Crement/Crement';
import ItemTable from '../ItemTable/ItemTable';
import EquipTable from '../ItemTable/EquipTable';
import OptimizeButton from '../OptimizeButton/OptimizeButton';
import FactorForm from '../FactorForm/FactorForm';
import ItemForm from '../ItemForm/ItemForm';

import './Optimizer.css';


const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#app');


class Optimizer extends Component {
  static handleFocus(event) {
    event.target.select();
  }

  static cubeTier(cubestats, name) {
    const power = Number(cubestats.power);
    const toughness = Number(cubestats.toughness);
    let tier = Number(cubestats.tier);
    if (name !== 'tier') {
      tier = Math.floor(Math.log10(power + toughness) - 1);
    }
    tier = Math.max(0, tier);
    return {
      ...cubestats,
      tier,
    };
  }

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.closeEditModal = this.closeEditModal.bind(this);
  }

  closeEditModal() {
    const { handleToggleEdit } = this.props;
    return handleToggleEdit(undefined, false, false);
  }

  handleChange(event, name) {
    const { handleSettings } = this.props;

    let val = event.target.value;
    if (val < 0) {
      val = 0;
    }
    let stats = {
      // eslint-disable-next-line react/destructuring-assignment
      ...this.props[`${name[0]}stats`],
      [name[1]]: val,
    };
    if (name[0] === 'cube') {
      stats = Optimizer.cubeTier(stats, name[1]);
    }
    handleSettings(`${name[0]}stats`, stats);
  }

  render() {
    const {
      handleToggleEdit,
      equip,
      editItem,
      offhand,
      cubestats,
      handleCrement,
      zone,
      capstats,
      handleUndo,
      handleUnequipItem,
      basestats,
      handleOptimizeGear,
      handleGo2Titan,
      titanversion,
      handleEquipItem,
      looty: looty1,
      pendant: pendant1,
      running,
      className,
      factors,
      handleTerminate,
    } = this.props;

    ReactGA.pageview('/gear-optimizer/');
    const zones = getZone(zone);
    const maxzone = getMaxZone(zone);
    const maxtitan = getMaxTitan(zone);
    const accslots = equip.accessory.length;
    const looty = looty1 >= 0 ? LOOTIES[looty1] : 'None';
    const pendant = pendant1 >= 0 ? PENDANTS[pendant1] : 'None';

    return (
      <div className={className}>
        <div className="content__container">
          <div className="button-section" key="slots">
            <button type="button" onClick={() => handleGo2Titan(8, 3, 5, 12)}>
              Titan 8 Preset
            </button>
            <div>
              <Crement
                header="Highest zone"
                value={zones[0]}
                name="zone"
                handleClick={handleCrement}
                min={2}
                max={maxzone}
              />
            </div>
            {
              zone > 20 && (
                <div>
                  <Crement
                    header={`${maxtitan[0]} version`}
                    value={titanversion}
                    name="titanversion"
                    handleClick={handleCrement}
                    min={1}
                    max={4}
                  />
                </div>
              )
            }
            <div>
              <Crement
                header="Highest looty"
                value={looty}
                name="looty"
                handleClick={handleCrement}
                min={-1}
                max={LOOTIES.length - 1}
              />
            </div>
            <div>
              <Crement
                header="Highest pendant"
                value={pendant}
                name="pendant"
                handleClick={handleCrement}
                min={-1}
                max={PENDANTS.length - 1}
              />
            </div>
            <div>
              <Crement
                header="Accessory slots"
                value={accslots}
                name="accslots"
                handleClick={handleCrement}
                min={0}
                max={100}
              />
            </div>
            <div>
              <Crement
                header="Offhand power"
                value={`${offhand * 5}%`}
                name="offhand"
                handleClick={handleCrement}
                min={0}
                max={20}
              />
            </div>
          </div>
          <div className="button-section" key="factorforms">
            <OptimizeButton
              text="Gear"
              running={running}
              abort={handleTerminate}
              optimize={handleOptimizeGear}
            />
            {' '}
            <button type="button" onClick={handleUndo}>
              Load previous
            </button>
            {[...factors.keys()].map((idx) => (
              <div key={`factorform${idx}`}><FactorForm {...this.props} idx={idx} /></div>))}
          </div>
          <div className="button-section" key="numberforms">
            <table className="center cubetable">
              <tbody>
                <tr>
                  <td>
                    Base Power
                  </td>
                  <td>
                    <label>
                      <input
                        style={{ width: 100, margin: 5 }}
                        type="number"
                        step="any"
                        value={basestats.power}
                        onFocus={Optimizer.handleFocus}
                        onChange={(e) => this.handleChange(e, ['base', 'power'])}
                      />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>
                    Base Toughness
                  </td>
                  <td>
                    <label>
                      <input
                        style={{ width: 100, margin: 5 }}
                        type="number"
                        step="any"
                        value={basestats.toughness}
                        onFocus={Optimizer.handleFocus}
                        onChange={(e) => this.handleChange(e, ['base', 'toughness'])}
                      />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>
                    Cube Power
                  </td>
                  <td>
                    <label>
                      <input
                        style={{ width: 100, margin: 5 }}
                        type="number"
                        step="any"
                        value={cubestats.power}
                        onFocus={Optimizer.handleFocus}
                        onChange={(e) => this.handleChange(e, ['cube', 'power'])}
                      />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>
                    Cube Toughness
                  </td>
                  <td>
                    <label>
                      <input
                        style={{ width: 100, margin: 5 }}
                        type="number"
                        step="any"
                        value={cubestats.toughness}
                        onFocus={Optimizer.handleFocus}
                        onChange={(e) => this.handleChange(e, ['cube', 'toughness'])}
                      />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>
                    Cube Tier
                  </td>
                  <td>
                    <label>
                      <input
                        style={{ width: 100, margin: 5 }}
                        type="number"
                        step="any"
                        value={cubestats.tier}
                        onFocus={Optimizer.handleFocus}
                        onChange={(e) => this.handleChange(e, ['cube', 'tier'])}
                      />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>
                    E Cap Gear
                  </td>
                  <td>
                    <label>
                      <input
                        style={{ width: 100, margin: 5 }}
                        type="number"
                        step="any"
                        value={capstats['Energy Cap Gear']}
                        onFocus={Optimizer.handleFocus}
                        onChange={(e) => this.handleChange(e, ['cap', 'Energy Cap Gear'])}
                      />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>
                    Total E Cap
                  </td>
                  <td>
                    <label>
                      <input
                        style={{ width: 100, margin: 5 }}
                        type="number"
                        step="any"
                        value={capstats['Energy Cap Total']}
                        onFocus={Optimizer.handleFocus}
                        onChange={(e) => this.handleChange(e, ['cap', 'Energy Cap Total'])}
                      />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>
                    M Cap Gear
                  </td>
                  <td>
                    <label>
                      <input
                        style={{ width: 100, margin: 5 }}
                        type="number"
                        step="any"
                        value={capstats['Magic Cap Gear']}
                        onFocus={Optimizer.handleFocus}
                        onChange={(e) => this.handleChange(e, ['cap', 'Magic Cap Gear'])}
                      />
                    </label>
                  </td>
                </tr>
                <tr>
                  <td>
                    Total M Cap
                  </td>
                  <td>
                    <label>
                      <input
                        style={{ width: 100, margin: 5 }}
                        type="number"
                        step="any"
                        value={capstats['Magic Cap Total']}
                        onFocus={Optimizer.handleFocus}
                        onChange={(e) => this.handleChange(e, ['cap', 'Magic Cap Total'])}
                      />
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="content__container">
          <EquipTable
            {...this.props}
            group="slot"
            type="equip"
            handleClickItem={handleUnequipItem}
            handleRightClickItem={handleToggleEdit}
          />
          <ItemTable
            {...this.props}
            maxtitan={maxtitan}
            group="zone"
            type="items"
            handleClickItem={handleEquipItem}
            handleRightClickItem={handleToggleEdit}
          />
        </div>
        <Modal
          className="edit-item-modal"
          overlayClassName="edit-item-overlay"
          isOpen={editItem[0]}
          // onAfterOpen={this.afterOpenModal} // FIXME: where the did this come from???
          onRequestClose={this.closeEditModal}
          style={customStyles}
          contentLabel="Item Edit Modal"
          autoFocus={false}
        >
          <ItemForm {...this.props} closeEditModal={this.closeEditModal} />
        </Modal>
      </div>
    );
  }
}


Optimizer.propTypes = {
  basestats: PropTypes.shape({
    power: PropTypes.number,
    toughness: PropTypes.number,
  }).isRequired,
  capstats: PropTypes.objectOf(PropTypes.number).isRequired,
  cubestats: PropTypes.shape({
    power: PropTypes.number,
    tier: PropTypes.number,
    toughness: PropTypes.number,
  }).isRequired,
  className: PropTypes.string.isRequired,
  editItem: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.bool, PropTypes.string, PropTypes.number,
  ])).isRequired,
  equip: PropTypes.shape({
    weapon: PropTypes.arrayOf(PropTypes.string),
    head: PropTypes.arrayOf(PropTypes.string),
    armor: PropTypes.arrayOf(PropTypes.string),
    pants: PropTypes.arrayOf(PropTypes.string),
    boots: PropTypes.arrayOf(PropTypes.string),
    accessory: PropTypes.arrayOf(PropTypes.string),
    other: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  factors: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleCrement: PropTypes.func.isRequired,
  handleEquipItem: PropTypes.func.isRequired,
  handleGo2Titan: PropTypes.func.isRequired,
  handleOptimizeGear: PropTypes.func.isRequired,
  handleSettings: PropTypes.func.isRequired,
  handleTerminate: PropTypes.func.isRequired,
  handleToggleEdit: PropTypes.func.isRequired,
  handleUndo: PropTypes.func.isRequired,
  handleUnequipItem: PropTypes.func.isRequired,
  looty: PropTypes.number.isRequired,
  offhand: PropTypes.number.isRequired,
  pendant: PropTypes.number.isRequired,
  running: PropTypes.bool.isRequired,
  titanversion: PropTypes.number.isRequired,
  zone: PropTypes.number.isRequired,
};

export default Optimizer;
