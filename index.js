import { App } from "./class.js"
import handlers from "./handlers.js"
import middlewares from "./middlewares.js"

const app = new App()

app.registrarRuta("/", handlers.inicio, "GET")
app.registrarRuta("/tareas", handlers.traerTareas, "GET", [middlewares.autenticacion])
app.registrarRuta("/usuarios", handlers.traerUsuarios, "GET")
app.registrarRuta("/tarea", handlers.nuevaTarea, "POST")
app.registrarRuta("/usuario/:nombre", handlers.traerUsuario, "GET")

app.registrarMiddleware(middlewares.middlewareMetodo)
app.registrarMiddleware(middlewares.setearHeader)
app.registrarMiddleware(middlewares.parsearBody)

app.levantarServidor()

