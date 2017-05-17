'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; //comment
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
@param {Method} onFocus method that is called on focus
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
@param {Boolean} suppressError if true, the component will not show error initially until boolean is true
*/

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fromTypeahead = 'FROM_TYPEAHEAD';

function isImmutable(obj) {
  return obj !== null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === "object" && !!obj.toJSON;
}

exports.default = _react2.default.createClass({
  listEl: null,
  fancyFieldEl: null,
  resetAriaHidden: null,

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
      onFocus: function onFocus() {},
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
      ariaHidden: undefined,
      tabIndex: '',
      suppressError: null
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
    onFocus: _react2.default.PropTypes.func,
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
    tabIndex: _react2.default.PropTypes.string,
    suppressError: _react2.default.PropTypes.bool
  },

  getInitialState: function getInitialState() {
    var _props = this.props,
        value = _props.value,
        ariaHidden = _props.ariaHidden;

    var stateVal = isNaN(parseFloat(value)) && !value ? '' : value;
    return {
      value: stateVal,
      hasAttemptedInput: false,
      errorMessage: '',
      shouldShowError: false,
      isFocused: false,
      arrowSelectedTypeaheadOpt: null,
      ariaHidden: ariaHidden === undefined ? false : ariaHidden
    };
  },
  componentWillMount: function componentWillMount() {
    var _this = this;

    this.validate(this.state.value);
    this.resetAriaHidden = debounce(function () {
      _this.setState({ ariaHidden: false });
    }, 200);
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var _props2 = this.props,
        triggerValidation = _props2.triggerValidation,
        value = _props2.value,
        typeaheadOptions = _props2.typeaheadOptions;

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
    this.setState({ isUserChange: true });
    this.handleFocus(e);
    this.handleUserAction(e, 'change');
  },
  handleBlur: function handleBlur(e) {
    var _this2 = this;

    // need time for typeahead item to be clicked, before hiding the typeahead
    setTimeout(function () {
      _this2.setState({
        isFocused: false,
        arrowSelectedTypeaheadOpt: null
      });
    }, 100);
    this.handleUserAction(e, 'blur');
  },
  handleFocus: function handleFocus(e) {
    this.setState({ isFocused: true });
    this.handleUserAction(e, 'focus');
  },
  handleEnterKeypress: function handleEnterKeypress(e) {
    var _props3 = this.props,
        typeaheadOptions = _props3.typeaheadOptions,
        onChange = _props3.onChange,
        onEnter = _props3.onEnter;

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
        var nextSibling = arrowSelectedTypeaheadOpt.nextSibling,
            previousSibling = arrowSelectedTypeaheadOpt.previousSibling;

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
      var isTypeaheadOptionsImmutable = isImmutable(typeaheadOptions);
      var id = arrowSelectedTypeaheadOpt.dataset.id;

      var opt = typeaheadOptions.find(function (opt) {
        return isTypeaheadOptionsImmutable ? opt.get(idKey) === id : opt[idKey] === id;
      });
      this.handleChange(fromTypeahead, opt);
      this.setState({ arrowSelectedTypeaheadOpt: null });
    }
  },
  handleUserAction: function handleUserAction(e, type) {
    var _props4 = this.props,
        name = _props4.name,
        onChange = _props4.onChange,
        onBlur = _props4.onBlur,
        onEnter = _props4.onEnter,
        onFocus = _props4.onFocus;

    var value = this.getValue(e);
    this.setState({ isUserChange: true });
    switch (type) {
      case 'blur':
        onBlur && onBlur(value, name);
        break;
      case 'change':
        onChange && onChange(value, name);
        break;
      case 'enter':
        onEnter && onEnter(value, name);
        break;
      case 'focus':
        onFocus && onFocus(value, name);
        break;
    }
    if (!this.state.shouldShowError) {
      this.setState({ shouldShowError: true });
    }
  },
  getValue: function getValue(e) {
    var value = void 0;
    if (e === fromTypeahead) {
      value = typeaheadOpt;
    } else {
      value = e.target.value;
      if (this.props.type === 'number') {
        value = value.replace(/[^0-9\.]+/g, '');
      }
    }
    return value;
  },
  valueIsValue: function valueIsValue(value) {
    // must be a value other than null or undefined, but can be 0
    return value !== null && value !== undefined && value.toString().length > 0;
  },
  validate: function validate(value) {
    var shouldShowError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var suppressError = this.props.suppressError;

    var hasAttempted = this.valueIsValue(value) || shouldShowError;
    var triggerHasAttempted = suppressError === null ? hasAttempted : suppressError && hasAttempted;
    var hasAttemptedInput = this.state.hasAttemptedInput || triggerHasAttempted;

    var validator = this.props.validator;

    if (hasAttemptedInput) {
      this.setAriaHidden();
      this.setErrorMessage(value, shouldShowError);
      this.setState({ hasAttemptedInput: hasAttemptedInput, value: value });
    } else if (suppressError !== null) {
      this.setState({ value: value });
    }
  },
  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    // please reaad comment located @setAriaHidden
    if (this.props.ariaHidden === undefined) {
      if (this.state.ariaHidden && prevProps.value !== this.props.value) {
        this.resetAriaHidden();
      }
    }
  },
  setAriaHidden: function setAriaHidden() {
    // only update ariaHidden state if user does not explicitly define it
    // we need to control it since it can programmatically change.
    // If programatic change, screen reader will pick up change and think user
    // typed it out (unwanted experience)

    // this is called during componentWillUpdate - props is not current
    if (this.props.ariaHidden === undefined) {
      if (this.state.isUserChange) {
        this.setState({
          isUserChange: false,
          ariaHidden: false
        });
      } else {
        this.setState({ ariaHidden: true });
      }
    }
  },
  setErrorMessage: function setErrorMessage(value, shouldShowError) {
    var _props5 = this.props,
        validator = _props5.validator,
        name = _props5.name;


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
  },
  setupReadonly: function setupReadonly() {
    var readOnly = this.props.readOnly;

    if (this.fancyFieldEl) {
      if (readOnly) {
        this.fancyFieldEl.setAttribute('readonly', 'readonly');
      } else {
        this.fancyFieldEl.removeAttribute('readonly');
      }
    }
  },
  render: function render() {
    var _this3 = this;

    var _state = this.state,
        value = _state.value,
        hasAttemptedInput = _state.hasAttemptedInput,
        errorMessage = _state.errorMessage,
        ariaHidden = _state.ariaHidden,
        isFocused = _state.isFocused;
    var shouldShowError = this.state.shouldShowError;
    var _props6 = this.props,
        tooltip = _props6.tooltip,
        icon = _props6.icon,
        isIconRight = _props6.isIconRight,
        disabled = _props6.disabled,
        placeholder = _props6.placeholder,
        label = _props6.label,
        classes = _props6.classes,
        required = _props6.required,
        autoFocus = _props6.autoFocus,
        typeaheadOptions = _props6.typeaheadOptions,
        ariaLabel = _props6.ariaLabel,
        autoComplete = _props6.autoComplete,
        tabIndex = _props6.tabIndex,
        isEditable = _props6.isEditable;
    var _props$name = this.props.name,
        name = _props$name === undefined ? label : _props$name;

    var dashedName = name.split(' ').join('-');
    var dashedLabel = dashedName + '-label';
    var errorLabel = dashedName + '-error-description';
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
        'label',
        { className: 'fancy-field__tooltip simptip-position-top simptip-multiline',
          'data-tooltip': tooltip,
          htmlFor: dashedLabel },
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
        'aria-describedby': shouldShowError ? errorLabel : null,
        id: dashedLabel,
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
        'label',
        { className: (0, _classnames2.default)("fancy-field__label", { 'fancy-field__label--error': shouldShowError }),
          htmlFor: dashedLabel },
        shouldShowError ? _react2.default.createElement(
          'span',
          { id: errorLabel },
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
  },
  renderTypeaheadBody: function renderTypeaheadBody() {
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
  }
});

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

function debounce(func, wait, immediate) {
  var _this5 = this,
      _arguments = arguments;

  var timeout = void 0;
  return function () {
    var context = _this5,
        args = _arguments;
    var later = function later() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
module.exports = exports['default'];
