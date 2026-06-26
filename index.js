import http from "http"

const server = http.createServer((req, res)=> {
    res.writeHead(200, {'Content-type': 'text-plain',
        'X-Powered-By': 'node.js'
    })
    // Acá podemos desestructurar el objeto req, que cuenta con las propiedades url y method. También podríamos hacer algo como
    // url = req.url
    // method = req.method,
    // pero la desestructuración nos ahorra líneas de código. 
    const { url, method, headers } = req
    
    res.end(`Hiciste una request ${method} en la URL ${url}`)
})

server.listen(3000, () => {
    console.log(`Servidor corriendo en 3000.`)
})