## Encore
Encore es un framework para servidores backend. Si bien toma como inspiración varias de las implementaciones de Express, constituye un proyecto minimalista, de manera que tiene sus limitaciones. 

## Cómo usar Encore
### 🟢 Inicializar la aplicación
En un archivo típicamente `index.js`, se debe importar la clase `App` del módulo e instanciarla:
```javascript
const app = new App()
```
### 🟢 Registrar rutas
Para registrar rutas, se utiliza la función `registrarRutas()`. La función define ruta, la función controladora y método como parámetros *obligatorios*. Una ruta puede verse así:
```javascript
app.registrarRuta("/", handlers.inicio, "GET")
```
También pueden pasarse middlewares (en un arreglo). Se ejecutan en el orden en que son pasados. Una ruta con middlewares de ruta podría verse así:
```javascript
app.registrarRuta("/tareas", handlers.traerTareas, "GET", [middlewares.autenticacion])
```
### 🟢 Registrar middlewares propios
Encore permite que registres tus propios middlewares. Podés hacerlo pasándolos como argumento a la función `registrarMiddleware()`:
```javascript
app.registrarMiddleware(middlewares.miPropioMiddleware)
```
### 🟢 Middlewares nativos de Encore
Encore cuenta con tres middlewares nativos:
- `metodoYURL()` --> imprime en consola el método y la URL de la solicitud. 
- `parsearBody()` --> parsea el body de una solicitud.
- `setearHeader()` --> setea un header para la respuesta `'X-Powered-By-Encore'`.

Estos middlewares también deben ponerse en funcionamiento con la función `registrarMiddleware()`. Ninguno es obligatorio, pero `parsearBody()` te va resultar especialmente útil para procesar el body entrante de una solicitud (si quisieras hacerlo a mano, podrías: simplemente no lo llamás y lo implementás de cero). 

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

## Próximos pasos
Para una segunda versión de Encore, podrían implementarse las siguientes mejoras:

🔀 Clase `Router`  
Como está explicado en la documentación extensiva, podría implementarse una clase Router que modularice las rutas, de manera que no estén todas juntas en el archivo principal. 

🔀 Middleware general de errores  
En Encore, manejar errores se realiza *in situ*, es decir, con bloques try/catch cuando puede generarse algún error. En una próxima nueva versiónd el frameowork podría implementarse un middleware al que "caigan" todos los errores del servidor. 