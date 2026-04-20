/**
 * nidParser.ts  –  Robust OCR parser for Bangladeshi NID (front & back) + Passport.
 *
 * Written from REAL ML Kit OCR samples of Bangladeshi NIDs:
 *
 *  FRONT OCR lines:
 *    "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার"
 *    "জাতীয় পরিচয়পত্র / National ID Card"
 *    "নাম"
 *    "মোঃ মিজান"                    ← Bangla name (skip)
 *    "Name"
 *    "MD. MIZAN"                     ← romanised name (dots allowed)
 *    "পিতা"
 *    "মোঃ নওশাদ"
 *    "মাতা"
 *    "নাসিমা"
 *    "Date of Birth  06 Mar 1990"
 *    "NID No  190 766 2322"          ← 9 digits spaced 3-3-4
 *
 *  BACK OCR lines:
 *    address lines in Bangla
 *    "Blood Group  B+"
 *    "Place of Birth  DHAKA"
 *    "Issue Date  19 Jan 2017"
 *    "I<BGD190766232<26<<<<<<<<<<<<<<"   ← MRZ line 1
 *    "9003060M3201185BGD<<<<<<<<<<<6"    ← MRZ line 2
 *    "MIZAN<<MD<<<<<<<<<<<<<<<<<<<ঢাক"   ← MRZ line 3 (surname<<givenname)
 */

import { ExtractedData } from '@/types/kyc';

// ─── utilities ───────────────────────────────────────────────────────────────

const cl = (s: string) => s.replace(/\s+/g, ' ').trim();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MM_TO_MON: Record<string, string> = Object.fromEntries(
  MONTHS.map((m, i) => [String(i + 1).padStart(2, '0'), m])
);

function normDate(raw: string): string {
  raw = cl(raw);
  if (/^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}$/i.test(raw)) return raw; // "06 Mar 1990"
  const dmy = raw.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/);
  if (dmy) {
    const m = MM_TO_MON[dmy[2].padStart(2, '0')];
    return m ? `${dmy[1].padStart(2, '0')} ${m} ${dmy[3]}` : raw;
  }
  const mrz = raw.match(/^(\d{2})(\d{2})(\d{2})$/); // YYMMDD
  if (mrz) {
    const yy = +mrz[1], mm = +mrz[2] - 1, dd = +mrz[3];
    if (mm < 0 || mm > 11) return raw;
    return `${String(dd).padStart(2, '0')} ${MONTHS[mm]} ${yy < 30 ? 2000 + yy : 1900 + yy}`;
  }
  return raw;
}

const normNID = (s: string) => s.replace(/[\s\-]/g, '');

// ─── label-value helpers ──────────────────────────────────────────────────────

/**
 * labelNext: finds a line matching any labelPattern, then returns the
 * next non-empty, non-label line (up to 3 lines forward).
 */
function labelNext(
  lines: string[],
  labelPatterns: RegExp[],
  valueGuard?: RegExp,
): string {
  const LABEL_RE = /^(Name|নাম|পিতা|Father|মাতা|Mother|স্বামী|Spouse|Date|NID|জন্ম|Blood|Issue|Place|Address|ঠিকানা)$/i;
  for (let i = 0; i < lines.length - 1; i++) {
    const l = lines[i].trim();
    if (!labelPatterns.some(p => p.test(l))) continue;
    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
      const v = lines[j].trim();
      if (!v) continue;
      if (LABEL_RE.test(v)) continue; // skip if next line is also a label
      if (valueGuard && !valueGuard.test(v)) continue;
      return v;
    }
  }
  return '';
}

/**
 * labelInline: finds a pattern like "Date of Birth  06 Mar 1990" in one line.
 */
function labelInline(text: string, patterns: RegExp[]): string {
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return cl(m[1]);
  }
  return '';
}

// ─── romanised name detector ──────────────────────────────────────────────────

const SKIP_WORDS = new Set([
  'NATIONAL', 'BANGLADESH', 'REPUBLIC', 'GOVERNMENT', 'PEOPLES', 'CARD', 'NID',
  'PASSPORT', 'FRONT', 'BACK', 'PHOTO', 'SIGNATURE', 'ELECTORAL', 'COMMISSION',
]);

/**
 * Returns true if the line looks like a Bangladeshi NID romanised name.
 * Handles: "MD. MIZAN"  "DALAWER HOSSAIN JUWEL"  "MST. NASIMA BEGUM"
 */
