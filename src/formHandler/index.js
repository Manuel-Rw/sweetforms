import { mapFieldAttributes, getFieldValue } from "../helpers/index.js"
import { requiredValidator, emailValidator, customValidator, fileValidator } from "../validators/index.js"

// Finishing the form setup on render
export const formDidRender = ({fields}) => {
    const inputs = document.querySelectorAll(fields.map(field => `#swInput${field.key}`))
    inputs.forEach(input => {
        let field = fields.find(field => input.id.includes(field.key))
        if(field.attributes && mapFieldAttributes({field})) mapFieldAttributes({field}).forEach(attr => input.setAttribute(attr.key, attr.value))
        if(document.getElementById(`swRangeVal${field.key}`)) document.getElementById(`swRangeVal${field.key}`).innerHTML = document.getElementById(`swInput${field.key}`).value
        input.addEventListener("focusin", () => input.classList.add('swFocus'))
        input.addEventListener("focusout", () => input.classList.remove('swFocus'))
    })
}

// Handling differents inputs event listeners / fields reactive validation
export const formDidOpen = async ({ fields, customValidators }) => {
    const inputs = document.querySelectorAll(fields.map(field => `#swInput${field.key}`))
    inputs.forEach(input => {
        let field = fields.find(field => input.id.includes(field.key))
        if (['date', 'datetime-local' , 'time', 'month', 'week', 'file', 'checkbox', 'radio', 'select'].includes(field.type)) {
            input.addEventListener('change', async () => {
                if(field.validation && field.validation.includes('required')) requiredValidator({field})
                if(field.type === 'file') fileValidator({field})
                if(field.customValidation && customValidators) customValidator({field, customValidators})
            })
        } else {
            input.addEventListener("keyup", async () => {
                if(field.validation && field.validation.includes('required')) requiredValidator({field})
                if(field.validation && field.validation.includes('email')) emailValidator({field})
                if(field.customValidation && customValidators) customValidator({field, customValidators})
            })
        }
    })
}

// Check form / step before submit / next step
export const formPreCheck = async ({ fields, customValidators }) => {
    return Promise.all(fields.map(field => {
        return new Promise(async (resolve) => {
            const input = document.getElementById(`swInput${field.key}`)
            let fieldRes = {
                fieldKey: field.key, 
                value: await getFieldValue({field, input}),
                isValid: true,
                errors: [],
            }
            const setError = (err) => [fieldRes.errors, fieldRes.isValid] = [[...fieldRes.errors, err], false]

            const validationPromises = []
            if(field.validation && field.validation.includes('required')) validationPromises.push(new Promise((resolve) => requiredValidator({field, resolve})))
            if(field.validation && field.validation.includes('email')) validationPromises.push(new Promise((resolve) => emailValidator({field, resolve})))
            if(field.type === 'file')  validationPromises.push(new Promise((resolve) => fileValidator({field, resolve})))
            if(field.customValidation && customValidators) validationPromises.push(new Promise((resolve) => customValidator({field, customValidators, resolve})))

            if(validationPromises) {
                Promise.all(validationPromises)
                .then((validationRes) => {
                    validationRes.forEach(res => {
                        if(!res.isValid) setError(res.errKey)
                    })
                    resolve(fieldRes)
                })
            } else resolve(fieldRes)
        })
    }))
}