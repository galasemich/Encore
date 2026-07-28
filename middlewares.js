import http from "http"

function middlewareMetodo(req, res, next) {
    console.log(`Método ${req.method}, URL ${req.url}`)
    next()
}

function setearHeader(req, res, next) {
    res.setHeader("X-Powered-By", "Encore")
    console.log("Header seteado: 'X-Powered-By Encore'")
    next()
}

function autenticacion(req, res, next) {
    console.log("Usuario autenticado.")
    next()
}

export default { middlewareMetodo, setearHeader, autenticacion }