// 注册侧边栏
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// 当扩展程序第一次安装或更新时
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    console.log('DeepSeek Chat Sidebar 扩展已安装');
  }
}); 