WEBCRAFT — WEBSITE / PROFESSIONAL PASS 2
=========================================

A production-minded static marketing website for Webcraft.

Included:
- Homepage positioning, service discovery and project planner
- Services, Work, Process, About, Contact and FAQ pages
- Responsive navigation with active-page state
- Project filters with live result count and empty state
- Accessible case-study modal with focus handling
- Contact enquiry form with validation, anti-bot honeypot and Google Apps Script submission
- Scroll progress and back-to-top controls
- Reduced-motion support and keyboard accessibility
- SEO metadata, canonical URLs, structured data, robots.txt and sitemap.xml
- Custom 404 page
- Optimized WebP logo + favicon
- Internal dashboard marked noindex/nofollow (authentication is still required for real security)

IMPORTANT PRODUCTION CHECKS:
1. Confirm the deployed domain if it differs from https://webcraftboys.github.io/ and update canonical URLs, sitemap and structured data.
2. Protect /pages/dashboard/ with real authentication/authorization before using it for private client/team data.
3. Verify the Google Apps Script endpoint, permissions and spam controls.
4. Add final social profiles/OG artwork when those assets are ready.
5. Run Lighthouse/PageSpeed after deployment and test the form on the production domain.

CONTACT FORM CONNECTION
-----------------------
The contact form is prepared for Google Apps Script. See apps-script/SETUP.md.
Set the deployed Apps Script `/exec` URL in js/contact-config.js before publishing.
The endpoint sends enquiries to webcraft.devwork@gmail.com and logs leads to a Google Sheet.
