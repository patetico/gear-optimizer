import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';

import { NGU } from '../../NGU';
import { NGUs } from '../../assets/ItemAux';
import { shorten } from '../../util';


class NGUComponent extends Component {
  static handleFocus(event) {
    event.target.select();
  }

  static handleSubmit(event) {
    event.preventDefault();
  }

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, name, idx = -1, isMagic = -1) {
    const { ngustats, handleSettings } = this.props;

    const val = event.target.value;
    const newNguStats = { ...ngustats };

    if (idx < 0 && isMagic < 0) {
      if (name === 'e2n' || name === 's2e') {
        newNguStats.quirk = {
          ...newNguStats.quirk,
          [name]: !ngustats.quirk[name],
        };
        handleSettings('ngustats', newNguStats);
        return;
      }

      newNguStats[name] = val;
      handleSettings('ngustats', newNguStats);
      return;
    }

    const resource = isMagic === 1 ? 'magic' : 'energy';

    if (idx < 0) {
      newNguStats[resource] = {
        ...newNguStats[resource],
        [name]: val,
      };
      handleSettings('ngustats', newNguStats);
      return;
    }

    const ngus = { ...newNguStats[resource].ngus };
    ngus[idx][name] = val;
    newNguStats[resource] = {
      ...newNguStats[resource],
      ngus,
    };
    handleSettings('ngustats', newNguStats);
  }

  render() {
    ReactGA.pageview('/ngus/');
    const { ngustats } = this.props;

    const nguOptimizer = new NGU(ngustats);
    const { energy, magic, ngutime } = ngustats;
    return (
      <div className="center">
        <form onSubmit={NGUComponent.handleSubmit}>
          <table className="center">
            <tbody>
              <tr>
                <td>Energy cap</td>
                <td>
                  <label>
                    <input
                      style={{ width: 100, margin: 5 }}
                      type="number"
                      step="any"
                      value={energy.cap}
                      onFocus={NGUComponent.handleFocus}
                      onChange={(e) => this.handleChange(e, 'cap', -1, 0)}
                    />
                  </label>
                </td>
                <td>Energy NGU speed</td>
                <td>
                  <label>
                    <input
                      style={{ width: 100, margin: 5 }}
                      type="number"
                      step="any"
                      value={energy.nguspeed}
                      onFocus={NGUComponent.handleFocus}
                      onChange={(e) => this.handleChange(e, 'nguspeed', -1, 0)}
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>Magic cap</td>
                <td>
                  <label>
                    <input
                      style={{ width: 100, margin: 5 }}
                      type="number"
                      step="any"
                      value={magic.cap}
                      onFocus={NGUComponent.handleFocus}
                      onChange={(e) => this.handleChange(e, 'cap', -1, 1)}
                    />
                  </label>
                </td>
                <td>Magic NGU speed</td>
                <td>
                  <label>
                    <input
                      style={{ width: 100, margin: 5 }}
                      type="number"
                      step="any"
                      value={magic.nguspeed}
                      onFocus={NGUComponent.handleFocus}
                      onChange={(e) => this.handleChange(e, 'nguspeed', -1, 1)}
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>NGU time (minutes)</td>
                <td>
                  <label>
                    <input
                      style={{ width: 100, margin: 5 }}
                      type="number"
                      step="any"
                      value={ngutime}
                      onFocus={NGUComponent.handleFocus}
                      onChange={(e) => this.handleChange(e, 'ngutime')}
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>{'Evil -> Normal Quirk'}</td>
                <td>
                  <label>
                    <input
                      type="checkbox"
                      checked={ngustats.quirk.e2n}
                      onChange={(e) => this.handleChange(e, 'e2n')}
                    />
                  </label>
                </td>
                <td>{'Sadistic -> Evil Quirk'}</td>
                <td>
                  <label>
                    <input
                      type="checkbox"
                      checked={ngustats.quirk.s2e}
                      onChange={(e) => this.handleChange(e, 's2e')}
                    />
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
          <table className="center">
            <tbody>
              <tr>
                <td />
                <th>Normal Level</th>
                <th>Evil Level</th>
                <th>Sadistic Level</th>
                <th>
                  Current
                  <br />
                  Bonus
                </th>
                <th>
                  Reachable
                  <br />
                  Normal Level
                  <br />
                  (Bonus Change)
                </th>
                <th>
                  Reachable
                  <br />
                  Evil Level
                  <br />
                  (Bonus Change)
                </th>
                <th>
                  Reachable
                  <br />
                  Sadistic Level
                  <br />
                  (Bonus Change)
                </th>
              </tr>
              {
                ['energy', '', 'magic'].map((resource, resourceIdx) => {
                  const { ngustats: ngustats1 } = this.props;
                  if (resourceIdx === 1) {
                    return (
                      <tr key="whitespace">
                        <td><br /></td>
                      </tr>
                    );
                  }
                  const isMagic = resourceIdx === 2 ? 1 : 0;
                  const stats = ngustats1[resource].ngus;
                  return NGUs[resource].map((ngu, pos) => {
                    const bonus = nguOptimizer.bonus(ngu, stats[pos]);
                    const { ngustats: ngustats2 } = this.props;
                    const reachable = nguOptimizer.reachableBonus(
                      stats[pos],
                      ngutime,
                      pos,
                      isMagic,
                      ngustats2.quirk,
                    );
                    return (
                      <tr key={ngu.name}>
                        <th>{ngu.name}</th>
                        <td>
                          <label>
                            <input
                              style={{ width: 100, margin: 5 }}
                              type="number"
                              step="any"
                              value={stats[pos].normal}
                              onFocus={NGUComponent.handleFocus}
                              onChange={(e) => this.handleChange(e, 'normal', pos, isMagic)}
                            />
                          </label>
                        </td>
                        <td>
                          <label>
                            <input
                              style={{ width: 100, margin: 5 }}
                              type="number"
                              step="any"
                              value={stats[pos].evil}
                              onFocus={NGUComponent.handleFocus}
                              onChange={(e) => this.handleChange(e, 'evil', pos, isMagic)}
                            />
                          </label>
                        </td>
                        <td>
                          <label>
                            <input
                              style={{ width: 100, margin: 5 }}
                              type="number"
                              step="any"
                              value={stats[pos].sadistic}
                              onFocus={NGUComponent.handleFocus}
                              onChange={(e) => this.handleChange(e, 'sadistic', pos, isMagic)}
                            />
                          </label>
                        </td>
                        <td>{`×${shorten(bonus * 100)}%`}</td>
                        <td>
                          {shorten(reachable.level.normal)}
                          {` (×${shorten(reachable.bonus.normal / bonus, 4)})`}
                        </td>
                        <td>
                          {shorten(reachable.level.evil)}
                          {` (×${shorten(reachable.bonus.evil / bonus, 4)})`}
                        </td>
                        <td>
                          {shorten(reachable.level.sadistic)}
                          {`(×${shorten(reachable.bonus.sadistic / bonus, 4)})`}
                        </td>
                      </tr>
                    );
                  });
                })
              }
            </tbody>
          </table>
        </form>
      </div>
    );
  }
}


const stat = PropTypes.shape({
  cap: PropTypes.number,
  nguspeed: PropTypes.number,
});


NGUComponent.propTypes = {
  handleSettings: PropTypes.func.isRequired,
  ngustats: PropTypes.shape({
    nguoption: PropTypes.number,
    ngutime: PropTypes.number,
    quirk: PropTypes.shape({
      e2n: PropTypes.bool,
      s2e: PropTypes.bool,
    }),
    energy: stat,
    magic: stat,
  }).isRequired,
};


export default NGUComponent;
