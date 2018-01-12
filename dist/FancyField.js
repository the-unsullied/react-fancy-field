'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fromTypeahead = 'FROM_TYPEAHEAD';
var isIE11 = !window.ActiveXObject && "ActiveXObject" in window;

function isImmutable(obj) {
  return obj !== null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === "object" && !!obj.toJSON;
}

function getInputOnChangeProps(handler) {
  return isIE11 ? { onInput: handler } : { onChange: handler };
}

var _class = function (_React$Component) {
  _inherits(_class, _React$Component);

  function _class(props) {
    _classCallCheck(this, _class);

    var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

    _initialiseProps.call(_this);

    var value = props.value,
        ariaHidden = props.ariaHidden;

    var stateVal = isNaN(parseFloat(value)) && !value ? '' : value;

    _this.state = {
      value: stateVal,
      hasAttemptedInput: false,
      errorMessage: '',
      shouldShowError: false,
      isFocused: false,
      arrowSelectedTypeaheadOpt: null,
      ariaHidden: ariaHidden === undefined ? false : ariaHidden,
      // Issue: https://github.com/facebook/react/issues/955
      // Solution: https://gist.github.com/thebigredgeek/a9bb9d48d300f69ecd332f24d2a3b2ab#file-input-js-L32
      currentPosition: (props.value || '').length
    };
    return _this;
  }

  _createClass(_class, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this2 = this;

      this.validate(this.state.value);
      this.resetAriaHidden = debounce(function () {
        _this2.setState({ ariaHidden: false });
      }, 200);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var _props = this.props,
          triggerValidation = _props.triggerValidation,
          value = _props.value,
          typeaheadOptions = _props.typeaheadOptions;

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
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextState, nextProps) {
      var _props2 = this.props,
          oldDisabled = _props2.disabled,
          oldLabel = _props2.label,
          oldOptions = _props2.typeaheadOptions,
          oldTrigger = _props2.triggerValidation,
          oldValue = _props2.value;
      var disabled = nextProps.disabled,
          label = nextProps.label,
          typeaheadOptions = nextProps.typeaheadOptions,
          triggerValidation = nextProps.triggerValidation,
          value = nextProps.value;
      var oldIsFocused = this.state.isFocused;
      var isFocused = nextState.isFocused;


      return oldLabel !== label || oldValue !== value && oldValue !== undefined || oldDisabled !== disabled && disabled === false || disabled === true || typeaheadOptions !== oldOptions && typeaheadOptions || triggerValidation !== oldTrigger && triggerValidation || oldIsFocused !== isFocused && isFocused !== undefined || false;
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      // please reaad comment located @setAriaHidden
      var currentPosition = this.state.currentPosition;

      if (this.fancyFieldEl.type === 'hidden') {
        return;
      }
      if (this.state.isFocused) {
        this.fancyFieldEl.setSelectionRange(currentPosition, currentPosition);
      }
      if (this.props.ariaHidden === undefined) {
        if (this.state.ariaHidden && prevProps.value !== this.props.value) {
          this.resetAriaHidden();
        }
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _state = this.state,
          value = _state.value,
          hasAttemptedInput = _state.hasAttemptedInput,
          errorMessage = _state.errorMessage,
          ariaHidden = _state.ariaHidden,
          isFocused = _state.isFocused;
      var shouldShowError = this.state.shouldShowError;
      var _props3 = this.props,
          tooltip = _props3.tooltip,
          icon = _props3.icon,
          isIconRight = _props3.isIconRight,
          disabled = _props3.disabled,
          placeholder = _props3.placeholder,
          label = _props3.label,
          classes = _props3.classes,
          required = _props3.required,
          autoFocus = _props3.autoFocus,
          typeaheadOptions = _props3.typeaheadOptions,
          ariaLabel = _props3.ariaLabel,
          autoComplete = _props3.autoComplete,
          tabIndex = _props3.tabIndex,
          isEditable = _props3.isEditable;
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
        _react2.default.createElement('input', _extends({ autoComplete: autoComplete || "new-password",
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
          placeholder: placeholder
        }, getInputOnChangeProps(this.handleChange), {
          onBlur: this.handleBlur,
          onFocus: this.handleFocus,
          autoFocus: autoFocus,
          onKeyDown: this.handleEnterKeypress })),
        this.renderLabel(dashedLabel, shouldShowError, errorLabel),
        hasTypeaheadOpts ? _react2.default.createElement(
          'div',
          { className: (0, _classnames2.default)("fancy-field__typeahead", { 'fancy-field__typeahead--hidden': !isFocused }),
            ref: 'fancyFieldTypeaheadContainer' },
          this.renderTypeaheadBody()
        ) : null
      );
    }
  }]);

  return _class;
}(_react2.default.Component);

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.


