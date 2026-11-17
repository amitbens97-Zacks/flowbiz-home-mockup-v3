// Developer notes for the new home page, the demo situations (Shift+D).
import { html, Icon, cx } from './lib.js';
import { GENDER, setDemoGender, SCENARIOS } from './data.js';

const NOTES = [
  {
    title: 'מה זה',
    items: [
      'דף בית בהשראת ה-Business Model Canvas (אוסטרוולדר ופיניור). מחליף את "דף העסק" במשפטים, שנדחה כי היה עמוס במלל.',
      'סדר הקריאה מלמעלה: הדבר הבא (פעולה אחת, כפתור ראשי אחד), המסע בשורה אחת, לוח העסק, ובצד שלוש המשימות של השבוע.',
      'כיוון לבדיקה. לפני עיצוב מלא: בדיקת 5 שניות מול 5 משתמשים מהנישה ("מה המצב של העסק, ומה עושים עכשיו?").',
    ],
  },
  {
    title: 'הלוח',
    items: [
      'לוח שעם במסגרת עץ: כל שלב שמסתיים מצמיד פתק כחול עם נעץ לאזור שלו. מקום ריק = מסגרת מקווקוות לפתק שעוד יגיע, והבא בתור מסומן בכחול.',
      'משלב 11 כל אזור לקוחות מקבל כרטיס לבן עם מספר אחד, מוצמד מעל הפתקים. לצוואר הבקבוק נעץ כתום ותווית.',
      'על אותו לוח, בצד: "השבוע שלי" כשלושה פתקים לבנים עם סלוטייפ. פתק כחול = מה שנבנה, פתק לבן = מה לעשות.',
      'שלט על המסגרת: "הלוח של נועה" עד שלב "שם ולוגו", ואחריו שם העסק, ולידו כמה פתקים יש (5/15).',
      'לוח ריק לא נראה כמו טופס ריק: כל פתק שעוד לא נכתב הוא "פתק מחכה" דהוי עם השאלה שהוא יענה עליה ("מי הלקוח?"). כך רואים מה חסר. האזור של השלב הבא מואר, והפתק שלו כחול: "הבא: ...".',
      'כפתור "הלוח המלא" על המסגרת מראה את אותו לוח כשכל השלבים נעשו והחודש ביעד (מסגרת זהב). זה המצב הרצוי. לחיצה נוספת חוזרת ללוח שלך.',
      'ליד שורת המסע: "עוד N שלבים לדרגת ..." (הדרגה של הפרק הנוכחי).',
      'שורה עליונה = כסף: נכנס החודש (מול היעד, עם סימון איפה צריך להיות היום) ונשאר לך (אחרי הוצאות). ירוק רק לסכומים.',
      'שורה שנייה, מימין: הלקוחות, מגיעים אליי, שומרים קשר, ההצעה, מאחורי הקלעים. "מאחורי הקלעים" מאחד שלושה אזורים מהספר (מה יש לי, מה אני עושה, מי איתי), כי בעסק של אדם אחד הם כמעט ריקים.',
      'כל אחד מ-15 השלבים שייך לאזור אחד ומוסיף לו פתק של 1-4 מילים (שדה note, טקסט קבוע של FlowBiz עם הערך מהתשובה). אזור מציג עד 2 פתקים; השאר בחלון.',
      'אזור בלי שלב שהושלם ובלי השלב הבא: אפור, שורה אחת "נפתח בפרק N". לא מקווקו.',
      'בטלפון: שתי עמודות, הכסף ו"מאחורי הקלעים" על כל הרוחב.',
    ],
  },
  {
    title: 'מספרים חיים וצוואר הבקבוק (בקוד, לא במודל)',
    items: [
      'מ"לקוחות משלמים" (שלב 11): מגיעים אליי = פניות החודש מטבלת הלידים; הלקוחות = "סגרתי!" החודש; שומרים קשר = לקוחות פעילים בלי מגע 7 ימים ויותר; כסף = המרכז הפיננסי. היעדים מ"העסק במספרים".',
      'קצב = הערך חלקי (היעד החודשי × החלק מהחודש שעבר). מתחת ל-60% = כתום. שומרים קשר כתום כשיש לפחות לקוח אחד מחכה.',
      'צוואר הבקבוק = הראשון שכתום לפי הסדר פניות → לקוחות → שומרים קשר. רק הוא מקבל את התגית ואת "הדבר הבא". זה אותו כלל כמו הפוקוס של "צייר לי שבוע מושלם".',
      'בקצב = סימן עיפרון כחול (לא ירוק: ירוק שמור לכסף).',
      'אין צוואר בקבוק: "הדבר הבא" = השלב הבא במסע, ובסוף המסע "לצייר את השבוע".',
    ],
  },
  {
    title: 'לחיצות',
    items: [
      'לחיצה על אזור: חלון עם המספר (אם יש), השלבים שבנו אותו, הפתק של כל שלב והתוצרים שלו. לכן אין עמוד "קבצים".',
      'במוקאפ "מתחילים" מדמה שהשלב הסתיים: הפתק נוחת באזור, קונפטי, "חסכת עד עכשיו" עולה, עם ביטול. "לשלוח הודעה" וכו׳ מסמנים את צוואר הבקבוק כמטופל.',
      'התפריט: בית, השבוע (יומן + משימות), לקוחות (משלב 11), כספים (אחרי שלב 5).',
      'מפת המסע לא נעלמה: כפתור "מפת המסע" ליד שורת המסע (וגם לחיצה על השורה) פותח את המפה המצוירת של 6 הפרקים, אותה מפה כמו בדשבורד הקודם. לחיצה על פרק במפה פותחת את השלבים שלו, ולכל שלב כתוב איזה אזור בלוח הוא ממלא.',
    ],
  },
];

