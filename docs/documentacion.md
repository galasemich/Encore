### Intruducción. ¿Por qué Encore?
Habitualmente, cuando desarrollamos aplicaciones backend, utilizando algún módulo como Express.js o Nest.js. ¿Podríamos desarrollar backend con el módulo nativo de Node.js? Sí, claro, pero una librería como Express tiene muchas otras funcionalidades y además nos ahorran trabajo. 

Ahora bien, ¿qué pasa en el "detrás de escena" cuando hacemos algo como esto?

```javascript
import express from "express"

const app = express()
```

Para entender qué está pasando acá, *desarrollar un pequeño framework*, es decir, desarrollar algo como Express, es una muy buena opción. Se trata de un ejercicio interesante porque nos obliga a pensar funcionalidades que en módulos como Express o Nest ya están perfectamente implementadas. No se trata de "reiventar la rueda" sino de analizar el detrás de escena para entender mejor qué está pasando cuando utilizamos una librería. Esta idea es comparable, un poco, a la diferencia entre saber **manejar** y saber **cómo funciona un auto**. Por supuesto que, en la mayoría de los casos, entender cómo manejar es suficiente. Pero si queremos ir más allá, nos esperan otros desafíos: podemos saber cómo hacer un cambio (análogamente, podemos saber cómo levantar un servidor en Express), pero entender *cómo funciona* la maquinaria para que el cambio se produzca efectivamente (por ejemplo, cómo se mapean las rutas, siguiendo nuestra analogía) nos aporta un tipo de conocimiento diferente y muy valioso. Por supuesto, si vamos "para atrás" en los niveles de abstracción, podríamos preguntarnos cómo funciona el módulo `http`, cómo funciona Node, cómo está desarrollado el propio JavaScript... Esos niveles de abstracción son fascinantes pero escapan al objetivo de este proyecto. 

### 1️⃣ Primera etapa. Entendiendo el módulo `http`: servidores, solicitudes y respuestas
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
2. Definir un puerto (habitualmente, en desarrollo, se usa el puerto 3000). Otra opción es definir el puerto en un archivo `.env` y luego traerlo con `dotenv`.
3. Crear el servidor con la función que nos provee `http`. 
4. Poner el servidor a escuchar requests en el puerto seleccionado. 

La función `createServer` toma como parámetro una función callback que a su vez usar `req` y `res` como parámetros. Esta función se ejecuta *cada vez que nuestro servidor recibe una solicitud*. Esto es fundamental porque el objeto `req` nos permite acceder a datos importantes sobre las requests (como la URL o el método HTTP), como así también el objeto `res` nos permite leer información sobre la respuesta que va a dar el servidor. Veremos estos conceptos en los próximos apartados. 

🧠 Para seguir pensando: ¿cómo se implementa esa "llegada" de una solicitud al servidor? Es decir, ¿cómo reconoce nuestro servidor que está llegando una request, y que debe responder con lo que escribimos en el cuerpo de la función callback? Eso nos lleva directamente al corazón de la implementación de Node, y de todo JavaScript: el concepto de *evento*. En términos simples: una solicitud se agrega a una *cola de eventos* cuando llega al servidor. En ese momento, Node recibe un aviso y ejecuta el callback. 

#### Observando una request
Dentro de la función `createServer`, podemos escribir algo como esto:
```javascript
...
console.log(req.method) // GET
console.log(req.url) // /
...
```
Cuando accedemos a `localhost:3000` en el navegador, vemos que en la terminal obtenemos los dos resultados que están comentados en el ejemplo de código. Son dos resultados por defecto, dado que no tenemos otras rutas definidas en nuestro servidor. Luego, cuando definamos esas rutas y sus métodos, obtendremos otros resultados (verbos como POST, PUT o DELETE y rutas como `/usuarios`, por ejemplo, o `/api`. Eso dependerá de las rutas que definamos para nuestro servidor). 

Tanto `method` como `url` son propiedades del objeto `req` que podemos rastrear, incluso, si hacemos un `console.log(req)`. Allí, entre muchos otros datos, veremos que `method` y `url` son dos clave dentro del objeto `req`. Es interesante ver que otras propiedades, como `headers`, a la que también accedemos con `req.headers`, no son claves "simples" como `method` y `url`. En cambio, Node las implemente a partir de un símbolo, un tipo de dato especial para crear identificadores únicos. En el objeto `req`, veremos algo como `Symbol[kHeaders]`, que Node mapea con la propiedad `req.headers` y nos permite ver los encabezados de la request. 

