import http from "http"

const server = http.createServer((req, res)=> {
    res.writeHead(200, {'Content-type': 'text-plain'})
    // Acá podemos desestructurar el objeto req, que cuenta con las propiedades url y method. También podríamos hacer algo como
    // url = req.url
    // method = req.method
    const { url, method } = req
    res.end(`Hiciste una request ${method} en la URL ${url}`)
})

server.listen(3000, () => {
    console.log(`Servidor corriendo en 3000.`)
})