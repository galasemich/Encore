import http from "http"
const puerto = 3000

class App {
    // Definimos el objeto donde se van a guardar las rutas.
    constructor() {
        this.rutas = {}
    }

    // Definimos una función que guarda la ruta en el ojeto de rutas, sea cual sea el método.
    registrarRuta(ruta, handler, metodo) {
        if (!this.rutas[metodo]) {
            this.rutas[metodo] = {}
        }

        this.rutas[metodo][ruta] = handler
    }

    levantarServidor() {
        const servidor = http.createServer((req, res) => {
            const handler = this.verificarRuta(req.url, req.method)
            if (handler) {
                handler(req, res)
            } else {
                res.writeHead(404)
                res.end(JSON.stringify({mensaje: "Ruta no encontrada."}), null, 2)
            }
        })
        
        servidor.listen(puerto, () => {console.log(`Servidor corriendo en ${puerto}.`)})
    }

    // Definimos una función que verifica si la ruta existe con método. 
    verificarRuta(ruta, metodo) {
        if (!this.rutas[metodo]) {
            return false
        } else {
            return this.rutas[metodo][ruta]
        }
    }
}

export { App }