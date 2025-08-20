import { test, expect } from '@playwright/test';

test.describe('Registration Button Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for redirect to login page
    await page.waitForURL('**/login', { timeout: 10000 });
  });

  test('registration tab should be clickable and show registration form', async ({ page }) => {
    // Check initial state - login tab should be active
    const loginTab = page.locator('[aria-selected="true"]').filter({ hasText: '登录' });
    await expect(loginTab).toBeVisible();
    
    // Check registration tab exists
    const registerTab = page.locator('text=注册').first();
    await expect(registerTab).toBeVisible();
    await expect(registerTab).toBeEnabled();
    
    // Click registration tab
    await registerTab.click();
    
    // Wait for tab switch animation
    await page.waitForTimeout(1000);
    
    // Check registration tab is now active
    const activeRegisterTab = page.locator('[aria-selected="true"]').filter({ hasText: '注册' });
    await expect(activeRegisterTab).toBeVisible();
    
    // Check registration form elements are visible
    const emailInput = page.locator('input[placeholder="邮箱"]');
    await expect(emailInput).toBeVisible();
    
    // Check register button is visible and has correct text
    const registerButton = page.locator('button:has-text("注 册")');
    await expect(registerButton).toBeVisible();
    await expect(registerButton).toBeEnabled();
    
    // Fill registration form
    await page.locator('input[placeholder="用户名"]').fill('testuser');
    await emailInput.fill('test@example.com');
    await page.locator('input[placeholder="密码"]').fill('testpassword123');
    
    // Verify form values are set correctly
    await expect(page.locator('input[placeholder="用户名"]')).toHaveValue('testuser');
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(page.locator('input[placeholder="密码"]')).toHaveValue('testpassword123');
    
    // Take screenshot for documentation
    await page.screenshot({ path: 'registration-form-filled.png', fullPage: true });
    
    // Click register button (this should trigger API call)
    await registerButton.click();
    
    // Wait for potential response or error
    await page.waitForTimeout(3000);
    
    // Check if we're still on login page (since no backend is running)
    expect(page.url()).toContain('/login');
    
    // Check if any error messages appeared
    const errorMessage = page.locator('.ant-message-error');
    if (await errorMessage.count() > 0) {
      console.log('Error message found:', await errorMessage.textContent());
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'registration-attempt-result.png', fullPage: true });
  });

  test('registration form validation should work', async ({ page }) => {
    // Click registration tab
    const registerTab = page.locator('text=注册').first();
    await registerTab.click();
    await page.waitForTimeout(1000);
    
    // Try to submit empty form
    const registerButton = page.locator('button:has-text("注 册")');
    await registerButton.click();
    await page.waitForTimeout(1000);
    
    // Check if validation errors appear (they should appear immediately)
    const usernameInput = page.locator('input[placeholder="用户名"]');
    const emailInput = page.locator('input[placeholder="邮箱"]');
    const passwordInput = page.locator('input[placeholder="密码"]');
    
    // Check if inputs have validation error classes
    const usernameHasError = await usernameInput.evaluate(el => el.classList.contains('ant-form-item-has-error'));
    const emailHasError = await emailInput.evaluate(el => el.classList.contains('ant-form-item-has-error'));
    const passwordHasError = await passwordInput.evaluate(el => el.classList.contains('ant-form-item-has-error'));
    
    console.log('Username validation error:', usernameHasError);
    console.log('Email validation error:', emailHasError);
    console.log('Password validation error:', passwordHasError);
    
    // Take screenshot for validation state
    await page.screenshot({ path: 'registration-validation.png', fullPage: true });
  });

  test('debug registration button visibility', async ({ page }) => {
    // Get page structure info
    console.log('Current URL:', page.url());
    
    // Find all buttons
    const buttons = await page.locator('button').all();
    console.log('Total buttons found:', buttons.length);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      console.log(`Button ${i}: "${text}" - Visible: ${isVisible}, Enabled: ${isEnabled}`);
    }
    
    // Find all elements with "注册" text
    const registerElements = await page.locator('text=注册').all();
    console.log('Elements with "注册" text:', registerElements.length);
    
    for (let i = 0; i < registerElements.length; i++) {
      const element = registerElements[i];
      const tagName = await element.evaluate(el => el.tagName);
      const isVisible = await element.isVisible();
      console.log(`Register element ${i}: <${tagName}> - Visible: ${isVisible}`);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'registration-debug.png', fullPage: true });
  });
});