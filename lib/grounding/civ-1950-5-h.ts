// Verbatim excerpt of California Civil Code §1950.5(h)(1), retrieved
// 2026-09-24 from leginfo.legislature.ca.gov. Note the subdivision letter:
// an earlier version of this app cited this as "(g)" — (g) is actually
// about photographs of the rental unit; the 21-day itemized-statement
// deadline is in (h). Fixed everywhere this is cited.
export const CIV_1950_5_H = {
  id: "civ-1950-5-h",
  citation: "Civ. Code §1950.5(h)(1)",
  sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=1950.5.&lawCode=CIV",
  text:
    "No later than 21 calendar days after the tenant has vacated the premises... the landlord shall " +
    "furnish the tenant a copy of an itemized statement indicating the basis for, and the amount of, " +
    "any security received and the disposition of the security, and shall return any remaining portion " +
    "of the security to the tenant.",
  retrievedAt: "2026-09-24",
} as const;
