const objetValidate = (args, msg) => {
    return {
        args,
        msg
    }
}
const defaultValidations = {
    notNull: objetValidate(true, "El campo es obligatorio"),
    notEmpty: objetValidate(true, "El campo es requerido")
}
module.exports = {
    objetValidate,
    defaultValidations 
}