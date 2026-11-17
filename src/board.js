// "לוח העסק" as a real board: a cork board in a wooden frame, and every finished step pins one note
// onto its zone. The zones follow the Business Model Canvas (money on top, the customer side in the
// middle row, the behind-the-scenes blocks folded into one zone).
// The board always looks like a board, never like an empty form:
// - a note still to come is a faded "waiting note" with the short question it will answer (what is missing);
// - the zone of the next step is lit, and its waiting note says "הבא: ..." (what to do now);
// - "הלוח המלא" shows the same board full, with the month on target (the desired state).
// From "לקוחות משלמים" the built customer zones get one number card pinned on top of their notes.
import { html, Icon, PencilCheck, cx } from './lib.js';
import { AREAS, STEPS, NUMBERS_STEP, MONEY_ASK, USER } from './data.js';
import { viewOf } from './canvas.js';

const TILTS = [-1.6, 1.2, -0.8, 1.5, -1.2, 0.7];
const tiltOf = (i) => TILTS[i % TILTS.length];

const Pin = ({ tone }) => html`<i class=${cx('bd-pin', tone && `is-${tone}`)} aria-hidden="true"></i>`;

function StepNote({ i, fresh }) {
  const s = STEPS[i];
  return html`<span class=${cx('bd-note', fresh === i && 'is-new')} style=${{ '--tilt': `${tiltOf(i)}deg` }} title=${s.name}><${Pin} /><b>${s.note}</b></span>`;
}

// A note that is not there yet: the question it will answer, or "הבא: <step>" for the next one.
function Waiting({ i, next, text }) {
  return html`<span class=${cx('bd-wait', next && 'is-next')} style=${{ '--tilt': `${next ? 0 : tiltOf(i) * 0.5}deg` }}>
    <i class="bd-pin-hole" aria-hidden="true"></i>
    ${next ? html`<${Icon} name="pencil" size=${15} /><b>הבא: ${STEPS[i].name}</b>` : html`<span>${text}</span>`}
  </span>`;
}

function Zone({ area, current, sc, fixed, weak, hot, fresh, onOpen }) {
  const v = viewOf(area, current, sc, fixed);
  const isMoney = area.row === 'money';
  const done = isMoney ? [] : area.steps.filter((i) => i < current);
  const todo = isMoney ? [] : area.steps.filter((i) => i >= current);
  const ch = STEPS[area.steps[0]].ch;
  const hasNext = isMoney ? current === NUMBERS_STEP && area.id === 'in' : todo.includes(current);
  const closed = isMoney ? current < NUMBERS_STEP : !done.length && !hasNext;

  let body;
  if (isMoney) {
    if (current <= NUMBERS_STEP) {
      body = html`<${Waiting} i=${NUMBERS_STEP} next=${hasNext} text=${MONEY_ASK[area.id]} />
        ${current === 0 && area.id === 'in' && html`<span class="hand bd-hand">כל שלב = פתק</span>`}`;
    } else if (v.kind === 'notes') {
      body = html`<span class=${cx('bd-note', fresh === NUMBERS_STEP && 'is-new')} style=${{ '--tilt': `${area.id === 'in' ? -1.2 : 1.3}deg` }}><${Pin} /><b>${v.notes[0]}</b></span>`;
    }
  }
  // A live number only where the zone is already built (no "0" on a zone whose chapter is still closed).
  const card =
    v.kind === 'live' &&
    (isMoney || done.length > 0) &&
    html`<span class="bd-card" style=${{ '--tilt': `${area.id === 'left' ? 1.1 : -0.9}deg` }}>
      <${Pin} tone=${hot ? 'amber' : 'white'} />
      <span class="bd-big"><b class=${cx(v.money && 'is-money')}>${v.big}</b><em>${v.small}</em></span>
      ${v.bar != null && html`<span class="cv-bar" aria-hidden="true"><i style=${{ width: `${Math.min(100, v.bar * 100)}%` }}></i><u style=${{ insetInlineStart: `${Math.min(1, v.mark) * 100}%` }} title="איפה צריך להיות היום"></u></span>`}
    </span>`;

  const status = hot
    ? null
    : weak
      ? html`<span class="cv-dot is-weak" title="מתחת לקצב"></span>`
      : closed
        ? html`<span class="bd-chip">פרק ${ch + 1}</span>`
        : !isMoney && done.length === area.steps.length
          ? html`<${PencilCheck} size=${16} color="#0038b8" weight=${3} />`
          : !isMoney
            ? html`<span class="bd-count">${done.length}/${area.steps.length}</span>`
            : null;

  const said = isMoney ? (v.kind === 'live' ? `${v.big}, ${v.small}` : v.kind === 'notes' ? v.notes[0] : MONEY_ASK[area.id]) : done.length ? done.map((i) => STEPS[i].note).join(', ') : `חסר: ${todo.map((i) => STEPS[i].ask).join(' ')}`;
  return html`<button type="button" class=${cx('bd-zone', isMoney && 'is-money', area.id === 'back' && 'is-back', closed && 'is-locked', hasNext && 'has-next', hot && 'is-hot')} style=${{ '--span': area.span }} aria-label=${`${area.label}. ${said}${hot ? '. צוואר הבקבוק' : ''}`} onClick=${() => onOpen(area.id)}>
    <span class="bd-label"><${Icon} name=${area.icon} size=${16} />${area.label}${status && html`<span class="ms-1 inline-flex">${status}</span>`}</span>
    <span class="bd-stack">
      ${card}
      ${body}
      ${done.map((i) => html`<${StepNote} key=${i} i=${i} fresh=${fresh} />`)}
      ${todo.map((i) => html`<${Waiting} key=${i} i=${i} next=${i === current} text=${STEPS[i].ask} />`)}
    </span>
    ${hot && html`<span class="cv-hot-tag bd-hot-tag">צוואר הבקבוק</span>`}
  </button>`;
}

export function Board({ current, sc, fixed, health, fresh, onOpen, side, peek, onPeek }) {
  const named = current > 5; // "שם ולוגו" done: the board carries the business name
  const notes = Math.min(current, STEPS.length);
  return html`<div class=${cx('bd-frame', peek && 'is-peek')}>
    <span class="bd-plate">${peek ? 'ככה נראה עסק בקצב' : html`${named ? USER.business : `הלוח של ${USER.firstName}`}<small>${notes}/${STEPS.length} פתקים</small>`}</span>
    <button type="button" class=${cx('bd-peek', peek && 'is-on')} onClick=${onPeek} aria-pressed=${!!peek}>
      <${Icon} name=${peek ? 'arrow-right' : 'eye'} size=${16} />${peek ? 'חזרה ללוח שלי' : current >= STEPS.length ? 'המצב הרצוי' : 'הלוח המלא'}
    </button>
    <div class="bd-cork">
      <div class="bd-zones" role="group" aria-label=${peek ? 'דוגמה: הלוח המלא' : 'לוח העסק'}>
        ${AREAS.map((a) => html`<${Zone} key=${a.id} area=${a} current=${current} sc=${sc} fixed=${fixed} weak=${health.weak[a.id]} hot=${health.bottleneck === a.id} fresh=${fresh} onOpen=${onOpen} />`)}
      </div>
      <div class="bd-side">${side}</div>
    </div>
  </div>`;
}
