import Swal from "sweetalert2";
import axios from "axios";
import './styles/swalForm.css'

/* eslint-disable no-unused-vars  */
/* eslint-disable no-useless-escape  */
/* eslint-disable no-async-promise-executor  */



const regexEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const blobToData = (blob) => {
    return new Promise((resolve) => {
        if (!blob) {
            resolve(null)
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
    })
}

const swalBase = ({ themeOptions }) => {
    console.log({themeOptions})
    return {
        showCloseButton: true,
        buttonsStyling: false,
        confirmButtonClass:  themeOptions && themeOptions.confirmButtonClass ? themeOptions.confirmButtonClass : "actionBtn",
        cancelButtonClass: themeOptions && themeOptions.cancelButtonClass ? themeOptions.cancelButtonClass : "actionBtn btnDanger",
        background: themeOptions && themeOptions.darkMode ? "#262C49" : "",
        showCancelButton: true,
        customClass: {
            htmlContainer:  themeOptions && themeOptions.darkMode ? "darkMode" : ''
        }
    };
}

const appendErrMessage = (fieldKey, message, errKey) => {
    const wrapper = document.getElementById(`field_${fieldKey}`)
    const input = document.getElementById(`swInput${fieldKey}`)

    const errMessage = document.createElement('div')
    errMessage.innerHTML =
        `<div id="err_${fieldKey}" class="swErrAlert">
        <div class="alertBloc">
            <span>${message}</span>
        </div>
    </div>`
    errMessage.children[0].classList.add('errMessage')
    errMessage.children[0].setAttribute('errkey', errKey)
    wrapper.appendChild(errMessage)
    input.classList.add('swError')
}

const mapFieldAttributes = ({field}) => {
    console
    return field.attributes ? Object.keys(field.attributes)
    .filter(attrKey => ['accept', 'autocomplete', 'autofocus', 'disabled', 'list', 'min', 'max', 'step', 'maxlength', 'pattern', 'readonly'].includes(attrKey))
    .map(attrKey => `${attrKey}="${field.attributes[attrKey]}"`)
    .join(' ') : ''
}

const getFieldValue = async ({field, input}) => {
    if(field.type == 'file') return input.files[0] ? {fileName: input.files[0].name, fileData: await blobToData(input.files[0])} : null
    else if(field.type == 'checkbox') return input.checked
    else if(field.type == 'radio') {
        const radioInputs = document.querySelectorAll(`#swInput${field.key}`)
        let selectedVal
        for(const radio of radioInputs) {
            if(radio.checked) selectedVal = radio.value
        }
        return selectedVal || ""
    }
    else return input.value
}

const getFieldErrDOM = (key) => document.getElementById(`err_${key}`)

const formLoaded = async ({ fields }) => {
    const inputs = document.querySelectorAll(fields.map(field => `#swInput${field.key}`))
    for (let i = 0; i < inputs.length; i++) {
        let field = fields.find(field => inputs[i].id.includes(field.key))
        // Init range input displayed value
        if(document.getElementById(`swRangeVal${field.key}`)) document.getElementById(`swRangeVal${field.key}`).innerHTML = document.getElementById(`swInput${field.key}`).value

        if (['text', 'email', 'number', 'textarea'].includes(field.type) || !field.type) {
            inputs[i].addEventListener("keyup", async (e) => {
                if (field.validation) {
                    if (field.validation.includes('required')) {
                        if (!e.target.value) {
                            if (getFieldErrDOM(field.key)) getFieldErrDOM(field.key).remove()
                            appendErrMessage(field.key, `The <b>${field.label}</b> field can't be empty`, 'required')
                        }
                        else if (getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') == 'required') {
                            getFieldErrDOM(field.key).remove()
                            inputs[i].classList.remove('swError')
                        }
                    }
                    if (field.validation.includes('email')) {
                        if (!regexEmail.test(e.target.value)) {
                            if (!getFieldErrDOM(field.key)) appendErrMessage(field.key, `The <b>${field.label}</b> field must be a valid email`, 'email')
                        }
                        else if (getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') == 'email') {
                            getFieldErrDOM(field.key).remove()
                            inputs[i].classList.remove('swError')
                        }
                    }

                    if (field.validation.find(validator => validator.includes('requestCheck'))) {
                        let [validator, requestUrl, requestType, sentReqKey, isValidKey, reverse] = field.validation.find(validator => validator.includes('requestCheck')).split('~')
                        let requestBody = {[sentReqKey ||'value']: e.target.value}
                        const requestRes = await axios[requestType || 'post'](requestUrl, requestBody)
                        .then((response) => response.data)
                        .catch(err => {
                            return {success: false, err: err}
                        })
    
                        if(requestRes.success) {
                            if (reverse == 'true' ? requestRes[isValidKey || 'isValid'] : !requestRes[isValidKey || 'isValid']) {
                                if (!getFieldErrDOM(field.key)) appendErrMessage(field.key, `This <b>${field.label}</b> is not available`, 'requestCheck')
                            }
                            else if (getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') == 'requestCheck') {
                                getFieldErrDOM(field.key).remove()
                                inputs[i].classList.remove('swError')
                            }
                        }
                    }   
                }
            })
        }


        else if (['file'].includes(field.type)) {
            const humanFileSize = (size) => {
                var i = Math.floor(Math.log(size) / Math.log(1024));
                return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
            }
            inputs[i].addEventListener('change', async (evt) => {
                const file = evt.target.files[0];
                if (file && getFieldErrDOM(field.key)) {
                    getFieldErrDOM(field.key).remove()
                    inputs[i].classList.remove('swError')
                }
                if(file && field.attributes && field.attributes.accept) {
                    const accepted = field.attributes.accept.split(', ')
                    if(!accepted.includes(file.type)) {
                        appendErrMessage(field.key, `<b>Invalid file extension.</b> Accepted formats : ${field.attributes.accept}`, 'fileFormat')
                        inputs[i].classList.add('swError')
                    }
                    else if(getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('fileFormat') === '') {
                        getFieldErrDOM(field.key).remove()
                        inputs[i].classList.remove('swError')
                    }
                }
                evt.target.blur()
            })
        }

        else if (['date', 'datetime-local' , 'time', 'month', 'week'].includes(field.type)) {
            inputs[i].addEventListener('change', async (evt) => {
                if (field.validation) {
                    if (field.validation.includes('required')) {
                        if (!inputs[i].value) {
                            if (getFieldErrDOM(field.key)) getFieldErrDOM(field.key).remove()
                            appendErrMessage(field.key, `The <b>${field.label}</b> field can't be empty`, 'required')
                        }
                        else if (getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') == 'required') {
                            getFieldErrDOM(field.key).remove()
                            inputs[i].classList.remove('swError')
                        }
                    }
                }
            })
        }

        else if(['checkbox'].includes(field.type)) {
            inputs[i].addEventListener('change', (e) => {
                if (field.validation.includes('required')) {
                    if(!e.target.checked) {
                        if(!getFieldErrDOM(field.key) ) appendErrMessage(field.key, `The <b>${field.label}</b> field must be checked !`, 'required')
                    } else if(getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') == 'required')  {
                        getFieldErrDOM(field.key).remove()
                        inputs[i].classList.remove('swError')
                    }
                }
            })
        }

        else if(['radio'].includes(field.type)) {
            inputs[i].addEventListener('change', async () => {
                if (field.validation.includes('required')) {
                    const fieldValue = await getFieldValue({field})
                    if(!fieldValue) {
                        if(!getFieldErrDOM(field.key) ) appendErrMessage(field.key, `The <b>${field.label}</b> field must have a selected value`, 'required')
                    } else if(getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') == 'required')  {
                        getFieldErrDOM(field.key).remove()
                        inputs[i].classList.remove('swError')
                    }
                }
            })
        }

        inputs[i].addEventListener("focusin", () => {
            inputs[i].classList.add('swFocus')
        })

        inputs[i].addEventListener("focusout", () => {
            inputs[i].classList.remove('swFocus')
        })
    }
}

const formPreCheck = async ({ fields }) => {
    return Promise.all(fields.map(field => {
        return new Promise(async (resolve, reject) => {
            const input = document.getElementById(`swInput${field.key}`)
            let fieldRes = {
                fieldKey: field.key, 
                value: await getFieldValue({field, input}),
                isValid: true,
                errors: [],
            }
            const setError = (err) => [fieldRes.errors, fieldRes.isValid] = [[...fieldRes.errors, err], false]

            const validationPromises = []
            if (field.validation) {
                if (field.validation.includes('required')) {
                    validationPromises.push(new Promise((resolve) => {
                        if (!fieldRes.value) {
                            if (!getFieldErrDOM(field.key)) appendErrMessage(field.key, `The <b>${field.label}</b> field can't be empty`, 'required')
                            setError('required')
                        }
                        else if (getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') == 'required') {
                            getFieldErrDOM(field.key).remove()
                            input.classList.remove('swError')
                        }
                        resolve()
                    }))
                }
                if (field.validation.includes('email')) {
                    validationPromises.push(new Promise((resolve) => {
                        if (!regexEmail.test(fieldRes.value)) {
                            if (!getFieldErrDOM(field.key)) appendErrMessage(field.key, `The <b>${field.label}</b> field must be a valid email`, 'email')
                            setError('email')
                        }
                        else if (getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') == 'email') {
                            getFieldErrDOM(field.key).remove()
                            input.classList.remove('swError')
                        }
                        resolve()
                    }))
                }
                if (field.validation.find(validator => validator.includes('requestCheck'))) {
                    validationPromises.push(new Promise(async (resolve) => {
                        let [validator, requestUrl, requestType, sentReqKey, isValidKey, reverse] = field.validation.find(validator => validator.includes('requestCheck')).split('~')
                        let requestBody = {[sentReqKey ||'value']: fieldRes.value}
                        const requestRes = await axios[requestType || 'post'](requestUrl, requestBody)
                        .then((response) => response.data)
                        .catch(err => {
                            return {success: false, err: err}
                        })
    
                        if(requestRes.success) {
                            if (reverse == 'true' ? requestRes[isValidKey || 'isValid'] : !requestRes[isValidKey || 'isValid']) {
                                if (!getFieldErrDOM(field.key)) appendErrMessage(field.key, `This <b>${field.label}</b> is not available`, 'requestCheck')
                                setError('requestCheck')
                            }
                            else if (getFieldErrDOM(field.key) && getFieldErrDOM(field.key).getAttribute('errkey') == 'requestCheck') {
                                getFieldErrDOM(field.key).remove()
                                input.classList.remove('swError')
                            }
                        }
                        resolve()
                    }))
                }  
            }

            if(field.attributes) {
                if(field.attributes.accept && field.type === 'file' && fieldRes.value) {
                    const file = document.getElementById('swInput' + field.key).files[0]
                    const accepted = field.attributes.accept.split(', ')
                    if(file && !accepted.includes(file.type)) setError('fileFormat')
                }
                
            }

            if(validationPromises) {
                Promise.all(validationPromises)
                .then(() => resolve(fieldRes))
                .catch(() => resolve(fieldRes))
            } else resolve(fieldRes)
        })
    }))
}

const formTemplateRenderer = ({ step, itemsByLine, maxHeight, themeOptions, stepper }) => {
    //     ${step.title ? `<div style="${themeOptions && themeOptions.darkMode ? 'color:#fff;' : ''}" class="w-full text-center">${step.title}</div>` : ''}
    const stepsLenArray = []
    for(let i = 0; i < stepper.total; i++) stepsLenArray.push(i)
    return `<div class="progress-container">
    <div class="progress" id="progress" style="width:${((stepper.current - 1) / (stepper.total - 1)) * 100}%;"></div>
        ${stepsLenArray.map((val, key) => {
            return `<div id="progressStep${key + 1}" class="circle ${key + 1 < stepper.current ? 'done' : key + 1 === stepper.current ? 'active' : ''}">${key + 1 < stepper.current ? '✓' : key + 1}</div>`
        })}
    </div>
    </div>

    <div class="swFormBloc" style="display: grid;grid-template-columns: repeat(${step.itemsByLine || itemsByLine || 2}, 1fr);grid-gap: 1em;margin-bottom: 20px;margin-top: 20px;max-height:${maxHeight ? maxHeight : '65vh;'};padding-right: 10px;overflow-y: scroll">
        ${step.fields.map(field => {
        if (field.type === 'select') {
            return `<div id="field_${field.key}" style="${field.fullWidth ? `grid-column: auto / span ${step.itemsByLine || itemsByLine || 2};` : ''}line-break:before;width:auto;text-align:left;" class="${themeOptions && themeOptions.darkMode ? "selectDark" : ""}"  class="fieldBloc">
                    <label style="margin-left:0;" class="mb-2">${field.label} ${field.validation && field.validation.includes('required') ? '*' : ''}</label>
                    <div class="select mt-2">
                        <select name="slct" id="swInput${field.key}">
                            ${field.options.map(option => `<option ${option.value == field.value ? 'selected' : ''} value="${option.value}">${option.label}</option>`)}
                        </select>
                    </div>
                </div>`
        }

        else if (field.type == 'checkbox') {
            return `<div id="field_${field.key}" style="${field.fullWidth ? `grid-column: auto / span ${step.itemsByLine || itemsByLine || 2};` : ''}width: auto; display: flex; gap: 1em;align-items:center;justify-content: space-between" class="fieldBloc">
                    <label>${field.label} ${field.validation && field.validation.includes('required') ? '*' : ''}</label>
                    <input ${mapFieldAttributes({field})} type=${field.type} value="${field.value}" id="swInput${field.key}" ${field.type === 'checkbox' && field.value ? `checked` : ''} class="mt-2"/>
                </div>`
        }

        else if (field.type == 'range') {
            return `<div id="field_${field.key}" style="${field.fullWidth ? `grid-column: auto / span ${step.itemsByLine || itemsByLine || 2};` : ''}width: auto;text-align:left; display: flex;flex-direction: column;" class="fieldBloc">
                <label style="margin-left:0;">${field.label}  ${field.validation && field.validation.includes('required') ? '*' : ''}</label>
                <div style="display:flex;flex-direction:column;justify-content: center;height: auto;margin: auto 0;">
                    <label style="text-align:center;margin-bottom: 5px;" id="swRangeVal${field.key}"></label>
                    <input ${mapFieldAttributes({field})} autocomplete="off" aria-autocomplete="off" type=${field.type}  placeholder="${field.placeholder || ''}" id="swInput${field.key}" value="${field.value}" class="rangeSlider mt-2" oninput="document.getElementById('swRangeVal${field.key}').innerHTML = document.getElementById('swInput${field.key}').value"/>
                </div>
            </div>`
        }

        else if (field.type == 'radio') {
            return `<div id="field_${field.key}" style="${field.fullWidth ? `grid-column: auto / span ${step.itemsByLine || itemsByLine || 2};` : ''}display: flex; flex-direction: column;width: auto;text-align:left;" class="fieldBloc">
                    <label style="align-self: start">Choose ${field.label} ${field.validation && field.validation.includes('required') ? '*' : ''}</label>
                    <div style="padding: 1em;justify-self: center;display: flex; justify-content: space-evenly;flex-wrap: wrap;margin-top: auto;height: 100%;align-items: center; gap: 1.2em;">
                        ${field.options.map(option => {
                            return `<div style="display: flex; align-items: center; gap: .5em;">
                                <input ${mapFieldAttributes({field})} type="radio" name="${field.key}" value="${option.value}" id="swInput${field.key}" ${field.value == option.value ? `checked` : ''}/>
                                <label>${option.label}</label>
                            </div>`
                        })}
                    </div>
                    
                </div>`
        }

        else return `<div id="field_${field.key}" style="${field.fullWidth ? `grid-column: auto / span ${step.itemsByLine || itemsByLine || 2};` : ''}width: auto;text-align:left;" class="fieldBloc">
                <label style="margin-left:0;">${field.label} ${field.validation && field.validation.includes('required') ? '*' : ''}</label>
                <input ${mapFieldAttributes({field})} autocomplete="off" aria-autocomplete="off" type=${field.type} placeholder="${field.placeholder || ''}" id="swInput${field.key}" value="${field.value}" class="swInput mt-2"/>
            </div>`
    })}`.replaceAll('>,<', "><")
}


export const swalStepForm = ({ httpRequest, steps, width, maxHeight, itemsByLine, themeOptions }) => {
    return new Promise((resolve, reject) => {
        Swal
            .mixin({
                confirmButtonText: "Next &rarr;",
                showCancelButton: true,
            })
            .queue(steps.map((step, index) => {
                return {
                    ...swalBase({themeOptions}),
                    width: step.width || width || 600,
                    title: `<span style="${themeOptions && themeOptions.darkMode ? 'color: #fff;' : ''}">Step ${index + 1} - ${step.title}</span>`,
                    focusConfirm: false,
                    confirmButtonText: index == steps.length - 1 ? "Submit" : "Next",
                    html: formTemplateRenderer({ step, itemsByLine, maxHeight, themeOptions, stepper:  {current: index + 1, total: steps.length}}),
                    didOpen: () => {
                        return formLoaded({ fields: step.fields })
                    },
                    preConfirm: () => {
                        return formPreCheck({ fields: step.fields, stepper: {current: index + 1, total: steps.length} }).then((data) => {
                            const fieldErrs = data.filter(field => !field.isValid)
                            const progressStep = document.getElementById(`progressStep${index + 1}`)
                            if(fieldErrs.length) {
                                if(!progressStep.classList.contains('error')) {
                                    progressStep.classList.add('error')
                                    progressStep.innerHTML = '✕'
                                }
                                return false
                            }
                            else {
                                if(progressStep.classList.contains('error')) progressStep.classList.remove('error')
                                let result = {}
                                data.forEach(field => {
                                    result[field.fieldKey] = field.value
                                })
                                return result
                            }
                        })
                    }
                }
            })).then((result) => {
                const formData = result.value.reduce(((r, c) => Object.assign(r, c)), {})
                if (!httpRequest) resolve({ success: true, data: formData })
                else {
                    axios[httpRequest.requestType || 'post'](httpRequest.requestUrl, { ...formData, ...httpRequest.lockedFields }, { headers: { ...httpRequest.headers } })
                        .then((response) => {
                            resolve({ success: true, data: formData })
                            if (response.data.success) {
                                Swal.fire({
                                    ...swalBase({themeOptions}),
                                    icon: "success",
                                    title: httpRequest.successMessage || "Operation successful !",
                                    showConfirmButton: false,
                                    showCloseButton: true,
                                    timer: 2000,
                                    timerProgressBar: true,
                                });
                            } else
                                Swal.fire({
                                    ...swalBase({themeOptions}),
                                    icon: "error",
                                    title: httpRequest.errorMessage || `Error, operation failed`,
                                    text: response.data.message || "An unknow error has occured !",
                                    showConfirmButton: false,
                                    showCloseButton: true,
                                    timer: 2000,
                                    timerProgressBar: true,
                                    showCancelButton: false
                                });
                        })
                        .catch((err) => {
                            resolve({ success: true, err, data: formData })
                            Swal.fire({
                                ...swalBase({themeOptions}),
                                icon: "error",
                                title: httpRequest.errorMessage || `Error, operation failed`,
                                text: err || "An unknow error has occured !",
                                showConfirmButton: false,
                                showClosebutton: true,
                                timer: 2000,
                                timerProgressBar: true,
                                showCancelButton: false
                            });
                        });
                }
            })


    })

}




const swalDelete = ({ requestUrl, itemName, itemType, requestType }) => {
    return new Promise((resolve, reject) => {
        Swal.fire({
            ...swalBase(),
            title: `Delete this ${itemType ? itemType : 'item'} ?`,
            text: itemName || "",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(result => {
            if (result.isConfirmed) {
                axios[requestType || 'post'](requestUrl)
                    .then(response => {
                        resolve({ success: true })
                        if (response.data.success)
                            Swal.fire({
                                ...swalBase(),
                                icon: "success",
                                title: `${itemType ? itemType : 'item'} set deleted !`,
                                showConfirmButton: false,
                                showCloseButton: true,
                                timer: 2000,
                                timerProgressBar: true
                            });
                        else
                            Swal.fire({
                                ...swalBase(),
                                icon: "error",
                                title: "Error, interview set not deleted !",
                                text: response.data.message || "An unknow error has occured !",
                                showConfirmButton: false,
                                showCloseButton: true,
                                timer: 2000,
                                timerProgressBar: true
                            });
                    })
                    .catch(err => {
                        resolve({ success: false, err: err })
                        Swal.fire({
                            ...swalBase(),
                            icon: "error",
                            title: "Error, interview set not deleted !",
                            text: err || "An unknow error has occured !",
                            showConfirmButton: false,
                            showClosebutton: true,
                            timer: 2000,
                            timerProgressBar: true
                        });
                    });
            }
        })
    })
};



// const swalForm = async ({ httpRequest, fields, itemType, title, width, itemsByLine }) => {
//     // {
//     //         key: "first_name", // [String] File key in formData
//     //         value: "Cypri",// [String] | input value
//     //         type: "text", // [String] | select
//     //         options: [], // [Array] | Optional : for select options
//     //         label: "" // [String] | fieldValue,
//     //         validation: {
//     //             required: true
//     //         }
//     //       },
//     return new Promise(async (resolve) => {
//         const { value: formValues } = await Swal.fire({
//             ...swalBase(),
//             showCancelButton: true,
//             title: title || `Edit ${itemType}`,
//             width: width || 620,
//             html:
//                 `<div style="display: grid;grid-template-columns: repeat(${itemsByLine || 2}, 1fr);grid-gap: 1em;margin-bottom: 20px;margin-top: 20px;">
//                 ${fields.map(field => {
//                     if (field.type === 'select') {
//                         return `<div id="field_${field.key}" style="width:auto;" class="${store.state.theme == "dark" ? "selectDark" : ""}">
//                             <label class="mb-2">${field.label}</label>
//                             <div class="select mt-2">
//                                 <select name="slct" id="swInput${field.key}">
//                                     ${field.options.map(option => `<option ${option.value == field.value ? 'selected' : ''} value="${option.value}">${option.label}</option>`)}
//                                 </select>
//                             </div>
//                         </div>`
//                     }

//                     else if (field.type == 'checkbox') {
//                         return `<div id="field_${field.key}" style="width: auto; display: flex; gap: 1em;align-items:center;justify-content: space-between">
//                             <label>${field.label}</label>
//                             <input type=${field.type} value="${field.value}" id="swInput${field.key}" ${field.type === 'checkbox' && field.value ? `checked` : ''} class="mt-2"/>
//                         </div>`
//                     }

//                     else if (field.type == 'radio') {
//                         return `<div id="field_${field.key}" style="width: auto">
//                             <label>${field.label}</label>
//                             <input type=${field.type} value="${field.value}" id="swInput${field.key}" ${field.type === 'checkbox' && field.value ? `checked` : ''} class="mt-2 vs-inputx vs-input--input normal"/>
//                         </div>`
//                     }

//                     else return `<div id="field_${field.key}" style="width: auto;text-align:left;">
//                         <label style="margin-left:0;">${field.label}</label>
//                         <input autocomplete="off" type="${field.type}" placeholder="${field.placeholder || ''}" value="${field.value}" id="swInput${field.key}" value="${field.value}" class="mt-2 vs-inputx vs-input--input normal"/>
//                     </div>`
//                 })}
//             </div>`.replaceAll('>,<', "><"),
//             focusConfirm: false,
//             confirmButtonText: "Save",
//             didOpen: () => {
//                 return formLoaded({ fields })
//             },
//             preConfirm: () => {
//                 return formPreCheck({ fields }).then((data) => {
//                     const fieldErrs = data.filter(field => !field.isValid)
//                     if(fieldErrs.length) return false
//                     else {
//                         let result = {}
//                         data.forEach(field => {
//                             result[field.fieldKey] = field.value
//                         })
//                         return result
//                     }
//                 })
//             }
//         });

//         if (formValues) {
//             if (!httpRequest) {
//                 resolve({ success: true, formValues })
//                 return
//             }

//             const { requestUrl, requestType, lockedFields, headers, responseSuccessKey } = httpRequest

//             axios[requestType || 'post'](requestUrl, { ...formValues, ...lockedFields }, { headers})
//                 .then((response) => {
//                     resolve({ success: true, data: formValues })
//                     if (response.data[responseSuccessKey || 'success']) {
//                         Swal.fire({
//                             ...swalBase(),
//                             icon: "success",
//                             title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} updated`,
//                             showConfirmButton: false,
//                             showCloseButton: true,
//                             timer: 2000,
//                             timerProgressBar: true,
//                         });
//                     } else
//                         Swal.fire({
//                             ...swalBase(),
//                             icon: "error",
//                             title: `Error, ${itemType} not updated !`,
//                             text: response.data.message || "An unknow error has occured !",
//                             showConfirmButton: false,
//                             showCloseButton: true,
//                             timer: 2000,
//                             timerProgressBar: true,
//                         });
//                 })
//                 .catch((err) => {
//                     resolve({ success: false, formValues, err })
//                     Swal.fire({
//                         ...swalBase(),
//                         icon: "error",
//                         title: `Error, ${itemType} not updated !`,
//                         text: err || "An unknow error has occured !",
//                         showConfirmButton: false,
//                         showClosebutton: true,
//                         timer: 2000,
//                         timerProgressBar: true,
//                     });
//                 });
//         }
//     })
// }



// module.exports = {
//     swalDelete,
//     // swalForm,
//     swalStepForm
// }

