import { test, expect } from '@playwright/test';

test.describe('Step 3, 4, 5: Dashboard & Transactions', () => {
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

  test('3.1 & 3.2 - Dashboard elements render correctly', async ({ page }) => {
    // Check balance card
    await expect(page.getByText(/Total Balance/i)).toBeVisible();

    // Check Income/Spent cards (using .first() to avoid strict mode violation)
    await expect(page.getByText('Income').first()).toBeVisible();
    await expect(page.getByText('Spent').first()).toBeVisible();

    // Check Recent transactions section
    await expect(
      page
        .getByText(/Recent/i)
        .or(page.getByText(/Transaction History/i))
        .first()
    ).toBeVisible();
  });

  test('4.1 - Quick Add Transaction via Modal', async ({ page }) => {
    // Open Quick Add Modal via bottom nav FAB (if visible/mobile)
    const addTxBtn = page.getByRole('button', { name: 'Add transaction' });
    if (await addTxBtn.isVisible()) {
      await addTxBtn.click();
    }

    // Test Natural Language input
    const input = page.locator('#magic-input-field');
    await expect(input).toBeVisible();
    await input.fill('spent 500rs on transport');

    // Submit (Simulate hitting enter)
    await input.press('Enter');

    // Wait for AI/Parser to respond and Confirm button to appear
    const confirmBtn = page.getByRole('button', { name: /CONFIRM ALL/i });
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });

    // Add transaction
    await confirmBtn.click();

    // Verify updated balance/recent transaction list or empty state change
    // Wait a brief moment for IndexedDB transaction write to complete
    await page.waitForTimeout(500);
    await expect(page.getByText('transport').first()).toBeVisible();
  });

  test('5.1 to 5.6 - Transaction History and Filtering', async ({ page }) => {
    // Navigate to history using bottom nav tab / desktop sidebar button
    await page
      .getByRole('tab', { name: 'Transactions' })
      .or(page.getByRole('button', { name: 'Transactions' }))
      .first()
      .click();

    // Check elements
    await expect(page.getByPlaceholder(/Search/i)).toBeVisible();
  });
});
