// Renders public/interview/ at 390px and 1280px into docs/interview-screens/. Run scripts/interview-stub.mjs and a static server on 5190 first.
const path = require('path')
const { chromium } = require('/home/robbe/.npm-global/lib/node_modules/playwright')
const EX = '/home/robbe/.cache/ms-playwright/chromium_headless_shell-1234/chrome-linux/headless_shell'
const OUT = path.join(__dirname, '..', 'docs', 'interview-screens') + '/'
const URL = 'http://localhost:5190/interview/?api=http://localhost:8790#' + 'T'.repeat(43)
;(async () => {
  const b = await chromium.launch({ executablePath: EX, args: ['--no-sandbox'] })
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage(); page.on('pageerror', (e) => console.log('PAGEERR', e.message))
  const shot = async (n, full) => { await page.waitForTimeout(500); await page.screenshot({ path: OUT + n + '.png', fullPage: !!full }); console.log('shot', n) }
  { const w = await b.newContext({ viewport: { width: 1280, height: 800 } }); const p0 = await w.newPage(); await p0.goto(URL); await p0.waitForSelector('#go'); await p0.screenshot({ path: OUT + '09-desktop-welcome.png' }); await p0.click('#go'); await p0.waitForSelector('#answer'); await p0.screenshot({ path: OUT + '10-desktop-question.png' }); console.log('shot 09, 10 desktop'); await w.close() }
  await page.goto(URL); await page.waitForSelector('#go'); await shot('01-welcome', true)
  await page.click('#go'); await page.waitForSelector('#answer'); await shot('02-question')
  await page.fill('#answer', 'Portaul is a privacy-first app that helps you test regularly and tell partners safely. I’m a doctor, and I started it after years in sexual health clinics.')
  await page.click('#next'); await page.waitForSelector('#answer'); await page.waitForTimeout(400)
  console.log('on question:', await page.locator('.label').first().innerText())
  await page.fill('#answer', 'A friend found out about an exposure three weeks late, by text, from someone who was too scared to ring him. I thought there has to be a kinder way to tell someone, and a quicker one.')
  await page.click('#next'); await page.waitForSelector('#fu'); await shot('03-follow-up', true)
  await page.fill('#fu', 'He opens the app, chooses who to tell, and they get a notice with what to do next. No names unless he wants them.')
  await page.click('#next'); await page.waitForSelector('#answer'); await shot('04-question-3')
  await page.click('#skip'); await page.waitForTimeout(500)
  for (let i = 3; i < 8; i++) { await page.waitForSelector('#answer'); await page.click('#skip'); await page.waitForTimeout(350) }
  await page.waitForSelector('#send'); await shot('05-review', true)
  await page.fill('#bio', 'Dr Doyinsola Kuku, founder of Portaul'); await page.click('#send'); await page.waitForTimeout(900); await shot('06-sent', true)
  await page.goto('http://localhost:5190/interview/?api=http://localhost:8790#' + 'BADBAD' + 'T'.repeat(37)); await page.reload(); await page.waitForTimeout(900); await shot('07-bad-link')
  const wide = await b.newContext({ viewport: { width: 1280, height: 800 } }); const p2 = await wide.newPage()
  await p2.goto(URL); await p2.waitForTimeout(1200); await p2.screenshot({ path: OUT + '08-desktop-sent.png' }); console.log('shot 08-desktop-sent')
  await b.close()
  // a second browser, before anything is answered, for the desktop question screen (restart the stub first for a clean state)

})()
