const puppeteer = require('puppeteer');

async function testVercelFlow() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    startSession: { status: 'pending', error: null },
    moveToSecurityRoom: { status: 'pending', error: null },
    collectEvidence: { status: 'pending', error: null },
    askNPC: { status: 'pending', error: null },
    no500BlockingAsk: { status: 'pending', error: null },
    pageUsableAfterAsk: { status: 'pending', error: null },
    adminPageUsable: { status: 'pending', error: null }
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    let has500Error = false;
    page.on('response', response => {
      if (response.status() === 500) {
        has500Error = true;
      }
    });

    await page.goto('https://personal-project-game.vercel.app', { 
      waitUntil: 'networkidle2', 
      timeout: 15000 
    });
    await new Promise(resolve => setTimeout(resolve, 1500));

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startButton = buttons.find(btn => btn.textContent.includes('Start Session'));
      if (startButton) startButton.click();
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let bodyText = await page.evaluate(() => document.body.innerText);
    results.startSession.status = bodyText.includes('Turns Left') ? 'pass' : 'fail';

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const securityButton = buttons.find(btn => btn.textContent.includes('Security Room'));
      if (securityButton) securityButton.click();
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    bodyText = await page.evaluate(() => document.body.innerText);
    const hasSecurityEvidence = bodyText.includes('Broken sensor') || 
                                 bodyText.includes('Night shift');
    results.moveToSecurityRoom.status = hasSecurityEvidence ? 'pass' : 'fail';

    const beforeCollectMatch = bodyText.match(/Collected:\s*(\d+)/);
    const beforeCollect = beforeCollectMatch ? parseInt(beforeCollectMatch[1]) : 0;
    
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
    const afterCollectMatch = bodyText.match(/Collected:\s*(\d+)/);
    const afterCollect = afterCollectMatch ? parseInt(afterCollectMatch[1]) : 0;
    results.collectEvidence.status = afterCollect > beforeCollect ? 'pass' : 'fail';

    has500Error = false;
    
    await page.type('input', 'What happened around 22:14?');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const askButton = buttons.find(btn => btn.textContent.trim() === 'Ask');
      if (askButton) askButton.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    bodyText = await page.evaluate(() => document.body.innerText);
    
    results.no500BlockingAsk.status = !has500Error ? 'pass' : 'fail';
    results.no500BlockingAsk.error = has500Error ? '500 error occurred' : null;
    
    const canClickButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.length > 5 && buttons.some(b => !b.disabled);
    });
    results.pageUsableAfterAsk.status = canClickButtons ? 'pass' : 'fail';
    
    results.askNPC.status = !has500Error ? 'pass' : 'fail';

    await page.goto('https://personal-project-game.vercel.app/admin', { 
      waitUntil: 'networkidle2', 
      timeout: 15000 
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    bodyText = await page.evaluate(() => document.body.innerText);
    const hasAdminContent = bodyText.includes('Admin Metrics') || 
                            bodyText.includes('Total events');
    const notLoginPage = !bodyText.includes('Log in to Vercel');
    results.adminPageUsable.status = (hasAdminContent && notLoginPage) ? 'pass' : 'fail';

  } catch (error) {
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

  console.log('═══════════════════════════════════════');
  console.log('     VERCEL DEPLOYMENT FLOW TEST');
  console.log('═══════════════════════════════════════\n');
  
  for (const [step, result] of Object.entries(results)) {
    const symbol = result.status === 'pass' ? '✓' : '✗';
    const statusText = result.status.toUpperCase().padEnd(7);
    const stepName = step.replace(/([A-Z])/g, ' $1').trim();
    console.log(`${symbol} ${stepName.padEnd(35)} ${statusText}${result.error ? ` - ${result.error}` : ''}`);
  }

  const allPassed = Object.values(results).every(r => r.status === 'pass');
  console.log('\n═══════════════════════════════════════');
  console.log(`Overall: ${allPassed ? '✅ PASS' : '⚠️  PARTIAL'}`);
  console.log('═══════════════════════════════════════');
}

testVercelFlow();
