# react-fancy-field

A modern styled input field with animating effects built for React. Has built in validation effects.


## Params

**name** {String} name of input

**type** {String} type of input (text, number, etc..)

**triggerValidation** {Integer} Increment this value to trigger validation.

**label** {String} label of input

**placeholder** {String} placeholder of input.

**validator** {Method} If returns false, field is valid. If is returns string, field is *invalid* and string will be error message.

**initialVal** {String} initial string or number that is contained in the input field.

**onChange** {Method} method that is called onChange event.
