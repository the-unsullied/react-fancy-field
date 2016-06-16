//comment
/**
Component that stands in as styled input
@class Fancy Button Component
@param {String} name name of input
@param {String} type type of input (text, number, etc..)
@param {Integer} triggerValidation updating counter to trigger validation
@param {String} label label of input
@param {String} placeholder placeholder of input
@param {Method || Array} validator If falsy, field is valid. If is string, field is *invalid* and string will be error message. If validator is an Array, it will iterate over all validators in array and display all messages.
@param {Method} onChange method that is called on change
@param {String} tooltip shows a tooltip to left of input value.
@param {Boolean} required shows that input is required
@param {Boolean} readOnly disabled state, but does not look disabled. Will look like its editable.
*/

import React from 'react';
import classnames from 'classnames';

export default React.createClass({
  getDefaultProps: function() {
    return {
      name: '',
      type: 'text',
      triggerValidation: 0,
      label: '',
      disabled: false,
      placeholder: '',
      validator: null,
      classes: '',
      onChange: () => {},
      tooltip: null,
      required: false,
      readOnly: false
    };
  },

  propTypes: {
    name: React.PropTypes.string,
    type: React.PropTypes.string,
    triggerValidation: React.PropTypes.number,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    validator: React.PropTypes.any,
    classes: React.PropTypes.string,
    onChange: React.PropTypes.func,
    tooltip: React.PropTypes.string,
    required: React.PropTypes.bool,
    readOnly: React.PropTypes.bool
  },

  getInitialState() {
    const { value } = this.props;
    let stateVal = isNaN(parseFloat(value)) && !value ? '' : value;
    return {
      value: stateVal,
      hasAttemptedInput: false,
      isValid: true,
      errorMessage: ''
    };
  },

  componentWillMount() {
    this.initValidation(this.state.value);
  },

  componentWillUpdate(nextProps) {
    if(this.props.triggerValidation !== nextProps.triggerValidation) {
      this.initValidation(this.state.value, true);
    }
  },

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value || '' });
  },

  handleChange(e) {
    const { value } = e.target;
    const { validator } = this.props;
    this.setState({ value });
    if(this.state.hasAttemptedInput || !validator) {
      if(validator) {
        this.validate(value);
      }
    }
    if(typeof this.props.onChange === 'function') {
      this.props.onChange(value, this.props.name);
    }
  },

  handleBlur(e) {
    this.initValidation(e.target.value);
  },

  handleEnterKeypress(e) {
    if(e.keyCode == 13){
      this.initValidation(e.target.value);
    }
  },

  initValidation(value, forceValidation = false) {
    const hasAttemptedInput = value && value.length || forceValidation;
    const { validator } = this.props;
    if(hasAttemptedInput) {
      if(typeof validator === 'function' || Array.isArray(validator)) {
        this.validate(value);
      }

      this.setState({ hasAttemptedInput, value });

      if(typeof this.props.onChange === 'function') {
        this.props.onChange(value, this.props.name);
      }
    }
  },

  validate(value) {
    const { validator } = this.props;
    let errorMessage = null;
    if(Array.isArray(validator)) {
      errorMessage = validator.reduce((error, _validator) => _validator(value) ? `${_validator(value)} ${error}` : `${error}` , '');
    } else {
      errorMessage = validator(value, this.props.name);
    }
    errorMessage = errorMessage === '' ? null : errorMessage;
    const isValid = typeof errorMessage !== 'string';
    this.setState({ isValid, errorMessage });
  },

  render() {
    const { value,
      hasAttemptedInput,
      errorMessage,
      isValid } = this.state;
    const { tooltip,
      name,
      disabled,
      placeholder,
      label,
      type,
      classes,
      required,
      readOnly } = this.props;
    const shouldShowError = hasAttemptedInput && !isValid;

    const fancyFieldClasses = classnames('fancy-field', classes,
      {
        'fancy-field--has-content': value.toString().length || hasAttemptedInput,
        'has-tooltip': !!tooltip,
        'required': required && !readOnly && !disabled,
        'read-only': readOnly
      });
    return <div className={fancyFieldClasses}>
      {/*http://stackoverflow.com/questions/15738259/disabling-chrome-autofill*/}
      { !!tooltip ? <span className='fancy-field__tooltip simptip-position-right simptip-multiline' data-tooltip={tooltip}>
        <i className='unsullied-icon-help'></i>
      </span> : null }
      <input autoComplete="new-password"
             className={classnames('full-width', 'fancy-field__input', {'fancy-field__input--error': shouldShowError})}
             name={name}
             ref='fancyField'
             value={value}
             disabled={disabled || readOnly}
             type={type || 'text'}
             placeholder={placeholder}
             onChange={this.handleChange}
             onBlur={this.handleBlur}
             onKeyDown={this.handleEnterKeypress} />
      <div className={classnames("fancy-field__label", {'fancy-field__label--error': shouldShowError})}>
       {shouldShowError ? <span>{errorMessage}</span> : <span>{label}</span>}
      </div>
    </div>
  }
});
