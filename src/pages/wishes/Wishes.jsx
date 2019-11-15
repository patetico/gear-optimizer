import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';

import { Wish } from '../../Wish';
import { Wishes } from '../../assets/ItemAux';
import ResourcePriorityForm from '../../components/ResourcePriorityForm/ResourcePriorityForm';
import WishForm from '../../components/WishForm/WishForm';
import Crement from '../../components/Crement/Crement';


class WishComponent extends Component {
  static handleFocus(event) {
    event.target.select();
  }

  static handleSubmit(event) {
    event.preventDefault();
  }

  static wishtime(data) {
    if (data.wishtime < (data.goal - data.start) * data.wishcap) {
      return (data.goal - data.start) * data.wishcap;
    }
    return data.wishtime;
  }

  static goallevel(data) {
    const goal = Number(data.goal);
    if (goal < 1) return 0;
    return Math.min(goal, Wishes[data.wishidx][2]);
  }

  static startlevel(data) {
    const start = Number(data.start);
    if (start < 0 || data.goal === 0) return 0;
    return start >= data.goal ? data.goal - 1 : data.start;
  }

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, name, idx = -1) {
    const { handleSettings, wishstats } = this.props;

    const val = event.target.value;
    const newWishstats = { ...wishstats };

    if (idx < 0) {
      newWishstats[name] = val;
      handleSettings('wishstats', newWishstats);
      return;
    }

    const wishes = [...newWishstats.wishes];
    const wish = {
      ...wishes[idx],
      [name]: val,
    };

    wish.goal = WishComponent.goallevel(wish);
    wish.start = WishComponent.startlevel(wish);
    wishes[idx] = wish;

    newWishstats.wishes = wishes;
    handleSettings('wishstats', newWishstats);
  }

  render() {
    ReactGA.pageview('/wishes/');
    const { handleCrement, wishstats } = this.props;
    const wish = new Wish(wishstats);
    const results = wish.optimize();
    const score = results[0];
    const assignments = results[1];
    const remaining = results[2];
    return (
      <div className="center">
        <form onSubmit={this.handleSubmit}>
          <div>
            {
              ['eE', 'mM', 'rR'].map((x) => (
                <div key={x}>
                  <label>
                    {`${x[1]} power`}
                    <input
                      style={{ width: 100, margin: 5 }}
                      type="number"
                      step="any"
                      value={wishstats[`${x[0]}pow`]}
                      onFocus={WishComponent.handleFocus}
                      onChange={(e) => this.handleChange(e, `${x[0]}pow`)}
                    />
                  </label>
                  <label>
                    cap
                    <input
                      style={{ width: 100, margin: 5 }}
                      type="number"
                      step="any"
                      value={wishstats[`${x[0]}cap`]}
                      onFocus={WishComponent.handleFocus}
                      onChange={(e) => this.handleChange(e, `${x[0]}cap`)}
                    />
                  </label>
                </div>
              ))
            }
          </div>
          <label>
            Wish speed modifier:
            <input
              style={{ width: 60, margin: 5 }}
              type="number"
              step="any"
              value={wishstats.wishspeed}
              onFocus={WishComponent.handleFocus}
              onChange={(e) => this.handleChange(e, 'wishspeed')}
            />
          </label>
          <br />
          <label>
            Minimal wish time:
            <input
              style={{ width: 60, margin: 5 }}
              type="number"
              step="any"
              value={wishstats.wishcap}
              onFocus={WishComponent.handleFocus}
              onChange={(e) => this.handleChange(e, 'wishcap')}
            />
            minutes
          </label>
          <br />
          {'Resource spending order: '}
          {<ResourcePriorityForm {...this.props} handleChange={this.handleChange} />}
          <div>
            <Crement
              header="Wish slots"
              value={wishstats.wishes.length}
              name="wishslots"
              handleClick={handleCrement}
              min={1}
              max={100}
            />
          </div>
          <br />
          {
            wishstats.wishes.map((wish_, pos) => (
              <div key={wish_.wishidx}>
                {
                  [Wishes.keys()].map(() => (
                    <div
                      style={{
                        display: 'inline',
                      }}
                      key={`wishform${wish_.wishidx}`}
                    >
                      <WishForm
                        {...this.props}
                        handleChange={this.handleChange}
                        wishidx={wish_.wishidx}
                        idx={pos}
                      />
                    </div>
                  ))
                }
                <br />
                <label>
                  Start level:
                  <input
                    style={{ width: 30, margin: 5 }}
                    type="number"
                    step="any"
                    value={wishstats.wishes[pos].start}
                    onFocus={WishComponent.handleFocus}
                    onChange={(e) => this.handleChange(e, 'start', pos)}
                  />
                </label>
                <label>
                  Target level:
                  <input
                    style={{ width: 30, margin: 5 }}
                    type="number"
                    step="any"
                    value={wishstats.wishes[pos].goal}
                    onFocus={WishComponent.handleFocus}
                    onChange={(e) => this.handleChange(e, 'goal', pos)}
                  />
                </label>
              </div>
            ))
          }
          <br />
          {
            assignments.map((a, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={idx}>
                {`Wish ${wishstats.wishes[idx].wishidx} requires: ${a}`}
              </div>
            ))
          }
          <br />
          {`After ${score} all targets will be reached.`}
          <br />
          <br />
          {`Spare resources: ${remaining}`}
        </form>
      </div>
    );
  }
}


WishComponent.propTypes = {
  handleSettings: PropTypes.func.isRequired,
  handleCrement: PropTypes.func.isRequired,
  wishstats: PropTypes.shape({
    wishspeed: PropTypes.number,
    wishcap: PropTypes.number,
    wishes: PropTypes.arrayOf(PropTypes.shape({
      wishidx: PropTypes.number,
      start: PropTypes.number,
      goal: PropTypes.number,
    })),
  }).isRequired,
};


export default WishComponent;
