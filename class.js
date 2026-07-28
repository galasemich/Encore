import http from "http"
const puerto = 3000

class App {
    constructor() {
        this.rutas = {}
        this.middlewares = []
    }

    registrarRuta(ruta, handler, metodo, middlewares) {
        if (!this.rutas[metodo]) {
            this.rutas[metodo] = {}
        }

        if (middlewares) {
            this.rutas[metodo][ruta] = {handler, middlewares}
        } else {
            this.rutas[metodo][ruta] = {handler}
        }
    }

    verificarRuta(ruta, metodo) {
        if (!this.rutas[metodo][ruta]) {
            return false 
        } else {
            const handler = this.rutas[metodo][ruta].handler
            const middlewares = this.rutas[metodo][ruta].middlewares || []
            return [handler, middlewares]
        }
    }

    levantarServidor() {
        const servidor = http.createServer((req, res) => {
            const ejecutarRuta = () => {
                const [ handler, middlewares ] = this.verificarRuta(req.url, req.method)

                if (!handler) {
                    res.writeHead(404)
                    res.end(JSON.stringify({mensaje: "Ruta no encontrada."}), null, 2)
                    return
                }
                
                this.ejecutarMiddlewareDeRuta(req, res, 0, middlewares, handler)
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

    ejecutarMiddlewareDeRuta(req, res, index, middlewares, handler) {
        if (index === middlewares.length) {
            handler(req, res)
            return
        }

        const middlewareAEjecutar = middlewares[index]
        const next = () => {
            this.ejecutarMiddlewareDeRuta(req, res, index + 1, middlewares, handler)
        }
        
        middlewareAEjecutar(req, res, next)
    }
}

export { App }