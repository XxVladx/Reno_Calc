// 0.4.8 contractor-only cost analysis; never referenced by quote() or printed markup.
function validMargin(v) { const n = Number(v); return Number.isFinite(n) && n >= 0 && n < 100 ? n : 30 }
function marginValue() { return validMargin(document.getElementById('targetMargin')?.value) }
const costWords = { en: { title: 'Internal cost & profit calculator', help: 'Contractor-only information. Costs and profit never appear in the client estimate preview or printed PDF. JSON backups contain these values: keep backups private.', margin: 'Target gross profit margin (%)', description: 'Work item', material: 'Material cost / unit', labor: 'Labor cost / unit', qty: 'Qty', cost: 'Total cost', suggested: 'Suggested unit selling price', materials: 'Materials', labors: 'Labor', all: 'Total direct costs', revenue: 'Estimate subtotal (before taxes)', profit: 'Estimated gross profit', actual: 'Actual gross margin', recommended: 'Suggested subtotal at target margin', caution: 'Gross profit excludes overhead, income taxes, financing, and any costs not entered above. Client tax amounts are excluded.', apply: 'Apply suggested unit prices', unnamed: 'Item' }, fr: { title: 'Calcul interne des coûts et du profit', help: 'Informations réservées à l’entrepreneur. Les coûts et le profit ne figurent jamais dans l’aperçu du devis client ni dans le PDF imprimé. Les sauvegardes JSON contiennent ces valeurs : conservez-les en lieu sûr.', margin: 'Marge bénéficiaire brute cible (%)', description: 'Travail', material: 'Coût des matériaux / unité', labor: 'Coût de main-d’œuvre / unité', qty: 'Qté', cost: 'Coût total', suggested: 'Prix de vente unitaire suggéré', materials: 'Matériaux', labors: 'Main-d’œuvre', all: 'Coûts directs totaux', revenue: 'Sous-total du devis (avant taxes)', profit: 'Profit brut estimé', actual: 'Marge brute réelle', recommended: 'Sous-total suggéré selon la marge cible', caution: 'Le profit brut exclut les frais généraux, les impôts sur le revenu, le financement et tout coût non saisi. Les taxes du client sont exclues.', apply: 'Appliquer les prix unitaires suggérés', unnamed: 'Poste' } };
function costT(key) { return costWords[document.getElementById('lang').value === 'fr' ? 'fr' : 'en'][key] }
function translateCosts() { const ids = { costTitle: 'title', costHelp: 'help', marginLabel: 'margin', costDescription: 'description', costMaterial: 'material', costLabor: 'labor', costQty: 'qty', costTotal: 'cost', costSuggested: 'suggested', costMaterialsLabel: 'materials', costLaborLabel: 'labors', costAllLabel: 'all', costRevenueLabel: 'revenue', costProfitLabel: 'profit', costMarginActualLabel: 'actual', costRecommendedLabel: 'recommended', costCaution: 'caution', applySuggested: 'apply' }; for (const [id, k] of Object.entries(ids)) { const el = document.getElementById(id); if (el) el.textContent = costT(k) } }
function renderCostRows() { const tbody = document.getElementById('costRows'); if (!tbody) return; const active = document.activeElement; const focused = active?.dataset?.costIndex !== undefined ? { index: active.dataset.costIndex, field: active.dataset.costField, start: active.selectionStart } : null; tbody.replaceChildren(); let materials = 0, labors = 0, recommended = 0; const m = marginValue(); items.forEach((r, i) => { const q = num(r.qty), mc = num(r.materialCost), lc = num(r.laborCost), cost = mc + lc, suggested = cost / (1 - m / 100); materials += q * mc; labors += q * lc; recommended += q * suggested; const tr = document.createElement('tr'); const desc = document.createElement('td'); desc.textContent = r.description || costT('unnamed') + ' ' + (i + 1); tr.append(desc); for (const [field, value] of [['materialCost', mc], ['laborCost', lc]]) { const td = document.createElement('td'), inp = document.createElement('input'); inp.type = 'number'; inp.min = '0'; inp.step = '0.01'; inp.value = value; inp.dataset.costIndex = String(i); inp.dataset.costField = field; inp.setAttribute('aria-label', costT(field === 'materialCost' ? 'material' : 'labor') + ' ' + (i + 1)); inp.disabled = isLocked(); inp.oninput = () => { r[field] = num(inp.value); queueDraft(); updateCostTotals() }; td.append(inp); tr.append(td) } for (const value of [q, money(q * cost), money(suggested)]) { const td = document.createElement('td'); td.textContent = value; tr.append(td) } tbody.append(tr) }); updateCostTotals(); if (focused) { const input = tbody.querySelector('[data-cost-index="' + focused.index + '"][data-cost-field="' + focused.field + '"]'); if (input) { input.focus(); if (Number.isInteger(focused.start)) try { input.setSelectionRange(focused.start, focused.start) } catch (e) { } } } }
function updateCostTotals() { let materials = 0, labors = 0, suggested = 0; const m = marginValue(); for (const r of items) { const q = num(r.qty), mc = num(r.materialCost), lc = num(r.laborCost); materials += q * mc; labors += q * lc; suggested += q * (mc + lc) / (1 - m / 100) } const direct = materials + labors, revenue = calc().subtotal, profit = revenue - direct, actual = revenue > 0 ? 100 * profit / revenue : null; const values = { costMaterialsValue: money(rnd(materials)), costLaborValue: money(rnd(labors)), costAllValue: money(rnd(direct)), costRevenueValue: money(revenue), costProfitValue: money(rnd(profit)), costMarginActualValue: actual === null ? '—' : actual.toFixed(2) + '%', costRecommendedValue: money(rnd(suggested)) }; for (const [id, v] of Object.entries(values)) document.getElementById(id).textContent = v; document.getElementById('costProfitValue').style.color = profit < 0 ? '#ad3030' : '' }
const $ = id => document.getElementById(id), texts = { en: { settings: 'Company & tax settings', company: 'Company', email: 'Business email', phone: 'Business phone', address: 'Business address', clientContact: 'Client contact / address', notesTitle: 'Notes and conditions', country: 'Country', region: 'Province / state', tax1: 'Tax 1 name', rate1: 'Tax 1 rate (%)', tax2: 'Tax 2 name', rate2: 'Tax 2 rate (%)', currency: 'Currency', logo: 'Company logo', taxHelp: 'Enter verified tax rates manually. These settings are saved on this device for future estimates.', saveSettings: 'Save settings', estimate: 'Estimate', client: 'Client', project: 'Project', quoteNo: 'Estimate number', date: 'Date', items: 'Work items', description: 'Description', unit: 'Unit', qty: 'Qty', price: 'Unit price', amount: 'Amount', add: 'Add Materials', subtotal: 'Subtotal', total: 'Total', notes: 'Notes', paymentSchedule: 'Payment Schedule', pdf: 'Print / Save PDF', save: 'Save project', load: 'Open project', local: 'Prototype: project files are saved locally; no account or payment system yet.', disclaimerTitle: 'Tax disclaimer & acknowledgment', disclaimer1: 'Reno Calc calculates estimates using tax rates entered by the user. Applicable taxes depend on location and the type of renovation work.', disclaimer2: 'You are responsible for verifying applicable tax rates, tax treatment and all calculations before issuing an estimate. Reno Calc does not provide tax or legal advice and does not guarantee the accuracy of user-entered rates.', disclaimer3: 'Your tax settings are saved on this device and reused in future estimates until you change them.', accept: 'I understand and accept responsibility for verifying taxes and reviewing estimates before issuing them.', continue: 'Accept & start', signature: 'Client signature', taxNote: 'Taxes must be verified by the issuer.', quoteTitle: 'Renovation estimate', projectsTitle: 'Saved projects', newProject: 'New estimate', saveLocal: 'Save to this device', openLocal: 'Open selected', deleteLocal: 'Delete selected', localWarning: 'Projects saved on this device can be lost if browser data is cleared. Export a JSON backup for safekeeping.', selectProject: 'Select a saved project', saved: 'Project saved on this device.', opened: 'Project opened.', deleted: 'Project deleted.', confirmDelete: 'Delete the selected project?', noProject: 'Select a project first.', confirmNew: 'Start a new estimate? Unsaved changes will be lost.', storageError: 'Unable to save. Browser storage may be full or disabled.', invalidProject: 'Invalid project file.' }, fr: { settings: 'Entreprise et paramètres fiscaux', company: 'Entreprise', email: 'Courriel de l’entreprise', phone: 'Téléphone de l’entreprise', address: 'Adresse de l’entreprise', clientContact: 'Coordonnées / adresse du client', notesTitle: 'Notes et conditions', country: 'Pays', region: 'Province / État', tax1: 'Nom de la taxe 1', rate1: 'Taux de la taxe 1 (%)', tax2: 'Nom de la taxe 2', rate2: 'Taux de la taxe 2 (%)', currency: 'Devise', logo: 'Logo de l’entreprise', taxHelp: 'Saisissez manuellement les taux vérifiés. Ces paramètres sont conservés sur cet appareil pour les prochains devis.', saveSettings: 'Enregistrer les paramètres', estimate: 'Devis', client: 'Client', project: 'Projet', quoteNo: 'Numéro de devis', date: 'Date', items: 'Travaux', description: 'Description', unit: 'Unité', qty: 'Qté', price: 'Prix unitaire', amount: 'Montant', add: 'Ajouter des matériaux', subtotal: 'Sous-total', total: 'Total', notes: 'Notes', paymentSchedule: 'Calendrier des paiements', pdf: 'Imprimer / Enregistrer PDF', save: 'Enregistrer le projet', load: 'Ouvrir un projet', local: 'Prototype : les fichiers sont enregistrés localement; les comptes et paiements ne sont pas encore disponibles.', disclaimerTitle: 'Avis fiscal et reconnaissance', disclaimer1: 'Reno Calc calcule les devis à partir des taux de taxe saisis par l’utilisateur. Les taxes applicables dépendent du lieu et du type de travaux.', disclaimer2: 'Vous devez vérifier les taux et le traitement fiscal applicables ainsi que tous les calculs avant de remettre un devis. Reno Calc ne fournit aucun conseil fiscal ou juridique et ne garantit pas l’exactitude des taux saisis.', disclaimer3: 'Vos paramètres fiscaux sont conservés sur cet appareil et réutilisés pour les prochains devis jusqu’à leur modification.', accept: 'Je comprends et accepte la responsabilité de vérifier les taxes et les devis avant leur émission.', continue: 'Accepter et commencer', signature: 'Signature du client', taxNote: 'Les taxes doivent être vérifiées par l’émetteur.', quoteTitle: 'Devis de rénovation', projectsTitle: 'Projets enregistrés', newProject: 'Nouveau devis', saveLocal: 'Enregistrer sur cet appareil', openLocal: 'Ouvrir la sélection', deleteLocal: 'Supprimer la sélection', localWarning: 'Les projets enregistrés sur cet appareil peuvent disparaître si les données du navigateur sont effacées. Exportez une sauvegarde JSON.', selectProject: 'Choisir un projet enregistré', saved: 'Projet enregistré sur cet appareil.', opened: 'Projet ouvert.', deleted: 'Projet supprimé.', confirmDelete: 'Supprimer le projet sélectionné ?', noProject: 'Sélectionnez d’abord un projet.', confirmNew: 'Créer un nouveau devis ? Les modifications non enregistrées seront perdues.', storageError: 'Enregistrement impossible. Le stockage du navigateur est peut-être plein ou désactivé.', invalidProject: 'Fichier de projet invalide.' } };
const rcExtraTranslations = {
  en: { savedProjectsAria:'Saved projects', phoneFormat:'Use format 514-888-1234', countryUS:'United States', regionAlberta:'Alberta', removeRow:'Remove item', taxStateBase:'State tax (base)', taxStateReference:'State reference', invalidFile:'Invalid file', invalidProjectImport:'Invalid project', logoType:'PNG/JPEG/WebP, max 1MB' },
  fr: { savedProjectsAria:'Projets enregistrés', phoneFormat:'Utilisez le format 514-888-1234', countryUS:'États-Unis', regionAlberta:'Alberta', removeRow:'Supprimer le poste', taxStateBase:'Taxe de l’État (taux de base)', taxStateReference:'Référence de l’État', invalidFile:'Fichier invalide', invalidProjectImport:'Projet invalide', logoType:'PNG/JPEG/WebP, maximum 1 Mo' }
};
const rcRegionNamesFR = {
  CA: {BC:'Colombie-Britannique',MB:'Manitoba',NB:'Nouveau-Brunswick',NL:'Terre-Neuve-et-Labrador',NT:'Territoires du Nord-Ouest',NS:'Nouvelle-Écosse',NU:'Nunavut',ON:'Ontario',PE:'Île-du-Prince-Édouard',QC:'Québec',SK:'Saskatchewan',YT:'Yukon'},
  US: {AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'Californie',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Floride',GA:'Géorgie',HI:'Hawaï',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiane',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'Nouveau-Mexique',NY:'New York',NC:'Caroline du Nord',ND:'Dakota du Nord',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvanie',RI:'Rhode Island',SC:'Caroline du Sud',SD:'Dakota du Sud',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginie',WA:'Washington',WV:'Virginie-Occidentale',WI:'Wisconsin',WY:'Wyoming'}
};
function rcTranslateExtras() {
  const fr = $('lang').value === 'fr';
  const words = rcExtraTranslations[fr ? 'fr' : 'en'];
  if ($('savedProjects')) $('savedProjects').setAttribute('aria-label', words.savedProjectsAria);
  if ($('phone')) $('phone').title = words.phoneFormat;
  const us = $('country')?.querySelector('option[value="US"]');
  if (us) us.textContent = words.countryUS;
  if ($('quote')) $('quote').setAttribute('aria-label', fr ? 'Aperçu du devis' : 'Estimate preview');
  if ($('paperSize')) { const letter = $('paperSize').querySelector('option[value="Letter"]'); if(letter) letter.textContent = fr ? 'Lettre' : 'Letter'; }
  if ($('validationResults')?.style.display !== 'none' && typeof liveValidationActive !== 'undefined' && liveValidationActive) queueMicrotask(() => validateEstimate(true));
  if ($('projectStatus')?.textContent) $('projectStatus').textContent = '';
  if ($('draftStatus')?.textContent && typeof draftWriteFailed !== 'undefined') setDraftIndicator(draftWriteFailed ? 'failed' : 'saved');
}
const unitChoices = [['pcs', 'pcs'], ['sq ft', 'sq ft'], ['linear ft', 'linear ft'], ['sq m', 'sq m'], ['linear m', 'linear m'], ['hour', 'hour'], ['day', 'day'], ['job', 'job'], ['cu ft', 'cu ft'], ['cu yd', 'cu yd'], ['m³', 'm³'], ['kg', 'kg'], ['lb', 'lb']]; let items = [{ description: '', unit: '', qty: 1, price: 0 }], logo = '', activeProjectId = null; const t = k => texts[$('lang').value][k], num = v => { let n = Number(v); return Number.isFinite(n) && n >= 0 ? n : 0 }, rnd = v => Math.round((v + Number.EPSILON) * 100) / 100, money = v => new Intl.NumberFormat($('lang').value === 'fr' ? 'fr-CA' : 'en-CA', { style: 'currency', currency: $('currency').value }).format(v); function settings() { return Object.fromEntries(['company', 'email', 'phone', 'address', 'country', 'region', 'tax1', 'rate1', 'tax2', 'rate2', 'currency', 'lang'].map(k => [k, $(k).value])) } function storeSettings() { try { const s = settings(); if (s.phone.trim() !== '' && !PHONE_RE.test(s.phone.trim())) { try { s.phone = JSON.parse(localStorage.getItem('rc_settings') || '{}').phone || '' } catch (e) { s.phone = '' } } else s.phone = s.phone.trim(); localStorage.setItem('rc_settings', JSON.stringify({ ...s, logo })); return true } catch (e) { alert(t('storageError')); return false } } function companyLogo() { try { const saved = JSON.parse(localStorage.getItem('rc_settings') || '{}'); return typeof saved.logo === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(saved.logo) ? saved.logo : '' } catch (e) { return '' } }
function refreshLogoPreview() { if ($('quote').classList.contains('preview-visible')) quote() }
function projectTaxes() { return { tax1: $('pTax1').value, rate1: $('pRate1').value, tax2: $('pTax2').value, rate2: $('pRate2').value } }
function applyProjectTaxes(v) { for (const [from, to] of [['tax1', 'pTax1'], ['rate1', 'pRate1'], ['tax2', 'pTax2'], ['rate2', 'pRate2']]) $(to).value = v?.[from] ?? ''; updateTaxWarning() }
function updateTaxWarning() {
  const fr = $('lang').value === 'fr';
  $('projectTaxTitle').textContent = fr ? 'Taxes du devis' : 'Estimate taxes';
  $('pTax1NameLabel').textContent = fr ? 'Nom de la taxe 1' : 'Tax 1 name';
  $('pRate1Label').textContent = fr ? 'Taux de taxe 1 (%)' : 'Tax 1 rate (%)';
  $('pTax2NameLabel').textContent = fr ? 'Nom de la taxe 2' : 'Tax 2 name';
  $('pRate2Label').textContent = fr ? 'Taux de taxe 2 (%)' : 'Tax 2 rate (%)';
  const a = projectTaxes(), b = settings();
  const differs = ['tax1', 'rate1', 'tax2', 'rate2'].some(k => String(a[k]).trim() !== String(b[k]).trim());
  $('taxMismatch').textContent = differs ? (fr ? 'Attention : les taxes de ce devis diffèrent des paramètres généraux.' : 'Notice: This estimate uses tax settings different from the company defaults.') : '';
}
function calc() { let subtotal = rnd(items.reduce((a, r) => a + rnd(num(r.qty) * num(r.price)), 0)), tax1 = rnd(subtotal * num($('pRate1').value) / 100), tax2 = rnd(subtotal * num($('pRate2').value) / 100); return { subtotal, tax1, tax2, total: rnd(subtotal + tax1 + tax2) } } function update() { queueDraft(); updateTaxWarning(); const c = calc(); $('subtotal').textContent = money(c.subtotal); $('taxLabel1').textContent = ($('pTax1').value || 'Tax 1') + ' (' + num($('pRate1').value) + '%)'; $('taxLabel2').textContent = ($('pTax2').value || 'Tax 2') + ' (' + num($('pRate2').value) + '%)'; $('taxAmount1').textContent = money(c.tax1); $('taxAmount2').textContent = money(c.tax2); $('total').textContent = money(c.total);[...$('rows').children].forEach((r, i) => r.children[4].textContent = money(rnd(items[i].qty * items[i].price))); if ($('quote').classList.contains('preview-visible')) quote(); renderCostRows() } function render() { const body = $('rows'); body.replaceChildren(); items.forEach((r, i) => { let tr = document.createElement('tr'); for (const key of ['description', 'unit', 'qty', 'price']) { let td = document.createElement('td'); if (key === 'unit') { const select = document.createElement('select'); select.setAttribute('aria-label', t('unit')); const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = $('lang').value === 'fr' ? 'Choisir une unité' : 'Select unit'; select.append(placeholder); for (const [value, label] of unitChoices) { const option = document.createElement('option'); option.value = value; option.textContent = label; select.append(option) } if (r.unit && !unitChoices.some(([v]) => v === r.unit)) { const option = document.createElement('option'); option.value = r.unit; option.textContent = r.unit; select.append(option) } const other = document.createElement('option'); other.value = '__custom__'; other.textContent = $('lang').value === 'fr' ? 'Autre unité…' : 'Custom unit…'; select.append(other); select.value = r.unit || ''; select.onchange = () => { if (select.value === '__custom__') { const custom = prompt($('lang').value === 'fr' ? 'Saisissez une unité personnalisée :' : 'Enter a custom unit:', r.unit || ''); if (custom && custom.trim()) { r.unit = custom.trim().slice(0, 40) } render() } else { r.unit = select.value; update() } }; td.append(select) } else { let input = document.createElement('input'); input.type = ['qty', 'price'].includes(key) ? 'number' : 'text'; if (input.type === 'number') { input.min = '0'; input.step = 'any' } input.value = r[key]; input.setAttribute('aria-label', t(key)); input.oninput = () => { r[key] = input.type === 'number' ? num(input.value) : input.value; update() }; td.append(input) } tr.append(td) } let amount = document.createElement('td'); amount.className = 'right'; tr.append(amount); let td = document.createElement('td'), b = document.createElement('button'); b.textContent = '×'; b.title = rcExtraTranslations[$('lang').value === 'fr' ? 'fr' : 'en'].removeRow; b.onclick = () => { items.splice(i, 1); render() }; td.append(b); tr.append(td); body.append(tr) }); update() } function translate() { translateCosts(); $('paperLabel').firstChild.textContent = $('lang').value === 'fr' ? 'Papier ' : 'Paper '; updateTaxWarning(); $('preview').textContent = $('quote').classList.contains('preview-visible') ? ($('lang').value === 'fr' ? 'Masquer l’aperçu' : 'Hide preview') : ($('lang').value === 'fr' ? 'Aperçu du devis' : 'Preview estimate'); document.documentElement.lang = $('lang').value; if ($('exportJson')) $('exportJson').textContent = $('lang').value === 'fr' ? 'Exporter JSON' : 'Export JSON'; $('validateEstimate').textContent = $('lang').value === 'fr' ? 'Vérifier le devis' : 'Check estimate'; document.querySelectorAll('[data-t]').forEach(el => { const value = t(el.dataset.t); if (value !== undefined) el.textContent = value; }); rcTranslateExtras(); render(); refreshProjects(); if ($('quote').classList.contains('preview-visible')) quote() } function project() { return { version: 3, targetMargin: marginValue(), settings: settings(), projectTaxes: projectTaxes(), logo, client: $('client').value, clientContact: $('clientContact').value, project: $('project').value, quoteNo: $('quoteNo').value, date: $('date').value, notes: $('notes').value, paymentSchedule: $('paymentSchedule').value, items } } function quote() { const c = calc(), p = project(); const displayLogo = companyLogo() || logo; $('qCompany').textContent = p.settings.company || 'Reno Calc'; $('qTitle').textContent = t('quoteTitle'); $('qContact').textContent = [p.settings.address, [p.settings.phone, p.settings.email].filter(Boolean).join(' | ')].filter(Boolean).join('\n'); $('qClientContact').textContent = p.clientContact || ''; $('qClient').textContent = t('client') + ': ' + p.client; $('qProject').textContent = t('project') + ': ' + p.project; $('qMeta').textContent = p.quoteNo + '\n' + p.date; $('qRepeatIdentity').textContent = (p.settings.company || 'Reno Calc') + '  |  ' + p.quoteNo + '  |  ' + p.date; $('qLogo').style.display = displayLogo ? 'block' : 'none'; if (displayLogo) { if ($('qLogo').src !== displayLogo) $('qLogo').src = displayLogo } else $('qLogo').removeAttribute('src');['description', 'unit', 'qty', 'price', 'amount'].forEach((k, i) => $('qh' + i).textContent = t(k)); $('qRows').replaceChildren(); items.filter(r => r.description.trim() || num(r.price) > 0).forEach(r => { let tr = document.createElement('tr');[r.description, r.unit, r.qty, money(r.price), money(rnd(r.qty * r.price))].forEach(v => { let td = document.createElement('td'); td.textContent = v; tr.append(td) }); $('qRows').append(tr) }); $('qsLabel').textContent = t('subtotal'); $('qs').textContent = money(c.subtotal); $('qt1Label').textContent = $('taxLabel1').textContent; $('qt1Label').parentElement.style.display = num($('pRate1').value) > 0 ? '' : 'none'; $('qt1').textContent = money(c.tax1); $('qt2Label').textContent = $('taxLabel2').textContent; $('qt2Label').parentElement.style.display = num($('pRate2').value) > 0 ? '' : 'none'; $('qt2').textContent = money(c.tax2); $('qTotalLabel').textContent = t('total'); $('qTotal').textContent = money(c.total); $('qNotes').textContent = p.notes; $('qNotesTitle').textContent = t('notesTitle'); $('qNotesBlock').style.display = p.notes.trim() ? 'block' : 'none'; $('qPaymentSchedule').textContent = p.paymentSchedule || ''; $('qPaymentScheduleTitle').textContent = t('paymentSchedule'); $('qPaymentScheduleBlock').style.display = (p.paymentSchedule || '').trim() ? 'block' : 'none'; $('sign').textContent = t('signature'); $('signDate').textContent = t('date'); $('qDisclaimer').textContent = t('taxNote') }


