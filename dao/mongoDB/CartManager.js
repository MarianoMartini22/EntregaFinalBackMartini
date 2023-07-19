

import { cartsModel } from '../mongodb/models/carrito.model.js';
import ProductsManager from './ProductManager.js';


class CartsManager {

    productsManager = new ProductsManager();

    async createCart () {

        const result = await cartsModel.create( { products: [] } );
        return result;

    };

    async getCarts () {

        const result = await cartsModel.find().lean();
        return result;

    };

    async getCartById ( id ) {
        const result = await cartsModel.findOne( { _id: id } ).populate( 'products.product' ).catch(() => {
            throw new Error('No hay un carrito con ese ID');
        });
        return result;
    };

    async addProductToCart(cartId, productId) {
        try {
            const product = await this.productsManager.getProductById(productId);
            const cart = await this.getCartById(cartId);
            const existingProduct = cart.products.find(
            (item) => item.product._id.toString() === product._id.toString()
            );
            if (existingProduct) {
                // Si el producto ya está en el carrito, se incrementa la cantidad
                existingProduct.quantity += 1;
            } else {
                // Si el producto no está en el carrito, se agrega con una cantidad de 1
                cart.products.push({ product, quantity: 1 });
            }
            await cart.save();
        } catch (e) {
            throw new Error(e.message);
        }
    };
      
      

    async deleteProductFromCart ( cartId, productId ) {
        // Maybe use syntax like "this.productsManager.getProductById( productId );"
        const cart = await this.getCartById( cartId );
        cart.products.pull( productId );
        await cart.save();

        return;
    };

    async deleteAllProductsFromCart ( cartId ) {
        // Maybe use syntax like "this.productsManager.getProductById( productId );"
        const cart = await this.getCartById( cartId );
        cart.products = [];
        await cart.save();

        return;
    };

    async updateCart ( cartId, products ) {

        try {

            // Fetch the cart by ID
            const cart = await this.getCartById( cartId );

            // Check if the cart exists
            if ( !cart ) {
                throw new Error( 'Cart not found' );
            }

            // Update the products array
            cart.products = products;

            console.log( cart );

            // Save the cart back to the database
            await cart.save();

            // Return the updated cart
            return cart;

        } catch ( error ) {
            console.error( error );
            throw new Error( 'Failed to update cart' );
        }
        // try {

        //     const updatedCart = await cartsModel.findByIdAndUpdate(
        //         { _id: cartId },
        //         { $set: { products: products } }
        //     );

        //     return updatedCart;

        // } catch ( error ) {
        //     console.error( error );
        //     throw new Error( 'Failed to update cart' );
        // }
    }
};


export default CartsManager;