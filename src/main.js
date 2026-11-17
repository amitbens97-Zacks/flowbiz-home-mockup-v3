// FlowBiz home page "לוח העסק", after the Business Model Canvas: one action on top (always in the same
// place), the journey as one thin line, the board (one table drawn on the page), and "השבוע שלי" as three
// notes. While building, every step adds a short note to one area. From "לקוחות משלמים" the customer
// areas show live numbers and the weakest one (the bottleneck) becomes "הדבר הבא".
// Menu: בית · השבוע · לקוחות · כספים. Link params: ?scenario=new|mid|sell|run, ?user=m|f, ?embed.
// Shift+D opens the notes.
import { html, render, useState, useEffect, useRef, Icon, PencilCheck, cx, money, confetti, confettiBurst } from './lib.js';
import { Logo, Mark, Button, Note, PartnerBubble, Toast } from './components.js';
import { Sheet } from './ui.js';
import { AreaSheet, healthOf } from './canvas.js';
import { Board } from './board.js';
import { ExplainButton, SharkTalk } from './explain.js';
import { DevPanel } from './devnotes.js';
import { JourneyMap } from './journeymap.js';
import { USER, CHAPTERS, STEPS, TOTAL, NUMBERS_STEP, LEADS_STEP, SCENARIOS, DEFAULT_SCENARIO, DESIRED, WEEK, FIX, AREAS, PAGES, areaOf, GENDER, g } from './data.js';
import { EMBED, IS_PHONE, readView, saveView, writeHandoff, takeHandoff, applyPhoneViewport, ViewToggle, PhonePreview } from './viewswitch.js';

const params = new URLSearchParams(location.search);
const NAV = [
  ['home', 'בית', 'house'],
  ['week', 'השבוע', 'calendar-range'],
  ['clients', 'לקוחות', 'users'],
  ['money', 'כספים', 'wallet'],
];
const lockOf = (current) => ({
  clients: current <= LEADS_STEP ? 'נפתח בשלב 11, "לקוחות משלמים"' : null,
  money: current <= NUMBERS_STEP ? 'נפתח אחרי "העסק במספרים"' : null,
});
const savedOf = (current) => STEPS.slice(0, current).reduce((a, s) => a + s.save, 0);
const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : 'ערב טוב';
};

function TopNav({ tab, onTab, locks, saved, tools }) {
  return html`<header class="no-print z-20 shrink-0 border-b border-line bg-surface">
    <div class="flex h-16 items-center gap-3 px-3 md:gap-6 md:px-7">
      <${Logo} size="sm" />
      <nav class="hidden items-center gap-1 md:flex" aria-label="תפריט ראשי">
        ${NAV.map(
          ([id, label, icon]) => html`<button key=${id} type="button" aria-current=${tab === id ? 'page' : undefined} title=${locks[id] || undefined} onClick=${() => onTab(id)}
            class=${cx('flex h-10 items-center gap-2 rounded-xl px-3.5 text-[14px] font-semibold transition-colors cursor-pointer', tab === id ? 'bg-brand-100 text-brand-600' : locks[id] ? 'text-faint hover:bg-canvas' : 'text-ink hover:bg-brand-50')}>
            <${Icon} name=${locks[id] ? 'lock' : icon} size=${17} />${label}
          </button>`,
        )}
      </nav>
      <div class="ms-auto flex items-center gap-2">
        <span class="flex flex-col items-end leading-tight" title="מה שהיה עולה לבנות את זה אצל אנשי מקצוע">
          <small class="text-[12px] font-semibold text-muted">חסכת עד עכשיו</small>
          <b key=${saved} class="pop-in font-display text-[18px] font-extrabold tabular-nums text-money">${money(saved)}</b>
        </span>
        ${tools}
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 font-display text-[16px] font-bold text-white max-sm:hidden" title=${USER.fullName}>${USER.firstName[0]}</span>
      </div>
    </div>
  </header>`;
}

