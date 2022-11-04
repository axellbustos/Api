/*para devolver una url toma del request las propiedades
* protocol(http o https),
* el host(ej localhost) y
* originalUrl (ej  /movies/1 )*/
const getUrl= (req)=>{
    return `${req.protocol}://${req.get('host')}${req.originalUrl}`
}
const getUrlBase= (req)=>{
    return `${req.protocol}://${req.get('host')}`
}
module.exports ={
    getUrl,
    getUrlBase
}