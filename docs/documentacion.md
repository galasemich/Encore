## Índice de Contenidos
0. [Introducción. ¿Por qué Encore?](#introducción-por-qué-encore)
1. [Primera etapa. Entendiendo el módulo `http`: servidores, solicitudes y respuestas](#primera-etapa-entendiendo-el-módulo-http-servidores-solicitudes-y-respuestas)
    - [Sobre `createServer`](#sobre-createserver)
    - [Observando una *request*](#observando-una-request)
    - [Observando una *response*](#observando-una-response)
    - [Analizando encabezados de una solicitud y de una respuesta](#analizando-encabezados-de-una-solicitud-y-de-una-respuesta)
2. [Segunda etapa. Creando nuestra clase principal](#segunda-etapa-creando-nuestra-clase-principal)
3. [Tercera etapa. Implementando un enrutador simple](#tercera-etapa-implementando-un-enrutador-simple)
    - [Definiendo *endpoints*](#definiendo-endpoints)
    - [Definiendo *handlers*](#definiendo-handlers)
    - [Sobre el *Single Responsibility Principle* y una hipotética Encore 2.0](#sobre-el-single-responsibility-principle-y-una-hipotética-encore-20)
4. [Cuarta etapa. Middlewares](#cuarta-etapa-middlewares)
5. [Quinta etapa. Leyendo el *body* de una *request*](#quinta-etapa-leyendo-el-body-de-una-request)
6. [Sexta etapa. Rutas dinámicas y más métodos HTTP](#sexta-etapa-rutas-dinámicas-y-más-métodos-http)
7. [Séptima etapa. Publicando Encore en npm](#séptima-etapa-publicando-encore-en-npm)

## Introducción. ¿Por qué Encore?
Habitualmente, cuando desarrollamos aplicaciones backend, utilizando algún módulo como Express.js o Nest.js. ¿Podríamos desarrollar backend con el módulo nativo de Node.js? Sí, claro, pero una librería como Express tiene muchas otras funcionalidades y además nos ahorran trabajo. 

Ahora bien, ¿qué pasa en el "detrás de escena" cuando hacemos algo como esto?

```javascript
import express from "express"

const app = express()
```

Para entender qué está pasando acá, *desarrollar un pequeño framework*, es decir, desarrollar algo como Express, es una muy buena opción. Se trata de un ejercicio interesante porque nos obliga a pensar funcionalidades que en módulos como Express o Nest ya están perfectamente implementadas. No se trata de "reiventar la rueda" sino de analizar el detrás de escena para entender mejor qué está pasando cuando utilizamos una librería. Esta idea es comparable, un poco, a la diferencia entre saber **manejar** y saber **cómo funciona un auto**. Por supuesto que, en la mayoría de los casos, entender cómo manejar es suficiente. Pero si queremos ir más allá, nos esperan otros desafíos: podemos saber cómo hacer un cambio (análogamente, podemos saber cómo levantar un servidor en Express), pero entender *cómo funciona* la maquinaria para que el cambio se produzca efectivamente (por ejemplo, cómo se mapean las rutas, siguiendo nuestra analogía) nos aporta un tipo de conocimiento diferente y muy valioso. Por supuesto, si vamos "para atrás" en los niveles de abstracción, podríamos preguntarnos cómo funciona el módulo `http`, cómo funciona Node, cómo está desarrollado el propio JavaScript... Esos niveles de abstracción son fascinantes pero escapan al objetivo de este proyecto. 

Esta documentación toma una decisión pedagógica importante que vale la pena aclarar. A lo largo de esta documentación, iremos haciendo dos cosas en simultáneo: por un lado, describiremos cómo se desarrolla un framework minimalista y los conceptos téoricos que existen detrás de ello y, por el otro, utilizaremos ese mismo framework para crear un servidor sencillo. La razón detrás de esta decisión es que, de esta manera, podemos ver los *efectos* de lo que construimos al mismo tiempo que lo desarrollamos. Podemos pensar, en términos téoricos, para qué necesitamos un enrutador, por ejemplo, y desarrollarlo, pero ver ese enrutador *en funcionamiento* hecha luz sobre nuestro trabajo, y nos permite entender de manera práctica para qué lo necesitamos y cómo funciona. 

Al finalizar la documentación, el lector estará capacitado para, entonces, también dos cosas: desarrollar su propio framework y también utilizarlo y crear sus propias aplicaciones backend; y, por qué no, luego enlazarlas con un frontend y construir una aplicación web completa. 

## Primera etapa. Entendiendo el módulo `http`: servidores, solicitudes y respuestas
En este proyecto usaremos como base el módulo nativo de Node `http`. Con él, podremos acceder a funciones como `createServer` para crear el servidor o `listen` para poner nuestro servidor a escuchar en un puerto. Las primeras pruebas que haremos tendrán el objetivo de entender cómo funciona el módulo; probaremos algunas operaciones sencillas para recibir solicitudes, enviar respuestas, definir status codes, etc. 

### Sobre `createServer`
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
Este es un servidor muy simple que envía un status code de 200 (OK) y un mensaje genérico a cualquier *request*. El paso a paso, entonces, es:

1. Importar el módulo.
2. Definir un puerto (habitualmente, en desarrollo, se usa el puerto 3000). Otra opción es definir el puerto en un archivo `.env` y luego traerlo con `dotenv`.
3. Crear el servidor con la función que nos provee `http`. 
4. Poner el servidor a escuchar *requests* en el puerto seleccionado. 

La función `createServer` toma como parámetro una función *callback* que a su vez usar `req` y `res` como parámetros. Esta función se ejecuta *cada vez que nuestro servidor recibe una solicitud*. Esto es fundamental porque el objeto `req` nos permite acceder a datos importantes sobre las *requests* (como la URL o el método HTTP), como así también el objeto `res` nos permite leer información sobre la respuesta que va a dar el servidor. Veremos estos conceptos en los próximos apartados. 

🧠 Para seguir pensando: ¿cómo se implementa esa "llegada" de una solicitud al servidor? Es decir, ¿cómo reconoce nuestro servidor que está llegando una *request*, y que debe responder con lo que escribimos en el cuerpo de la función *callback*? Eso nos lleva directamente al corazón de la implementación de Node, y de todo JavaScript: el concepto de *evento*. En términos simples: una solicitud se agrega a una *cola de eventos* cuando llega al servidor. En ese momento, Node recibe un aviso y ejecuta el *callback*. 

### Observando una *request*
Dentro de la función `createServer`, podemos escribir algo como esto:
```javascript
...
console.log(req.method) // GET
console.log(req.url) // /
...
```
Cuando accedemos a `localhost:3000` en el navegador, vemos que en la terminal obtenemos los dos resultados que están comentados en el ejemplo de código. Son dos resultados por defecto, dado que no tenemos otras rutas definidas en nuestro servidor. Luego, cuando definamos esas rutas y sus métodos, obtendremos otros resultados (verbos como POST, PUT o DELETE y rutas como `/usuarios`, por ejemplo, o `/api`. Eso dependerá de las rutas que definamos para nuestro servidor). 

Tanto `method` como `url` son propiedades del objeto `req` que podemos rastrear, incluso, si hacemos un `console.log(req)`. Allí, entre muchos otros datos, veremos que `method` y `url` son dos clave dentro del objeto `req`. Es interesante ver que otras propiedades, como `headers`, a la que también accedemos con `req.headers`, no son claves "simples" como `method` y `url`. En cambio, Node las implemente a partir de un símbolo, un tipo de dato especial para crear identificadores únicos. En el objeto `req`, veremos algo como `Symbol[kHeaders]`, que Node mapea con la propiedad `req.headers` y nos permite ver los encabezados de la *request*. 

### Observando una *response*
Similar a las operaciones que estuvimos analizando a propósito de una solicitud, también podemos observar algunas propiedades de las respuestas que da nuestro servidor. Veamos este ejemplo, retomando nuestra definición del servidor:
```javascript
...
res.writeHead(200)
res.end("Hola, mundo.")
...
```
Como ya dijimos, nuestro servidor ejecuta una función *callback* cada vez que recibe una solicitud. Esa función *callback*, como vemos en el ejemplo anterior, toma el objeto `res` (es decir, la respuesta) y hace dos cosas:

1. Envía un status code.
2. Envía un string y cierra la respuesta.

Los status code son fundamentales porque "hablan" por nosostros. Forman parte de un código compartido entre programadores, dado que sabemos que un 200 representa una solicitud exitosa, mientras que un 404 nos dice que la ruta no fue encontrada (el famoso Not Found Error 404). Por ejemplo, si nuestra aplicación backend quiere comunicar al equipo de frontend que se creó un recurso nuevo existosamente, podría enviar, en el cuerpo de la respuesta, un status code 201. Así, no tendría que enviar ningún mensaje escrito, por ejemplo algo como "Usuario registrado correctamente"; la comunicación entre equipos se torna así más limpia, dado que parte de códigos compartidos por los desarrolladores. 

El método `res.end` envía el *body* de la respuesta. En este caso, simplemente enviamos un string en pantalla. `res.end` solo puede llamarse una vez; si quisiéramos escribir más mensajes, tendríamos que usar el método `res.write`, que sí puede ser llamado cuantas veces querramos. 

### Analizando encabezados de una solicitud y de una respuesta
Para acceder a los encabezados de una **respuesta** tenemos dos opciones:

1. Podemos usar un cliente como Thunder Client o Postman y acceder a los encabezados en la pestaña Headers del apartado de la respuesta. 
2. También podemos usar el navegador. En este caso, es necesario recurrir a las DevTools. Vamos al apartado Network --> click en *request* --> *response* Headers. 

Esto es interesante porque nos permite rastrear cómo Node maneja los encabezados de una respuesta en contraste con los de una solicitud. Nosotros como desarrolladores no podemos acceder a los *headers* directamente con un `console.log(res.headers)`, como sí podemos hacer un `console.log(req.headers)`. ¿Por qué se produce esa asimetría? Básicamente, porque Node entiende que los encabezados de una *solicitud* constituyen información que el servidor consume, y que son fundamentales para manejarla correctamente, pero no considera lo mismo de los encabezados de una *respuesta*. 

Por ejemplo, algunos *headers* típicos que vienen en una *request*:

- **Content-Type** --> este encabezado le dice al servidor qué tipo de contenido tendrá la solicitud. Por ejemplo, en aplicaciones backend, lo más normal es un valor de `application/json`, que nos dice que la información vendrá en formato JSON, y le permite al cliente parsear esa información en ese formato.
- **Authorization** --> este *header* es central porque permite rechazar o aceptar solicitudes en términos de autorización. Típicamente, algunas rutas de un servidor requieren que el usuario inicie sesión, además de verificar que el usuario esté en la base de datos y que las credenciales sean correctas. Por ejemplo, en un backend de una aplicación que permite registrar tareas, una ruta restringida por seguridad podría ser la de perfil (para ingresar a tu perfil necesitás iniciar sesión; de lo contrario, cualquiera podría acceder a tu perfil solo ingresando la URL correcta). Esto, en términos de Node, se logra generalmente implementando un token que se envía en la respuesta a esa solicitud de inicio de sesión y luego se envía, desde el cliente, en cada *request*. El servidor verifica ese token y permite seguir operando.

Si nuestra *request* es GET, típicamente no tiene *body* (solo "pide" datos). En cambio, métodos como POST (para guardar un recurso en una base de datos), PUT (para reemplazar un recurso completo), PATCH (para reemplazar solo algunos campos del recurso) o DELETE (para eliminar un recurso) sí necesitan un cuerpo de solicitud porque requieren datos para realizar la operación (por ejemplo, la nueva información para crear un recurso o el ID de un recurso para eliminarlo).

De esta forma, los encabezados de una *respuesta* representan información que el servidor *envía*, y que en todo caso será importante para, por ejemplo, un frontend (como es el caso del token de seguridad), pero no tanto ya para el servidor. Ahora bien, ¿por qué los encabezados de una respuesta ya no están disponibles para el servidor? Es decir, ¿por qué no podemos verlos con un `console.log(res.headers)`? Básicamente, porque el servidor los "olvida" ni bien los envía. Veamos este pequeño gráfico:

```mermaid
graph LR
 A[cliente] <-->|socket| B[servidor]
```
El *socket* es el espacio bidireccional por donde "viajan" las solicitudes y las respuestas. Dado que el servidor los escribe *directamente* en el socket, los encabezados de la respuesta ya no están disponibles para nosotros del lado del servidor: por eso no podemos leerlos con un `console.log(res.headers)` y debemos usar un cliente externo, como Postman o el propio navegador en conjunto con las DevTools. 

En resumen, entonces:

- *Headers* de una **solicitud** --> podemos verlos con un `console.log(req.headers)`.  
- *Headers* de una **respuesta** --> no disponibles con `console.log()`. Los vemos con un cliente externo. 

## Segunda etapa. Creando nuestra clase principal
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
2. Utilizamos una función constructora para definir un objeto vacío. Notemos la importancia del `this`: `this` permite que, cuando instanciemos la clase, los métodos estén disponibles para ese nuevo objeto. Si solo usáramos una variable local, no podríamos luego trabajar libremente con esa instancia de la clase `App`. Así, cuando luego instanciemos la clase, crearemos un objeto vacío `rutas`. 
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
Veremos que el resultado es el mismo que cuando definimos el servidor en nuestro `index.js`. Ahora, sin embargo, el funcionamiento de la aplicación empieza a acercarse a cómo funciona un framework. Así como en Express hacíamos esto:
```javascript
import express from "express"

const app = express()
app.listen(3000, () = > {console.log("Servidor corriendo en 3000.")})
```
ahora en nuestro propio framework haremos algo como:
```javascript
import http from "http"
import { App } from "./class.js"

const app = new App()
app.levantarServidor()
```
El paso a paso, vemos, es similar. Creamos una instancia del objeto App y llamamos al método que levanta el servidor. 

## Tercera etapa. Implementando un enrutador simple
Terminada la segunda etapa, nuestro servidor está corriendo. Ahora, para que se acerque todavía más a lo que implica un framework backend, necesitamos implementar lo que podríamos llamar un *enrutador*. Básicamente, y en términos estrictos, un enrutador es un dispositivo que dirige datos de una red a otra. Estos dispositivos son muy comunes para conectarse a internet, por ejemplo, porque permiten interconectar la red de la empresa que provee el servicio a la red de los hogares que contratan ese servicio (por eso en todos esos hogares hay un *router*). Tendríamos algo así:
```mermaid
graph LR
 A[empresa de internet] <--> |datos| B[router] <--> |datos| C[hogar]
```
Si implementáramos un enrutador en nuestro proyecto, se encargaría dar el primer paso en el manejo de las solicitudes. Así como el enrutador de internet trae datos de la empresa y los envía al hogar, y viceversa, el enrutador de nuestro servidor recibe datos (la solicitud a un endpoint) y los envía (al *handler* correspondiente). El flujo sería así: un cliente envía una solicitud a un endpoint y, si ese endpoint está registrado en nuestro servidor, el enrutador se encargaría de llamar a la función que maneja ese endpoint. Luego esa función (que llamamos anteriormente *handler*, o también puede ser encontrada como *controlador*) envía una respuesta al cliente. Si el endpoint no está registrado, se envía un error 404. 

En este momento, nuestro servidor solo responde "Hola, mundo." a cualquier solicitud. ¿Tiene sentido que, si yo hiciera una solicitud a un endpoint para, por ejemplo, traer todos los usuarios registrados en mi aplicación, el servidor me responda con ese mensaje? Evidentemente, no. Entonces, para que nuestro servidor responda de manera funciona, necesitamos dos cosas: 

1. Definir los endpoints (con su método y ruta asociados).
2. Definir las funciones que se ejecutan cuando se hace una solicitud a esos endpoints. 

Ahora bien, ¿cómo desarrollamos esto? Ya tenemos cubierta una parte: el objeto vacío que definimos con la función constructora funciona como almacén de rutas; es ahí donde vamos a ir almacenando las rutas predefinidas para nuestro servidor. Definir una ruta, en realidad, consta de dos pasos: definirla y *guardarla*, para que luego nuestro enrutador verifique que la ruta solicitada *es* un endpoint válido del servidor. 

### Definiendo endpoints
Como mencionamos en la introducción de esta documentación, vamos a hacer dos trabajos en simultáneo: vamos a **desarrollar** un framework y además **utilizarlo** para crear un servidor. Es importante hacer esta distinción porque en términos estrictos, definir endpoints no forma parte del desarrollo *del framework*; en todo caso, es parte de lo que ese framework nos *permite hacer*. Es la distinción entre funcionamiento y uso. 

Pensémoslo así: Express no "viene" con endpoints predefinidos, justamente porque un framework constituye el marco de trabajo para que nosotros los desarrolladores *construyamos* ese servidor *a partir* de ese marco de trabajo. El framework nos provee de las *condiciones de posibilidad* de todas las funcionalidades de un servidor, y nosotros lo utilizamos para construirlo. Hecha esta salvedad más bien técnica, vamos a empezar a definir endpoints de nuestro servidor. 

Definir una ruta implica establecer una asociación entre una URL, un método HTTP y una función *handler*. Por ejemplo, imaginemos que estamos utilizando Encore para crear una aplicación que registra tareas. Podemos tener una ruta GET `/tareas` que traiga todas las tareas registradas en nuestra aplicación; pero también podemos tener una ruta POST `/tareas` que cree una tarea nueva. En este ejemplo, el endpoint es el mismo, lo que cambia es el método HTTP. 

Volvamos a nuestra clase `App`. Ya definimos un objeto vacío `rutas` para almacenar las rutas y un método que levanta el servidor. Ahora vamos a definir un método que registre nuestra rutas. Como dijimos anteriormente, una ruta consta de una URL, un método y una función que maneje esa ruta (en este momento de nuestra aplicación, la única función que maneja rutas es el *callback* del método para levantar el servidor, que ya vamos a modificar). Así, tenemos que definir una función que *guarde* todos esos datos en el objeto vacío; de esta manera tenemos algo sobre lo que una posterior función verificadora efectivemente trabaje para manejar las solicitudes. Veamos este ejemplo:
```javascript
registrarRuta(ruta, handler, metodo) {
    if (!this.rutas[metodo]) {
        this.rutas[metodo] = {}
    }

    this.rutas[metodo][ruta] = handler
    }
```
Esta función define tres parámetros: `ruta`, `handler` y `metodo`. Básicamente, son los tres datos con los que vamos a registrar el endpoint en nuestro objeto de rutas. Los tres datos son fundamentales porque, como ya mencionamos en otra oportunidad, podemos tener en nuestro servidor dos rutas "iguales" (misma URL, por ejemplo `/tareas`) pero con diferente método HTTP (por ejemplo, GET y POST). Así, en nuestro objeto `rutas` los dos endpoints serán dos datos diferentes. 

> Importante: por el momento no vamos a definir los handlers específicamente. Por ahora, solo es importante saber que el servidor ejecutará una función correspondiente a cada ruta, por eso es necesario guardar ese dato. En el próximo apartado nos ocuparemos de ello. 

El cuerpo de la función define una condición que es la que efectivamente *guarda* la ruta en el objeto `rutas`. Veamos el paso a paso. 
1. Filtra primero por método, dado que intenta buscar en el objeto algo como
```javascript
{ 
    "GET": {}
}
```
2. Si no encuentra el método, lo crea. 
3. Luego guarda la ruta. Así, el objeto quedaría de la siguiente manera:
```javascript
{
    "GET": 
    {
        "/tareas": traerTareas
    }
}
```
La idea del paso 1 es que, si luego hay que registrar otra ruta con el método GET, no se guarda un nuevo objeto repitiendo el GET, sino que se guarda dentro de ese objeto, así:
```javascript
{
    "GET": 
    {
        "/tareas": traerTareas
    }, 
    {
        "/usuarios": traerUsuarios
    }
}
```
De esta manera, vamos organizando las funciones a partir de su método HTTP. Recordemos que, al guardar las rutas, no guardamos la función en sí, sino una *referencia* a ella (la diferencia está en los paréntesis).

Definimos la función para registrar las rutas, pero ¿cómo las *registramos*, efectivamente? Es decir, ¿en qué momento *llamamos* a esa función? En este punto del desarrollo vamos a agregar algunas líneas de código a nuestro archivo *entry point*, es decir, nuestro `index.js`:

```javascript
...
app.registrarRuta("/", inicio, "GET")
app.registrarRuta("/tareas", traerTareas, "GET")
app.registrarRuta("/usuarios", traerUsuarios, "GET")
...
```

Luego de las importaciones necesarias y de crear nuestra objeto `app`, instancia de la clase `App`, ahora vamos a recurrir al método `registrarRuta` para registrar tres rutas. Siguiendo el ejemplo de una aplicación para registrar tareas, tendremos: 

1. GET `/` --> ruta por defecto de nuestro servidor. Solo mostrará un mensaje de bienvenida. 
2. GET `/tareas` --> ruta que lista todas las tareas registradas por un usuario. 
3. GET `/usuarios` --> ruta que lista todos los usuarios registrados en la aplicación. 

> Dado que todavía no implementamos la lectura del *body* de una solicitud ni el soporte para parámetros de ruta, todavía no podemos registrar rutas de tipo POST, PUT o DELETE. 

De esta manera definimos las rutas que nuestro servidor aceptará, por el momento, y a las que se podrán hacer solicitudes desde un cliente externo. Ahora bien, ¿cómo hace el servidor para responder? Es decir, ¿cómo se ejecuta, efectivamente, la función que corresponde a cada ruta? Eso lo veremos en el próximo apartado. 

### Definiendo *handlers*
En el apartado anterior pusimos como ejemplo tres funciones: `inicio`, `traerUsuarios`, `traerTareas`. Estas tres funciones son las que van a responder cuando nuestro servidor reciba solicitudes a alguno de estos tres endpoints que ya definimos en nuestro objeto `rutas` dentro de la clase `App`. 

Ahora bien, también es necesario verificar, de alguna manera, que las rutas que están recibiendo solicitudes efectivamente *existen* en nuestro objeto de rutas. ¿Cómo hacemos eso? Implementando lo que vamos a llamar una *función verificadora*. 

Dentro de `App`, vamos a definir este método:
```javascript
verificarRuta(ruta, metodo) {
    if (!this.rutas[metodo]) {
        return false
    } else {
        return this.rutas[metodo][ruta]
    }
}
```
¿Cómo funciona? Básicamente, este es un método sencillo que recibe dos parámetros, la ruta y el método de la solicitud (ya veremos luego cómo hacemos para acceder a esos datos). Establecemos una condición: intentamos buscar esos datos dentro de nuestro objeto `rutas` y, si lo encontramos, devolvemos el *handler* asociado a la ruta. Si no lo encontramos, significa que la ruta solicitada no existe, entonces devolvemos `false`.

Ahora: ¿dónde llamamos a esta función? En algún lugar en donde tengamos acceso a los objetos `req` y `res`, para poder acceder a `req.method` y `req.url` y pasarlos como argumentos. ¿Cuál es ese lugar? En nuestro método `levantarServidor`. Veamos cómo queda la función completa, con el agregado de la verificación de la ruta: 
```javascript
levantarServidor() {
    const servidor = http.createServer((req, res) => {
        const handler = this.verificarRuta(req.url, req.method)
        if (handler) {
            res.writeHead(200)
            handler(req, res)
        } else {
            res.writeHead(404)
            res.end("Ruta no encontrada.")
        }
    })
    
    servidor.listen(puerto, () => {console.log(`Servidor corriendo en ${puerto}.`)})
}
```
Repasemos el código.
1. El servidor está definido con `createServer`.  
2. Ahora, el agregado es el siguiente: llamamos a la función `verificarRuta` y le pasamos dos argumentos, `req.url` y `req.method` que son, como sus nombres lo indican, las dos propiedades de la solicitud que necesita la función verificadora. 
3. Si la función verificadora encontró en el objeto de rutas un objeto que combine la ruta y el método que le pasamos, devuelve la función asociada a esa combinación de ruta y método. En ese caso, enviamos un código de status 200 y llamamos a ese *handler*. 
4. Si no lo encuentra, devuelve un error 404. 

🧠 ¿Por qué estamos pasando el objeto `req` ahora, si no parece ser necesario? Nuestro servidor, por el momento, no acepta rutas dinámicas ni lee el *body* de las *requests*, pero más adelante lo hará, y en esos casos necesitaremos sí o sí el objeto `req`; es mejor pasarlo desde el inicio y luego usarlo sin problemas, que tener que modificar el código luego. 

Si bien nuestro servidor avanzó considerablemente, todavía no funciona bien. ¿Por qué? Porque todavía no definimos esas cuatro funciones que mencionamos anteriormente. Vamos paso a paso. 

1. En primer lugar vamos a definir algunos datos de ejemplo para poder devolverlos cuando recibamos solicitudes. Como este es un caso de prueba, para mostrar el funcionamiento del framework, vamos a optar por hardcodear algunos arreglos en un archivo `data.js` y luego importarlo en otros archivos. Por supuesto, en entornos reales esto no se hace así y es necesario guardar los datos típicamente en una base de datos, pero por el momento nos vamos a conformar con escribir un pequeño archivo `data.js` que contenga estos datos:
```javascript
const usuarios = [
    {nombreUsuario: "galapha", email: "gala@mail.com"},
    {nombreUsuario: "juanp", email: "juanp@mail.com"},
    {nombreUsuario: "mariag", email: "mariag@mail.com"}
]

const tareas = [
    {nombre: "Hacer la compra", categoria: "Urgente", usuario: "galapha"},
    {nombre: "Arreglar calefón", categoria: "Puede esperar", usuario: "juanp"},
    {nombre: "Terminar monografía", categoria: "Urgente", usuario: "mariag"}
]

export { usuarios, tareas }
```
La idea, entonces, es que cuando el cliente haga un GET a `/usuarios` nuestro servidor responda con la lista de usuarios. Lo mismo ocurrirá con el endpoint `/tareas`, pero con la lista `tareas`. 

2. En segundo lugar, vamos a definir tres funciones sencillas que respondan a cada uno de los endpoints. Es decir, vamos a finalmente definir los *handlers* de estas rutas: 
```javascript
import { usuarios, tareas } from "./data.js"

function traerUsuarios(req, res) {
    res.writeHead(200, {
        "Content-type": "application/json"
    })
    res.end(JSON.stringify(usuarios, null, 2))
}

function traerTareas(req, res) {
    res.writeHead(200, {
        "Content-type": "application/json"
    })
    res.end(JSON.stringify(tareas, null, 2))
}

function inicio(req, res) {
    res.writeHead(200, {
        "Content-type": "application/json"
    })
    res.end(JSON.stringify({mensaje: "Bienvenidos a mi servidor creado con Encore."}), null, 2)
}

export default { traerTareas, traerUsuarios, inicio }
```

La implementación es muy sencilla, pero nos permite tener nuestro servidor andando y que cada ruta "haga algo diferente", no que envíen solo un "Hola, mundo." como hacían anteriormente. Cada función tiene una tarea: `traerUsuarios` devuelve la lista de usuarios, `traerTareas` la lista de tareas e `inicio` manda un mensaje de bienvenida. Notemos que no podemos simplemente hacer un `res.end(usuarios)`, dado que `res.end()`admite típicamente strings (o buffers). Para eso usaremos la función nativa de JavaScript que nos permite convertir un objeto a un string con formato JSON. La función `JSON.stringify()` acepta tres parámetros: el objeto a convertir, un *replacer*, que altera el comportamiento del proceso de conversión (que aquí definimos como `null` porque no es relevante en este contexto) y un número o string que representa la indentación que queremos darle a la cadena final. 

También es importante notar que, en estas funciones, definimos un *header* `Content-type`. ¿Por qué es importante esto? Porque, en realidad, nosotros desde el servidor no enviamos JSON "puro", sino que enviamos algo parecido que el cliente puede *interpretar* como JSON. Cuando el cliente lee el *header* de `Content-type`, puede parsear el contenido de la respuesta con algo como `JSON.parse()` e interpretar los datos en ese formato. Cuando en Express hacemos algo como
```javascript
res.json(usuarios)
```
la idea es la misma: Express setea el *header* a `Content-type: application/json` y procesa la información con `JSON.stringify()` para que el cliente que recibe la solicitud pueda parsear esa información como JSON. La única diferencia es que acá lo estamos haciendo manualmente, lo que nos ayuda a entender el proceso interno. 

### Sobre el *Single Responsibility Principle* y una hipotética Encore 2.0. 
El principio de responsabilidad única sostiene que una clase solo debería tener una tarea. Por ejemplo, podríamos pensar que nuestra clase App, el núcleo de la aplicación, solo debería levantar el servidor y escuchar. Del proceso de enrutamiento, es decir, el que llevan a cabo las funciones registrarRuta y verificarRuta, podría encargarse *otra* clase, distinta a la clase App. Esto es exactamente como lo implementa Express. Veamos este ejemplo:
```javascript
const rutaProductos = express.Router()

rutaProductos.get("/productos", controladores.traerProductos)
rutaProductos.get("/producto/:id", controladores.traerProductoID)
rutaProductos.post("/producto/crear", controladores.crearProducto)
rutaProductos.delete("/producto/:id", controladores.eliminarProducto)

export default rutaProductos
```
En el código propuesto, la variable `rutaProductos` es una instancia del objeto `Router`. Por lo que vemos en las líneas siguientes, es decir, la definición de las rutas, el objeto Router debe contener en su definición un método para cada verbo HTTP (en Encore, registrarRuta es una función "general" porque registra todas las rutas sin hacer distinción por método HTTP). Y luego, en el index.js, hacemos algo así:
```javascript
app.use("/productos", rutaProductos)
```
Básicamente, la idea es que con el método `use`, definido en la clase Express, podríamos registrar esas rutas, dado que le estamos pasando el objeto `Router` que contiene esas rutas definidas antes.

Ahora bien, en Encore, tanto la responsabilidad de levantar el servidor como de enrutar recaen en la clase `App`. Esto no es problemático porque Encore se trata de un *framework* minimalista, pero sí es cierto que en futuras versiones sería algo a tener en cuenta para mejorar el trabajo y hacerlo más modular, un concepto fundamental en programación que hace mucho más mantenibles los programas y permite escalarlos mucho más fácilmente. ¿Cómo podríamos, entonces, implementar esto en una hipotética segunda versión de Encore?

1. Definiríamos una clase `Router`, algo así:
```javascript
class Router {
    constructor() {
        this.rutas = {}
    }
}
```
2. Luego, definiríamos las rutas en un archivo separado al `index.js`, así:
```javascript
const rutasUsuarios = new Router()

rutasUsuarios.registrarRuta("/usuarios", traerUsuarios)
rutasUsuarios.registrarRuta("/tareas", traerTareas)

export { rutasUsuarios }
```
La idea de la modularidad es que los métodos de enrutamiento estén definidas en el objeto `Router`, no en el objeto `App`. 
3. Ahora bien, ¿cómo hace nuestro servidor para verificar que las rutas existen, si en realidad estamos agregando las rutas registradas al objeto vacío de cada objeto Router? Tendríamos que implementar algo que *conecte* ambos objetos, el de cada grupo de rutas con el objeto de rutas general. Podríamos definir un método `use` en `App` (como hace Express) para pasar las rutas del objeto propio al objeto rutas de App, algo así:
```javascript
app.use(rutaProductos)
```
4. Dentro de App, el método `use` usaría el método `Object.assign()` para combinar los dos objetos. Así, el servidor "busca" las rutas en el objeto rutas de `App`, que contiene ahora todas las rutas. 

> Nota sobre la arquitectura de la aplicación. En lo que venimos describiendo, App debería importar la función `registrarRuta`, dado que esta "vive" en Router, no en `App`. Podríamos pensar en que esto "rompería" el principio de modularidad, pero no es tan así si pensamos en la dirección en la que se produce la importación: `App`, clase más "general" del framework, importa de Router, y no al revés. No es que `verificarRuta` "vive" en `App`, sino que `App` la importa porque la necesita. 

En resumen:
- Clase `App` --> construye un objeto vacío "general" para todas las rutas de la aplicación y levanta el servidor. 
- Clase `Router` --> se encarga del enrutamiento (registra y verifica). `App` importa `verificarRuta` y la llama cada vez que llega una solicitud al servidor. 

## Cuarta etapa. *Middlewares*
Los *middlewares* son fundamentales para la estructura de un servidores porque permiten procesar información *antes* de que las solicitudes lleguen a su función controladora. Típicamente, un *middleware* tiene la siguiente firma:
```javascript
funcionMiddleware(res, req, next) {}
```
Un *middleware* hace su trabajo y luego llama a `next()` para seguir la cadena de ejecución, de manera que la solicitud pueda llegar a su función controladora. 



## Quinta etapa. Leyendo el *body* de una *request*

## Sexta etapa. Rutas dinámicas y más métodos HTTP

## Séptima etapa. Publicando Encore en npm

