import { test, expect } from '@playwright/test';

test('click visible login button directly', async ({ page }) => {
  // Capture console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
    console.log('CONSOLE:', msg.type(), msg.text());
  });

  // Navigate to login page
  await page.goto('http://localhost:3000/login');
  
  // Wait for page to load
  await page.waitForSelector('text=GitViz');
  
  // Fill the form
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  
  // Take screenshot before clicking
  await page.screenshot({ path: 'before-direct-click.png' });
  
  // Find the visible login button and click it
  const loginButton = page.locator('button.ant-btn-primary', { hasText: '登录' }).first();
  
  console.log('Login button visible:', await loginButton.isVisible());
  console.log('Login button enabled:', await loginButton.isEnabled());
  
  // Click the button
  await loginButton.click();
  
  // Wait for any potential navigation or state change
  await page.waitForTimeout(3000);
  
  // Take screenshot after clicking
  await page.screenshot({ path: 'after-direct-click.png' });
  
  // Check current URL
  console.log('Current URL after click:', page.url());
  
  // Check if any console logs were generated
  console.log('Console logs after click:');
  consoleLogs.forEach(log => console.log(log));
  
  // Check if we're still on login page
  expect(page.url()).toContain('login');
});