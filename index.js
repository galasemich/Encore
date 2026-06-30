import http from "http"
import { App } from "./class.js"
import handlers from "./handlers.js"

const app = new App()

app.registrarRuta("/", handlers.inicio, "GET")
app.registrarRuta("/tareas", handlers.traerTareas, "GET")
app.registrarRuta("/usuarios", handlers.traerUsuarios, "GET")
app.registrarRuta("/tarea", handlers.nuevaTarea, "POST")

app.levantarServidor()

