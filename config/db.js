import mongoose from 'mongoose'


const conectarDb = async () => {
    try {
        const coneccion = await mongoose.connect(process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        const url = `${coneccion.connection.host}:${coneccion.connection.port}`
        console.log(`Mongodb conectado en: ${url}`)

    } catch (error) {
        console.log(`error: ${error.message}`)
        process.exit()
    }
}



export default conectarDb
