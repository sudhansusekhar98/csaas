const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Step 1: Load app
  await page.goto('http://localhost:9090', { waitUntil: 'networkidle', timeout: 15000 });
  await page.screenshot({ path: 'C:/Users/sudha/verify-1-home.png' });
  console.log('STEP1_OK app loaded, title=' + await page.title());

  // Step 2: Navigate to Division Station via sidebar
  await page.click('text=Division Station');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/sudha/verify-2-division.png' });
  console.log('STEP2_OK division station open');

  // Step 3: Click session DIV-8818-B (COMPLETED — all bags sealed)
  await page.click('text=DIV-8818-B');
  await page.waitForTimeout(800);

  // Scroll down to find allocation card
  await page.evaluate(() => window.scrollBy(0, 700));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/sudha/verify-3-allocation.png' });

  // Assertions for allocation card
  const selectCount = await page.locator('select').count();
  const labCount = await page.getByText('LAB', { exact: true }).count();
  const sample01Count = await page.getByText(/Sample -01/).count();
  const confirmDispatch = await page.getByText(/Confirm Dispatch/).count();
  const confirmAlloc = await page.getByText(/Confirm Allocation/).count();
  const trackedText = await page.getByText(/Lab Dispatch · Tracked/).count();
  const notTrackedText = await page.getByText(/Not tracked beyond/).count();

  console.log('SELECT_COUNT:', selectCount, '(expect 0 — no dropdown)');
  console.log('LAB_BADGE:', labCount, '(expect >=1)');
  console.log('SAMPLE_01:', sample01Count, '(expect >=1)');
  console.log('CONFIRM_DISPATCH:', confirmDispatch, '(expect >=1)');
  console.log('OLD_CONFIRM_ALLOC:', confirmAlloc, '(expect 0)');
  console.log('TRACKED_LABEL:', trackedText, '(expect >=1)');
  console.log('NOT_TRACKED_TEXT:', notTrackedText);

  // Step 4: Sample Tracking — select post-division sample
  await page.click('text=Sample Tracking');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'C:/Users/sudha/verify-4-tracking.png' });

  // Select PRNT-8810-D (currentStepIndex >= 9, has lab child)
  const sampleDropdown = page.locator('select').first();
  await sampleDropdown.selectOption({ label: /PRNT-8810-D/ });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'C:/Users/sudha/verify-5-childpanel.png' });

  const childLabBadge = await page.getByText('LAB', { exact: true }).count();
  const childId01 = await page.getByText(/CHLD-8810-D-01/).count();
  const oldChildB = await page.getByText(/CHLD-8810-D-B/).count();
  const oldChildA = await page.getByText(/CHLD-8810-D-A/).count();

  console.log('CHILD_LAB_BADGE:', childLabBadge, '(expect >=1)');
  console.log('CHILD_01_ID:', childId01, '(expect >=1)');
  console.log('OLD_CHILD_B:', oldChildB, '(expect 0 — removed)');
  console.log('OLD_CHILD_A:', oldChildA, '(expect 0 — renamed to -01)');

  await browser.close();
  console.log('DONE');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
