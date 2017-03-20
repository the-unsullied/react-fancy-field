'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _React$createClass;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; //comment
/**
Component that stands in as styled input
@class Fancy Button Component
@param {String} name name of input
@param {String} type type of input (text, number, etc..)
@param {Integer} triggerValidation updating counter to trigger validation
@param {Any} label label of input
@param {Any} placeholder placeholder of input
@param {Method || Array} validator If falsy, field is valid. If is string, field is *invalid* and string will be error message. If validator is an Array, it will iterate over all validators in array and display all messages.
@param {Method} onChange method that is called on change
@param {String} tooltip shows a tooltip to left of input value.
@param {Boolean} required shows that input is required
@param {Boolean} readOnly determine if input should be read-only.
@param {Boolean} isEditable will make field look editable by giving the border a blue underline.
@param {Boolean} isIconRight puts icon to right instead of left
@param {Boolean} autoFocus will autofocus on input if true
@param {String} autocomplete name field
@param {JSX} icon any image that should appear to the left of the field
@param {Any|String} tabIndex tabIndex for input field
@param {String} ariaLabel aria-label property on input.
*/

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var fromTypeahead = 'FROM_TYPEAHEAD';

function isImmutable(obj) {
  return obj !== null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === "object" && !!obj.toJSON;
}

