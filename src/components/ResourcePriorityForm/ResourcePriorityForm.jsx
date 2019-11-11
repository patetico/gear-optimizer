import React from 'react';
import PropTypes from 'prop-types';
import { resourcePriorities } from '../../assets/ItemAux';


class ResourcePriorityForm extends React.Component {
  constructor(props) {
    super(props);
    const { rpIndex } = this.props;
    this.state = {
      value: rpIndex,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    const { rpIndex, handleChange } = this.props;
    handleChange(event, 'rpIndex', rpIndex);
  }

  render() {
    const { rpIndex, wishstats } = this.props;
    const { value } = this.state;

    // HACK: this sets the dropdown to the correct value after loading
    if (value !== wishstats.rpIndex) {
      this.setState({ value: wishstats.rpIndex });
    }

    const resourceNames = 'EMR';
    return (
      <label key={rpIndex}>
        <select value={value} onChange={this.handleChange}>
          {resourcePriorities.map((prio, idx) => (
            <option value={idx} key={prio}>
              {prio.map((p) => resourceNames[p]).join(' > ')}
            </option>
          ))}
        </select>
      </label>
    );
  }
}

ResourcePriorityForm.propTypes = {
  handleChange: PropTypes.func.isRequired,
  rpIndex: PropTypes.number.isRequired,
  wishstats: PropTypes.objectOf(PropTypes.any).isRequired,
};


export default ResourcePriorityForm;
