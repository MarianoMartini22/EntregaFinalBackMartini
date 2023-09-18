import mongoose from "mongoose";

const collection = "tickets";

const TicketsSchema = new mongoose.Schema( {

    code: {
        type: String,
        required: true,
        unique: true,
    },
    purchase_datetime: {
        type: Date,
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
    

} );

TicketsSchema.pre("save", function (next) {
    this.code = nanoid();
    next();
});


export const ticketsModel = mongoose.model( collection, TicketsSchema );