exports.default = _react2.default.createClass((_React$createClass = {
  listEl: null,
  fancyFieldEl: null,

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
      isEditable: false,
      icon: null,
      isIconRight: false,
      autoFocus: false,
      autoComplete: null,
      typeaheadOptions: [],
      ariaLabel: '',
      ariaHidden: false,
      tabIndex: ''
    };
  },

  propTypes: {
    name: _react2.default.PropTypes.string,
    type: _react2.default.PropTypes.string,
    triggerValidation: _react2.default.PropTypes.number,
    label: _react2.default.PropTypes.any,
    placeholder: _react2.default.PropTypes.any,
    disabled: _react2.default.PropTypes.bool,
    validator: _react2.default.PropTypes.any,
    value: _react2.default.PropTypes.any,
    classes: _react2.default.PropTypes.string,
    onChange: _react2.default.PropTypes.func,
    tooltip: _react2.default.PropTypes.string,
    required: _react2.default.PropTypes.bool,
    readOnly: _react2.default.PropTypes.bool,
    isEditable: _react2.default.PropTypes.bool,
    icon: _react2.default.PropTypes.any,
    isIconRight: _react2.default.PropTypes.bool,
    autoFocus: _react2.default.PropTypes.bool,
    autoComplete: _react2.default.PropTypes.string,
    typeaheadOptions: _react2.default.PropTypes.any,
    ariaLabel: _react2.default.PropTypes.any,
    ariaHidden: _react2.default.PropTypes.bool,
    tabIndex: _react2.default.PropTypes.string
  },

  getInitialState: function getInitialState() {
    var value = this.props.value;

    var stateVal = isNaN(parseFloat(value)) && !value ? '' : value;
    return {
      value: stateVal,
      hasAttemptedInput: false,
      errorMessage: '',
      shouldShowError: false,
      isFocused: false,
      arrowSelectedTypeaheadOpt: null
    };
  },
  componentWillMount: function componentWillMount() {
    this.validate(this.state.value);
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var _props = this.props;
    var triggerValidation = _props.triggerValidation;
    var value = _props.value;
    var typeaheadOptions = _props.typeaheadOptions;

    var nextTypeaheadOpts = nextProps.typeaheadOptions;
    var shouldShowError = this.state.shouldShowError || triggerValidation !== nextProps.triggerValidation;
    var hasTypeaheadOpts = !!typeaheadOptions && (isImmutable(typeaheadOptions) ? typeaheadOptions.size > 0 : typeaheadOptions.length > 0);
    var willHaveTypeaheadOpts = !!nextTypeaheadOpts && (isImmutable(nextTypeaheadOpts) ? nextTypeaheadOpts.size > 0 : nextTypeaheadOpts.length > 0);
    var hasEmptyTypeaheadOpts = hasTypeaheadOpts && !willHaveTypeaheadOpts;
    var isSameTypeaheadOpts = _immutable2.default.is((0, _immutable.fromJS)(typeaheadOptions), (0, _immutable.fromJS)(nextTypeaheadOpts));

    if (value !== nextProps.value || shouldShowError) {
      var nextVal = nextProps.value;
      var _value = this.valueIsValue(nextVal) ? nextVal : '';
      this.validate(_value, shouldShowError);
    }
    if (hasEmptyTypeaheadOpts || !isSameTypeaheadOpts) {
      this.setState({ arrowSelectedTypeaheadOpt: null });
    }
  },
  handleChange: function handleChange(e, typeaheadOpt) {
    var value = void 0;
    if (e === fromTypeahead) {
      value = typeaheadOpt;
    } else {
      value = e.target.value;
      if (this.props.type === 'number') {
        value = value.replace(/[^0-9\.]+/g, '');
      }
    }
    this.handleFocus(e);

    this.props.onChange(value, this.props.name);
  },
  handleBlur: function handleBlur(e) {
    var _this = this;

    // need time for typeahead item to be clicked, before hiding the typeahead
    setTimeout(function () {
      _this.setState({
        isFocused: false,
        arrowSelectedTypeaheadOpt: null
      });
    }, 100);
    this.handleUserAction(e, 'blur');
  },
  handleFocus: function handleFocus(e) {
    this.setState({ isFocused: true });
  },
  handleEnterKeypress: function handleEnterKeypress(e) {
    var _props2 = this.props;
    var typeaheadOptions = _props2.typeaheadOptions;
    var onChange = _props2.onChange;
    var onEnter = _props2.onEnter;

    var isEnter = e.key === 'Enter';
    var hasTypeaheadOpts = isImmutable(typeaheadOptions) ? typeaheadOptions.size > 0 : typeaheadOptions.length > 0;

    if (this.state.isFocused && hasTypeaheadOpts) {
      this.arrowSelectElementInTypeahead(e);
    } else if (isEnter) {
      if (typeof onChange === 'function') {
        this.handleUserAction(e, 'change');
      }
      if (typeof onEnter === 'function') {
        this.handleUserAction(e, 'enter');
      }
    }
  },
  arrowSelectElementInTypeahead: function arrowSelectElementInTypeahead(e) {
    var _this2 = this;

    var listEl = this.listEl;
    var typeaheadOptions = this.props.typeaheadOptions;
    var arrowSelectedTypeaheadOpt = this.state.arrowSelectedTypeaheadOpt;

    var idKey = this.props.idKey || 'id';
    var isArrowDown = e.keyCode === 40;
    var isArrowUp = e.keyCode === 38;
    var isEscape = e.keyCode === 27;
    var isEnter = e.keyCode === 13;
    var listItems = listEl.querySelectorAll('li');
    var activeClassName = 'fancy-field__typeahead-opt--active';

    if (isArrowDown || isArrowUp) {
      var selection = void 0;
      if (!!arrowSelectedTypeaheadOpt) {
        var nextSibling = arrowSelectedTypeaheadOpt.nextSibling;
        var previousSibling = arrowSelectedTypeaheadOpt.previousSibling;

        selection = isArrowDown ? nextSibling : previousSibling;
        if (!selection) {
          return;
        }
        arrowSelectedTypeaheadOpt.className = '';
      } else {
        var index = isArrowDown ? 0 : listItems.length - 1;
        selection = listItems[index];
      }
      selection.className = activeClassName;
      selection.scrollIntoView();
      this.setState({ arrowSelectedTypeaheadOpt: selection });
    } else if (isEscape) {
      this.handleBlur(e);
    } else if (isEnter) {
      (function () {
        var isTypeaheadOptionsImmutable = isImmutable(typeaheadOptions);
        var id = arrowSelectedTypeaheadOpt.dataset.id;

        var opt = typeaheadOptions.find(function (opt) {
          return isTypeaheadOptionsImmutable ? opt.get(idKey) === id : opt[idKey] === id;
        });
        _this2.handleChange(fromTypeahead, opt);
        _this2.setState({ arrowSelectedTypeaheadOpt: null });
      })();
    }
  },
  valueIsValue: function valueIsValue(value) {
    // must be a value other than null or undefined, but can be 0
    return value !== null && value !== undefined && value.toString().length > 0;
  },
  handleUserAction: function handleUserAction(e, type) {
    var _props3 = this.props;
    var name = _props3.name;
    var onChange = _props3.onChange;
    var onBlur = _props3.onBlur;

    var value = e.target.value || '';
    switch (type) {
      case 'blur':
        onBlur(value, name);
        break;
      case 'change':
        onChange(value, name);
        break;
      case 'enter':
        onEnter(value, name);
        break;
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
  var _props4 = this.props;
  var validator = _props4.validator;
  var name = _props4.name;


  if (!validator) {
    return;
  }

  validator = Array.isArray(validator) ? validator : [validator];
  var errorMessage = validator.reduce(function (error, _validator) {
    var message = _validator(value, name);
    return message ? message : error;
  }, '');

  shouldShowError = shouldShowError || this.state.shouldShowError;
  this.setState({ errorMessage: errorMessage, shouldShowError: shouldShowError });
}), _defineProperty(_React$createClass, 'setupReadonly', function setupReadonly() {
  var readOnly = this.props.readOnly;

  if (this.fancyFieldEl) {
    if (readOnly) {
      this.fancyFieldEl.setAttribute('readonly', 'readonly');
    } else {
      this.fancyFieldEl.removeAttribute('readonly');
    }
  }
}), _defineProperty(_React$createClass, 'render', function render() {
  var _this3 = this;

  var _state = this.state;
  var value = _state.value;
  var hasAttemptedInput = _state.hasAttemptedInput;
  var errorMessage = _state.errorMessage;
  var isFocused = _state.isFocused;
  var shouldShowError = this.state.shouldShowError;
  var _props5 = this.props;
  var tooltip = _props5.tooltip;
  var icon = _props5.icon;
  var isIconRight = _props5.isIconRight;
  var name = _props5.name;
  var disabled = _props5.disabled;
  var placeholder = _props5.placeholder;
  var label = _props5.label;
  var classes = _props5.classes;
  var required = _props5.required;
  var autoFocus = _props5.autoFocus;
  var typeaheadOptions = _props5.typeaheadOptions;
  var ariaLabel = _props5.ariaLabel;
  var ariaHidden = _props5.ariaHidden;
  var autoComplete = _props5.autoComplete;
  var tabIndex = _props5.tabIndex;
  var isEditable = _props5.isEditable;
  var type = this.props.type;

  type = !type || type === 'number' ? 'text' : type;

  shouldShowError = shouldShowError && !!errorMessage.length && !disabled;
  var hasTypeaheadOpts = typeaheadOptions && (isImmutable(typeaheadOptions) ? typeaheadOptions.size > 0 : typeaheadOptions.length > 0);
  var hasIcon = !!tooltip || !!icon;

  var fancyFieldClasses = (0, _classnames2.default)('fancy-field', classes, {
    'fancy-field--has-content': hasAttemptedInput,
    'has-icon': hasIcon,
    'has-icon--right': hasIcon && isIconRight,
    'required': required && !disabled,
    'is-editable': isEditable,
    'has-typeahead': hasTypeaheadOpts
  });

  this.setupReadonly();

  return _react2.default.createElement(
    'div',
    { className: fancyFieldClasses },
    !!tooltip ? _react2.default.createElement(
      'span',
      { className: 'fancy-field__tooltip simptip-position-top simptip-multiline', 'data-tooltip': tooltip },
      _react2.default.createElement('i', { className: 'unsullied-icon-help' })
    ) : null,
    !!icon ? _react2.default.createElement(
      'span',
      { className: 'fancy-field__icon' },
      icon
    ) : null,
    _react2.default.createElement('input', { autoComplete: autoComplete || "new-password",
      className: (0, _classnames2.default)('full-width', 'fancy-field__input', { 'fancy-field__input--error': shouldShowError }),
      name: name,
      value: value,
      disabled: disabled,
      type: type,
      tabIndex: tabIndex,
      'aria-label': ariaLabel,
      'aria-describedby': shouldShowError ? name + '-error-description' : null,
      'aria-hidden': ariaHidden,
      'aria-invalid': shouldShowError,
      ref: function ref(el) {
        return _this3.fancyFieldEl = el;
      },
      placeholder: placeholder,
      onChange: this.handleChange,
      onBlur: this.handleBlur,
      onFocus: this.handleFocus,
      autoFocus: autoFocus,
      onKeyDown: this.handleEnterKeypress }),
    _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)("fancy-field__label", { 'fancy-field__label--error': shouldShowError }) },
      shouldShowError ? _react2.default.createElement(
        'span',
        { id: this.props.name + '-error-description' },
        errorMessage
      ) : _react2.default.createElement(
        'span',
        null,
        label
      )
    ),
    hasTypeaheadOpts ? _react2.default.createElement(
      'div',
      { className: (0, _classnames2.default)("fancy-field__typeahead", { 'fancy-field__typeahead--hidden': !isFocused }),
        ref: 'fancyFieldTypeaheadContainer' },
      this.renderTypeaheadBody()
    ) : null
  );
}), _defineProperty(_React$createClass, 'renderTypeaheadBody', function renderTypeaheadBody() {
  var _this4 = this;

  var typeaheadOptions = this.props.typeaheadOptions;

  var idKey = this.props.idKey || 'id';
  var labelKey = this.props.labelKey || 'label';
  var _isImmutable = isImmutable(typeaheadOptions);

  return _react2.default.createElement(
    'div',
    { className: 'fancy-field__typeahead-body' },
    _react2.default.createElement(
      'ul',
      { ref: function ref(listEl) {
          return _this4.listEl = listEl;
        } },
      typeaheadOptions.map(function (opt) {
        var id = _isImmutable ? opt.get(idKey) : opt[idKey];
        var label = _isImmutable ? opt.get(labelKey) : opt[labelKey];
        return _react2.default.createElement(
          'li',
          { key: id,
            'data-id': id,
            onClick: function onClick() {
              return _this4.handleChange(fromTypeahead, opt);
            } },
          label
        );
      })
    )
  );
}), _React$createClass));
module.exports = exports['default'];
