import nodemailer from 'nodemailer'


// Confirmar cuenta
export const emailRegistro = async (datos) => {
    const { nombre, email, token } = datos

    // Codigo de mailtrap.io con dodemailer
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Informacion del email
      const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: 'UpTask - Confirma tu cuenta',
        text: 'Confirma tu cuenta en UpTask',
        html: `<p>Hola: ${nombre} Comprueba tu cuenta en UpTask</p>
        <P>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace: 
            <a href='${process.env.FRONTEND_URL}/confirmar/${token}'>Cofirmar Cuenta</a>
        </P>
        <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje.</p>
        
        `
      })
}

//Olvide mi password
export const emailOlvidePassword = async (datos) => {
  const { nombre, email, token } = datos

  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Informacion del email
    const info = await transport.sendMail({
      from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
      to: email,
      subject: 'UpTask - Reestablece tu password',
      text: 'Reestablece tu password',
      html: `<p>Hola: ${nombre} has solicitado reestablecer tu password</p>
      <P>Sigue el siguiente enlace para generar un nuevo password: 
          <a href='${process.env.FRONTEND_URL}/olvide-password/${token}'>Reestablecer Password</a>
      </P>
      <p>Si tu no solicitaste este email, puedes ignorar este mensaje.</p>
      
      `
    })
}


