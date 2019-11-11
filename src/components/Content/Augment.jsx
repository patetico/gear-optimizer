import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';


import Augment from '../../Augment';
import { shortenExponential } from '../../util';
import VersionForm from '../VersionForm/VersionForm';


const AUGS = [
  {
    name: 'scissors',
    boost: 25 ** 0,
  }, {
    name: 'milk',
    boost: 25 ** 1,
  }, {
    name: 'cannon',
    boost: 25 ** 2,
  }, {
    name: 'mounted',
    boost: 25 ** 3,
  }, {
    name: 'buster',
    boost: 25 ** 4,
  }, {
    name: 'exo',
    boost: (25 ** 5) * 1e2,
  }, {
    name: 'laser sword',
    boost: (25 ** 6) * 1e4,
  },
];


class AugmentComponent extends Component {
  static handleFocus(event) {
    event.target.select();
  }

  static handleSubmit(event) {
    event.preventDefault();
  }

  constructor(props, context) {
    super(props, context);
    this.handleChange = this.handleChange.bind(this);
    this.configureRatios = this.configureRatios.bind(this);
    this.input = this.input.bind(this);
    this.namedInput = this.namedInput.bind(this);
    this.augment = this.augment.bind(this);
  }

  handleChange(event, name, idx = -1) {
    const { augstats, handleSettings } = this.props;
    const val = event.target.value;

    if (idx < 0) {
      handleSettings('augstats', { ...augstats, [name]: val });
      return;
    }

    const newAugstats = { ...augstats };

    newAugstats.augs = newAugstats.augs.slice();
    newAugstats.augs[idx][name] = val;
    handleSettings('augstats', newAugstats);
  }

  configureRatios(key) {
    const { augstats, handleSettings } = this.props;

    let augs;
    const augmentOptimizer = new Augment(augstats, AUGS);
    const { version } = augstats;

    if (key === 'exponent') {
      augs = augstats.augs.map((aug, idx) => {
        const ratio = augmentOptimizer.exponent(idx) / 2;
        return {
          ...aug,
          ratio,
        };
      });
    } else if (key === 'cost') {
      augs = augstats.augs.map((aug, idx) => {
        const ratio = augmentOptimizer.cost(idx, version, false, false)
          / augmentOptimizer.cost(idx, version, true, false);
        return {
          ...aug,
          ratio,
        };
      });
    } else if (key === 'equal') {
      augs = augstats.augs.map((aug) => ({ ...aug, ratio: 1 }));
    }

    handleSettings('augstats', { ...augstats, augs });
  }

  input(val, args, width = 100) {
    return (
      <label>
        <input
          style={{ width, margin: 5 }}
          type="number"
          step="any"
          value={val}
          onFocus={AugmentComponent.handleFocus}
          onChange={(e) => this.handleChange(e, ...args)}
        />
      </label>
    );
  }

  namedInput(name, val, args, width = 100) {
    return (
      <tr>
        <td>{name}</td>
        <td>
          {this.input(val, args, width)}
        </td>
      </tr>
    );
  }

  augment(augstats, aug, pos) {
    const augmentOptimizer = new Augment(augstats, AUGS);
    const augresult = augmentOptimizer.reachable(pos, false);
    const auglevel = augresult[0];
    const goldlimited = augresult[1];
    const upglevel = goldlimited
      ? 0
      : augmentOptimizer.reachable(pos, true)[0];
    const boost = augmentOptimizer.boost(pos, auglevel, upglevel);
    const energy = augmentOptimizer.energy(pos);
    return (
      <tr key={pos}>
        <td>{aug.name}</td>
        <td>
          {
            this.input(augstats.augs[pos].ratio, [
              'ratio', pos,
            ], 50)
          }
        </td>
        <td>{shortenExponential(energy[0])}</td>
        <td>{shortenExponential(energy[1])}</td>
        <td>{shortenExponential(auglevel)}</td>
        <td>{shortenExponential(upglevel)}</td>
        <td>{shortenExponential(boost)}</td>
      </tr>
    );
  }

  render() {
    ReactGA.pageview('/augment/');
    const { augstats } = this.props;
    return (
      <div className="center">
        <form onSubmit={AugmentComponent.handleSubmit}>
          <table className="center">
            <tbody>
              {this.namedInput('Energy cap', augstats.ecap, ['ecap'])}
              {this.namedInput('Augment speed', augstats.augspeed, ['augspeed'])}
              {this.namedInput('Gold', augstats.gold, ['gold'])}
              {this.namedInput('Net GPS', augstats.gps, ['gps'])}
              {this.namedInput('Normal NAC:', augstats.nac, ['nac'])}
              {this.namedInput('Normal LSC:', augstats.lsc, ['lsc'])}
              {this.namedInput('time', augstats.time, ['time'])}
              <tr>
                <td>
                  Game mode:
                </td>
                <td>
                  <VersionForm {...this.props} handleChange={this.handleChange} />
                </td>
              </tr>
              <tr>
                <td>Ratio:</td>
                <td>
                  <button type="button" onClick={() => this.configureRatios('exponent')}>
                    Exponent
                  </button>
                  <button type="button" onClick={() => this.configureRatios('cost')}>
                    Cost
                  </button>
                  <button type="button" onClick={() => this.configureRatios('equal')}>
                    Equal
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <table className="center">
            <tbody>
              <tr>
                <th>Augment</th>
                <th>Ratio</th>
                <th>
                  Augment
                  <br />
                  Energy
                </th>
                <th>
                  Upgrade
                  <br />
                  Energy
                </th>
                <th>
                  Augment
                  <br />
                  Level
                </th>
                <th>
                  Upgrade
                  <br />
                  Level
                </th>
                <th>Boost</th>
              </tr>
              {
                AUGS.map((aug, pos) => this.augment(augstats, aug, pos))
              }
            </tbody>
          </table>
        </form>
      </div>
    );
  }
}


AugmentComponent.propTypes = {
  augstats: PropTypes.shape({
    version: PropTypes.number,
    augs: PropTypes.array,
    ecap: PropTypes.number,
    augspeed: PropTypes.number,
    gold: PropTypes.number,
    gps: PropTypes.number,
    nac: PropTypes.number,
    lsc: PropTypes.number,
    time: PropTypes.number,
  }).isRequired,
  handleSettings: PropTypes.func.isRequired,
};

export default AugmentComponent;
