export const CATEGORIES = [
  { id: "ALL", label: "All Categories", icon: "LayoutGrid" },
  { id: "ELECTRONICS", label: "Electronics & Tech", icon: "Laptop" },
  { id: "TEXTBOOKS", label: "Textbooks & Notes", icon: "BookOpen" },
  { id: "CYCLES", label: "Cycles & Commute", icon: "Bike" },
  { id: "FURNITURE", label: "Hostel Furniture", icon: "Armchair" },
  { id: "HOSTEL_ESSENTIALS", label: "Hostel Essentials", icon: "Home" },
  { id: "CLOTHING", label: "Clothing & Merch", icon: "Shirt" },
  { id: "GADGETS", label: "Calculators & Kits", icon: "Cpu" },
  { id: "OTHER", label: "Miscellaneous", icon: "Package" },
] as const;

export const CONDITIONS = [
  { id: "NEW", label: "Brand New (Unopened)", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "LIKE_NEW", label: "Like New (Barely used)", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "GOOD", label: "Good (Fully functional)", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "FAIR", label: "Fair (Visible wear)", badge: "bg-amber-50 text-amber-700 border-amber-200" },
] as const;

export const LOST_FOUND_CATEGORIES = [
  { id: "ALL", label: "All Items" },
  { id: "ELECTRONICS", label: "Phones, Earphones & Laptops" },
  { id: "WALLETS_KEYS", label: "Wallets & Keys" },
  { id: "IDS_DOCS", label: "College ID & Documents" },
  { id: "BAGS", label: "Backpacks & Pouches" },
  { id: "CLOTHING", label: "Jackets & Apparel" },
  { id: "ACCESSORIES", label: "Watches, Glasses & Bottles" },
  { id: "BOOKS", label: "Books & Folders" },
  { id: "OTHER", label: "Other Items" },
] as const;

export const REPORT_REASONS = [
  { id: "SPAM", label: "Spam or misleading information" },
  { id: "SCAM", label: "Suspected scam or payment fraud" },
  { id: "HARASSMENT", label: "Harassment or abusive language" },
  { id: "INAPPROPRIATE", label: "Inappropriate or adult content" },
  { id: "FAKE_LISTING", label: "Counterfeit item or fake listing" },
  { id: "OTHER", label: "Other campus policy violation" },
] as const;

export const DEFAULT_COLLEGE_ID = "rtu_kota";
