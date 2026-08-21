export interface ProvinceData {
  name: string;
  districts: {
    name: string;
    postalCode: string;
  }[];
}

export const SRI_LANKA_PROVINCES: ProvinceData[] = [
  {
    name: "Northern Province",
    districts: [
      { name: "Vavuniya", postalCode: "43000" },
      { name: "Jaffna", postalCode: "40000" },
      { name: "Kilinochchi", postalCode: "44000" },
      { name: "Mannar", postalCode: "41000" },
      { name: "Mullaitivu", postalCode: "42000" },
    ],
  },
  {
    name: "Western Province",
    districts: [
      { name: "Colombo", postalCode: "00100" },
      { name: "Gampaha", postalCode: "11000" },
      { name: "Kalutara", postalCode: "12000" },
    ],
  },
  {
    name: "Central Province",
    districts: [
      { name: "Kandy", postalCode: "20000" },
      { name: "Matale", postalCode: "21000" },
      { name: "Nuwara Eliya", postalCode: "22200" },
    ],
  },
  {
    name: "Eastern Province",
    districts: [
      { name: "Batticaloa", postalCode: "30000" },
      { name: "Ampara", postalCode: "32000" },
      { name: "Trincomalee", postalCode: "31000" },
    ],
  },
  {
    name: "Southern Province",
    districts: [
      { name: "Galle", postalCode: "80000" },
      { name: "Matara", postalCode: "81000" },
      { name: "Hambantota", postalCode: "82000" },
    ],
  },
  {
    name: "North Western Province",
    districts: [
      { name: "Kurunegala", postalCode: "60000" },
      { name: "Puttalam", postalCode: "61000" },
    ],
  },
  {
    name: "North Central Province",
    districts: [
      { name: "Anuradhapura", postalCode: "50000" },
      { name: "Polonnaruwa", postalCode: "51000" },
    ],
  },
  {
    name: "Uva Province",
    districts: [
      { name: "Badulla", postalCode: "90000" },
      { name: "Monaragala", postalCode: "91200" },
    ],
  },
  {
    name: "Sabaragamuwa Province",
    districts: [
      { name: "Ratnapura", postalCode: "70000" },
      { name: "Kegalle", postalCode: "71000" },
    ],
  },
];

export function getDistrictsForProvince(provinceName: string): { name: string; postalCode: string }[] {
  const prov = SRI_LANKA_PROVINCES.find((p) => p.name === provinceName);
  return prov ? prov.districts : SRI_LANKA_PROVINCES[0].districts;
}

export function getDefaultPostalCodeForDistrict(districtName: string): string {
  for (const prov of SRI_LANKA_PROVINCES) {
    const d = prov.districts.find((x) => x.name.toLowerCase() === districtName.toLowerCase());
    if (d) return d.postalCode;
  }
  return "43000";
}

/**
 * Validates Sri Lankan mobile numbers (supports 07X XXX XXXX, +94 7X XXX XXXX, 947X...)
 */
export function isValidSriLankanPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, "");
  // Matches 07XXXXXXXX (10 digits) or +947XXXXXXXX / 947XXXXXXXX (11-12 digits)
  const regex = /^(?:\+94|94|0)?7[0-9]{8}$/;
  return regex.test(cleaned);
}

/**
 * Formats a phone number cleanly into Sri Lankan standard 07X XXX XXXX
 */
export function formatSriLankanPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("+94")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("94") && cleaned.length > 9) {
    cleaned = "0" + cleaned.slice(2);
  }
  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}
