// "לוח העסק": one table drawn on the notebook page (not nine cards), after the Business Model Canvas.
// Money on top, the customer side in the middle row, the behind-the-scenes blocks folded into one area.
// While building (steps 1-11) each area shows the short notes its steps wrote. From "לקוחות משלמים"
// the customer areas show one live number each, and the weakest one is marked as the bottleneck.
import { html, Icon, PencilCheck, cx, money } from './lib.js';
import { Sheet } from './ui.js';
import { Button } from './components.js';
import { AREAS, STEPS, CHAPTERS, TARGET, FIX, NUMBERS_STEP } from './data.js';

const ORDER = ['reach', 'clients', 'keep']; // the funnel: the first weak area is the bottleneck

// Health of the live areas: under 60% of where the month's pace should be = needs attention.
export function healthOf(sc, fixed) {
  const m = sc.month;
  if (!m) return { weak: {}, bottleneck: null };
  const pace = (v, t) => v / (t * m.pct);
  const weak = {
    reach: pace(m.leads, TARGET.leads) < 0.6,
    clients: pace(m.clients, TARGET.clients) < 0.6,
    keep: m.waiting > 0,
    in: pace(m.revenue, TARGET.revenue) < 0.6,
  };
  Object.keys(fixed).forEach((k) => fixed[k] && (weak[k] = false));
  return { weak, bottleneck: ORDER.find((k) => weak[k]) || null };
}

function lockedLine(area) {
  const ch = STEPS[area.steps[0]].ch;
  return `נפתח בפרק ${ch + 1} · ${CHAPTERS[ch].title}`;
}

// What one area shows. kind: 'live' (a number), 'notes', 'locked'.
export function viewOf(area, current, sc, fixed) {
  const done = area.steps.filter((i) => i < current);
  const next = area.steps.includes(current) ? current : null;
  const m = sc.month;
  // Up to two notes, in the order that says the most (area.pick), e.g. the product and price before the slogan.
  const v = { done, next, notes: (area.pick || area.steps).filter((i) => i < current).slice(0, 2).map((i) => STEPS[i].note) };
  if (area.row === 'money') {
    if (current <= NUMBERS_STEP) return { ...v, kind: 'locked', line: 'נקבע ב"העסק במספרים"' };
    // Before "לקוחות משלמים" there is no real income yet: the goal and the costs as notes, no big number.
    if (!m)
      return area.id === 'in'
        ? { ...v, kind: 'notes', notes: [`יעד ${money(TARGET.revenue)} בחודש`], line: 'מתחיל לזוז ב"לקוחות משלמים"' }
        : { ...v, kind: 'notes', notes: [`הוצאות ${money(2100)} בחודש`] };
    if (area.id === 'in') return { ...v, kind: 'live', big: money(m.revenue), money: true, small: `מתוך ${money(TARGET.revenue)}`, bar: m.revenue / TARGET.revenue, mark: m.pct };
    return { ...v, kind: 'live', big: money(m.revenue - m.costs), money: true, small: `אחרי ${money(m.costs)} הוצאות` };
  }
  if (m && area.id === 'reach') {
    const d = m.leads - m.leadsWas;
    return { ...v, kind: 'live', big: m.leads, small: fixed.reach ? FIX.reach.done : `פניות · ${d === 0 ? 'כמו בחודש שעבר' : `${Math.abs(d)} ${d > 0 ? 'יותר' : 'פחות'} מהחודש שעבר`}` };
  }
  if (m && area.id === 'clients') return { ...v, kind: 'live', big: m.clients, small: fixed.clients ? FIX.clients.done : `מתוך ${TARGET.clients} החודש` };
  if (m && area.id === 'keep') {
    const w = fixed.keep ? 0 : m.waiting;
    return { ...v, kind: 'live', big: w, small: fixed.keep ? FIX.keep.done : w ? `בלי מגע ${m.waitingDays} יום` : 'כולם בקשר' };
  }
  if (!done.length && next == null) return { ...v, kind: 'locked', line: lockedLine(area) };
  return { ...v, kind: 'notes' };
}

function Cell({ area, view, weak, hot, fresh, onOpen }) {
  const allDone = view.done.length === area.steps.length;
  const status = hot
    ? null
    : weak
      ? html`<span class="cv-dot is-weak" title="מתחת לקצב"></span>`
      : view.kind === 'live' && !view.quiet
        ? html`<span title="בקצב"><${PencilCheck} size=${18} color="#0038b8" weight=${3} /></span>`
        : allDone
          ? html`<span title="נבנה"><${PencilCheck} size=${18} color="#0038b8" weight=${3} /></span>`
          : view.done.length
            ? html`<span class="cv-count">${view.done.length}/${area.steps.length}</span>`
            : null;
  const label = `${area.label}. ${view.kind === 'live' ? `${view.big}, ${view.small}` : view.kind === 'locked' ? view.line : view.notes.join(', ')}${hot ? '. צוואר הבקבוק' : ''}`;
  return html`<button type="button" class=${cx('cv-cell', `is-${view.kind}`, hot && 'is-hot', view.next != null && 'has-next', area.row === 'money' && 'is-money', area.id === 'back' && 'is-back')} style=${{ '--span': area.span }} aria-label=${label} onClick=${() => onOpen(area.id)}>
    <span class="cv-head"><${Icon} name=${area.icon} size=${20} /><b>${area.label}</b><span class="ms-auto">${status}</span></span>
    ${view.kind === 'live' &&
    html`<span class="cv-big"><b class=${cx(view.money && 'is-money', view.quiet && 'is-quiet')}>${view.big}</b><small>${view.small}</small></span>
      ${view.bar != null && html`<span class="cv-bar" aria-hidden="true"><i style=${{ width: `${Math.min(100, view.bar * 100)}%` }}></i><u style=${{ insetInlineStart: `${view.mark * 100}%` }} title="איפה צריך להיות היום"></u></span>`}`}
    ${view.kind === 'notes' && html`<span class="cv-notes">${view.notes.map((n, k) => html`<span key=${n} class=${cx('cv-note', fresh != null && STEPS[fresh].note === n && 'is-new')} style=${{ '--tilt': `${k ? 1.2 : -1.4}deg` }}>${n}</span>`)}</span>`}
    ${view.line && html`<span class="cv-locked">${view.line}</span>`}
    ${hot && html`<span class="cv-hot-tag">צוואר הבקבוק</span>`}
    ${view.next != null && html`<span class="cv-next"><${Icon} name="pencil" size=${15} />הבא: ${STEPS[view.next].name}</span>`}
  </button>`;
}

