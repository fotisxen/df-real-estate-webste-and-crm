// Single source of truth for the category tree and the long tail of
// optional listing attributes. The admin form and the public listing
// page both render from this config instead of ~80 hand-written fields
// each, so a field only needs to be added/renamed here once.

export type FieldType = "text" | "number" | "boolean" | "select" | "date";

export interface DetailFieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  unit?: string;
}

export interface DetailGroup {
  title: string;
  fields: DetailFieldDef[];
}

export const CATEGORIES: {
  value: string;
  label: string;
  labelEn: string;
  subcategories: { value: string; label: string; labelEn: string }[];
}[] = [
  {
    value: "residential",
    label: "Κατοικία",
    labelEn: "Residential",
    subcategories: [
      { value: "apartment", label: "Διαμέρισμα", labelEn: "Apartment" },
      { value: "studio", label: "Studio", labelEn: "Studio" },
      { value: "garsoniera", label: "Γκαρσονιέρα", labelEn: "Bedsit" },
      { value: "maisonette", label: "Μεζονέτα", labelEn: "Maisonette" },
      { value: "detached_house", label: "Μονοκατοικία", labelEn: "Detached house" },
      { value: "villa", label: "Βίλα", labelEn: "Villa" },
    ],
  },
  {
    value: "commercial",
    label: "Επαγγελματικός χώρος",
    labelEn: "Commercial",
    subcategories: [
      { value: "office", label: "Γραφείο", labelEn: "Office" },
      { value: "shop", label: "Κατάστημα", labelEn: "Shop" },
      { value: "warehouse", label: "Αποθήκη", labelEn: "Warehouse" },
      { value: "industrial", label: "Βιομηχανικός χώρος", labelEn: "Industrial space" },
      { value: "workshop", label: "Βιοτεχνικός χώρος", labelEn: "Workshop" },
    ],
  },
  {
    value: "land",
    label: "Γη",
    labelEn: "Land",
    subcategories: [
      { value: "plot", label: "Οικόπεδο", labelEn: "Plot" },
      { value: "agricultural_land", label: "Αγροτεμάχιο", labelEn: "Agricultural land" },
      { value: "island", label: "Νησί", labelEn: "Island" },
      { value: "other_land", label: "Λοιπές κατηγορίες", labelEn: "Other" },
    ],
  },
  {
    value: "other",
    label: "Λοιπά ακίνητα",
    labelEn: "Other properties",
    subcategories: [
      { value: "parking", label: "Πάρκινγκ", labelEn: "Parking" },
      { value: "business", label: "Επιχείρηση", labelEn: "Business" },
      { value: "prefab", label: "Προκατασκευασμένο", labelEn: "Prefab" },
      { value: "mobile_home", label: "Λυόμενο", labelEn: "Mobile home" },
      { value: "air_rights", label: "Αέρας", labelEn: "Air rights" },
      { value: "other_misc", label: "Λοιπές κατηγορίες", labelEn: "Other" },
    ],
  },
];

export function subcategoriesFor(category: string) {
  return CATEGORIES.find((c) => c.value === category)?.subcategories ?? [];
}

export const ENERGY_CLASSES = ["A+", "A", "B+", "B", "Γ", "Δ", "Ε", "Ζ", "Η"].map((v) => ({ value: v, label: v }));

export const ZONE_OPTIONS = [
  { value: "residential", label: "Οικιστική" },
  { value: "agricultural", label: "Αγροτική" },
  { value: "commercial", label: "Εμπορική" },
  { value: "industrial", label: "Βιομηχανική" },
  { value: "out_of_plan", label: "Εκτός σχεδίου / Υπό ανάπλαση" },
];

