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

function validarEmail(email) {
    var pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

function showRecoverErrorMsg() {
    alert('Error: No hay un usuario con ese email');
}

function handlePassRecover() {
    const email = document.getElementById('email').value;
    if (!email || !validarEmail(email)) {
        showRecoverErrorMsg();
        return;
    }
    socket.emit('recoverPassword', email);
}

function tokenError(msg) {
    alert(msg);
}

socket.on('loginUsuario', ingresarUsuario);
socket.on('registrarUsuario', registrarUsuario);

socket.on('errorUsuario', errorUsuario);
socket.on('recoverPasswordError', showRecoverErrorMsg);
socket.on('tokenError', tokenError);

localStorage.removeItem('user');