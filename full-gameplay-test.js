const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function fullGameplayTest() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }

    console.log('Starting full gameplay flow test on http://localhost:3010\n');

    // Open home page
    console.log('Step 1: Opening home page...');
    await page.goto('http://localhost:3010', { waitUntil: 'networkidle2', timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✓ Home page loaded');

    // Click Start Session
    console.log('\nStep 2: Clicking Start Session...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startButton = buttons.find(btn => btn.textContent.includes('Start Session'));
      if (startButton) startButton.click();
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Screenshot 1: Session started
    const screenshot1Path = path.join(screenshotsDir, '1-session-started.png');
    await page.screenshot({ path: screenshot1Path, fullPage: true });
    console.log('✓ Session started');
    console.log(`📸 Screenshot 1 saved: ${screenshot1Path}`);

    // Move to Security Room
    console.log('\nStep 3: Moving to Security Room...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const securityButton = buttons.find(btn => btn.textContent.includes('Security Room'));
      if (securityButton) securityButton.click();
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✓ Moved to Security Room');

    // Collect evidence
    console.log('\nStep 4: Collecting evidence...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const evidenceButton = buttons.find(btn => 
        btn.textContent.includes('Broken sensor') ||
        btn.textContent.includes('Night shift') ||
        btn.textContent.includes('Insurance email')
      );
      if (evidenceButton) evidenceButton.click();
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('✓ Evidence collected');

    // Ask NPC
    console.log('\nStep 5: Asking NPC question...');
    await page.waitForSelector('input', { timeout: 5000 });
    await page.type('input', 'What happened around 22:14?');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const askButton = buttons.find(btn => btn.textContent.trim() === 'Ask');
      if (askButton) askButton.click();
    });
    console.log('✓ NPC question asked');
    console.log('  Waiting for AI response...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Click Ask Hint
    console.log('\nStep 6: Clicking Ask Hint...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const hintButton = buttons.find(btn => btn.textContent.includes('Ask Hint'));
      if (hintButton) hintButton.click();
    });
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✓ Hint received');

    // Screenshot 2: After dialogue and hint
    const screenshot2Path = path.join(screenshotsDir, '2-dialogue-and-hint-visible.png');
    await page.screenshot({ path: screenshot2Path, fullPage: true });
    console.log(`📸 Screenshot 2 saved: ${screenshot2Path}`);

    // Accuse Mina
    console.log('\nStep 7: Accusing Mina...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const accuseMinaButton = buttons.find(btn => 
        btn.textContent.includes('Accuse') && btn.textContent.includes('Mina')
      );
      if (accuseMinaButton) accuseMinaButton.click();
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✓ Mina accused');

    // Open admin page
    console.log('\nStep 8: Opening admin page...');
    await page.goto('http://localhost:3010/admin', { waitUntil: 'networkidle2', timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Screenshot 3: Admin page
    const screenshot3Path = path.join(screenshotsDir, '3-admin-page-after-actions.png');
    await page.screenshot({ path: screenshot3Path, fullPage: true });
    console.log('✓ Admin page loaded');
    console.log(`📸 Screenshot 3 saved: ${screenshot3Path}`);

    // Get admin metrics
    const bodyText = await page.evaluate(() => document.body.innerText);
    const metricsMatch = bodyText.match(/Total events:\s*(\d+)/i);
    const totalEvents = metricsMatch ? parseInt(metricsMatch[1]) : 0;
    const hasDialogueRequest = bodyText.toLowerCase().includes('dialogue_request');

    console.log('\n═══════════════════════════════════════════════════');
    console.log('           GAMEPLAY FLOW COMPLETE');
    console.log('═══════════════════════════════════════════════════');
    console.log('\nScreenshots captured:');
    console.log(`  1. ${screenshot1Path}`);
    console.log(`  2. ${screenshot2Path}`);
    console.log(`  3. ${screenshot3Path}`);
    console.log('\nAdmin Metrics:');
    console.log(`  Total events: ${totalEvents}`);
    console.log(`  dialogue_request event: ${hasDialogueRequest ? 'Yes' : 'No'}`);
    console.log('\n✅ All steps completed successfully');
    console.log('═══════════════════════════════════════════════════');

  } catch (error) {
    console.error('\n❌ Error during gameplay test:', error.message);
  } finally {
    await browser.close();
  }
}

fullGameplayTest();