#### Observando una response
Similar a las operaciones que estuvimos analizando a propósito de una solicitud, también podemos observar algunas propiedades de las respuestas que da nuestro servidor. Veamos este ejemplo, retomando nuestra definición del servidor:
```javascript
...
res.writeHead(200)
res.end("Hola, mundo.")
...
```
Como ya dijimos, nuestro servidor ejecuta una función callback cada vez que recibe una solicitud. Esa función callback, como vemos en el ejemplo anterior, toma el objeto `res` (es decir, la respuesta) y hace dos cosas:

1. Envía un status code.
2. Envía un string y cierra la respuesta.

Los status code son fundamentales porque "hablan" por nosostros. Forman parte de un código compartido entre programadores, dado que sabemos que un 200 representa una solicitud exitosa, mientras que un 404 nos dice que la ruta no fue encontrada (el famoso Not Found Error 404). Por ejemplo, si nuestra aplicación backend quiere comunicar al equipo de frontend que se creó un recurso nuevo existosamente, podría enviar, en el cuerpo de la respuesta, un status code 201. Así, no tendría que enviar ningún mensaje escrito, por ejemplo algo como "Usuario registrado correctamente"; la comunicación entre equipos se torna así más limpia, dado que parte de códigos compartidos por los desarrolladores. 

El método `res.end` envía el body de la respuesta. En este caso, simplemente enviamos un string en pantalla. `res.end` solo puede llamarse una vez; si quisiéramos escribir más mensajes, tendríamos que usar el método `res.write`, que sí puede ser llamado cuantas veces querramos. 

#### Analizando encabezados de una solicitud y de una respuesta
Para acceder a los encabezados de una **respuesta** tenemos dos opciones:

1. Podemos usar un cliente como Thunder Client o Postman y acceder a los encabezados en la pestaña Headers del apartado de la respuesta. 
2. También podemos usar el navegador. En este caso, es necesario recurrir a las DevTools. Vamos al apartado Network --> click en request --> Response Headers. 

Esto es interesante porque nos permite rastrear cómo Node maneja los encabezados de una respuesta en contraste con los de una solicitud. Nosotros como desarrolladores no podemos acceder a los headers directamente con un `console.log(res.headers)`, como sí podemos hacer un `console.log(req.headers)`. ¿Por qué se produce esa asimetría? Básicamente, porque Node entiende que los encabezados de una *solicitud* constituyen información que el servidor consume, y que son fundamentales para manejarla correctamente, pero no considera lo mismo de los encabezados de una *respuesta*. 

Por ejemplo, algunos headers típicos que vienen en una request:

- **Content-Type** --> este encabezado le dice al servidor qué tipo de contenido tendrá la solicitud. Por ejemplo, en aplicaciones backend, lo más normal es un valor de application/json, que nos dice que la información vendrá en formato JSON.
- **Authorization** --> este header es central porque permite rechazar o aceptar solicitudes en términos de autorización. Típicamente, algunas rutas de un servidor requieren que el usuario inicie sesión, además de verificar que el usuario esté en la base de datos y que las credenciales sean correctas. Por ejemplo, en un backend de una aplicación que permite registrar tareas, una ruta restringida por seguridad podría ser la de perfil (para ingresar a tu perfil necesitás iniciar sesión; de lo contrario, cualquiera podría acceder a tu perfil solo ingresando la URL correcta). Esto, en términos de Node, se logra generalmente implementando un token que se envía en la respuesta a esa solicitud de inicio de sesión y luego se envía, desde el cliente, en cada request. El servidor verifica ese token y permite seguir operando.

Si nuestra request es GET, típicamente no tiene body (solo "pide" datos). En cambio, métodos como POST (para guardar un recurso en una base de datos), PUT (para reemplazar un recurso completo), PATCH (para reemplazar solo algunos campos del recurso) o DELETE (para eliminar un recurso) sí necesitan un cuerpo de solicitud porque requieren datos para realizar la operación (por ejemplo, la nueva información para crear un recurso o el ID de un recurso para eliminarlo).

