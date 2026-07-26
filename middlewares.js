import http from "http"

function middlewareMetodo(req, res, next) {
    console.log(`Método ${req.method}, URL ${req.url}`)
    next()
}

export default {middlewareMetodo}