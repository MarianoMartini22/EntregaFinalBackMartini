import Controllers from "./class.controller.js";
import TicketService from "../../services/services.ticket.js";
const createResponse = (res, statusCode, data) => {
    return res.status(statusCode).json({ data });
};
  
const ticketService = new TicketService();

export default class TicketController extends Controllers {
    constructor(){
        super(ticketService);
    }

    async generateTicket(_id, cart){
        try {
            const ticket = await ticketService.generateTicket(_id, cart);
            return ticket;
        } catch (error) {
            console.log(error.message);
        }
    }
}