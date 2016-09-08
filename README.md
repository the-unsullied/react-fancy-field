# react-fancy-field

*A modern styled input field with animating effects built for React. Has built in validation effects.*

![FancyFieldDemo](https://github.com/the-unsullied/react-fancy-field/blob/demo/fancyfielddemo.gif)

## Install
```
npm install react-fancy-field --save
```

## Usage
```
  import FancyField from 'react-fancy-field';

  React.createClass({
    getInitialState(){
      return {
        note: 'my notes!',
        isEditing: false,
        triggerValidation: 0
      }
    },

    isFieldRequired(val, name) {
      return val && typeof val === 'string' && val.length > 0;
    },

    render() {
      const { note, isEditing } = this.state;
      <FancyField value={note}
        label='Notes'
        disabled={isEditing}
        required={true}
        name='noteInput'
        triggerValidation={triggerValidation}
        validator={this.isFieldRequired}
        onChange={val => this.setState({note: val})}
        placeholder='Fill in note here...'/>
      }
  });
```


## Params

**name** {String} name of input

**type** {String} type of input (text, number, etc..)

**triggerValidation** {Integer} Increment this value to trigger validation.

**label** {String} label of input

**classes** {String} class(es) to put on to the <FancyButton /> element.

**placeholder** {String} placeholder of input.

**validator** {Method || Array} validator If falsy, field is valid. If is string, field is *invalid* and string will be error message. If validator is an Array, it will iterate over all validators in array and display all messages.

**value** {String} value of the input field. Can be used to set the initial value.

**onChange** {Method} method that is called onChange event.

**tooltip** {String} shows a tooltip to left of input value.

**required** {Boolean} indicator to show that input is required

**readOnly** {Boolean} disabled state, but does not look disabled. Will look like its editable.

**isEditable** {Boolean} will make field look editable by giving the border a blue underline.

**icon** {JSX} any image that should appear to the left of the field


## Tooltip
To have a working tooltip you must include the [svg image](https://github.com/the-unsullied/react-fancy-field/blob/master/assets/unsullied-help.svg) in your application. Then add the background property to your css:

```
.unsullied-icon-help {
  background-image: url('/path/to/img/unsullied-help.svg');
  @include vendor('transform', scale(0.75)); // can omit this or edit scale multiplier as necessary
}
```

## Tests:
To run the tests you can either run:
```
  npm test
```

OR

```
  npm test -- --debug=true // for debug mode in chrome
```
