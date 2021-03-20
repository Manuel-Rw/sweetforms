const cellRendererAvatar = ({value, column}) => {
    return `<img style="border-radius: 50%;border: 1px solid blue;height: 30px;width: 30px;" src="${value}"/>`
}

const cellRendererProgress = ({value, column}) => {
    return `<progress max="${column && column.maxProgress ? column.maxProgress : 100}" value="${value}"></progress>`

}

const cellRendererBoolean = ({value, column}) => {
    if(value) return '<i style="color:green;" class="fas fa-check"></i>'
    else return '<i style="color:red;" class="fas fa-times"></i>'
}

export const baseCellRenderers = {
    avatarRenderer: cellRendererAvatar,
    progressRenderer: cellRendererProgress,
    booleanRenderer: cellRendererBoolean
}