// Country-dependent region dropdown. The same #region control is used by saved settings.
const RC_REGIONS = {
  CA: [
    ['AB', 'Alberta'], ['BC', 'British Columbia'], ['MB', 'Manitoba'],
    ['NB', 'New Brunswick'], ['NL', 'Newfoundland and Labrador'],
    ['NT', 'Northwest Territories'], ['NS', 'Nova Scotia'], ['NU', 'Nunavut'],
    ['ON', 'Ontario'], ['PE', 'Prince Edward Island'], ['QC', 'Québec'],
    ['SK', 'Saskatchewan'], ['YT', 'Yukon']
  ],
  US: [
    ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
    ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'],
    ['DE', 'Delaware'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'],
    ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'],
    ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'],
    ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'],
    ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'],
    ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
    ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'],
    ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'],
    ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
    ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
    ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'],
    ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
    ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'],
    ['WY', 'Wyoming']
  ]
};
function populateRegionOptions(preferredRegion = '') {
  const country = $('country').value === 'US' ? 'US' : 'CA';
  const select = $('region');
  if (select.tagName !== 'SELECT') {
    throw new Error('Reno Calc: replace <input id="region"> with <select id="region" required></select> in HTML.');
  }
  const previous = String(preferredRegion || '').trim().toUpperCase();
  const fr = $('lang').value === 'fr';
  select.replaceChildren();
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = country === 'CA'
    ? (fr ? 'Choisir une province / un territoire' : 'Select province / territory')
    : (fr ? 'Choisir un État' : 'Select state');
  placeholder.disabled = true;
  select.append(placeholder);
  for (const [code, name] of RC_REGIONS[country]) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = $('lang').value === 'fr' ? (rcRegionNamesFR[country]?.[code] || name) : name;
    select.append(option);
  }
  select.value = RC_REGIONS[country].some(([code]) => code === previous) ? previous : '';
}
// Reference tax presets: general rates, NOT a determination of renovation taxability.
// US entries are statewide base rates only; county/city/district taxes are NOT included.
// HI and NM use gross-receipts-style taxes, not conventional sales taxes.
const RC_TAX_PRESETS = {
  CA: {
    AB: [['GST', 5]], BC: [['GST', 5], ['PST', 7]], MB: [['GST', 5], ['RST', 7]],
    NB: [['HST', 15]], NL: [['HST', 15]], NT: [['GST', 5]], NS: [['HST', 14]],
    NU: [['GST', 5]], ON: [['HST', 13]], PE: [['HST', 15]],
    QC: [['GST', 5], ['QST', 9.975]], SK: [['GST', 5], ['PST', 6]], YT: [['GST', 5]]
  },
  US: {
    AL: 4, AK: 0, AZ: 5.6, AR: 6.5, CA: 7.25, CO: 2.9, CT: 6.35, DE: 0,
    FL: 6, GA: 4, HI: 4, ID: 6, IL: 6.25, IN: 7, IA: 6, KS: 6.5,
    KY: 6, LA: 5, ME: 5.5, MD: 6, MA: 6.25, MI: 6, MN: 6.875,
    MS: 7, MO: 4.225, MT: 0, NE: 5.5, NV: 6.85, NH: 0, NJ: 6.625,
    NM: 4.875, NY: 4, NC: 4.75, ND: 5, OH: 5.75, OK: 4.5, OR: 0,
    PA: 6, RI: 7, SC: 6, SD: 4.2, TN: 7, TX: 6.25, UT: 4.85,
    VT: 6, VA: 4.3, WA: 6.5, WV: 6, WI: 5, WY: 4
  }
};
function rcTaxPreset(country, region) {
  if (!region || !Object.hasOwn(RC_TAX_PRESETS[country] || {}, region)) return null;
  if (country === 'CA') return RC_TAX_PRESETS.CA[region];
  const rate = RC_TAX_PRESETS.US[region];
  return [[region === 'HI' ? 'GET (state reference)' : region === 'NM' ? 'GRT (state reference)' : ($('lang').value === 'fr' ? 'Taxe de l’État (taux de base)' : 'State tax (base)'), rate]];
}
function rcShowTaxReferenceNotice() {
  let note = document.getElementById('rcTaxReferenceNotice');
  if (!note) {
    note = document.createElement('p');
    note.id = 'rcTaxReferenceNotice';
    note.className = 'muted';
    const anchor = $('taxHelp') || $('saveSettings');
    if (anchor) anchor.insertAdjacentElement('beforebegin', note);
  }
  const fr = $('lang').value === 'fr';
  note.textContent = $('country').value === 'US'
    ? (fr ? 'Taux de référence de l’État seulement : taxes locales non incluses. Le traitement fiscal des travaux et matériaux peut varier. Vérifiez et modifiez les taux avant le devis.' : 'Statewide reference rate only: local taxes are not included. Renovation labor/material taxability varies. Verify and adjust rates before issuing an estimate.')
    : (fr ? 'Taux généraux de référence seulement. Vérifiez les exemptions et le traitement fiscal des travaux avant le devis.' : 'General reference rates only. Verify exemptions and renovation tax treatment before issuing an estimate.');
}
function rcFillTaxSettings() {
  const country = $('country').value === 'US' ? 'US' : 'CA';
  const preset = rcTaxPreset(country, $('region').value);
  if (!preset) {
    for (const id of ['tax1', 'rate1', 'tax2', 'rate2']) $(id).value = '';
  } else {
    $('tax1').value = preset[0]?.[0] ?? '';
    $('rate1').value = preset[0]?.[1] ?? 0;
    $('tax2').value = preset[1]?.[0] ?? '';
    $('rate2').value = preset[1]?.[1] ?? '';
  }
  rcShowTaxReferenceNotice();
  updateTaxWarning();
  // Company defaults do not silently replace tax rates on an existing estimate.
  // On a new, unsaved estimate, synchronize the estimate tax fields as well.
  if (!activeProjectId && !isLocked()) {
    applyProjectTaxes(settings());
    update();
  }
}
$('country').addEventListener('change', () => {
  populateRegionOptions();
  $('currency').value = $('country').value === 'US' ? 'USD' : 'CAD';
  rcFillTaxSettings();
  update();
});
$('region').addEventListener('change', rcFillTaxSettings);
$('lang').addEventListener('change', () => { rcShowTaxReferenceNotice(); if ($('region').value && $('country').value === 'US') { const tax = $('tax1'); if (tax.value === 'State tax (base)' || tax.value === 'Taxe de l’État (taux de base)') tax.value = $('lang').value === 'fr' ? 'Taxe de l’État (taux de base)' : 'State tax (base)'; } });

