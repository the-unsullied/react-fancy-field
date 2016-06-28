'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _React$createClass;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } //comment
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

exports.default = _react2.default.createClass((_React$createClass = {
  getDefaultProps: function getDefaultProps() {
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
    value: _react2.default.PropTypes.any,
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
      errorMessage: '',
      shouldShowError: false
    };
  },
  componentWillMount: function componentWillMount() {
    this.validate(this.state.value);
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var shouldShowError = this.state.shouldShowError || this.props.triggerValidation !== nextProps.triggerValidation;
    if (this.props.value !== nextProps.value || shouldShowError) {
      var nextVal = nextProps.value;
      var value = this.valueIsValue(nextVal) ? nextVal : '';
      this.validate(value, shouldShowError);
    }
  },
  handleChange: function handleChange(e) {
    var value = e.target.value;

    if (this.props.type === 'number') {
      value = value.replace(/[^0-9\.]+/g, '');
    }
    this.props.onChange(value, this.props.name);
  },
  handleBlur: function handleBlur(e) {
    var onBlur = this.props.onBlur;

    this.handleUserAction(e, onBlur);
  },
  handleEnterKeypress: function handleEnterKeypress(e) {
    if (e.keyCode == 13 && typeof this.props.onChange === 'function') {
      this.handleUserAction(e);
    }
  },
  valueIsValue: function valueIsValue(value) {
    // must be a value other than null or undefined, but can be 0
    return value !== null && value !== undefined && value.toString().length > 0;
  },
  handleUserAction: function handleUserAction(e, onBlur) {
    var name = this.props.name;

    var value = e.target.value || '';
    if (onBlur) {
      onBlur(value, name);
    } else {
      this.props.onChange(value, name);
    }
    if (!this.state.shouldShowError) {
      this.setState({ shouldShowError: true });
    }
  }
}, _defineProperty(_React$createClass, 'valueIsValue', function valueIsValue(value) {
  // must be a value other than null or undefined, but can be 0
  return value !== null && value !== undefined && value.toString().length > 0;
}), _defineProperty(_React$createClass, 'validate', function validate(value) {
  var shouldShowError = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var hasAttemptedInput = this.state.hasAttemptedInput || this.valueIsValue(value) || shouldShowError;
  var validator = this.props.validator;

  if (hasAttemptedInput) {
    this.setErrorMessage(value, shouldShowError);
    this.setState({ hasAttemptedInput: hasAttemptedInput, value: value });
  }
}), _defineProperty(_React$createClass, 'setErrorMessage', function setErrorMessage(value, shouldShowError) {
  var _props = this.props;
  var validator = _props.validator;
  var name = _props.name;


  if (!validator) {
    return;
  }
  validator = Array.isArray(validator) ? validator : [validator];
  var errorMessage = validator.reduce(function (error, _validator) {
    var message = _validator(value, name);
    return message ? message + ' ' + error : '' + error;
  }, '');
  shouldShowError = shouldShowError || this.state.shouldShowError;
  this.setState({ errorMessage: errorMessage, shouldShowError: shouldShowError });
}), _defineProperty(_React$createClass, 'render', function render() {
  var _state = this.state;
  var value = _state.value;
  var hasAttemptedInput = _state.hasAttemptedInput;
  var errorMessage = _state.errorMessage;
  var shouldShowError = this.state.shouldShowError;
  var _props2 = this.props;
  var tooltip = _props2.tooltip;
  var name = _props2.name;
  var disabled = _props2.disabled;
  var placeholder = _props2.placeholder;
  var label = _props2.label;
  var classes = _props2.classes;
  var required = _props2.required;
  var readOnly = _props2.readOnly;
  var isEditable = _props2.isEditable;
  var type = this.props.type;

  type = !type || type === 'number' ? 'text' : type;

  shouldShowError = shouldShowError && !!errorMessage.length;

  var fancyFieldClasses = (0, _classnames2.default)('fancy-field', classes, {
    'fancy-field--has-content': hasAttemptedInput,
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
      type: type,
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
}), _React$createClass));
module.exports = exports['default'];
