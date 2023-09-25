const socket = io();

function registro(event) {

}

function loginUser(event) {
}


function ingresarUsuario(canLogin) {
    if (!canLogin.ok) {
        alert('Error al ingresar: ' + canLogin.error);
        return;
    }
    const nombre = canLogin.user.nombre;
    if (nombre) localStorage.setItem('user', nombre);
}

function registrarUsuario(user) {
    if (!user.ok) {
        alert(user.error);
        return;
    }
    if (user.ok) alert('usuario creado con éxito');
}


function errorUsuario(error) {
    alert(error.error);
}



socket.on('loginUsuario', ingresarUsuario);
socket.on('registrarUsuario', registrarUsuario);

socket.on('errorUsuario', errorUsuario);

localStorage.removeItem('user');