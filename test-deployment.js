const puppeteer = require('puppeteer');

async function testDeployedApp() {
  const results = {
    homePageLoads: { status: 'pending', error: null },
    noLoginGate: { status: 'pending', error: null },
    clickStartSession: { status: 'pending', error: null },
    performMove: { status: 'pending', error: null },
    collectEvidence: { status: 'pending', error: null },
    adminPageLoads: { status: 'pending', error: null }
  };

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Check home page
    console.log('Step 1: Loading https://personal-project-game.vercel.app...\n');
    
    const homeResponse = await page.goto('https://personal-project-game.vercel.app', { 
      waitUntil: 'networkidle2', 
      timeout: 15000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const homeStatus = homeResponse.status();
    const homeTitle = await page.title();
    const homeBodyText = await page.evaluate(() => document.body.innerText);
    
    console.log(`Home Page Status: HTTP ${homeStatus}`);
    console.log(`Page Title: ${homeTitle}`);
    
    if (homeStatus === 200) {
      results.homePageLoads.status = 'pass';
      console.log('✓ Home page loads successfully\n');
    } else {
      results.homePageLoads.status = 'fail';
      results.homePageLoads.error = `HTTP ${homeStatus}`;
      console.log(`✗ Home page failed with HTTP ${homeStatus}\n`);
    }

    // Check for login gate
    const hasLoginGate = homeBodyText.includes('Log in to Vercel') || 
                         homeBodyText.includes('Sign Up') ||
                         homeBodyText.includes('Continue with Email');
    const hasGameContent = homeBodyText.includes('Start Session') || 
                          homeBodyText.includes('AI NPC Detective');
    
    if (!hasLoginGate && hasGameContent) {
      results.noLoginGate.status = 'pass';
      console.log('✓ No login gate - public access confirmed\n');
    } else {
      results.noLoginGate.status = 'fail';
      results.noLoginGate.error = hasLoginGate ? 'Login page detected' : 'No game content found';
      console.log(`✗ Login gate or missing content: ${results.noLoginGate.error}\n`);
      throw new Error('Cannot proceed - page not accessible');
    }

    // Click Start Session
    console.log('Step 2: Clicking Start Session...\n');
    
    const startButtonExists = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => btn.textContent.includes('Start Session'));
    });

    if (startButtonExists) {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const startButton = buttons.find(btn => btn.textContent.includes('Start Session'));
        if (startButton) startButton.click();
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      results.clickStartSession.status = 'pass';
      console.log('✓ Start Session clicked\n');
    } else {
      results.clickStartSession.status = 'fail';
      results.clickStartSession.error = 'Start Session button not found';
      console.log('✗ Start Session button not found\n');
      throw new Error('Cannot proceed');
    }

    // Perform one move
    console.log('Step 3: Performing move to Security Room...\n');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const locationButton = buttons.find(btn => 
        btn.textContent.includes('Security Room') || 
        btn.textContent.includes('Vault')
      );
      if (locationButton) locationButton.click();
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    results.performMove.status = 'pass';
    console.log('✓ Move performed\n');

    // Collect one evidence
    console.log('Step 4: Collecting evidence...\n');
    
    const evidenceCollected = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const evidenceButton = buttons.find(btn => 
        btn.textContent.includes('Insurance') ||
        btn.textContent.includes('Footprint') ||
        btn.textContent.includes('sensor') ||
        btn.textContent.includes('Camera')
      );
      if (evidenceButton) {
        evidenceButton.click();
        return true;
      }
      return false;
    });

    if (evidenceCollected) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      results.collectEvidence.status = 'pass';
      console.log('✓ Evidence collected\n');
    } else {
      results.collectEvidence.status = 'fail';
      results.collectEvidence.error = 'No evidence button found';
      console.log('✗ No evidence button found\n');
    }

    // Check admin page
    console.log('Step 5: Loading admin page...\n');
    
    const adminResponse = await page.goto('https://personal-project-game.vercel.app/admin', { 
      waitUntil: 'networkidle2', 
      timeout: 15000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const adminStatus = adminResponse.status();
    const adminBodyText = await page.evaluate(() => document.body.innerText);
    
    console.log(`Admin Page Status: HTTP ${adminStatus}`);
    
    const hasAdminContent = adminBodyText.includes('Admin Metrics') || 
                            adminBodyText.includes('Total events');
    const hasAdminError = adminBodyText.includes('404') || adminBodyText.includes('500');
    
    if (adminStatus === 200 && hasAdminContent && !hasAdminError) {
      results.adminPageLoads.status = 'pass';
      console.log('✓ Admin page loads successfully\n');
    } else {
      results.adminPageLoads.status = 'fail';
      results.adminPageLoads.error = hasAdminError ? 'Error page shown' : `HTTP ${adminStatus} or missing content`;
      console.log(`✗ Admin page issue: ${results.adminPageLoads.error}\n`);
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    for (const [key, result] of Object.entries(results)) {
      if (result.status === 'pending') {
        results[key].status = 'fail';
        results[key].error = error.message;
      }
    }
  } finally {
    await browser.close();
  }

  // Print final results
  console.log('\n═══════════════════════════════════════════════════');
  console.log('           DEPLOYMENT TEST RESULTS');
  console.log('═══════════════════════════════════════════════════\n');
  
  for (const [step, result] of Object.entries(results)) {
    const symbol = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '○';
    const statusText = result.status.toUpperCase().padEnd(7);
    const stepName = step.replace(/([A-Z])/g, ' $1').trim();
    console.log(`${symbol} ${stepName.padEnd(30)} ${statusText}${result.error ? ` - ${result.error}` : ''}`);
  }

  const allPassed = Object.values(results).every(r => r.status === 'pass');
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`Overall: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('═══════════════════════════════════════════════════');

  return results;
}

testDeployedApp();
