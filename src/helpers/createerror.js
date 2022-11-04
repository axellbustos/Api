module.exports=(status, msg)=>{

    let error = new Error(msg);//crea el error
    error.status = status;//se agrega el status del error

    return error
}