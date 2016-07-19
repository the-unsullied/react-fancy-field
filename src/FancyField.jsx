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
@param {Boolean} isEditable will make field look editable by giving the border a blue underline.
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
      value: null,
      classes: '',
      onChange: () => {},
      tooltip: null,
      required: false,
      readOnly: false,
      isEditable: false
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
    value: React.PropTypes.any,
    classes: React.PropTypes.string,
    onChange: React.PropTypes.func,
    tooltip: React.PropTypes.string,
    required: React.PropTypes.bool,
    readOnly: React.PropTypes.bool,
    isEditable: React.PropTypes.bool
  },

  getInitialState() {
    const { value } = this.props;
    let stateVal = isNaN(parseFloat(value)) && !value ? '' : value;
    return {
      value: stateVal,
      hasAttemptedInput: false,
      errorMessage: '',
      shouldShowError: false
    };
  },

  componentWillMount() {
    this.validate(this.state.value);
  },

  componentWillReceiveProps(nextProps) {
    const shouldShowError = this.state.shouldShowError || this.props.triggerValidation !== nextProps.triggerValidation;
    if(this.props.value !== nextProps.value || shouldShowError) {
      const nextVal = nextProps.value;
      let value = this.valueIsValue(nextVal) ? nextVal : '';
      this.validate(value, shouldShowError);
    }
  },

  handleChange(e) {
    let { value } = e.target;
    if(this.props.type === 'number') {
      value = value.replace(/[^0-9\.]+/g,'');
    }
    this.props.onChange(value, this.props.name);
  },

  handleBlur(e) {
    const { onBlur } = this.props;
    this.handleUserAction(e, onBlur);
  },

  handleEnterKeypress(e) {
    if(e.keyCode == 13 && typeof this.props.onChange === 'function') {
      this.handleUserAction(e);
    }
  },

  valueIsValue(value) {
    // must be a value other than null or undefined, but can be 0
    return value !== null && value !== undefined && value.toString().length > 0;
  },

  handleUserAction(e, onBlur) {
    const { name } = this.props;
    const value = e.target.value || '';
    if(onBlur) {
      onBlur(value, name);
    } else {
      this.props.onChange(value, name);
    }
    if(!this.state.shouldShowError) {
      this.setState({ shouldShowError: true });
    }
  },

  valueIsValue(value) {
    // must be a value other than null or undefined, but can be 0
    return value !== null && value !== undefined && value.toString().length > 0;
  },

  validate(value, shouldShowError = false) {
    const hasAttemptedInput = this.state.hasAttemptedInput || this.valueIsValue(value) || shouldShowError;
    const { validator } = this.props;
    if(hasAttemptedInput) {
      this.setErrorMessage(value, shouldShowError);
      this.setState({ hasAttemptedInput, value });
    }
  },

  setErrorMessage(value, shouldShowError) {
    let { validator, name } = this.props;

    if(!validator) { return }
    validator = Array.isArray(validator) ? validator : [validator];
    const errorMessage = validator.reduce((error, _validator) => {
      const message = _validator(value, name);
      return message ? `${message} ${error}` : `${error}` ;
    }, '');
    shouldShowError = shouldShowError || this.state.shouldShowError;
    this.setState({ errorMessage, shouldShowError });
  },

  render() {
    const { value,
      hasAttemptedInput,
      errorMessage } = this.state;
    let { shouldShowError } = this.state;

    const { tooltip,
      name,
      disabled,
      placeholder,
      label,
      classes,
      required,
      readOnly,
      isEditable } = this.props;
    let { type } = this.props;
    type = !type || type === 'number' ? 'text' : type;

    shouldShowError = shouldShowError && !!errorMessage.length && !disabled;

    const fancyFieldClasses = classnames('fancy-field', classes,
      {
        'fancy-field--has-content': hasAttemptedInput,
        'has-tooltip': !!tooltip,
        'required': required && !readOnly && !disabled,
        'read-only': readOnly,
        'is-editable': isEditable
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
             type={type}
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
