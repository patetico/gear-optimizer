import React from 'react';
import PropTypes from 'prop-types';

import { Wishes } from '../../assets/ItemAux';


class WishForm extends React.Component {
  constructor(props) {
    super(props);
    const { wishidx } = this.props;
    this.state = {
      value: wishidx,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { handleChange, idx } = this.props;

    this.setState({ value: event.target.value });
    handleChange(event, 'wishidx', idx);
  }

  render() {
    const { value } = this.state;
    const { wishidx, idx: idx1 } = this.props;

    // HACK: this sets the dropdown to the correct value after loading
    if (value !== wishidx) {
      this.setState({ value: wishidx });
    }

    return (
      <label key={idx1}>
        Wish
        <select value={value} onChange={this.handleChange}>
          {Wishes.map(([wish], i) => (<option value={i} key={wish}>{`${i}: ${wish}`}</option>))}
        </select>
      </label>
    );
  }
}

WishForm.propTypes = {
  idx: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
  wishidx: PropTypes.number.isRequired,
};

export default WishForm;
