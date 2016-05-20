# react-fancy-field

A modern styled input field with animating effects built for React. Has built in validation effects.


## Params

**name** {String} name of input

**type** {String} type of input (text, number, etc..)

**triggerValidation** {Integer} Increment this value to trigger validation.

**label** {String} label of input

**classes** {String} class(es) to put on to the <FancyButton /> element.

**placeholder** {String} placeholder of input.

**validator** {Method} If returns false, field is valid. If is returns string, field is *invalid* and string will be error message.

*initialVal* **[DEPRECATED]** {String} initial string or number that is contained in the input field.

**value** {String} value of the input field. Can be used to set the initial value.

**onChange** {Method} method that is called onChange event.


#Notes: 

Please don't use initialVal. If you need to set an initial value just pass it to `value`.
