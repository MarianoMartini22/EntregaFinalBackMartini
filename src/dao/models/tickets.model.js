import mongoose from "mongoose";
import { nanoid } from "nanoid";

const collection = "tickets";

const TicketsSchema = new mongoose.Schema( {

    code: {
        type: String,
        required: true,
        unique: true,
    },
    purchase_datetime: {
        type: Date,
        default: Date.now,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts",
    },
    

} );

TicketsSchema.pre("save", function (next) {
    this.code = nanoid();
    next();
});


export const ticketsModel = mongoose.model( collection, TicketsSchema );
