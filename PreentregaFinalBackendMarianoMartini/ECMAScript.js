const fs = require('fs');
const path = require('path');

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.products = [];
    this.nextId = 1;
    this.loadProducts();
  }

  loadProducts() {
    try {
      const data = fs.readFileSync(this.path, 'utf8');
      if (data) {
        this.products = JSON.parse(data);
        const lastProduct = this.products[this.products.length - 1];
        this.nextId = lastProduct ? lastProduct.id + 1 : 1;
      }
    } catch (error) {
      console.log('Error al leer el archivo:', error.message);
    }
  }

  saveProducts() {
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.products), 'utf8');
    } catch (error) {
      console.log('Error al guardar en el archivo:', error.message);
    }
  }

  addProduct(product) {
    if (!product.title || !product.description || !product.price || !product.thumbnail || !product.code || !product.stock) {
      console.log('Error: Todos los campos son obligatorios.');
      return;
    }

    if (this.isCodeDuplicate(product.code)) {
      console.log('Error: El código ya está en uso.');
      return;
    }

    const newProduct = {
      id: this.nextId,
      title: product.title,
      description: product.description,
      price: product.price,
      thumbnail: product.thumbnail,
      code: product.code,
      stock: product.stock,
    };

    this.products.push(newProduct);
    this.nextId++;
    this.saveProducts();
  }

  isCodeDuplicate(code) {
    return this.products.some((product) => product.code === code);
  }

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    const product = this.products.find((product) => product.id === id);
    if (product) {
      return product;
    } else {
      console.log('Error: Producto no encontrado.');
      return null;
    }
  }

  updateProduct(id, updatedFields) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index !== -1) {
      const updatedProduct = { ...this.products[index], ...updatedFields };
      this.products[index] = updatedProduct;
      this.saveProducts();
    } else {
      console.log('Error: Producto no encontrado.');
    }
  }

  deleteProduct(id) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveProducts();
    } else {
      console.log('Error: Producto no encontrado.');
    }
  }
}

const filePath = path.join('./productos.json');
const manager = new ProductManager(filePath);

manager.addProduct({
  title: 'Chupetines',
  description: 'Leritier de frutilla',
  price: 10,
  thumbnail: 'imagen1.jpg',
  code: 'CODE001',
  stock: 20,
});
manager.addProduct({
  title: 'Chupetines',
  description: 'Leritier de frutilla',
  price: 10,
  thumbnail: 'imagen1.jpg',
  code: 'CODE001',
  stock: 20,
});
manager.addProduct({
  title: 'Alfajor',
  description: 'Milka triple',
  price: 15,
  thumbnail: 'imagen2.jpg',
  code: 'CODE002',
  stock:10,
});
manager.addProduct({
title: 'Barra de chocolate',
description: 'Cofler aireado',
price: 20,
thumbnail: 'imagen3.jpg',
code: 'CODE003',
stock: 5,
});

console.log(manager.getProducts());

console.log(manager.getProductById(2));

console.log(manager.getProductById(4));

// Actualizar un producto
manager.updateProduct(2, { price: 12, stock: 15 });

// Eliminar un producto
manager.deleteProduct(4);

console.log(manager.getProducts());
