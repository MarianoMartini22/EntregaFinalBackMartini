import { faker } from "@faker-js/faker";
// import { fakerES as faker } from "@faker-js/faker";

export const generateProduct = () => {
    return {
        title: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        price: faker.number.float({ min: 10, max: 1000, precision: 0.01 }),
        thumbnails: faker.image.url(),
        code: faker.string.uuid(),
        stock: faker.number.int({ min: 1, max: 100 }),
        category: faker.commerce.department(),
        status: faker.datatype.boolean(),
    };
}
