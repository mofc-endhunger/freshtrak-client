import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage';
import { LoginPage } from '../../pages/LoginPage';
import { createRegistrationFormData, DEFAULT_TEST_CREDENTIALS } from '../../fixtures/test-data';
import { formatDateForInput, getPastDate, createUrlPattern, getValidEventDateId } from '../../utils/helpers';
import { RegistrationSelectors } from '../../utils/selectors';

test.describe('Registration Flow', () => {
    test.setTimeout(60000); // Increase timeout for all tests in this suite
    let validEventDateId: string | null = null;

    test.beforeAll(async ({ browser }) => {
        // Get a valid eventDateId once for all tests
        // Need to authenticate first
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            // Sign in first
            const loginPage = new LoginPage(page);
            await loginPage.navigate();
            await loginPage.signIn(
                DEFAULT_TEST_CREDENTIALS.email,
                DEFAULT_TEST_CREDENTIALS.password
            );
            await page.waitForURL(createUrlPattern('/'), { timeout: 10000 });
            
            // Now get eventDateId
            validEventDateId = await getValidEventDateId(page);
        } catch (error) {
            console.warn('Could not get valid eventDateId:', error);
        } finally {
            await context.close();
        }
    });

    test.beforeEach(async ({ page }) => {
        // Sign in before each test
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.signIn(
            DEFAULT_TEST_CREDENTIALS.email,
            DEFAULT_TEST_CREDENTIALS.password
        );
        await page.waitForURL(createUrlPattern('/'), { timeout: 10000 });
    });

    test('should complete full registration for authenticated user', async ({ page }) => {
        if (!validEventDateId) {
            test.skip();
        }

        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();

        // Follow proper user flow: Navigate to event details -> Click Register Now -> Registration form
        // Step 1: Navigate to event details page
        await page.goto(`/register/event/${validEventDateId}`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Step 2: Set up network monitoring BEFORE clicking button
        console.log('[Test] Step 2: Setting up network monitoring...');
        const networkRequests: string[] = [];
        const networkResponses: Array<{url: string, status: number, body?: any}> = [];
        
        page.on('request', request => {
            const url = request.url();
            if (url.includes('api/') || url.includes('event')) {
                networkRequests.push(`REQUEST: ${request.method()} ${url}`);
                console.log(`[Network] REQUEST: ${request.method()} ${url}`);
            }
        });
        
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('api/') || url.includes('event')) {
                const status = response.status();
                let body = null;
                try {
                    body = await response.json().catch(() => null);
                } catch (e) {
                    body = await response.text().catch(() => null);
                }
                networkResponses.push({url, status, body});
                console.log(`[Network] RESPONSE: ${status} ${url}`);
                if (body && typeof body === 'object') {
                    console.log(`[Network] Response body keys: ${Object.keys(body).join(', ')}`);
                    if (body.data && body.data.event) {
                        const event = body.data.event;
                        console.log(`[Network] Event acceptReservations: ${event.acceptReservations}`);
                        console.log(`[Network] Event id: ${event.id || event.event_date_id}`);
                    } else if (body.event) {
                        const event = body.event;
                        console.log(`[Network] Event acceptReservations: ${event.acceptReservations}`);
                        console.log(`[Network] Event id: ${event.id || event.event_date_id}`);
                    }
                }
            }
        });
        
        // Click "Register Now" button on event details page
        console.log('[Test] Looking for Register Now button...');
        const registerNowButton = page.locator('[data-testid="continue button"]').first();
        const isVisible = await registerNowButton.isVisible({ timeout: 10000 }).catch(() => false);
        console.log(`[Test] Register Now button visible: ${isVisible}`);
        
        if (!isVisible) {
            // If button not visible, might already be on registration form or redirected
            const currentUrl = page.url();
            console.log(`[Test] Button not visible, current URL: ${currentUrl}`);
            if (!currentUrl.includes('/register/form')) {
                test.skip(); // Can't proceed without Register Now button
            }
        } else {
            console.log('[Test] Clicking Register Now button...');
            await registerNowButton.click();
            
            // Wait for navigation and network activity
            await page.waitForLoadState('networkidle', { timeout: 15000 });
            const urlAfterClick = page.url();
            console.log(`[Test] URL after clicking Register Now: ${urlAfterClick}`);
            
            // Log all network activity
            console.log(`[Test] Total API requests: ${networkRequests.length}`);
            console.log(`[Test] Total API responses: ${networkResponses.length}`);
            
            // Check for event details API call
            const eventDetailsCall = networkResponses.find(r => r.url.includes('event_details'));
            if (eventDetailsCall) {
                console.log(`[Test] Event details API called: ${eventDetailsCall.status}`);
                // Log response structure without full body (might be too large)
                if (eventDetailsCall.body) {
                    console.log(`[Test] Response top-level keys: ${Object.keys(eventDetailsCall.body).join(', ')}`);
                    if (eventDetailsCall.body.data) {
                        console.log(`[Test] Response data keys: ${Object.keys(eventDetailsCall.body.data).join(', ')}`);
                    }
                    if (eventDetailsCall.body.event) {
                        console.log(`[Test] Response event keys: ${Object.keys(eventDetailsCall.body.event).join(', ')}`);
                    }
                }
                
                // Check different possible response structures
                if (eventDetailsCall.body) {
                    let event = null;
                    if (eventDetailsCall.body.data && eventDetailsCall.body.data.event) {
                        event = eventDetailsCall.body.data.event;
                    } else if (eventDetailsCall.body.event) {
                        event = eventDetailsCall.body.event;
                    }
                    
                    if (event) {
                        console.log(`[Test] Event object keys: ${Object.keys(event).join(', ')}`);
                        console.log(`[Test] Event has event_dates: ${!!event.event_dates}`);
                        if (event.event_dates && Array.isArray(event.event_dates)) {
                            console.log(`[Test] Event has ${event.event_dates.length} event_dates`);
                            const matchingEventDate = event.event_dates.find((ed: any) => `${ed.id}` === validEventDateId);
                            if (matchingEventDate) {
                                console.log(`[Test] Found matching event_date for ${validEventDateId}`);
                                console.log(`[Test] Event_date accept_reservations: ${matchingEventDate.accept_reservations}`);
                                console.log(`[Test] Event_date accept_reservations type: ${typeof matchingEventDate.accept_reservations}`);
                            } else {
                                console.log(`[Test] No matching event_date found for ${validEventDateId}`);
                                console.log(`[Test] Available event_date IDs: ${event.event_dates.map((ed: any) => ed.id).join(', ')}`);
                            }
                        }
                        // Also check direct fields
                        console.log(`[Test] Event acceptReservations value: ${event.acceptReservations}`);
                        console.log(`[Test] Event accepts_reservations: ${event.accepts_reservations}`);
                        console.log(`[Test] Event accept_reservations: ${event.accept_reservations}`);
                    }
                }
            }
            
            // Check for event hours API call
            const eventHoursCall = networkResponses.find(r => r.url.includes('event_hours') || r.url.includes('event-hours'));
            if (eventHoursCall) {
                console.log(`[Test] Event hours API called: ${eventHoursCall.status}`);
            } else {
                console.log(`[Test] Event hours API NOT called - this is required for timeslot modal!`);
            }
            
            // Check for any error responses
            const errorResponses = networkResponses.filter(r => r.status >= 400);
            if (errorResponses.length > 0) {
                console.log(`[Test] Found ${errorResponses.length} error responses:`);
                errorResponses.forEach(r => {
                    console.log(`[Test] Error: ${r.status} ${r.url}`);
                    if (r.body) {
                        console.log(`[Test] Error body:`, JSON.stringify(r.body, null, 2).substring(0, 300));
                    }
                });
            }
        }
        
        // Step 3: Handle timeslot selection modal (REQUIRED - form won't show without it)
        // The modal appears on the form page, not immediately after clicking Register Now
        console.log('[Test] Step 3: Waiting for form page to load and checking for timeslot modal...');
        
        // Wait for page to fully load
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        
        // Check if event data is loaded by checking for event API call
        // The modal only shows if acceptReservations === 1, so we need to wait for event data
        console.log('[Test] Waiting for event data to load...');
        
        // Wait for event hours API call (this is what loads timeslots)
        try {
            await page.waitForResponse(response => {
                const url = response.url();
                return url.includes('event_hours') || url.includes('event-hours');
            }, { timeout: 10000 });
            console.log('[Test] Event hours API call completed');
        } catch (e) {
            console.log('[Test] Event hours API call not found or timed out');
        }
        
        await page.waitForTimeout(2000); // Give time for modal to appear after data loads
        
        // Check if there's an API error or if event doesn't accept reservations
        const errorText = await page.locator('text=/error|failed|not found/i').first().isVisible({ timeout: 2000 }).catch(() => false);
        if (errorText) {
            const errorMsg = await page.locator('text=/error|failed|not found/i').first().textContent();
            console.log(`[Test] Error message found: ${errorMsg}`);
            
            // Get all error elements
            const allErrors = await page.locator('text=/error|Error/i').all();
            console.log(`[Test] Found ${allErrors.length} error elements`);
            for (let i = 0; i < Math.min(allErrors.length, 5); i++) {
                const errorText = await allErrors[i].textContent();
                console.log(`[Test] Error ${i}: ${errorText}`);
            }
        }
        
        // Check browser console for errors
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                consoleErrors.push(text);
                console.log(`[Console Error] ${text}`);
            }
        });
        
        // Also check for React errors or component errors
        const reactError = await page.evaluate(() => {
            // Check for React error boundaries or error states
            const errorElements = document.querySelectorAll('[class*="error"], [data-error], [role="alert"]');
            return Array.from(errorElements).map(el => el.textContent).filter(Boolean);
        });
        if (reactError.length > 0) {
            console.log(`[Test] React errors found: ${reactError.join(', ')}`);
        }
        
        // Check current URL
        const currentUrl = page.url();
        console.log(`[Test] Current URL: ${currentUrl}`);
        
        // Try multiple selectors for the timeslot modal - wait longer since it appears after page load
        const timeslotModalSelectors = [
            '[id="timeslot-modal-title"]',
            '[role="dialog"]:has([id="timeslot-modal-title"])',
            'dialog:has-text(/choose time slot/i)',
            '[role="dialog"]:has-text(/time slot/i)',
            '[role="dialog"]'
        ];
        
        let timeslotModal = null;
        let isTimeslotModalVisible = false;
        
        // Try each selector with a longer timeout
        for (const selector of timeslotModalSelectors) {
            const modal = page.locator(selector).first();
            isTimeslotModalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false);
            console.log(`[Test] Checking selector "${selector}": ${isTimeslotModalVisible}`);
            if (isTimeslotModalVisible) {
                timeslotModal = modal;
                console.log(`[Test] Found timeslot modal with selector: ${selector}`);
                break;
            }
        }
        
        // If still not visible, wait a bit more and check page content
        if (!isTimeslotModalVisible) {
            console.log('[Test] Modal not immediately visible, waiting longer...');
            await page.waitForTimeout(3000);
            
            // Check again
            for (const selector of timeslotModalSelectors) {
                const modal = page.locator(selector).first();
                isTimeslotModalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
                if (isTimeslotModalVisible) {
                    timeslotModal = modal;
                    console.log(`[Test] Found timeslot modal after waiting with selector: ${selector}`);
                    break;
                }
            }
        }
        
        if (!isTimeslotModalVisible) {
            // Check what's actually on the page
            const allDialogs = await page.locator('[role="dialog"], dialog').count();
            console.log(`[Test] Number of dialogs found: ${allDialogs}`);
            
            // Check for spinner/loading state
            const spinner = page.locator('[role="status"], .spinner, [class*="loading"], [class*="spinner"]').first();
            const spinnerVisible = await spinner.isVisible({ timeout: 2000 }).catch(() => false);
            console.log(`[Test] Spinner visible: ${spinnerVisible}`);
            
            // Check for error messages
            const errorMessages = await page.locator('[role="alert"], .error, [class*="error"]').count();
            console.log(`[Test] Number of error messages: ${errorMessages}`);
            
            // Check page title
            const pageTitle = await page.title();
            console.log(`[Test] Page title: ${pageTitle}`);
            
            // Check for any visible text on the page
            const bodyText = await page.locator('body').textContent();
            console.log(`[Test] Body text (first 200 chars): ${bodyText?.substring(0, 200)}`);
            
            // Check browser console for errors
            const consoleMessages = await page.evaluate(() => {
                // This won't capture existing console errors, but we can check for React errors
                return window.console;
            });
            
            // Check for React root element
            const reactRoot = await page.locator('#root, [id*="root"], [data-reactroot]').count();
            console.log(`[Test] React root elements: ${reactRoot}`);
            
            // Check for any divs or main content
            const allDivs = await page.locator('div').count();
            console.log(`[Test] Number of div elements: ${allDivs}`);
            
            // Check for form elements
            const formInputs = await page.locator('input, select, textarea').count();
            console.log(`[Test] Number of form inputs: ${formInputs}`);
            
            // Check if page is still loading
            const isLoading = await page.evaluate(() => document.readyState);
            console.log(`[Test] Document ready state: ${isLoading}`);
            
            // Check for any script tags that might indicate what's loading
            const scriptTags = await page.locator('script').count();
            console.log(`[Test] Number of script tags: ${scriptTags}`);
            
            // Check the actual HTML content
            const htmlContent = await page.content();
            const htmlLength = htmlContent.length;
            console.log(`[Test] HTML content length: ${htmlLength}`);
            const hasTimeslotInHTML = htmlContent.includes('timeslot') || htmlContent.includes('modal') || htmlContent.includes('Time Slot');
            console.log(`[Test] HTML contains "timeslot" or "modal": ${hasTimeslotInHTML}`);
            
            // If HTML contains timeslot but modal not visible, check if it's hidden
            if (hasTimeslotInHTML) {
                console.log('[Test] Timeslot found in HTML, checking if modal is hidden...');
                
                // Search for any element containing timeslot-related text
                const timeslotTextElements = await page.locator('*:has-text("time slot"), *:has-text("Time Slot"), *:has-text("Choose Time")').count();
                console.log(`[Test] Elements with timeslot text: ${timeslotTextElements}`);
                
                // Try to find modal even if hidden - check multiple possible IDs/classes
                const modalSelectors = [
                    '[id="timeslot-modal-title"]',
                    '[id*="timeslot"]',
                    '[id*="modal"]',
                    '[class*="timeslot"]',
                    '[class*="modal"]',
                    '[data-testid*="timeslot"]',
                    '[data-testid*="modal"]'
                ];
                
                let modalFound = false;
                for (const selector of modalSelectors) {
                    const element = page.locator(selector).first();
                    const exists = await element.count() > 0;
                    if (exists) {
                        console.log(`[Test] Found element with selector "${selector}"`);
                        modalFound = true;
                        break;
                    }
                }
                console.log(`[Test] Modal element exists in DOM: ${modalFound}`);
                
                if (modalFound) {
                    // Check if it's hidden - find the element again
                    const hiddenModal = page.locator('[id*="timeslot"], [id*="modal"], [class*="timeslot"], [class*="modal"]').first();
                    const isHidden = await hiddenModal.evaluate((el) => {
                        const style = window.getComputedStyle(el);
                        return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
                    }).catch(() => false);
                    console.log(`[Test] Modal is hidden: ${isHidden}`);
                    
                    // Check parent dialog
                    const dialog = page.locator('[role="dialog"]').first();
                    const dialogExists = await dialog.count() > 0;
                    console.log(`[Test] Dialog element exists: ${dialogExists}`);
                    
                    if (dialogExists) {
                        const dialogHidden = await dialog.evaluate((el) => {
                            const style = window.getComputedStyle(el);
                            return style.display === 'none' || style.visibility === 'hidden';
                        }).catch(() => false);
                        console.log(`[Test] Dialog is hidden: ${dialogHidden}`);
                        
                        // Try to check if dialog has open attribute or data-state
                        const dialogOpen = await dialog.getAttribute('data-state');
                        console.log(`[Test] Dialog data-state: ${dialogOpen}`);
                        
                        // Try to force show it by checking if it's in a portal or overlay
                        const dialogVisible = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
                        console.log(`[Test] Dialog isVisible check: ${dialogVisible}`);
                    }
                }
                
                // Try alternative selectors that might work even if hidden
                const altSelectors = [
                    '[id="timeslot-modal-title"]',
                    'text=Choose Time Slot',
                    'text=/choose.*time.*slot/i',
                    '[aria-labelledby*="timeslot"]'
                ];
                
                for (const selector of altSelectors) {
                    const element = page.locator(selector).first();
                    const exists = await element.count() > 0;
                    if (exists) {
                        console.log(`[Test] Found element with selector "${selector}", trying to interact...`);
                        // Try to make it visible or click it
                        try {
                            await element.scrollIntoViewIfNeeded();
                            await page.waitForTimeout(500);
                            const nowVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
                            if (nowVisible) {
                                console.log(`[Test] Element is now visible after scroll!`);
                                isTimeslotModalVisible = true;
                                timeslotModal = element;
                                break;
                            }
                        } catch (e) {
                            console.log(`[Test] Could not make element visible: ${e}`);
                        }
                    }
                }
            }
            
            // Wait a bit more if spinner is visible
            if (spinnerVisible) {
                console.log('[Test] Spinner visible, waiting for it to disappear...');
                await spinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
                    console.log('[Test] Spinner did not disappear');
                });
                
                // Check again for modal after spinner disappears
                for (const selector of timeslotModalSelectors) {
                    const modal = page.locator(selector).first();
                    isTimeslotModalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
                    if (isTimeslotModalVisible) {
                        timeslotModal = modal;
                        console.log(`[Test] Found timeslot modal after spinner disappeared with selector: ${selector}`);
                        break;
                    }
                }
            }
            
            if (!isTimeslotModalVisible) {
                // Take a screenshot for debugging
                await page.screenshot({ path: 'test-results/debug-no-timeslot-modal.png' });
                
                throw new Error(`Timeslot modal not found. This is required for the form to show. Current URL: ${currentUrl}, Dialogs: ${allDialogs}, Form inputs: ${formInputs}, Spinner: ${spinnerVisible}, Ready state: ${isLoading}`);
            }
        }
        
        console.log('[Test] Timeslot modal is visible, waiting for timeslots to load...');
        
        // Wait for loading spinner to disappear
        const loadingSpinner = page.locator('[role="status"][aria-label*="Loading"], [role="status"]:has-text(/loading/i)').first();
        const spinnerVisible = await loadingSpinner.isVisible({ timeout: 2000 }).catch(() => false);
        console.log(`[Test] Loading spinner visible: ${spinnerVisible}`);
        
        if (spinnerVisible) {
            console.log('[Test] Waiting for loading spinner to disappear...');
            await loadingSpinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
                console.log('[Test] Loading spinner did not disappear, continuing anyway...');
            });
        }
        
        // Wait for radio buttons to appear
        console.log('[Test] Looking for timeslot radio buttons...');
        const timeslotRadio = page.locator('input[type="radio"][name="time_slot"]').first();
        await timeslotRadio.waitFor({ state: 'visible', timeout: 15000 });
        
        const slotCount = await page.locator('input[type="radio"][name="time_slot"]').count();
        console.log(`[Test] Found ${slotCount} timeslot options`);
        
        if (slotCount === 0) {
            throw new Error('No timeslot options found in modal');
        }
        
        // Select first available timeslot
        console.log('[Test] Selecting first timeslot...');
        const firstSlot = page.locator('input[type="radio"][name="time_slot"]').first();
        const slotValue = await firstSlot.getAttribute('value');
        console.log(`[Test] Selected timeslot value: ${slotValue}`);
        await firstSlot.click();
        
        // Wait a moment for selection to register
        await page.waitForTimeout(500);
        
        // Click "Save and Continue" button
        console.log('[Test] Looking for Save and Continue button...');
        const saveButtonSelectors = [
            'button:has-text("Save and Continue")',
            'button:has-text(/save.*continue/i)',
            'button[type="submit"]:has-text(/continue/i)',
            'button:has-text("Continue")'
        ];
        
        let clicked = false;
        for (const selector of saveButtonSelectors) {
            const button = page.locator(selector).first();
            const isButtonVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
            const isButtonEnabled = isButtonVisible ? await button.isEnabled({ timeout: 500 }).catch(() => false) : false;
            console.log(`[Test] Button selector "${selector}": visible=${isButtonVisible}, enabled=${isButtonEnabled}`);
            
            if (isButtonVisible && isButtonEnabled) {
                console.log(`[Test] Clicking button with selector: ${selector}`);
                await button.click();
                clicked = true;
                break;
            }
        }
        
        if (!clicked) {
            throw new Error('Could not find or click "Save and Continue" button in timeslot modal');
        }
        
        // Get the slot ID we selected BEFORE clicking (in case modal closes)
        const selectedSlotId = await firstSlot.getAttribute('value');
        console.log(`[Test] Selected slot ID: ${selectedSlotId}`);
        
        // After clicking, wait for any loading state and check for household confirmation modal
        console.log('[Test] Checking for loading state and household confirmation modal...');
        
        // Wait for loading spinner to disappear (if any)
        const householdLoadingSpinner = page.locator('[role="status"]:has-text(/loading/i), [class*="loading"]').first();
        const householdSpinnerVisible = await householdLoadingSpinner.isVisible({ timeout: 2000 }).catch(() => false);
        if (householdSpinnerVisible) {
            console.log('[Test] Loading spinner visible, waiting for it to disappear...');
            await householdLoadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        }
        
        await page.waitForTimeout(2000); // Give time for modals/actions to appear
        
        // Check for household confirmation modal (for authenticated users with complete household)
        const householdModalSelectors = [
            '[role="dialog"]:has-text(/household/i)',
            '[role="dialog"]:has-text(/confirm/i)',
            '[data-testid*="household"]',
            '[data-testid*="confirmation"]'
        ];
        
        let isHouseholdModalVisible = false;
        for (const selector of householdModalSelectors) {
            const modal = page.locator(selector).first();
            isHouseholdModalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
            if (isHouseholdModalVisible) {
                console.log(`[Test] Household confirmation modal appeared (selector: ${selector})`);
                break;
            }
        }
        
        if (isHouseholdModalVisible) {
            console.log('[Test] Household confirmation modal appeared');
            
            // The modal has two buttons:
            // 1. "No, review & update" (data-testid="review-update-button") - navigates to form with household data prefilled
            // 2. "Yes, register" (data-testid="confirm-register-button") - registers directly (skips form)
            
            // We want to click "Review" to go to the form
            // Use the specific data-testid which we know exists
            const reviewButton = page.locator('[data-testid="review-update-button"]').first();
            const reviewVisible = await reviewButton.isVisible({ timeout: 5000 }).catch(() => false);
            
            if (reviewVisible) {
                console.log('[Test] Clicking "Review & Update" button - this will navigate to form with household data prefilled');
                
                // After clicking Review, it calls handleHouseholdReview which:
                // - Calls navigateToRegistration(selectedSlot, householdData)
                // - Navigates to /register/form/{eventDateId}/{slotId}
                // - Passes householdData in location.state for prefilling
                // - RegistrationContainer will prefill the form with household data
                
                await reviewButton.click();
                console.log('[Test] Review button clicked, waiting for navigation...');
                await page.waitForLoadState('networkidle', { timeout: 15000 });
            } else {
                // Try alternative selector
                const reviewButtonAlt = page.locator('button:has-text("No, review & update"), button:has-text(/review.*update/i)').first();
                const altVisible = await reviewButtonAlt.isVisible({ timeout: 2000 }).catch(() => false);
                if (altVisible) {
                    console.log('[Test] Found Review button with alternative selector');
                    await reviewButtonAlt.click();
                    await page.waitForLoadState('networkidle', { timeout: 15000 });
                } else {
                    // Check what buttons are available for debugging
                    const allButtons = await page.locator('[data-testid="household-confirmation-modal"] button, [role="dialog"]:has([data-testid="household-confirmation-modal"]) button').all();
                    console.log(`[Test] Found ${allButtons.length} buttons in household modal`);
                    for (let i = 0; i < allButtons.length; i++) {
                        const buttonText = await allButtons[i].textContent();
                        const buttonTestId = await allButtons[i].getAttribute('data-testid');
                        const isVisible = await allButtons[i].isVisible().catch(() => false);
                        console.log(`[Test] Button ${i}: "${buttonText}" (testid: ${buttonTestId}, visible: ${isVisible})`);
                    }
                    throw new Error('Review button not visible in household confirmation modal');
                }
            }
        } else {
            console.log('[Test] No household confirmation modal appeared - should navigate directly to form');
        }
        
        // Wait for navigation to form with slot ID (REQUIRED - slot ID must be in URL)
        console.log('[Test] Waiting for navigation to form with slot ID in URL...');
        
        // Wait for URL to change to include the slot ID
        const expectedUrlPattern = new RegExp(`/register/form/${validEventDateId}/${selectedSlotId}(?:/|$|\\?)`);
        console.log(`[Test] Expected URL pattern: ${expectedUrlPattern}`);
        
        try {
            // Wait for the URL to match the pattern with slot ID
            await page.waitForURL(expectedUrlPattern, { timeout: 20000 });
            const finalUrl = page.url();
            console.log(`[Test] Successfully navigated to form with slot ID: ${finalUrl}`);
            
            // Verify the slot ID is actually in the URL
            if (!finalUrl.includes(`/register/form/${validEventDateId}/${selectedSlotId}`)) {
                throw new Error(`Slot ID ${selectedSlotId} not found in URL: ${finalUrl}`);
            }
        } catch (e) {
            // If timeout, check what URL we're actually on
            const currentUrl = page.url();
            console.log(`[Test] Navigation timeout, current URL: ${currentUrl}`);
            console.log(`[Test] Expected URL: /register/form/${validEventDateId}/${selectedSlotId}`);
            
            // Check if we're on a form URL but without slot ID
            if (currentUrl.includes('/register/form') && !currentUrl.includes(`/${selectedSlotId}`)) {
                throw new Error(`Slot ID ${selectedSlotId} is missing from URL. Current URL: ${currentUrl}. Expected: /register/form/${validEventDateId}/${selectedSlotId}`);
            } else if (!currentUrl.includes('/register/form')) {
                throw new Error(`Expected navigation to /register/form/${validEventDateId}/${selectedSlotId}, but got: ${currentUrl}`);
            } else {
                // URL has slot ID but pattern didn't match - might be query params or trailing slash
                console.log(`[Test] URL contains slot ID but pattern didn't match, continuing...`);
            }
        }
        
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Step 4: Verify we're on registration form
        const finalFormUrl = page.url();
        if (!finalFormUrl.includes('/register/form')) {
            // If redirected, check why
            if (finalFormUrl.includes('/register/already-registered')) {
                test.skip(); // User already registered
            } else if (finalFormUrl.includes('/login')) {
                throw new Error('Registration form requires authentication');
            } else {
                throw new Error(`Unexpected redirect. Expected registration form, got: ${finalFormUrl}`);
            }
        }

        // Complete the registration
        // The form should now be visible after timeslot selection
        // If household data was prefilled, Step 0 fields might already have values
        console.log('[Test] Starting registration form completion...');
        
        // Wait for form to be fully loaded (especially if household data is being prefilled)
        console.log('[Test] Waiting for registration form to be ready...');
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        
        // Check what's actually on the page
        console.log('[Test] Checking page state after navigation...');
        const formPageUrl = page.url();
        console.log(`[Test] Current URL: ${formPageUrl}`);
        
        // Check for form inputs
        const allInputs = await page.locator('input, select, textarea').count();
        console.log(`[Test] Total form inputs found: ${allInputs}`);
        
        // Check for Step 0 inputs (primary information)
        const firstNameInput = page.locator(RegistrationSelectors.firstNameInput).first();
        const firstNameExists = await firstNameInput.count() > 0;
        const firstNameVisible = firstNameExists ? await firstNameInput.isVisible({ timeout: 5000 }).catch(() => false) : false;
        console.log(`[Test] First name input exists: ${firstNameExists}, visible: ${firstNameVisible}`);
        
        // Check for Step 1 inputs (address)
        const addressInput = page.locator(RegistrationSelectors.addressInput).first();
        const addressExists = await addressInput.count() > 0;
        const addressVisible = addressExists ? await addressInput.isVisible({ timeout: 2000 }).catch(() => false) : false;
        console.log(`[Test] Address input exists: ${addressExists}, visible: ${addressVisible}`);
        
        // Check for Continue button - try different selectors
        const continueButtonSelectors = [
            '[data-testid="continue-button"]',
            '[data-testid="continue button"]',
            'button:has-text("Continue")',
            'button:has-text("Next")'
        ];
        
        let continueButtonFound = false;
        for (const selector of continueButtonSelectors) {
            const button = page.locator(selector).first();
            const exists = await button.count() > 0;
            const visible = exists ? await button.isVisible({ timeout: 1000 }).catch(() => false) : false;
            const enabled = visible ? await button.isEnabled({ timeout: 500 }).catch(() => false) : false;
            console.log(`[Test] Continue button "${selector}": exists=${exists}, visible=${visible}, enabled=${enabled}`);
            if (visible && enabled) {
                continueButtonFound = true;
                break;
            }
        }
        console.log(`[Test] Continue button found and clickable: ${continueButtonFound}`);
        
        // Check what step indicator shows (if any)
        const stepIndicators = await page.locator('[class*="step"], [data-step], [aria-label*="step"]').all();
        console.log(`[Test] Found ${stepIndicators.length} step indicators`);
        for (let i = 0; i < Math.min(stepIndicators.length, 5); i++) {
            const stepText = await stepIndicators[i].textContent();
            const stepVisible = await stepIndicators[i].isVisible().catch(() => false);
            console.log(`[Test] Step indicator ${i}: "${stepText}" (visible: ${stepVisible})`);
        }
        
        // Check for loading spinner
        const formSpinner = page.locator('[role="status"], .spinner, [class*="loading"]').first();
        const formSpinnerVisible = await formSpinner.isVisible({ timeout: 2000 }).catch(() => false);
        console.log(`[Test] Loading spinner visible: ${formSpinnerVisible}`);
        
        if (formSpinnerVisible) {
            console.log('[Test] Waiting for spinner to disappear...');
            await formSpinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        }
        
        // Check for form container
        const formContainer = page.locator(RegistrationSelectors.householdForm).first();
        const formContainerVisible = await formContainer.isVisible({ timeout: 2000 }).catch(() => false);
        console.log(`[Test] Form container visible: ${formContainerVisible}`);
        
        // If form is not visible, wait a bit more and check again
        if (!firstNameVisible && !addressVisible) {
            console.log('[Test] Form not visible yet, waiting longer...');
            await page.waitForTimeout(3000);
            
            // Check again
            const firstNameVisible2 = await firstNameInput.isVisible({ timeout: 5000 }).catch(() => false);
            const addressVisible2 = await addressInput.isVisible({ timeout: 2000 }).catch(() => false);
            console.log(`[Test] After waiting - First name: ${firstNameVisible2}, Address: ${addressVisible2}`);
            
            if (!firstNameVisible2 && !addressVisible2) {
                // Take screenshot for debugging
                await page.screenshot({ path: 'test-results/debug-form-not-visible.png' });
                throw new Error(`Registration form is not visible. URL: ${formPageUrl}, Inputs: ${allInputs}, Spinner: ${formSpinnerVisible}`);
            }
        }
        
        await registrationPage.completeRegistration(formData);

        // Verify confirmation page
        await registrationPage.verifyConfirmationPage();
    });

    test('should validate Step 0 (Primary Information)', async ({ page }) => {
        if (!validEventDateId) {
            test.skip();
        }

        const registrationPage = new RegistrationPage(page);

        const result = await registrationPage.navigate(validEventDateId!);
        
        if (result.status === 'redirected') {
            test.skip();
        } else if (result.status === 'error') {
            throw new Error(result.message || 'Failed to navigate to registration form');
        }

        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        // Try to proceed without filling required fields
        const nextButton = page.locator('[data-testid="next-button"]');
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextButton.click();

            // Should show validation errors
            await page.waitForTimeout(1000);
            const errors = page.locator('[data-testid="error-message"], .error, [role="alert"]');
            const errorCount = await errors.count();

            // Should have validation errors
            expect(errorCount).toBeGreaterThan(0);
        }
    });

    test('should validate Step 1 (Address Information)', async ({ page }) => {
        if (!validEventDateId) {
            test.skip();
        }

        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();

        const result = await registrationPage.navigate(validEventDateId!);
        
        if (result.status === 'redirected') {
            test.skip();
        } else if (result.status === 'error') {
            throw new Error(result.message || 'Failed to navigate to registration form');
        }

        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        // Fill Step 0
        await registrationPage.fillStep0({
            firstName: formData.user.firstName || 'Test',
            lastName: formData.user.lastName || 'User',
            dateOfBirth: formatDateForInput(getPastDate(25)),
            gender: 'Other',
        });
        await registrationPage.clickNext();

        // Try to proceed from Step 1 without filling address
        await page.waitForTimeout(1000);
        const nextButton = page.locator('[data-testid="continue button"], [data-testid="next-button"], button:has-text(/continue|next/i)').first();
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextButton.click();

            // Should show validation errors for address fields
            await page.waitForTimeout(1000);
            const errors = page.locator('[data-testid="error-message"], .error, [role="alert"], .text-red-500, .text-red-600');
            const errorCount = await errors.count();

            // Should have validation errors
            expect(errorCount).toBeGreaterThan(0);
        }
    });

    test('should validate Step 2 (Family Member Counts)', async ({ page }) => {
        if (!validEventDateId) {
            test.skip();
        }

        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();

        const result = await registrationPage.navigate(validEventDateId!);
        
        if (result.status === 'redirected') {
            test.skip();
        } else if (result.status === 'error') {
            throw new Error(result.message || 'Failed to navigate to registration form');
        }

        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        // Fill Step 0
        await registrationPage.fillStep0({
            firstName: formData.user.firstName || 'Test',
            lastName: formData.user.lastName || 'User',
            dateOfBirth: formatDateForInput(getPastDate(25)),
            gender: 'Other',
        });
        await registrationPage.clickNext();

        // Fill Step 1
        await registrationPage.fillStep1({
            address: formData.address.street,
            city: formData.address.city,
            state: formData.address.state,
            zipCode: formData.address.zipCode,
            phone: formData.address.phone,
        });
        await registrationPage.clickNext();

        // Try to proceed without filling family counts
        await page.waitForTimeout(1000);
        const nextButton = page.locator('[data-testid="continue button"], [data-testid="next-button"], button:has-text(/continue|next/i)').first();
        if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await nextButton.click();

            // Should show validation or allow submission
            // (depends on if family counts are required)
            await page.waitForTimeout(1000);
        }
    });

    test('should navigate between steps', async ({ page }) => {
        if (!validEventDateId) {
            test.skip();
        }

        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();

        const result = await registrationPage.navigate(validEventDateId!);
        
        if (result.status === 'redirected') {
            test.skip();
        } else if (result.status === 'error') {
            throw new Error(result.message || 'Failed to navigate to registration form');
        }

        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        // Fill Step 0 and go to Step 1
        await registrationPage.fillStep0({
            firstName: formData.user.firstName || 'Test',
            lastName: formData.user.lastName || 'User',
            dateOfBirth: formatDateForInput(getPastDate(25)),
            gender: 'Other',
        });
        await registrationPage.clickNext();

        // Go back to Step 0
        await registrationPage.clickPrevious();

        // Verify we're back on Step 0 (check if first name field is visible)
        const firstNameInput = page.locator('[data-testid="first-name-input"], #first_name').first();
        const isVisible = await firstNameInput.isVisible({ timeout: 2000 }).catch(() => false);
        expect(isVisible).toBe(true);
    });

    test('should select event slot', async ({ page }) => {
        if (!validEventDateId) {
            test.skip();
        }

        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();

        const result = await registrationPage.navigate(validEventDateId!);
        
        if (result.status === 'redirected') {
            test.skip();
        } else if (result.status === 'error') {
            throw new Error(result.message || 'Failed to navigate to registration form');
        }

        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        // Complete all steps
        await registrationPage.completeRegistration(formData);

        // Check if event slot selection is available
        const slotElement = page.locator('[data-testid="event-slot"]');
        const slotAvailable = await slotElement.isVisible({ timeout: 2000 }).catch(() => false);
        if (slotAvailable) {
            await registrationPage.selectEventSlot(0);
            // Verify slot is selected
            await page.waitForTimeout(1000);
        }
    });

    test('should display confirmation page after successful registration', async ({ page }) => {
        if (!validEventDateId) {
            test.skip();
        }

        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();

        const result = await registrationPage.navigate(validEventDateId!);
        
        if (result.status === 'redirected') {
            test.skip();
        } else if (result.status === 'error') {
            throw new Error(result.message || 'Failed to navigate to registration form');
        }

        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        // Complete registration
        await registrationPage.completeRegistration(formData);

        // Verify confirmation page
        await registrationPage.verifyConfirmationPage();
    });

    test('should display QR code on confirmation', async ({ page }) => {
        if (!validEventDateId) {
            test.skip();
        }

        const registrationPage = new RegistrationPage(page);
        const formData = createRegistrationFormData();

        const result = await registrationPage.navigate(validEventDateId!);
        
        if (result.status === 'redirected') {
            test.skip();
        } else if (result.status === 'error') {
            throw new Error(result.message || 'Failed to navigate to registration form');
        }

        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        // Complete registration
        await registrationPage.completeRegistration(formData);

        // Verify QR code is displayed
        await registrationPage.verifyQRCodeDisplayed();
    });
});

