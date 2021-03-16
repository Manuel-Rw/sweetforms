import Swal from "sweetalert2";
import axios from "axios";
import './css/swalForm.css'

import { swalBase } from "./helpers/index.js"
import { formTemplateRenderer } from "./templateRenderer/index.js"
import { formDidRender, formDidOpen, formPreCheck } from "./formHandler/index.js"

/* eslint-disable no-unused-vars  */
/* eslint-disable no-useless-escape  */
/* eslint-disable no-async-promise-executor  */



export const SteppedForm = ({ httpRequest, steps, width, maxHeight, itemsByLine, themeOptions, customValidators }) => {
    return new Promise((resolve) => {
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
                    didRender: () => {
                        return formDidRender({fields: step.fields, customValidators})
                    },
                    didOpen: () => {
                        return formDidOpen({ fields: step.fields, customValidators })
                    },
                    preConfirm: () => {
                        return formPreCheck({ fields: step.fields, stepper: {current: index + 1, total: steps.length}, customValidators }).then((data) => {
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
                if(!result.isConfirmed) {
                    resolve({success: false, messsage: "Aborted by user"})
                    return
                }

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




export const swalDelete = ({ requestUrl, itemName, itemType, requestType, themeOptions }) => {
    return new Promise((resolve, reject) => {
        Swal.fire({
            ...swalBase({themeOptions}),
            title: `Delete this ${itemType ? itemType : 'item'} ?`,
            text: itemName || "",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            cancelButtonText: "No",
            confirmButtonText: "Yes",
        }).then(result => {
            if (result.isConfirmed) {
                axios[requestType || 'post'](requestUrl)
                    .then(response => {
                        resolve({ success: true })
                        if (response.data.success)
                            Swal.fire({
                                ...swalBase({themeOptions}),
                                icon: "success",
                                title: `${itemType ? itemType : 'item'} set deleted !`,
                                showConfirmButton: false,
                                showCancelButton: false,
                                showCloseButton: false,
                                timer: 2000,
                                timerProgressBar: true
                            });
                        else
                            Swal.fire({
                                ...swalBase({themeOptions}),
                                icon: "error",
                                title: "Error, interview set not deleted !",
                                text: response.data.message || "An unknow error has occured !",
                                showConfirmButton: false,
                                showCancelButton: false,
                                showCloseButton: false,
                                timer: 2000,
                                timerProgressBar: true
                            });
                    })
                    .catch(err => {
                        resolve({ success: false, err: err })
                        Swal.fire({
                            ...swalBase({themeOptions}),
                            icon: "error",
                            title: "Error, interview set not deleted !",
                            text: err || "An unknow error has occured !",
                            showConfirmButton: false,
                            showClosebutton: false,
                            showCancelButton: false,
                            timer: 2000,
                            timerProgressBar: true
                        });
                    });
            }
        })
    })
};


export const SimpleForm = ({ httpRequest, fields, title, width, maxHeight, itemsByLine, themeOptions, customValidators }) => {
    return new Promise((resolve) => {
        Swal
            .fire({
                ...swalBase({themeOptions}),
                width: width || 600,
                title: `<span style="${themeOptions && themeOptions.darkMode ? 'color: #fff;' : ''}">${title || 'Simple form'}</span>`,
                focusConfirm: false,
                confirmButtonText: "Submit",
                html: formTemplateRenderer({ fields, itemsByLine, maxHeight, themeOptions }),
                didRender: () => {
                    return formDidRender({fields: fields, customValidators})
                },
                didOpen: () => {
                    return formDidOpen({ fields, customValidators })
                },
                preConfirm: () => {
                    return formPreCheck({ fields, customValidators }).then((data) => {
                        const fieldErrs = data.filter(field => !field.isValid)
                        if(fieldErrs.length) {
                            return false
                        }
                        else {
                            let result = {}
                            data.forEach(field => {
                                result[field.fieldKey] = field.value
                            })
                            return result
                        }
                    })
                }
            }).then((result) => {
                const formData = result.value
                if(!result.isConfirmed) resolve({success: false, messsage: "Aborted by user"})
                else if (!httpRequest) resolve({ success: true, data: formData })
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



// module.exports = {
//     swalDelete,
//     // swalForm,
//     swalStepForm
// }