export function Board({ current, sc, fixed, health, fresh, onOpen }) {
  return html`<div class="cv-table" role="group" aria-label="לוח העסק">
    ${AREAS.map((a) => html`<${Cell} key=${a.id} area=${a} view=${viewOf(a, current, sc, fixed)} weak=${health.weak[a.id]} hot=${health.bottleneck === a.id} fresh=${fresh} onOpen=${onOpen} />`)}
  </div>`;
}

// ---------- the window behind an area ----------
function StepRow({ i, current, notify }) {
  const st = STEPS[i];
  const done = i < current;
  return html`<li class="flex flex-col gap-1.5 border-b border-line py-2.5 last:border-0">
    <span class="flex items-center gap-2">
      <span class="grid h-5 w-5 shrink-0 place-items-center">${done ? html`<${PencilCheck} size=${16} color="#0038b8" weight=${3} />` : i === current ? html`<${Icon} name="pencil" size=${15} class="text-brand-600" />` : html`<i class="h-3 w-3 rounded-full border-[1.5px] border-dashed border-faint"></i>`}</span>
      <b class=${cx('flex-1 text-[16px]', !done && 'text-muted')}>${st.name}</b>
      ${done ? html`<span class="cv-note !text-[14px]">${st.note}</span>` : html`<small class="text-[12px] font-semibold text-muted">${i === current ? 'הבא · ' : ''}${st.min} דק׳</small>`}
    </span>
    ${done && html`<span class="flex flex-wrap gap-1.5 ps-7">${st.out.map((o) => html`<button key=${o} type="button" class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-semibold text-brand-600 ring-1 ring-brand-200 hover:bg-brand-50 cursor-pointer" onClick=${() => notify(`במערכת: "${o}" נפתח`, 'file-text')}><${Icon} name="file-text" size=${14} />${o}</button>`)}</span>`}
  </li>`;
}

export function AreaSheet({ id, current, sc, fixed, health, onClose, onStart, onFix, notify }) {
  const area = AREAS.find((a) => a.id === id);
  const view = viewOf(area, current, sc, fixed);
  const hot = health.bottleneck === id;
  const next = view.next;
  const footer = hot
    ? html`<span class="fb-meta">${FIX[id].meta}</span><${Button} onClick=${() => (onClose(), onFix())}>${FIX[id].cta}<${Icon} name="arrow-left" size=${20} /><//>`
    : next != null
      ? html`<span class="fb-meta">${STEPS[next].name} · כ-${STEPS[next].min} דקות</span><${Button} onClick=${() => (onClose(), onStart())}>מתחילים<${Icon} name="arrow-left" size=${20} /><//>`
      : html`<span class="fb-meta">${area.book}</span><${Button} variant="secondary" onClick=${onClose}>חזרה ללוח<//>`;
  return html`<${Sheet} title=${area.label} onClose=${onClose} footer=${footer}>
    ${view.kind === 'live' &&
    html`<div class=${cx('mb-4 rounded-xl px-4 py-3', hot ? 'bg-warn-50' : 'bg-brand-50')}>
      <b class=${cx('font-display text-[36px] font-extrabold leading-none tabular-nums', view.money ? 'text-money' : 'text-ink')}>${view.big}</b>
      <span class="ms-2 text-[14px] font-semibold text-muted">${view.small}</span>
      ${hot && html`<p class="mt-1.5 text-[14px] font-semibold text-warn">זה צוואר הבקבוק עכשיו, ולכן זה "הדבר הבא".</p>`}
    </div>`}
    ${view.kind === 'locked' && html`<p class="mb-3 text-[16px] text-muted">${view.line}</p>`}
    ${area.groups
      ? area.groups.map(
          (gr) => html`<section key=${gr.label} class="mb-2"><p class="fb-eyebrow mb-1">${gr.label}</p><ul>${gr.steps.map((i) => html`<${StepRow} key=${i} i=${i} current=${current} notify=${notify} />`)}</ul></section>`,
        )
      : html`<p class="fb-eyebrow mb-1">${area.row === 'money' ? 'נבנה ב' : 'נבנה כאן'}</p><ul>${area.steps.map((i) => html`<${StepRow} key=${i} i=${i} current=${current} notify=${notify} />`)}</ul>`}
  <//>`;
}
