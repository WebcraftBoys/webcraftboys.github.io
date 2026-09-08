import { getState } from '../core/state.js';
import { post } from '../core/api.js';
import { esc, rows, matches, formatDate, badge, dateValue, selectOptions } from '../core/utils.js';
import { modal, toast, confirmAction, formField, textarea, selectField, empty } from './ui.js';

export function pageHead(title, subtitle, button = '') {
  return `<div class="page-head"><div><div class="eyebrow">WEBCRAFT OPERATIONS</div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>${button}</div>`;
}

export function toolbar(id, placeholder, button = '') {
  return `<div class="toolbar"><input class="search-input" id="${id}-search" placeholder="${esc(placeholder)}"><div class="toolbar-actions">${button}</div></div>`;
}

export function genericTable({ id, idField = '', columns, data, searchKeys = [], actions = true, archive = true }) {
  const body = data.map(r => {
    const rid = idField ? (r[idField] ?? '') : '';
    const searchable = searchKeys.map(k => r[k] ?? '').join(' ');
    return `<tr data-row data-search="${esc(searchable)}">${columns.map(c => `<td>${c.render ? c.render(r) : esc(r[c.key] ?? '')}</td>`).join('')}${actions ? `<td class="row-actions"><button class="small-button" data-edit="${esc(rid)}" ${rid ? '' : 'disabled'}>Edit</button>${archive && rid ? `<button class="small-button danger-text" data-archive="${esc(rid)}">Archive</button>` : ''}</td>` : ''}</tr>`;
  }).join('');
  if (!body) return `<div class="card table-card">${empty('No records found.')}</div>`;
  return `<div class="card table-card"><div class="table-wrap"><table><thead><tr>${columns.map(c => `<th>${esc(c.label)}</th>`).join('')}${actions ? '<th>Actions</th>' : ''}</tr></thead><tbody id="${id}-rows">${body}</tbody></table></div></div>`;
}

export function attachSearch(id) {
  document.getElementById(`${id}-search`)?.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll(`#${id}-rows [data-row]`).forEach(row => { row.hidden = !matches({ text: row.dataset.search || '' }, q); });
  });
}

export function reload() { window.dispatchEvent(new CustomEvent('portal:reload')); }

export function formModal({ title, record = {}, fields, onSubmit, onArchive }) {
  const body = `<form id="record-form" class="form-grid">${fields.map(f => f.html(record)).join('')}</form>`;
  const root = modal({ title, body, actions: `${onArchive ? '<button class="btn danger-btn" type="button" id="archive-record">Archive</button>' : ''}<span class="spacer"></span><button class="btn" data-close>Cancel</button><button class="btn primary" type="submit" form="record-form">Save</button>` });
  root.querySelector('#record-form').addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try { await onSubmit(data); root.remove(); await reload(); }
    catch (err) { toast(err.message || 'Save failed', 'error'); }
  });
  if (onArchive) root.querySelector('#archive-record').addEventListener('click', () => confirmAction('Archive record', 'This will mark the record as archived. Continue?', async () => { try { await onArchive(); root.remove(); await reload(); } catch (e) { toast(e.message || 'Archive failed', 'error'); } }));
  return root;
}

export function optionsFromData(arr, key, current = '') { return selectOptions([...new Set(rows(arr).map(r => r[key]).filter(Boolean))], current); }
export function commonFields(schema, record) {
  return schema.map(f => {
    if (f.type === 'select') return selectField(f.label, f.name, f.options?.(record) || '', record[f.name]);
    if (f.type === 'date') return formField(f.label, f.name, dateValue(record[f.name]), 'date', f.required ? 'required' : '');
    if (f.type === 'number') return formField(f.label, f.name, record[f.name] ?? '', 'number', `${f.step ? `step="${f.step}"` : ''}${f.required ? ' required' : ''}`);
    if (f.type === 'textarea') return textarea(f.label, f.name, record[f.name]);
    return formField(f.label, f.name, record[f.name] ?? '', f.type || 'text', f.required ? 'required' : '');
  });
}
export const stateData = () => getState().data;
