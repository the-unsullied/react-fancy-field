import React from 'react';
import { findDOMNode } from 'react-dom';
import { renderIntoDocument, findRenderedComponentWithType, Simulate } from 'react-addons-test-utils';
import FancyField from './../dist/FancyField';

const noop = () => {};

const createComponent = function(props = {}, shouldReturnParent) {

  const state = Object.assign({
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
  }, props);

  const Parent = React.createFactory(React.createClass({
    getInitialState() { return state; },
    render() { return <FancyField {...this.state} /> }
  }));

  const parentComponent = renderIntoDocument(Parent());
  const component = findRenderedComponentWithType(parentComponent, FancyField);

  return shouldReturnParent ? { parent: parentComponent, component } : component;
};

context('FancyField', () => {
  describe('initial load', () => {
    it('should load', () => {
      const component = createComponent();
      expect(component.refs.fancyField).to.exist;
    });
    it('should have fancy-field--has-content class if there is a value', () => {
      const component = createComponent({ value: 'banana'});
      expect(component.refs.fancyField.parentNode.classList.contains('fancy-field--has-content')).to.be.true;
    });
    it('should have disabled property if disabled', () => {
      const component = createComponent({disabled: true});
      expect(component.refs.fancyField.hasAttribute('disabled')).to.be.true;
    });
    it('should have disabled property if readOnly and have read-only class', () => {
      const component = createComponent({readOnly: true});
      expect(component.refs.fancyField.hasAttribute('disabled')).to.be.true;
      expect(component.refs.fancyField.parentNode.classList.contains('read-only')).to.be.true;
    });
  });

  describe('user actions', () => {
    it('should call onChange when value is updated', () => {
      const onChange = sinon.spy();
      const component = createComponent({ onChange });
      component.setState({value: 'meow'});
      Simulate.change(component.refs.fancyField);
      expect(onChange.calledOnce).to.be.true;
      expect(onChange.calledWith('meow')).to.be.true;
    });

    context('type is number', () => {
      it('should replace all non digits if type=number', () => {
        const onChange = sinon.spy();
        const component = createComponent({ onChange, type: 'number' });

        component.setState({value: 'meow567'});
        Simulate.change(component.refs.fancyField);
        expect(onChange.calledOnce).to.be.true;
        expect(onChange.calledWith('567')).to.be.true;
      });
    });

    it('should call validation when this.props.value is updated', () => {
      const {parent, component} = createComponent({value: ''}, true);
      expect(component.state.hasAttemptedInput).to.be.false;
      expect(component.state.value).to.equal('');
      parent.setState({value: 'meow'});
      expect(component.state.hasAttemptedInput).to.be.true;
      expect(component.state.value).to.equal('meow');
    });

    it('should also pass through validator if there is a validator when this.props.value is updated', () => {
      const validator = sinon.stub().returns('invalid meow');
      const {parent, component} = createComponent({value: '', validator}, true);

      parent.setState({value: 'meow'});
      expect(validator.calledOnce).to.be.true;
      expect(validator.calledWith('meow')).to.be.true;
      expect(component.state.errorMessage).to.equal('invalid meow ');
      expect(component.state.shouldShowError).to.be.false;
    });

    it('should also pass through multiple validator if there is an array of validators when this.props.value is updated', () => {
      const validator1 = sinon.stub().returns('invalid meow');
      const validator2 = sinon.stub().returns('invalid orange');
      const validator = [validator1, validator2];

      const {parent, component} = createComponent({value: '', validator}, true);

      parent.setState({value: 'meow'});
      expect(validator1.calledOnce).to.be.true;
      expect(validator2.calledOnce).to.be.true;
      expect(validator1.calledWith('meow')).to.be.true;
      expect(validator2.calledWith('meow')).to.be.true;
      expect(component.state.errorMessage).to.equal('invalid orange invalid meow ');
      expect(component.state.shouldShowError).to.be.false;
    });

    function showErrorTest(simulation) {
      const validator = sinon.stub().returns('invalid meow');
      const onChange = sinon.spy();
      const {parent, component} = createComponent({value: '', validator, onChange}, true);

      parent.setState({value: 'meow'});
      simulation(component);
      expect(component.state.shouldShowError).to.be.true;
      expect(component.state.errorMessage).to.equal('invalid meow ');
      expect(onChange.calledOnce).to.be.true;
      expect(onChange.calledWith('meow')).to.be.true;
    }

    it('should show error on blur', () => {
      showErrorTest((component) => Simulate.blur(component.refs.fancyField));
    });

    it('should show error on hit of enter', () => {
      showErrorTest((component) =>
      Simulate.keyDown(component.refs.fancyField, {key: "Enter", keyCode: 13, which: 13}));
    });

    it('should call onBlur if passed into component instead of onChange', () => {
      const validator = sinon.stub().returns('invalid meow');
      const onBlur = sinon.spy();
      const onChange = sinon.spy();
      const {parent, component} = createComponent({value: '', validator, onBlur, onChange}, true);

      parent.setState({value: 'meow'});
      Simulate.blur(component.refs.fancyField);
      expect(component.state.shouldShowError).to.be.true;
      expect(component.state.errorMessage).to.equal('invalid meow ');
      expect(onChange.called).to.be.false;
      expect(onBlur.calledOnce).to.be.true;
      expect(onBlur.calledWith('meow')).to.be.true;
    });

    it('should show show the error message in place of label', () => {
      const validator = sinon.stub().returns('invalid meow');
      const onChange = sinon.spy();
      const {parent, component} = createComponent({value: '', validator, onChange}, true);

      parent.setState({value: 'meow'});
      Simulate.blur(component.refs.fancyField);
      const errorMessage = findDOMNode(component).querySelector('.fancy-field__label--error');
      expect(errorMessage).to.exist;
      expect(errorMessage.textContent).to.equal('invalid meow ');
    });


  });
  describe('tooltip', () => {
    it('should show the tooltip', () => {
      const tooltip = 'hello my friends this is a tooltip';
      const component = createComponent({tooltip});
      const tooltipNode = findDOMNode(component).querySelector('.fancy-field__tooltip');
      expect(tooltipNode).to.exist;
    });
  });

});
