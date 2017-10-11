import React from 'react';
import { mount } from 'enzyme';
import {fromJS} from 'immutable';
import FancyField from './../dist/FancyField';

const noop = () => {};

const createComponent = function(props = {}) {

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
    onChange: noop,
    onBlur: noop,
    tooltip: null,
    required: false,
    readOnly: false,
    isEditable: false,
    typeaheadOptions: []
  }, props);

  return mount( <FancyField {...state} /> );
};

const fancyFieldSelector = '.fancy-field__input';

context('FancyField', () => {
  describe('initial load', () => {
    it('should load', () => {
      const wrapper = createComponent();
      expect(wrapper.instance().fancyFieldEl).to.exist;
    });
    it('should have fancy-field--has-content class if there is a value', () => {
      const wrapper = createComponent({ value: 'banana'});
      expect(wrapper.instance().fancyFieldEl.parentNode.classList.contains('fancy-field--has-content')).to.be.true;
    });
    it('should have disabled property if disabled', () => {
      const wrapper = createComponent({disabled: true});
      expect(wrapper.instance().fancyFieldEl.hasAttribute('disabled')).to.be.true;
    });

    it('should be readonly if readonly is true', () => {
      const wrapper = createComponent({readOnly: false});
      expect(wrapper.instance().fancyFieldEl.hasAttribute('readonly')).to.be.false;
      wrapper.setProps({ readOnly: true });
      expect(wrapper.instance().fancyFieldEl.hasAttribute('readonly')).to.be.true;
    });

    describe('has typeaheadOptions', () => {
      it('should display them', () => {
        const wrapper = createComponent({ typeaheadOptions: [{
          id: '1', label: 'meow'
        }, {
          id: '2', label: 'orange'
        }]});
        expect(wrapper.instance().refs.fancyFieldTypeaheadContainer).to.exist;

        const typeaheadItems = wrapper.instance().refs.fancyFieldTypeaheadContainer.querySelectorAll('li');
        expect(typeaheadItems.length).to.equal(2);
        expect(typeaheadItems[0].textContent).to.equal('meow');
        expect(typeaheadItems[1].textContent).to.equal('orange');
        expect(typeaheadItems[0].dataset.id).to.equal('1');
        expect(typeaheadItems[1].dataset.id).to.equal('2');
      });

      it('should display immutable lists', () => {
        const wrapper = createComponent({ typeaheadOptions: fromJS([{
            id: '1', label: 'meow'
          }, {
            id: '2', label: 'orange'
          }])
        });
        expect(wrapper.instance().refs.fancyFieldTypeaheadContainer).to.exist;

        const typeaheadItems = wrapper.instance().refs.fancyFieldTypeaheadContainer.querySelectorAll('li');
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
      const wrapper = createComponent({ onChange });
      wrapper.setState({value: 'meow'});
      wrapper.find(fancyFieldSelector).simulate('change');
      expect(onChange.calledOnce).to.be.true;
      expect(onChange.calledWith('meow')).to.be.true;
    });

    context('type is number', () => {
      it('should replace all non digits if type=number', () => {
        const onChange = sinon.spy();
        const wrapper = createComponent({ onChange, type: 'number' });

        wrapper.setState({value: 'meow567'});
        wrapper.find(fancyFieldSelector).simulate('change');
        expect(onChange.calledOnce).to.be.true;
        expect(onChange.calledWith('567')).to.be.true;
      });
    });

    it('should call validation when this.props.value is updated', () => {
      const wrapper = createComponent({value: ''});
      expect(wrapper.state().hasAttemptedInput).to.be.false;
      expect(wrapper.state().value).to.equal('');
      wrapper.setProps({value: 'meow'});
      expect(wrapper.state().hasAttemptedInput).to.be.true;
      expect(wrapper.state().value).to.equal('meow');
    });

    it('should also pass through validator if there is a validator when this.props.value is updated', () => {
      const validator = sinon.stub().returns('invalid meow');
      const wrapper = createComponent({value: '', validator});

      wrapper.setProps({value: 'meow'});
      expect(validator.calledOnce).to.be.true;
      expect(validator.calledWith('meow')).to.be.true;
      expect(wrapper.state().errorMessage).to.equal('invalid meow');
      expect(wrapper.state().shouldShowError).to.be.false;
    });

    it('should also pass through multiple validator if there is an array of validators when this.props.value is updated', () => {
      const validator1 = sinon.stub().returns('invalid meow');
      const validator2 = sinon.stub().returns('invalid orange');
      const validator = [validator1, validator2];

      const wrapper = createComponent({value: '', validator});

      wrapper.setProps({value: 'meow'});
      expect(validator1.calledOnce).to.be.true;
      expect(validator2.calledOnce).to.be.true;
      expect(validator1.calledWith('meow')).to.be.true;
      expect(validator2.calledWith('meow')).to.be.true;
      expect(wrapper.state().errorMessage).to.equal('invalid orange');
      expect(wrapper.state().shouldShowError).to.be.false;
    });

    function showErrorTest(simulation) {
      const validator = sinon.stub().returns('invalid meow');
      const onChange = sinon.spy();
      const onBlur = sinon.spy();
      const wrapper = createComponent({value: '', validator, onChange, onBlur});

      wrapper.setProps({value: 'meow'});
      simulation(wrapper);
      expect(wrapper.state().shouldShowError).to.be.true;
      expect(wrapper.state().errorMessage).to.equal('invalid meow');
      return { onChange, onBlur };
    }

    it('should show error on blur', () => {
      const { onBlur } = showErrorTest((wrapper) => wrapper.find(fancyFieldSelector).simulate('blur'));
      expect(onBlur.calledOnce).to.be.true;
      expect(onBlur.calledWith('meow')).to.be.true;
    });

    it('should show error on hit of enter', () => {
      const { onChange } = showErrorTest((wrapper) =>
      wrapper.find(fancyFieldSelector).simulate('keyDown', {key: "Enter", keyCode: 13, which: 13}));
      expect(onChange.calledOnce).to.be.true;
      expect(onChange.calledWith('meow')).to.be.true;
    });

    it('should call onBlur if passed into wrapper instead of onChange', () => {
      const validator = sinon.stub().returns('invalid meow');
      const onBlur = sinon.spy();
      const onChange = sinon.spy();
      const wrapper = createComponent({value: '', validator, onBlur, onChange});

      wrapper.setProps({value: 'meow'});
      wrapper.find(fancyFieldSelector).simulate('blur');
      expect(wrapper.state().shouldShowError).to.be.true;
      expect(wrapper.state().errorMessage).to.equal('invalid meow');
      expect(onChange.called).to.be.false;
      expect(onBlur.calledOnce).to.be.true;
      expect(onBlur.calledWith('meow')).to.be.true;
    });

    it('should show show the error message in place of label', () => {
      const validator = sinon.stub().returns('invalid meow');
      const onChange = sinon.spy();
      const wrapper = createComponent({value: '', validator, onChange});

      wrapper.setProps({value: 'meow'});
      wrapper.find(fancyFieldSelector).simulate('blur');
      const errorMessage = wrapper.find('.fancy-field__label--error');
      expect(errorMessage).to.have.length(1);
      expect(errorMessage.text()).to.equal('invalid meow');
    });

    describe('typeaheadOptions', () => {
      it('should give class active to different option items when arrow up and down through items', () => {
        const wrapper = createComponent({ typeaheadOptions: fromJS([{
            id: '1', label: 'meow'
          }, {
            id: '2', label: 'orange'
          }])
        });
        const { fancyFieldTypeaheadContainer } = wrapper.instance().refs;
        const fancyField = wrapper.instance().fancyFieldEl;
        const typeaheadItems = fancyFieldTypeaheadContainer.querySelectorAll('li');
        wrapper.find(fancyFieldSelector).simulate('focus');
        expect(wrapper.state().isFocused).to.be.true;
        wrapper.find(fancyFieldSelector).simulate('keyDown', {keyCode: 40});
        expect(typeaheadItems[0].classList.contains('fancy-field__typeahead-opt--active')).to.be.true;
        expect(typeaheadItems[1].classList.contains('fancy-field__typeahead-opt--active')).to.be.false;
        wrapper.find(fancyFieldSelector).simulate('keyDown', {keyCode: 40});
        expect(typeaheadItems[0].classList.contains('fancy-field__typeahead-opt--active')).to.be.false;
        expect(typeaheadItems[1].classList.contains('fancy-field__typeahead-opt--active')).to.be.true;
        wrapper.find(fancyFieldSelector).simulate('keyDown', {keyCode: 38});
        expect(typeaheadItems[0].classList.contains('fancy-field__typeahead-opt--active')).to.be.true;
        expect(typeaheadItems[1].classList.contains('fancy-field__typeahead-opt--active')).to.be.false;
        wrapper.find(fancyFieldSelector).simulate('keyDown', {keyCode: 38});
        expect(typeaheadItems[0].classList.contains('fancy-field__typeahead-opt--active')).to.be.true;
        expect(typeaheadItems[1].classList.contains('fancy-field__typeahead-opt--active')).to.be.false;
        wrapper.find(fancyFieldSelector).simulate('keyDown', {keyCode: 38});
        expect(typeaheadItems[0].classList.contains('fancy-field__typeahead-opt--active')).to.be.true;
        expect(typeaheadItems[1].classList.contains('fancy-field__typeahead-opt--active')).to.be.false;
      });

      it('should hide the typeahead options if user clicks escape', (done) => {
        const wrapper = createComponent({ typeaheadOptions: fromJS([{
            id: '1', label: 'meow'
          }, {
            id: '2', label: 'orange'
          }])
        });
        const { fancyFieldTypeaheadContainer } = wrapper.instance().refs;
        const fancyField = wrapper.instance().fancyFieldEl;
        const typeaheadItems = fancyFieldTypeaheadContainer.querySelectorAll('li');
        wrapper.find(fancyFieldSelector).simulate('focus');
        wrapper.find(fancyFieldSelector).simulate('keyDown', {keyCode: 40});
        expect(typeaheadItems[0].classList.contains('fancy-field__typeahead-opt--active')).to.be.true;
        expect(typeaheadItems[1].classList.contains('fancy-field__typeahead-opt--active')).to.be.false;
        wrapper.find(fancyFieldSelector).simulate('keyDown', {keyCode: 27});
        setTimeout(() => {
          expect(fancyFieldTypeaheadContainer.classList.contains('fancy-field__typeahead--hidden')).to.be.true;
          expect(wrapper.state().isFocused).to.be.false;
          done();
        }, 200);
      });


      it('should select item on item click', () => {
        const onChange = sinon.spy();
        const wrapper = createComponent({ onChange, typeaheadOptions: fromJS([{
            id: '1', label: 'meow'
          }, {
            id: '2', label: 'orange'
          }])
        });
        const fancyField = wrapper.find(fancyFieldSelector);
        const typeaheadItems = wrapper.find('.fancy-field__typeahead li');
        fancyField.simulate('focus');
        typeaheadItems.first().simulate('click');
        expect(onChange.calledOnce).to.be.true;
        expect(onChange.calledWith(wrapper.props().typeaheadOptions.get(0), '')).to.be.true;
      });

      it('should select item on item arrow down, then enter press', () => {
        const onChange = sinon.spy();
        const wrapper = createComponent({ onChange, typeaheadOptions: fromJS([{
            id: '1', label: 'meow'
          }, {
            id: '2', label: 'orange'
          }])
        });
        const { fancyFieldTypeaheadContainer } = wrapper.instance().refs;
        const fancyField = wrapper.instance().fancyFieldEl;
        const typeaheadItems = fancyFieldTypeaheadContainer.querySelectorAll('li');
        wrapper.find(fancyFieldSelector).simulate('focus');
        wrapper.find(fancyFieldSelector).simulate('keyDown', {keyCode: 40});
        wrapper.find(fancyFieldSelector).simulate('keyDown', {keyCode: 13});
        expect(onChange.calledOnce).to.be.true;
        expect(onChange.calledWith(wrapper.props().typeaheadOptions.get(0), '')).to.be.true;
      });

      it('should update the arrowSelectedTypeaheadOpt when typeaheadOptions change or are empty', () => {
        const wrapper = createComponent({ typeaheadOptions: fromJS([{
            id: '1', label: 'meow'
          }, {
            id: '2', label: 'orange'
          }])
        });
        const { fancyFieldTypeaheadContainer } = wrapper.instance().refs;
        const fancyField = wrapper.instance().fancyFieldEl;

        wrapper.find(fancyFieldSelector).simulate('focus');
        wrapper.find(fancyFieldSelector).simulate('keyDown', {keyCode: 40});
        expect(wrapper.state().arrowSelectedTypeaheadOpt.dataset.id).to.equal('1');
        wrapper.setProps({ typeaheadOptions: fromJS([{
            id: '11', label: 'woof'
          }, {
            id: '12', label: 'apple'
          }])
        });
        expect(wrapper.state().arrowSelectedTypeaheadOpt).to.be.null;
        wrapper.find(fancyFieldSelector).simulate('focus');
        wrapper.find(fancyFieldSelector).simulate('keyDown', {keyCode: 40});
        expect(wrapper.state().arrowSelectedTypeaheadOpt.dataset.id).to.equal('11');
        wrapper.setProps({ typeaheadOptions: null });
        expect(wrapper.state().arrowSelectedTypeaheadOpt).to.be.null;
      });
    });

  });
  describe('tooltip', () => {
    it('should show the tooltip', () => {
      const tooltip = 'hello my friends this is a tooltip';
      const wrapper = createComponent({tooltip});
      const tooltipNode = wrapper.find('.fancy-field__tooltip');
      expect(tooltipNode).to.have.length(1);
    });
  });

});
