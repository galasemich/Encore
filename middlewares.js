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

function parsearBody(req, res, next) {
    if (req.method != "GET") {
        let data = []

        const recibirStream = (chunk) => {
            data.push(chunk)
        }

        const finalizarParseo = () => {
            const stream = data.join()
            try {
                const json = JSON.parse(stream)
                req.body = json
            } catch (error) {
                console.log("Error al parsear body:", error.message)
            } finally {
                next()
            }
        }

        req.on("data", recibirStream)
        req.on("end", finalizarParseo)
    } else {
        next()
    }
}

export default { middlewareMetodo, setearHeader, autenticacion, parsearBody }