$('lang').addEventListener('change', () => populateRegionOptions($('region').value));

const PROJECTS_KEY = 'rc_projects_v2';

// Sequential numbering: ignore legacy random IDs and contaminated old counters.
const ESTIMATE_SEQ_KEY = 'rc_estimate_next_sequential_v032';
function numberLabel(n) { return 'RC-' + String(n).padStart(3, '0') }
function estimateNumberValue(value) { const match = /^RC-(\d+)$/i.exec(String(value || '').trim()); return match ? Number(match[1]) : null }
function sequentialHistory() {
  const projects = allProjects();
  const numbers = Object.values(projects).map(entry => estimateNumberValue(entry?.data?.quoteNo)).filter(n => Number.isSafeInteger(n) && n >= 1).sort((a, b) => a - b);
  // An old randomly generated six-digit number is not evidence of sequential history.
  // Accept the continuous run beginning at 1; preserve the next counter separately.
  let contiguous = 0;
  for (const n of numbers) { if (n === contiguous + 1) contiguous++; else if (n > contiguous + 1) break }
  return { numbers, contiguous };
}
function nextAvailableEstimateNumber() {
  const { numbers, contiguous } = sequentialHistory();
  let stored = 1;
  try { stored = Number(localStorage.getItem(ESTIMATE_SEQ_KEY) || 1) } catch (e) { }
  if (!Number.isSafeInteger(stored) || stored < 1) stored = 1;
  // A newly initialized counter resumes after the legitimate sequential run.
  let candidate = Math.max(stored, contiguous + 1);
  const used = new Set(numbers);
  while (used.has(candidate)) candidate++;
  return numberLabel(candidate);
}
function initialEstimateNumber() { return nextAvailableEstimateNumber() }
function nextEstimateNumber() { return nextAvailableEstimateNumber() }
function markEstimateNumberUsed() {
  const used = estimateNumberValue($('quoteNo').value);
  if (!Number.isSafeInteger(used) || used < 1) return;
  // Manual or legacy numbers must not jump the automatic sequence.
  const next = estimateNumberValue(nextAvailableEstimateNumber());
  if (used >= next || used < 1) return;
  try { localStorage.setItem(ESTIMATE_SEQ_KEY, String(next)) } catch (e) { }
}
// Local crash-recovery draft, independent of explicitly saved projects.
const DRAFT_KEY = 'rc_draft_042';
let draftTimer = null, lastDraftSignature = '', draftWriteFailed = false, suspendDraft = false;
function draftSignature() { const p = project(); return JSON.stringify({ activeProjectId, client: p.client, clientContact: p.clientContact, project: p.project, quoteNo: p.quoteNo, date: p.date, notes: p.notes, paymentSchedule: p.paymentSchedule, items: p.items, targetMargin: p.targetMargin, projectTaxes: p.projectTaxes }) }
function draftHasContent() { return Boolean($('client').value.trim() || $('clientContact').value.trim() || $('project').value.trim() || $('notes').value.trim() || $('paymentSchedule').value.trim() || items.some(r => r.description.trim() || Number(r.price) > 0 || r.unit || Number(r.qty) !== 1)) }
function flushDraft() { if (suspendDraft) return; clearTimeout(draftTimer); draftTimer = null; try { const signature = draftSignature(); if (!draftHasContent()) { localStorage.removeItem(DRAFT_KEY); lastDraftSignature = signature; draftWriteFailed = false; setDraftIndicator('saved'); return } localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, savedAt: new Date().toISOString(), activeProjectId, data: project() })); lastDraftSignature = signature; draftWriteFailed = false; setDraftIndicator('saved') } catch (e) { draftWriteFailed = true; setDraftIndicator('failed') } }
function setDraftIndicator(state) {
  const fr = $('lang').value === 'fr';
  $('draftStatus').textContent = state === 'pending' ? (fr ? 'Enregistrement…' : 'Saving...') : state === 'saved' ? (fr ? 'Toutes les modifications sont enregistrées localement.' : 'All changes saved locally.') : state === 'failed' ? (fr ? 'Échec de l’enregistrement automatique. Exportez une copie JSON.' : 'Auto-save failed. Export a JSON backup.') : '';
}
function queueDraft() { if (suspendDraft) return; clearTimeout(draftTimer); draftTimer = setTimeout(flushDraft, 650); setDraftIndicator('pending') }
function clearDraft() { clearTimeout(draftTimer); draftTimer = null; try { localStorage.removeItem(DRAFT_KEY) } catch (e) { } lastDraftSignature = draftSignature(); draftWriteFailed = false; $('draftStatus').textContent = '' }
function showDraftStatus() { if (!draftWriteFailed) setDraftIndicator('saved') }
function recoverDraft() { let d; try { d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null') } catch (e) { return } if (!d?.data || !Array.isArray(d.data.items)) return; const fr = $('lang').value === 'fr'; const when = d.savedAt ? new Date(d.savedAt).toLocaleString(fr ? 'fr-CA' : 'en-CA') : ''; const yes = confirm(fr ? 'Un brouillon non confirmé a été trouvé (' + when + '). Voulez-vous le récupérer ?' : 'An auto-saved draft was found (' + when + '). Restore it?'); if (yes) { try { suspendDraft = true; restoreProject(d.data); activeProjectId = d.activeProjectId && allProjects()[d.activeProjectId] ? d.activeProjectId : null; refreshProjects(); suspendDraft = false; lastDraftSignature = draftSignature(); showDraftStatus() } catch (e) { suspendDraft = false; alert(fr ? 'Impossible de récupérer le brouillon.' : 'Could not restore draft.') } } else { clearDraft() } }
window.addEventListener('beforeunload', e => { if (draftWriteFailed || draftTimer !== null) { e.preventDefault(); e.returnValue = '' } });
window.addEventListener('pagehide', () => { if (draftTimer !== null) flushDraft() });
// Full-library backups. Existing saved projects are never silently overwritten.
const BACKUP_FORMAT = 'reno-calc-all-projects', BACKUP_VERSION = 1;
// Phone must be exactly 514-888-1234 (digits and dashes). Empty is allowed.
const PHONE_RE = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
function checkPhone(show) {
  const el = $('phone'), note = $('phoneError'), v = el.value.trim(), ok = v === '' || PHONE_RE.test(v);
  el.classList.toggle('rc-invalid', !ok);
  el.setAttribute('aria-invalid', ok ? 'false' : 'true');
  note.textContent = ok ? '' : backupText('Format requis : 514-888-1234 (avec tirets).', 'Required format: 514-888-1234 (with dashes).');
  if (!ok && show) el.focus();
  return ok;
}
$('phone').addEventListener('input', () => { if ($('phoneError').textContent) checkPhone(false) });
$('phone').addEventListener('blur', () => checkPhone(false));
function allInvoices() { try { const r = JSON.parse(localStorage.getItem('rc_invoices_v1') || '{}'); return r && typeof r === 'object' && !Array.isArray(r) ? r : {} } catch (e) { return {} } }
function updateBackupStatus() {
  const el = $('backupStatus'); if (!el) return;
  if (!Object.keys(allProjects()).length && !Object.keys(allInvoices()).length) { el.textContent = ''; el.classList.remove('warning'); return }
  let last = null; try { last = localStorage.getItem('rc_last_backup') } catch (e) { }
  const days = last ? Math.floor((Date.now() - new Date(last).getTime()) / 864e5) : null, stale = days === null || days >= 7;
  el.classList.toggle('warning', stale);
  el.textContent = days === null ? backupText('Aucune sauvegarde effectuée. Cliquez sur « Sauvegarder tous les devis » pour protéger vos devis et factures.', 'No backup yet. Click “Backup all projects” to protect your estimates and invoices.')
    : stale ? backupText('Dernière sauvegarde il y a ' + days + ' jours. Pensez à en faire une nouvelle.', 'Last backup was ' + days + ' days ago. Consider making a new one.')
    : backupText('Dernière sauvegarde : ' + new Date(last).toLocaleDateString('fr-CA') + '.', 'Last backup: ' + new Date(last).toLocaleDateString('en-CA') + '.');
}
function backupText(fr, en) { return $('lang').value === 'fr' ? fr : en }
function downloadBackup(name, data) { const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000) }
function exportAllProjects() {
  const projects = allProjects(), invoices = allInvoices(), count = Object.keys(projects).length, invCount = Object.keys(invoices).length;
  if (!count && !invCount) { alert(backupText('Aucun devis enregistré à sauvegarder.', 'There are no saved estimates to back up.')); return }
  const data = { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), projects, invoices, settings: JSON.parse(localStorage.getItem('rc_settings') || 'null'), estimateSequence: localStorage.getItem(ESTIMATE_SEQ_KEY), paperSize: localStorage.getItem('rc_paper_size') };
  const day = new Date().toISOString().slice(0, 10);
  downloadBackup('reno-calc-all-projects-' + day + '.json', data);
  try { localStorage.setItem('rc_last_backup', new Date().toISOString()) } catch (e) { } updateBackupStatus();
  alert(backupText('Sauvegarde créée : ' + count + ' devis et ' + invCount + ' facture(s). Conservez le fichier en lieu sûr.', 'Backup downloaded: ' + count + ' estimates and ' + invCount + ' invoice(s). Keep the file in a safe place.'));
}
function validBackup(x) {
  if (!x || x.format !== BACKUP_FORMAT || x.version !== BACKUP_VERSION || !x.projects || typeof x.projects !== 'object' || Array.isArray(x.projects)) throw Error(backupText('Ce fichier n’est pas une sauvegarde complète Reno Calc compatible.', 'This is not a compatible Reno Calc full backup.'));
  const entries = Object.entries(x.projects);
  if (entries.length > 10000) throw Error('Too many projects');
  for (const [id, entry] of entries) { if (!id || id === '__proto__' || id === 'constructor' || !entry || typeof entry !== 'object' || !entry.data || !Array.isArray(entry.data.items) || entry.data.items.length > 10000 || typeof entry.data.quoteNo !== 'string') throw Error(backupText('Sauvegarde invalide : devis endommagé.', 'Invalid backup: damaged estimate.')) }
  if (x.invoices !== undefined) {
    if (!x.invoices || typeof x.invoices !== 'object' || Array.isArray(x.invoices) || Object.keys(x.invoices).length > 10000) throw Error(backupText('Sauvegarde invalide : factures endommagées.', 'Invalid backup: damaged invoices.'));
    for (const [id, r] of Object.entries(x.invoices)) { if (!id || id === '__proto__' || id === 'constructor' || !r || typeof r !== 'object' || !Array.isArray(r.rows) || r.rows.length > 10000 || typeof r.number !== 'string') throw Error(backupText('Sauvegarde invalide : facture endommagée.', 'Invalid backup: damaged invoice.')) }
  }
  return entries;
}
function uniqueImportedId(existing) { let id; do { id = 'import_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10) } while (Object.hasOwn(existing, id)); return id }
async function restoreAllProjects(file) {
  if (!file || file.size > 40 * 1024 * 1024) throw Error(backupText('Fichier absent ou trop volumineux (maximum 40 Mo).', 'Missing or oversized file (40 MB maximum).'));
  const data = JSON.parse(await file.text()); const entries = validBackup(data);
  const existing = allProjects(); const currentNumbers = new Set(Object.values(existing).map(e => String(e?.data?.quoteNo || '').trim().toUpperCase()));
  const additions = Object.create(null); let skipped = 0;
  for (const [id, entry] of entries) { const number = String(entry.data.quoteNo).trim().toUpperCase(); if (number && currentNumbers.has(number)) { skipped++; continue } let target = id; if (Object.hasOwn(existing, target) || Object.hasOwn(additions, target)) target = uniqueImportedId({ ...existing, ...additions }); additions[target] = entry; if (number) currentNumbers.add(number) }
  const existingInv = allInvoices(), invAdd = Object.create(null), invNumbers = new Set(Object.values(existingInv).map(r => String(r?.number || '').trim().toUpperCase())); let invSkipped = 0;
  for (const [id, r] of Object.entries(data.invoices || {})) { const n = String(r.number).trim().toUpperCase(); if ((n && invNumbers.has(n)) || Object.hasOwn(existingInv, id)) { invSkipped++; continue } invAdd[id] = r; if (n) invNumbers.add(n) }
  const count = Object.keys(additions).length, invCount = Object.keys(invAdd).length; skipped += invSkipped;
  if (!count && !invCount) { alert(backupText('Aucun nouveau devis à restaurer. ' + skipped + ' doublon(s) ignoré(s).', 'No new estimates to restore. ' + skipped + ' duplicate(s) skipped.')); return }
  const yes = confirm(backupText('Restaurer ' + count + ' devis et ' + invCount + ' facture(s) ? ' + skipped + ' doublon(s) ignoré(s). Les devis existants ne seront pas remplacés.', 'Restore ' + count + ' estimates and ' + invCount + ' invoice(s)? ' + skipped + ' duplicate(s) skipped. Existing estimates will not be overwritten.'));
  if (!yes) return;
  const merged = { ...existing, ...additions };
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(merged)); if (invCount) localStorage.setItem('rc_invoices_v1', JSON.stringify({ ...existingInv, ...invAdd })) } catch (e) { throw Error(backupText('Espace de stockage insuffisant. Aucun devis existant n’a été effacé.', 'Not enough browser storage. No existing estimates were deleted.')) }
  // Do not replace local company settings or active draft. Existing numbering logic scans saved estimates.
  refreshProjects(); if (window.rcRefreshInvoices) window.rcRefreshInvoices(); alert(backupText(count + ' devis et ' + invCount + ' facture(s) restaurés. ' + skipped + ' doublon(s) ignoré(s).', count + ' estimates and ' + invCount + ' invoice(s) restored. ' + skipped + ' duplicate(s) skipped.'));
}
$('backupAll').onclick = () => { try { exportAllProjects() } catch (e) { alert(e.message) } };
$('restoreAll').onclick = () => $('backupFile').click();
$('backupFile').onchange = async e => { const file = e.target.files?.[0]; if (!file) return; try { await restoreAllProjects(file) } catch (err) { alert(backupText('Échec de restauration : ', 'Restore failed: ') + err.message) } finally { e.target.value = '' } };
$('lang').addEventListener('change', () => { $('backupAll').textContent = backupText('Sauvegarder tous les devis', 'Backup all projects'); $('restoreAll').textContent = backupText('Restaurer une sauvegarde', 'Restore backup'); updateBackupStatus() });
function allProjects() { try { const x = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '{}'); return x && typeof x === 'object' && !Array.isArray(x) ? x : {} } catch (e) { return {} } }
function refreshProjects() { const s = $('savedProjects'); if (!s) return; const current = s.value; s.replaceChildren(); const first = document.createElement('option'); first.value = ''; first.textContent = t('selectProject'); s.append(first); const projects = allProjects(); Object.entries(projects).sort((a, b) => (b[1].updatedAt || '').localeCompare(a[1].updatedAt || '')).forEach(([id, entry]) => { const o = document.createElement('option'); o.value = id; o.textContent = (entry.data?.finalizedAt ? '🔒 ' : '') + (entry.data?.quoteNo || id) + ' — ' + (entry.data?.client || entry.data?.project || '—'); s.append(o) }); s.value = projects[current] ? current : projects[activeProjectId] ? activeProjectId : ''; updateBackupStatus() }

