export const regexRules = {
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
}

export const blobToData = (blob) => {
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

export const swalBase = ({ themeOptions }) => {
    return {
        showCloseButton: true,
        buttonsStyling: false,
        confirmButtonClass:  themeOptions && themeOptions.confirmButtonClass ? themeOptions.confirmButtonClass : "actionBtn",
        cancelButtonClass: themeOptions && themeOptions.cancelButtonClass ? themeOptions.cancelButtonClass : "actionBtn btnDanger",
        background: themeOptions && themeOptions.darkMode ? "#262C49" : "",
        showCancelButton: true,
        allowOutsideClick: false,
        customClass: {
            htmlContainer:  themeOptions && themeOptions.darkMode ? "darkMode" : ''
        }
    };
}

export const getFieldErrDOM = (key) => document.getElementById(`err_${key}`)

export const getErrMessageText = ({field, errType}) => {
    if(errType === 'required') {
        if(['radio', 'select'].includes(field.type)) return `The <b>${field.label}</b> field must have a selected value`
        if(['checkbox'].includes(field.type)) return `The <b>${field.label}</b> field must be checked`
        else return `The <b>${field.label}</b> field can't be empty`
    } else return `The <b>${field.label}</b> field is invalid`
}

export const appendErrMessage = (fieldKey, message, errKey) => {
    const wrapper = document.getElementById(`field_${fieldKey}`)
    const input = document.getElementById(`--swInput${fieldKey}--`)

    console.log({fieldKey, input, wrapper})

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

export const removeErrMessage = ({field}) => {
    getFieldErrDOM(field.key).remove()
    document.getElementById(`--swInput${field.key}--`).classList.remove('swError')
}

export const mapFieldAttributes = ({field}) => {
    console
    return field.attributes ? Object.keys(field.attributes)
    .filter(attrKey => ['accept', 'autocomplete', 'autofocus', 'disabled', 'list', 'min', 'max', 'step', 'maxlength', 'pattern', 'readonly'].includes(attrKey))
    .map(attrKey => {return {key: attrKey, value: field.attributes[attrKey]}}) : ''
}

export const getFieldValue = async ({field, input}) => {
    if(field.type == 'file') return input.files[0] ? {fileName: input.files[0].name, fileData: await blobToData(input.files[0]), fileType: input.files[0].type, fileSize: input.files[0].size} : null
    else if(field.type == 'checkbox') return input.checked
    else if(field.type == 'radio') {
        const radioInputs = document.querySelectorAll(`#--swInput${field.key}--`)
        let selectedVal
        for(const radio of radioInputs) {
            if(radio.checked) selectedVal = radio.value
        }
        return selectedVal || ""
    }
    else if(field.type == 'data-table') {
        return null
    }
    else return input.value
}

export const humanFileSize = (size) => {
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}
