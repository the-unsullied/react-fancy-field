/* */
"format cjs";
import React from 'react';
import { findDOMNode } from 'react-dom';
import { renderIntoDocument, findRenderedComponentWithType, Simulate } from 'react-addons-test-utils';
import FancyField from './../dist/FancyField';
import {fromJS, List, Map} from 'immutable';

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
    isEditable: false,
    typeaheadOptions: []
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

    describe('has typeaheadOptions', () => {
      it('should display them', () => {
        const component = createComponent({ typeaheadOptions: [{
          id: '1', label: 'meow'
        }, {
          id: '2', label: 'orange'
        }]});
        expect(component.refs.fancyFieldTypeaheadContainer).to.exist;

        const typeaheadItems = component.refs.fancyFieldTypeaheadContainer.querySelectorAll('li');
        expect(typeaheadItems.length).to.equal(2);
        expect(typeaheadItems[0].textContent).to.equal('meow');
        expect(typeaheadItems[1].textContent).to.equal('orange');
        expect(typeaheadItems[0].dataset.id).to.equal('1');
        expect(typeaheadItems[1].dataset.id).to.equal('2');
      });

      it('should display immutable lists', () => {
        const component = createComponent({ typeaheadOptions: fromJS([{
            id: '1', label: 'meow'
          }, {
            id: '2', label: 'orange'
          }])
        });
        expect(component.refs.fancyFieldTypeaheadContainer).to.exist;

        const typeaheadItems = component.refs.fancyFieldTypeaheadContainer.querySelectorAll('li');
        expect(typeaheadItems.length).to.equal(2);
        expect(typeaheadItems[0].textContent).to.equal('meow');
        expect(typeaheadItems[1].textContent).to.equal('orange');
        expect(typeaheadItems[0].dataset.id).to.equal('1');
        expect(typeaheadItems[1].dataset.id).to.equal('2');
      });
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
      expect(component.state.errorMessage).to.equal('invalid meow');
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
      expect(component.state.errorMessage).to.equal('invalid orange');
      expect(component.state.shouldShowError).to.be.false;
    });

    function showErrorTest(simulation) {
      const validator = sinon.stub().returns('invalid meow');
      const onChange = sinon.spy();
      const {parent, component} = createComponent({value: '', validator, onChange}, true);

      parent.setState({value: 'meow'});
      simulation(component);
      expect(component.state.shouldShowError).to.be.true;
      expect(component.state.errorMessage).to.equal('invalid meow');
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
      expect(component.state.errorMessage).to.equal('invalid meow');
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
      expect(errorMessage.textContent).to.equal('invalid meow');
    });

    describe('typeaheadOptions', () => {
      it('should give class active to different option items when arrow up and down through items', () => {
        const component = createComponent({ typeaheadOptions: fromJS([{
            id: '1', label: 'meow'
          }, {
            id: '2', label: 'orange'
          }])
        });
        const { fancyField, fancyFieldTypeaheadContainer } = component.refs;
        const typeaheadItems = fancyFieldTypeaheadContainer.querySelectorAll('li');
        Simulate.focus(fancyField);
        expect(component.state.isFocused).to.be.true;
        Simulate.keyDown(fancyField, {keyCode: 40});
        expect(typeaheadItems[0].classList.contains('fancy-field__typeahead-opt--active')).to.be.true;
        expect(typeaheadItems[1].classList.contains('fancy-field__typeahead-opt--active')).to.be.false;
        Simulate.keyDown(fancyField, {keyCode: 40});
        expect(typeaheadItems[0].classList.contains('fancy-field__typeahead-opt--active')).to.be.false;
        expect(typeaheadItems[1].classList.contains('fancy-field__typeahead-opt--active')).to.be.true;
        Simulate.keyDown(fancyField, {keyCode: 38});
        expect(typeaheadItems[0].classList.contains('fancy-field__typeahead-opt--active')).to.be.true;
        expect(typeaheadItems[1].classList.contains('fancy-field__typeahead-opt--active')).to.be.false;
        Simulate.keyDown(fancyField, {keyCode: 38});
        expect(typeaheadItems[0].classList.contains('fancy-field__typeahead-opt--active')).to.be.true;
        expect(typeaheadItems[1].classList.contains('fancy-field__typeahead-opt--active')).to.be.false;
        Simulate.keyDown(fancyField, {keyCode: 38});
        expect(typeaheadItems[0].classList.contains('fancy-field__typeahead-opt--active')).to.be.true;
        expect(typeaheadItems[1].classList.contains('fancy-field__typeahead-opt--active')).to.be.false;
      });

      it('should hide the typeahead options if user clicks escape', () => {
        const component = createComponent({ typeaheadOptions: fromJS([{
            id: '1', label: 'meow'
          }, {
            id: '2', label: 'orange'
          }])
        });
        const { fancyField, fancyFieldTypeaheadContainer } = component.refs;
        const typeaheadItems = fancyFieldTypeaheadContainer.querySelectorAll('li');
        Simulate.focus(fancyField);
        Simulate.keyDown(fancyField, {keyCode: 40});
        expect(typeaheadItems[0].classList.contains('fancy-field__typeahead-opt--active')).to.be.true;
        expect(typeaheadItems[1].classList.contains('fancy-field__typeahead-opt--active')).to.be.false;
        Simulate.keyDown(fancyField, {keyCode: 27});
        expect(fancyFieldTypeaheadContainer.classList.contains('fancy-field__typeahead--hidden')).to.be.true;
        expect(component.state.isFocused).to.be.false;
      });


      it('should select item on item click', () => {
        const onChange = sinon.spy();
        const component = createComponent({ onChange, typeaheadOptions: fromJS([{
            id: '1', label: 'meow'
          }, {
            id: '2', label: 'orange'
          }])
        });
        const { fancyField, fancyFieldTypeaheadContainer } = component.refs;
        const typeaheadItems = fancyFieldTypeaheadContainer.querySelectorAll('li');
        Simulate.focus(fancyField);
        Simulate.click(typeaheadItems[0]);
        expect(onChange.calledOnce).to.be.true;
        expect(onChange.calledWith(component.props.typeaheadOptions.get(0), '')).to.be.true;
      });

      it('should select item on item arrow down, then enter press', () => {
        const onChange = sinon.spy();
        const component = createComponent({ onChange, typeaheadOptions: fromJS([{
            id: '1', label: 'meow'
          }, {
            id: '2', label: 'orange'
          }])
        });
        const { fancyField, fancyFieldTypeaheadContainer } = component.refs;
        const typeaheadItems = fancyFieldTypeaheadContainer.querySelectorAll('li');
        Simulate.focus(fancyField);
        Simulate.keyDown(fancyField, {keyCode: 40});
        Simulate.keyDown(fancyField, {keyCode: 13});
        expect(onChange.calledOnce).to.be.true;
        expect(onChange.calledWith(component.props.typeaheadOptions.get(0), '')).to.be.true;
      });

      it('should update the arrowSelectedTypeaheadOpt when typeaheadOptions change or are empty', () => {
        const {parent, component} = createComponent({ typeaheadOptions: fromJS([{
            id: '1', label: 'meow'
          }, {
            id: '2', label: 'orange'
          }])
        }, true);
        const { fancyField, fancyFieldTypeaheadContainer } = component.refs;

        Simulate.focus(fancyField);
        Simulate.keyDown(fancyField, {keyCode: 40});
        expect(component.state.arrowSelectedTypeaheadOpt.dataset.id).to.equal('1');
        parent.setState({ typeaheadOptions: fromJS([{
            id: '11', label: 'woof'
          }, {
            id: '12', label: 'apple'
          }])
        });
        expect(component.state.arrowSelectedTypeaheadOpt).to.be.null;
        Simulate.focus(fancyField);
        Simulate.keyDown(fancyField, {keyCode: 40});
        expect(component.state.arrowSelectedTypeaheadOpt.dataset.id).to.equal('11');
        parent.setState({ typeaheadOptions: null });
        expect(component.state.arrowSelectedTypeaheadOpt).to.be.null;
      });
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
