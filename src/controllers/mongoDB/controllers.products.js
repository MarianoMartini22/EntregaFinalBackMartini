import { productsModel } from '../../dao/models/productos.model.js';
import { generateProduct } from '../../utils/products.utils.js';

class ProductController {
    async addProduct(product) {
        try {
            if (product.code && (await this.getProductByCode(product.code))) {
                throw new Error('Ya existe un producto con el mismo código');
            }
            const result = await productsModel.create(product);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getProducts(
        limit = 10,
        page = 1,
        sort = 'asc',
        filter = null,
        filterValue = null
    ) {
        try {
            const whereOptions = {};
            if (filter && filterValue) {
                whereOptions[filter] = { $regex: filterValue, $options: 'i' };
            }

            const sortOrder = sort === 'desc' ? -1 : 1;
            const result = await productsModel.paginate(whereOptions, {
                limit,
                page,
                sort: { price: sortOrder },
            });

            return result;
        } catch (error) {
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const result = await productsModel.findOne({ _id: id });
            return result;
        } catch (e) {
            throw new Error('No hay un producto con ese ID');
        }
    }

    async getProductByCode(code) {
        try {
            const result = await productsModel.findOne({ code });
            if (result) {
                return result;
            } else {
                return null;
            }
        } catch (e) {
            return false;
        }
    }

    async getProductsByCategory(category) {
        try {
            const result = await productsModel.find(category);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async updateProduct(id, productData) {
        try {
            const result = await productsModel.updateOne(
                { _id: id },
                { $set: productData }
            );
            if (result.matchedCount === 0) throw new Error('No se encontró un producto con ese ID');
            return result;
        } catch (e) {
            throw e;
        }
    }

    async deleteProduct(id) {
        try {
            const result = await productsModel.deleteOne({ _id: id });
            return result;
        } catch (e) {
            throw new Error('No se encontró un producto con ese ID');
        }
    }
    createMockProduct(cant = 100) {
        const products = [];
        for (let i = 0; i < cant; i++) {
            const product = generateProduct();
            products.push(product);
        }
        return products;
    }
}

export default ProductController;
