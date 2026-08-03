import { App } from "./class.js"
import handlers from "./handlers.js"
import middlewares from "./middlewares.js"

const app = new App()

// Rutas GET
app.registrarRuta("/", handlers.inicio, "GET")
app.registrarRuta("/tareas", handlers.traerTareas, "GET", [middlewares.autenticacion])
app.registrarRuta("/usuarios", handlers.traerUsuarios, "GET")
app.registrarRuta("/usuario/:id", handlers.traerUsuario, "GET")

// Rutas POST
app.registrarRuta("/tarea", handlers.nuevaTarea, "POST")

// Rutas DELETE
app.registrarRuta("/tarea/:id", handlers.eliminarTarea, "DELETE")

// Rutas PUT
app.registrarRuta("/usuario/:id", handlers.editarUsuario, "PUT")

// Middlewares
app.registrarMiddleware(middlewares.middlewareMetodo)
app.registrarMiddleware(middlewares.setearHeader)
app.registrarMiddleware(middlewares.parsearBody)

app.levantarServidor()

