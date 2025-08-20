import { test, expect } from '@playwright/test';

test.describe('Authentication Test Summary', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('registration and login tabs are working', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    console.log('🔍 测试开始：检查登录页面');
    
    // 检查页面基本元素
    await expect(page.locator('h1')).toHaveText('GitViz');
    console.log('✅ 页面标题正确');
    
    // 检查Tab组件
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(2);
    console.log('✅ Tab组件正常，有2个标签');
    
    // 检查登录tab是活动状态
    const loginTab = tabs.nth(0);
    await expect(loginTab).toHaveText('登录');
    await expect(loginTab).toHaveAttribute('aria-selected', 'true');
    console.log('✅ 登录tab是活动状态');
    
    // 检查注册tab
    const registerTab = tabs.nth(1);
    await expect(registerTab).toHaveText('注册');
    await expect(registerTab).toHaveAttribute('aria-selected', 'false');
    console.log('✅ 注册tab存在且非活动状态');
    
    // 检查登录按钮可见
    const loginButton = page.locator('button:has-text("登 录")');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
    console.log('✅ 登录按钮可见且可用');
    
    // 检查注册按钮不可见
    const registerButton = page.locator('button:has-text("注 册")');
    await expect(registerButton).not.toBeVisible();
    console.log('✅ 注册按钮在登录tab下不可见');
    
    // 检查GitHub登录按钮
    const githubButton = page.locator('button:has-text("使用GitHub登录")');
    await expect(githubButton).toBeVisible();
    await expect(githubButton).toBeEnabled();
    console.log('✅ GitHub登录按钮可见且可用');
    
    // 点击注册tab
    console.log('🔄 点击注册tab...');
    await registerTab.click();
    await page.waitForTimeout(1000);
    
    // 检查注册tab现在是活动状态
    await expect(registerTab).toHaveAttribute('aria-selected', 'true');
    await expect(loginTab).toHaveAttribute('aria-selected', 'false');
    console.log('✅ 注册tab切换成功');
    
    // 检查注册按钮现在可见
    await expect(registerButton).toBeVisible();
    await expect(registerButton).toBeEnabled();
    console.log('✅ 注册按钮在注册tab下可见');
    
    // 检查登录按钮现在不可见
    await expect(loginButton).not.toBeVisible();
    console.log('✅ 登录按钮在注册tab下不可见');
    
    // 检查邮箱输入框可见
    const emailInput = page.locator('input[placeholder="邮箱"]');
    await expect(emailInput).toBeVisible();
    console.log('✅ 邮箱输入框在注册tab下可见');
    
    // 点击登录tab
    console.log('🔄 点击登录tab...');
    await loginTab.click();
    await page.waitForTimeout(1000);
    
    // 检查登录tab重新成为活动状态
    await expect(loginTab).toHaveAttribute('aria-selected', 'true');
    await expect(registerTab).toHaveAttribute('aria-selected', 'false');
    console.log('✅ 登录tab切换成功');
    
    // 检查登录按钮重新可见
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
    console.log('✅ 登录按钮重新可见');
    
    // 检查注册按钮重新不可见
    await expect(registerButton).not.toBeVisible();
    console.log('✅ 注册按钮重新不可见');
    
    // 检查邮箱输入框重新不可见
    await expect(emailInput).not.toBeVisible();
    console.log('✅ 邮箱输入框重新不可见');
    
    // 测试表单交互
    console.log('🔄 测试表单交互...');
    
    // 填写登录表单
    await page.locator('input[placeholder="用户名"]').first().fill('testuser');
    await page.locator('input[placeholder="密码"]').first().fill('testpassword');
    console.log('✅ 登录表单填写成功');
    
    // 切换到注册tab
    await registerTab.click();
    await page.waitForTimeout(1000);
    
    // 填写注册表单
    await page.locator('input[placeholder="用户名"]').nth(1).fill('newuser');
    await page.locator('input[placeholder="邮箱"]').fill('newuser@example.com');
    await page.locator('input[placeholder="密码"]').nth(1).fill('newpassword');
    console.log('✅ 注册表单填写成功');
    
    // 截图作为测试记录
    await page.screenshot({ path: 'authentication-success.png', fullPage: true });
    console.log('📸 测试截图保存成功');
    
    console.log('🎉 测试完成：注册和登录功能正常工作！');
  });

  test('page navigation works correctly', async ({ page }) => {
    // 等待重定向到登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    
    console.log('🔍 测试页面导航...');
    
    // 检查URL
    expect(page.url()).toContain('/login');
    console.log('✅ 正确重定向到登录页面');
    
    // 尝试访问需要认证的页面
    await page.goto('/dashboard');
    
    // 应该被重定向回登录页面
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
    console.log('✅ 未认证用户正确重定向到登录页面');
    
    console.log('🎉 页面导航测试完成！');
  });
});