function showActionDialog(type, onConfirm) {
  const fr = $('lang').value === 'fr', d = $('actionDialog');
  const selected = allProjects()[$('savedProjects').value];
  const number = type === 'delete' ? (selected?.data?.quoteNo || '') : ($('quoteNo').value || '');
  $('actionTitle').textContent = type === 'delete' ? (fr ? 'Confirmer la suppression' : 'Confirm deletion') : (fr ? 'Enregistrer un nouveau projet' : 'Save new project');
  $('actionMessage').textContent = type === 'delete' ? (fr ? 'Supprimer définitivement le devis ' + number + ' de cet appareil ? Cette action est irréversible.' : 'Permanently delete estimate ' + number + ' from this device? This cannot be undone.') : (fr ? 'Enregistrer le devis ' + number + ' sur cet appareil ?' : 'Save estimate ' + number + ' on this device?');
  $('actionCancel').textContent = fr ? 'Annuler' : 'Cancel';
  $('actionConfirm').textContent = type === 'delete' ? (fr ? 'Supprimer le projet' : 'Delete project') : (fr ? 'Confirmer l’enregistrement' : 'Confirm save');
  d.style.display = 'flex';
  $('actionCancel').onclick = () => { d.style.display = 'none' };
  $('actionConfirm').onclick = () => { d.style.display = 'none'; onConfirm() };
  $('actionCancel').focus();
}
$('actionDialog').addEventListener('keydown', e => { if (e.key === 'Escape') { $('actionCancel').click(); e.preventDefault() } });


