// Mock data for the home page "לוח העסק" (inspired by the Business Model Canvas). In production:
// the journey from src/features/journey/constants.jsx, step answers from business_plans.data,
// the month from the leads table and the finance center, the week from "צייר לי שבוע מושלם".

// ---------- who the user is (?user=m or ?user=f, or the developer panel) ----------
const PROFILES = {
  f: { gender: 'f', firstName: 'נועה', fullName: 'נועה שחר' },
  m: { gender: 'm', firstName: 'נועם', fullName: 'נועם שחר' },
};
const GENDER_KEY = 'flowbiz-home2-gender';
function pickGender() {
  try {
    const q = new URLSearchParams(location.search).get('user');
    if (q === 'f' || q === 'm') {
      localStorage.setItem(GENDER_KEY, q);
      return q;
    }
    return localStorage.getItem(GENDER_KEY) === 'm' ? 'm' : 'f';
  } catch {
    return 'f';
  }
}
export const GENDER = pickGender();
export const g = (m, f) => (GENDER === 'f' ? f : m);
export function setDemoGender(v) {
  try {
    localStorage.setItem(GENDER_KEY, v);
  } catch {}
  const u = new URL(location.href);
  u.searchParams.set('user', v);
  location.href = u.toString();
}

export const USER = { ...PROFILES[GENDER], business: 'כיוון חדש' };
export const PARTNER = { name: 'הכריש', role: 'השותף העסקי' };

// The journey (November 2026): 6 chapters, 15 steps.
export const CHAPTERS = [
  { title: 'אפיון', icon: 'lightbulb', rank: ['הפרויקטור', 'הפרויקטורית'] },
  { title: 'שביל הכסף', icon: 'coins', rank: ['האסטרטג', 'האסטרטגית'] },
  { title: 'בניית מותג אישי', icon: 'palette', rank: ['הפרזנטור', 'הפרזנטורית'] },
  { title: 'מביאים לקוחות', icon: 'handshake', rank: ['הקלוזר', 'הקלוזרית'] },
  { title: 'מגדילים מכירות', icon: 'rocket', rank: ['הבר סמכא', 'בת סמכא'] },
  { title: 'העסק שתמיד רצית', icon: 'gem', rank: ['המאסטר', 'המאסטרית'] },
];

// Every step adds one short note (1-4 words) to one area of the board. `out` = what the step
// produced; it opens from the area, so there is no separate "קבצים" page.
export const STEPS = [
  { ch: 0, name: 'מציאת רעיון', min: 10, save: 400, note: 'ליווי קריירה', out: ['שלושת הרעיונות שנבדקו'] },
  { ch: 0, name: 'אני והעסק', min: 20, save: 800, note: '9 שנים בגיוס', out: ['אפיון העסק (PDF)'] },
  { ch: 1, name: 'בניית סל מוצרים', min: 20, save: 800, note: '6 מפגשים · 2,800 ₪', out: ['תעודת זהות מוצרית (PDF)'] },
  { ch: 1, name: 'צייד הלקוחות', min: 15, save: 600, note: 'שכירים 30-45', out: ['פרופיל הלקוח (PDF)'] },
  { ch: 1, name: 'העסק במספרים', min: 20, save: 1100, note: 'יעד 14,000 ₪', out: ['התוכנית העסקית שלך (PDF)'] },
  { ch: 2, name: 'שם ולוגו', min: 25, save: 1300, note: 'כיוון חדש', out: ['לוגו (PNG, SVG)', 'צבעי המותג'] },
  { ch: 2, name: 'דף המסרים', min: 15, save: 500, note: 'עבודה שרוצים לקום אליה', out: ['דף המסרים (PDF)'] },
  { ch: 2, name: 'בניית הצעה מנצחת', min: 20, save: 700, note: 'אין כיוון? אין תשלום', out: ['ההצעה המנצחת (PDF)'] },
  { ch: 2, name: 'דף נחיתה בקליק', min: 25, save: 1500, note: 'דף נחיתה', out: ['דף הנחיתה (קישור)'] },
  { ch: 3, name: 'מכונת תוכן שיווקי', min: 25, save: 900, note: '3 פוסטים בשבוע', out: ['תוכנית התוכן', 'פלייר'] },
  { ch: 3, name: 'לקוחות משלמים', min: 25, save: 500, note: 'WhatsApp וקבוצות', out: ['הודעות הפנייה', 'הפוסטים לקבוצות'] },
  { ch: 4, name: 'חדר התרגול', min: 25, save: 800, note: 'שיחת מכירה בביטחון', out: ['סיכום התרגולים'] },
  { ch: 4, name: 'שירות לקוחות אוטומטי', min: 20, save: 1600, note: 'בוט ב-WhatsApp', out: ['תסריט הבוט'] },
  { ch: 5, name: 'ניהול לקוחות', min: 15, save: 600, note: 'רשימה אחת', out: ['רשימת הלקוחות'] },
  { ch: 5, name: 'ליווי עסקי אנושי', min: 5, save: 0, note: 'פגישת מיקוד', out: ['סיכום פגישת המיקוד'] },
];
export const TOTAL = STEPS.length;
export const NUMBERS_STEP = 4; // "העסק במספרים": the goal and the costs are known, "כספים" opens
export const LEADS_STEP = 10; // "לקוחות משלמים": the leads table starts, numbers become live

