import { test, expect } from '@playwright/test';

test('analyze login page structure', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/login');
  
  // Wait for page to load
  await page.waitForSelector('text=GitViz');
  
  // Get page HTML structure
  const pageHTML = await page.content();
  console.log('Page HTML length:', pageHTML.length);
  
  // Find all buttons
  const buttons = await page.locator('button').all();
  console.log('Found', buttons.length, 'buttons:');
  
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const text = await button.textContent();
    const isVisible = await button.isVisible();
    const isEnabled = await button.isEnabled();
    const classes = await button.getAttribute('class');
    
    console.log(`Button ${i + 1}:`);
    console.log(`  Text: "${text}"`);
    console.log(`  Visible: ${isVisible}`);
    console.log(`  Enabled: ${isEnabled}`);
    console.log(`  Classes: ${classes}`);
    console.log('---');
  }
  
  // Find all input fields
  const inputs = await page.locator('input').all();
  console.log('Found', inputs.length, 'input fields:');
  
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const placeholder = await input.getAttribute('placeholder');
    const type = await input.getAttribute('type');
    const isVisible = await input.isVisible();
    
    console.log(`Input ${i + 1}:`);
    console.log(`  Placeholder: "${placeholder}"`);
    console.log(`  Type: ${type}`);
    console.log(`  Visible: ${isVisible}`);
    console.log('---');
  }
  
  // Take screenshot
  await page.screenshot({ path: 'login-page-structure.png' });
  
  // Try to specifically target the login button in the login tab
  console.log('Trying to find login button in login tab...');
  
  // Check if tabs are working
  const loginTab = await page.locator('button:has-text("登录")').first();
  const registerTab = await page.locator('button:has-text("注册")').first();
  
  console.log('Login tab visible:', await loginTab.isVisible());
  console.log('Register tab visible:', await registerTab.isVisible());
  
  // Click on login tab to make sure it's active
  await loginTab.click();
  await page.waitForTimeout(1000);
  
  // Now try to find the login button within the login tab content
  const loginButtonInTab = await page.locator('.ant-tabs-tabpane-active button:has-text("登录")');
  console.log('Login button in active tab visible:', await loginButtonInTab.isVisible());
  
  if (await loginButtonInTab.isVisible()) {
    console.log('Found login button in active tab');
    await loginButtonInTab.click();
    await page.waitForTimeout(3000);
    console.log('Current URL after clicking login button:', page.url());
  } else {
    console.log('Login button not found in active tab');
  }
});