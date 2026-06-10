import { test, expect } from '@playwright/test';

test.describe('Step 9, 11-15: Advanced Features', () => {
  test.beforeEach(async ({ page }) => {
    // Skip onboarding and disable Privacy Shield
    await page.addInitScript(() => {
      window.sessionStorage.setItem('spendwise_session_unlocked', 'true');
      window.localStorage.setItem(
        'spendwise_config_v1',
        JSON.stringify({
          initialBalance: 5000,
          currency: '₹',
          name: 'Test User',
          userRole: 'professional',
          occupation: 'Student',
          location: 'London',
          monthlyGoal: 7000,
          onboardingComplete: true,
          createdAt: new Date().toISOString(),
        })
      );
    });

    // Mock Gemini API and Supabase Edge Function responses
    await page.route(
      /(?:functions\/v1\/gemini-proxy|generativelanguage\.googleapis\.com)/,
      async route => {
        const request = route.request();
        const postData = request.postDataJSON();
        const prompt = postData?.contents?.[0]?.parts?.[0]?.text || '';

        let mockResponse: Record<string, unknown>;
        if (
          prompt.toLowerCase().includes('json array') ||
          prompt.toLowerCase().includes('analyze this transaction')
        ) {
          mockResponse = {
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify([
                        {
                          merchant: 'transport',
                          category: 'Transport',
                          amount: 500,
                          type: 'debit',
                          confidence: 0.95,
                        },
                      ]),
                    },
                  ],
                },
              },
            ],
          };
        } else {
          mockResponse = {
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: 'Your budget looks healthy! Keep tracking your expenses under Transport and Food.',
                    },
                  ],
                },
              },
            ],
          };
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponse),
        });
      }
    );

    await page.goto('/');
  });

  test('9.1 to 9.4 - AI Advisor', async ({ page }) => {
    await page.goto('/advisor');

    // Check for chat input and initial message
    const chatInput = page.getByPlaceholder(/Ask me about|Type your message|Ask anything/i);
    await expect(chatInput).toBeVisible();

    // Send a message
    await chatInput.fill('How am I spending this month?');
    await page.keyboard.press('Enter');

    // Ensure a response comes back (either API or local fallback)
    // We check that a new message balloon appears
    await expect(
      page
        .locator('.message-bubble')
        .or(page.locator('.flex .max-w-\\[85\\%\\]'))
        .or(page.locator('.flex .max-w-\\[90\\%\\]'))
        .nth(1)
    ).toBeVisible({ timeout: 10000 });
  });

  test('11.1 to 11.3 - Recurring Transactions', async ({ page }) => {
    await page.goto('/subscriptions');

    // Click Add Manual button
    const addManualBtn = page.getByRole('button', { name: /Add Manual/i });
    await expect(addManualBtn).toBeVisible();
    await addManualBtn.click();

    // Fill the Add Subscription modal
    await page.getByPlaceholder(/e.g. Netflix, Gym/i).fill('Netflix');
    await page.getByPlaceholder(/0.00/i).fill('649');
    await page.getByRole('button', { name: /Add Subscription/i, exact: true }).click();

    // Ensure it renders on the subscriptions screen
    await expect(page.getByText('Netflix').first()).toBeVisible();
    await expect(page.getByText(/649/i).first()).toBeVisible();
  });

  test('12.1 - Subscriptions', async ({ page }) => {
    await page.goto('/subscriptions');
    await expect(page.getByText(/Subscription Intelligence/i)).toBeVisible();
  });

  test('13.1 to 13.4 - Portfolio & Net Worth', async ({ page }) => {
    await page.goto('/portfolio');
    await expect(
      page
        .getByText(/Net Worth/i)
        .filter({ visible: true })
        .first()
    ).toBeVisible();

    // Add asset
    const addAssetBtn = page.getByRole('button', { name: /\+ Asset/i });
    if (await addAssetBtn.isVisible()) {
      await addAssetBtn.click();
      await page.getByPlaceholder(/Name/i).fill('Savings Account');
      await page.getByPlaceholder(/Value/i).fill('50000');
      await page.getByRole('button', { name: /Save/i }).click();

      // Asset should be visible
      await expect(page.getByText('Savings Account')).toBeVisible();
    }
  });

  test('14.1 to 14.3 - Shared Wallets', async ({ page }) => {
    await page.goto('/shared');

    const createGroupBtn = page.getByRole('button', { name: /\+ Create Group/i });
    if (await createGroupBtn.isVisible()) {
      await createGroupBtn.click();
      await page.getByPlaceholder(/Name/i).fill('Roommates');
      await page.getByRole('button', { name: /Create/i }).click();

      await expect(page.getByText('Roommates')).toBeVisible();
    }
  });

  test('15.1 - Bank Sync & UPI', async ({ page }) => {
    await page.goto('/sync');
    await expect(page.getByText(/Bank Sync/i).first()).toBeVisible();

    // Click Add Source button to go to select source page
    await page.getByRole('button', { name: /\+ Add Source/i }).click();

    // Click Link UPI App to go to provider selection screen
    await page.getByRole('button', { name: /Link UPI App/i }).click();

    // Test for provider buttons
    await expect(page.getByRole('button', { name: /PhonePe/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Google Pay/i }).first()).toBeVisible();
  });
});
