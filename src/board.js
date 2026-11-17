// "לוח העסק" as a real board: a cork board in a wooden frame, and every finished step pins one note
// onto its zone. The zones follow the Business Model Canvas (money on top, the customer side in the
// middle row, the behind-the-scenes blocks folded into one zone). An empty zone shows dashed places
// for the notes still to come, so on the first visit the whole board is there, waiting to be filled.
// From "לקוחות משלמים" the customer zones get one number card pinned on top of their notes.
import { html, Icon, PencilCheck, cx } from './lib.js';
import { AREAS, STEPS, CHAPTERS, NUMBERS_STEP, USER } from './data.js';
import { viewOf } from './canvas.js';

const TILTS = [-1.6, 1.2, -0.8, 1.5, -1.2, 0.7];
const tiltOf = (i) => TILTS[i % TILTS.length];

const Pin = ({ tone }) => html`<i class=${cx('bd-pin', tone && `is-${tone}`)} aria-hidden="true"></i>`;

function StepNote({ i, fresh }) {
  const s = STEPS[i];
  return html`<span class=${cx('bd-note', fresh === i && 'is-new')} style=${{ '--tilt': `${tiltOf(i)}deg` }} title=${s.name}><${Pin} /><b>${s.note}</b></span>`;
}

function Ghost({ next, text }) {
  return html`<span class=${cx('bd-ghost', next && 'is-next')}>${next && html`<${Icon} name="pencil" size=${15} />`}${text}</span>`;
}

function Zone({ area, current, sc, fixed, weak, hot, fresh, onOpen }) {
  const v = viewOf(area, current, sc, fixed);
  const isMoney = area.row === 'money';
  const done = isMoney ? [] : area.steps.filter((i) => i < current);
  const todo = isMoney ? [] : area.steps.filter((i) => i >= current);
  const locked = !isMoney && !done.length && !todo.includes(current);
  const ch = STEPS[area.steps[0]].ch;

  let body;
  if (isMoney) {
    if (current <= NUMBERS_STEP) {
      const next = current === NUMBERS_STEP && area.id === 'in';
      body = html`<${Ghost} next=${next} text=${next ? `הבא: ${STEPS[NUMBERS_STEP].name}` : 'נקבע ב"העסק במספרים"'} />
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
      ${v.bar != null && html`<span class="cv-bar" aria-hidden="true"><i style=${{ width: `${Math.min(100, v.bar * 100)}%` }}></i><u style=${{ insetInlineStart: `${v.mark * 100}%` }} title="איפה צריך להיות היום"></u></span>`}
    </span>`;

  const status = hot
    ? null
    : weak
      ? html`<span class="cv-dot is-weak" title="מתחת לקצב"></span>`
      : !isMoney && done.length === area.steps.length
        ? html`<${PencilCheck} size=${16} color="#0038b8" weight=${3} />`
        : !isMoney && done.length
          ? html`<span class="bd-count">${done.length}/${area.steps.length}</span>`
          : null;

  const said = isMoney ? (v.kind === 'live' ? `${v.big}, ${v.small}` : v.kind === 'notes' ? v.notes[0] : 'עוד ריק') : done.length ? done.map((i) => STEPS[i].note).join(', ') : 'עוד ריק';
  return html`<button type="button" class=${cx('bd-zone', isMoney && 'is-money', area.id === 'back' && 'is-back', locked && 'is-locked', hot && 'is-hot')} style=${{ '--span': area.span }} aria-label=${`${area.label}. ${said}${hot ? '. צוואר הבקבוק' : ''}`} onClick=${() => onOpen(area.id)}>
    <span class="bd-label"><${Icon} name=${locked ? 'lock' : area.icon} size=${16} />${area.label}${status && html`<span class="ms-1 inline-flex">${status}</span>`}</span>
    <span class="bd-stack">
      ${card}
      ${body}
      ${done.map((i) => html`<${StepNote} key=${i} i=${i} fresh=${fresh} />`)}
      ${todo.map((i, k) => html`<${Ghost} key=${i} next=${i === current} text=${i === current ? `הבא: ${STEPS[i].name}` : k === 0 && !done.length ? `פרק ${ch + 1} · ${CHAPTERS[ch].title}` : ''} />`)}
    </span>
    ${hot && html`<span class="cv-hot-tag bd-hot-tag">צוואר הבקבוק</span>`}
  </button>`;
}

export function Board({ current, sc, fixed, health, fresh, onOpen, side }) {
  const named = current > 5; // "שם ולוגו" done: the board carries the business name
  return html`<div class="bd-frame">
    <span class="bd-plate">${named ? USER.business : `הלוח של ${USER.firstName}`}</span>
    <div class="bd-cork">
      <div class="bd-zones" role="group" aria-label="לוח העסק">
        ${AREAS.map((a) => html`<${Zone} key=${a.id} area=${a} current=${current} sc=${sc} fixed=${fixed} weak=${health.weak[a.id]} hot=${health.bottleneck === a.id} fresh=${fresh} onOpen=${onOpen} />`)}
      </div>
      <div class="bd-side">${side}</div>
    </div>
  </div>`;
}
