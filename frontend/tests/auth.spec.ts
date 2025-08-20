import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('register button should be present and clickable', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('text=GitViz', { timeout: 10000 });
    
    // 查找注册按钮
    const registerButton = page.locator('text=注册');
    
    // 检查注册按钮是否存在
    await expect(registerButton).toBeVisible();
    
    // 检查注册按钮是否可点击
    await expect(registerButton).toBeEnabled();
    
    // 点击注册按钮并检查是否有反应
    await registerButton.click();
    
    // 等待可能的导航或模态框出现
    await page.waitForTimeout(2000);
    
    // 检查是否导航到了注册页面或出现了注册模态框
    const currentUrl = page.url();
    console.log('点击注册后的URL:', currentUrl);
    
    // 检查是否有注册表单出现
    const registerForm = page.locator('form').filter({ hasText: '注册' }).first();
    const registerModal = page.locator('[role="dialog"]').filter({ hasText: '注册' }).first();
    
    if (await registerForm.count() > 0) {
      console.log('发现注册表单');
      await expect(registerForm).toBeVisible();
    } else if (await registerModal.count() > 0) {
      console.log('发现注册模态框');
      await expect(registerModal).toBeVisible();
    } else {
      console.log('未发现注册表单或模态框');
      // 截图以便调试
      await page.screenshot({ path: 'register-click-result.png', fullPage: true });
    }
  });

  test('login button should be present and clickable', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('text=GitViz', { timeout: 10000 });
    
    // 查找登录按钮
    const loginButton = page.locator('text=登录');
    
    // 检查登录按钮是否存在
    await expect(loginButton).toBeVisible();
    
    // 检查登录按钮是否可点击
    await expect(loginButton).toBeEnabled();
    
    // 点击登录按钮并检查是否有反应
    await loginButton.click();
    
    // 等待可能的导航或模态框出现
    await page.waitForTimeout(2000);
    
    // 检查是否导航到了登录页面或出现了登录模态框
    const currentUrl = page.url();
    console.log('点击登录后的URL:', currentUrl);
    
    // 检查是否有登录表单出现
    const loginForm = page.locator('form').filter({ hasText: '登录' }).first();
    const loginModal = page.locator('[role="dialog"]').filter({ hasText: '登录' }).first();
    
    if (await loginForm.count() > 0) {
      console.log('发现登录表单');
      await expect(loginForm).toBeVisible();
    } else if (await loginModal.count() > 0) {
      console.log('发现登录模态框');
      await expect(loginModal).toBeVisible();
    } else {
      console.log('未发现登录表单或模态框');
      // 截图以便调试
      await page.screenshot({ path: 'login-click-result.png', fullPage: true });
    }
  });

  test('debug page structure', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('text=GitViz', { timeout: 10000 });
    
    // 获取页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 获取页面URL
    const url = page.url();
    console.log('页面URL:', url);
    
    // 查找所有按钮
    const buttons = await page.locator('button').allTextContents();
    console.log('所有按钮文本:', buttons);
    
    // 查找所有链接
    const links = await page.locator('a').allTextContents();
    console.log('所有链接文本:', links);
    
    // 查找包含"注册"或"登录"文本的元素
    const registerElements = await page.locator('text=注册').count();
    const loginElements = await page.locator('text=登录').count();
    
    console.log('包含"注册"的元素数量:', registerElements);
    console.log('包含"登录"的元素数量:', loginElements);
    
    // 截图以便调试
    await page.screenshot({ path: 'page-structure.png', fullPage: true });
    
    // 获取页面HTML结构
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('页面HTML片段:', bodyHTML.substring(0, 500));
  });
});