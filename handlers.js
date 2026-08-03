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

    res.end(JSON.stringify(usuarios, null, 2))
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

    const parametros = req.params
    const idUsuario = parametros.id
    console.log(idUsuario)
    const consulta = "SELECT * FROM usuarios WHERE id = ?"

    try {
        const resultado = await conexion.execute(consulta, [idUsuario])
        if (resultado) {
            res.end(JSON.stringify(resultado[0], null, 2))
        } else {
            res.end(JSON.stringify({mensaje: `No se encontró el usuario con id = ${id}.`}))
        }
    } catch (error) {
        console.log(error)
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
        console.log(error)
        res.end(JSON.stringify({mensaje: "No se pudo agregar la tarea a la base de datos."}))
    }
}

function eliminarTarea(req, res) {
    const tareaEliminar = req.params
    const nuevoArray = []
    
    const tarea = tareas.filter((tarea) => {
        let verificacion = false
        if (!tarea.nombre === tareaEliminar.nombre) {
            res.end(JSON.stringify({mensaje: "No se encontró la tarea solicitada."}))
        } else {

        }

    })
}

function editarTarea(req, res) {

}

export default { traerTareas, traerUsuarios, inicio, nuevaTarea, traerUsuario, eliminarTarea, editarTarea }