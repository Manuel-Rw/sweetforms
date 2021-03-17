import { mapFieldAttributes } from '../helpers/index.js'

const baseInput = ({field, itemsByLine, step}) => {
    const input =
    `<div id="field_${field.key}" style="${field.fullWidth ? `grid-column: auto / span ${step && step.itemsByLine ? step.itemsByLine : itemsByLine ? itemsByLine : 2};` : ''}width: auto;text-align:left;" class="fieldBloc">
        <label style="margin-left:0;">${field.label} ${field.validation && field.validation.includes('required') ? '*' : ''}</label>
        <input autocomplete="off" aria-autocomplete="off" type=${field.type} placeholder="${field.placeholder || ''}" id="--swInput${field.key}--" value="${field.value}" class="swInput mt-2"/>
    </div>`

    return input
}

const passwordInput = ({field, itemsByLine, step}) => {
    const input =
    `<div id="field_${field.key}" style="${field.showConfirmPassword ? `grid-column: 1 / 2` : ''} ${field.fullWidth ? `grid-column: auto / span ${step && step.itemsByLine ? step.itemsByLine : itemsByLine ? itemsByLine : 2};` : ''}width: auto;text-align:left;" class="fieldBloc">
        <label style="margin-left:0;">${field.label} ${field.validation && field.validation.includes('required') ? '*' : ''}</label>
        <input autocomplete="off" aria-autocomplete="off" type="password" placeholder="••••••••••" id="--swInput${field.key}--" value="${field.value}" class="swInput mt-2"/>
    </div>
    ${field.confirmPassword ? `<div id="field_${field.key}--confirm" style="${field.fullWidth ? `grid-column: auto / span ${step && step.itemsByLine ? step.itemsByLine : itemsByLine ? itemsByLine : 2};` : ''}width: auto;text-align:left;" class="fieldBloc">
        <label style="margin-left:0;">Confirm password *</label>
        <input autocomplete="off" aria-autocomplete="off" type="password" placeholder="••••••••••" id="--swInput${field.key}--confirm--" value="${field.value}" class="swInput mt-2"/>
        
    </div>` : ''}`

    return input
}


const selectInput = ({field, itemsByLine, step}) => {
    const input = 
    `<div id="field_${field.key}" style="${field.fullWidth ? `grid-column: auto / span ${step && step.itemsByLine ? step.itemsByLine : itemsByLine ? itemsByLine : 2};` : ''}line-break:before;width:auto;text-align:left;"  class="fieldBloc">
        <label style="margin-left:0;" class="mb-2">${field.label} ${field.validation && field.validation.includes('required') ? '*' : ''}</label>
        <div class="select mt-2">
            <select name="slct" id="--swInput${field.key}--">
                ${field.options.map(option => `<option ${option.value == field.value ? 'selected' : ''} value="${option.value}">${option.label}</option>`).join('')}
            </select>
        </div>
    </div>`

    return input
}

const checkboxInput = ({field, itemsByLine, step}) => {
    const input = 
    `<div id="field_${field.key}" style="${field.fullWidth ? `grid-column: auto / span ${step && step.itemsByLine ? step.itemsByLine : itemsByLine ? itemsByLine : 2};` : ''}width: auto; display: flex; gap: 1em;align-items:center;justify-content: space-between" class="fieldBloc">
        <label>${field.label} ${field.validation && field.validation.includes('required') ? '*' : ''}</label>
        <input type=${field.type} value="${field.value}" id="--swInput${field.key}--" ${field.type === 'checkbox' && field.value ? `checked` : ''} class="mt-2"/>
    </div>`

    return input
}

