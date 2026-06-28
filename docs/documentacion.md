### Intruducción. ¿Por qué Encore?
Habitualmente, cuando desarrollamos aplicaciones backend, utilizando algún módulo como Express.js o Nest.js. ¿Podríamos desarrollar backend con el módulo nativo de Node.js? Sí, claro, pero una librería como Express tiene muchas otras funcionalidades y además nos ahorran trabajo. 

Ahora bien, ¿qué pasa en el "detrás de escena" cuando hacemos algo como esto?

```javascript
import express from "express"

const app = express()
```

Para entender qué está pasando acá, una muy buena opción es *desarrollar un pequeño framework*, es decir, desarrollar un pequeño Express. Se trata de un ejercicio interesante porque nos obliga a pensar funcionalidades que en un módulo tan extendido como Express.js o Nest.js ya están perfectamente implementadas. No se trata de "reiventar la rueda" sino de analizar el detrás de escena para entender mejor qué está pasando cuando utilizamos una librería. Esta idea es comparable, un poco, a la diferencia entre saber **manejar** y saber **cómo funciona un auto**. Por supuesto que, en la mayoría de los casos, entender cómo manejar es suficiente. Pero si queremos ir más allá, nos esperan otros desafíos: podemos saber cómo hacer un cambio (análogamente, podemos saber cómo levantar un servidor en Express), pero entender *cómo funciona* la maquinaria para que el cambio se produzca efectivamente (en nuestra analogía por ejemplo, cómo se mapean las rutas) nos aporta un conocimiento muy valioso. Por supuesto, si vamos "para atrás" en los niveles de abstracción, podríamos preguntarnos cómo funciona el módulo `http`, cómo funciona Node.js, cómo está desarrollado el propio JavaScript... Esos niveles de abstracción son fascinantes pero escapan al objetivo de este proyecto. 

### 1️⃣ Primera etapa. Entendiendo el módulo `http`
En este proyecto usaremos como base el módulo nativo de Node `http`. Con él, podremos acceder a funciones como `createServer` para crear el servidor o `listen` para poner nuestro servidor a escuchar en un puerto. Las primeras pruebas que haremos tendrán el objetivo de entender cómo funciona el módulo; probaremos algunas operaciones sencillas para recibir solicitudes, enviar respuestas, definir status codes, etc. 

#### Sobre `createServer`
Veamos este ejemplo de código:
```javascript
import http from "http"

const puerto = 3000

const servidor = http.createServer((req, res) => {
    res.writeHead(200)
    res.end("Hola, mundo.")
})

servidor.listen(puerto, () => {console.log(`Servidor corriendo en ${puerto}.`)})
```
Este es un servidor muy simple que envía un status code de 200 (OK) y un mensaje genérico a cualquier request. El paso a paso, entonces, es:

1. Importar el módulo.
2. Definir un puerto (habitualmente, en desarrollo, se usa el puerto 3000). Otra opción es definir el puerto en un archivo .env y luego traerlo con dotenv.
3. Creamos el servidor con la función que nos provee `http`. 
4. Ponemos el servidor a escuchar requests en el puerto seleccionado. 

La función `createServer` toma como parámetro una función callback que a su vez usar `req` y `res` como parámetros. Dada su cualidad de función callback, esta función se ejecuta cada vez que nuestro servidor recibe una solicitud. Esto es fundamental porque el objeto `req` nos permite acceder a datos importantes sobre las requests (como la url o el método HTTP), como así también el objeto `res` nos permite leer información sobre la respuesta que va a dar el servidor. Veremos estos conceptos en los próximos apartados. 

🧠 Para seguir pensando: ¿cómo se implementa esa "llegada" de una solicitud al servidor? Es decir, ¿cómo reconoce nuestro servidor que está llegando una request, y que debe responder con lo que escribimos en el cuerpo de la función callback? Eso nos lleva directament al corazón de la implementación de Node, y de todo JavaScript: el concepto de *evento*. Node funciona a partir de *eventos*: más adentro en su implementación, Node recibe una notificación cuando un evento ingresa en una *cola de eventos*. Al recibir ese aviso, ejecuta el callback. 

#### Observando una request
Dentro de la función `createServer`, podemos escribir algo como esto:
```javascript
...
console.log(req.method) // GET
console.log(req.url) // /
...
```
Cuando accedemos a `localhost:3000` en el navegador, vemos que en la terminal obtenemos los dos resultados que están comentados en el ejemplo de código. Son dos resultados por defecto, dado que no tenemos otras rutas definidas en nuestro servidor. Luego, cuando definamos esas rutas y sus métodos, obtendremos otros resultados (verbos como POST, PUT o DELETE y rutas como `/usuarios`, por ejemplo, o `/api`. Eso dependerá de las rutas que definamos para nuestro servidor). 

Tanto `method` como `url` son propiedades del objeto `req` que podemos rastrear, incluso, si hacemos un `console.log(req)`. Allí, entre muchos otros datos, veremos que `method` y `url` son dos clave dentro del objeto `req`. Es interesante ver que otras propiedades, como `headers`, a la que también accedemos con `req.headers`, no son claves "simples" como `method` y `url`. En cambio, Node las implemente a partir de símbolos, un tipo de dato especial para crear identificadores únicos. En el objeto `req`, veremos algo como `Symbol[kHeaders]`, que Node mapea con la propiedad `req.headers` y nos permite ver los encabezados de la request. 

#### Observando una response
Similar a las operaciones que estuvimos analizando a propósito de una solicitud, también podemos observar algunas propiedades de las respuestas que da nuestro servidor. Veamos este ejemplo, retomando nuestra definición del servidor:
```javascript
...
res.writeHead(200)
res.end("Hola, mundo.")
...
```
Como ya dijimos, nuestro servidor ejecuta una función callback cada vez que recibe una solicitud. Esa función callback, como vemos en el ejemplo anterior, toma el objeto res (es decir, la respuesta) y hace dos cosas:

1. Envía un status code.
2. Envía un string y cierra la respuesta.

Los status code son fundamentales porque "hablan" por nosostros. Forman parte de un código compartido entre programadores, dado que sabemos que un 200 representa una solicitud exitosa, mientras que un 404 nos dice que la ruta no fue encontrada (el famoso Not Found Error 404). Por ejemplo, si nuestra aplicación backend quiere comunicar al equipo de frontend que se creó un recurso nuevo existosamente, podría enviar, en el cuerpo de la respuesta, un status code 201. Así, no tendría que enviar ningún mensaje escrito, por ejemplo algo como "Usuario registrado correctamente"; la comunicación entre equipos se torna así más limpia, dado que parte de códigos compartidos por los desarrolladores. 

El método `res.end` nos permite mostrar algo en pantalla. `res.end` solo puede llamarse una vez; si quisiéramos escribir más mensajes, tendríamos que usar el método `res.write`, que sí puede ser llamado cuantas veces querramos. 

### 2️⃣ Segunda etapa. Creando nuestra clase principal

### 3️⃣ Tercera etapa. Implementando un enrutador simple

### 4️⃣ Cuarta etapa. Middlewares

### 5️⃣ Quinta etapa. Leyendo el body de una request

### 6️⃣ Sexta etapa. Rutas dinámicas y más métodos HTTP

