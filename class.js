import http from "http"
const puerto = 3000

class App {
    constructor() {
        this.rutas = {}
        this.middlewares = []
    }

    registrarRuta(ruta, handler, metodo) {
        if (!this.rutas[metodo]) {
            this.rutas[metodo] = {}
        }

        this.rutas[metodo][ruta] = handler
    }

    verificarRuta(ruta, metodo) {
        if (!this.rutas[metodo]) {
            return false
        } else {
            return this.rutas[metodo][ruta]
        }
    }

    levantarServidor() {
        const servidor = http.createServer((req, res) => {
            const ejecutarRuta = () => {
                const handler = this.verificarRuta(req.url, req.method)
                if (handler) {
                    handler(req, res)
                } else {
                    res.writeHead(404)
                    res.end(JSON.stringify({mensaje: "Ruta no encontrada."}), null, 2)
                }
            }

            this.ejecutarMiddleware(req, res, 0, ejecutarRuta)
        })
        
        servidor.listen(puerto, () => {console.log(`Servidor corriendo en ${puerto}.`)})
    }

    registrarMiddleware(funcion) {
        if (!this.middlewares.includes(funcion)) {
            this.middlewares.push(funcion)
        }
    }

    ejecutarMiddleware(req, res, index, callback) {
        if (index === this.middlewares.length) {
            callback()
            return
        }

        const middlewareAEjecutar = this.middlewares[index]
        const next = () => {
            this.ejecutarMiddleware(req, res, index + 1, callback)
        }

        middlewareAEjecutar(req, res, next)
    }
}

export { App }