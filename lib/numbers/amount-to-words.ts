// Convert numbers to words — French (used in the document PDFs, must be exact)
// and Arabic (used for the Arabic web UI amount-in-words display).

const FR_UNITS = [
  "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit",
  "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
  "dix-sept", "dix-huit", "dix-neuf",
];
const FR_TENS = [
  "", "dix", "vingt", "trente", "quarante", "cinquante", "soixante",
  "soixante-dix", "quatre-vingt", "quatre-vingt-dix",
];

function frBelow100(n: number): string {
  if (n < 20) return FR_UNITS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) {
    if (t === 7) return "soixante-dix";
    if (t === 8) return "quatre-vingts";
    if (t === 9) return "quatre-vingt-dix";
    return FR_TENS[t];
  }
  if (t === 7) return "soixante-" + frBelow100(10 + u);
  if (t === 9) return "quatre-vingt-" + frBelow100(10 + u);
  return FR_TENS[t] + "-" + FR_UNITS[u];
}

function frBelow1000(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let s = "";
  if (h > 0) {
    s += h === 1 ? "cent" : FR_UNITS[h] + " cent";
    if (r === 0 && h > 1) s += "s";
  }
  if (r > 0) s += (s ? " " : "") + frBelow100(r);
  return s;
}

export function toFrenchWords(amount: number): string {
  if (amount === 0) return "zéro";
  const millions = Math.floor(amount / 1_000_000);
  const thousands = Math.floor((amount % 1_000_000) / 1_000);
  const rest = amount % 1_000;
  const parts: string[] = [];
  if (millions > 0) {
    parts.push(
      millions === 1 ? "un million" : toFrenchWords(millions) + " millions"
    );
  }
  if (thousands > 0) {
    parts.push(thousands === 1 ? "mille" : toFrenchWords(thousands) + " mille");
  }
  if (rest > 0) parts.push(frBelow1000(rest));
  return parts.join(" ");
}

const AR_SINGULAR = [
  "", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية",
  "تسعة", "عشرة",
];
const AR_COMPOUND = [
  "", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر",
  "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر",
];
const AR_TENS = [
  "", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون",
  "تسعون",
];
const AR_HUNDREDS_F = {
  1: "مئة",
  2: "مئتان",
  3: "ثلاثمئة",
  4: "أربعمئة",
  5: "خمسمئة",
  6: "ستمئة",
  7: "سبعمئة",
  8: "ثمانمئة",
  9: "تسعمئة",
} as Record<number, string>;

function arTo99(n: number): string {
  if (n <= 10) return AR_SINGULAR[n];
  if (n < 20) return AR_COMPOUND[n - 10];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return AR_TENS[t];
  return AR_SINGULAR[u] + " و" + AR_TENS[t];
}

function arTo999(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let s = "";
  if (h > 0) s = AR_HUNDREDS_F[h];
  if (r > 0) s += (s ? " " : "") + arTo99(r);
  return s;
}

// Produces the Arabic wording for an integer amount of dirhams.
// Best-effort classical grammar (mumayyaz handled for the 1-99 range, larger
// groups simplified); sufficient for the web UI display only — PDFs are French.
export function toArabicWords(amount: number): string {
  if (amount === 0) return "صفر درهم";
  const parts: string[] = [];

  const billions = Math.floor(amount / 1_000_000_000);
  const millions = Math.floor((amount % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((amount % 1_000_000) / 1_000);
  const rest = amount % 1_000;

  if (billions > 0) {
    if (billions === 1) parts.push("مليار");
    else if (billions === 2) parts.push("ملياران");
    else if (billions <= 10) parts.push(AR_SINGULAR[billions] + " مليارات");
    else parts.push(arTo999(billions) + " مليارا");
  }
  if (millions > 0) {
    if (millions === 1) parts.push("مليون");
    else if (millions === 2) parts.push("مليونان");
    else if (millions <= 10) parts.push(AR_SINGULAR[millions] + " ملايين");
    else parts.push(arTo999(millions) + " مليون");
  }
  if (thousands > 0) {
    if (thousands === 1) parts.push("ألف");
    else if (thousands === 2) parts.push("ألفان");
    else if (thousands <= 10) parts.push(AR_SINGULAR[thousands] + " آلاف");
    else parts.push(arTo999(thousands) + " ألفا");
  }

  if (rest > 0) {
    if (rest <= 2) {
      const w = arTo99(rest);
      parts.push(w === "واحد" ? "درهم واحد" : w === "اثنان" ? "درهمان" : w + " درهما");
    } else if (rest <= 10) {
      parts.push(AR_SINGULAR[rest] + " دراهم");
    } else {
      parts.push(arTo99(rest) + " درهما");
    }
  } else {
    parts.push("درهم");
  }

  return parts.join(" و");
}