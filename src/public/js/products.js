const socket = io();

function updateProductos(products) {
    const tableBody = document.querySelector('.table tbody');
    tableBody.innerHTML = '';
    products.forEach((product) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.code}</td>
            <td>${product.title}</td>
            <td>${product.description}</td>
            <td>${product.price}</td>
            <td>${product.thumbnails}</td>
            <td>${product.stock}</td>
            <td>${product.category}</td>
            <td>${product.status}</td>
        `;
        tableBody.appendChild(row);
    });
}

function logout() {
    socket.emit('logout');
}

function handleLogOut() {
    localStorage.removeItem('user');
    window.location.href = '/login';
}

function updateUser(user) {
    if (user) localStorage.setItem('user', user);
}

if (localStorage.getItem('user')) document.getElementById('usuario').innerText = 'Bienvenido ' + localStorage.getItem('user') + '!';

document.getElementById('logoutBtn').addEventListener('click', logout);
socket.on('logout', handleLogOut);
socket.on('actualizarProductos', updateProductos);
socket.on('loginGithub', updateUser);
