import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"
import mongoose from "mongoose"

const agregarTarea = async (req, res) => {
    const { proyecto } = req.body
    // Verificamos si el proyecto q nos envian existe.
    const existeProyecto = await Proyecto.findById(proyecto)

    if(!existeProyecto) {
        const error = new Error('El proyecto no existe')
        return res.status(404).json({msg: error.message})
    }

    // if(existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    //     const error = new Error('No tienes permisos para añadir tareas en este proyecto')
    //     return res.status(400).json({msg: error.message})
    // }
    // Comprobar si es igual el creador con el usuario.
    if(!existeProyecto.creador.equals(req.usuario._id)){
        const error = new Error('No tienes permisos para añadir tareas (segunda forma)')
        return res.status(400).json({msg: error.message})
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body)
        // Almacenar el ID de la tarea en el modelo Proyecto.
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save()
        res.json(tareaAlmacenada)   //cuando hagamos un console.log en el frontend nos traerá este res.json.
    } catch (error) {
        console.log(error)
    }

    
}

const obtenerTarea = async (req, res) => {
    const { id } = req.params

    //Importante. populate, nos trae el proyecto q esta relacionado con la tarea seleccionada. un objeto dentro del objeto.
    // esto funciona gracias al ref.
    const tarea = await Tarea.findById(id).populate('proyecto')
    const valid = mongoose.Types.ObjectId.isValid(id)
    
    if(!valid) {
        const error = new Error ('La tarea que estas buscando no existe')
        return res.status(401).json({ msg : error.message })
    }

    if(!tarea) {
        const error = new Error('Tarea no encontrada.')
        return res.status(404).json({msg: error.message})   //404 cuando no encontraste algo.
    }

    // Comprobamos q el creador d esta tarea sea el q este logueado.
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion no permitida')
        return res.status(403).json({msg: error.message})   //403 cuando no tiene los permisos adecuados. 401 requiere q el usuario este autent.
    }

    res.json(tarea)
    //console.log(req.usuario)
}

const actualizarTarea = async (req, res) => {
    const { id } = req.params
    const tarea = await Tarea.findById(id).populate('proyecto')

    if(!tarea) {
        const error = new Error('Tarea no encontrada.')
        return res.status(404).json({msg: error.message})   //404 cuando no encontraste algo.
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Accion no permitida')
        return res.status(403).json({msg: error.message})   //403 cuando no tiene los permisos adecuados. 401 requiere q el usuario este autent.
    }

    // Agregaremos o actializaremos algun campo de una tarea.
    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.prioridad = req.body.prioridad || tarea.prioridad
    // El proyecto no se puede cambiar
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

    try {
        const tareaAlmacenada = await tarea.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }

}

const eliminarTarea = async (req, res) => {
    const { id } = req.params
    const tarea = await Tarea.findById(id).populate('proyecto')
    const valid = mongoose.Types.ObjectId.isValid(id)   // valida si es un id de mongoDb. (si tiene menos caracteres u otro)
    
    if(!valid) {
        const error = new Error ('La tarea que estas buscando no existe')
        return res.status(401).json({ msg : error.message })
    }
    if(!tarea) {
        const error = new Error('Tarea no encontrada.')
        return res.status(404).json({msg: error.message})
    }
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
       const error = new Error('Accion no permitida')
        return res.status(403).json({msg: error.message})
    }

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)
        
        // Cuando tengamos 2 await, creamos Promise, ambos inician en paralelo.
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])
        
        res.json({msg: 'Tarea Eliminada Correctamente.'})
    } catch (error) {
       console.log(error) 
    }
}

const cambiarEstado = async (req, res) => {
    const { id } = req.params
    const tarea = await Tarea.findById(id).populate('proyecto')
    //si agregamos .populate('completado') console.log(tarea) .Nos trae el usuario con toda su info. Pero si hacemos-->
    if(!tarea) {
        const error = new Error('Tarea no encontrada.')
        return res.status(404).json({msg: error.message})
    }
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some( (colaborador) => colaborador._id.toString() === req.usuario._id.toString()) ){
        const error = new Error ('No tienes permisos')
        return res.status(401).json({ msg : error.message })
    }
    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    tarea.populate("completado")    //hacemos esto para q se guarde la tarea con todos los campos de completado, otra forma(ya no ariamos otra consulta)
    await tarea.save()
    //-->console.log(tarea) aqui, solo nos mostrará el id sin toda su info. por el req.usuario._id. Para esto hacemos otra consulta.
    
    // const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate('completado')
    // res.json(tareaAlmacenada)
    res.json(tarea)
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}