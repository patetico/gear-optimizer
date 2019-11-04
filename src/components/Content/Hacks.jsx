import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';

import { Hack } from '../../Hack';
import { Hacks } from '../../assets/ItemAux';
import { shorten, toTime } from '../../util';


class HackComponent extends Component {
  static handleFocus(event) {
    event.target.select();
  }

  static handleSubmit(event) {
    event.preventDefault();
  }

  static level(level, idx) {
    const lvl = Number(level);

    if (lvl <= 0) return lvl;
    return Math.min(lvl, Hacks[idx][5]);
  }

  static startlevel(data) {
    const lvl = Number(data.level);

    if (lvl <= 0) return 0;
    return Math.min(lvl, Hacks[data.hackidx][5]);
  }

  static reducer(data) {
    const dataReducer = Number(data.reducer);

    if (dataReducer < 1) return 0;
    return Math.min(dataReducer, Hacks[data.hackidx][4] - 2);
  }

  constructor(props) {
    super(props);
    const { hackstats } = this.props;
    this.state = {
      hackoption: hackstats.hackoption,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, name, idx = -1) {
    const val = event.target.value;
    const { hackstats, handleSettings } = this.props;
    let newHackstats = { ...hackstats };
    if (idx < 0) {
      newHackstats = {
        ...newHackstats,
        [name]: val,
      };
      handleSettings('hackstats', { ...newHackstats, [name]: val });
      return;
    }
    const hacks = [...newHackstats.hacks];
    let hack;
    if (name === 'msup' || name === 'msdown') {
      let { goal } = hacks[idx];
      const { reducer } = hacks[idx];
      const msgap = Hacks[idx][4] - reducer;
      goal /= msgap;
      goal += name === 'msup'
        ? 1
        : -1;
      goal = name === 'msup'
        ? Math.floor(goal)
        : Math.ceil(goal);
      goal *= msgap;
      hack = {
        ...hacks[idx],
        goal,
      };
    } else {
      hack = {
        ...hacks[idx],
        [name]: val,
      };
    }
    hack.goal = HackComponent.level(hack.goal, idx);
    hack.level = HackComponent.level(hack.level, idx);
    hack.reducer = HackComponent.reducer(hack);
    hacks[idx] = hack;
    newHackstats = {
      ...newHackstats,
      hacks,
    };
    handleSettings('hackstats', newHackstats);
  }

  render() {
    const { hackstats } = this.props;
    const { hackoption } = this.state;

    ReactGA.pageview('/hacks/');

    const hackOptimizer = new Hack(hackstats);
    const { hacktime } = hackstats;
    const optionLabels = [
      'level target.',
      `max level in ${toTime(hacktime * 60 * 50)}`,
      `max MS in ${toTime(hacktime * 60 * 50)}`,
    ];
    const option = hackstats.hackoption;
    const classTarget = option === '0' ? '' : 'hide';
    const classLevel = option === '1' ? '' : 'hide';
    const classMS = option === '2' ? '' : 'hide';

    let sumtime = 0;
    let hackhacktime = 0;
    let hackhackchange = 1;

    // HACK: this sets the dropdown to the correct value after loading
    if (hackoption !== hackstats.hackoption) {
      this.setState({ hackoption: hackstats.hackoption });
    }

    return (
      <div className="center">
        <form onSubmit={HackComponent.handleSubmit}>
          <table className="center">
            <tbody>
              <tr>
                <td>R power</td>
                <td>
                  <label>
                    <input
                      style={{ width: 100, margin: 5 }}
                      type="number"
                      step="any"
                      value={hackstats.rpow}
                      onFocus={HackComponent.handleFocus}
                      onChange={(e) => this.handleChange(e, 'rpow')}
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>R cap</td>
                <td>
                  <label>
                    <input
                      style={{ width: 100, margin: 5 }}
                      type="number"
                      step="any"
                      value={hackstats.rcap}
                      onFocus={HackComponent.handleFocus}
                      onChange={(e) => this.handleChange(e, 'rcap')}
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>Hack speed</td>
                <td>
                  <label>
                    <input
                      style={{ width: 100, margin: 5 }}
                      type="number"
                      step="any"
                      value={hackstats.hackspeed}
                      onFocus={HackComponent.handleFocus}
                      onChange={(e) => this.handleChange(e, 'hackspeed')}
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>Hack time (minutes)</td>
                <td>
                  <label>
                    <input
                      style={{ width: 100, margin: 5 }}
                      type="number"
                      step="any"
                      value={hacktime}
                      onFocus={HackComponent.handleFocus}
                      onChange={(e) => this.handleChange(e, 'hacktime')}
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>Hack Optimizer Mode</td>
                <td>
                  <label key="hackoption">
                    <select value={hackoption} onChange={(e) => this.handleChange(e, 'hackoption')}>
                      {
                        [0, 1, 2].map((opt) => (
                          <option value={opt} key={opt}>
                            {optionLabels[opt]}
                          </option>
                        ))
                      }
                    </select>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
          <table className="center">
            <tbody>
              <tr>
                <th>Hack</th>
                <th>
                  Milestone
                  <br />
                  Reducers
                </th>
                <th>Level</th>
                <th>Bonus</th>
                <th className={classTarget}>Target</th>
                <th className={classLevel}>
                  Max Level
                  <br />
                  in
                  {hacktime}
                  min
                </th>
                <th className={classMS}>
                  Max MS
                  <br />
                  in
                  {hacktime}
                  min
                </th>
                <th>MS</th>
                <th>Time</th>
                <th>Bonus</th>
                <th>Change</th>
                <th>Next Level</th>
                <th className={classTarget}>
                  Next Level
                  <br />
                  After Target
                </th>
                <th className={classLevel}>
                  Next Level
                  <br />
                  After Max Level
                </th>
                <th className={classMS}>
                  Next Level
                  <br />
                  After Max MS
                </th>
              </tr>
              {
                Hacks.map((hack, pos) => {
                  const { hackstats: hackstats1 } = this.props;
                  const { reducer } = hackstats1.hacks[pos];
                  const { level } = hackstats1.hacks[pos];
                  const currBonus = hackOptimizer.bonus(level, pos);
                  let target = 0;

                  if (option === '0') {
                    target = hackstats1.hacks[pos].goal;
                  } else {
                    target = hackOptimizer.reachable(level, hacktime, pos);
                    if (option === '2') {
                      target = hackOptimizer.milestoneLevel(target, pos);
                    }
                  }

                  const bonus = target > level ? hackOptimizer.bonus(target, pos) : currBonus;
                  const time = hackOptimizer.time(level, target, pos);
                  const timePastLevel = hackOptimizer.time(level, level + 1, pos);
                  const timePastTarget = hackOptimizer.time(level, target + 1, pos)
                    - hackOptimizer.time(level, target, pos);
                  let mschange = target > level
                    ? hackOptimizer.milestones(target, pos) - hackOptimizer.milestones(level, pos)
                    : 0;

                  mschange = `+${mschange}`;
                  sumtime += time;
                  const change = bonus / currBonus;

                  if (pos === 13) {
                    hackhacktime = time;
                    hackhackchange = change < 1
                      ? 1
                      : change;
                  }

                  return (
                    <tr key={hack[0]}>
                      <td>{hack[0]}</td>
                      <td>
                        <label>
                          <input
                            style={{ width: 40, margin: 5 }}
                            type="number"
                            step="any"
                            value={reducer}
                            onFocus={HackComponent.handleFocus}
                            onChange={(e) => this.handleChange(e, 'reducer', pos)}
                          />
                        </label>
                      </td>
                      <td>
                        <label>
                          <input
                            style={{ width: 60, margin: 5 }}
                            type="number"
                            step="any"
                            value={level}
                            onFocus={HackComponent.handleFocus}
                            onChange={(e) => this.handleChange(e, 'level', pos)}
                          />
                        </label>
                      </td>
                      <td>
                        {shorten(currBonus, 2)}
                        %
                      </td>
                      <td className={classTarget}>
                        <label>
                          <input
                            style={{ width: 60, margin: 5 }}
                            type="number"
                            step="any"
                            value={target}
                            onFocus={HackComponent.handleFocus}
                            onChange={(e) => this.handleChange(e, 'goal', pos)}
                          />
                        </label>
                        <button type="button" onClick={(e) => this.handleChange(e, 'msdown', pos)}>
                          -
                        </button>
                        <button type="button" onClick={(e) => this.handleChange(e, 'msup', pos)}>
                          +
                        </button>
                      </td>
                      <td className={classLevel}>{target}</td>
                      <td className={classMS}>{target}</td>
                      <td>{mschange}</td>
                      <td>{toTime(time)}</td>
                      <td>
                        {shorten(bonus, 2)}
                        %
                      </td>
                      <td>
                        ×
                        {shorten(change, 3)}
                      </td>
                      <td>{toTime(timePastLevel)}</td>
                      <td>{toTime(timePastTarget)}</td>
                    </tr>
                  );
                })
              }
              <tr>
                <td colSpan={6} />
                <th className={classTarget}>
                  Min total:
                  <br />
                  {`${toTime((sumtime - hackhacktime) / hackhackchange + hackhacktime)}`}
                </th>
              </tr>
              <tr>
                <td colSpan={6} />
                <th className={classTarget}>
                  Max total:
                  <br />
                  {`${toTime(sumtime)}`}
                </th>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
}


HackComponent.propTypes = {
  hackstats: PropTypes.shape({
    hackoption: PropTypes.string,
    hacktime: PropTypes.number,
    rpow: PropTypes.number,
    rcap: PropTypes.number,
    hackspeed: PropTypes.number,
  }).isRequired,
  handleSettings: PropTypes.func.isRequired,
};


export default HackComponent;