const paperStyle = document.createElement('style'); paperStyle.id = 'paperStyle'; document.head.append(paperStyle);
function setPaperSize(v) { const size = v === 'A4' ? 'A4' : 'Letter'; paperStyle.textContent = '@media print{@page{size:' + size + ';margin:15mm 13mm 19mm 13mm;@bottom-right{content:"Page " counter(page) " of " counter(pages);font:9px Arial,sans-serif;color:#526c79;}}}'; try { localStorage.setItem('rc_paper_size', size) } catch (e) { } }
$('paperSize').value = (() => { try { return localStorage.getItem('rc_paper_size') === 'A4' ? 'A4' : 'Letter' } catch (e) { return 'Letter' } })();
setPaperSize($('paperSize').value);
$('paperSize').addEventListener('change', () => setPaperSize($('paperSize').value));

function showStatus(key) { $('projectStatus').textContent = t(key) }
function restoreProject(p) { if (!p || !Array.isArray(p.items) || p.items.length > 10000) throw Error(t('invalidProject')); applyProjectTaxes(p.projectTaxes || p.settings || settings()); for (const k of ['client', 'clientContact', 'project', 'quoteNo', 'date', 'notes', 'paymentSchedule']) $(k).value = typeof p[k] === 'string' ? p[k] : ''; items = p.items.map(r => ({ description: String(r.description || ''), unit: String(r.unit || ''), qty: num(r.qty), price: num(r.price), materialCost: num(r.materialCost), laborCost: num(r.laborCost) })); $('targetMargin').value = validMargin(p.targetMargin); logo = companyLogo() || (typeof p.logo === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(p.logo) ? p.logo : ''); translate() }

const lockText = (fr, en) => $('lang').value === 'fr' ? fr : en;
function isLocked() { return !!(activeProjectId && allProjects()[activeProjectId]?.data?.finalizedAt) }
function applyLock() {
  const locked = isLocked();
  for (const id of ['client', 'clientContact', 'project', 'quoteNo', 'date', 'notes', 'pTax1', 'pRate1', 'pTax2', 'pRate2', 'targetMargin', 'applySuggested', 'add', 'saveLocal', 'save', 'deleteLocal']) { const el = $(id); if (el) el.disabled = locked }
  $('rows').querySelectorAll('input,select,textarea,button').forEach(el => el.disabled = locked); $('costRows').querySelectorAll('input').forEach(el => el.disabled = locked);
  $('finalizeEstimate').hidden = locked;
  $('unlockEstimate').hidden = !locked;
  $('lockStatus').textContent = locked ? lockText('🔒 Devis finalisé — lecture seule', '🔒 Finalized — read only') : lockText('Brouillon — modifiable', 'Draft — editable');
}
const costLockObserver = new MutationObserver(() => { if (isLocked()) $('costRows').querySelectorAll('input').forEach(el => el.disabled = true) }); costLockObserver.observe($('costRows'), { childList: true, subtree: true });
const lockObserver = new MutationObserver(() => { if (isLocked()) $('rows').querySelectorAll('input,select,textarea,button').forEach(el => el.disabled = true) });
lockObserver.observe($('rows'), { childList: true, subtree: true });
$('finalizeEstimate').onclick = () => {
  if (!activeProjectId) { alert(lockText('Enregistrez d’abord le devis.', 'Save the estimate first.')); return }
  if (isLocked()) return;
  if (!confirm(lockText('Finaliser et verrouiller ce devis ? Il restera consultable et imprimable.', 'Finalize and lock this estimate? It will remain viewable and printable.'))) return;
  const projects = allProjects(), entry = projects[activeProjectId]; if (!entry) return;
  // Capture the latest visible fields before locking.
  entry.data = project(); entry.data.finalizedAt = new Date().toISOString(); entry.updatedAt = new Date().toISOString();
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); clearDraft(); refreshProjects(); applyLock() } catch (e) { alert(lockText('Échec de l’enregistrement.', 'Could not save the finalized estimate.')) }
};
$('unlockEstimate').onclick = () => {
  if (!isLocked()) return;
  if (!confirm(lockText('Déverrouiller ce devis pour le modifier ?', 'Unlock this estimate for editing?'))) return;
  const projects = allProjects(); delete projects[activeProjectId].data.finalizedAt;
  projects[activeProjectId].updatedAt = new Date().toISOString();
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); refreshProjects(); applyLock() } catch (e) { alert(lockText('Impossible de déverrouiller le devis.', 'Could not unlock the estimate.')) }
};
$('lang').addEventListener('change', () => { $('finalizeEstimate').textContent = lockText('Finaliser le devis', 'Finalize estimate'); $('unlockEstimate').textContent = lockText('Déverrouiller le devis', 'Unlock estimate'); applyLock() });
$('saveLocal').onclick = () => { if (!activeProjectId) { showActionDialog('save', () => saveLocalConfirmed()); return } saveLocalConfirmed() };
function saveLocalConfirmed() { if (isLocked()) { alert(lockText('Déverrouillez le devis avant de le modifier.', 'Unlock the estimate before editing.')); return } const data = project(), projects = allProjects(); if (!activeProjectId) activeProjectId = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); const duplicate = Object.entries(projects).some(([id, entry]) => id !== activeProjectId && String(entry?.data?.quoteNo || '').trim().toUpperCase() === String(data.quoteNo || '').trim().toUpperCase()); if (duplicate) { alert($('lang').value === 'fr' ? 'Ce numéro de devis existe déjà. Choisissez un numéro unique.' : 'This estimate number is already used. Choose a unique number.'); return } projects[activeProjectId] = { updatedAt: new Date().toISOString(), data }; try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); markEstimateNumberUsed(); refreshProjects(); clearDraft(); showStatus('saved') } catch (e) { showStatus('storageError') } }
$('openLocal').onclick = () => { if (draftTimer !== null || draftHasContent() && draftSignature() !== lastDraftSignature) { if (!confirm($('lang').value === 'fr' ? 'Abandonner les modifications non enregistrées du devis actuel ?' : 'Discard unsaved changes to the current estimate?')) return } clearDraft(); const id = $('savedProjects').value, p = allProjects()[id]; if (!p) { showStatus('noProject'); return } try { restoreProject(p.data); activeProjectId = id; refreshProjects(); applyLock(); showStatus('opened') } catch (e) { alert(e.message) } };
$('deleteLocal').onclick = () => { const id = $('savedProjects').value, projects = allProjects(); if (!id || !projects[id]) { showStatus('noProject'); return } showActionDialog('delete', () => deleteProjectConfirmed(id)); };
function deleteProjectConfirmed(id) { const projects = allProjects(); if (projects[id]?.data?.finalizedAt) { alert(lockText('Déverrouillez le devis avant de le supprimer.', 'Unlock the estimate before deleting it.')); return } if (!projects[id]) { showStatus('noProject'); return } delete projects[id]; try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); if (activeProjectId === id) activeProjectId = null; refreshProjects(); showStatus('deleted') } catch (e) { showStatus('storageError') } }
$('newProject').onclick = () => {
  if (!confirm(t('confirmNew'))) return; clearDraft(); activeProjectId = null; applyLock(); items = [{ description: '', unit: '', qty: 1, price: 0 }]; $('targetMargin').value = 30; for (const k of ['client', 'clientContact', 'project', 'notes']) $(k).value = ''; $('quoteNo').value = nextEstimateNumber();
  $('date').value = new Date().toLocaleDateString('en-CA'); applyProjectTaxes(settings()); render(); refreshProjects(); $('projectStatus').textContent = ''
};
// Spreadsheet-style keyboard navigation for the four editable columns.
// Alt+Down preserves the native select menu for choosing units with the keyboard.
$('rows').addEventListener('keydown', function (event) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const current = event.target;
  if (!current.matches('input,select')) return;
  const cell = current.closest('td');
  const row = current.closest('tr');
  if (!cell || !row) return;
  const col = Array.from(row.children).indexOf(cell);
  if (col < 0 || col > 3) return;
  const allRows = Array.from($('rows').children);
  let rowIndex = allRows.indexOf(row);
  let targetCol = col;
  if (event.key === 'ArrowLeft') targetCol--;
  if (event.key === 'ArrowRight') targetCol++;
  if (event.key === 'ArrowUp') rowIndex--;
  if (event.key === 'ArrowDown') rowIndex++;
  // Wrap horizontally at the start/end of a row.
  if (targetCol < 0) { targetCol = 3; rowIndex-- }
  if (targetCol > 3) { targetCol = 0; rowIndex++ }
  if (rowIndex < 0 || rowIndex >= allRows.length) return;
  const next = allRows[rowIndex].children[targetCol]?.querySelector('input,select');
  if (!next) return;
  event.preventDefault();
  next.focus();
  if (next.tagName === 'INPUT' && next.type === 'text') next.select();
});

