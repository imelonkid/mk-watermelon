document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const chatMessages = document.getElementById('chat-messages');
  const clearChatButton = document.getElementById('clear-chat');
  const welcomeContainer = document.getElementById('welcome-container');
  const chatInputContainer = document.getElementById('chat-input-container');
  const toolCards = document.querySelectorAll('.tool-card');
  const backToHomeButton = document.getElementById('back-to-home');
  
  // 聊天历史记录
  let conversationHistory = [];
  
  // 从localStorage加载聊天历史
  loadChatHistory();
  
  // 设置输入框自动调整高度
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = (messageInput.scrollHeight) + 'px';
  });
  
  // 按Enter发送消息（Shift+Enter换行）
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // 点击发送按钮发送消息
  sendButton.addEventListener('click', sendMessage);
  
  // 点击返回首页按钮
  backToHomeButton.addEventListener('click', () => {
    showWelcomePage();
  });
  
  // 清除聊天记录
  clearChatButton.addEventListener('click', () => {
    if (confirm('确定要清除所有聊天记录吗？')) {
      chatMessages.innerHTML = `
        <div class="message ai-message">
          <div class="message-content">
            <p>你好！我是Watermelon AI助手。有什么我可以帮助你的吗？</p>
          </div>
        </div>
      `;
      // 重置对话历史
      conversationHistory = [
        { role: 'assistant', content: '你好！我是Watermelon AI助手。有什么我可以帮助你的吗？' }
      ];
      // 清除localStorage中的聊天记录
      chrome.storage.local.set({ 'chatHistory': [] });
    }
  });
  
  // 为工具卡片添加点击事件
  toolCards.forEach(card => {
    card.addEventListener('click', () => {
      const toolType = card.getAttribute('data-tool');
      startToolChat(toolType);
    });
  });
  
  // 启动特定工具的聊天
  function startToolChat(toolType) {
    // 显示聊天界面，隐藏欢迎页
    showChatInterface();
    
    // 根据工具类型设置不同的欢迎消息
    let welcomeMessage = '';
    switch(toolType) {
      case 'translate':
        welcomeMessage = '您好！我可以帮您翻译文本。请输入需要翻译的内容和目标语言。';
        break;
      case 'fullscreen':
        welcomeMessage = '全屏聊天模式已启动。您可以在这里与我自由交流。';
        break;
      case 'summary':
        welcomeMessage = '总结助手已启动。请输入需要我帮您总结的文本内容。';
        break;
      case 'deepthink':
        welcomeMessage = '深度思考模式已启动。我将帮助您进行深入分析和思考。请描述您想讨论的话题或问题。';
        break;
      default:
        welcomeMessage = '您好！我是Watermelon AI助手。有什么我可以帮助您的吗？';
    }
    
    // 清空聊天记录
    chatMessages.innerHTML = '';
    
    // 添加欢迎消息
    addMessageToChat('ai', welcomeMessage);
    
    // 重置对话历史
    conversationHistory = [
      { role: 'assistant', content: welcomeMessage }
    ];
    
    // 保存聊天历史
    saveChatHistory();
    
    // 聚焦输入框
    messageInput.focus();
  }
  
  // 显示聊天界面
  function showChatInterface() {
    welcomeContainer.style.display = 'none';
    chatMessages.style.display = 'flex';
    backToHomeButton.style.display = 'flex'; // 显示返回首页按钮
  }
  
  // 显示欢迎页面
  function showWelcomePage() {
    welcomeContainer.style.display = 'flex';
    chatMessages.style.display = 'none';
    backToHomeButton.style.display = 'none'; // 隐藏返回首页按钮
  }
  
  // 发送消息的函数
  function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // 如果当前是欢迎页面，切换到聊天界面
    if (getComputedStyle(welcomeContainer).display !== 'none') {
      showChatInterface();
      
      // 如果这是第一条消息，添加一个默认的AI欢迎消息
      if (conversationHistory.length <= 1) {
        const welcomeMessage = '您好！我是Watermelon AI助手。有什么我可以帮助您的吗？';
        // 清空聊天记录
        chatMessages.innerHTML = '';
        // 添加欢迎消息
        addMessageToChat('ai', welcomeMessage);
        // 设置对话历史
        conversationHistory = [
          { role: 'assistant', content: welcomeMessage }
        ];
      }
    }
    
    // 添加用户消息到聊天区域
    addMessageToChat('user', message);
    
    // 添加到对话历史
    conversationHistory.push({ role: 'user', content: message });
    
    // 清空输入框
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // 显示AI正在输入的指示器
    showTypingIndicator();
    
    // 检查是否有API密钥
    checkApiKeyAndSend(message);
  }
  
  // 检查API密钥并发送消息
  function checkApiKeyAndSend(message) {
    chrome.storage.local.get(['apiKey', 'model', 'temperature'], (settings) => {
      if (!settings.apiKey) {
        // 没有API密钥
        removeTypingIndicator();
        addMessageToChat('ai', '⚠️ 您尚未配置Watermelon API密钥。请点击扩展图标，然后点击"设置"链接进行配置。');
        return;
      }
      
      // 调用API
      sendToWatermelonAPI(message, settings)
        .then(response => {
          // 移除输入指示器
          removeTypingIndicator();
          // 添加AI回复到聊天区域
          addMessageToChat('ai', response);
          // 添加到对话历史
          conversationHistory.push({ role: 'assistant', content: response });
        })
        .catch(error => {
          // 移除输入指示器
          removeTypingIndicator();
          // 显示错误消息
          addMessageToChat('ai', `抱歉，发生了错误：${error.message}`);
        });
    });
  }
  
  // 添加消息到聊天区域
  function addMessageToChat(sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
    
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${formatMessage(content)}</p>
      </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 保存聊天历史
    saveChatHistory();
  }
  
  // 显示"AI正在输入"的指示器
  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator-container';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // 移除输入指示器
  function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  // 格式化消息内容，支持简单的markdown语法和换行
  function formatMessage(content) {
    // 将换行符转换为<br>
    let formatted = content.replace(/\n/g, '<br>');
    
    // 支持 **粗体**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 支持 *斜体*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 支持 `代码`
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
    
    return formatted;
  }
  
  // 保存聊天历史到localStorage
  function saveChatHistory() {
    chrome.storage.local.set({ 'chatHistory': conversationHistory });
  }
  
  // 从localStorage加载聊天历史
  function loadChatHistory() {
    chrome.storage.local.get(['chatHistory'], (result) => {
      conversationHistory = result.chatHistory || [
        { role: 'assistant', content: '你好！我是Watermelon AI助手。有什么我可以帮助你的吗？' }
      ];
      
      if (conversationHistory.length > 1) {
        // 有聊天记录，显示聊天界面
        showChatInterface();
        
        // 清空默认欢迎消息
        chatMessages.innerHTML = '';
        
        // 添加历史消息
        conversationHistory.forEach(msg => {
          const sender = msg.role === 'user' ? 'user' : 'ai';
          addMessageToChat(sender, msg.content);
        });
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } else {
        // 没有聊天记录，显示欢迎页面
        showWelcomePage();
      }
    });
  }
  
  // 向API发送请求
  async function sendToWatermelonAPI(message, settings) {
    try {
      const { apiKey, model, temperature } = settings;
      const modelName = model || 'deepseek-chat';
      const temp = temperature || 0.7;
      
      // 准备发送的消息历史
      const messages = [...conversationHistory];  // 复制当前的对话历史
      
      // 限制发送的历史消息数量，避免超过token限制
      if (messages.length > 10) {
        // 保留第一条消息和最后9条消息
        const firstMessage = messages[0];
        const recentMessages = messages.slice(-9);
        messages.length = 0;
        messages.push(firstMessage, ...recentMessages);
      }
  
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: messages,
          temperature: parseFloat(temp),
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '调用API时出错');
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('API错误:', error);
      throw new Error(`与Watermelon AI通信失败: ${error.message}`);
    }
  }
}); 