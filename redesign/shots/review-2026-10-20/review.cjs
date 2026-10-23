const puppeteer = require('C:/Users/pondu/AppData/Local/Temp/claude-pptr/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');
const out = __dirname;
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
  const reports = [];
  try {
    for (const [name,width,height] of [['desktop',1440,900],['phone',390,844]]) {
      const page = await browser.newPage();
      await page.setViewport({width,height,isMobile:name==='phone',hasTouch:name==='phone'});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));
      await page.goto('file:///C:/dev/danzran.github.io/index.html',{waitUntil:'networkidle0'});
      await sleep(3500);
      const metrics = await page.evaluate(()=>({height:document.documentElement.scrollHeight,width:document.documentElement.scrollWidth,viewport:innerWidth,sections:[...document.querySelectorAll('main > section,main > footer')].map(e=>({id:e.id,y:Math.round(e.getBoundingClientRect().top+scrollY),height:Math.round(e.getBoundingClientRect().height)}))}));
      for(const id of ['hero','now','work','experience','about']) {
        await page.evaluate(id=>document.getElementById(id).scrollIntoView({behavior:'instant',block:'start'}),id);
        await sleep(1800);
        await page.screenshot({path:path.join(out,name+'-'+id+'.png')});
      }
      reports.push({name,metrics,errors});
      await page.close();
    }
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(reports,null,2));
    console.log(JSON.stringify(reports,null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
