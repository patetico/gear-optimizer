import React from 'react';
import PropTypes from 'prop-types';

import { Factors } from '../../assets/ItemAux';
import Crement from '../Crement/Crement';


class ItemForm extends React.Component {
  constructor(props) {
    super(props);
    const { factors, idx } = this.props;

    this.state = {
      value: Factors[factors[idx]][0],
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    const { handleEditFactor, idx } = this.props;
    handleEditFactor(
      idx,
      Object.getOwnPropertyNames(Factors)
        .filter((factor) => (Factors[factor][0] === event.target.value))[0],
    );
  }

  render() {
    const {
      factors, equip, handleCrement, maxslots, idx,
    } = this.props;
    const { value } = this.state;

    const factor = Factors[factors[idx]];
    // HACK: this sets the dropdown to the correct value after loading
    if (value !== factor[0]) {
      this.setState({ value: factor[0] });
    }
    const accslots = equip.accessory.length;
    return (
      <label key={factors[idx]}>
        {'Priority '}
        {Number(idx) + 1}
        {': '}
        <select value={value} onChange={this.handleChange}>
          {Object.getOwnPropertyNames(Factors)
            .map((f) => Factors[f][0])
            .map((f) => (
              <option value={f} key={f}>{f}</option>
            ))}
        </select>
        <Crement
          header="slots"
          value={maxslots[idx]}
          name={['maxslots', idx]}
          handleClick={handleCrement}
          min={0}
          max={accslots}
        />
      </label>
    );
  }
}


ItemForm.propTypes = {
  equip: PropTypes.shape({
    accessory: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  factors: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleCrement: PropTypes.func.isRequired,
  handleEditFactor: PropTypes.func.isRequired,
  idx: PropTypes.number.isRequired,
  maxslots: PropTypes.arrayOf(PropTypes.number).isRequired,
};


export default ItemForm;
