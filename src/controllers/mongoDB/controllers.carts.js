import ProductsManager from './controllers.products.js';
import CartRepository from '../../services/services.cart.js';
import { cartsModel } from '../../dao/models/carrito.model.js';

class CartProductDTO {
    constructor(product, quantity) {
        this.product = product;
        this.quantity = quantity;
    }
}

class CartDTO {
    constructor(id, products) {
        this.id = id;
        this.products = products;
    }
}

class CartsManager {
    constructor() {
        this.productsManager = new ProductsManager();
        this.cartRepository = new CartRepository();
    }

    async createCart(user) {
        const cartData = { products: [], user };
        const result = await this.cartRepository.create(cartData);
        return result;
    }

    async getCarts() {
        const carts = await this.cartRepository.findAll();
        return carts.map((cart) => new CartDTO(cart._id, cart.products.map((product) => new CartProductDTO(product.product, product.quantity))));
    }

    async getCartById(id) {
        const cart = await this.cartRepository.findById(id);
        return cart;
    }
    async getCartByUserId(id) {
        const cart = await this.cartRepository.findByUserId(id);
        return cart;
    }

    async addProductToCart(cartId, productId, user) {
        try {
            const product = await this.productsManager.getProductById(productId);
            const cart = await this.getCartById(cartId);
            if (!cart.user && cart.user?._id !== user) {
                throw new Error('Sólo el usuario del carrito puede agregar productos');
            }
            const existingProductIndex = cart.products.findIndex(
                (item) => item._id.toString() === product._id.toString()
            );

            if (existingProductIndex !== -1) {
                // Si el producto ya está en el carrito, se incrementa la cantidad
                cart.products[existingProductIndex].quantity += 1;
            } else {
                // Si el producto no está en el carrito, se agrega con una cantidad de 1
                cart.products.push(product);

            }
            const cartNew = await this.cartRepository.save(cart);
            const updatedCart = await this.populateCartProducts(cartNew);
            return updatedCart;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    async populateCartProducts(cart) {
        const updatedProducts = await Promise.all(
            cart.products.map(async (cartProduct) => {
                const productDetails = await this.productsManager.getProductById(cartProduct._id);
                return { product: productDetails, quantity: cartProduct.quantity };
            })
        );
    
        return updatedProducts;
    }

    async deleteProductFromCart(cartId, productId) {
        const cart = await this.getCartById(cartId);
    
        cart.products = cart.products.filter(
            (item) => !item._id.equals(productId)
        );
    
        // cart.products = productos;
        await this.cartRepository.save(cart);
    }
    
    async deleteAllProductsFromCart(cartId) {
        const cart = await this.getCartById(cartId);
        cart.products = [];
        await this.cartRepository.save(cart);
    }

    async updateCart(cartId, products) {
        try {
            const cart = await this.getCartById(cartId);

            if (!cart) {
                throw new Error('Cart not found');
            }

            const cartProducts = products.map((product) =>
                new CartProductDTO(product.product, product.quantity)
            );

            cart.products = cartProducts;
            await this.cartRepository.save(cart);
            return new CartDTO(cart._id, cart.products.map((product) => new CartProductDTO(product.product, product.quantity)));
        } catch (error) {
            console.error(error);
            throw new Error('Failed to update cart');
        }
    }

    async removeProductFromCart(cartId, productId) {
        const cart = await this.getCartById(cartId);
        // console.log({cart: cart.products, productId});
        cart.products = cart.products.filter(
            (productF) => {
                return productF._id.toString() !== productId;
            }
        );
        return await this.cartRepository.save(cart);
    }

    async updateCartByQuantity(cartId, productId, quantity) {
        const cart = await this.getCartById(cartId);
        const product = await this.productsManager.getProductById(productId);

        if (!cart) {
            throw new Error('Cart not found');
        }

        if (!product) {
            throw new Error('Product not found');
        }

        const productIndex = cart.products.findIndex(
            (prod) => prod.product._id.toString() === product._id.toString()
        );

        if (productIndex === -1) {
            throw new Error('Product not found in the cart');
        }

        cart.products[productIndex].quantity = quantity;

        await this.cartRepository.save(cart);
    }

    async removeAllProductsFromCart(cartId) {
        const cart = await this.getCartById(cartId);
        cart.products = [];
        await this.cartRepository.save(cart);
    }
    async removeCart(cartId) {
        await this.cartRepository.remove(cartId);
    }
}

export default CartsManager;
