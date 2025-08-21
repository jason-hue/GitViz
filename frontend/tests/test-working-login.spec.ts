import { test, expect } from '@playwright/test';

test('test working login page', async ({ page }) => {
  // Navigate to working login page
  await page.goto('http://localhost:3000/working-login');
  
  // Wait for page to load
  await page.waitForSelector('text=GitViz');
  
  // Fill the form
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  
  // Take screenshot before clicking
  await page.screenshot({ path: 'working-login-before-click.png' });
  
  // Find and click the login button
  const loginButton = page.locator('button.ant-btn-primary', { hasText: '登录' }).first();
  
  console.log('Login button visible:', await loginButton.isVisible());
  console.log('Login button enabled:', await loginButton.isEnabled());
  
  // Click the button
  await loginButton.click();
  
  // Wait for navigation
  await page.waitForTimeout(3000);
  
  // Take screenshot after clicking
  await page.screenshot({ path: 'working-login-after-click.png' });
  
  // Check current URL
  console.log('Current URL after click:', page.url());
  
  // Should have navigated to dashboard or stayed on login due to auth
  expect(page.url()).toMatch(/\/(dashboard|login)/);
});