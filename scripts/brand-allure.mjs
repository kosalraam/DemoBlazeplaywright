// Injects a light-grey SAP-Client watermark that fits the report width as a
// non-interactive full-page background overlay. Re-run after each generate.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
 
const indexHtml = resolve('allure-report', 'index.html');
const watermarkPath = resolve('assets', 'watermark.svg');
 
if (!existsSync(indexHtml)) {
  console.error('allure-report/index.html not found — run "allure generate" first.');
  process.exit(1);
}
 
const dataUri = `data:image/svg+xml;base64,${readFileSync(watermarkPath).toString('base64')}`;
let html = readFileSync(indexHtml, 'utf8');
 
const style = `<style id="sap-client-branding">
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 2147483000;
    pointer-events: none;
    background-image: url("${dataUri}");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 92% auto;
    opacity: 0.5;
  }
</style>`;
 
if (html.includes('id="sap-client-branding"')) {
  console.log('Branding already present in allure-report/index.html.');
} else {
  html = html.replace('</head>', `${style}\n</head>`);
  writeFileSync(indexHtml, html);
  console.log('Branded allure-report/index.html with the light-grey SAP-Client watermark.');
}
 
 