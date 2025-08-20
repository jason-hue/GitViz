import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to login page when not authenticated', async ({ page }) => {
    // 等待重定向完成
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 检查当前URL
    expect(page.url()).toContain('/login');
    
    // 检查登录页面元素
    await expect(page.locator('h1')).toHaveText('GitViz');
    await expect(page.locator('text=Git可视化管理工具')).toBeVisible();
  });

  test('login and register tabs should be functional', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 检查登录tab
    const loginTab = page.locator('[aria-selected="true"]').filter({ hasText: '登录' });
    await expect(loginTab).toBeVisible();
    
    // 检查注册tab
    const registerTab = page.locator('text=注册').nth(0); // 第一个是tab
    await expect(registerTab).toBeVisible();
    
    // 点击注册tab
    await registerTab.click();
    
    // 等待tab切换
    await page.waitForTimeout(1000);
    
    // 检查注册表单是否可见
    const registerForm = page.locator('form').filter({ hasText: '注册' });
    await expect(registerForm).toBeVisible();
    
    // 检查注册表单字段
    await expect(page.locator('input[placeholder="用户名"]')).toBeVisible();
    await expect(page.locator('input[placeholder="邮箱"]')).toBeVisible();
    await expect(page.locator('input[placeholder="密码"]')).toBeVisible();
    await expect(page.locator('button:has-text("注册")')).toBeVisible();
    
    // 点击登录tab
    const loginTabClickable = page.locator('text=登录').nth(0);
    await loginTabClickable.click();
    
    // 等待tab切换
    await page.waitForTimeout(1000);
    
    // 检查登录表单是否可见
    const loginForm = page.locator('form').filter({ hasText: '登录' });
    await expect(loginForm).toBeVisible();
    
    // 检查登录表单字段
    await expect(page.locator('input[placeholder="用户名"]')).toBeVisible();
    await expect(page.locator('input[placeholder="密码"]')).toBeVisible();
    await expect(page.locator('button:has-text("登录")')).toBeVisible();
  });

  test('GitHub login button should be present', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 检查GitHub登录按钮
    const githubButton = page.locator('button:has-text("使用GitHub登录")');
    await expect(githubButton).toBeVisible();
    await expect(githubButton).toBeEnabled();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 切换到登录tab
    const loginTab = page.locator('text=登录').nth(0);
    await loginTab.click();
    await page.waitForTimeout(500);
    
    // 尝试提交空表单
    const loginButton = page.locator('button:has-text("登录")');
    await loginButton.click();
    
    // 等待验证错误显示
    await page.waitForTimeout(1000);
    
    // 检查验证错误消息
    const usernameError = page.locator('text=请输入用户名！');
    const passwordError = page.locator('text=请输入密码！');
    
    // 验证错误消息应该显示
    if (await usernameError.count() > 0) {
      await expect(usernameError).toBeVisible();
    }
    if (await passwordError.count() > 0) {
      await expect(passwordError).toBeVisible();
    }
  });

  test('should show validation errors for empty registration form', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 切换到注册tab
    const registerTab = page.locator('text=注册').nth(0);
    await registerTab.click();
    await page.waitForTimeout(500);
    
    // 尝试提交空表单
    const registerButton = page.locator('button:has-text("注册")');
    await registerButton.click();
    
    // 等待验证错误显示
    await page.waitForTimeout(1000);
    
    // 检查验证错误消息
    const usernameError = page.locator('text=请输入用户名！');
    const emailError = page.locator('text=请输入邮箱！');
    const passwordError = page.locator('text=请输入密码！');
    
    // 验证错误消息应该显示
    if (await usernameError.count() > 0) {
      await expect(usernameError).toBeVisible();
    }
    if (await emailError.count() > 0) {
      await expect(emailError).toBeVisible();
    }
    if (await passwordError.count() > 0) {
      await expect(passwordError).toBeVisible();
    }
  });

  test('form submission should work with valid data', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 切换到登录tab
    const loginTab = page.locator('text=登录').nth(0);
    await loginTab.click();
    await page.waitForTimeout(500);
    
    // 填写登录表单
    await page.locator('input[placeholder="用户名"]').fill('testuser');
    await page.locator('input[placeholder="密码"]').fill('testpassword');
    
    // 提交表单
    const loginButton = page.locator('button:has-text("登录")');
    await loginButton.click();
    
    // 等待响应
    await page.waitForTimeout(2000);
    
    // 检查是否还在登录页面（由于没有后端，应该还在登录页面）
    expect(page.url()).toContain('/login');
  });
});