function isRomanisedName(line: string): boolean {
  const t = line.trim().toUpperCase();
  // Only uppercase letters, spaces, dots, hyphens
  if (!/^[A-Z][A-Z .\-]{3,50}$/.test(t)) return false;
  const words = t.split(/\s+/);
  if (words.length < 2 || words.length > 7) return false;
  if (words.some(w => SKIP_WORDS.has(w.replace(/\./g, '')))) return false;
  // At least one word must be pure alpha ≥ 3 chars (not a number string)
  return words.some(w => /^[A-Z]{3,}$/.test(w.replace(/\./g, '')));
}

// ─── MRZ parser ──────────────────────────────────────────────────────────────

interface MrzData {
  name?: string;
  idNumber?: string;
  dob?: string;
  expiryDate?: string;
}

function parseMRZ(lines: string[]): MrzData {
  // MRZ lines: many '<', length ≥ 15, no spaces
  const mrzRaw = lines
    .map(l => l.trim().replace(/\s/g, ''))
    .filter(l => (l.match(/</g) || []).length >= 5 && l.length >= 15);

  if (mrzRaw.length === 0) return {};

  const r: MrzData = {};
  const l1 = mrzRaw[0].toUpperCase();
  const l2 = mrzRaw[1]?.toUpperCase() ?? '';
  const l3 = mrzRaw[2]?.toUpperCase() ?? '';

  // ── TD1 (NID): 3 lines ────────────────────────────────────────────────────
  if (mrzRaw.length >= 2) {
    // Line 1: I<BGD190766232<26<<… → doc number after 5-char type+country
    const docM = l1.match(/^I[A-Z<][A-Z]{3}([A-Z0-9]{1,9})[<0-9]/);
    if (docM) r.idNumber = docM[1].replace(/<+/g, '');

    // Line 2: YYMMDD then sex/expiry
    if (l2.length >= 14) {
      const dob = l2.substring(0, 6);
      if (/^\d{6}$/.test(dob)) r.dob = normDate(dob);
      const exp = l2.substring(8, 14);
      if (/^\d{6}$/.test(exp)) r.expiryDate = normDate(exp);
    }
  }

  // ── Name line (line 3 for TD1, or last line with '<<') ────────────────────
  const nameLine = (mrzRaw.length >= 3 ? l3 : l1);
  if (nameLine.includes('<<')) {
    // Strip non-ASCII (Bangla OCR bleed at end of line)
    const ascii = nameLine.replace(/[^\x00-\x7F<]/g, '');
    const parts = ascii.split('<<').filter(Boolean);
    const surname = (parts[0] || '').replace(/<+/g, ' ').trim();
    const givenName = (parts[1] || '').replace(/<+/g, ' ').trim();
    // NID MRZ order: SURNAME<<GIVENNAME  →  display as "GIVENNAME SURNAME"
    r.name = [givenName, surname].filter(Boolean).join(' ') || surname;
  }

  return r;
}

// ─── FRONT parser ─────────────────────────────────────────────────────────────

