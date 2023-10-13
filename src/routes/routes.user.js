import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

dotenv.config();

import { HttpResponse } from '../utils/http.response.js';
import { logger } from '../utils/logger.js';
import UserController from '../controllers/mongoDB/controllers.user.js';
const httpResponse = new HttpResponse();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    }
});

const userManager = new UserController();
const userRoute = express.Router();

userRoute.post('/recoverPassword', async (req, res) => {
    const { email } = req.body;
    const user = await userManager.getUserByEmail(email);
    if (!user) {
        return res.status(404).json({ ok: false });
    }

    const expirationTime = Math.floor(Date.now() / 1000) + 3600;
    // const expirationTime = Math.floor(Date.now() / 1000) + 60; // para 1 minuto


    const token = jwt.sign({ email, exp: expirationTime }, process.env.SECRET_KEY, { algorithm: 'HS256' });

    req.socketServer.token = token;
    const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: email,
        subject: 'Recuperación de contraseña',
        html: `
            <p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>
            <a href="http://localhost:8080/recoverpassword?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
            <p>O copia y pega la siguiente URL en tu navegador:</p>
            <p>http://localhost:8080/recoverpassword?token=${token}</p>
        `,
    };
    

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo electrónico:', error);
            return res.status(500).json({ ok: false, message: 'Error al enviar el correo electrónico' });
        } else {
            console.log('Correo electrónico enviado:', info.response);
            req.socketServer.token = token;
            return res.status(200).json({ ok: true });
        }
    });
    return res.status(200).json({ ok: true });
    
});


export default userRoute;
