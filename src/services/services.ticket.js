import CartController from "../controllers/mongoDB/controllers.carts.js";

import ProductController from "../controllers/mongoDB/controllers.products.js";
import UserController from "../controllers/mongoDB/controllers.user.js";
import Services from "./class.services.js";

import { ticketsModel } from "../dao/models/tickets.model.js";

export default class TicketService extends Services {
    constructor(){
        super()
    }

    async generateTicket(userId, cart){
        try {
            const userDao = new UserController();
            const cartDao = new CartController();
            const prodDao = new ProductController(); 
            const user = await userDao.getUserById(userId);
            if(!user) return false;
            let amountAcc = 0;
            for (const prod of cart.products) {
                const idProd = prod.product._id.toString();
                const prodDB = await prodDao.getProductById(idProd);
                if(prod.quantity <= prodDB.stock){
                    const amount = prod.quantity * prodDB.price;
                    amountAcc += amount;
                }
            }
            const ticket = await ticketsModel.create({
                code: `${Math.random()}`,
                amount: amountAcc,
                purchaser: user.email,
                cart: cart._id,
            });
            cartDao.deleteAllProductsFromCart(cart._id);
            return ticket;
        } catch (error) {
            console.log(error);
        }
    }
}