function parseFront(lines: string[], text: string): Partial<ExtractedData> {
  const r: Partial<ExtractedData> = {};

  // ── Name ──────────────────────────────────────────────────────────────────
  // Strategy 1: line labeled "Name" → next line
  const nameByLabel = labelNext(lines, [/^Name$/i, /^নাম$/]);
  if (nameByLabel && isRomanisedName(nameByLabel)) r.name = cl(nameByLabel);

  // Strategy 2: scan every line for romanised name pattern
  if (!r.name) {
    for (const l of lines) {
      if (isRomanisedName(l)) { r.name = cl(l); break; }
    }
  }

  // Strategy 3: "Name: MD. MIZAN" inline
  if (!r.name) {
    const m = text.match(/Name\s*[:\-]\s*([A-Za-z][A-Za-z .\-]{2,40})/i);
    if (m) r.name = cl(m[1]);
  }

  // ── NID Number ────────────────────────────────────────────────────────────

  // Inline: "NID No  190 766 2322"
  const nidInline = labelInline(text, [
    /NID\s*(?:No\.?|Number)?\s*[:\-]?\s*([\d][\d ]{7,20}\d)/i,
  ]);
  if (nidInline) r.idNumber = normNID(nidInline);

  // Label → next line
  if (!r.idNumber) {
    const nidLabel = labelNext(lines, [/^NID\s*(?:No\.?)?$/i], /^\d[\d\s]{6,19}$/);
    if (nidLabel) r.idNumber = normNID(nidLabel);
  }

  // Standalone digit groups on any line
  if (!r.idNumber) {
    for (const l of lines) {
      const t = l.trim();
      // "190 766 2322"  →  3-space-3-space-4
      const sp = t.match(/^(\d{3})\s+(\d{3})\s+(\d{3,5})$/);
      if (sp) { r.idNumber = sp[1] + sp[2] + sp[3]; break; }
      // 10 / 13 / 17 digit solid
      const pure = t.replace(/\s/g, '');
      if (/^\d{10}$|^\d{13}$|^\d{17}$/.test(pure)) { r.idNumber = pure; break; }
    }
  }

  // ── Date of Birth ─────────────────────────────────────────────────────────

  const dobPatterns: RegExp[] = [
    /Date\s+of\s+Birth\s*[:\-]?\s*(\d{1,2}\s+\w{3,9}\s+\d{4})/i,
    /DOB\s*[:\-]?\s*(\d{1,2}\s+\w{3,9}\s+\d{4})/i,
    /জন্ম\s*তারিখ\s*[:\-]?\s*(\d{1,2}\s+\w{3,9}\s+\d{4})/i,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i,
    /(\d{2}[-\/]\d{2}[-\/]\d{4})/,
  ];
  const dobInline = labelInline(text, dobPatterns);
  if (dobInline) r.dob = normDate(dobInline);

  if (!r.dob) {
    const dobLabel = labelNext(lines, [/^Date\s+of\s+Birth$/i, /^DOB$/i, /^জন্ম/], /\d/);
    if (dobLabel) r.dob = normDate(dobLabel);
  }

  // ── Father / Mother / Spouse ──────────────────────────────────────────────

  const father = labelNext(lines, [/^Father$/i, /^পিতা$/]);
  if (father) r.fatherName = cl(father);

  const mother = labelNext(lines, [/^Mother$/i, /^মাতা$/]);
  if (mother) r.motherName = cl(mother);

  const spouse = labelNext(lines, [/^Spouse$/i, /^স্বামী$/i, /^স্ত্রী$/i]);
  if (spouse) r.spouseName = cl(spouse);

  return r;
}

// ─── BACK parser ──────────────────────────────────────────────────────────────

function parseBack(lines: string[], text: string): Partial<ExtractedData> {
  const r: Partial<ExtractedData> = {};

  // ── MRZ ───────────────────────────────────────────────────────────────────
  const mrz = parseMRZ(lines);
  if (mrz.name) r.name = mrz.name;
  if (mrz.idNumber) r.idNumber = mrz.idNumber;
  if (mrz.dob) r.dob = mrz.dob;
  if (mrz.expiryDate) r.expiryDate = mrz.expiryDate;

  // ── Blood group ───────────────────────────────────────────────────────────
  const bg = labelInline(text, [
    /Blood\s*Group\s*[:\-]?\s*([ABO]{1,3}[+\-]?)/i,
    /রক্তের?\s*গ্রুপ\s*[:\-]?\s*([ABO]{1,3}[+\-]?)/i,
  ]);
  if (bg) r.bloodGroup = bg.trim();

  // Also scan label→next for blood group
  if (!r.bloodGroup) {
    const bgLabel = labelNext(lines, [/^Blood\s*Group$/i, /^রক্ত/], /^[ABO]/i);
    if (bgLabel) r.bloodGroup = bgLabel.trim();
  }

  // ── Place of birth ────────────────────────────────────────────────────────
  const pob = labelInline(text, [
    /Place\s+of\s+Birth\s*[:\-]?\s*([A-Za-z\u0980-\u09FF ]{2,30}?)(?:\s{2,}|\n|$)/i,
    /জন্মস্থান\s*[:\-]?\s*([A-Za-z\u0980-\u09FF ]{2,30}?)(?:\s{2,}|\n|$)/i,
  ]);
  if (pob) r.district = cl(pob);

  if (!r.district) {
    const pobLabel = labelNext(lines, [/^Place\s+of\s+Birth$/i, /^জন্মস্থান$/]);
    if (pobLabel) r.district = cl(pobLabel);
  }

  // ── Issue date ────────────────────────────────────────────────────────────
  const issue = labelInline(text, [
    /Issue\s*Date\s*[:\-]?\s*(\d{1,2}\s+\w{3,9}\s+\d{4})/i,
    /Issue\s*Date\s*[:\-]?\s*(\d{2}[-\/]\d{2}[-\/]\d{4})/i,
    /তারিখ\s*[:\-]?\s*(\d{1,2}\s+\w{3,9}\s+\d{4})/i,
  ]);
  if (issue) r.dateOfIssue = normDate(issue);

  if (!r.dateOfIssue) {
    const issLabel = labelNext(lines, [/^Issue\s*Date$/i]);
    if (issLabel) r.dateOfIssue = normDate(issLabel);
  }

  // ── Address ───────────────────────────────────────────────────────────────
  const addrLines: string[] = [];
  for (const l of lines) {
    const t = l.trim();
    if (!t) continue;
    if ((t.match(/</g) || []).length > 3) continue; // skip MRZ
    if (/^(Blood|Place|Issue|Date|NID|Name|পিতা|মাতা|নাম|জন্ম)/i.test(t)) continue;
    if (/[\u0980-\u09FF]/.test(t) && t.length > 6) addrLines.push(t);
  }
  if (addrLines.length > 0) r.presentAddress = addrLines.join(', ');

  return r;
}

