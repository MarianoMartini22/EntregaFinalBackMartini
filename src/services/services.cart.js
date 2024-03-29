import { cartsModel } from '../dao/models/carrito.model.js';

class CartRepository {
  async create(cartData) {
    try {
      const result = await cartsModel.create(cartData);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const cart = await cartsModel.findOne({ _id: id }).populate('products.product').exec();
      if (!cart) {
        throw new Error('No se encontró el carrito');
      }
      return cart;
    } catch (error) {
      throw error;
    }
  }

  async findByUserId(id) {
    try {
      const cart = await cartsModel.findOne({ user: id }).populate('products.product').exec();
      if (!cart) {
        // throw new Error('No se encontró el carrito');
      }
      return cart;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const carts = await cartsModel.find().lean();
      return carts;
    } catch (error) {
      throw error;
    }
  }

  async save(cart) {
    try {
      const carrito = await cart.save();
      return carrito;
    } catch (error) {
      throw error;
    }
  }
  async remove(id) {
    try {
      await cartsModel.findOneAndRemove({ _id: id });
    } catch (error) {
      throw error;
    }
  }
}

export default CartRepository;
