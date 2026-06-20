# Serverless HTML to PDF Service

This project is a standalone Vercel serverless function that converts an HTML string into a PDF document using headless Chrome (`puppeteer-core` and `@sparticuz/chromium`).

## How to Deploy on Vercel

1. **Import the Repository**: Go to your Vercel Dashboard, click **Add New** > **Project**, and import this repository.
2. **Environment Variables**: During the import process (or later in the project settings), add the following Environment Variable:
   - **Name**: `PDF_API_SECRET`
   - **Value**: Provide a secure, secret string (e.g., a long random string). This will be your API Key.
3. **Deploy**: Click Deploy. Vercel will build and deploy the function.

## How to Test

Once the function is deployed, you can test it using `curl`. 

Replace `<YOUR_VERCEL_DOMAIN>` with the actual domain Vercel provides (e.g., `ifcc-functions.vercel.app`), and replace `<YOUR_API_SECRET>` with the value you set for `PDF_API_SECRET`.

```bash
curl -X POST https://<YOUR_VERCEL_DOMAIN>/api/generate-pdf \
  -H "Content-Type: application/json" \
  -H "x-api-key: <YOUR_API_SECRET>" \
  -d '{"html": "<html><body><h1>Hello, World!</h1><p>This is a test PDF.</p></body></html>"}' \
  --output test_report.pdf
```

This command will send the HTML string to your serverless function and save the returned binary as `test_report.pdf` in your current directory.

## Configuration Details

- **CORS**: This function only accepts requests from the specific Netlify application (`https://workbuk.netlify.app`).
- **Memory & Timeout**: Configured in `vercel.json` to use 2048MB memory and up to 30s execution time to accommodate the headless Chrome process. (Note: These limits are dependent on your Vercel account plan).
