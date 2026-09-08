import { CONFIG } from '../config/config.js';
import { normalize } from './utils.js';

async function request(url, options = {}) {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: { Accept: 'application/json', ...(options.headers || {}) }
  });
  let payload;
  try { payload = await response.json(); }
  catch { throw new Error(`CRM API returned invalid JSON (HTTP ${response.status})`); }
  if (!response.ok) throw new Error(`CRM API returned HTTP ${response.status}`);
  if (payload?.success === false) throw new Error(payload.error || payload.message || 'CRM API request failed');
  return payload;
}

export function get(action) {
  return request(`${CONFIG.CRM_API_URL}?action=${encodeURIComponent(action)}`);
}

export function post(action, body = {}) {
  return request(CONFIG.CRM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...body })
  });
}

export async function getAll() {
  const [customers, websites, tasks, contacts, services, customerServices, team, activity] =
    await Promise.all([
      get('customers'), get('websites'), get('tasks'), get('contacts'),
      get('services'), get('customer-services'), get('team'), get('activity')
    ]);

  return {
    customers: normalize(customers),
    websites: normalize(websites),
    tasks: normalize(tasks),
    contacts: normalize(contacts),
    services: normalize(services),
    customerServices: normalize(customerServices),
    team: normalize(team),
    activity: normalize(activity)
  };
}
