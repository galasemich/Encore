## Encore
Encore es un pequeño framework para servidores backend. Si bien toma como inspiración varias de las implementaciones de Express, constituye un proyecto minimalista, de manera que tiene sus limitaciones. 

## Cómo usar Encore
### 🟢 Importar el módulo, inicializar la aplicación y correr el servidor
En un archivo típicamente `index.js`, se debe importar la clase `App` del módulo e instanciarla:
```javascript
import { App } from "@galasemich/encore"

const app = new App()
```
Para que el servidor empiece a escuchar en un puerto, es necesario utilizar el método `levantarServidor()`. Este método requiere un puerto que se le pase como argumento. Por ejemplo:
```javascript
app.levantarServidor(3000)
```
Corriendo `node index.js` en la terminal, el servidor debería estar funcionando y en consola deberíamos ver el mensaje 
```
Servidor corriendo en <puerto>
```
### 🟢 Registrar rutas
Para registrar rutas, se utiliza la función `registrarRutas()`. La función define la ruta, la función controladora y el método HTTP como parámetros *obligatorios*. 

Las funciones controladoreas definen típicamente los parámetros `req` y `res`. Pueden escribirse en un archivo aparte (por ejemplo, `handlers.js`):
```javascript
function inicio(req, res) {
    res.end("Hola, mundo.")
}

export default { inicio }
```
Y luego importarse en `index.js`. Una ruta definida en `index.js` puede verse así:
```javascript
import handlers from "./handlers.js"

app.registrarRuta("/", handlers.inicio, "GET")
```
La función controladora puede ser una función anónima:
```javascript
app.registrarRuta("/", (req, res) => {res.end("Hola, mundo.")}, "GET")
```
También pueden pasarse middlewares (en un arreglo). Se ejecutan en el orden en que son pasados. Una ruta con middlewares de ruta podría verse así:
```javascript
app.registrarRuta("/tareas", handlers.traerTareas, "GET", [middlewares.autenticacion])
```
### 🟢 Registrar middlewares propios
Encore permite que registres tus propios middlewares. Los middlewares definen tres parámetros: `req`, `res` y `next`. 

Podés escribirlos en un archivo `middlewares.js` (o cualquier otro nombre que quieras designar), importarlos en `index.js` y pasarlos como argumentos a la función `registrarMiddleware()`:
```javascript
// En middlewares.js
function mipropioMiddleware(req, res, next) {
    // Hace algo
}

function otroMiddlewarePropio(req, res, next) {
    // Hace algo más
}

export default { miPropioMiddleware, otroMiddlewarePropio }
```
```javascript
// En index.js
import middlewares from "./middlewares.js"

app.registrarMiddleware(middlewares.miPropioMiddleware)
app.registrarMiddleware(middlewares.otroMiddlewarePropio)
```
Los middlewares globales, como los de ruta, **se ejecutan en el orden en que son escritos en el código**. 
### 🟢 Middlewares nativos de Encore
Encore cuenta con tres middlewares nativos:
- `middlewareMetodo()` --> imprime en consola el método y la URL de la solicitud. 
- `parsearBody()` --> parsea el body de una solicitud.
- `setearHeader()` --> setea un header para la respuesta `'X-Powered-By-Encore'`.

Estos middlewares también deben ponerse en funcionamiento con la función `registrarMiddleware()`. Ninguno es obligatorio, pero `parsearBody()` te va resultar especialmente útil para procesar el body entrante de una solicitud (si quisieras hacerlo a mano, podrías: simplemente no lo llamás y lo implementás de cero). 

Los módulos nativos de Encore que desees utilizar deben importarse en la misma línea en la que se importa la clase App:
```javascript
import { App, parsearBody, middlewareMetodo, setearHeader } from "@galasemich/encore"
```

> Encore guarda el body de la request en `req.body`. 
### 🟢 Rutas dinámicas
Encore soporta rutas dinámicas. Para hacerlo, simplemente registrá la ruta así:
```javascript
app.registrarRuta("/tareas/:id", handlers.traerTarea, "GET")
```
Encore guarda los parámetros de ruta en `req.params` como un objeto JavaScript:
```javascript
{
    nombreParametro: valorParametro
}
```
Para acceder al valor del parámetro, simplementé utilizá la notación de punto. 

## Ejemplo de servidor y documentación
En la carpeta [/example](example) de este repositorio pueden revisarse archivos de ejemplo (index.js, handlers.js, etc.). Esos archivos corresponden al recorrido realizado en la [documentacion](docs/documentacion.md) de este proyecto. En dicha documentación, me explayo en comentar cómo y por qué desarrollé Encore; al mismo tiempo, utilizamos Encore para crear un servidor de prueba simulando una pequeña aplicación de registro de tareas. 

## Próximos pasos
Para una segunda versión de Encore, podrían implementarse las siguientes mejoras:

🔀 Clase `Router`  
Como está explicado en la documentación extensiva, podría implementarse una clase Router que modularice las rutas, de manera que no estén todas juntas en el archivo principal. 

🔀 Middleware general de errores  
En Encore, manejar errores se realiza *in situ*, es decir, con bloques try/catch cuando puede generarse algún error. En una próxima nueva versiónd el frameowork podría implementarse un middleware al que "caigan" todos los errores del servidor. 