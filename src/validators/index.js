import { getFieldValue, getFieldErrDOM, appendErrMessage, removeErrMessage, getErrMessageText, regexRules } from "../helpers/index.js"

// Required fields validator
export const requiredValidator = async ({field, resolve}) => {
    const input = document.getElementById(`swInput${field.key}`)
    const value = await getFieldValue({field, input})
    let [isValid, errKey] = [true, '']
    const setErr = (key) => [isValid, errKey] = [false, key]

    if (!value) {
        if (getFieldErrDOM(field.key)) removeErrMessage({field})
        appendErrMessage(field.key, getErrMessageText({field, errType: 'required'}), 'required'), setErr('required')
    } else if (getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') == 'required') removeErrMessage({field})
    if(resolve) resolve({field: field.key, isValid, errKey})
}

// Email validator
export const emailValidator = async ({field, resolve}) => {
    const input = document.getElementById(`swInput${field.key}`)
    const value = await getFieldValue({field, input})
    let [isValid, errKey] = [true, '']
    const setErr = (key) => [isValid, errKey] = [false, key]


    if (!regexRules.email.test(value) && !getFieldErrDOM(field.key)) appendErrMessage(field.key, `The <b>${field.label}</b> field must be a valid email`, 'email'), setErr('email')
    else if (getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') == 'email') removeErrMessage({field})
    if(resolve) resolve({field: field.key, isValid, errKey})
}

// File validator - Only handles file type for now. TODO : File size
export const fileValidator = async ({field, resolve}) => {
    const input = document.getElementById(`swInput${field.key}`)
    const value = await getFieldValue({field, input})
    let [isValid, errKey] = [true, '']
    const setErr = (key) => [isValid, errKey] = [false, key]

    if(value && field.attributes && field.attributes.accept) {
        const accepted = field.attributes.accept.split(', ')
        if(!accepted.includes(value.fileType))  appendErrMessage(field.key, `<b>Invalid file extension.</b> Accepted formats : ${field.attributes.accept}`, 'fileFormat'), setErr('fileFormat')
        else if(getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') === 'fileFormat') removeErrMessage({field})
    }
    input.blur()
    if(resolve) resolve({field: field.key, isValid, errKey})
}

// Handles custom validation functions provided by user
export const customValidator = ({field, customValidators, resolve}) => {
    const input = document.getElementById(`swInput${field.key}`)
    let [isValid, errKey] = [true, '']
    const setErr = (key) => [isValid, errKey] = [false, key]

    if(field.customValidation) {
        field.customValidation.forEach(validator => {
            if(customValidators[validator]) {
                new Promise(async resolve => {
                    const { value, ...rest } = field
                    customValidators[validator]({ value: await getFieldValue({field, input}), field: rest, validate: resolve });
                }).then(data => {
                    const { isValid, message, force } = data
                    if(!isValid && message) {
                        if(force && getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') != validator) removeErrMessage({field})
                        if(!getFieldErrDOM(field.key)) appendErrMessage(field.key, message, validator), setErr(validator)
                    } else if(getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') === validator) removeErrMessage({field})
                });
            }  
        })
    }
    if(resolve) resolve({field: field.key, isValid, errKey})
}
