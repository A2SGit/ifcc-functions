import type { VercelRequest, VercelResponse } from '@vercel/node';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  const ALLOWED_ORIGIN = 'https://workbuk.netlify.app';
  
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Reject anything that isn't POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Only POST is supported.' });
    return;
  }

  // Verify API Key
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.PDF_API_SECRET;
  
  if (!expectedKey) {
    console.error('PDF_API_SECRET is not configured on the server.');
    res.status(500).json({ error: 'Server configuration error.' });
    return;
  }

  if (!apiKey || apiKey !== expectedKey) {
    res.status(401).json({ error: 'Unauthorized. Invalid or missing API key.' });
    return;
  }

  try {
    const { html } = req.body || {};

    if (!html || typeof html !== 'string') {
      res.status(400).json({ error: 'Bad Request. "html" string is required in the JSON body.' });
      return;
    }

    // Launch headless Chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Set the HTML content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate the PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true, // Respects @page CSS rules
    });

    await browser.close();

    // Send the generated PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    res.status(200).send(pdfBuffer);

  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