// The board. Book order, right to left (RTL): the customer side first, money on top (a home screen
// is read from the top), the behind-the-scenes blocks (key resources, activities, partners) folded
// into one area. Each of the 15 steps belongs to exactly one area.
export const AREAS = [
  { id: 'in', row: 'money', span: 6, icon: 'coins', label: 'נכנס החודש', steps: [4], from: 'הכנסות', book: 'Revenue Streams' },
  { id: 'left', row: 'money', span: 4, icon: 'receipt', label: 'נשאר לך', steps: [4], from: 'הוצאות', book: 'Cost Structure' },
  { id: 'clients', span: 2, icon: 'user-round-check', label: 'הלקוחות', steps: [3], book: 'Customer Segments' },
  { id: 'reach', span: 2, icon: 'megaphone', label: 'מגיעים אליי', steps: [8, 9, 10], book: 'Channels' },
  { id: 'keep', span: 2, icon: 'heart-handshake', label: 'שומרים קשר', steps: [12, 13], book: 'Customer Relationships' },
  { id: 'offer', span: 2, icon: 'gift', label: 'ההצעה', steps: [2, 6, 7], pick: [2, 7, 6], book: 'Value Propositions' },
  {
    id: 'back',
    span: 2,
    icon: 'layers',
    label: 'מאחורי הקלעים',
    steps: [0, 1, 5, 11, 14],
    pick: [5, 1, 0, 11, 14],
    book: 'Key Resources · Key Activities · Key Partners',
    groups: [
      { label: 'מה יש לי', steps: [0, 1, 5] },
      { label: 'מה אני עושה', steps: [11] },
      { label: 'מי איתי', steps: [14] },
    ],
  },
];
export const areaOf = (i) => AREAS.find((a) => a.row !== 'money' && a.steps.includes(i)) || AREAS[0];

// Demo situations. `current` = index of the next step. `month` = this month so far (from step 11):
// pct = how much of the month passed; targets come from "העסק במספרים".
export const SCENARIOS = {
  new: { label: 'יום ראשון במערכת', sub: 'הלוח כמעט ריק, רק 3 אזורים פתוחים', current: 0 },
  mid: { label: 'אמצע הבנייה', sub: 'פרקים 1-2 מלאים, עכשיו "שם ולוגו"', current: 5 },
  sell: {
    label: 'יוצאים ללקוחות',
    sub: 'שלב 12, מעט פניות: "מגיעים אליי" כתום',
    current: 11,
    month: { pct: 0.4, revenue: 2800, costs: 2100, leads: 2, leadsWas: 3, clients: 1, waiting: 0 },
  },
  run: {
    label: 'עסק שרץ',
    sub: 'המסע הושלם, 2 לקוחות בלי מגע: "שומרים קשר" כתום',
    current: 15,
    month: { pct: 0.6, revenue: 5600, costs: 2100, leads: 9, leadsWas: 6, clients: 2, waiting: 2, waitingDays: 14 },
  },
};
export const DEFAULT_SCENARIO = 'run';
export const TARGET = { revenue: 14000, leads: 12, clients: 5 };

// What to do when an area is the bottleneck (it becomes "הדבר הבא").
export const FIX = {
  reach: { title: ['רק 2 ', 'פניות', ' החודש'], meta: 'היעד 12 · פוסט בקבוצות מביא הכי הרבה', cta: 'לפתוח את הפוסטים', done: 'פורסם היום' },
  clients: { title: ['רק ', 'לקוח אחד', ' החודש'], meta: 'היעד 5 · 2 פניות עוד לא קיבלו שיחה', cta: 'לקבוע שיחות', done: 'נקבעו שיחות' },
  keep: { title: ['2 לקוחות ', 'לא שמעו', ' ממך 14 יום'], meta: 'ההודעות כבר מנוסחות', cta: 'לשלוח הודעה', done: 'נשלח היום' },
};

// "השבוע שלי": three tasks from "צייר לי שבוע מושלם". While building, they follow the journey.
export const WEEK = {
  new: ['לסיים את "מציאת רעיון"', 'לספר על הרעיון לחבר', 'לרשום 3 לקוחות אפשריים'],
  mid: ['לבחור שם לעסק', 'לשאול 2 חברים על השם', 'לצלם תמונה מקצועית'],
  sell: ['לפרסם ב-3 קבוצות', 'לשלוח 5 הודעות', 'שיחת תרגול'],
  run: ['לחזור לדנה', 'פוסט ליום שלישי', 'שיחת תרגול'],
};

export const PAGES = {
  week: { title: ['השבוע ', 'שלי', ''], icon: 'calendar-range', from: 'יומן + משימות', items: ['לוח של שבעה ימים: פגישות, משימות, פוסטים ופולואפים', '"צייר לי שבוע מושלם" נפתח מכאן'] },
  clients: { title: ['הלקוחות ', 'שלי', ''], icon: 'users', from: 'לידים', items: ['טבלה אחת: פשוטה משלב 11, מלאה משלב 14', '"סגרתי!" פותח עסקה בכספים'] },
  money: { title: ['הכספים ', 'שלי', ''], icon: 'wallet', from: 'כספים', items: ['נפתח אחרי "העסק במספרים"', 'הכנסות מול היעד, תזרים ותחזית'] },
};
