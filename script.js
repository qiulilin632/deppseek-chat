const API_KEY = 'sk-45189009b90e4e958322e9b9db4e6c7b';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let messageHistory = [];

function addMessage(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${role}-message`);
  messageDiv.textContent = content;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

  // 添加用户消息
  addMessage('user', userMessage);
  messageHistory.push({ role: 'user', content: userMessage });
  messageInput.value = '';
  sendBtn.disabled = true;

  try {
    // 检查是否为特殊问题
    const specialResponse = handleSpecialQuestions(userMessage);
    if (specialResponse) {
      addMessage('bot', specialResponse);
      return;
    }

    // 添加加载状态
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'bot-message');
    loadingMessage.textContent = '思考中...';
    chatMessages.appendChild(loadingMessage);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messageHistory,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    chatMessages.removeChild(loadingMessage);

    if (data.choices && data.choices.length > 0) {
      const botMessage = data.choices[0].message.content;
      addMessage('bot', botMessage);
      messageHistory.push({ role: 'assistant', content: botMessage });
    } else {
      throw new Error('No response from API');
    }
  } catch (error) {
    console.error('Error:', error);
    addMessage('bot', '抱歉，出错了，请稍后再试。');
  } finally {
    sendBtn.disabled = false;
  }
}

// 事件监听
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// 自定义响应处理
function handleSpecialQuestions(message) {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('你是谁') || 
      lowerMessage.includes('你是什么') ||
      lowerMessage.includes('你的身份')) {
    return '我是秋林设计的专属AI助手，专门为您提供智能对话服务。';
  }
  return null;
}

// 初始化欢迎消息
addMessage('bot', '您好！我是秋林设计的专属AI助手，请问有什么可以帮您？');
document.querySelector('.chat-header h2').textContent = '秋林专属AI';
