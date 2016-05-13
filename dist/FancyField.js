'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Component that stands in as styled input
@class Fancy Button Component
@param {String} name name of input
@param {String} type type of input (text, number, etc..)
@param {Integer} triggerValidation updating counter to trigger validation
@param {String} label label of input
@param {String} placeholder placeholder of input
@param {String} validator If falsy, field is valid. If is string, field is *invalid* and string will be error message.
@param initialVal initial string or number that is contained in the input field.
@param {Method} onChange method that is called on change
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
      initialVal: '',
      classes: '',
      onChange: function onChange() {}
    };
  },

  propTypes: {
    name: _react2.default.PropTypes.string,
    type: _react2.default.PropTypes.string,
    triggerValidation: _react2.default.PropTypes.number,
    label: _react2.default.PropTypes.string,
    placeholder: _react2.default.PropTypes.string,
    disabled: _react2.default.PropTypes.bool,
    validator: _react2.default.PropTypes.func,
    classes: _react2.default.PropTypes.string,
    initialVal: _react2.default.PropTypes.string,
    onChange: _react2.default.PropTypes.func
  },

  getInitialState: function getInitialState() {
    return {
      value: this.props.initialVal || '',
      hasAttemptedInput: false,
      isValid: false,
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
  initValidation: function initValidation() {
    var value = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var forceValidation = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var hasAttemptedInput = value.length || forceValidation;
    if (hasAttemptedInput) {
      if (typeof this.props.validator === 'function') {
        this.validate(value);
      }

      this.setState({ hasAttemptedInput: hasAttemptedInput, value: value });

      if (typeof this.props.onChange === 'function') {
        this.props.onChange(value, this.props.name);
      }
    }
  },
  validate: function validate(value) {
    var errorMessage = this.props.validator(value, this.props.name);
    var isValid = typeof errorMessage !== 'string';
    if (isValid) {
      this.setState({ isValid: isValid });
    } else {
      this.setState({ isValid: isValid, errorMessage: errorMessage });
    }
  },
  render: function render() {
    var _state = this.state;
    var value = _state.value;
    var hasAttemptedInput = _state.hasAttemptedInput;
    var errorMessage = _state.errorMessage;
    var isValid = _state.isValid;

    var shouldShowError = hasAttemptedInput && !isValid;

    return _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)('fancy-field', this.props.classes, { 'fancy-field--has-content': value.length || hasAttemptedInput }) },
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
          this.props.label
        )
      ),
      _react2.default.createElement('input', { autoComplete: 'new-password',
        className: (0, _classnames2.default)('full-width', 'fancy-field__input', { 'fancy-field__input--error': shouldShowError }),
        name: this.props.name,
        ref: 'fancyField',
        value: value,
        disabled: this.props.disabled,
        type: this.props.type || 'text',
        placeholder: this.props.placeholder,
        onChange: this.handleChange,
        onBlur: this.handleBlur,
        onKeyDown: this.handleEnterKeypress })
    );
  }
});
module.exports = exports['default'];
