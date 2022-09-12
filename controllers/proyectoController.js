import mongoose from "mongoose"
import Proyecto from "../models/Proyecto.js"
import Usuario from "../models/Usuario.js"


const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
        $or: [
            { colaboradores: { $in: req.usuario }},
            { creador: { $in: req.usuario }},
        ]
    })
    // obtendremos los proyectos cuando seamos creador o colaborador.
    //.where('creador')
    //.equals(req.usuario)
    .select('-tareas')    // Vamos a obtener aquellos proyectos del creador q se logeo.
    res.json(proyectos)
}

const nuevoProyecto = async (req, res) => {
    //console.log(req.usuario)  // nos imprime al usuario q estamos enviando a traves del token.
    const proyecto = new Proyecto(req.body) // instancia al usuario con la info q estamos mandando.
    // se guardará en proyecto los campos q tiene nuestro modelo.
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params
    const proyecto = await Proyecto.findById(id)
    .populate({ path: 'tareas', populate: { path: 'completado', select: 'nombre'}})
    .populate('colaboradores', 'nombre email')
    // .populate() traera el campo tareas con todo su contenido.
    // Dentro de tareas hay un campo llamado completado(id qien completo la tarea), entonces haríamos un populate a un populate(tareas).
    if(!proyecto) {
        const error = new Error ('El proyecto que estas buscando no existe')
        return res.status(401).json({ msg : error.message })
    }
    // Comparamos el id del creador con el id del token con el q nos validamos.
    // Es decir, un proyecto nunca se mostrará a un usuario q no lo haya creado, ni a un colaborador q no este seleccionado.
    if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some( colaborador => colaborador._id.toString() === req.usuario._id.toString()) ){
        const error = new Error ('No tienes permisos')
        return res.status(401).json({ msg : error.message })
    }
    // Obtener las tareas del proyecto.
    //const tareas = await Tarea.find().where('proyecto').equals(proyecto._id)

    // Aqui obtendremos el objeto del proyecto y sus tareas.
    // res.json({
    //     proyecto,
    //     tareas
    // })
    res.json(proyecto)

}

//Actualizar Proyecto - realizamos las comprobaciones.
const editarProyecto = async (req, res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    
    if(!valid) {
        const error = new Error ('El proyecto que estas buscando no existe')
        return res.status(401).json({ msg : error.message })
    }

    const proyecto = await Proyecto.findById(id);
    if(!proyecto) {
        const error = new Error ('El proyecto que estas buscando no existe')
        return res.status(401).json({ msg : error.message })
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error ('No tienes permisos')
        return res.status(401).json({ msg : error.message })
    }

    // si se envía algo a traves del frontEnd se guardará en el campo respectivo, sino seguirá siendo el de la bd. 
    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const eliminarProyecto = async (req, res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    
    if(!valid) {
        const error = new Error ('El proyecto que estas buscando no existe')
        return res.status(401).json({ msg : error.message })
    }

    const proyecto = await Proyecto.findById(id);
    if(!proyecto) {
        const error = new Error ('El proyecto que estas buscando no existe')
        return res.status(401).json({ msg : error.message })
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error ('No tienes permisos')
        return res.status(401).json({ msg : error.message })
    }

    try {
        await proyecto.delete()
        res.json({msg: 'Proyecto Eliminado Correctamente'})
    } catch (error) {
        console.log(error)
    }
}

const buscarColaborador = async (req, res) => {
    const {email} = req.body
    // verificamos si el usuario esta registrado, importamos el model de usuarios.
    const usuario = await Usuario.findOne({email}).select('email nombre _id')

    if(!usuario) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({msg: error.message})
    }

    res.json(usuario)

}

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)
    // Verificamos el proyecto
    if(!proyecto) {
        const error = new Error('Proyecto no Encontrado')
        return res.status(404).json({msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(404).json({msg: error.message})
    }
    // verificamos q el usuario exista
    const {email} = req.body
    const usuario = await Usuario.findOne({email}).select('email nombre _id')
    
    if(!usuario) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({msg: error.message})
    }
    
    // El colaborador no puede ser el Admin del proyeto
    if(proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error('El creador del proyecto no puede ser colaborador.')
        return res.status(404).json({msg: error.message})
    }

    // Revisar que un colaborador no este ya agregado.
    if(proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error('El usuario ya pertenece al Proyecto.')
        return res.status(404).json({msg: error.message})
    }

    // Si despues de todas las validaciones esta bien, entonces se puede agregar.
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({msg: 'Colaborador Agregado Correctamente'})
}

const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)
    // Verificamos el proyecto
    if(!proyecto) {
        const error = new Error('Proyecto no Encontrado')
        return res.status(404).json({msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(404).json({msg: error.message})
    }
    
    proyecto.colaboradores.pull(req.body.id)

    await proyecto.save()
    res.json({msg: 'Colaborador Eliminado Correctamente'})
    
}

// Esta es una manera de hacer, pero no tan recomendable. ver(obtenerProyecto)
// const obtenerTareas = async (req, res) => {
//     const { id } = req.params
//     const proyectoEncontrado = await Proyecto.findById(id)
//     if(!proyectoEncontrado) {
//         const error = new Error ('El proyecto que estas buscando no existe')
//         return res.status(401).json({ msg : error.message })
//     }
//     // Para acceder a las tareas tienes q ser creador o colaborador.
//     const tareas = await Tarea.find().where('proyecto').equals(id)
//     res.json(tareas)
// }

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
    // obtenerTareas
}