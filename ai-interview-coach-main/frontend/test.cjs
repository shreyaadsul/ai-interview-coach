const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER_ERROR:', error.message));
  
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  await page.goto('http://localhost:5173/');
  await wait(2000);
  await page.screenshot({ path: 'step1_home.png' });
  
  const loginButton = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Login'));
  });
  
  if (loginButton && loginButton.click) {
    console.log('Found Login button, clicking...');
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) await emailInput.type('test@example.com');
    const nameInput = await page.$('input[type="text"]');
    if (nameInput) await nameInput.type('Test User');
    
    await loginButton.click();
    await wait(2000);
    await page.screenshot({ path: 'step2_logged_in.png' });
  }

  const startBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Start New Interview') || el.textContent.includes('New Interview'));
  });
  
  if (startBtn && startBtn.click) {
    console.log('Found Start New Interview button, clicking...');
    await startBtn.click();
    await wait(2000);
    await page.screenshot({ path: 'step3_modal.png' });
    
    const modalStart = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Start Interview'));
    });
    if (modalStart && modalStart.click) {
      console.log('Found Start Interview inside modal, clicking...');
      await modalStart.click();
      await wait(5000); // Wait for generation
      await page.screenshot({ path: 'step4_briefing.png' });
      
      const beginBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Begin Interview') || el.textContent.includes('Start'));
      });
      if (beginBtn && beginBtn.click) {
        console.log('Found Begin Interview, clicking...');
        await beginBtn.click();
        await wait(6000); 
        await page.screenshot({ path: 'step5_mock_interview.png' });
        console.log('Mock interview page reached.');
      } else {
        console.log('Could not find Begin Interview button.');
      }
    } else {
      console.log('Could not find Start Interview inside modal.');
    }
  } else {
    console.log('Could not find Start New Interview button.');
  }

  await browser.close();
})();
