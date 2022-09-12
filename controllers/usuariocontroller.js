import Usuario from "../models/Usuario.js"
import generarId from "../helpers/generarId.js" //este helper se puede usar aqui o directamente en el schema usuario..
import generarJWT from "../helpers/generarJWT.js"
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js"

// req es lo q le estan enviando al servidor, ya sea un nombre, un dato o un arreglo.
// res es la respuesta del servidor
// En esta funcion registramos y verificamos si ya existe un susario x email.
const registrar = async (req, res) => {
    
    // Verificar usuarios ya registrados x el email.
    const { email } = req.body
    const existeUsuario = await Usuario.findOne({ email })
    
    if (existeUsuario) {
        const error = new Error('Email ya Registrado')
        return res.status(400).json({msg: error.message})
    }
    // Almacenamos usuarios en la bd.
    try {
        const usuario = new Usuario(req.body)
        // usuario.token = generarId()...
        await usuario.save()

        // Enviar el email de confirmación al helper email.js
        //console.log(usuario)
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({msg: 'Usuario Creado Correctamente, Revisa tu email para Confirmar tu Cuenta'})
    } catch (error) {
        console.log(error)
    }
}

// Autenticar a los Usuarios - login
const autenticar = async (req, res) => {

    const { email, password } = req.body
    // se almacena en usuario el email y password del usuario enviado en el req.body
    const usuario = await Usuario.findOne({email})
    
    // Comprobar si el usuario o email existe.
    if(!usuario) {
        const error = new Error('El usuario no existe')
        return res.status(404).json({ msg: error.message })
    }

    // Comprobar si el usuario esta confirmado.
    if(!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmada')
        return res.status(403).json({ msg: error.message })
    }

    // Comprobar su password.
    // Si el password q ingresamos es correcto, muestra res.json({}), solo con esos campos.
    if(await usuario.comprobarPassword(password)) {
        res.json({
            _id : usuario._id,
            nombre : usuario.nombre,
            email : usuario.email,
            token : generarJWT(usuario._id)
        })
    } else {
        const error = new Error('El password es Incorrecto')
        return res.status(403).json({ msg: error.message })
    }

}

const confirmarToken = async (req, res) => {
    //console.log(req.params.token) // esto nos traerá una variable llamada token con su valor, el cual viene de routes /confirmar/:token.
    const { token } = req.params
    const usuarioConfirmar = await Usuario.findOne({ token })

    // si el token q enviamos x la url no es válida o no existe en la bd, enviará este mensaje.
    if (!usuarioConfirmar) {
        const error = new Error('Token no Válido')
        return res.status(403).json({ msg: error.message })
    }
    
    try {
        // console.log(usuarioConfirmar) nos imprimirá en consola el usuario identificado x el token.
        
        usuarioConfirmar.confirmado = true
        usuarioConfirmar.token = ''
        await usuarioConfirmar.save()   //guardamos en la bd una vez confirmado.
        res.json({ msg: 'Usuario Confirmado Correctamente' })

    } catch (error) {
        console.log(error)
    }
}

// comprueba si existe el email, si existe enviará un correo a nuestro email, se generará un nuevo token.
const olvidePassword = async (req, res) => {
    const { email } = req.body
    // Comprobar si existe un usuario con este email.
    const usuario = await Usuario.findOne({email})
    if(!usuario) {
        const error = new Error('El usuario no existe')
        return res.status(404).json({ msg: error.message })
    }
    // si escribe un email correcto, se generará un nuevo token con generarId()
    try {
        usuario.token = generarId()
        await usuario.save()

        // Enviar el email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({ msg: 'Hemos enviado un email con las instrucciones'})
    } catch (error) {
        console.log(error)
    }
}

const comprobarToken = async (req, res) => {
    const { token } = req.params    // extraer valores de la url, body de un formulario.
    const tokenValido = await Usuario.findOne({ token })    // buscamos en la bd x el token

    if(tokenValido) {
        res.json({msg: 'Token válido y el usuario si existe'})  // No lo usaremos en la vista del usuario.
    } else {
        const error = new Error('Token no válido')
        return res.status(404).json({ msg: error.message })
    }
}

// Funcion para cambiar un password.
const nuevoPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    const usuario = await Usuario.findOne({ token })
    if(usuario) {
        usuario.password = password // el usuario de nuestra bd será el q estamos ingresando o cambiando.
        usuario.token = ''
        try {
            await usuario.save()
            res.json({ msg: 'Password Modificado Correctamente, Inicia Sesión' })
        } catch (error) {
            console.log(error)
        }
    } else {
        const error = new Error('Token no válido')
        return res.status(404).json({ msg: error.message })
    }
}

// Obtiene los datos del request, es decir del servidor
const perfil = async (req, res) => {
    const { usuario } = req
    res.json(usuario)
}


export { registrar, autenticar, confirmarToken, olvidePassword, comprobarToken, nuevoPassword, perfil }