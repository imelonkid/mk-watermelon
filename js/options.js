// 当页面加载完成时
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const apiKeyInput = document.getElementById('api-key');
  const modelSelect = document.getElementById('model');
  const temperatureSlider = document.getElementById('temperature');
  const tempValue = document.getElementById('temp-value');
  const saveButton = document.getElementById('save-settings');
  const testButton = document.getElementById('test-api');
  const statusDiv = document.getElementById('status');
  const toggleKeyButton = document.getElementById('toggle-key');
  
  // 加载保存的设置
  loadSettings();
  
  // 更新温度值的显示
  temperatureSlider.addEventListener('input', () => {
    tempValue.textContent = temperatureSlider.value;
  });
  
  // 切换API密钥的显示/隐藏
  toggleKeyButton.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleKeyButton.querySelector('.material-symbols-outlined').textContent = 'visibility_off';
    } else {
      apiKeyInput.type = 'password';
      toggleKeyButton.querySelector('.material-symbols-outlined').textContent = 'visibility';
    }
  });
  
  // 保存设置
  saveButton.addEventListener('click', () => {
    saveSettings();
  });
  
  // 测试API连接
  testButton.addEventListener('click', () => {
    testApiConnection();
  });
  
  // 加载保存的设置
  function loadSettings() {
    chrome.storage.local.get(['apiKey', 'model', 'temperature'], (result) => {
      if (result.apiKey) {
        apiKeyInput.value = result.apiKey;
      }
      
      if (result.model) {
        modelSelect.value = result.model;
      }
      
      if (result.temperature) {
        temperatureSlider.value = result.temperature;
        tempValue.textContent = result.temperature;
      }
    });
  }
  
  // 保存设置到Chrome存储
  function saveSettings() {
    const settings = {
      apiKey: apiKeyInput.value.trim(),
      model: modelSelect.value,
      temperature: temperatureSlider.value
    };
    
    chrome.storage.local.set(settings, () => {
      showStatus('设置已保存', 'success');
      
      // 3秒后隐藏状态消息
      setTimeout(() => {
        hideStatus();
      }, 3000);
    });
  }
  
  // 测试API连接
  async function testApiConnection() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('请输入API密钥', 'error');
      return;
    }
    
    showStatus('正在测试连接...', '');
    
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        showStatus('连接成功! API密钥有效。', 'success');
      } else {
        const errorData = await response.json();
        showStatus(`连接失败: ${errorData.error?.message || '无效的API密钥'}`, 'error');
      }
    } catch (error) {
      showStatus(`连接错误: ${error.message}`, 'error');
    }
  }
  
  // 显示状态消息
  function showStatus(message, type) {
    statusDiv.textContent = message;
    
    // 移除所有状态类
    statusDiv.classList.remove('success', 'error');
    
    if (type) {
      statusDiv.classList.add(type);
    }
    
    statusDiv.style.display = 'block';
  }
  
  // 隐藏状态消息
  function hideStatus() {
    statusDiv.style.display = 'none';
  }
}); 