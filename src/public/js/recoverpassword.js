const socket = io();



function getToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    return token;
}

function updatePasswords() {
    const password1 = document.getElementById('password1').value;
    const password2 = document.getElementById('password2').value;
    if (!password1) {
        alert('Debe colocar una contraseña');

    } else if (!password2) {
        alert('Debe repetir la contraseña');
        return;
    } else if (password1 !== password2) {
        alert('Las contraseñas no coinciden');
        return;
    } else if (password1.length < 4 || password2.length < 4) {
        return;
    }
    const token = getToken();
    socket.emit('updatePassword', {token, password: password1});
}

function passwordActualizada() {
    alert('Contraseña actualizada con éxito');
    window.location.href = '/login';
}

function updatePasswordError() {
    alert('Ocurrió un error al actualizar la contraseña');
}

function updateSamePasswordError() {
    alert('Esta contraseña ya fue utilizada anteriormente');
}

function sameTokenError() {
    alert('Token vencido, debe recuperar nuevamente la contraseña');
    window.location.href = '/login';
}

socket.on('updatedPassword', passwordActualizada);
socket.on('updatePasswordError', updatePasswordError);
socket.on('updateSamePasswordError', updateSamePasswordError);
socket.on('sameTokenError', sameTokenError);