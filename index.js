import http from "http"
import { App } from "./class.js"

const app = new App()

app.regitrarRuta("/", inicio, "GET")
app.regitrarRuta("/productos", productos, "GET")
app.regitrarRuta("/usuarios", usuarios, "GET")

const server = http.createServer((req, res)=> {
    const handler = app.verificarRuta(req.url, req.method)
    if (handler) {
        res.writeHead(200)
        handler(req, res)
    } else {
        res.writeHead(404)
        res.end("Ruta no encontrada.")
    }
})

server.listen(3000, () => {
    console.log(`Servidor corriendo en 3000.`)
})