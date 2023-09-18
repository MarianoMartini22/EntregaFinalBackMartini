

import mongoose from 'mongoose';

const collection = 'carts';

const CartsSchema = new mongoose.Schema( {

    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products",
                },
                quantity: {
                    type: Number,
                },
            },
        ],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
    }
} );

export const cartsModel = mongoose.model( collection, CartsSchema );
