import http from "http"
import { match } from "node-match-path"
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
        let rutaEncontrada = false

        for (const metodoObjeto of Object.entries(this.rutas)) {
            for (const rutaOriginal of (Object.entries(metodoObjeto[1]))) {
                const verificacion = match(rutaOriginal[0], ruta)

                if (verificacion.matches === true) {
                    try {
                        const handler = this.rutas[metodo][rutaOriginal[0]].handler
                        const middlewares = this.rutas[metodo][rutaOriginal[0]].middlewares || []
                        const params = JSON.parse(JSON.stringify(verificacion.params || []))
                        
                        return [ handler, middlewares, params ]
                    } catch (error) {
                        console.log(error.message)
                    }
                }
            }
        }

        if (!rutaEncontrada) {
            return false
        }
    }

    levantarServidor() {
        const servidor = http.createServer((req, res) => {
            const ejecutarRuta = () => {
                const resultado = this.verificarRuta(req.url, req.method)

                if (resultado) {
                    try {
                        const [ handler, middlewares, params ] = resultado
                        req.params = params
                        this.ejecutarMiddlewareDeRuta(req, res, 0, middlewares, handler)
                    } catch (error) {
                        console.log("Error:", error)
                        return
                    }
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