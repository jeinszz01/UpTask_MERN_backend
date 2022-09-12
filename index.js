/* Este archivo va tener la configuracion de nuestro servidor */
// importacion de node:  const express = require('express') en package.json: agregar "type": "module" y aceptará import
import express  from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import conectarDb from './config/db.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'

const app = express()
app.use(express.json())     // habilita la información q viene como json. si no se define asi embies info nos marcara como undefined.

dotenv.config() //buscará un archivo llamado .env

conectarDb()

// Configurar CORS. Aqui definimos q direcciones estan permitidas para q se comuniqen.
const whiteList = [process.env.FRONTEND_URL]    //Variable de entorno en Express.

const corsOption = {
    origin: function(origin, callback) {
        if(whiteList.includes(origin)) {
            // Puede consultar la API
            callback(null, true)
        }else {
            // No esta permitido su request
            callback(new Error('Error de Cors blackList'))
        }
    } // Quien esta enviando el request, d dnd vienen las peticiones
}

app.use(cors(corsOption))

// Routing
//.use soporta todos los verbos https (get,post,put)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/tareas', tareaRoutes)



const PORT = process.env.PORT || 4000

// Agregamos const servidor =  para socket.io 2 
const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})

// Iniciando Socket.io 1
import { Server, Socket } from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 6000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})
// Abriremos una conexión de socket.io 3
io.on('connection', (socket) => {
    //console.log('Conectado a socket.io')

    // Definir los eventos de socket io
    socket.on('abrir proyecto', (proyecto) => {
        socket.join(proyecto)
    })

    socket.on('nueva tarea', (tarea) => {
        socket.to(tarea.proyecto).emit('tarea agregada', tarea)
    })

    socket.on('eliminar tarea', tarea => {
        socket.to(tarea.proyecto).emit('tarea eliminada', tarea)
    })

    socket.on('actualizar tarea', tarea => {
        socket.to(tarea.proyecto._id).emit('tarea actualizada', tarea)
    })

    socket.on('cambiar estado', tarea => {
        socket.to(tarea.proyecto._id).emit('nuevo estado', tarea)
    })
})

