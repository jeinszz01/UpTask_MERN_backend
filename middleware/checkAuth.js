import jwt from "jsonwebtoken"  // esta libreria nos permite sifrar y descifrar.
import Usuario from "../models/Usuario.js"

// next nos permite ir al sgt middleware. ( de checkAuth se ira a perfil definidas en routes.)
const checkAuth = async (req, res, next) => {
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1] // imprime Bearer 'y todo el token JWT', obtendremos solo el token con split, divide en dos.

            const decoded = jwt.verify(token, process.env.JWT_SECRET)  // se lee con verify
            
            req.usuario = await Usuario.findById(decoded.id).select('-password -token -confirmado -createdAt -updatedAt -__v')  // evitamos todos estos campos.
            //req.usuario = await Usuario.findById(decoded.id).select('nombre email')  // segunda forma, en esta variable se guarda el usuario con q se esta ingresando.

            //console.log(req.usuario)
            return next()
        } catch (error) {
            return res.status(404).json({ msg: 'hubo un error' })
        }
    }

    if(!token) {
        const error = new Error ('token no válido')
        return res.status(401).json({ msg : error.message })
    }

    next()
}

export default checkAuth