_class.displayName = 'FancyField';
_class.defaultProps = {
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
_class.propTypes = {
  name: _propTypes2.default.string,
  type: _propTypes2.default.string,
  triggerValidation: _propTypes2.default.number,
  label: _propTypes2.default.any,
  placeholder: _propTypes2.default.any,
  disabled: _propTypes2.default.bool,
  validator: _propTypes2.default.any,
  value: _propTypes2.default.any,
  classes: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  onFocus: _propTypes2.default.func,
  tooltip: _propTypes2.default.string,
  required: _propTypes2.default.bool,
  readOnly: _propTypes2.default.bool,
  isEditable: _propTypes2.default.bool,
  icon: _propTypes2.default.any,
  isIconRight: _propTypes2.default.bool,
  autoFocus: _propTypes2.default.bool,
  autoComplete: _propTypes2.default.string,
  typeaheadOptions: _propTypes2.default.any,
  ariaLabel: _propTypes2.default.any,
  ariaHidden: _propTypes2.default.bool,
  tabIndex: _propTypes2.default.string,
  suppressError: _propTypes2.default.bool
};

var _initialiseProps = function _initialiseProps() {
  var _this4 = this;

  this.listEl = null;
  this.fancyFieldEl = null;
  this.resetAriaHidden = null;

  this.handleChange = function (e, typeaheadOpt) {
    _this4.setState({
      isUserChange: true,
      currentPosition: e.target && e.target.selectionEnd
    });
    _this4.handleFocus(e);
    _this4.handleUserAction(e, 'change', typeaheadOpt);
  };

  this.handleBlur = function (e) {
    _this4.setState({
      isFocused: false,
      arrowSelectedTypeaheadOpt: null
    });
    _this4.handleUserAction(e, 'blur');
  };

  this.handleFocus = function (e) {
    _this4.setState({ isFocused: true });
    _this4.handleUserAction(e, 'focus');
  };

  this.handleEnterKeypress = function (e) {
    var _props4 = _this4.props,
        typeaheadOptions = _props4.typeaheadOptions,
        onChange = _props4.onChange,
        onEnter = _props4.onEnter;

    var isEnter = e.key === 'Enter';
    var hasTypeaheadOpts = isImmutable(typeaheadOptions) ? typeaheadOptions.size > 0 : typeaheadOptions.length > 0;

    if (_this4.state.isFocused && hasTypeaheadOpts) {
      _this4.arrowSelectElementInTypeahead(e);
    } else if (isEnter) {
      if (typeof onChange === 'function') {
        _this4.handleUserAction(e, 'change');
      }
      if (typeof onEnter === 'function') {
        _this4.handleUserAction(e, 'enter');
      }
    }
  };

  this.arrowSelectElementInTypeahead = function (e) {
    var listEl = _this4.listEl;
    var typeaheadOptions = _this4.props.typeaheadOptions;
    var arrowSelectedTypeaheadOpt = _this4.state.arrowSelectedTypeaheadOpt;

    var idKey = _this4.props.idKey || 'id';
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
      _this4.setState({ arrowSelectedTypeaheadOpt: selection });
    } else if (isEscape) {
      _this4.handleBlur(e);
    } else if (isEnter) {
      var isTypeaheadOptionsImmutable = isImmutable(typeaheadOptions);
      var id = arrowSelectedTypeaheadOpt.dataset.id;

      var opt = typeaheadOptions.find(function (opt) {
        return isTypeaheadOptionsImmutable ? opt.get(idKey) === id : opt[idKey] === id;
      });
      _this4.handleChange(fromTypeahead, opt);
      _this4.setState({ arrowSelectedTypeaheadOpt: null });
    }
  };

  this.handleUserAction = function (e, type) {
    var typeaheadOpt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var _props5 = _this4.props,
        name = _props5.name,
        onChange = _props5.onChange,
        onBlur = _props5.onBlur,
        onEnter = _props5.onEnter,
        onFocus = _props5.onFocus;

    var value = _this4.getValue(e, typeaheadOpt);
    _this4.setState({ isUserChange: true });
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
    if (!_this4.state.shouldShowError) {
      _this4.setState({ shouldShowError: true });
    }
  };

  this.getValue = function (e, typeaheadOpt) {
    var value = void 0;
    if (e === fromTypeahead) {
      value = typeaheadOpt;
    } else {
      value = e.target.value;
      if (_this4.props.type === 'number') {
        value = value.replace(/[^0-9\.]+/g, '');
      }
    }
    return value;
  };

  this.valueIsValue = function (value) {
    // must be a value other than null or undefined, but can be 0
    return value !== null && value !== undefined && value.toString().length > 0;
  };

  this.validate = function (value) {
    var shouldShowError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var suppressError = _this4.props.suppressError;

    var hasAttempted = _this4.valueIsValue(value) || shouldShowError;
    var triggerHasAttempted = suppressError === null ? hasAttempted : suppressError && hasAttempted;
    var hasAttemptedInput = _this4.state.hasAttemptedInput || triggerHasAttempted;

    if (hasAttemptedInput) {
      _this4.setAriaHidden();
      _this4.setErrorMessage(value, shouldShowError);
      _this4.setState({ hasAttemptedInput: hasAttemptedInput, value: value });
    } else if (suppressError !== null) {
      _this4.setState({ value: value });
    }
  };

  this.setAriaHidden = function () {
    // only update ariaHidden state if user does not explicitly define it
    // we need to control it since it can programmatically change.
    // If programatic change, screen reader will pick up change and think user
    // typed it out (unwanted experience)

    // this is called during componentWillUpdate - props is not current
    if (_this4.props.ariaHidden === undefined) {
      if (_this4.state.isUserChange) {
        _this4.setState({
          isUserChange: false,
          ariaHidden: false
        });
      } else {
        _this4.setState({ ariaHidden: true });
      }
    }
  };

  this.setErrorMessage = function (value, shouldShowError) {
    var _props6 = _this4.props,
        validator = _props6.validator,
        name = _props6.name;


    if (!validator) {
      return;
    }

    validator = Array.isArray(validator) ? validator : [validator];
    var errorMessage = validator.reduce(function (error, _validator) {
      var message = _validator(value, name);
      return message ? message : error;
    }, '');

    shouldShowError = shouldShowError || _this4.state.shouldShowError;
    _this4.setState({ errorMessage: errorMessage, shouldShowError: shouldShowError });
  };

  this.setupReadonly = function () {
    var readOnly = _this4.props.readOnly;

    if (_this4.fancyFieldEl) {
      if (readOnly) {
        _this4.fancyFieldEl.setAttribute('readonly', 'readonly');
      } else {
        _this4.fancyFieldEl.removeAttribute('readonly');
      }
    }
  };

  this.renderLabel = function (dashedLabel, shouldShowError, errorLabel) {
    var errorMessage = _this4.state.errorMessage;
    var label = _this4.props.label;

    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'label',
        { className: (0, _classnames2.default)("fancy-field__label", { 'fancy-field__label--error': shouldShowError }),
          id: shouldShowError ? errorLabel : '',
          htmlFor: shouldShowError ? '' : dashedLabel },
        _react2.default.createElement(
          'span',
          null,
          shouldShowError ? errorMessage : label
        )
      ),
      shouldShowError ? _react2.default.createElement(
        'span',
        { htmlFor: dashedLabel,
          className: 'fancy-field__visuallyhidden' },
        label
      ) : null
    );
  };

  this.renderTypeaheadBody = function () {
    var typeaheadOptions = _this4.props.typeaheadOptions;

    var idKey = _this4.props.idKey || 'id';
    var labelKey = _this4.props.labelKey || 'label';
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
  };
};

exports.default = _class;
function debounce(func, wait, immediate) {
  var _this5 = this,
      _arguments = arguments;

  var timeout = void 0;
  return function () {
    var context = _this5,
        args = _arguments;
    var later = function later() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}
module.exports = exports['default'];