export function DevPanel({ open, onClose, scenario, onScenario, onReset }) {
  return html`<aside
    class=${cx('fixed inset-y-0 end-0 z-[70] flex w-full max-w-sm flex-col border-s border-slate-200 bg-white shadow-2xl transition-transform duration-200', open ? 'translate-x-0' : '-translate-x-full pointer-events-none invisible')}
    aria-hidden=${!open}
  >
    <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <h2 class="flex items-center gap-2 text-[16px] font-bold text-slate-900"><${Icon} name="code-xml" size=${17} /> הערות למפתחים</h2>
      <button type="button" onClick=${onClose} aria-label="סגירה" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"><${Icon} name="x" size=${18} /></button>
    </div>
    <div class="thin-scroll flex-1 overflow-y-auto p-4 text-[14px] leading-relaxed text-slate-700">
      <section class="mb-4 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3">
        <h3 class="mb-2 font-bold text-brand-900">המצב לדוגמה</h3>
        <div class="flex flex-col gap-1.5" role="radiogroup" aria-label="המצב לדוגמה">
          ${Object.entries(SCENARIOS).map(
            ([id, sc]) => html`<button key=${id} type="button" role="radio" aria-checked=${scenario === id} onClick=${() => onScenario(id)} class=${cx('rounded-lg border px-3 py-1.5 text-start cursor-pointer', scenario === id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-brand-200 bg-white text-brand-900')}><b class="block text-[14px]">${sc.label}</b><small class="text-[12px]">${sc.sub}</small></button>`,
          )}
        </div>
        <div class="mt-3 grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="המשתמש לדוגמה">
          ${[
            ['f', 'נועה', 'פנייה בלשון נקבה'],
            ['m', 'נועם', 'פנייה בלשון זכר'],
          ].map(
            ([id, name, sub]) => html`<button key=${id} type="button" role="radio" aria-checked=${GENDER === id} onClick=${() => GENDER !== id && setDemoGender(id)} class=${cx('rounded-lg border px-3 py-1.5 text-start cursor-pointer', GENDER === id ? 'border-brand-600 bg-brand-100 text-brand-600' : 'border-brand-200 bg-white text-brand-900')}><b class="block text-[14px]">${name}</b><small class="text-[12px]">${sub}</small></button>`,
          )}
        </div>
        <button type="button" class="mt-2 text-[13px] font-bold text-brand-600 underline underline-offset-2 cursor-pointer" onClick=${onReset}>להתחיל מההתחלה</button>
      </section>
      ${NOTES.map(
        (n) => html`<section key=${n.title} class="mb-4 p-1">
          <h3 class="mb-1.5 font-bold text-slate-900">${n.title}</h3>
          <ul class="list-disc space-y-1 ps-4">${n.items.map((t) => html`<li>${t}</li>`)}</ul>
        </section>`,
      )}
    </div>
  </aside>`;
}
