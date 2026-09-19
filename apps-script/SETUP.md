# Webcraft Contact Form — Google Apps Script Setup

This connects the Webcraft website contact form to `webcraft.devwork@gmail.com` and creates a Google Sheet lead log in the Google account that owns the script.

## 1. Create the Apps Script project

1. Sign in to the Google account that owns `webcraft.devwork@gmail.com`.
2. Open Google Apps Script and create a new standalone project.
3. Replace the default `Code.gs` with the contents of `apps-script/Code.gs` from this folder.
4. If desired, open **Project Settings** and use the included `appsscript.json` values (timezone: `Asia/Kolkata`, V8 runtime).

## 2. Authorize it once

In the Apps Script editor, save the project and run `doGet` once.
Google will ask you to authorize access to Gmail/Drive/Sheets. Approve it while signed into the Webcraft account.

The script needs those permissions because it sends the enquiry email and creates/updates the lead spreadsheet.

## 3. Deploy as a Web App

Use **Deploy → New deployment**.

Choose:

- **Type:** Web app
- **Execute as:** Me (the account that owns the Webcraft Gmail)
- **Who has access:** Anyone

Deploy it and copy the generated Web app URL ending in `/exec`.

## 4. Put the URL into the website

Open:

`js/contact-config.js`

Replace:

`PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`

with the Web app URL.

Example format:

`https://script.google.com/macros/s/XXXXXXXXXXXX/exec`

Do not add quotes around the URL beyond the existing JavaScript quotes.

## 5. Push the website to GitHub

Commit and push the updated project. GitHub Pages will then serve the form using the Apps Script endpoint.

## What happens after setup

When a visitor submits the form:

1. The website validates the form.
2. Google Apps Script receives the submission.
3. A new lead is added to a Google Sheet called **Webcraft Leads** in the script owner's Drive.
4. A detailed notification is sent to `webcraft.devwork@gmail.com`.
5. The visitor receives an acknowledgement email from Webcraft.

The sheet contains:

- Lead ID
- Submitted time
- Status (`New` initially)
- Name
- Email
- Phone
- Project type
- Timeline
- Current website
- Source
- Project details

## Important security notes

- Never put your Gmail password or App Password into the website JavaScript.
- The Apps Script URL is intentionally public because the website needs to submit to it; the server-side validation, honeypot and rate limit provide basic abuse controls.
- The lead spreadsheet remains in the Google account that owns the Apps Script.
- If you change the Apps Script code after deployment, create/update the deployment so the live web app uses the new version.
