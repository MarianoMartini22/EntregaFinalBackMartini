const socket = io();
let userColorsMap = {};
function showAlert(message, alertType) {
  const alertDiv = document.createElement('div');
  alertDiv.classList.add('alert', `alert-${alertType}`);
  alertDiv.textContent = message;

  const alertContainer = document.getElementById('alert-container');
  alertContainer.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

function isValidEmail(email) {
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return emailRegex.test(email);
}

function sendMessage() {
  const user = document.getElementById('user').value;
  const message = document.getElementById('message').value;
  if (!user) return showAlert('El email es obligatorio', 'danger');
  else if (!isValidEmail(user)) {
    showAlert('El email no es válido', 'danger');
    return;
  } else if (!message) return showAlert('El mensaje es obligatorio', 'danger');

  if (user !== '' && message !== '') {
    const msg = { user, message };
    socket.emit('saveMessage', msg);
    document.getElementById('message').value = '';
  }
}

socket.on('saveMessage', function (msg) {
  const chatbox = document.getElementById('chatbox');
  const div = document.createElement('div');
  div.classList.add('alert', 'mb-3');

  div.style.backgroundColor = msg.color;

  div.textContent = msg.user + ': ' + msg.message;
  chatbox.appendChild(div);
});

socket.on('uploadChats', function (msgs) {
  const chatbox = document.getElementById('chatbox');
  msgs.forEach(msg => {
    const div = document.createElement('div');
    div.classList.add('alert', 'mb-3');
    div.style.backgroundColor = msg.color;

    div.textContent = msg.user + ': ' + msg.message;
    chatbox.appendChild(div);
  });
});

socket.emit('uploadChats');