function MobileNav({ tab, onTab, locks }) {
  return html`<nav class="no-print pb-safe grid shrink-0 grid-cols-4 border-t border-line bg-surface md:hidden" aria-label="תפריט ראשי">
    ${NAV.map(
      ([id, label, icon]) => html`<button key=${id} type="button" aria-current=${tab === id ? 'page' : undefined} onClick=${() => onTab(id)}
        class=${cx('flex flex-col items-center gap-0.5 pt-2 text-[12px] font-semibold cursor-pointer', tab === id ? 'text-brand-600' : locks[id] ? 'text-faint' : 'text-ink')}>
        <${Icon} name=${locks[id] ? 'lock' : icon} size=${20} />${label}
      </button>`,
    )}
  </nav>`;
}

// One action, one primary button, always here: the bottleneck when there is one, else the next step.
function NextAction({ current, bottleneck, busy, onStart, onFix, onWeek }) {
  const step = STEPS[current];
  const fix = bottleneck && FIX[bottleneck];
  const title = fix ? fix.title : step ? ['', step.name, ''] : ['הכול ', 'בקצב', ''];
  const meta = fix ? fix.meta : step ? `כ-${step.min} דקות · מוסיף פתק ל"${areaOf(current).label}"` : 'אין צוואר בקבוק החודש';
  const primary = fix ? [fix.cta, onFix] : step ? [busy ? 'כותבים בלוח...' : 'מתחילים', onStart] : ['לצייר את השבוע', onWeek];
  return html`<section class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div class="fb-heading min-w-0 !mb-0">
      <span class="fb-eyebrow">${greeting()}, ${USER.firstName} · הדבר הבא</span>
      <h1 class="fb-h1 text-[28px] md:text-[36px]">${title[0]}<${Mark}>${title[1]}<//>${title[2]}</h1>
      <p>${meta}</p>
    </div>
    <div class="flex shrink-0 flex-col items-stretch gap-1 md:items-end">
      <span data-primary><${Button} class="max-md:w-full" disabled=${busy} onClick=${primary[1]}>${primary[0]}<${Icon} name="arrow-left" size=${20} /><//></span>
      ${fix && step && html`<button type="button" class="fb-btn fb-btn-text !h-8 !text-[14px]" disabled=${busy} onClick=${onStart}>השלב הבא במסע: ${step.name}</button>`}
    </div>
  </section>`;
}

// The journey in one line: 15 segments, a small gap between chapters, and how close the next rank is.
function JourneyLine({ current, onOpen }) {
  const ch = current < TOTAL ? STEPS[current].ch : -1;
  const left = ch < 0 ? 0 : STEPS.filter((s, i) => s.ch === ch && i >= current).length;
  const rank = ch < 0 ? '' : CHAPTERS[ch].rank[GENDER === 'f' ? 1 : 0];
  return html`<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
    <span class="shrink-0 text-[14px] font-bold text-ink">המסע</span>
    <span class="jr-seg cursor-pointer" onClick=${onOpen} role="img" aria-label=${`${Math.min(current, TOTAL)} מתוך ${TOTAL} שלבים`}>
      ${STEPS.map((s, i) => html`<i key=${i} class=${cx(i < current && 'is-done', i === current && 'is-now', STEPS[i + 1] && STEPS[i + 1].ch !== s.ch && 'ch-end')}></i>`)}
    </span>
    <span class="shrink-0 text-[14px] font-semibold tabular-nums text-muted">${Math.min(current, TOTAL)}/${TOTAL}</span>
    ${ch >= 0 && html`<span class="jr-goal max-md:order-last max-md:basis-full"><${Icon} name="medal" size=${16} />עוד ${left === 1 ? 'שלב אחד' : `${left} שלבים`} לדרגת <b>${rank}</b></span>`}
    <button type="button" class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 text-[14px] font-bold text-brand-600 ring-[1.5px] ring-brand-300 hover:bg-brand-50 cursor-pointer" onClick=${onOpen}><${Icon} name="map" size=${17} />מפת המסע</button>
  </div>`;
}

