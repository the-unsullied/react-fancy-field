//comment
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

import React from 'react';
import classnames from 'classnames';
import immutable, {fromJS} from 'immutable';

const fromTypeahead = 'FROM_TYPEAHEAD';

function isImmutable(obj) {
  return obj !== null && typeof obj === "object" && !!obj.toJSON;
}

export default React.createClass({
  listEl: null,
  fancyFieldEl: null,

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
      isEditable: false,
      icon: null,
      isIconRight: false,
      autoFocus: false,
      autoComplete: null,
      typeaheadOptions: [],
      ariaLabel: '',
      tabIndex: ''
    };
  },

  propTypes: {
    name: React.PropTypes.string,
    type: React.PropTypes.string,
    triggerValidation: React.PropTypes.number,
    label: React.PropTypes.any,
    placeholder: React.PropTypes.any,
    disabled: React.PropTypes.bool,
    validator: React.PropTypes.any,
    value: React.PropTypes.any,
    classes: React.PropTypes.string,
    onChange: React.PropTypes.func,
    tooltip: React.PropTypes.string,
    required: React.PropTypes.bool,
    readOnly: React.PropTypes.bool,
    isEditable: React.PropTypes.bool,
    icon: React.PropTypes.any,
    isIconRight: React.PropTypes.bool,
    autoFocus: React.PropTypes.bool,
    autoComplete: React.PropTypes.string,
    typeaheadOptions: React.PropTypes.any,
    ariaLabel: React.PropTypes.any,
    tabIndex: React.PropTypes.string
  },

  getInitialState() {
    const { value } = this.props;
    let stateVal = isNaN(parseFloat(value)) && !value ? '' : value;
    return {
      value: stateVal,
      hasAttemptedInput: false,
      errorMessage: '',
      shouldShowError: false,
      isFocused: false,
      arrowSelectedTypeaheadOpt: null
    };
  },

  componentWillMount() {
    this.validate(this.state.value);
  },

  componentWillReceiveProps(nextProps) {
    const { triggerValidation, value, typeaheadOptions } = this.props;
    const nextTypeaheadOpts = nextProps.typeaheadOptions;
    const shouldShowError = this.state.shouldShowError || triggerValidation !== nextProps.triggerValidation;
    const hasTypeaheadOpts = !!typeaheadOptions && (isImmutable(typeaheadOptions) ? typeaheadOptions.size > 0 : typeaheadOptions.length > 0);
    const willHaveTypeaheadOpts = !!nextTypeaheadOpts && (isImmutable(nextTypeaheadOpts) ?  nextTypeaheadOpts.size > 0 : nextTypeaheadOpts.length > 0);
    const hasEmptyTypeaheadOpts = hasTypeaheadOpts && !willHaveTypeaheadOpts;
    const isSameTypeaheadOpts = immutable.is(fromJS(typeaheadOptions), fromJS(nextTypeaheadOpts));

    if(value !== nextProps.value || shouldShowError) {
      const nextVal = nextProps.value;
      let value = this.valueIsValue(nextVal) ? nextVal : '';
      this.validate(value, shouldShowError);
    }
    if(hasEmptyTypeaheadOpts || !isSameTypeaheadOpts) {
      this.setState({ arrowSelectedTypeaheadOpt: null });
    }
  },

  handleChange(e, typeaheadOpt) {
    let value;
    if(e === fromTypeahead) {
      value = typeaheadOpt
    } else {
       value = e.target.value;
       if(this.props.type === 'number') {
         value = value.replace(/[^0-9\.]+/g,'');
       }
    }
    this.handleFocus(e);

    this.props.onChange(value, this.props.name);
  },

  handleBlur(e) {
    const { onBlur } = this.props;
    // need time for typeahead item to be clicked, before hiding the typeahead
    setTimeout(() => {
      this.setState({
        isFocused: false,
        arrowSelectedTypeaheadOpt: null
      });
    }, 100);
    this.handleUserAction(e, onBlur);
  },

  handleFocus(e) {
    this.setState({ isFocused: true });
  },

  handleEnterKeypress(e) {
    const { typeaheadOptions } = this.props;
    const isEnter = e.keyCode === 13;
    const hasTypeaheadOpts = isImmutable(typeaheadOptions) ? typeaheadOptions.size > 0 : typeaheadOptions.length > 0;

    if(this.state.isFocused && hasTypeaheadOpts) {
      this.arrowSelectElementInTypeahead(e);
    } else if(isEnter && typeof this.props.onChange === 'function') {
      this.handleUserAction(e);
    }
  },

  arrowSelectElementInTypeahead(e) {
    const { listEl } = this;
    const { typeaheadOptions } = this.props;
    const { arrowSelectedTypeaheadOpt } = this.state;
    const idKey = this.props.idKey || 'id';
    const isArrowDown = e.keyCode === 40;
    const isArrowUp = e.keyCode === 38;
    const isEscape = e.keyCode === 27;
    const isEnter = e.keyCode === 13;
    const listItems = listEl.querySelectorAll('li');
    const activeClassName = 'fancy-field__typeahead-opt--active';

    if(isArrowDown || isArrowUp) {
      let selection;
      if(!!arrowSelectedTypeaheadOpt) {
        const { nextSibling, previousSibling } = arrowSelectedTypeaheadOpt
        selection = isArrowDown ? nextSibling : previousSibling;
        if(!selection) {
          return;
        }
        arrowSelectedTypeaheadOpt.className = '';
      } else {
        const index = isArrowDown ? 0 : listItems.length - 1;
        selection = listItems[index];
      }
      selection.className = activeClassName;
      selection.scrollIntoView();
      this.setState({ arrowSelectedTypeaheadOpt: selection });
    } else if(isEscape) {
      this.handleBlur(e);
    } else if(isEnter) {
      const isTypeaheadOptionsImmutable = isImmutable(typeaheadOptions);
      const { id } = arrowSelectedTypeaheadOpt.dataset;
      const opt = typeaheadOptions.find(opt => {
        return isTypeaheadOptionsImmutable ? opt.get(idKey) === id : opt[idKey] === id;
      });
      this.handleChange(fromTypeahead, opt);
      this.setState({ arrowSelectedTypeaheadOpt: null });
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
      return message ? message : error;
    }, '');

    shouldShowError = shouldShowError || this.state.shouldShowError;
    this.setState({ errorMessage, shouldShowError });
  },

  setupReadonly() {
    const { readOnly } = this.props;
    if(this.fancyFieldEl) {
      if(readOnly) {
        this.fancyFieldEl.setAttribute('readonly', 'readonly');
      } else {
        this.fancyFieldEl.removeAttribute('readonly');
      }
    }
  },

  render() {
    const { value,
      hasAttemptedInput,
      errorMessage,
      isFocused } = this.state;
    let { shouldShowError } = this.state;

    const { tooltip,
      icon,
      isIconRight,
      name,
      disabled,
      placeholder,
      label,
      classes,
      required,
      autoFocus,
      typeaheadOptions,
      ariaLabel,
      autoComplete,
      tabIndex,
      isEditable } = this.props;
    let { type } = this.props;
    type = !type || type === 'number' ? 'text' : type;

    shouldShowError = shouldShowError && !!errorMessage.length && !disabled;
    const hasTypeaheadOpts = typeaheadOptions && (isImmutable(typeaheadOptions) ? typeaheadOptions.size > 0 : typeaheadOptions.length > 0);
    const hasIcon = !!tooltip || !!icon;

    const fancyFieldClasses = classnames('fancy-field', classes,
      {
        'fancy-field--has-content': hasAttemptedInput,
        'has-icon': hasIcon,
        'has-icon--right': hasIcon && isIconRight,
        'required': required && !disabled,
        'is-editable': isEditable,
        'has-typeahead': hasTypeaheadOpts
      });

    this.setupReadonly();

    return <div className={fancyFieldClasses}>
      {/*http://stackoverflow.com/questions/15738259/disabling-chrome-autofill*/}
      { !!tooltip ? <span className='fancy-field__tooltip simptip-position-top simptip-multiline' data-tooltip={tooltip}>
        <i className='unsullied-icon-help'></i>
      </span> : null }
      { !!icon ? <span className='fancy-field__icon'>
        { icon }
      </span> : null }
      <input autoComplete={autoComplete || "new-password"}
             className={classnames('full-width', 'fancy-field__input', {'fancy-field__input--error': shouldShowError})}
             name={name}
             value={value}
             disabled={disabled}
             type={type}
             tabIndex={tabIndex}
             aria-label={ariaLabel}
             ref={(el) => this.fancyFieldEl = el}
             placeholder={placeholder}
             onChange={this.handleChange}
             onBlur={this.handleBlur}
             onFocus={this.handleFocus}
             autoFocus={autoFocus}
             onKeyDown={this.handleEnterKeypress} />
      <div className={classnames("fancy-field__label", {'fancy-field__label--error': shouldShowError})}>
       {shouldShowError ? <span>{errorMessage}</span> : <span>{label}</span>}
      </div>
      { hasTypeaheadOpts ?
        <div className={classnames("fancy-field__typeahead", {'fancy-field__typeahead--hidden': !isFocused})}
            ref='fancyFieldTypeaheadContainer'>
          { this.renderTypeaheadBody() }
        </div>
      : null}
    </div>
  },

  renderTypeaheadBody() {
    const { typeaheadOptions } = this.props;
    const idKey = this.props.idKey || 'id';
    const labelKey = this.props.labelKey || 'label';
    const _isImmutable = isImmutable(typeaheadOptions);

    return <div className='fancy-field__typeahead-body'>
      <ul ref={listEl => this.listEl = listEl}>
        {typeaheadOptions.map(opt => {
          const id = _isImmutable ? opt.get(idKey) : opt[idKey];
          const label = _isImmutable ? opt.get(labelKey) : opt[labelKey];
          return <li key={id}
            data-id={id}
            onClick={() => this.handleChange(fromTypeahead, opt)}>
            { label }
          </li>
        })}
      </ul>
    </div>
  }
});
