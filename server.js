// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/generate', async (req, res) => {
  const {
    category, question, optionA, optionB, optionC, optionD,
    answer, explanation, imageUrl, hasImage
  } = req.body;

  // Determine which option is correct
  const correctA = answer === 'A';
  const correctB = answer === 'B';
  const correctC = answer === 'C';
  const correctD = answer === 'D';

  const html = `
    <!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    width: 1080px;
    height: 1920px;
    background: #1a1a2e;
    font-family: 'Segoe UI', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 50px;
    gap: 30px;
  }

  .top-badges {
    display: flex;
    gap: 16px;
    align-self: flex-start;
  }

  .badge {
    background: white;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 28px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .badge.important {
    background: white;
    color: #333;
  }

  .question-box {
    background: #fef9e0;
    border-radius: 20px;
    padding: 40px;
    width: 100%;
    font-size: 38px;
    font-weight: 700;
    color: #1a1a2e;
    line-height: 1.4;
  }

  .image-box {
    background: #fce8e8;
    border-radius: 20px;
    width: 100%;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .image-box img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .options-box {
    background: #fef9e0;
    border-radius: 20px;
    padding: 40px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .option {
    font-size: 34px;
    font-weight: 600;
    color: #1a1a2e;
    padding: 16px 20px;
    border-radius: 12px;
    background: rgba(255,255,255,0.5);
  }

  .option.correct {
    background: #c8f7c5;
    border-left: 8px solid #2ecc71;
  }

  .explanation-box {
    background: #e8f4ff;
    border-radius: 20px;
    padding: 36px;
    width: 100%;
    font-size: 30px;
    color: #1a1a2e;
    line-height: 1.5;
  }

  .explanation-box .label {
    font-weight: 800;
    font-size: 32px;
    margin-bottom: 12px;
    color: #2980b9;
  }

  .footer {
    font-size: 26px;
    color: rgba(255,255,255,0.5);
    margin-top: auto;
  }
</style>
</head>
<body>

  <div class="top-badges">
    <div class="badge">➡️ {{CATEGORY}}</div>
    <div class="badge important">🔴 IMPORTANT</div>
  </div>

  <div class="question-box">
    Q) {{QUESTION}}
  </div>

  <!-- Only shown if image question -->
  {{#if HAS_IMAGE}}
  <div class="image-box">
    <img src="{{IMAGE_URL}}" />
  </div>
  {{/if}}

  <div class="options-box">
    <div class="option {{#if CORRECT_A}}correct{{/if}}">A) {{OPTION_A}}</div>
    <div class="option {{#if CORRECT_B}}correct{{/if}}">B) {{OPTION_B}}</div>
    <div class="option {{#if CORRECT_C}}correct{{/if}}">C) {{OPTION_C}}</div>
    <div class="option {{#if CORRECT_D}}correct{{/if}}">D) {{OPTION_D}}</div>
  </div>

  <div class="explanation-box">
    <div class="label">✅ Answer: {{ANSWER}}</div>
    {{EXPLANATION}}
  </div>

  <div class="footer">Follow for daily NEETPG / INICET MCQs</div>

</body>
</html>
  `;

  const chromium = require('chrome-aws-lambda');

  const browser = await chromium.puppeteer.launch({
     args: chromium.args,
     defaultViewport: chromium.defaultViewport,
     executablePath: await chromium.executablePath,
     headless: chromium.headless,
});

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const screenshot = await page.screenshot({ type: 'png' });
  await browser.close();

  res.set('Content-Type', 'image/png');
  res.send(screenshot);
});

app.listen(3000, () => console.log('Running on port 3000'));
