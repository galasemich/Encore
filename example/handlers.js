import { conexion } from "./data.js"

function inicio(req, res) {
    res.end(JSON.stringify({mensaje: "Bienvenidos a mi servidor creado con Encore."}), null, 2)
}

async function traerUsuarios(req, res) {
    res.writeHead(200, {
        "Content-type": "application/json"
    })

    const consulta = "SELECT * FROM usuarios"
    const resultado = await conexion.execute(consulta)

    res.end(JSON.stringify(resultado[0], null, 2))
}

async function traerTareas(req, res) {
    res.writeHead(200, {
        "Content-type": "application/json"
    })

    const consulta = "SELECT * FROM tareas"
    const resultado = await conexion.execute(consulta)

    res.end(JSON.stringify(resultado[0], null, 2))
}

async function traerUsuario(req, res) {
    res.writeHead(200, {
        "Content-type": "application/json"
    })

    const idUsuario = req.params.id
    const consulta = "SELECT * FROM usuarios WHERE id = ?"

    try {
        const resultado = await conexion.execute(consulta, [idUsuario])
        res.end(JSON.stringify(resultado[0], null, 2))
    } catch (error) {
        console.log("Error en función traerUsuarios:", error)
        res.end(JSON.stringify({mensaje: "No se pudo completar la solicitud."}))
    }
}

async function nuevaTarea(req, res) {
    res.writeHead(200, {
        "Content-type": "application/json"
    })

    const { nombre, categoria, id_usuario } = req.body
    const consulta = "INSERT INTO tareas (nombre, categoria, id_usuario) VALUES (?, ?, ?)"

    try {
        const resultado = await conexion.execute(consulta, [nombre, categoria, id_usuario])
        res.end(JSON.stringify({mensaje: "Tarea agregada correctamente."}, null, 2))
    } catch (error) {
        console.log("Error en función nuevaTarea:", error)
        res.end(JSON.stringify({mensaje: "No se pudo agregar la tarea a la base de datos."}))
    }
}

async function eliminarTarea(req, res) {
    const idTarea = req.params.id
    const consulta = "DELETE FROM tareas WHERE id = ?"

    try {
        const resultado = await conexion.execute(consulta, [idTarea])
        res.end(JSON.stringify({mensaje: "Tarea eliminada correctamente."}, null, 2))
    } catch (error) {
        console.log("Error en función eliminarTarea:", error)
        res.end(JSON.stringify({mensaje: "No se pudo eliminar la tarea de la base de datos."}))
    }
}

async function editarUsuario(req, res) {
   res.writeHead(200, {
        "Content-type": "application/json"
    })

    const idUsuario = req.params.id

    for (const par of Object.entries(req.body)) {
        const columna = par[0]
        const dato = par[1]

        const consulta = `UPDATE usuarios SET ${columna} = ? WHERE id = ?`
        
        try {
            const resultado = await conexion.execute(consulta, [dato, idUsuario])

            if (resultado[0]) {
                res.end(JSON.stringify({mensaje: "Usuario actualizad correctamente."}))
            } else {
                res.end(JSON.stringify({mensaje: `No se encontró la tarea con id = ${id}.`}))
            }
        } catch (error) {
            console.log("Error en la consulta a la base de datos:", error)
            res.end(JSON.stringify({mensaje: "No se pudo completar la solicitud."}))
        }
    }
}

export default { 
    traerTareas, 
    traerUsuarios, 
    inicio, 
    nuevaTarea, 
    traerUsuario, 
    eliminarTarea, 
    editarUsuario 
}