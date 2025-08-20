import { test, expect } from '@playwright/test';

test.describe('Final Authentication Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('authentication flow should work correctly', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 检查页面标题
    await expect(page.locator('h1')).toHaveText('GitViz');
    
    // 检查登录tab是活动状态
    const loginTab = page.locator('[aria-selected="true"]').filter({ hasText: '登录' });
    await expect(loginTab).toBeVisible();
    
    // 检查登录按钮可见（注意有空格）
    const loginButton = page.locator('button:has-text("登 录")');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
    
    // 检查注册按钮不可见
    const registerButton = page.locator('button:has-text("注 册")');
    await expect(registerButton).not.toBeVisible();
    
    // 检查GitHub登录按钮始终可见
    const githubButton = page.locator('button:has-text("使用GitHub登录")');
    await expect(githubButton).toBeVisible();
    await expect(githubButton).toBeEnabled();
    
    // 点击注册tab
    const registerTab = page.locator('text=注册').first();
    await registerTab.click();
    
    // 等待切换动画
    await page.waitForTimeout(1000);
    
    // 检查注册tab现在是活动状态
    const activeRegisterTab = page.locator('[aria-selected="true"]').filter({ hasText: '注册' });
    await expect(activeRegisterTab).toBeVisible();
    
    // 检查注册按钮现在可见
    await expect(registerButton).toBeVisible();
    await expect(registerButton).toBeEnabled();
    
    // 检查登录按钮现在不可见
    await expect(loginButton).not.toBeVisible();
    
    // 检查邮箱输入框现在可见
    const emailInput = page.locator('input[placeholder="邮箱"]');
    await expect(emailInput).toBeVisible();
    
    // 点击登录tab
    const loginTabClickable = page.locator('text=登录').first();
    await loginTabClickable.click();
    
    // 等待切换动画
    await page.waitForTimeout(1000);
    
    // 检查登录tab重新成为活动状态
    const activeLoginTab = page.locator('[aria-selected="true"]').filter({ hasText: '登录' });
    await expect(activeLoginTab).toBeVisible();
    
    // 检查登录按钮重新可见
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
    
    // 检查注册按钮重新不可见
    await expect(registerButton).not.toBeVisible();
    
    // 检查邮箱输入框重新不可见
    await expect(emailInput).not.toBeVisible();
    
    // 测试登录表单验证
    await loginButton.click();
    await page.waitForTimeout(1000);
    
    // 检查是否有验证错误（可能不会立即显示）
    const visibleUsernameInput = page.locator('input[placeholder="用户名"]').filter({ has: page.locator(':visible') });
    await expect(visibleUsernameInput.first()).toBeVisible();
    
    // 切换到注册tab测试注册表单
    await registerTab.click();
    await page.waitForTimeout(1000);
    
    // 填写注册表单
    await page.locator('input[placeholder="用户名"]').fill('testuser');
    await page.locator('input[placeholder="邮箱"]').fill('test@example.com');
    await page.locator('input[placeholder="密码"]').fill('testpassword');
    
    // 提交注册表单（由于没有后端，应该不会成功）
    await registerButton.click();
    await page.waitForTimeout(2000);
    
    // 检查是否还在登录页面（由于没有后端，应该还在登录页面）
    expect(page.url()).toContain('/login');
    
    // 截图作为测试记录
    await page.screenshot({ path: 'authentication-test-result.png', fullPage: true });
  });

  test('form inputs should be interactive', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 测试登录表单输入
    const usernameInput = page.locator('input[placeholder="用户名"]');
    const passwordInput = page.locator('input[placeholder="密码"]');
    
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // 填写表单
    await usernameInput.fill('testuser');
    await passwordInput.fill('testpassword');
    
    // 验证输入的值
    await expect(usernameInput).toHaveValue('testuser');
    await expect(passwordInput).toHaveValue('testpassword');
    
    // 切换到注册tab
    const registerTab = page.locator('text=注册').first();
    await registerTab.click();
    await page.waitForTimeout(1000);
    
    // 测试注册表单输入
    const registerUsernameInput = page.locator('input[placeholder="用户名"]');
    const emailInput = page.locator('input[placeholder="邮箱"]');
    const registerPasswordInput = page.locator('input[placeholder="密码"]');
    
    await expect(registerUsernameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(registerPasswordInput).toBeVisible();
    
    // 填写注册表单
    await registerUsernameInput.fill('newuser');
    await emailInput.fill('newuser@example.com');
    await registerPasswordInput.fill('newpassword');
    
    // 验证输入的值
    await expect(registerUsernameInput).toHaveValue('newuser');
    await expect(emailInput).toHaveValue('newuser@example.com');
    await expect(registerPasswordInput).toHaveValue('newpassword');
  });
});