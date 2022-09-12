import express from 'express'
import {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador
    // obtenerTareas
} from "../controllers/proyectoController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router()


router.route('/').get(checkAuth, obtenerProyectos).post(checkAuth, nuevoProyecto)
router.route('/:id').get(checkAuth, obtenerProyecto).put(checkAuth, editarProyecto).delete(checkAuth, eliminarProyecto)
// router.get('/tareas/:id', checkAuth, obtenerTareas)
router.post('/colaboradores', checkAuth, buscarColaborador)
router.post('/colaboradores/:id', checkAuth, agregarColaborador)
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador)
// el ultimo :id es del proyecto, no del usuario.
// Cuando tienes un .delete() no puede enviarle valores por eso lo cambiamos a post.

export default router