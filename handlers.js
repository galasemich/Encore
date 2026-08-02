import { usuarios, tareas } from "./data.js"

function traerUsuarios(req, res) {
    res.writeHead(200, {
        "Content-type": "application/json"
    })
    res.end(JSON.stringify(usuarios, null, 2))
}

function traerTareas(req, res) {
    res.writeHead(200, {
        "Content-type": "application/json"
    })
    res.end(JSON.stringify(tareas, null, 2))
}

function traerUsuario(req, res) {
    res.writeHead(200, {
        "Content-type": "application/json"
    })

    const usuarioBuscar = req.params
    const usuario = usuarios.filter((usuario) => usuario.nombreUsuario === usuarioBuscar.nombre)
    
    if (usuario) {
        res.end(JSON.stringify(usuario, null, 2))
    } else {
        res.end(JSON.stringify({mensaje: "No se encontró ningún usuario con ese nombre."}))
    }
}

function inicio(req, res) {
    res.end(JSON.stringify({mensaje: "Bienvenidos a mi servidor creado con Encore."}), null, 2)
}

function nuevaTarea(req, res) {
    const nuevaTarea = req.body
    tareas.push(nuevaTarea)
    res.end(JSON.stringify({mensaje: "Tarea agregada correctamente."}, null, 2))
}

export default { traerTareas, traerUsuarios, inicio, nuevaTarea, traerUsuario }