// "השבוע שלי": three notes. A note = something to do.
function WeekNotes({ tasks, done, onToggle, onAll }) {
  const n = tasks.filter((_, i) => done[i]).length;
  return html`<aside class="flex min-w-0 flex-col">
    <span class="bd-label mb-4"><${Icon} name="calendar-range" size=${16} />השבוע שלי<span class="bd-count ms-1">${n}/3</span></span>
    <div class="grid gap-4 max-lg:sm:grid-cols-3">
      ${tasks.map(
        (t, i) => html`<${Note} key=${t} tone="white" tilt=${[-1.2, 0.9, -0.6][i]} class="!px-4 !pb-3 !pt-5">
          <button type="button" role="checkbox" aria-checked=${!!done[i]} onClick=${(e) => onToggle(i, e.currentTarget)} class="flex w-full items-start gap-2.5 text-start cursor-pointer">
            <span class=${cx('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2', done[i] ? 'border-brand-600 bg-white' : 'border-ink/40 bg-white/60')}>${done[i] && html`<${PencilCheck} size=${17} color="#0038b8" weight=${3.2} />`}</span>
            <span class=${cx('text-[16px] font-semibold leading-snug', done[i] && 'text-muted line-through decoration-brand-400')}>${t}</span>
          </button>
        <//>`,
      )}
    </div>
    <button type="button" class="mt-4 self-start text-[14px] font-bold text-brand-600 hover:underline cursor-pointer" onClick=${onAll}>לכל השבוע ←</button>
  </aside>`;
}

// The journey map (the road of 6 chapters from the dashboard mockup), one tap away from the board.
// It opens over the home page; a chapter on the road opens its steps.
const MAP_CHAPTERS = CHAPTERS.map((c, ci) => ({ id: ci + 1, title: c.title, icon: c.icon, rank: c.rank, steps: STEPS.filter((s) => s.ch === ci) }));
function mapStates(current) {
  const curCh = current < TOTAL ? STEPS[current].ch : -1;
  return {
    curCh,
    states: MAP_CHAPTERS.map((c, ci) => {
      const first = STEPS.findIndex((s) => s.ch === ci);
      const doneIn = Math.max(0, Math.min(c.steps.length, current - first));
      return { status: doneIn >= c.steps.length ? 'done' : ci === curCh ? 'current' : 'locked', doneInChapter: doneIn };
    }),
  };
}

function ChapterSteps({ index, current, onStart }) {
  const c = MAP_CHAPTERS[index];
  const first = STEPS.findIndex((s) => s.ch === index);
  const doneIn = Math.max(0, Math.min(c.steps.length, current - first));
  return html`<div>
    <p class="pe-7 text-[12px] font-bold text-brand-600">פרק ${index + 1} מתוך ${CHAPTERS.length}</p>
    <h3 class="fb-h3 mt-1 flex items-center gap-2 pe-7"><span class="fb-chip-ic h-9 w-9"><${Icon} name=${c.icon} size=${19} /></span>${c.title}</h3>
    <p class="mt-1 flex items-center gap-1.5 text-[12px] font-bold text-ink"><${Icon} name="medal" size=${14} class=${doneIn >= c.steps.length ? 'text-gold' : 'text-faint'} />${doneIn >= c.steps.length ? 'הדרגה שקיבלת' : 'בסוף הפרק'}: ${c.rank[GENDER === 'f' ? 1 : 0]}</p>
    <ol class="mt-3 flex flex-col gap-1.5">
      ${c.steps.map((s, si) => {
        const i = first + si;
        const done = i < current;
        const now = i === current;
        return html`<li key=${i} class=${cx('flex items-center gap-2.5 rounded-xl px-3 py-2', now ? 'bg-brand-100 ring-2 ring-brand-300' : done ? 'bg-surface ring-1 ring-line' : 'ring-1 ring-line/70')}>
          <span class="grid h-6 w-6 shrink-0 place-items-center">${done ? html`<${PencilCheck} size=${18} color="#0038b8" weight=${3.5} />` : now ? html`<${Icon} name="pencil" size=${16} class="text-brand-600" />` : html`<${Icon} name="lock" size=${13} class="text-faint" />`}</span>
          <span class="min-w-0 flex-1">
            <b class=${cx('block text-[14px] leading-snug', done || now ? 'text-ink' : 'text-muted')}>${i + 1}. ${s.name}</b>
            <small class="text-[12px] text-muted">${done ? `פתק ב"${areaOf(i).label}"` : `כ-${s.min} דק׳ · ממלא את "${areaOf(i).label}"`}</small>
          </span>
          ${now && html`<${Button} variant="mini" onClick=${onStart}>מתחילים<//>`}
        </li>`;
      })}
    </ol>
  </div>`;
}

function MapSheet({ current, onClose, onStart }) {
  const [sel, setSel] = useState(null);
  const phonePanel = useRef(null);
  // On the phone the chapter's steps open under the road: bring them into view.
  useEffect(() => {
    if (sel != null && phonePanel.current?.offsetParent) phonePanel.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [sel]);
  const { curCh, states } = mapStates(current);
  const rankCh = curCh < 0 ? CHAPTERS.length - 1 : curCh - 1;
  const rank = rankCh >= 0 ? CHAPTERS[rankCh].rank[GENDER === 'f' ? 1 : 0] : g('מתחיל', 'מתחילה');
  const panel = (i) => html`<${ChapterSteps} index=${i} current=${current} onStart=${() => (onClose(), onStart())} />`;
  return html`<${Sheet} title="מפת המסע" full onClose=${onClose}
    footer=${html`<span class="fb-meta">${Math.min(current, TOTAL)} מתוך ${TOTAL} שלבים · הדרגה שלך: <b class="text-ink">${rank}</b></span><${Button} variant="secondary" onClick=${onClose}>חזרה ללוח<//>`}>
    <div class="mx-auto hidden md:block md:pt-2" style=${{ maxWidth: 'calc((88dvh - 240px) * 2.27)' }}><${JourneyMap} chapters=${MAP_CHAPTERS} states=${states} currentChapter=${curCh} selected=${sel} onSelect=${(i) => setSel((x) => (x === i ? null : i))} onClose=${() => setSel(null)} renderPanel=${panel} layout="wide" /></div>
    <div class="mx-auto max-w-[400px] md:hidden">
      <${JourneyMap} chapters=${MAP_CHAPTERS} states=${states} currentChapter=${curCh} selected=${sel} onSelect=${(i) => setSel((x) => (x === i ? null : i))} layout="tall" />
      ${sel != null && html`<div ref=${phonePanel} class="mt-4 rounded-2xl bg-surface p-4 ring-2 ring-brand-900">${panel(sel)}</div>`}
    </div>
  <//>`;
}

function Placeholder({ id, onHome }) {
  const p = PAGES[id];
  return html`<div class="mx-auto flex h-full max-w-[720px] flex-col justify-center px-5 py-8 md:px-10">
    <div class="fb-heading mb-5">
      <span class="fb-eyebrow">במקום: ${p.from}</span>
      <h1 class="fb-h1 text-[28px] md:text-[36px]">${p.title[0]}<${Mark}>${p.title[1]}<//>${p.title[2]}</h1>
    </div>
    <ul class="flex flex-col gap-3 text-[18px]">${p.items.map((t) => html`<li key=${t} class="flex items-start gap-3"><${Icon} name=${p.icon} size=${20} class="mt-1 text-brand-600" />${t}</li>`)}</ul>
    <p class="fb-meta mt-6">העמוד עצמו לא חלק מהמוקאפ הזה.</p>
    <div class="mt-4"><${Button} variant="secondary" onClick=${onHome}>חזרה לבית<//></div>
  </div>`;
}

function App({ view, onViewChange }) {
  const handoff = useRef(takeHandoff()).current;
  const startSc = SCENARIOS[params.get('scenario')] ? params.get('scenario') : DEFAULT_SCENARIO;
  const fresh0 = (id) => ({ scId: id, current: SCENARIOS[id].current, fresh: null, done: {}, fixed: {} });
  const [s, setS] = useState(handoff?.state || fresh0(startSc));
  const [tab, setTab] = useState('home');
  const [sheet, setSheet] = useState(() => (new URLSearchParams(location.search).has('map') ? { type: 'journey' } : null)); // ?map = open on the journey map
  const [busy, setBusy] = useState(false);
  const [peek, setPeek] = useState(() => params.has("peek")); // ?peek, "הלוח המלא": the desired state, over the user's own board
  const [toast, setToast] = useState(null);
  const [dev, setDev] = useState(false);
  const [unread, setUnread] = useState(true);
  const [explain, setExplain] = useState(0);
  const timers = useRef({});

  useEffect(() => {
    const open = () => (setTab('home'), setExplain((n) => n + 1));
    const k = (e) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (e.key === 'D' && e.shiftKey && !typing) setDev((d) => !d);
    };
    window.addEventListener('fb:explain', open);
    window.addEventListener('keydown', k);
    return () => (window.removeEventListener('fb:explain', open), window.removeEventListener('keydown', k));
  }, []);
  useEffect(() => {
    window.__flowbizSnapshot = () => ({ state: s });
  });
  useEffect(() => {
    const q = new URLSearchParams();
    if (s.scId !== DEFAULT_SCENARIO) q.set('scenario', s.scId);
    if (EMBED) q.set('embed', '1');
    if (params.get('user')) q.set('user', params.get('user'));
    const qs = q.toString();
    history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : ''));
  }, [s.scId]);

  const notify = (text, icon = 'info', undo) => {
    setToast({ id: Date.now(), text, icon, undo });
    clearTimeout(timers.current.toast);
    timers.current.toast = setTimeout(() => setToast(null), undo ? 5000 : 2800);
  };
  const undoToast = () => (toast?.undo?.(), setToast(null));

  const { current } = s;
  const sc = SCENARIOS[s.scId];
  const health = healthOf(sc, s.fixed);
  const locks = lockOf(current);

  // The mockup skips the step itself: its note lands on the board, as on the way back from a finished step.
  const startStep = () => {
    if (busy || current >= TOTAL) return;
    setPeek(false);
    const i = current;
    const st = STEPS[i];
    setBusy(true);
    timers.current.step = setTimeout(() => {
      setBusy(false);
      setS((x) => ({ ...x, current: i + 1, fresh: i }));
      const chapterEnd = !STEPS[i + 1] || STEPS[i + 1].ch !== st.ch;
      confetti(chapterEnd ? 'chapter' : 'step');
      notify(`"${st.name}" הושלם · פתק חדש ב"${areaOf(i).label}"${st.save ? ` · +${money(st.save)}` : ''}`, 'party-popper', () => setS((x) => ({ ...x, current: i, fresh: null })));
    }, 900);
  };
  const fixNow = () => {
    const b = health.bottleneck;
    if (!b) return;
    setS((x) => ({ ...x, fixed: { ...x.fixed, [b]: true } }));
    confetti('step');
    notify(`${FIX[b].done}. הלוח מתעדכן`, 'check', () => setS((x) => ({ ...x, fixed: { ...x.fixed, [b]: false } })));
  };
  const toggleTask = (i, el) => {
    const on = !s.done[i];
    setS((x) => ({ ...x, done: { ...x.done, [i]: on } }));
    if (on) confettiBurst(el);
  };
  const goTab = (id) => {
    if (locks[id]) return notify(locks[id], 'lock');
    setTab(id);
  };
  const changeScenario = (id) => {
    clearTimeout(timers.current.step);
    setBusy(false);
    setS(fresh0(id));
    setTab('home');
    setSheet(null);
    setPeek(false);
    setDev(false);
    notify(`מצב: ${SCENARIOS[id].label}`, 'repeat');
  };

  const bLabel = health.bottleneck && AREAS.find((a) => a.id === health.bottleneck).label;
  const sharkLine = health.bottleneck
    ? `מתקנים צוואר בקבוק אחד בכל פעם. כרגע זה "${bLabel}".`
    : current === 0
      ? 'הלוח הזה הוא העסק שלך. כל שלב מוסיף לו פתק.'
      : current >= TOTAL
        ? 'הכול בקצב. זה הזמן לצייר את השבוע.'
        : `הבא בתור: "${STEPS[current].name}". הוא מוסיף פתק ל"${areaOf(current).label}".`;

  const tools = html`${!EMBED && html`<${ViewToggle} view=${view} onChange=${onViewChange} class="max-md:hidden" />`}
    <button type="button" onClick=${() => setDev((d) => !d)} title="הערות למפתחים (Shift+D)" aria-label="הערות למפתחים" class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-brand-50 hover:text-brand-600 cursor-pointer max-sm:hidden"><${Icon} name="code-xml" size=${18} /></button>
    <${ExplainButton} />`;

  const home = html`<div class="mx-auto flex min-h-full max-w-[1280px] flex-col gap-4 px-5 pb-24 pt-5 md:px-10 lg:pb-4">
    <${NextAction} current=${current} bottleneck=${health.bottleneck} busy=${busy} onStart=${startStep} onFix=${fixNow} onWeek=${() => notify('במערכת: "צייר לי שבוע מושלם" נפתח', 'calendar-range')} />
    <${JourneyLine} current=${current} onOpen=${() => setSheet({ type: 'journey' })} />
    <${Board} ...${peek ? { current: DESIRED.current, sc: DESIRED, fixed: {}, health: healthOf(DESIRED, {}), fresh: null, onOpen: () => setPeek(false) } : { current, sc, fixed: s.fixed, health, fresh: s.fresh, onOpen: (id) => setSheet({ type: 'area', id }) }}
      peek=${peek} onPeek=${() => setPeek((p) => !p)}
      side=${html`<${WeekNotes} tasks=${WEEK[s.scId]} done=${s.done} onToggle=${toggleTask} onAll=${() => goTab('week')} />`} />
  </div>`;

  return html`<div class="fb-notebook fb-margin flex h-dvh flex-col text-ink" dir="rtl">
    <${TopNav} tab=${tab} onTab=${goTab} locks=${locks} saved=${savedOf(current)} tools=${tools} />
    <main class="thin-scroll relative min-h-0 flex-1 overflow-y-auto">
      ${tab === 'home' ? home : html`<${Placeholder} id=${tab} onHome=${() => setTab('home')} />`}
      <${PartnerBubble} key=${sharkLine} message=${sharkLine} unread=${unread} onRead=${() => setUnread(false)} mood=${busy ? 'thinking' : health.bottleneck ? 'alert' : s.fresh != null ? 'happy' : 'calm'} openKey=${explain} body=${explain > 0 && html`<${SharkTalk} key=${explain} />`} onClose=${() => setExplain(0)} />
    </main>
    <${MobileNav} tab=${tab} onTab=${goTab} locks=${locks} />
    ${sheet?.type === 'area' && html`<${AreaSheet} id=${sheet.id} current=${current} sc=${sc} fixed=${s.fixed} health=${health} onClose=${() => setSheet(null)} onStart=${startStep} onFix=${fixNow} notify=${notify} />`}
    ${sheet?.type === 'journey' && html`<${MapSheet} current=${current} onClose=${() => setSheet(null)} onStart=${startStep} />`}
    <${Toast} toast=${toast} onUndo=${undoToast} />
    <${DevPanel} open=${dev} onClose=${() => setDev(false)} scenario=${s.scId} onScenario=${changeScenario} onReset=${() => changeScenario(s.scId)} />
  </div>`;
}

function Root() {
  const [view, setView] = useState(readView);
  useEffect(() => applyPhoneViewport(view), [view]);
  const change = (v) => {
    if (v === 'mobile') {
      try {
        writeHandoff(window.__flowbizSnapshot?.());
      } catch {}
    }
    saveView(v);
    setView(v);
  };
  if (!EMBED && !IS_PHONE && view === 'mobile') return html`<${PhonePreview} onSwitch=${change} title="לוח העסק" />`;
  return html`<${App} view=${view} onViewChange=${change} />`;
}

applyPhoneViewport(readView());
render(html`<${Root} />`, document.getElementById('app'));
