import ChatServices from '../../services/services.chat.js';

class MessageDTO {
  constructor(user, message, color) {
    this.user = user;
    this.message = message;
    this.color = color;
  }
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

class ChatController {
  constructor() {
    this.chatServices = new ChatServices();
  }

  async saveMessage({ user, message }) {
    let color = getRandomColor();

    const existingMessage = await this.chatServices.getMessages();
    const userMessages = existingMessage.filter(msg => msg.user === user);

    if (userMessages.length > 0) {
      color = userMessages[0].color;
    }

    const savedMessage = await this.chatServices.saveMessage({ user, message, color });
    return new MessageDTO(savedMessage.user, savedMessage.message, savedMessage.color);
  }

  async getMessages() {
    const messages = await this.chatServices.getMessages();
    return messages.map((message) => new MessageDTO(message.user, message.message, message.color));
  }
}

export default ChatController;
