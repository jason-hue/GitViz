import { test, expect } from '@playwright/test';

test.describe('Login Functionality Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for redirect to login page
    await page.waitForURL('**/login', { timeout: 10000 });
  });

  test('login should work with correct credentials', async ({ page }) => {
    console.log('Starting login test...');
    
    // Wait for page to load
    await page.waitForSelector('text=GitViz', { timeout: 10000 });
    
    // Fill login form
    await page.locator('input[placeholder="用户名"]').fill('knifefire');
    await page.locator('input[placeholder="密码"]').fill('mypassword123');
    
    // Take screenshot before login
    await page.screenshot({ path: 'before-login.png', fullPage: true });
    
    // Click login button
    const loginButton = page.locator('button:has-text("登 录")');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
    
    console.log('Clicking login button...');
    await loginButton.click();
    
    // Wait for login process
    await page.waitForTimeout(3000);
    
    // Check if redirected to dashboard
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    // Take screenshot after login attempt
    await page.screenshot({ path: 'after-login.png', fullPage: true });
    
    // Check if login was successful (either redirected or showing success message)
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Login successful - redirected to dashboard');
      expect(currentUrl).toContain('/dashboard');
    } else {
      // Check for any error messages
      const errorMessage = page.locator('.ant-message-error');
      const successMessage = page.locator('.ant-message-success');
      
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.textContent();
        console.log('❌ Login failed with error:', errorText);
      } else if (await successMessage.count() > 0) {
        const successText = await successMessage.textContent();
        console.log('✅ Login successful:', successText);
      } else {
        console.log('⚠️  No error or success message found');
      }
    }
    
    // Check localStorage for token
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('Token in localStorage:', token ? 'Found' : 'Not found');
    
    // Check console for any errors
    page.on('console', msg => {
      console.log('Console log:', msg.type(), msg.text());
    });
    
    page.on('pageerror', error => {
      console.log('Page error:', error.message);
    });
  });

  test('debug login form submission', async ({ page }) => {
    console.log('Debug login form submission...');
    
    // Wait for page to load
    await page.waitForSelector('text=GitViz', { timeout: 10000 });
    
    // Fill login form
    await page.locator('input[placeholder="用户名"]').fill('knifefire');
    await page.locator('input[placeholder="密码"]').fill('mypassword123');
    
    // Monitor network requests
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/auth/login')) {
        apiRequests.push(request);
        console.log('API Request:', request.url(), request.method());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/auth/login')) {
        console.log('API Response:', response.url(), response.status());
        response.json().then(data => {
          console.log('Response data:', data);
        }).catch(e => {
          console.log('Response parsing error:', e);
        });
      }
    });
    
    // Click login button
    const loginButton = page.locator('button:has-text("登 录")');
    await loginButton.click();
    
    // Wait for network requests
    await page.waitForTimeout(5000);
    
    console.log('Total API requests made:', apiRequests.length);
    
    // Take screenshot
    await page.screenshot({ path: 'login-debug.png', fullPage: true });
  });
});