// ─── Passport ─────────────────────────────────────────────────────────────────

function parsePassportFront(lines: string[], text: string): Partial<ExtractedData> {
  const r: Partial<ExtractedData> = {};
  const mrz = parseMRZ(lines);
  r.name = mrz.name;
  r.passportNumber = mrz.idNumber;
  r.dob = mrz.dob;
  r.expiryDate = mrz.expiryDate;
  if (!r.name) {
    const m = text.match(/(?:Surname|Given Names?)\s*[:\-]?\s*([A-Za-z ]{2,40})/i);
    if (m) r.name = cl(m[1]);
  }
  if (!r.passportNumber) {
    const m = text.match(/(?:Passport\s*No\.?|Document\s*No\.?)\s*[:\-]?\s*([A-Z]{0,2}\d{6,9})/i);
    if (m) r.passportNumber = m[1];
  }
  return r;
}

// ─── Document type detection ──────────────────────────────────────────────────

type DocType = 'NID' | 'PASSPORT' | 'UNKNOWN';

function detectDocType(text: string): DocType {
  const u = text.toUpperCase();
  if (u.includes('PASSPORT') || /P[<A-Z][A-Z]{3}/.test(text) || /P<<[A-Z]/.test(text)) return 'PASSPORT';
  if (
    u.includes('NID') || u.includes('NATIONAL ID') ||
    /জাতীয় পরিচয়পত্র/.test(text) ||
    /I<BGD/.test(text) ||
    (text.match(/</g) || []).length > 10
  ) return 'NID';
  return 'UNKNOWN';
}

// ─── Public entry point ────────────────────────────────────────────────────────

export function parseDocumentData(
  rawText: string,
  idType: 'nid' | 'passport',
  side: 'front' | 'back',
): ExtractedData {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const docType: DocType = idType === 'passport' ? 'PASSPORT' : detectDocType(rawText);

  let p: Partial<ExtractedData> = {};

  if (docType === 'PASSPORT') {
    if (side === 'front') p = parsePassportFront(lines, rawText);
    else {
      const m = parseMRZ(lines);
      p = { name: m.name, passportNumber: m.idNumber, dob: m.dob, expiryDate: m.expiryDate };
    }
  } else {
    p = side === 'front' ? parseFront(lines, rawText) : parseBack(lines, rawText);
  }

  return {
    documentType: docType,
    name: p.name ?? '',
    idNumber: p.idNumber ?? '',
    passportNumber: p.passportNumber ?? '',
    dob: p.dob ?? '',
    expiryDate: p.expiryDate ?? '',
    fatherName: p.fatherName ?? '',
    motherName: p.motherName ?? '',
    spouseName: p.spouseName ?? '',
    bloodGroup: p.bloodGroup ?? '',
    dateOfIssue: p.dateOfIssue ?? '',
    district: p.district ?? '',
    presentAddress: p.presentAddress ?? '',
    permanentAddress: p.permanentAddress ?? '',
    emergencyContact: p.emergencyContact ?? '',
    address: p.address ?? '',
    observations: p.observations ?? '',
    fileNumber: p.fileNumber ?? '',
    rawText,
    validationErrors: [],
  };
}