De esta forma, los encabezados de una *respuesta* representan información que el servidor *envía*, y que en todo caso será importante para, por ejemplo, un frontend (como es el caso del token de seguridad), pero no tanto ya para el servidor. Ahora bien, ¿por qué los encabezados de una respuesta ya no están disponibles para el servidor? Es decir, ¿por qué no podemos verlos con un `console.log(res.headers)`? Básicamente, porque el servidor los "olvida" ni bien los envía. Veamos este pequeño gráfico:

```mermaid
graph LR
 A[cliente] <-->|socket| B[servidor]
```
El *socket* es el espacio bidireccional por donde "viajan" las solicitudes y las respuestas. Dado que el servidor los escribe *directamente* en el socket, los encabezados de la respuesta ya no están disponibles para nosotros del lado del servidor: por eso no podemos leerlos con un `console.log(res.headers)` y debemos usar un cliente externo, como Postman o el propio navegador en conjunto con las DevTools. 

En resumen, entonces:

- Headers de una **solicitud** --> podemos verlos con un `console.log(req.headers)`.  
- Headers de una **respuesta** --> no disponibles con `console.log()`. Los vemos con un cliente externo. 

### 2️⃣ Segunda etapa. Creando nuestra clase principal
Retomemos nuestro primer ejemplo:
```javascript
import express from "express"

const app = express()
```
¿Qué es exactamente `app`? Una instancia de un objeto. De esta manera, para crear nuestro framework, nosotros deberíamos desarrollar una *clase* que represente nuestra aplicación backend. Para eso, vamos en primer lugar a armar algo simple:
```javascript
class App {
    constructor() {
        this.rutas = {}
    }
}
```
Desglosemos el código:

1. Primero definimos una clase `App` que representa nuestra aplicación, a la que luego le agregaremos métodos específicos para definir su comportamiento. 
2. Utilizamos una función constructora para definir un objeto vacío. Notemos la importancia del `this`: `this` permite que, cuando instanciemos la clase, los métodos estén disponibles para ese nuevo objeto. Si solo usáramos una variable local, no podríamos luego trabajar libremente con esa instancia de la clase `App`. 
3. ¿Para qué un objeto vacío? La idea es que, en ese objeto vacío, nuestro servidor almacene las rutas que vamos a predefinir para nuestra aplicación. 

Para levantar nuestro servidor, vamos a incorporar entonces la función `createServer()`; ahora ya no en nuestro archivo principal `index.js` sino en la clase `App`. De esta manera, nuestra clase App ahora tiene un poco más de cuerpo:
```javascript
const puerto = 3000

class App {
    constructor() {
        this.rutas = {}
    }

    levantarServidor() {
        const servidor = http.createServer((req, res) => {
            res.end("Hola, mundo.")
        })
        
        servidor.listen(puerto, () => {console.log(`Servidor corriendo en ${puerto}.`)})
    }
}
```
Veremos que el resultado es el mismo que cuando definimos el servidor en nuestro index.js. Ahora, sin embargo, el funcionamiento de la aplicación empieza a acercarse a cómo funciona un framework. Así como en Express hacíamos esto:
```javascript
import express from "express"

const app = express()
app.listen(3000, () = > {console.log("Servidor corriendo en 3000.")})
```
en nuestro propio framework haremos algo como:
```javascript
import http from "http"
import { App } from "./class.js"

const app = new App()
app.levantarServidor()
```
El paso a paso, vemos, es similar. Creamos una instancia del objeto App y llamamos al método que levanta el servidor. 

### 3️⃣ Tercera etapa. Implementando un enrutador simple
Terminada la segunda etapa, nuestro servidor está corriendo. Ahora, para que se acerque todavía más a lo que implica un framework backend, necesitamos implementar lo que podríamos llamar un *enrutador*. Básicamente, y en términos estrictos, un enrutador es un dispositivo que dirige datos de una red a otra. Estos dispositivos son muy comunes para conectarse a internet, por ejemplo, porque permiten interconectar la red de la empresa que provee el servicio a la red de los hogares que contratan ese servicio (por eso en todos esos hogares hay un *router*). 

### 4️⃣ Cuarta etapa. Middlewares

### 5️⃣ Quinta etapa. Leyendo el body de una request

### 6️⃣ Sexta etapa. Rutas dinámicas y más métodos HTTP

### 7️⃣ Séptima etapa. Publicando Encore en npm

