import mongoose from "mongoose";
import bcrypt from 'bcrypt' // hashear usuarios *paso1.
import generarId from "../helpers/generarId.js";

/* Asi es como se crea la estructura de tus tablas o datos en mongoose */
// MODELO USUARIO

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    token: {
        type: String,
        default: generarId()
    },
    confirmado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true    // Creará dos columnas, createdAt y updateAt.
})
// a traves del this.* podemos acceder a cualqiera de los campos de nuestra tabla ya sea el nombre, corre ,etc. (de la bd)

// Esta funcion se ejecuta antes de que se almacene en la bd.
usuarioSchema.pre('save', async function(next) {
    // si no se esta modificando el password, no se cambiará el password(al editar un perfil solo el nombre ej. la contras debe seguir igual)
    // se ignorará este codigo si no se esta modificando el pass.
    if (!this.isModified('password')) {
        next()  // hace que te envíe hacia el sgt midleware, es decir al siguiente codigo.
    }
    // si se esta modificando se ejecutara esta parte.
    const salt = await bcrypt.genSalt(10)   //genera un hash de 10 digitos.
    this.password = await bcrypt.hash(this.password, salt)  //cambiaremos el password q se ingresó por el salt
})

// Compara el password q se esta ingresando con el password q ya esta hasheado o en la bd pero internamente con el string real.
usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password)  // nos retorna true o false.
}

const Usuario = mongoose.model('Usuario', usuarioSchema)    // 'Usuario', este se usará para las referencias.
export default Usuario