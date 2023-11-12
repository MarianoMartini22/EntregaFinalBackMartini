import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import nodemailer from 'nodemailer';

dotenv.config();

import { HttpResponse } from '../utils/http.response.js';
import { logger } from '../utils/logger.js';
import UserController from '../controllers/mongoDB/controllers.user.js';
const httpResponse = new HttpResponse();

const { verify } = jwt;

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

userRoute.get('/', async (req, res) => {
    try {
        const users = await userManager.getUsers();
        return httpResponse.Ok(res, users);
    } catch (error) {
        return httpResponse.ServerError(res, 'Error al listar usuarios');
    }
});

userRoute.delete('/', async (req, res) => {
    try {
        const users = await userManager.getUsers(true);

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const inactiveUsers = await Promise.all(users.map(async (user) => {
            try {
                const decoded = await promisify(jwt.verify)(user.token, process.env.SECRET_KEY);

                const lastLogin = new Date(decoded.iat * 1000);
                if (lastLogin < twoDaysAgo) {
                    return {
                        nombre: user.nombre,
                        apellido: user.apellido,
                        email: user.email,
                        rol: user.rol,
                    };
                }
            } catch (error) {
                if (error.message === 'jwt must be provided' || error.message === 'jwt expired') {
                    const mailOptions = {
                        from: process.env.MAIL_USERNAME,
                        to: user.email,
                        subject: 'Eliminación de cuenta',
                        html: `
                            <p>Tu cuenta ha sido eliminada por inactividad:</p>
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
                    await userManager.deleteUsers([user]);
                    console.error(`Usuario sin prueba de conexión: ${user.email}: ${error.message}`);
                }
                return null;
            }
        }));
        inactiveUsers.map((user) => {
            const mailOptions = {
                from: process.env.MAIL_USERNAME,
                to: user.email,
                subject: 'Eliminación de cuenta',
                html: `
                    <p>Tu cuenta ha sido eliminada por inactividad:</p>
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
        });
        await userManager.deleteUsers(inactiveUsers);
        return httpResponse.Ok(res, inactiveUsers.filter(user => user !== null));
    } catch (error) {
        return httpResponse.ServerError(res, 'Error al listar usuarios');
    }
});


export default userRoute;
