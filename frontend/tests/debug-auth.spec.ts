import { test, expect } from '@playwright/test';

test.describe('Debug Authentication Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debug tab structure', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 截图
    await page.screenshot({ path: 'login-page.png', fullPage: true });
    
    // 获取所有tab元素
    const tabs = await page.locator('[role="tab"]').all();
    console.log('Tab数量:', tabs.length);
    
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const text = await tab.textContent();
      const ariaSelected = await tab.getAttribute('aria-selected');
      console.log(`Tab ${i}: "${text}", aria-selected: ${ariaSelected}`);
    }
    
    // 获取所有表单
    const forms = await page.locator('form').all();
    console.log('表单数量:', forms.length);
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const text = await form.textContent();
      console.log(`表单 ${i} 文本片段:`, text?.substring(0, 100));
    }
    
    // 获取所有按钮
    const buttons = await page.locator('button').all();
    console.log('按钮数量:', buttons.length);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      console.log(`按钮 ${i}: "${text}"`);
    }
    
    // 尝试点击注册tab
    const registerTab = page.locator('text=注册').first();
    console.log('注册tab可见性:', await registerTab.isVisible());
    
    if (await registerTab.isVisible()) {
      console.log('点击注册tab...');
      await registerTab.click();
      await page.waitForTimeout(2000);
      
      // 再次截图
      await page.screenshot({ path: 'after-register-click.png', fullPage: true });
      
      // 检查点击后的状态
      const tabsAfterClick = await page.locator('[role="tab"]').all();
      console.log('点击后Tab数量:', tabsAfterClick.length);
      
      for (let i = 0; i < tabsAfterClick.length; i++) {
        const tab = tabsAfterClick[i];
        const text = await tab.textContent();
        const ariaSelected = await tab.getAttribute('aria-selected');
        console.log(`点击后Tab ${i}: "${text}", aria-selected: ${ariaSelected}`);
      }
    }
  });
});