

import { productsModel } from '../mongodb/models/productos.model.js';

class ProductManager {

    async addProduct(product) {
        try {
          if (product.code && await this.getProductByCode(product.code)) {
            throw new Error('Ya existe un producto con el mismo código');
          }
          const result = await productsModel.create(product);
          return result;
        } catch (error) {
          throw error;
        }
      }
      

    async getProducts (
        limit = 10,
        page = 1,
        sort = 'asc',
        filter = null,
        filterValue = null
    ) {
        if (!limit) limit = 10;
        let whereOptions = {};

        if ( filter && filterValue ) {
            whereOptions = { [filter]: { $regex: filterValue, $options: 'i' } };
        }

        let sortOrder;
        if ( sort === 'desc' ) {
            sortOrder = -1;
        } else {
            sortOrder = 1;
        }
        const result = await productsModel.paginate( whereOptions,
            {
                limit: limit,
                page: page,
                sort: { price: sortOrder },
            }
        );
        return result;
    };

    async getProductById ( id ) {
        try {
            const result = await productsModel.findOne( { _id: id } );
            return result;
        } catch (e) {
            throw new Error('No hay un producto con ese ID');
        }
    };

    async getProductByCode ( code ) {
        try {
            const result = await productsModel.findOne( { code } );
            return result;
        } catch (e) {
            return false;
        }
    };

    async getProductsByCategory ( category ) {
        const result = await productsModel.find( category );
        return result;
    };

    async updateProduct ( id, productData ) {
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
        
    };

    async deleteProduct ( id ) {
        try {
            const result = await productsModel.deleteOne( { _id: id } );
            return result;
        } catch (e) {
            throw new Error('No se encontró un producto con ese ID');
        }
    };

}

export default ProductManager;
