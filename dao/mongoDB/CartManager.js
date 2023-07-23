

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


            // Save the cart back to the database
            await cart.save();

            // Return the updated cart
            return cart;

        } catch ( error ) {
            console.error( error );
            throw new Error( 'Failed to update cart' );
        }
    }
    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await this.getCartById(cartId);
    
            if (!cart) {
                throw new Error('Cart not found');
            }
    
            cart.products = cart.products.filter((productF) => productF.product && productF.product._id !== productId);
    
            await cart.save();
    
            return { message: 'Producto borrado del carrito correctamente.', cart };
        } catch (error) {
            console.error(error);
            throw new Error('Failed to delete cart');
        }
    }
    async updateCart(cartId, products) {
        try {
            const cart = await this.getCartById(cartId);
            if (!products) products = [];
            if (!cart) {
                throw new Error('Cart not found');
            }
            const notExists = [];
            products.map((product) => {
                const element = this.productsManager.getProductById( product._id );
                if (!element) {
                    notExists.push(element);
                    products.filter((prod) => prod && prod._id !== element._id);
                }
            });
            if (notExists.length > 0) {
                throw new Error('Products not found: ', notExists);
            }
            const unificarProductos = products.reduce((result, product) => {
                const { product: productId, quantity } = product;
                if (!result[productId]) {
                  result[productId] = quantity;
                } else {
                  result[productId] += quantity;
                }
                return result;
              }, {});
              
              const finalProducts = Object.keys(unificarProductos).map((productId) => ({
                product: productId,
                quantity: unificarProductos[productId]
              }));
            cart.products = finalProducts;
    
            await cart.save();
    
            return { message: 'Productos actualizados del carrito correctamente.', cart };
        } catch (error) {
            console.error(error);
            throw new Error('Failed to update cart');
        }
    }
    async updateCartByQuantity(cartId, productId, quantity) {
        try {
            const cart = await this.getCartById(cartId);
            const product = await this.productsManager.getProductById( productId );
            if (!cart) {
                throw new Error('Cart not found');
            }
            if (!product) {
                throw new Error('Product not found');
            }
            const productIndex = cart.products.findIndex((prod) => prod.product._id.toString() === product._id.toString());
            if (productIndex === -1) {
                throw new Error('Product not found in the cart');
            }
    
            cart.products[productIndex].quantity = quantity;
    
            await cart.save();
            return { message: 'Cantidad actualizada del producto (' + product.code + '): ' + quantity };
        } catch (error) {
            console.error(error);
            throw new Error('Failed to update cart');
        }
    }
    async removeAllProductsFromCart(cartId) {
        try {
            const cart = await this.getCartById(cartId);
    
            if (!cart) {
                throw new Error('Cart not found');
            }
    
            cart.products = [];
    
            await cart.save();
    
            return { message: 'Productos borrados del carrito correctamente.', cart };
        } catch (error) {
            console.error(error);
            throw new Error('Failed to delete cart');
        }
    }
    
    
    
};


export default CartsManager;