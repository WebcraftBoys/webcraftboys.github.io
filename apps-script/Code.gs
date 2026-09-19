/**
 * WEBCRAFT CONTACT / LEAD CAPTURE
 *
 * Deploy this file as a Google Apps Script Web App:
 * Execute as: Me
 * Who has access: Anyone
 *
 * The script sends new enquiries to WEBCRAFT_EMAIL and also keeps
 * a lightweight lead log in a Google Sheet in the owner's Drive.
 */

const WEBCRAFT_EMAIL = 'webcraft.devwork@gmail.com';
const SHEET_NAME = 'Webcraft Leads';
const RATE_LIMIT_SECONDS = 45;

function doGet() {
  return json_({ ok: true, service: 'Webcraft contact endpoint' });
}

function doPost(e) {
  try {
    const data = normalize_(e && e.parameter ? e.parameter : {});

    // Honeypot: bots that fill this hidden field are silently rejected.
    if (data.website_check) return json_({ ok: false, ignored: true });

    if (!data.name || !data.email || !data.phone || !data.project || !data.timeline || !data.message) {
      return json_({ ok: false, error: 'Missing required fields.' });
    }

    if (!isValidEmail_(data.email)) {
      return json_({ ok: false, error: 'Invalid email address.' });
    }

    const phoneDigits = data.phone.replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return json_({ ok: false, error: 'Invalid phone number.' });
    }

    if (data.message.length < 20 || data.message.length > 10000) {
      return json_({ ok: false, error: 'Project details are invalid.' });
    }

    // Lightweight per-email throttle. This is deliberately not treated as a security boundary.
    const cache = CacheService.getScriptCache();
    const rateKey = 'lead:' + Utilities.base64EncodeWebSafe(data.email.toLowerCase()).slice(0, 100);
    if (cache.get(rateKey)) {
      return json_({ ok: false, error: 'Please wait a little before sending another enquiry.' });
    }
    cache.put(rateKey, '1', RATE_LIMIT_SECONDS);

    const leadId = Utilities.getUuid().split('-')[0].toUpperCase();
    const submittedAt = new Date();

    appendLead_(leadId, submittedAt, data);
    sendOwnerEmail_(leadId, submittedAt, data);
    sendClientConfirmation_(leadId, data);

    return json_({ ok: true, leadId: leadId });
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return json_({ ok: false, error: 'Server error. Please try again.' });
  }
}

function normalize_(raw) {
  const clean = value => String(raw[value] || '').trim().slice(0, 10000);
  return {
    name: clean('name'),
    email: clean('email').toLowerCase(),
    phone: clean('phone'),
    project: clean('project'),
    timeline: clean('timeline'),
    website: clean('website'),
    source: clean('source'),
    message: clean('message'),
    website_check: clean('website_check')
  };
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function appendLead_(leadId, submittedAt, data) {
  const props = PropertiesService.getScriptProperties();
  let spreadsheetId = props.getProperty('LEADS_SPREADSHEET_ID');
  let spreadsheet;

  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('LEADS_SPREADSHEET_ID', spreadsheet.getId());
  }

  let sheet = spreadsheet.getSheets()[0];
  if (sheet.getName() !== 'Leads') sheet.setName('Leads');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Lead ID', 'Submitted At', 'Status', 'Name', 'Email', 'Phone',
      'Project', 'Timeline', 'Current Website', 'Source', 'Project Details'
    ]);
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    leadId,
    submittedAt,
    'New',
    data.name,
    data.email,
    data.phone,
    data.project,
    data.timeline,
    data.website,
    data.source,
    data.message
  ]);
}

function sendOwnerEmail_(leadId, submittedAt, data) {
  const subject = `New Webcraft enquiry — ${data.name} [${leadId}]`;
  const plain = [
    'New website enquiry received.',
    '',
    `Lead ID: ${leadId}`,
    `Submitted: ${submittedAt.toLocaleString()}`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Project: ${data.project}`,
    `Timeline: ${data.timeline}`,
    `Current website: ${data.website || 'Not provided'}`,
    `Source: ${data.source || 'Not provided'}`,
    '',
    'Project details:',
    data.message
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#202421;max-width:680px">
      <h2 style="margin-bottom:8px">New Webcraft enquiry</h2>
      <p style="color:#68716b">Lead ID: <strong>${escapeHtml_(leadId)}</strong></p>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
        ${row_('Name', data.name)}
        ${row_('Email', `<a href="mailto:${escapeHtml_(data.email)}">${escapeHtml_(data.email)}</a>`)}
        ${row_('Phone', escapeHtml_(data.phone))}
        ${row_('Project', escapeHtml_(data.project))}
        ${row_('Timeline', escapeHtml_(data.timeline))}
        ${row_('Current website', data.website ? `<a href="${escapeHtml_(data.website)}">${escapeHtml_(data.website)}</a>` : 'Not provided')}
        ${row_('Source', escapeHtml_(data.source || 'Not provided'))}
      </table>
      <h3>Project details</h3>
      <div style="white-space:pre-wrap;background:#f5f6f3;padding:16px;border-radius:10px">${escapeHtml_(data.message)}</div>
    </div>`;

  GmailApp.sendEmail(WEBCRAFT_EMAIL, subject, plain, {
    htmlBody: html,
    replyTo: data.email,
    name: 'Webcraft Website'
  });
}

function sendClientConfirmation_(leadId, data) {
  const subject = 'We received your Webcraft enquiry';
  const plain = [
    `Hi ${data.name},`,
    '',
    'Thanks for reaching out to Webcraft. We have received your project enquiry.',
    `Your reference is ${leadId}.`,
    '',
    'We will review the details and get back to you within 1–2 business days.',
    '',
    '— Webcraft'
  ].join('\n');

  GmailApp.sendEmail(data.email, subject, plain, {
    htmlBody: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#202421;max-width:620px"><h2>Thanks for reaching out.</h2><p>Hi ${escapeHtml_(data.name)},</p><p>We have received your Webcraft project enquiry.</p><p>Your reference is <strong>${escapeHtml_(leadId)}</strong>.</p><p>We'll review the details and get back to you within 1–2 business days.</p><p>— Webcraft</p></div>`,
    name: 'Webcraft'
  });
}

function row_(label, value) {
  return `<tr><td style="border-bottom:1px solid #e7e9e6;font-weight:bold;width:170px">${escapeHtml_(label)}</td><td style="border-bottom:1px solid #e7e9e6">${value}</td></tr>`;
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
