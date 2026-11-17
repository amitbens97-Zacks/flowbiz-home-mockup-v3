// "הסבר מהכריש": the "?" in the top bar opens the shark's note with what this screen is,
// what you see and why, then a short chat with ready questions.
import { html, useState, useEffect, useRef, Icon, cx } from './lib.js';
import { g } from './data.js';

export const EXPLAIN = {
  title: 'לוח העסק',
  what: 'כל העסק על לוח אחד. כל שלב שמסיימים מצמיד פתק לאזור שלו: הכסף למעלה, הלקוחות באמצע, ומה שמאחורי הקלעים בצד.',
  see: 'בזמן הבנייה כל שלב מוסיף פתק לאזור שלו. כשיש לקוחות, כל אזור מראה מספר אחד, והחלש מסומן בכתום.',
  why: 'מתקנים צוואר בקבוק אחד בכל פעם. מה שכתום הוא גם "הדבר הבא".',
  qa: [
    ['מתי אזור נהיה כתום?', 'כשהוא מתחת ל-60% מהקצב של החודש, או כשלקוח מחכה לך שבוע ויותר. רק אזור אחד מסומן: הראשון בדרך פניות, לקוחות, שומרים קשר.'],
    ['איפה מפת המסע?', 'בכפתור "מפת המסע", ליד שורת המסע. שם רואים את הדרך של כל ששת הפרקים, והדרגה שלך.'],
    ['איפה הקבצים שלי?', 'בתוך האזור. לחיצה על אזור פותחת את השלבים שבנו אותו ואת התוצרים שלהם.'],
    ['למה הכסף למעלה?', 'כי זה הדבר הראשון שבודקים כשנכנסים. הקו הכהה בפס מראה איפה צריך להיות היום.'],
  ],
};

export function ExplainButton({ class: cls = '' }) {
  return html`<span class=${cx('group relative inline-flex shrink-0', cls)}>
    <button type="button" onClick=${(e) => (e.currentTarget.blur(), window.dispatchEvent(new CustomEvent('fb:explain')))} aria-label="הסבר מהכריש על המסך הזה" class="no-print grid h-10 w-10 place-items-center rounded-full bg-brand-50 font-display text-[22px] font-black leading-none text-brand-600 ring-[1.5px] ring-brand-300 transition hover:bg-brand-600 hover:text-white hover:ring-brand-600 focus-visible:bg-brand-600 focus-visible:text-white cursor-pointer">?</button>
    <span role="tooltip" class="pointer-events-none absolute end-0 top-[calc(100%+8px)] z-30 hidden whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[13px] font-bold text-white shadow-lg group-hover:block group-focus-within:block">הסבר מהכריש על המסך הזה</span>
  </span>`;
}

export function SharkTalk() {
  const ex = EXPLAIN;
  const [chat, setChat] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useRef(null);
  useEffect(() => list.current?.scrollTo(0, 1e6), [msgs.length, busy]);
  const asked = new Set(msgs.filter((m) => m.me).map((m) => m.text));
  const send = async (q) => {
    q = q.trim();
    if (!q || busy) return;
    setText('');
    setMsgs((m) => [...m, { me: true, text: q }]);
    setBusy(true);
    const ready = ex.qa.find(([k]) => k === q);
    await new Promise((r) => setTimeout(r, 450));
    setMsgs((m) => [...m, { me: false, text: ready ? ready[1] : 'במוקאפ אני עונה על השאלות המוכנות. במערכת אפשר לשאול אותי כל דבר על העסק.' }]);
    setBusy(false);
  };

  if (!chat)
    return html`<div class="text-[15px] leading-relaxed">
      <p class="mb-2 font-display text-[17px] font-bold text-brand-900">${ex.title}</p>
      <p>${ex.what}</p>
      <p class="mt-1.5 text-muted">${ex.see}</p>
      <p class="mt-2 rounded-xl bg-brand-50 px-3 py-2 font-semibold text-brand-900">${ex.why}</p>
      <button type="button" onClick=${() => setChat(true)} class="mt-3 inline-flex items-center gap-1.5 text-[15px] font-bold text-brand-600 hover:underline cursor-pointer"><${Icon} name="message-circle" size=${16} />לשאול את הכריש</button>
    </div>`;

  return html`<div class="text-[15px]">
    <button type="button" onClick=${() => setChat(false)} class="mb-2 inline-flex items-center gap-1 text-[13px] font-bold text-muted hover:text-ink cursor-pointer"><${Icon} name="arrow-right" size=${14} />חזרה להסבר</button>
    <div ref=${list} class="thin-scroll flex max-h-[240px] flex-col gap-2 overflow-y-auto">
      ${msgs.length === 0 && html`<p class="text-muted">${g('מה תרצה לדעת?', 'מה תרצי לדעת?')}</p>`}
      ${msgs.map((m, i) => html`<p key=${i} class=${cx('max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 leading-snug', m.me ? 'self-start rounded-ss-md bg-brand-600 text-white' : 'self-end rounded-se-md bg-canvas ring-1 ring-line')}>${m.text}</p>`)}
      ${busy && html`<p class="self-end rounded-2xl bg-canvas px-3 py-2 text-muted ring-1 ring-line">הכריש כותב...</p>`}
    </div>
    ${ex.qa.some(([q]) => !asked.has(q)) && html`<div class="mt-2.5 flex flex-wrap gap-1.5">${ex.qa.filter(([q]) => !asked.has(q)).map(([q]) => html`<button key=${q} type="button" onClick=${() => send(q)} class="rounded-full bg-white px-2.5 py-1 text-start text-[13px] font-semibold text-brand-600 ring-1 ring-brand-200 hover:bg-brand-50 cursor-pointer">${q}</button>`)}</div>`}
    <form class="mt-2.5 flex gap-1.5" onSubmit=${(e) => (e.preventDefault(), send(text))}>
      <input value=${text} onInput=${(e) => setText(e.target.value)} onKeyDown=${(e) => e.stopPropagation()} placeholder="לשאול על העסק..." aria-label="שאלה לכריש" class="h-10 min-w-0 flex-1 rounded-xl bg-white px-3 text-[15px] ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-brand-300" />
      <button type="submit" disabled=${!text.trim() || busy} aria-label="לשלוח" class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white disabled:opacity-40 cursor-pointer"><${Icon} name="send" size=${17} /></button>
    </form>
  </div>`;
}
