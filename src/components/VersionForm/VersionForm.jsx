import React from 'react';
import PropTypes from 'prop-types';


class VersionForm extends React.Component {
  constructor(props) {
    super(props);
    const { version } = this.props;

    this.state = {
      value: version,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { handleChange } = this.props;

    this.setState({ value: event.target.value });
    handleChange(event, 'version');
  }

  render() {
    const { augstats } = this.props;
    const { value } = this.state;


    // HACK: this sets the dropdown to the correct value after loading
    if (value !== augstats.version) {
      /* eslint-disable-next-line react/no-direct-mutation-state */
      this.state.value = augstats.version;
    }
    const versionNames = ['normal', 'evil', 'sadistic'];
    return (
      <label>
        <select value={value} onChange={this.handleChange}>
          {versionNames.map((name, idx) => (<option value={idx} key={name}>{name}</option>))}
        </select>
      </label>
    );
  }
}

VersionForm.propTypes = {
  version: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  augstats: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default VersionForm;
