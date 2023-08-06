const socket = io();

function registro(event) {
    event.preventDefault();
    event.stopPropagation();
    const user = {
        nombre: event.target.nombre.value,
        apellido: event.target.apellido.value,
        email: event.target.email.value,
        password: event.target.password.value,
        password2: event.target.password2.value,
    }
    if (user.password.length < 4) {
        alert('La contraseña debe contener al menos 4 caracteres');
        return;
    }
    if (user.password !== user.password2) {
        alert('Las contraseñas no coinciden');
        return;
    }
    socket.emit('registrarUsuario', user);
}

function loginUser(event) {
    event.preventDefault();
    event.stopPropagation();
    const user = {
        email: event.target.email.value,
        password: event.target.password.value,
    }
    socket.emit('loginUsuario', user);
}


function ingresarUsuario(canLogin) {
    if (!canLogin.ok) {
        alert('Error al ingresar: ' + canLogin.error);
        return;
    }
    const nombre = canLogin.user.nombre;
    localStorage.setItem('user', nombre);
    window.location.href = '/productos';
}

function registrarUsuario(user) {
    if (!user.ok) {
        alert(user.error);
        return;
    }
    window.location.href = '/login';
}


function errorUsuario(error) {
    alert(error.error);
}



socket.on('loginUsuario', ingresarUsuario);
socket.on('registrarUsuario', registrarUsuario);

socket.on('errorUsuario', errorUsuario);
