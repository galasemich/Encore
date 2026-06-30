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
            res.end("Hola, mundo.")
        })
        
        servidor.listen(puerto, () => {console.log(`Servidor corriendo en ${puerto}.`)})
    }

    //listen(puerto, callback) {
    // Esta función define el servidor y escucha. 
        // const servidor = http.createServer((req, res) => {
            // const handler = this.verificarRuta(req.url, req.method)
            // if (handler) {
            //     res.writeHead(200)
            //     handler(req, res)
            // } else {
            //     res.writeHead(404)
            //     res.end("Ruta no encontrada.")
            // }
        // })

        //servidor.listen(puerto, callback)
    //}

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