*Este proyecto está pensado como un framework minimalista. Permite definir rutas, registrarlas y devolver una respuesta. En este archivo documentaré el proceso de desarrollo de este framework.*

## Intruducción. ¿Por qué Encore?
Habitualmente, cuando desarrollamos aplicaciones backend, utilizando algún módulo como Express o Nest. ¿Podríamos desarrollar backend con el módulo nativo de Node.js? Sí, claro, pero una librería como Express tiene muchas otras funcionalidades y además nos ahorran trabajo. 

Ahora bien, ¿qué pasa en el "detrás de escena" cuando hacemos algo como esto?

```javascript
import express from "express"

const app = express()
```

Para entender qué está pasando acá, una muy buena opción es *desarrollar un pequeño framework*, es decir, desarrollar un pequeño Express. Se trata de un ejercicio interesante porque nos obliga a pensar funcionalidades que en un módulo tan extendido como Express.js o Nest.js ya están perfectamente implementadas. No se trata de "reiventar la rueda" sino de analizar el detrás de escena para entender mejor qué está pasando cuando utilizamos una librería. Esta idea es comparable, un poco, a la diferencia entre saber **manejar** y saber **cómo funciona un auto**. Por supuesto que, en la mayoría de los casos, entender **cómo manejar** es suficiente. Pero si queremos ir más allá, nos esperan otros desafíos: podemos saber cómo hacer un cambio (análogamente, podemos saber cómo levantar un servidor en Express), pero entender *cómo funciona* la maquinaria para que el cambio se produzca efectivamente (en nuestra analogía por ejemplo, cómo se mapean las rutas) nos aporta un conocimiento muy valioso. Por supuesto, si vamos "para atrás" en los niveles de abstracción, podríamos preguntarnos cómo funciona el módulo `http`, cómo funciona Node.js, cómo está desarrollado el propio JavaScript... Esos niveles de abstracción son fascinantes pero escapan al objetivo de este proyecto. 

## Primera etapa. Entendiendo el módulo `http`

## Segunda etapa. Creando nuestra clase principal

## Tercera etapa. Implementando un enrutador simple

## Cuarta etapa. Middlewares

## Quinta etapa. Leyendo el body de una request

## Sexta etapa. Rutas dinámicas y más métodos HTTP

