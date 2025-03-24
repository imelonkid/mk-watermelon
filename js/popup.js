document.addEventListener('DOMContentLoaded', () => {
  const openSidebarButton = document.getElementById('open-sidebar');
  const openSettingsLink = document.getElementById('open-settings');
  const checkApiKeyLink = document.getElementById('check-api-key');
  const apiKeyStatus = document.getElementById('api-key-status');
  
  // 检查是否已配置API密钥
  checkApiKeyConfig();
  
  // 打开侧边栏按钮点击事件
  openSidebarButton.addEventListener('click', async () => {
    try {
      // 尝试打开侧边栏
      if (chrome.sidePanel && chrome.sidePanel.open) {
        // 新版Chrome API
        await chrome.sidePanel.open();
        console.log('侧边栏已打开');
      } else if (chrome.sidePanel && chrome.sidePanel.setOptions) {
        // 兼容旧版的API
        chrome.sidePanel.setOptions({
          path: 'sidebar.html',
          enabled: true
        });
        console.log('已设置侧边栏选项');
      } else {
        // 回退方案
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const url = chrome.runtime.getURL('sidebar.html');
          chrome.tabs.create({ url });
          console.log('在新标签页中打开侧边栏页面');
        });
        return; // 不关闭弹出窗口，因为我们需要用户看到这个消息
      }
    } catch (error) {
      console.error('打开侧边栏时出错:', error);
      alert('无法打开侧边栏。尝试重新加载扩展程序或更新Chrome浏览器。');
      return; // 同样不关闭弹出窗口
    }
    
    // 关闭弹出窗口
    window.close();
  });
  
  // 打开设置页面链接点击事件
  openSettingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
  
  // 检查API密钥状态链接点击事件
  checkApiKeyLink.addEventListener('click', (e) => {
    e.preventDefault();
    checkApiKeyConfig(true); // 强制显示状态
  });
  
  // 页面加载时检查一次API密钥状态
  checkApiKeyConfig(false);
  
  // 检查API密钥配置
  function checkApiKeyConfig(forceShow = false) {
    chrome.storage.local.get(['apiKey', 'model'], (result) => {
      if (!result.apiKey) {
        // 没有API密钥，显示警告
        apiKeyStatus.style.display = 'block';
        apiKeyStatus.className = 'api-key-status warning';
        apiKeyStatus.textContent = '您尚未设置Watermelon API密钥，请先前往设置页面配置';
      } else {
        // 有API密钥，显示成功信息
        apiKeyStatus.style.display = 'block';
        apiKeyStatus.className = 'api-key-status success';
        
        const modelName = result.model === 'deepseek-coder' ? 'Watermelon Coder' : 'Watermelon Chat';
        apiKeyStatus.textContent = `API密钥已配置 (${modelName})`;
        
        // 如果不是强制显示，则3秒后隐藏成功消息
        if (!forceShow) {
          setTimeout(() => {
            apiKeyStatus.style.display = 'none';
          }, 3000);
        }
      }
    });
  }
}); 