import { test, expect } from '@playwright/test';

test.describe('Final Debug Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debug button text and structure', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 获取所有按钮的完整信息
    const buttons = await page.locator('button').all();
    console.log('按钮数量:', buttons.length);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      const html = await button.innerHTML();
      
      console.log(`按钮 ${i}:`);
      console.log(`  文本: "${text}"`);
      console.log(`  可见: ${isVisible}`);
      console.log(`  可用: ${isEnabled}`);
      console.log(`  HTML: ${html}`);
      console.log('---');
    }
    
    // 点击注册tab
    const registerTab = page.locator('text=注册').first();
    console.log('点击注册tab...');
    await registerTab.click();
    await page.waitForTimeout(2000);
    
    console.log('点击后按钮状态:');
    
    // 再次获取按钮信息
    const buttonsAfterClick = await page.locator('button').all();
    for (let i = 0; i < buttonsAfterClick.length; i++) {
      const button = buttonsAfterClick[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      const html = await button.innerHTML();
      
      console.log(`按钮 ${i}:`);
      console.log(`  文本: "${text}"`);
      console.log(`  可见: ${isVisible}`);
      console.log(`  可用: ${isEnabled}`);
      console.log(`  HTML: ${html}`);
      console.log('---');
    }
    
    // 截图
    await page.screenshot({ path: 'final-debug.png', fullPage: true });
  });
});