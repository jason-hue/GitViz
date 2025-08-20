import { test, expect } from '@playwright/test';

test.describe('Fixed Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show correct form when switching tabs', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 检查登录tab是活动状态
    const loginTab = page.locator('[aria-selected="true"]').filter({ hasText: '登录' });
    await expect(loginTab).toBeVisible();
    
    // 检查登录按钮可见
    const loginButton = page.locator('button:has-text("登录")');
    await expect(loginButton).toBeVisible();
    
    // 检查注册按钮不可见（因为只有一个表单可见）
    const registerButton = page.locator('button:has-text("注册")');
    await expect(registerButton).not.toBeVisible();
    
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
    
    // 检查注册按钮重新不可见
    await expect(registerButton).not.toBeVisible();
    
    // 检查邮箱输入框重新不可见
    await expect(emailInput).not.toBeVisible();
  });

  test('should validate login form', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 确保在登录tab
    const loginTab = page.locator('text=登录').first();
    await loginTab.click();
    await page.waitForTimeout(500);
    
    // 尝试提交空表单
    const loginButton = page.locator('button:has-text("登录")');
    await loginButton.click();
    
    // 等待验证错误
    await page.waitForTimeout(1000);
    
    // 检查验证错误消息
    const usernameError = page.locator('text=请输入用户名！');
    const passwordError = page.locator('text=请输入密码！');
    
    // 至少应该有一个错误消息
    const hasErrors = await usernameError.count() > 0 || await passwordError.count() > 0;
    expect(hasErrors).toBe(true);
  });

  test('should validate registration form', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 切换到注册tab
    const registerTab = page.locator('text=注册').first();
    await registerTab.click();
    await page.waitForTimeout(500);
    
    // 尝试提交空表单
    const registerButton = page.locator('button:has-text("注册")');
    await registerButton.click();
    
    // 等待验证错误
    await page.waitForTimeout(1000);
    
    // 检查验证错误消息
    const usernameError = page.locator('text=请输入用户名！');
    const emailError = page.locator('text=请输入邮箱！');
    const passwordError = page.locator('text=请输入密码！');
    
    // 至少应该有一个错误消息
    const hasErrors = await usernameError.count() > 0 || 
                     await emailError.count() > 0 || 
                     await passwordError.count() > 0;
    expect(hasErrors).toBe(true);
  });

  test('GitHub login should be always visible', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // 检查GitHub登录按钮
    const githubButton = page.locator('button:has-text("使用GitHub登录")');
    await expect(githubButton).toBeVisible();
    await expect(githubButton).toBeEnabled();
    
    // 切换到注册tab
    const registerTab = page.locator('text=注册').first();
    await registerTab.click();
    await page.waitForTimeout(500);
    
    // GitHub登录按钮应该仍然可见
    await expect(githubButton).toBeVisible();
    await expect(githubButton).toBeEnabled();
  });
});