const puppeteer = require('puppeteer');

async function fullFlowTest() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    startSession: { status: 'pending', error: null },
    moveToSecurityRoom: { status: 'pending', error: null },
    collectEvidence: { status: 'pending', error: null },
    askNPC: { status: 'pending', error: null },
    no500Blocking: { status: 'pending', error: null },
    openAdmin: { status: 'pending', error: null },
    pagesUsable: { status: 'pending', error: null }
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const criticalErrors = [];
    page.on('pageerror', error => {
      criticalErrors.push(error.message);
    });

    console.log('Opening https://personal-project-game.vercel.app\n');
    
    await page.goto('https://personal-project-game.vercel.app', { 
      waitUntil: 'networkidle2', 
      timeout: 15000 
    });
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 1: Start Session
    console.log('Step 1: Click Start Session');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startButton = buttons.find(btn => btn.textContent.includes('Start Session'));
      if (startButton) startButton.click();
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let bodyText = await page.evaluate(() => document.body.innerText);
    const sessionStarted = bodyText.includes('Turns Left') && bodyText.includes('State:');
    results.startSession.status = sessionStarted ? 'pass' : 'fail';
    console.log(`  Result: ${results.startSession.status.toUpperCase()}`);

    // Step 2: Move to Security Room
    console.log('\nStep 2: Move to Security Room');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const securityButton = buttons.find(btn => btn.textContent.includes('Security Room'));
      if (securityButton) securityButton.click();
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    bodyText = await page.evaluate(() => document.body.innerText);
    const hasSecurityEvidence = bodyText.includes('Broken sensor') || bodyText.includes('Night shift');
    results.moveToSecurityRoom.status = hasSecurityEvidence ? 'pass' : 'fail';
    console.log(`  Result: ${results.moveToSecurityRoom.status.toUpperCase()}`);

    // Step 3: Collect Evidence
    console.log('\nStep 3: Collect one evidence');
    const beforeCollect = bodyText.match(/Collected:\s*(\d+)/);
    const collectedBefore = beforeCollect ? parseInt(beforeCollect[1]) : 0;
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const evidenceButton = buttons.find(btn => 
        btn.textContent.includes('Broken sensor') || 
        btn.textContent.includes('Night shift')
      );
      if (evidenceButton) evidenceButton.click();
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    bodyText = await page.evaluate(() => document.body.innerText);
    const afterCollect = bodyText.match(/Collected:\s*(\d+)/);
    const collectedAfter = afterCollect ? parseInt(afterCollect[1]) : 0;
    results.collectEvidence.status = collectedAfter > collectedBefore ? 'pass' : 'fail';
    console.log(`  Collected: ${collectedBefore} → ${collectedAfter}`);
    console.log(`  Result: ${results.collectEvidence.status.toUpperCase()}`);

    // Step 4: Ask NPC
    console.log('\nStep 4: Ask NPC "What happened around 22:14?"');
    
    await page.type('input', 'What happened around 22:14?');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const beforeAsk = bodyText;
    const turnsBefore = bodyText.match(/Turns Left:\s*(\d+)/);
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const askButton = buttons.find(btn => btn.textContent.trim() === 'Ask');
      if (askButton) askButton.click();
    });
    
    console.log('  Waiting for response...');
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    bodyText = await page.evaluate(() => document.body.innerText);
    const turnsAfter = bodyText.match(/Turns Left:\s*(\d+)/);
    const turnsDecreased = turnsAfter && turnsBefore && parseInt(turnsAfter[1]) < parseInt(turnsBefore[1]);
    const tokenUsed = bodyText.match(/Token Usage:\s*(\d+)/) && parseInt(bodyText.match(/Token Usage:\s*(\d+)/)[1]) > 0;
    
    // Check if page is still functional after ask
    const pageStillWorks = bodyText.includes('Ask') && bodyText.includes('Location');
    
    results.askNPC.status = (turnsDecreased || tokenUsed) ? 'pass' : 'fail';
    console.log(`  Turns decreased: ${turnsDecreased} (${turnsBefore ? turnsBefore[1] : '?'} → ${turnsAfter ? turnsAfter[1] : '?'})`);
    console.log(`  Token used: ${tokenUsed}`);
    console.log(`  Result: ${results.askNPC.status.toUpperCase()}`);

    // Step 5: Check for blocking 500 errors
    console.log('\nStep 5: Check for 500 blocking behavior');
    const pageIsFrozen = criticalErrors.some(err => err.includes('500'));
    const canStillInteract = bodyText.includes('Ask') && bodyText.includes('Accuse');
    
    results.no500Blocking.status = !pageIsFrozen && canStillInteract ? 'pass' : 'fail';
    console.log(`  Page frozen: ${pageIsFrozen}`);
    console.log(`  Can still interact: ${canStillInteract}`);
    console.log(`  Result: ${results.no500Blocking.status.toUpperCase()}`);

    // Step 6: Open Admin
    console.log('\nStep 6: Open /admin page');
    await page.goto('https://personal-project-game.vercel.app/admin', { 
      waitUntil: 'networkidle2', 
      timeout: 15000 
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    bodyText = await page.evaluate(() => document.body.innerText);
    const hasAdminContent = bodyText.includes('Admin Metrics') || bodyText.includes('Total events');
    results.openAdmin.status = hasAdminContent ? 'pass' : 'fail';
    console.log(`  Has admin content: ${hasAdminContent}`);
    console.log(`  Result: ${results.openAdmin.status.toUpperCase()}`);

    // Step 7: Verify pages are usable
    console.log('\nStep 7: Verify pages are usable');
    const adminUsable = bodyText.includes('Admin Metrics') && !bodyText.includes('crashed');
    results.pagesUsable.status = adminUsable && pageStillWorks ? 'pass' : 'fail';
    console.log(`  Admin page usable: ${adminUsable}`);
    console.log(`  Result: ${results.pagesUsable.status.toUpperCase()}`);

  } catch (error) {
    console.error(`\n❌ Critical Error: ${error.message}`);
    for (const [key, result] of Object.entries(results)) {
      if (result.status === 'pending') {
        results[key].status = 'fail';
        results[key].error = error.message;
        break;
      }
    }
  } finally {
    await browser.close();
  }

  // Print final checklist
  console.log('\n═══════════════════════════════════════');
  console.log('         PASS/FAIL CHECKLIST');
  console.log('═══════════════════════════════════════\n');
  
  for (const [step, result] of Object.entries(results)) {
    const symbol = result.status === 'pass' ? '✓' : '✗';
    const statusText = result.status.toUpperCase();
    const stepName = step.replace(/([A-Z0-9])/g, ' $1').trim();
    console.log(`${symbol} ${stepName.padEnd(35)} ${statusText}`);
  }

  const allPassed = Object.values(results).every(r => r.status === 'pass');
  console.log('\n═══════════════════════════════════════');
  console.log(`Overall: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('═══════════════════════════════════════');
}

fullFlowTest();