$('targetMargin').addEventListener('input', () => { queueDraft(); renderCostRows() }); $('applySuggested').onclick = () => { if (isLocked()) return; const fr = $('lang').value === 'fr'; if (!confirm(fr ? 'Remplacer les prix de vente de chaque poste par les prix suggérés ?' : 'Replace each item selling price with the suggested price?')) return; const m = marginValue(); items.forEach(r => { const cost = num(r.materialCost) + num(r.laborCost); if (cost > 0) r.price = rnd(cost / (1 - m / 100)) }); render() }; $('quoteNo').value = initialEstimateNumber(); $('date').value = new Date().toLocaleDateString('en-CA'); try { const s = JSON.parse(localStorage.getItem('rc_settings')); if (s) { Object.entries(s).forEach(([k, v]) => { if (k !== 'region' && $(k) && $(k).type !== 'file') $(k).value = v }); populateRegionOptions(s.region); logo = s.logo || '' } } catch (e) { } if (!$('region').options.length) populateRegionOptions(); if (!$('region').value) { rcFillTaxSettings(); } else { rcShowTaxReferenceNotice(); } applyProjectTaxes(settings());['client', 'clientContact', 'project', 'quoteNo', 'date', 'notes', 'paymentSchedule'].forEach(id => $(id).addEventListener('input', queueDraft)); $('lang').onchange = () => { translate(); storeSettings() };['rate1', 'rate2', 'tax1', 'tax2'].forEach(k => $(k).addEventListener('input', () => { updateTaxWarning(); queueDraft() })); $('saveSettings').onclick = () => { if (!checkPhone(true)) return; if (storeSettings()) { updateTaxWarning(); refreshLogoPreview(); alert($('lang').value === 'fr' ? 'Paramètres enregistrés' : 'Settings saved') } }; $('add').onclick = () => {
  items.push({ description: '', unit: '', qty: 1, price: 0 });
  render();
  // After Enter or click on Add work, place focus in the new row's Description cell.
  const lastRow = $('rows').lastElementChild;
  const firstCell = lastRow?.querySelector('td:first-child input');
  if (firstCell) { firstCell.focus(); firstCell.select() }
};['pRate1', 'pRate2', 'pTax1', 'pTax2', 'currency'].forEach(k => $(k).addEventListener('input', update)); $('preview').onclick = () => {
  const el = $('quote'), show = !el.classList.contains('preview-visible');
  if (show) quote();
  el.classList.toggle('preview-visible', show);
  $('preview').textContent = show ? ($('lang').value === 'fr' ? 'Masquer l’aperçu' : 'Hide preview') : ($('lang').value === 'fr' ? 'Aperçu du devis' : 'Preview estimate');
  if (show) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

let lastValidation = [];
let liveValidationActive = false;
function clearValidationMarks() {
  document.querySelectorAll('.rc-invalid').forEach(el => { el.classList.remove('rc-invalid'); el.removeAttribute('aria-invalid') });
  document.querySelectorAll('.rc-error-note').forEach(el => el.remove());
  document.querySelectorAll('.rc-error-cell').forEach(el => el.classList.remove('rc-error-cell'));
}
function goToIssue(el) {
  if (!el) return;
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  try { el.focus({ preventScroll: true }) } catch (e) { el.focus() }
}
function validateEstimate(show = true) {
  const fr = $('lang').value === 'fr', issues = [];
  const add = (el, message) => {
    issues.push({ el, message });
    if (!show || !el) return;
    el.classList.add('rc-invalid');
    el.setAttribute('aria-invalid', 'true');
    const parent = el.closest('td') || el.parentElement;
    if (parent) {
      parent.classList.add('rc-error-cell');
      const note = document.createElement('small');
      note.className = 'rc-error-note';
      note.textContent = message;
      parent.append(note);
    }
  };
  if (show) clearValidationMarks();
  if (!$('client').value.trim()) add($('client'), fr ? 'Nom du client manquant.' : 'Client name is missing.');
  if (!$('project').value.trim()) add($('project'), fr ? 'Nom du projet manquant.' : 'Project name is missing.');
  if (!$('quoteNo').value.trim()) add($('quoteNo'), fr ? 'Numéro de devis manquant.' : 'Estimate number is missing.');
  const trs = [...$('rows').children];
  items.forEach((r, i) => {
    const n = i + 1, inputs = trs[i]?.querySelectorAll('input,select') || [];
    if (!String(r.description || '').trim()) add(inputs[0], fr ? `Ligne ${n} : description manquante.` : `Row ${n}: description is missing.`);
    if (!String(r.unit || '').trim()) add(inputs[1], fr ? `Ligne ${n} : unité manquante.` : `Row ${n}: unit is missing.`);
    if (!Number.isFinite(Number(r.qty)) || Number(r.qty) <= 0) add(inputs[2], fr ? `Ligne ${n} : quantité invalide.` : `Row ${n}: quantity must be greater than zero.`);
    if (!Number.isFinite(Number(r.price)) || Number(r.price) <= 0) add(inputs[3], fr ? `Ligne ${n} : prix unitaire nul ou invalide.` : `Row ${n}: unit price is zero or invalid.`);
  });
  lastValidation = issues;
  const box = $('validationResults');
  if (show) {
    box.replaceChildren();
    box.style.display = 'block';
    box.style.borderColor = issues.length ? '#c88746' : '#087b80';
    const title = document.createElement('div');
    title.className = 'rc-check-title';
    title.textContent = issues.length ? (fr ? `Vérification : ${issues.length} problème(s).` : `Estimate check: ${issues.length} issue(s).`) : (fr ? 'Vérification réussie : aucun problème détecté.' : 'Estimate check passed: no issues found.');
    box.append(title);
    issues.forEach(issue => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'rc-issue-link';
      b.textContent = issue.message;
      b.onclick = () => goToIssue(issue.el);
      box.append(b);
    });
    if (issues.length) {
      const first = document.createElement('button');
      first.type = 'button';
      first.textContent = fr ? 'Aller à la première erreur' : 'Go to first issue';
      first.onclick = () => goToIssue(issues[0].el);
      box.append(first);
    }
  }
  return issues.map(x => x.message);
}

// Recheck without stealing focus or scrolling, once a manual check has enabled
// inline validation. Keep the issue count and links synchronized with edits.
function refreshLiveValidation() {
  if (liveValidationActive) validateEstimate(true);
}
const estimatePanel = $('rows').closest('.panel');
estimatePanel.addEventListener('input', event => {
  if (!liveValidationActive) return;
  if (event.target.closest('#rows') || ['client', 'project', 'quoteNo'].includes(event.target.id)) {
    refreshLiveValidation();
  }
});
estimatePanel.addEventListener('change', event => {
  if (!liveValidationActive) return;
  if (event.target.closest('#rows')) {
    // A custom unit may rebuild the row synchronously in its change handler.
    queueMicrotask(refreshLiveValidation);
  }
});
// New or deleted work rows also need the current issue list refreshed.
$('add').addEventListener('click', () => queueMicrotask(refreshLiveValidation));
$('rows').addEventListener('click', event => {
  if (event.target.closest('button')) queueMicrotask(refreshLiveValidation);
});
// Revalidate when language changes, after the translated row controls are rebuilt.
$('lang').addEventListener('change', () => queueMicrotask(refreshLiveValidation));
$('validateEstimate').onclick = () => {
  liveValidationActive = true;
  const issues = validateEstimate(true);
  if (issues.length) goToIssue(lastValidation[0].el);
  else $('validationResults').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
};

