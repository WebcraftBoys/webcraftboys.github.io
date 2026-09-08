# Webcraft Operations Portal — Proper V1

This package is a rebuilt modular portal using the known-good connected Webcraft portal as the UI/behavior baseline.

## Architecture
- Supabase: authentication only.
- Google Apps Script: CRM API and business rules.
- Google Sheets: CRM data store.
- Frontend: ES modules; `app.js` is only the application bootstrap/router.

## Portal modules
Dashboard, Customers, Websites, Tasks, Contacts, Services, Customer Services, Team, Maintenance, Website Health, Activity Log, Reports, Settings.

CRUD is exposed for the CRM sheets with reusable forms, search, edit and archive actions. Website Health and Maintenance have live actions. Dashboard and Reports are computed from live CRM data.

## Backend deployment
1. Open the existing Apps Script project attached to the CRM spreadsheet.
2. Keep the existing files such as `01_Config.gs`, `04_IDs.gs`, `05_Validation.gs`, `07_Automation.gs`, `08_WebsiteHealth.gs`, `10_Maintanance.gs`, `11_Drive.gs`, `12_ActivityLog.gs`.
3. Back up the current `13_API.gs`.
4. Replace `13_API.gs` with `backend/13_API_Portal.gs` (you can rename it to `13_API.gs`).
5. Deploy as Web App: Execute as you, access Anyone, then use the resulting `/exec` URL in `js/config/config.js`.
6. Keep the Supabase project configured with public signup disabled.

## Frontend deployment
Upload the contents of this folder to the private GitHub repository and deploy the static site to Cloudflare Pages/Workers. Do not make the repository public.

## Important security note
The current Apps Script Web App endpoint is publicly reachable. Supabase login protects the portal UI, but the Apps Script endpoint itself is not yet validating the Supabase JWT. Before broad production rollout, add server-side authentication/authorization (for example, a Cloudflare Worker proxy that validates the Supabase session and forwards only authorized requests).

## Test order
1. Open portal and sign in.
2. Confirm Dashboard loads real CRM data.
3. Customers: create → refresh → edit → archive.
4. Websites: create/edit and run health check.
5. Tasks/Contacts/Services/Customer Services/Team: create/edit/archive and verify Sheets.
6. Maintenance: recalculate and verify P/Q/AB.
7. Activity: verify CREATE/UPDATE/ARCHIVE/HEALTH events.
8. Reports: verify counts against Sheets.


V2 fixes: API fetches each collection directly; normalize imported; customer table has correct ID binding; generic table action binding hardened.
