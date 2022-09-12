import express from "express";
const router = express.Router()
import { registrar, autenticar, confirmarToken, olvidePassword, comprobarToken, nuevoPassword, perfil } from "../controllers/usuariocontroller.js";
import checkAuth from '../middleware/checkAuth.js'

// router.get('/', usuarios)
// router.post('/', crearUsuarios)

// Autenticación, registro y confirmacion de usuarios
router.post('/', registrar)     // crear un nuevo usuario
router.post('/login', autenticar)
router.get('/confirmar/:token', confirmarToken) // /:token - routing dinamico con express. toma valores de forma dinámica. // Confirmamos la cuenta.
router.post('/olvide-password', olvidePassword)
// router.get('/olvide-password/:token', comprobarToken)
// router.post('/olvide-password/:token', nuevoPassword)
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)

// Endpoit checkAuth, verificar si un usuario esta autenticado y demas.
// si todo esta bien dentro de checkAuth, ira al sgt middleware q es perfil.
// en checkAuth comprobamos q tengamos un token jwt, el cual contiene toda la info del usuario, con esto verificamos q esta ingresando al sistema alguien real.
router.get('/perfil', checkAuth, perfil)


export default router