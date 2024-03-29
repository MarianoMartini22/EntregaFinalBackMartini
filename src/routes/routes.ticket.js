import express from 'express';
import dotenv from 'dotenv';
import isAuth from '../middlewares/isAuth.js';
const controller = new TicketController();

dotenv.config();

import { HttpResponse } from '../utils/http.response.js';
import TicketController from '../controllers/mongoDB/controllers.ticket.js';
import { logger } from '../utils/logger.js';
const httpResponse = new HttpResponse();

const ticketRoute = express.Router();


ticketRoute.post('/', isAuth, async (req, res) => {
  try {
    const { _id } = req.socketServer.user.user;
    const ticket = await controller.generateTicket(_id);
    if(!ticket) {
      logger.error('Error al generar ticket');
      return httpResponse.NotFound(res, 'Error al generar ticket');
    }
    return httpResponse.Ok(res, ticket);
  } catch (error) {
    logger.fatal({msg: 'No se pudo crear el ticket', error});
    return httpResponse.NotFound(res, 'No se pudo crear el ticket');
  }
});


export default ticketRoute;
