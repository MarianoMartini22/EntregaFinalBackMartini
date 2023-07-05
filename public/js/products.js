const socket = io();

function updateProductos(products) {
    const tableBody = document.querySelector('.table tbody');
    tableBody.innerHTML = '';

    products.forEach((product) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.title}</td>
            <td>${product.description}</td>
            <td>${product.price}</td>
            <td>${product.thumbnails}</td>
            <td>${product.code}</td>
            <td>${product.stock}</td>
            <td>${product.category}</td>
            <td>${product.status}</td>
        `;
        tableBody.appendChild(row);
    });
}

socket.on('actualizarProductos', updateProductos);
