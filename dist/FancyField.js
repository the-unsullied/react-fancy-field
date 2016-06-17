'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

exports.default = _react2.default.createClass({
  getDefaultProps: function getDefaultProps() {
    return {
      name: '',
      type: 'text',
      triggerValidation: 0,
      label: '',
      disabled: false,
      placeholder: '',
      validator: null,
      classes: '',
      onChange: function onChange() {},
      tooltip: null,
      required: false,
      readOnly: false,
      isEditable: false
    };
  },

  propTypes: {
    name: _react2.default.PropTypes.string,
    type: _react2.default.PropTypes.string,
    triggerValidation: _react2.default.PropTypes.number,
    label: _react2.default.PropTypes.string,
    placeholder: _react2.default.PropTypes.string,
    disabled: _react2.default.PropTypes.bool,
    validator: _react2.default.PropTypes.any,
    classes: _react2.default.PropTypes.string,
    onChange: _react2.default.PropTypes.func,
    tooltip: _react2.default.PropTypes.string,
    required: _react2.default.PropTypes.bool,
    readOnly: _react2.default.PropTypes.bool,
    isEditable: _react2.default.PropTypes.bool
  },

  getInitialState: function getInitialState() {
    var value = this.props.value;

    var stateVal = isNaN(parseFloat(value)) && !value ? '' : value;
    return {
      value: stateVal,
      hasAttemptedInput: false,
      isValid: true,
      errorMessage: ''
    };
  },
  componentWillMount: function componentWillMount() {
    this.initValidation(this.state.value);
  },
  componentWillUpdate: function componentWillUpdate(nextProps) {
    if (this.props.triggerValidation !== nextProps.triggerValidation) {
      this.initValidation(this.state.value, true);
    }
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value || '' });
  },
  handleChange: function handleChange(e) {
    var value = e.target.value;
    var validator = this.props.validator;

    this.setState({ value: value });
    if (this.state.hasAttemptedInput || !validator) {
      if (validator) {
        this.validate(value);
      }
    }
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(value, this.props.name);
    }
  },
  handleBlur: function handleBlur(e) {
    this.initValidation(e.target.value);
  },
  handleEnterKeypress: function handleEnterKeypress(e) {
    if (e.keyCode == 13) {
      this.initValidation(e.target.value);
    }
  },
  initValidation: function initValidation(value) {
    var forceValidation = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var hasAttemptedInput = value && value.length || forceValidation;
    var validator = this.props.validator;

    if (hasAttemptedInput) {
      if (typeof validator === 'function' || Array.isArray(validator)) {
        this.validate(value);
      }

      this.setState({ hasAttemptedInput: hasAttemptedInput, value: value });

      if (typeof this.props.onChange === 'function') {
        this.props.onChange(value, this.props.name);
      }
    }
  },
  validate: function validate(value) {
    var validator = this.props.validator;

    var errorMessage = null;
    if (Array.isArray(validator)) {
      errorMessage = validator.reduce(function (error, _validator) {
        return _validator(value) ? _validator(value) + ' ' + error : '' + error;
      }, '');
    } else {
      errorMessage = validator(value, this.props.name);
    }
    errorMessage = errorMessage === '' ? null : errorMessage;
    var isValid = typeof errorMessage !== 'string';
    this.setState({ isValid: isValid, errorMessage: errorMessage });
  },
  render: function render() {
    var _state = this.state;
    var value = _state.value;
    var hasAttemptedInput = _state.hasAttemptedInput;
    var errorMessage = _state.errorMessage;
    var isValid = _state.isValid;
    var _props = this.props;
    var tooltip = _props.tooltip;
    var name = _props.name;
    var disabled = _props.disabled;
    var placeholder = _props.placeholder;
    var label = _props.label;
    var type = _props.type;
    var classes = _props.classes;
    var required = _props.required;
    var readOnly = _props.readOnly;
    var isEditable = _props.isEditable;

    var shouldShowError = hasAttemptedInput && !isValid;

    var fancyFieldClasses = (0, _classnames2.default)('fancy-field', classes, {
      'fancy-field--has-content': value.toString().length || hasAttemptedInput,
      'has-tooltip': !!tooltip,
      'required': required && !readOnly && !disabled,
      'read-only': readOnly,
      'is-editable': isEditable
    });
    return _react2.default.createElement(
      'div',
      { className: fancyFieldClasses },
      !!tooltip ? _react2.default.createElement(
        'span',
        { className: 'fancy-field__tooltip simptip-position-right simptip-multiline', 'data-tooltip': tooltip },
        _react2.default.createElement('i', { className: 'unsullied-icon-help' })
      ) : null,
      _react2.default.createElement('input', { autoComplete: 'new-password',
        className: (0, _classnames2.default)('full-width', 'fancy-field__input', { 'fancy-field__input--error': shouldShowError }),
        name: name,
        ref: 'fancyField',
        value: value,
        disabled: disabled || readOnly,
        type: type || 'text',
        placeholder: placeholder,
        onChange: this.handleChange,
        onBlur: this.handleBlur,
        onKeyDown: this.handleEnterKeypress }),
      _react2.default.createElement(
        'div',
        { className: (0, _classnames2.default)("fancy-field__label", { 'fancy-field__label--error': shouldShowError }) },
        shouldShowError ? _react2.default.createElement(
          'span',
          null,
          errorMessage
        ) : _react2.default.createElement(
          'span',
          null,
          label
        )
      )
    );
  }
});
module.exports = exports['default'];