$('pdf').onclick = async () => {
  const issues = validateEstimate(true);
  if (issues.length) {
    const fr = $('lang').value === 'fr';
    if (!confirm((fr ? 'Ce devis contient ' : 'This estimate has ') + issues.length + (fr ? ' problème(s). Continuer vers l’impression quand même ?' : ' issue(s). Continue to print anyway?'))) return;
  }
  quote();
  const img = $('qLogo');
  const data = companyLogo() || logo;
  if (data) {
    img.style.display = 'block';
    if (img.src !== data) img.src = data;
    try {
      if (!img.complete) await new Promise((resolve, reject) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', reject, { once: true });
      });
      if (img.decode) await img.decode();
    } catch (err) {
      alert($('lang').value === 'fr' ? 'Le logo ne peut pas être chargé pour l’impression. Vérifiez le fichier.' : 'Logo could not load for printing. Please check the image.');
      return;
    }
  }
  // Allow the browser to finish layout/painting before opening print preview.
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.print();
}; $('save').onclick = () => $('saveLocal').click(); $('loadBtn').onclick = () => { const id = $('savedProjects').value; if (id) { $('openLocal').click(); document.getElementById('client').focus() } else { if ($('load')) $('load').click(); else $('openLocal').click() } }; if ($('exportJson')) $('exportJson').onclick = () => { let url = URL.createObjectURL(new Blob([JSON.stringify(project(), null, 2)], { type: 'application/json' })), a = document.createElement('a'); a.href = url; a.download = 'reno-calc-project.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }; if ($('load')) $('load').onchange = async e => { try { const f = e.target.files[0]; if (!f || f.size > 5000000) throw Error(rcExtraTranslations[$('lang').value === 'fr' ? 'fr' : 'en'].invalidFile); const p = JSON.parse(await f.text()); if (!Array.isArray(p.items)) throw Error(rcExtraTranslations[$('lang').value === 'fr' ? 'fr' : 'en'].invalidProjectImport); if (p.settings && typeof p.settings === 'object') Object.entries(p.settings).forEach(([k, v]) => { if (k !== 'region' && $(k) && ['country', 'tax1', 'rate1', 'tax2', 'rate2', 'currency', 'company', 'email', 'phone', 'address', 'lang'].includes(k)) $(k).value = v }); populateRegionOptions(p.settings?.region); rcShowTaxReferenceNotice(); for (let k of ['client', 'clientContact', 'project', 'quoteNo', 'date', 'notes', 'paymentSchedule']) $(k).value = p[k] || ''; items = p.items.slice(0, 10000).map(r => ({ description: String(r.description || ''), unit: String(r.unit || ''), qty: num(r.qty), price: num(r.price), materialCost: num(r.materialCost), laborCost: num(r.laborCost) })); $('targetMargin').value = validMargin(p.targetMargin); logo = p.logo || ''; activeProjectId = null; translate(); queueDraft() } catch (err) { alert(err.message) } e.target.value = '' }; $('logo').onchange = e => { let f = e.target.files[0]; if (!f) return; if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type) || f.size > 1000000) { alert(rcExtraTranslations[$('lang').value === 'fr' ? 'fr' : 'en'].logoType); return } let r = new FileReader(); r.onload = () => { logo = r.result; if (storeSettings()) refreshLogoPreview() }; r.onerror = () => alert($('lang').value === 'fr' ? 'Impossible de lire le logo.' : 'Could not read the logo.'); r.readAsDataURL(f) }; $('accept').onchange = () => { $('continue').disabled = !$('accept').checked }; $('continue').onclick = () => { localStorage.setItem('rc_disclaimer_v1', JSON.stringify({ version: 1, acceptedAt: new Date().toISOString() })); $('modal').style.display = 'none' }; $('qLogo').onerror = () => { $('qLogo').style.display = 'none'; showStatus('storageError') }; translate(); $('finalizeEstimate').textContent = lockText('Finaliser le devis', 'Finalize estimate'); $('unlockEstimate').textContent = lockText('Déverrouiller le devis', 'Unlock estimate'); applyLock(); $('backupAll').textContent = backupText('Sauvegarder tous les devis', 'Backup all projects'); $('restoreAll').textContent = backupText('Restaurer une sauvegarde', 'Restore backup'); if (!localStorage.getItem('rc_disclaimer_v1')) $('modal').style.display = 'flex';

// Run after all startup handlers are installed.
clearTimeout(draftTimer); draftTimer = null; recoverDraft();


// Invoice/receipt records are stored separately from private contractor costs.
(() => {
 const $b=id=>document.getElementById(id);
 const dictionary={
 en:{heading:'Invoices & Receipts',help:'Create invoices, record separate payments, and print individual receipts or a full payment statement. Client documents never show private costs.',number:'Invoice number',date:'Invoice date',due:'Due date',paid:'New payment amount',paymentDate:'Payment date',method:'Payment method',reference:'Payment reference (optional)',addPayment:'Add Payment',history:'Payment history',remove:'Remove',create:'Create / Update Invoice',receipt:'Individual Payment Receipt',statement:'Full Payment Statement',print:'Print / Save PDF',save:'Save Invoice',saved:'Saved invoices',select:'Select invoice',open:'Open',delete:'Delete',bank:'Bank transfer',cash:'Cash',card:'Card',cheque:'Cheque',other:'Other',invoice:'INVOICE',receiptTitle:'PAYMENT RECEIPT',statementTitle:'PAYMENT STATEMENT',client:'Bill to',project:'Project',description:'Description',qty:'Qty',unit:'Unit',price:'Unit price',amount:'Amount',subtotal:'Subtotal',total:'Total',paidTotal:'Total paid',balance:'Balance due',payment:'Payment',statusSaved:'Invoice saved on this device.',statusOpened:'Invoice opened.',statusDeleted:'Invoice deleted.',statusCreate:'Invoice ready. Review before printing.',statusReceipt:'Individual receipt ready. Review before printing.',statusStatement:'Payment statement ready. Review before printing.',statusAdded:'Payment recorded. Save the invoice to keep it.',statusRemoved:'Payment removed. Save the invoice to keep this change.',missing:'Create or open an invoice first.',noPayment:'Record a payment first.',invalidAmount:'Enter a valid payment greater than zero.',tooMuch:'Payments cannot exceed the invoice total.',confirmDelete:'Delete the selected invoice?',confirmRemove:'Remove this payment?',noSelection:'Select a saved invoice first.',storage:'Unable to save invoice. Browser storage may be full or disabled.',taxNote:'Verify applicable taxes before issuing.',paymentSchedule:'Payment Schedule',noItems:'Add work items to the estimate first.',notes:'Notes',issued:'Issued',dueLabel:'Due',numberLabel:'Number',dateHeader:'Date',methodHeader:'Method',amountHeader:'Amount',refHeader:'Reference',status:'Status',unpaid:'Unpaid',partial:'Partially paid',complete:'Paid in full',receiptNumber:'Receipt number'},
 fr:{heading:'Factures et reçus',help:'Créez des factures, enregistrez des paiements distincts et imprimez des reçus individuels ou un relevé complet. Les coûts privés ne figurent jamais sur les documents clients.',number:'Numéro de facture',date:'Date de facture',due:'Date d’échéance',paid:'Montant du nouveau paiement',paymentDate:'Date du paiement',method:'Mode de paiement',reference:'Référence du paiement (facultative)',addPayment:'Ajouter le paiement',history:'Historique des paiements',remove:'Supprimer',create:'Créer / Actualiser la facture',receipt:'Reçu de paiement individuel',statement:'Relevé complet des paiements',print:'Imprimer / Enregistrer PDF',save:'Enregistrer la facture',saved:'Factures enregistrées',select:'Choisir une facture',open:'Ouvrir',delete:'Supprimer',bank:'Virement bancaire',cash:'Espèces',card:'Carte',cheque:'Chèque',other:'Autre',invoice:'FACTURE',receiptTitle:'REÇU DE PAIEMENT',statementTitle:'RELEVÉ DES PAIEMENTS',client:'Facturer à',project:'Projet',description:'Description',qty:'Qté',unit:'Unité',price:'Prix unitaire',amount:'Montant',subtotal:'Sous-total',total:'Total',paidTotal:'Total payé',balance:'Solde dû',payment:'Paiement',statusSaved:'Facture enregistrée sur cet appareil.',statusOpened:'Facture ouverte.',statusDeleted:'Facture supprimée.',statusCreate:'Facture prête. Vérifiez-la avant l’impression.',statusReceipt:'Reçu individuel prêt. Vérifiez-le avant l’impression.',statusStatement:'Relevé prêt. Vérifiez-le avant l’impression.',statusAdded:'Paiement enregistré. Enregistrez la facture pour le conserver.',statusRemoved:'Paiement supprimé. Enregistrez la facture pour conserver ce changement.',missing:'Créez ou ouvrez d’abord une facture.',noPayment:'Enregistrez d’abord un paiement.',invalidAmount:'Saisissez un paiement valide supérieur à zéro.',tooMuch:'Les paiements ne peuvent pas dépasser le total de la facture.',confirmDelete:'Supprimer la facture sélectionnée ?',confirmRemove:'Supprimer ce paiement ?',noSelection:'Choisissez d’abord une facture enregistrée.',storage:'Impossible d’enregistrer la facture. Le stockage du navigateur est peut-être plein ou désactivé.',taxNote:'Vérifiez les taxes applicables avant l’émission.',paymentSchedule:'Calendrier des paiements',noItems:'Ajoutez d’abord des postes au devis.',notes:'Notes',issued:'Émise',dueLabel:'Échéance',numberLabel:'Numéro',dateHeader:'Date',methodHeader:'Mode',amountHeader:'Montant',refHeader:'Référence',status:'Statut',unpaid:'Non payée',partial:'Partiellement payée',complete:'Payée intégralement',receiptNumber:'Numéro de reçu'}
 };
 const lang=()=> $b('lang').value==='fr'?'fr':'en',w=k=>dictionary[lang()][k]||k;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const cents=x=>Math.round(Number(x)*100),money=(n,cur)=>new Intl.NumberFormat(lang()==='fr'?'fr-CA':'en-CA',{style:'currency',currency:cur==='USD'?'USD':'CAD'}).format(n/100);
 const key='rc_invoices_v1';let current=null,docType='invoice',receiptId=null;
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
 const status=k=>$b('billStatus').textContent=w(k);
 function records(){try{const r=JSON.parse(localStorage.getItem(key)||'{}');return r&&typeof r==='object'&&!Array.isArray(r)?r:{}}catch{return {}}}
 function normalize(r){if(!Array.isArray(r.payments)){r.payments=[];if(Number(r.paid)>0){r.payments.push({id:'legacy-'+r.id,date:r.paymentDate||r.date||today(),amount:cents(r.paid),method:r.method||'other',reference:''})}}r.payments=r.payments.filter(p=>p&&Number.isInteger(p.amount)&&p.amount>0);return r}
 const totalPaid=()=>current?current.payments.reduce((a,p)=>a+p.amount,0):0;
 const method=()=>document.querySelector('input[name="billPaymentMethod"]:checked')?.value||'bank';
 function setMethod(m){const r=document.querySelector('input[name="billPaymentMethod"][value="'+String(m||'bank')+'"]');(r||document.querySelector('input[name="billPaymentMethod"][value="other"]')).checked=true}
 function refreshSelect(){const el=$b('billSaved'),old=el.value,all=records();el.replaceChildren(new Option(w('select'),''));Object.entries(all).sort((a,b)=>String(b[1].savedAt||'').localeCompare(String(a[1].savedAt||''))).forEach(([id,r])=>el.add(new Option((r.number||id)+' — '+(r.client||''),id)));if(all[old])el.value=old}
 function renderHistory(){const el=$b('billPaymentHistory');if(!current){el.innerHTML='';return}let rows=current.payments.map((p,i)=>`<tr><td>${esc(p.date)}</td><td>${esc(w(p.method))}</td><td>${esc(p.reference||'—')}</td><td class="bill-right">${esc(money(p.amount,current.currency))}</td><td><button type="button" class="bill-remove" data-payment-id="${esc(p.id)}">${esc(w('remove'))}</button></td></tr>`).join('');el.innerHTML=`<h3>${esc(w('history'))}</h3><div class="bill-table-scroll"><table><thead><tr><th>${esc(w('dateHeader'))}</th><th>${esc(w('methodHeader'))}</th><th>${esc(w('refHeader'))}</th><th class="bill-right">${esc(w('amountHeader'))}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><p><strong>${esc(w('paidTotal'))}: ${esc(money(totalPaid(),current.currency))}</strong> · ${esc(w('balance'))}: ${esc(money(Math.max(0,cents(current.total)-totalPaid()),current.currency))}</p>`;el.querySelectorAll('[data-payment-id]').forEach(b=>b.onclick=()=>{if(!confirm(w('confirmRemove')))return;current.payments=current.payments.filter(p=>p.id!==b.dataset.paymentId);if(receiptId===b.dataset.paymentId)receiptId=null;renderHistory();renderDocument();status('statusRemoved')})}
 function translate(){const ids={billingHeading:'heading',billingHelp:'help',billNumberLabel:'number',billDateLabel:'date',billDueLabel:'due',billPaidLabel:'paid',billPaymentDateLabel:'paymentDate',billReferenceLabel:'reference',billMethodLabel:'method',billAddPayment:'addPayment',billCreate:'create',billReceipt:'receipt',billStatement:'statement',billPrint:'print',billSave:'save',billSavedLabel:'saved',billOpen:'open',billDelete:'delete'};Object.entries(ids).forEach(([id,k])=>$b(id).textContent=w(k));document.querySelectorAll('[data-bill-method]').forEach(el=>el.textContent=w(el.dataset.billMethod));refreshSelect();renderHistory();renderDocument()}
 function build(){if(!items.length||!items.some(r=>String(r.description||'').trim())){status('noItems');return false}const c=calc(),previous=current&&current.number===$b('billNumber').value?current:null;const r={id:previous?.id||('inv_'+Date.now()+'_'+Math.random().toString(36).slice(2,8)),number:$b('billNumber').value.trim()||('INV-'+Date.now().toString().slice(-7)),date:$b('billDate').value,due:$b('billDue').value,company:$b('company').value,email:$b('email').value,phone:$b('phone').value,address:$b('address').value,client:$b('client').value,clientContact:$b('clientContact').value,project:$b('project').value,notes:$b('notes').value,paymentSchedule:$b('paymentSchedule').value,currency:$b('currency').value,logo:typeof logo==='string'?logo:'',rows:items.map(x=>({description:String(x.description||''),unit:String(x.unit||''),qty:Number(x.qty)||0,price:Number(x.price)||0})),tax1:$b('pTax1').value,tax2:$b('pTax2').value,rate1:Number($b('pRate1').value)||0,rate2:Number($b('pRate2').value)||0,subtotal:c.subtotal,taxAmount1:c.tax1,taxAmount2:c.tax2,total:c.total,payments:previous?normalize(previous).payments:[]};if(r.payments.reduce((a,p)=>a+p.amount,0)>cents(r.total)){status('tooMuch');return false}current=r;return true}
 function renderDocument(){if(!current)return;const r=current,paid=totalPaid(),balance=Math.max(0,cents(r.total)-paid),p=current.payments.find(x=>x.id===receiptId)||current.payments[current.payments.length-1];const title=docType==='receipt'?w('receiptTitle'):docType==='statement'?w('statementTitle'):w('invoice');const line=(label,val,cls='')=>`<p class="${cls}"><span>${esc(label)}</span><strong>${esc(val)}</strong></p>`;const itemRows=r.rows.map(x=>`<tr><td>${esc(x.description)}</td><td>${esc(x.unit)}</td><td class="bill-right">${esc(x.qty)}</td><td class="bill-right">${esc(money(cents(x.price),r.currency))}</td><td class="bill-right">${esc(money(cents(x.qty*x.price),r.currency))}</td></tr>`).join('');const paymentRows=r.payments.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(w(x.method))}</td><td>${esc(x.reference||'—')}</td><td class="bill-right">${esc(money(x.amount,r.currency))}</td></tr>`).join('');const paymentTable=`<h3>${esc(w('history'))}</h3><table><thead><tr><th>${esc(w('dateHeader'))}</th><th>${esc(w('methodHeader'))}</th><th>${esc(w('refHeader'))}</th><th class="bill-right">${esc(w('amountHeader'))}</th></tr></thead><tbody>${paymentRows}</tbody></table>`;const receiptInfo=docType==='receipt'&&p?`<h3>${esc(w('payment'))}</h3>${line(w('receiptNumber'),r.number+'-'+(current.payments.indexOf(p)+1))}${line(w('dateHeader'),p.date)}${line(w('method'),w(p.method))}${p.reference?line(w('reference'),p.reference):''}${line(w('amountHeader'),money(p.amount,r.currency),'bill-total')}`:'';const paymentStatus=paid===0?'unpaid':balance===0?'complete':'partial';$b('billingDocument').innerHTML=`<div class="bill-head"><div>${r.logo?`<img class="bill-logo" alt="" src="${esc(r.logo)}">`:''}<h2>${esc(r.company)}</h2><div>${esc(r.address).replace(/\n/g,'<br>')}</div><div>${esc(r.email)}</div><div>${esc(r.phone)}</div></div><div class="bill-right"><h2>${esc(title)}</h2><div>${esc(w('numberLabel'))}: ${esc(r.number)}</div><div>${esc(w('issued'))}: ${esc(r.date)}</div><div>${esc(w('dueLabel'))}: ${esc(r.due)}</div></div></div><div class="bill-meta"><div><strong>${esc(w('client'))}</strong><div>${esc(r.client)}</div><div>${esc(r.clientContact).replace(/\n/g,'<br>')}</div></div><div><strong>${esc(w('project'))}</strong><div>${esc(r.project)}</div></div></div><table><thead><tr><th>${esc(w('description'))}</th><th>${esc(w('unit'))}</th><th class="bill-right">${esc(w('qty'))}</th><th class="bill-right">${esc(w('price'))}</th><th class="bill-right">${esc(w('amount'))}</th></tr></thead><tbody>${itemRows}</tbody></table><div class="bill-summary">${line(w('subtotal'),money(cents(r.subtotal),r.currency))}${r.tax1?line(r.tax1+' ('+r.rate1+'%)',money(cents(r.taxAmount1),r.currency)):''}${r.tax2?line(r.tax2+' ('+r.rate2+'%)',money(cents(r.taxAmount2),r.currency)):''}${line(w('total'),money(cents(r.total),r.currency),'bill-total')}${line(w('paidTotal'),money(paid,r.currency))}${line(w('balance'),money(balance,r.currency),'bill-total')}${line(w('status'),w(paymentStatus))}</div>${receiptInfo}${docType==='statement'?paymentTable:''}${r.notes?`<p><strong>${esc(w('notes'))}:</strong> ${esc(r.notes)}</p>`:''}${r.paymentSchedule?`<p><strong>${esc(w('paymentSchedule'))}:</strong> ${esc(r.paymentSchedule).replace(/\n/g,'<br>')}</p>`:''}<p class="muted">${esc(w('taxNote'))}</p>`;$b('billingDocument').hidden=false}
 function syncMeta(){if(!current)return;current.number=$b('billNumber').value.trim()||current.number;current.date=$b('billDate').value;current.due=$b('billDue').value}
 $b('billDate').value=today();$b('billDue').value=(()=>{const d=new Date();d.setDate(d.getDate()+30);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')})();$b('billPaymentDate').value=today();$b('billNumber').value='INV-'+Date.now().toString().slice(-7);
 $b('billCreate').onclick=()=>{if(build()){docType='invoice';renderHistory();renderDocument();status('statusCreate')}};
 $b('billAddPayment').onclick=()=>{if(!current){status('missing');return}syncMeta();const raw=$b('billPaid').value,amount=cents(raw);if(raw.trim()===''||!Number.isSafeInteger(amount)||amount<=0){status('invalidAmount');return}if(totalPaid()+amount>cents(current.total)){status('tooMuch');return}const payment={id:'pay_'+Date.now()+'_'+Math.random().toString(36).slice(2,9),date:$b('billPaymentDate').value||today(),amount,method:method(),reference:$b('billReference').value.trim()};current.payments.push(payment);receiptId=payment.id;$b('billPaid').value='';$b('billReference').value='';docType='invoice';renderHistory();renderDocument();status('statusAdded')};
 $b('billReceipt').onclick=()=>{if(!current){status('missing');return}syncMeta();if(!current.payments.length){status('noPayment');return}if(!current.payments.some(p=>p.id===receiptId))receiptId=current.payments[current.payments.length-1].id;docType='receipt';renderDocument();status('statusReceipt')};
 $b('billStatement').onclick=()=>{if(!current){status('missing');return}syncMeta();docType='statement';renderDocument();status('statusStatement')};
 $b('billPrint').onclick=()=>{if(!current){status('missing');return}syncMeta();renderDocument();document.body.classList.add('rc-print-billing');window.print()};window.addEventListener('afterprint',()=>document.body.classList.remove('rc-print-billing'));
 $b('billSave').onclick=()=>{if(!current){status('missing');return}syncMeta();const all=records();current.savedAt=new Date().toISOString();all[current.id]=current;try{localStorage.setItem(key,JSON.stringify(all));refreshSelect();$b('billSaved').value=current.id;renderDocument();status('statusSaved');if(typeof updateBackupStatus==='function')updateBackupStatus()}catch{status('storage')}};
 $b('billOpen').onclick=()=>{const rec=records()[$b('billSaved').value];if(!rec){status('noSelection');return}current=normalize(rec);[['billNumber','number'],['billDate','date'],['billDue','due']].forEach(([id,k])=>$b(id).value=rec[k]||'');$b('billPaid').value='';$b('billReference').value='';receiptId=current.payments[current.payments.length-1]?.id||null;docType='invoice';renderHistory();renderDocument();status('statusOpened')};
 $b('billDelete').onclick=()=>{const id=$b('billSaved').value;if(!records()[id]){status('noSelection');return}if(!confirm(w('confirmDelete')))return;const all=records();delete all[id];try{localStorage.setItem(key,JSON.stringify(all));if(current?.id===id){current=null;$b('billingDocument').hidden=true;renderHistory()}refreshSelect();status('statusDeleted')}catch{status('storage')}};
 window.rcRefreshInvoices=refreshSelect;$b('lang').addEventListener('change',translate);translate();
})();


// Section navigation: only one area is visible at a time; Settings opens first.
(() => {
  const groups = { settings: ['settingsSection'], projects: ['projectsSection'], estimate: ['estimateSection', 'quote'], costs: ['privateCosts'], billing: ['billingSection'] };
  const labels = {
    en: { settings: 'Settings', projects: 'Saved projects', estimate: 'Estimate', costs: 'Cost & profit', billing: 'Invoices' },
    fr: { settings: 'Paramètres', projects: 'Projets enregistrés', estimate: 'Devis', costs: 'Coûts et profit', billing: 'Factures' }
  };
  const nav = document.getElementById('mainNav');
  function showSection(name) {
    for (const [key, ids] of Object.entries(groups)) for (const id of ids) document.getElementById(id)?.classList.toggle('rc-tab-hidden', key !== name);
    nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-current', b.dataset.nav === name ? 'true' : 'false'));
    window.scrollTo(0, 0);
  }
  function navLabels() { const l = labels[document.getElementById('lang').value === 'fr' ? 'fr' : 'en']; nav.querySelectorAll('button').forEach(b => b.textContent = l[b.dataset.nav]) }
  nav.querySelectorAll('button').forEach(b => b.addEventListener('click', () => showSection(b.dataset.nav)));
  document.getElementById('lang').addEventListener('change', navLabels);
  // Opening a saved project or starting a new estimate takes the user to the Estimate section.
  document.getElementById('openLocal').addEventListener('click', () => { const id = document.getElementById('savedProjects').value; if (id && activeProjectId === id) showSection('estimate') });
  document.getElementById('newProject').addEventListener('click', () => { if (!activeProjectId) showSection('estimate') });
  navLabels(); showSection('settings');
})();
