const socket = io();

function actualizarUsuario(email) {
    const selectedRole = document.querySelector(`.role-dropdown[data-email="${email}"]`).value;

    socket.emit('updateRole', {email, selectedRole});
}

function borrarUsuario(email) {
    socket.emit('deleteUser', email);
}

socket.on('updateRole', function () {
    alert('Rol actualizado');
});

socket.on('updateRoleError', function () {
    alert('Error al actualizar rol, intente más tarde');
});

socket.on('deleteUser', function () {
    location.reload();
});

socket.on('deleteUserError', function () {
    alert('Error al borrar usuario, intente más tarde');
});