export const DETAIL_GROUPS: DetailGroup[] = [
  {
    title: "Χώροι",
    fields: [
      { key: "floor", label: "Όροφος", type: "text" },
      { key: "levels", label: "Επίπεδα", type: "number" },
      { key: "wc", label: "WC", type: "number" },
      { key: "kitchens", label: "Κουζίνες", type: "number" },
      { key: "living_rooms", label: "Σαλόνια", type: "number" },
      { key: "storage_room", label: "Αποθήκη", type: "boolean" },
      { key: "attic", label: "Σοφίτα", type: "boolean" },
      { key: "playroom", label: "Playroom", type: "boolean" },
    ],
  },
  {
    title: "Ενέργεια",
    fields: [
      { key: "energy_class", label: "Ενεργειακή κλάση", type: "select", options: ENERGY_CLASSES },
      { key: "heating_system", label: "Σύστημα θέρμανσης", type: "text" },
      { key: "air_conditioning", label: "Κλιματισμός", type: "boolean" },
      { key: "solar_water_heater", label: "Ηλιακός θερμοσίφωνας", type: "boolean" },
      { key: "underfloor_heating", label: "Ενδοδαπέδια θέρμανση", type: "boolean" },
      { key: "night_tariff_electricity", label: "Νυχτερινό ρεύμα", type: "boolean" },
    ],
  },
  {
    title: "Κατασκευή",
    fields: [
      { key: "under_construction", label: "Υπό κατασκευή", type: "boolean" },
      { key: "unfinished", label: "Ημιτελές", type: "boolean" },
      { key: "building_floors", label: "Αριθμός ορόφων στο κτήριο", type: "number" },
      { key: "elevator", label: "Ασανσέρ", type: "boolean" },
      { key: "internal_staircase", label: "Εσωτερική σκάλα", type: "boolean" },
      { key: "neoclassical", label: "Νεοκλασικό", type: "boolean" },
      { key: "renovation_year", label: "Έτος ανακαίνισης", type: "number" },
      { key: "renovated", label: "Ανακαινισμένο", type: "boolean" },
      { key: "needs_renovation", label: "Χρήζει ανακαίνισης", type: "boolean" },
      { key: "listed_building", label: "Διατηρητέο", type: "boolean" },
      { key: "net_area_sqm", label: "Καθαρό εμβαδόν", type: "number", unit: "m²" },
      { key: "gross_area_sqm", label: "Μεικτό εμβαδόν", type: "number", unit: "m²" },
    ],
  },
  {
    title: "Ασφάλεια & Άνεση",
    fields: [
      { key: "security_door", label: "Πόρτα ασφαλείας", type: "boolean" },
      { key: "alarm", label: "Συναγερμός", type: "boolean" },
      { key: "painted", label: "Βαμμένο", type: "boolean" },
      { key: "furnished", label: "Επιπλωμένο", type: "boolean" },
      { key: "window_frames", label: "Κουφώματα", type: "text" },
      { key: "glass_type", label: "Τύποι υαλοπινάκων", type: "text" },
      { key: "screens", label: "Σίτες", type: "boolean" },
      { key: "fireplace", label: "Τζάκι", type: "boolean" },
      { key: "bright", label: "Φωτεινό", type: "boolean" },
      { key: "through_ventilated", label: "Διαμπερές", type: "boolean" },
      { key: "luxurious", label: "Πολυτελές", type: "boolean" },
      { key: "ev_charging", label: "Φόρτιση ηλεκτρικών αυτοκινήτων", type: "boolean" },
      { key: "doorman", label: "Υποδοχή με θυρωρό", type: "boolean" },
      { key: "floor_type", label: "Τύπος δαπέδων", type: "text" },
      { key: "satellite_dish", label: "Δορυφορική κεραία", type: "boolean" },
    ],
  },
  {
    title: "Εξωτερικοί χώροι & Τοποθεσία",
    fields: [
      { key: "veranda", label: "Βεράντα", type: "boolean" },
      { key: "awnings", label: "Τέντες", type: "boolean" },
      { key: "bbq", label: "BBQ", type: "boolean" },
      { key: "garden", label: "Κήπος", type: "boolean" },
      { key: "pool", label: "Πισίνα", type: "boolean" },
      { key: "view", label: "Θέα", type: "boolean" },
      { key: "orientation", label: "Προσανατολισμός", type: "text" },
      { key: "quiet", label: "Φωνιακό", type: "boolean" },
      { key: "front_facing", label: "Προσόψεως", type: "boolean" },
      { key: "zone", label: "Ζώνη", type: "select", options: ZONE_OPTIONS },
      { key: "disabled_access", label: "Πρόσβαση ΑΜΕΑ", type: "boolean" },
      { key: "semi_basement", label: "Υπόσκαφο", type: "boolean" },
      { key: "distance_from_sea_m", label: "Απόσταση από θάλασσα", type: "number", unit: "m" },
      { key: "parking", label: "Στάθμευση", type: "boolean" },
    ],
  },
  {
    title: "Καταλληλότητα",
    fields: [
      { key: "student_suitable", label: "Φοιτητικό", type: "boolean" },
      { key: "holiday_home", label: "Εξοχικό", type: "boolean" },
      { key: "professional_use", label: "Επαγγελματική χρήση", type: "boolean" },
      { key: "tourist_rental", label: "Τουριστική ενοικίαση", type: "boolean" },
      { key: "doctor_office_suitable", label: "Ιατρείο", type: "boolean" },
      { key: "investment", label: "Επενδυτικό", type: "boolean" },
    ],
  },
];

export type PropertyDetails = Record<string, string | number | boolean | undefined>;

export function hasValue(v: unknown) {
  return v !== undefined && v !== null && v !== "" && v !== false;
}
