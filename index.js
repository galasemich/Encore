import http from "http"
import { App } from "./class.js"

const app = new App()
app.levantarServidor()
// app.regitrarRuta("/", inicio, "GET")
// app.regitrarRuta("/productos", productos, "GET")
// app.regitrarRuta("/usuarios", usuarios, "GET")

// app.listen(puerto, () => {`Servidor corriendo en ${puerto}.`})