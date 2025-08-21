import { test, expect } from '@playwright/test';

test('debug login page console errors', async ({ page }) => {
  // Capture console logs and errors
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];
  
  page.on('console', msg => {
    consoleLogs.push(msg.text());
    console.log('CONSOLE:', msg.type(), msg.text());
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
    console.log('PAGE ERROR:', error.message);
  });

  // Navigate to login page
  await page.goto('http://localhost:3000/login');
  
  // Wait for page to load
  await page.waitForSelector('text=GitViz');
  
  // Take a screenshot
  await page.screenshot({ path: 'login-page-debug.png' });
  
  // Try to fill and click login button
  console.log('Attempting to fill login form...');
  await page.fill('input[placeholder="用户名"]', 'admin');
  await page.fill('input[placeholder="密码"]', 'admin123');
  
  // Check if button exists and is clickable
  const loginButton = await page.locator('button:has-text("登录")');
  const isVisible = await loginButton.isVisible();
  const isEnabled = await loginButton.isEnabled();
  
  console.log('Login button visible:', isVisible);
  console.log('Login button enabled:', isEnabled);
  
  // Take screenshot before clicking
  await page.screenshot({ path: 'before-click-debug.png' });
  
  // Try to click the button
  console.log('Attempting to click login button...');
  try {
    await loginButton.click();
    console.log('Button clicked successfully');
  } catch (error) {
    console.log('Error clicking button:', error);
  }
  
  // Wait a bit to see what happens
  await page.waitForTimeout(3000);
  
  // Take screenshot after clicking
  await page.screenshot({ path: 'after-click-debug.png' });
  
  // Print all console logs and errors
  console.log('\n=== CONSOLE LOGS ===');
  consoleLogs.forEach(log => console.log(log));
  
  console.log('\n=== CONSOLE ERRORS ===');
  consoleErrors.forEach(error => console.log(error));
  
  // Check if we navigated away
  const currentUrl = page.url();
  console.log('\nCurrent URL:', currentUrl);
  
  // Expect no console errors
  expect(consoleErrors.length).toBe(0);
});