const rangeInput = ({field, itemsByLine, step}) => {
    const input = 
    `<div id="field_${field.key}" style="${field.fullWidth ? `grid-column: auto / span ${step && step.itemsByLine ? step.itemsByLine : itemsByLine ? itemsByLine : 2};` : ''}width: auto;text-align:left; display: flex;flex-direction: column;" class="fieldBloc">
        <label style="margin-left:0;">${field.label}  ${field.validation && field.validation.includes('required') ? '*' : ''}</label>
        <div style="display:flex;flex-direction:column;justify-content: center;height: auto;margin: auto 0;">
            <label style="text-align:center;margin-bottom: 5px;" id="swRangeVal${field.key}"></label>
            <input autocomplete="off" aria-autocomplete="off" type=${field.type}  placeholder="${field.placeholder || ''}" id="--swInput${field.key}--" value="${field.value}" class="rangeSlider mt-2" oninput="document.getElementById('swRangeVal${field.key}').innerHTML = document.getElementById('--swInput${field.key}--').value"/>
        </div>
    </div>`

    return input
}

const radioInput = ({field, itemsByLine, step}) => {
    const input = 
    `<div id="field_${field.key}" style="${field.fullWidth ? `grid-column: auto / span ${step && step.itemsByLine ? step.itemsByLine : itemsByLine ? itemsByLine : 2};` : ''}display: flex; flex-direction: column;width: auto;text-align:left;" class="fieldBloc">
        <label style="align-self: start">Choose ${field.label} ${field.validation && field.validation.includes('required') ? '*' : ''}</label>
        <div style="padding: 1em;justify-self: center;display: flex; justify-content: space-evenly;flex-wrap: wrap;margin-top: auto;height: 100%;align-items: center; gap: 1.2em;">
            ${field.options.map(option => {
                return `<div style="display: flex; align-items: center; gap: .5em;">
                    <input ${mapFieldAttributes({field})} type="radio" name="${field.key}" value="${option.value}" id="--swInput${field.key}--" ${field.value == option.value ? `checked` : ''}/>
                    <label>${option.label}</label>
                </div>`
            }).join('')}
        </div>
    </div>`

    return input
}

// Form renderer


const formProgressRenderer = ({stepper}) => {
    const stepsLenArray = []
    for(let i = 0; i < stepper.total; i++) stepsLenArray.push(i)
    const formProgress =
    `<div class="progress-container">
        <div class="progress" id="progress" style="width:${((stepper.current - 1) / (stepper.total - 1)) * 100}%;"></div>
            ${stepsLenArray.map((val, key) => {
                return `<div id="progressStep${key + 1}" class="circle ${key + 1 < stepper.current ? 'done' : key + 1 === stepper.current ? 'active' : ''}">${key + 1 < stepper.current ? '✓' : key + 1}</div>`
            }).join('')}
        </div>
    </div>`

    return formProgress
}

const extraStylesheetsRenderer = () => {
    return '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css" integrity="sha512-HK5fgLBL+xu6dm/Ii3z4xhlSUyZgTT9tuc/hSrtw6uzJOvgRr2a9jyxxT1ely+B+xFAmJKVSTbpM/CuL7qxO8w==" crossorigin="anonymous" />'
}


export const formTemplateRenderer = ({step, fields, itemsByLine, themeOptions, stepper}) => {
    //  ${step.title ? `<div style="${themeOptions && themeOptions.darkMode ? 'color:#fff;' : ''}" class="w-full text-center">${step.title}</div>` : ''}
    let formFields = step && step.fields ? step.fields : fields

    const formTemplate =
    extraStylesheetsRenderer() +
    `<div class="swFormBloc" style="display: grid;grid-template-columns: repeat(${step && step.itemsByLine ? step.itemsByLine : itemsByLine ? itemsByLine : 2}, 1fr);grid-gap: 1em;padding-bottom: 1rem;margin-top: 20px;max-height:${themeOptions && themeOptions.maxHeight ? themeOptions.maxHeight : '65vh;'};padding-right: 10px;overflow-y: scroll">
        ${formFields.map(field => {
            if (field.type === 'select') return selectInput({field, itemsByLine, step})
            else if (field.type === 'checkbox') return checkboxInput({field, itemsByLine, step})
            else if (field.type === 'range') return rangeInput({field, itemsByLine, step})
            else if (field.type === 'radio') return radioInput({field, itemsByLine, step})
            else if (field.type === 'password') return passwordInput({field, itemsByLine, step})
            else return baseInput({field, itemsByLine, step})
        }).join('')}
    </div>`

    return (stepper && step ? formProgressRenderer({stepper}) : '') + formTemplate
}