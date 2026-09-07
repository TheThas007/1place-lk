# ADMIN PANEL UI/UX DESIGN SYSTEM (V2)
**Next-Generation POS + SaaS Architecture for StreetMobile.lk**

---

## 1. Design Vision

The StreetMobile.lk Admin Panel V2 redesign elevates an existing, high-capacity e-commerce backend into an elite, **POS-inspired SaaS operating dashboard**. Taking inspiration from **Stripe Dashboard's data density & clarity**, **Linear's ultra-crisp typography & keyboard navigation**, and **Apple's restrained visual calm**, this design transforms 26 expansive operational tabs into an intuitive, frictionless control center.

### Core Visual Tenets
* **Clarity over Flash:** Zero distracting multi-color glowing blobs, zero unreadable glassmorphism, and zero exaggerated 3D card tilts. Form follows speed and operational precision.
* **POS Speed:** Instant master-detail transitions, keyboard shortcut indexing (`⌘K`, `Esc`, `ArrowUp/Down`), rapid numeric adjustments, and 1-click status toggles.
* **Calm Authority:** Muted slate backgrounds with pinpoint color highlights. Blue indicates deliberate forward action; emerald confirms completed business transactions; amber flags actionable inventory depletion; red signifies irreversible destructive actions.
* **Contextual Focus:** Secondary actions are placed into contextual overflow menus (`[ ⋮ ]`) to keep tabular views clean, high-contrast, and effortlessly readable.

---

## 2. UX Principles

1. **Zero Manual Needed:** A non-technical store clerk or store owner can log in, view live orders, restock inventory, or launch a promo deal without ever consulting a training manual.
2. **Clear Action Hierarchy:** Every viewport possesses exactly **one** distinct Primary Action button. Secondary actions never visually compete with primary goals.
3. **Information Density with Breathing Room:** Data tables use standard 56px row heights with strict vertical centering, tabular numeric alignment (`tabular-nums`), and high-contrast status pills.
4. **Non-Destructive Workflows:** High-risk tasks (product deletion, order cancellation) require explicit confirmation dialogs with distinct secondary abort buttons.
5. **Progressive Disclosure:** Simple edits occur inline or inside right-hand slide-over drawers. Full modals are reserved for focused, multi-step creations.

---

## 3. Color System

The design uses a unified CSS Variable / Tailwind semantic token structure ensuring seamless parity between **Dark Mode** (default) and **Light Mode**.

### Semantic Token Specifications

| Token Name | Dark Mode (Default) | Light Mode | Purpose / Application |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#090D14` | `#F8FAFC` | Global viewport background |
| `--bg-surface` | `#0F172A` | `#FFFFFF` | Primary cards, table bodies, modal shells, sidebar |
| `--bg-surface-subtle` | `#111827` | `#F1F5F9` | Table headers, chip backgrounds, disabled inputs, code pills |
| `--bg-surface-elevated` | `#1E293B` | `#FFFFFF` | Dropdown menus, floating toasts, popovers |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | `#E2E8F0` | Dividers, row borders, default card perimeters |
| `--border-strong` | `rgba(255, 255, 255, 0.16)` | `#CBD5E1` | Input outlines, active borders, tab underlines |
| `--text-primary` | `#F8FAFC` | `#0F172A` | Page titles, numeric metrics, bold table data |
| `--text-secondary` | `#94A3B8` | `#475569` | Subtitles, table labels, field titles, helper notes |
| `--text-muted` | `#64748B` | `#64748B` | Timestamps, placeholders, inactive icons, shortcuts |
| `--primary` | `#2563EB` | `#2563EB` | Primary buttons, active sidebar tab, focus rings |
| `--primary-hover` | `#1D4ED8` | `#1D4ED8` | Hover state for primary buttons |
| `--primary-subtle` | `rgba(37, 99, 235, 0.12)` | `rgba(37, 99, 235, 0.08)` | Active tab background, selected row background |
| `--success` | `#10B981` | `#059669` | In-stock pills, paid status, export buttons |
| `--success-subtle` | `rgba(16, 185, 129, 0.12)` | `rgba(5, 150, 105, 0.08)` | Success badge background |
| `--warning` | `#F59E0B` | `#D97706` | Low stock warning, pending COD order, draft states |
| `--warning-subtle` | `rgba(245, 158, 11, 0.12)` | `rgba(217, 119, 6, 0.08)` | Warning badge background, alert banner |
| `--danger` | `#EF4444` | `#DC2626` | Delete actions, out of stock, cancelled orders |
| `--danger-subtle` | `rgba(239, 68, 68, 0.12)` | `rgba(220, 38, 38, 0.08)` | Danger badge background, delete hover fill |

---

## 4. Typography

Engineered with **Plus Jakarta Sans** (or **Inter**) with fallback to system fonts. All numbers and prices utilize font feature settings `tnum` (tabular figures) for exact vertical alignment.

### Type Scale

```
Display Large:   28px (1.75rem) / Line-height: 36px / Weight: 600 (SemiBold)  → KPI Metrics, Deal Headline
Page Title:      24px (1.50rem) / Line-height: 32px / Weight: 600 (SemiBold)  → Page / Drawer Headers
Section Title:   16px (1.00rem) / Line-height: 24px / Weight: 600 (SemiBold)  → Card Titles, Modal Headers
Body Regular:    14px (0.875rem)/ Line-height: 20px / Weight: 400 (Regular)   → Paragraphs, Descriptions
Body Medium:     14px (0.875rem)/ Line-height: 20px / Weight: 500 (Medium)    → Table Cell Data, Input Values
Table Headings:  12px (0.75rem) / Line-height: 16px / Weight: 600 (SemiBold)  → Table Column Headers (Uppercase)
Caption / Badge: 11px (0.687rem)/ Line-height: 14px / Weight: 600 (SemiBold)  → Status Badges, Keyboard Shortcuts
Micro:           10px (0.625rem)/ Line-height: 12px / Weight: 500 (Medium)    → Timestamps, Category Tags
```

---

## 5. Spacing System

Strict 4px/8px modular base scale to eliminate arbitrary padding:

* `space-1`: 4px — Icon + text micro gaps, badge interior padding.
* `space-2`: 8px — Button gap, tight list spacing, chip padding.
* `space-3`: 12px — Input interior vertical padding, card sub-item separation.
* `space-4`: 16px — Standard component padding, table cell vertical clearance.
* `space-5`: 20px — Medium card interior padding.
* `space-6`: 24px — Page header bottom margin, standard grid gap.
* `space-8`: 32px — Major dashboard section separation.

---

## 6. Border Radius

Restrained, geometric corner radius tokens avoiding oversized bubbly pill buttons:

* `radius-sm`: 4px — Keyboard shortcut keys, badge pills, checkbox squares.
* `radius-md`: 8px — Action buttons, text inputs, dropdown menus, table row selects.
* `radius-lg`: 12px — Standard cards, data table containers, modal shells.
* `radius-xl`: 16px — Master slide-over drawers, floating toasts.
* `radius-full`: 9999px — User avatars, live connection indicators.

---

## 7. Shadow System

Subtle elevations that work seamlessly in both dark and light modes:

* `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` — Interactive buttons, dropdown items.
* `shadow-card`: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)` — Default card container.
* `shadow-dropdown`: `0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.15)` — Menus, popovers.
* `shadow-drawer`: `-10px 0 25px -5px rgba(0, 0, 0, 0.35)` — Slide-over right drawer.
* `shadow-modal`: `0 25px 50px -12px rgba(0, 0, 0, 0.5)` — Centered dialogs.

---

## 8. Animation System

Optimized for **fast, snappy interaction** (150ms–200ms) with zero sluggish motion:

* **Micro-transitions:** `150ms cubic-bezier(0.16, 1, 0.3, 1)` — Button hover, checkbox toggles, input focus rings.
* **Drawer Slide-in:** `220ms cubic-bezier(0.16, 1, 0.3, 1)` — Right-hand order and product drawers.
* **Modal Zoom-fade:** `180ms cubic-bezier(0.16, 1, 0.3, 1)` — Scale `0.98` to `1.00`, opacity `0` to `1`.
* **Toast Notification:** `200ms ease-out` — Slide up 12px and fade in.
* **Rule:** No continuous bouncing, pulsating elements, or gratuitous parallax.

---

## 9. Global Layout

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (248px)     │  TOP HEADER BAR (h-16 / 64px)                                   │
│  - Logo & Store Name │  - Context / Breadcrumbs   │  Search (⌘K)  │ Theme │ Profile    │
│  - Category Groups   ├─────────────────────────────────────────────────────────────────┤
│    • Overview        │  PAGE HEADER (h-18 / 72px)                                      │
│    • Catalog         │  - Page Title + Subtitle            │ Context Actions / Primary │
│    • Sales           ├─────────────────────────────────────────────────────────────────┤
│    • Operations      │  FILTER & SEARCH TOOLBAR (h-12 / 48px)                          │
│    • Marketing       │  - Search Box  │  Filter Chips  │  Sort  │  Bulk Action Bar     │
│    • System          ├─────────────────────────────────────────────────────────────────┤
│                      │  CONTENT CANVAS                                                 │
│  - Storage / Support │  (Tables, Split Master-Detail Views, KPI Cards, Form Grids)     │
│  - Sign Out          │                                                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Desktop:** Sidebar fixed at `248px`, header fixed at `64px`, content dynamically scrolls with zero double-scrollbars.
* **Tablet (768px – 1024px):** Sidebar collapses to compact `68px` icon rail with tooltip flyouts.
* **Mobile (<768px):** Sidebar collapses into a sliding off-canvas drawer; top header provides hamburger button; bottom navigation provides quick POS access to **Overview**, **Orders**, **Products**, and **Inventory**.

---

## 10. Sidebar

The sidebar organizes 26 tabs into **6 logical, high-level domain groups** with uppercase section dividers. This eliminates the infinite, overwhelming single-list scrollbar while preserving **100% of all routes and features**.

```
[ StreetMobile.lk ]  (Store Icon + Live Green Indicator)

── OVERVIEW ──────────────────────────
  [▣] Dashboard              (?tab=overview)

── CATALOG & PRODUCTS ────────────────
  [⊞] Products               (?tab=products)
  [📁] Categories            (?tab=categories)
  [🗂] Category Mega Menu    (?tab=mega-menu)
  [🏷] Brands                (?tab=brands)
  [❖] Featured Collections   (?tab=collections)
  [✨] Visual Showcase        (?tab=showcase)

── SALES & ORDERS ────────────────────
  [🛒] Orders                (?tab=orders)
  [🔥] Today's Deal          (?tab=today-deal)
  [🎟] Promo Codes & Coupons (?tab=coupons)
  [💳] Payments & Gateways   (?tab=payments)
  [📈] Analytics             (?tab=analytics)

── STORE OPERATIONS ──────────────────
  [📦] Inventory             (?tab=inventory)
  [🔧] Mobile Repairs        (?tab=repairs)
  [💵] Cash Flow             (?tab=cashflow)
  [🛡] Warranty Management   (?tab=warranties)
  [👥] Customers             (?tab=users)

── CONTENT & MARKETING ───────────────
  [🖼] Store Gallery          (?tab=gallery)
  [🎞] Hero Slider            (?tab=hero)
  [📢] Offers & Banners      (?tab=banners)
  [⭐] Google Reviews         (?tab=reviews)
  [🌐] Footer Settings       (?tab=footer)

── SYSTEM & CONFIG ───────────────────
  [🤖] Streetla AI Assistant (?tab=assistant)
  [📱] Mobile Experience     (?tab=mobile)
  [⚙] Store & Auth Settings  (?tab=settings)
  [🕒] Contact & Store Times (?tab=contact-settings)

──────────────────────────────────────
  [?] WhatsApp Support       (Quick Link)
  [↪] Sign Out               (Subtle Red)
```

### Sidebar Item Behavior
* **Default State:** `h-9 px-3 rounded-md text-sm text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-surface-subtle]`.
* **Active State:** `h-9 px-3 rounded-md text-sm font-semibold text-[--primary] bg-[--primary-subtle] relative`.
* **Left Active Bar:** An internal `w-1 h-5 rounded-r bg-[--primary]` indicator anchors the active tab.
* **Collapsed Rail Mode:** Displays centered icon with 200ms delay floating tooltip showing title and item count.

---

## 11. Header

A crisp, 64px horizontal utility bar that anchors the viewport:

* **Left Section:**
  * Mobile Hamburger Icon (`lg:hidden`).
  * Breadcrumb Navigation: e.g., `Admin / Sales / Orders`.
* **Center Section:**
  * Universal Omnibar Search (`max-w-md w-full`).
  * Placeholder: `"Search orders, products, customers..."`.
  * Right Shortcut Indicator: `[ ⌘ K ]` (triggers search modal or focuses input).
* **Right Section:**
  * **Theme Switcher:** Single-click icon toggle (`☀ Light` / `🌙 Dark`) with immediate DOM token update and persistent `localStorage` synchronization.
  * **WhatsApp Support Hotline Link:** Clean badge linking to `+94 77 414 1118`.
  * **Live Order Notification Bell:** Badge counter indicating unread / incoming orders.
  * **Store Admin Profile:** Avatar thumbnail, admin label, and dropdown arrow.

---

## 12. Navigation Architecture

To guarantee that **nothing is lost**, the following table maps every existing tab identifier directly to its streamlined category group:

| Existing Tab Parameter | Group Classification | Display Title |
| :--- | :--- | :--- |
| `?tab=overview` | OVERVIEW | Dashboard Overview |
| `?tab=products` | CATALOG | Product Catalog |
| `?tab=categories` | CATALOG | Categories |
| `?tab=mega-menu` | CATALOG | Category Mega Menu |
| `?tab=brands` | CATALOG | Brands |
| `?tab=collections` | CATALOG | Featured Collections |
| `?tab=showcase` | CATALOG | Visual Showcase |
| `?tab=orders` | SALES | Orders |
| `?tab=today-deal` | SALES | Today’s Deal |
| `?tab=coupons` | SALES | Promo Codes & Coupons |
| `?tab=payments` | SALES | Payments & Gateways |
| `?tab=analytics` | SALES | Analytics & Reports |
| `?tab=inventory` | OPERATIONS | Inventory Levels |
| `?tab=repairs` | OPERATIONS | Mobile Repairs |
| `?tab=cashflow` | OPERATIONS | Cash Flow Accounts |
| `?tab=warranties` | OPERATIONS | Warranty Tracker |
| `?tab=users` | OPERATIONS | Customers Directory |
| `?tab=gallery` | MARKETING | Store Gallery |
| `?tab=hero` | MARKETING | Hero Slider |
| `?tab=banners` | MARKETING | Offers & Banners |
| `?tab=reviews` | MARKETING | Google Reviews |
| `?tab=footer` | MARKETING | Footer Configuration |
| `?tab=assistant` | SYSTEM | Streetla AI Assistant |
| `?tab=mobile` | SYSTEM | Mobile Experience |
| `?tab=settings` | SYSTEM | Store & Auth Settings |
| `?tab=contact-settings`| SYSTEM | Contact & Store Hours |

---

## 13. Button System

### Button Matrix

| Button Variant | Visual Specification | Sizing & Height | Intended Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | Solid Blue (`bg-[--primary] text-white hover:bg-[--primary-hover]`) | `h-10 px-4 text-sm font-semibold rounded-lg shadow-sm` | Primary page action (`Add Product`, `Save Changes`, `Book Job`) |
| **Secondary** | Subtle Surface (`bg-[--bg-surface] border border-[--border-strong] text-[--text-primary] hover:bg-[--bg-surface-subtle]`) | `h-10 px-4 text-sm font-medium rounded-lg` | Alternative actions (`Export CSV`, `Cancel`, `Download PDF`) |
| **Ghost / Icon**| Transparent (`hover:bg-[--bg-surface-subtle] text-[--text-secondary] hover:text-[--text-primary]`) | `h-8 w-8 rounded-md flex items-center justify-center` | Table row actions, reorder arrows, drawer close buttons |
| **Contextual Menu** | Subtle icon button `[ ⋮ ]` revealing floating popover menu | `h-8 w-8 rounded-md` | Row secondary actions (`Edit`, `Duplicate`, `Archive`, `Delete`) |
| **Destructive Subtle** | Red tint text (`text-[--danger] hover:bg-[--danger-subtle] rounded-md`) | `h-8 px-2.5 text-xs font-semibold` | Contextual delete, removal actions (Never giant red buttons!) |
| **Success Action** | Solid Emerald (`bg-[--success] text-white hover:opacity-95`) | `h-9 px-3.5 text-xs font-semibold rounded-lg` | Restock confirmation, payment verification |

---

## 14. Form System

* **Labels:** 13px font, weight 500, color `var(--text-secondary)`, positioned 6px above inputs.
* **Inputs:** Height 40px, padding horizontal 12px, border `1px solid var(--border-subtle)`, background `var(--bg-canvas)`, text `14px var(--text-primary)`.
* **Focus Ring:** `2px solid var(--primary)` with zero layout shift.
* **Inline Error:** 12px red caption directly underneath input; border becomes `var(--danger)`.
* **Switches / Toggles:** Clean Apple-style 20px x 36px pill toggle; smooth 150ms knob slide.

---

## 15. Modal System

Modals are strictly reserved for **short, focused operations** requiring full attention:
* Max Widths: Standard `520px`, Large `720px`.
* Background overlay: `rgba(0, 0, 0, 0.65)` with light backdrop blur (`backdrop-blur-sm`).
* Enter animation: `180ms ease-out scale(0.98 -> 1.0) fade-in`.
* Always includes top header, clear title, `[ Esc ]` shortcut listener, body padding `24px`, and pinned footer with `[ Cancel ]` on left and `[ Confirm / Save ]` on right.

---

## 16. Drawer System (Slide-Over Panel)

For rich operational interactions (Order inspection, Customer history, Product multi-step editing), **Slide-Over Drawers** are used instead of jarring full-page transitions:
* Docked to the right viewport edge.
* Width: `480px` on desktop, `100vw` on mobile.
* Elevation: `shadow-drawer` with semi-transparent backdrop.
* Preserves underlying table position so the admin never loses their context.

---

## 17. Table System

Tables are the backbone of the POS admin:
* **Row Height:** Exact 54px–58px height with vertical centering.
* **Header Row:** Height 36px, uppercase 11px font, weight 600, color `var(--text-muted)`, background `var(--bg-surface-subtle)`.
* **Row Separators:** `1px solid var(--border-subtle)`.
* **Row Hover:** Subtle highlight `var(--bg-surface-subtle)` with smooth 100ms transition.
* **Numeric Columns:** Right-aligned with tabular font feature (`font-mono` or `tabular-nums`).
* **Selection State:** Checked rows display subtle blue tint `var(--primary-subtle)` with blue border accent.

---

## 18. Card System

* Clean, border-anchored containers (`1px solid var(--border-subtle)`).
* Background: `var(--bg-surface)`.
* Border radius: `12px`.
* Padding: `20px` standard.
* Zero heavy dropshadows or distracting colored glows.

---

## 19. Toast System

* Position: `fixed bottom-6 right-6 z-50`.
* Appearance: Compact horizontal pill (`h-12 max-w-sm px-4 rounded-xl border border-[--border-subtle] bg-[--bg-surface-elevated] shadow-dropdown flex items-center gap-3`).
* Auto-dismiss: Exact 3.5 seconds with pause-on-hover.
* **Live Order Alert Toast:**
  * Distinct sound chime.
  * Customer name, order total, and 2 action buttons: `[ View Order ]` (opens drawer) and `[ Dismiss ]`.

---

## 20. Dashboard (`?tab=overview`)

### Page Purpose
Acts as the daily command center giving immediate clarity on sales performance, inventory risks, and pending order actions.

### Layout & Hierarchy
```
┌────────────────────────────────────────────────────────────────────────┐
│  PAGE TITLE: Store Overview                    [ Today / 7D / 30D ▾ ]  │
├────────────────────────────────────────────────────────────────────────┤
│  [!] STOCK ALERT: 3 items are low in stock       [ Review Stock → ]    │
├────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ TOTAL SALES  │ │ ORDERS       │ │ PRODUCTS     │ │ CUSTOMERS    │  │
│  │ Rs. 2.48M    │ │ 1,284        │ │ 326          │ │ 4,892        │  │
│  │ ↑ 18.6% vs 7d│ │ ↑ 12.4% vs 7d│ │ ↑ 7.3% vs 7d │ │ ↑ 15.8% vs 7d│  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐ ┌───────────────────────┐  │
│  │ REVENUE OVERVIEW (Area Line Chart)     │ │ ORDER STATUS (Donut)  │  │
│  │ (Clean SVG curve + date intervals)     │ │ Delivered: 47.7%      │  │
│  │                                        │ │ Processing: 24.3%     │  │
│  │                                        │ │ COD Pending: 18.4%    │  │
│  └────────────────────────────────────────┘ └───────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐ ┌───────────────────────┐  │
│  │ RECENT ORDERS (Clean Table)            │ │ QUICK STOCK RECHECK   │  │
│  │ ID  │ Customer │ Total │ Status │ Date │ │ Item  │ Variant │ Qty │  │
│  │                                        │ │ (Inline Restock Input)│  │
│  └────────────────────────────────────────┘ └───────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Components & Buttons
* **Period Filter:** Dropdown `[ This Month ▾ ]` (`This Month`, `Last 7 Days`, `Today`).
* **Low Stock Alert Bar:** Amber warning bar with `[ Review Stock → ]` secondary action button.
* **4 Metric KPI Cards:** Minimal icons, tabular numbers, subtle green/amber growth pills.
* **Recent Orders Table:** Compact 52px rows with customer name, phone, item preview, and payment badge.
* **PayHere Status Card:** Green connected pulse badge.

---

## 21. Products (`?tab=products`)

### Page Purpose
Complete lifecycle management of retail inventory, categories, brand relations, and catalog promotions.

### Layout & Hierarchy
* **Page Header:** "Product Catalog (326 Items)" + **[ + Add Product ]** (Primary Blue) + **[ ⚡ Launch Campaign Offer ]** (Secondary) + **[ 🔄 Normalize ]** (Ghost).
* **Summary Metric Chips:** Total (326) • In Stock (312) • Low Stock (10) • Out of Stock (4).
* **Filter Toolbar:**
  * Search input (Product title, SKU, barcode).
  * Category dropdown select.
  * Brand dropdown select.
  * Stock status chips: `All`, `In Stock`, `Low Stock (≤5)`, `Out of Stock`.
* **Bulk Action Bar (Contextual Slide-down):** Appears when 1 or more checkboxes are active:
  * Badge: `"4 products selected"`.
  * Dropdown: `[ Change Category ▾ ]` + `[ Apply ]`.
  * Dropdown: `[ Change Brand ▾ ]` + `[ Apply ]`.
  * Button: `[ ⚡ Apply Bulk Discount ]` (opens campaign modal).
  * Button: `[ Deselect All ]`.
* **Data Table (54px Row Height):**
  * Col 1: Checkbox.
  * Col 2: Product Image thumbnail (38px x 38px, radius 6px) + Product Name + SKU code.
  * Col 3: Category badge & Brand badge.
  * Col 4: Price in LKR (tabular format) + Original Price strike-through.
  * Col 5: Current Stock with **Inline Quick Adjust** button.
  * Col 6: Stock Status Pill (`In Stock` green, `Low Stock` amber, `Out of Stock` red).
  * Col 7: Actions: `[ ✏️ Edit ]` (opens drawer) + `[ ⋮ ]` Menu (`Duplicate`, `View on Store`, `Delete`).

---

## 22. Orders (`?tab=orders`) — POS Master/Detail Layout

### Page Purpose
High-speed daily order fulfillment, packing slip generation, courier tracking entry, and customer WhatsApp communication.

### POS Split Layout
```
┌──────────────────────────────────────┬──────────────────────────────────────────┐
│  ORDERS LIST (Col 5 / Left)          │  ORDER DETAILS SLIDE-OVER (Col 7 / Right)│
│  [ Search #ID, customer, phone... ]  │  Order #SM-12584   [ 🖨 Packing Slip ]    │
│  Filters: [ All Status ▾ ] [ COD ▾ ] │  Placed: Today, 2:45 PM                  │
├──────────────────────────────────────┼──────────────────────────────────────────┤
│  ► #SM-12584 • Rs. 359,990           │  CUSTOMER DETAILS                        │
│    Kasun Perera • Colombo 03         │  Name: Kasun Perera                      │
│    2 items • COD Pending             │  Phone: 077 414 1118 [ 💬 WhatsApp Chat ]│
│    14 mins ago                       │  Address: No 42, Galle Road, Colombo 03  │
├──────────────────────────────────────┼──────────────────────────────────────────┤
│    #SM-12583 • Rs. 89,500            │  ORDER ITEMS                             │
│    Nimal Fernando • Kandy            │  1x iPhone 16 Pro Max (256GB Desert)     │
│    1 item • PayHere Paid             │     Rs. 359,990                          │
│    1 hour ago                        ├──────────────────────────────────────────┤
├──────────────────────────────────────┼──────────────────────────────────────────┤
│    #SM-12582 • Rs. 14,200            │  PAYMENT & FULFILLMENT                   │
│    Dilshan Silva • Negombo           │  Status: [ Processing ▾ ]                │
│    Delivered                         │  Payment: Cash on Delivery (Rs. 359,990) │
│                                      │  Courier: [ PromptX ▾ ] Tracking: [   ]  │
│                                      │  Admin Notes: [ Priority packaging    ]  │
│                                      │  [ 🖨 Print Invoice ]  [ Save Updates ]  │
└──────────────────────────────────────┴──────────────────────────────────────────┘
```

### Action Controls
* **[ 💬 WhatsApp Chat ]:** Directly opens WhatsApp Web / App with dynamic pre-filled order status greeting and order breakdown.
* **[ 🖨 Print Packing Slip ]:** Opens clean formatted 80mm / A4 thermal packing voucher.
* **[ 🖨 Print Invoice ]:** Generates formal StreetMobile.lk corporate PDF invoice.
* **Status Dropdown:** Instantly updates Firestore order status and dispatches automated customer email.

---

## 23. Categories (`?tab=categories`)

### Page Purpose
Store catalog taxonomy structuring, home page category carousel configuration, and sorting.

### Layout & Components
* **Page Header:** "Categories (18)" + **[ + Add Category ]** (Primary).
* **Filter:** Search by category name + Status tabs (`All`, `Active`, `Homepage Highlight`).
* **Table List View:**
  * Image thumbnail (rounded 8px).
  * Category Name & Slug identifier.
  * Linked live products count badge.
  * Display order with **[ ▲ ]** and **[ ▼ ]** micro-reorder arrows.
  * Homepage Switch: Instant Apple-style toggle (`Show on Home`).
  * Context Menu `[ ⋮ ]`: `Edit Category`, `Duplicate`, `Delete`.

---

## 24. Today's Deal (`?tab=today-deal`)

### Page Purpose
Centralized visual editor for the homepage Today's Deal promotional card, countdown timer, pricing, and live graphical assets.

### Layout & Live Preview Integration
* **Header:** "Today's Deal Promotion" + **Sticky [ 💾 Save Changes ]** (Emerald Green button pinned top-right).
* **Split Editor Layout:**
  * **Left Column (Configuration Form):**
    * Enable Deal Section Toggle Switch.
    * Catalog Product Selector (auto-fills product title, regular price, image).
    * Deal Price Input + Regular Price Input (auto-displays computed savings pill e.g. `Save Rs. 36,000 (9% OFF)`).
    * Deal End Date & Time Picker (auto-populates countdown timer).
    * Highlights List Builder (`+ Add Highlight`, `Delete Highlight`).
    * Image Uploads with thumbnail preview and `[ 🗑 Remove ]`:
      * Desktop Banner (Landscape 16:9).
      * Mobile Banner (Portrait 1:1 / 4:5).
      * Square Product Asset (1:1).
  * **Right Column (Live Preview Card):**
    * Live rendering of exactly how the card looks on desktop and mobile web.
    * Real-time countdown timer tick simulation.

---

## 25. Payments (`?tab=payments`)

### Page Purpose
Gateway connection verification, delivery fee adjustments, and payment method settings.

### Layout & Clean Card Structure
* **Card 1: PayHere Payment Gateway**
  * Status Badge: `● Connected & Verified` (Green pill).
  * Configuration Details: Merchant ID, Currency (LKR), Production Environment active.
  * Webhook Health: 100% operational.
* **Card 2: Cash on Delivery (COD) Fee Settings**
  * Description: Additional handling fee applied at checkout for COD orders.
  * Numeric Input: `Rs. [ 250 ]`.
  * Button: **[ Save COD Fee ]** (Primary Blue).
  * Inline Confirmation: `✓ COD Fee updated to Rs. 250`.
* **Card 3: WhatsApp Direct Checkout Channel**
  * Target Hotline: `+94 77 414 1118`.
  * Status: Auto-formatted cart payload redirect active.

---

## 26. Customers (`?tab=users`)

### Page Purpose
Customer relationship directory, registered user accounts, guest checkout profiles, and order history.

### Layout & CRM Controls
* **Header:** "Customer Directory (4,892 Accounts)" + **[ 📥 Export CSV ]** + **[ 📥 Download PDF Directory ]**.
* **Filter Bar:** Search by customer name, phone, or email + Tag filter (`All`, `Registered Users`, `Guest Customers`).
* **Table View:**
  * Avatar initial icon with color-coded ring.
  * Customer Name + Registration Date.
  * Email & Phone number (with 1-click WhatsApp dialer).
  * Total Orders Count pill (`e.g. 4 Orders`).
  * Customer Tag: `Registered Account` (Emerald pill) or `Guest Checkout` (Purple pill).
  * Action: **[ View Order History ]** (filters Orders tab) + **[ 🗑 Delete Record ]**.

---

## 27. Inventory (`?tab=inventory`)

### Page Purpose
High-speed warehouse stock auditing, variant SKU counts, and rapid restock adjustment.

### Operational POS Speed Layout
* **Header:** "Warehouse Inventory" + Search by SKU / Name.
* **Filter Tabs:** `All Stock (326)`, `In Stock (312)`, `Low Stock Warning (10)`, `Depleted / Out of Stock (4)`.
* **Table View:**
  * Thumbnail, Product Name, SKU.
  * Variant tags (`128GB`, `256GB`, `Titanium Gray`).
  * Current Units in stock.
  * **Quick Adjust Controls (Inline):**
    * Stepper: `[ − ]  24  [ + ]`
    * Preset Quick Restock Chips: `[ +5 ]` `[ +10 ]` `[ +25 ]` `[ +50 ]`
    * Button: **[ Update Stock ]** (Triggers Quick Add Stock Modal for batch audits).

---

## 28. All Remaining Existing Tabs

Every remaining tab from the original 26 tabs is preserved and redesigned below:

### 28.1. Category Mega Menu (`?tab=mega-menu`)
* **Purpose:** Desktop header mega-menu multi-column navigation, brand spotlights, and quick links.
* **Layout:** Enable Mega Menu toggle + Visual column builder with drag-and-drop hierarchy + Right promotional spotlight card editor.
* **Buttons:** `[ 💾 Save Mega Menu Settings ]`, `[ + Add Column Link ]`, `[ Upload Spotlight Image ]`.
* **States:** Full skeleton loader, empty state when no categories are assigned, mobile responsive collapse.

### 28.2. Shop by Brand (`?tab=brands`)
* **Purpose:** Brand catalog, manufacturer logo directory, and brand popularity flags.
* **Layout:** Grid of compact brand cards (Logo preview, Title, Linked Products count, Featured Brand toggle).
* **Buttons:** `[ + Add Brand ]`, `[ ✏️ Edit Brand ]`, `[ 🗑 Delete Brand ]`.

### 28.3. Featured Collections (`?tab=collections`)
* **Purpose:** Homepage curated product showcases and promotional product grids.
* **Layout:** Collection block cards (Title, subtitle, badge, grid format selector, product multi-selector checkbox list).
* **Buttons:** `[ + Create Collection ]`, `[ 💾 Save Collections ]`, `[ ▲ Up ]`, `[ ▼ Down ]`, `[ 🗑 Remove ]`.

### 28.4. Visual Showcase (`?tab=showcase`)
* **Purpose:** Large 2-column / 3-column graphic banner features on the home page.
* **Layout:** Card feature layout editor (Background upload, headline, subtitle, link destination, text contrast switch).
* **Buttons:** `[ 💾 Save Showcase Settings ]`, `[ Upload Banner Asset ]`.

### 28.5. Mobile Repairs (`?tab=repairs`)
* **Purpose:** Workshop device repair ticketing, diagnostics tracker, and estimate management.
* **Layout:** Status column filter (`Diagnostic`, `In Progress`, `Waiting for Parts`, `Completed`) + Repair ticket table.
* **Buttons:** `[ + Book Repair Job ]` (opens RepairModal), `[ 💬 WhatsApp Customer ]`, `[ ✏️ Edit Job ]`, `[ 🗑 Delete ]`.

### 28.6. Cash Flow (`?tab=cashflow`)
* **Purpose:** Daily retail till accounting, store expense logging, and real-time ledger balance.
* **Layout:** Real-time Firestore sync indicator + 3 KPI Cards (Income, Expenses, Net Balance) + Transaction ledger table.
* **Buttons:** `[ + Add Transaction ]` (opens CashFlowModal), `[ 📥 Export Ledger ]`, `[ ✏️ Edit ]`, `[ 🗑 Delete ]`.

### 28.7. Warranty Management (`?tab=warranties`)
* **Purpose:** Serial number / IMEI warranty lookup, claim status, and warranty certificate printing.
* **Layout:** Serial/IMEI search bar + Warranty directory table with active/expired color indicators.
* **Buttons:** `[ + Register Warranty ]`, `[ 🖨 Print Warranty Certificate ]`, `[ Extend Warranty ]`.

### 28.8. Store Gallery (`?tab=gallery`)
* **Purpose:** Customer unboxing showcase, store interior photos, and community marquee wall.
* **Layout:** Animation speed slider (Slow, Medium, Fast) + Infinite marquee toggle + Photo cards grid.
* **Buttons:** `[ + Upload Photo ]` (opens GalleryModal), `[ 💾 Save Gallery Settings ]`, `[ 🗑 Delete ]`.

### 28.9. Hero Slider (`?tab=hero`)
* **Purpose:** Main homepage hero banner carousel slides, CTAs, and mobile responsive slides.
* **Layout:** Reorderable slide cards (Desktop banner, Mobile banner, headline, CTA button label, link URL, active switch).
* **Buttons:** `[ + Add New Slide ]` (opens HeroModal), `[ Reorder Up/Down ]`, `[ ✏️ Edit ]`, `[ 🗑 Delete ]`.

### 28.10. Offers & Banners (`?tab=banners`)
* **Purpose:** In-page promo strips, category header banners, and middle marketing ads.
* **Layout:** Banners grid with placement tags (`after_categories`, `middle_strip`, `footer_strip`) + status toggle (`Active` / `Paused`).
* **Buttons:** `[ + Create Banner ]` (opens OfferBannerModal), `[ 📋 Duplicate ]`, `[ ✏️ Edit ]`, `[ 🗑 Delete ]`.

### 28.11. Promo Codes & Coupons (`?tab=coupons`)
* **Purpose:** Discount voucher codes, percentage discounts, minimum spends, and usage limits.
* **Layout:** Coupons data table with coupon code badge, discount value, expiration date, and usage progress bar.
* **Buttons:** `[ + Add Coupon ]` (opens CouponModal), `[ Status Toggle ]`, `[ 📋 Duplicate ]`, `[ 🗑 Delete ]`.

### 28.12. Footer Settings (`?tab=footer`)
* **Purpose:** Footer navigation columns, social links, payment icons, and legal registration numbers.
* **Layout:** Structured form cards for Company About, Social Links, Column Links builder, Payment Badge toggles.
* **Buttons:** `[ 💾 Save Footer Settings ]`, `[ + Add Footer Link ]`.

### 28.13. Google Reviews (`?tab=reviews`)
* **Purpose:** Customer testimonials, 5-star Google review integration, and homepage testimonial selection.
* **Layout:** Overall rating card (Average score, total count, Google Map URL) + Testimonials table.
* **Buttons:** `[ + Add Review ]` (opens ReviewModal), `[ 💾 Save Google Settings ]`, `[ Reorder ]`, `[ 👁 Toggle Visibility ]`.

### 28.14. Analytics & Reports (`?tab=analytics`)
* **Purpose:** Monthly revenue visualization, conversion metrics, and payment gateway distribution.
* **Layout:** Revenue line chart + Payment method breakdown distribution bar (PayHere vs COD vs WhatsApp).
* **Buttons:** `[ Export Analytics Report ]`, Period selector (`Month`, `Week`, `Year`).

### 28.15. Streetla AI Assistant (`?tab=assistant`)
* **Purpose:** Store customer AI chatbot configuration, knowledge base, policies, and product recommendations.
* **Layout:** Chatbot enable toggle + System prompt & store knowledge textarea + Interactive test sandbox preview.
* **Buttons:** `[ 💾 Save AI Settings ]`, `[ Test AI Response ]`, `[ Reset Knowledge Base ]`.

### 28.16. Mobile Experience (`?tab=mobile`)
* **Purpose:** Mobile sticky bottom navigation bar, quick WhatsApp floating bubbles, and mobile drawer controls.
* **Layout:** Sticky bottom bar toggle + Icon configuration selector + Quick contact position picker.
* **Buttons:** `[ 💾 Save Mobile Settings ]`.

### 28.17. Store & Auth Settings (`?tab=settings`)
* **Purpose:** Store maintenance mode toggle, admin password updates, and global SEO metadata.
* **Layout:** Password update form + Maintenance Mode switch + OpenGraph image & meta description editor.
* **Buttons:** `[ Update Password ]`, `[ 💾 Save Store Settings ]`.

### 28.18. Contact & Store Times (`?tab=contact-settings`)
* **Purpose:** Physical store address, customer hotlines, support email, and 7-day operating hours.
* **Layout:** Contact numbers form + Google Maps embed URL + 7-day Monday to Sunday operating time pickers.
* **Buttons:** `[ 💾 Save Contact Settings ]`.

---

## 29. Dark Mode

* **Background:** Deep Midnight `#090D14`.
* **Surface Cards:** Dark Slate `#0F172A` with subtle outline `rgba(255, 255, 255, 0.08)`.
* **Text:** Headings `#F8FAFC`, secondary labels `#94A3B8`, muted `#64748B`.
* **Contrast:** Full WCAG AAA compliance on all text and badge elements.

---

## 30. Light Mode

* **Background:** Crisp Off-White `#F8FAFC`.
* **Surface Cards:** Pure White `#FFFFFF` with slate border `#E2E8F0`.
* **Text:** Headings `#0F172A`, secondary labels `#475569`, muted `#64748B`.
* **Inputs & Tables:** Subtly shaded headers `#F1F5F9` ensuring perfect visual separation without harsh dark lines.

---

## 31. Responsive Design

* **Desktop (≥ 1024px):** Fixed 248px sidebar, master-detail order view, multi-column tables.
* **Tablet (768px – 1023px):** Compact 68px icon sidebar with hover tooltips; drawers slide over with full height.
* **Mobile (< 768px):** Off-canvas slide-out navigation; top header provides search modal; tables convert to high-density operational cards; order inspection opens full-screen slide-over drawer.

---

## 32. Loading States

Replaces all generic spinners with **structural skeleton loaders**:
* **Table Skeleton:** 5 rows with animated pulsing gray rectangular bars for title, category, and price.
* **Card Skeleton:** Rectangular thumbnail skeleton + 2 text line skeletons.
* **Chart Skeleton:** Subtle shimmering area outline.

---

## 33. Empty States

Whenever a search or filter yields zero results:
* Centered container with clean 48px muted outline icon.
* Title: e.g., `"No orders found"`.
* Description: `"There are no orders matching your current filters."`.
* Button: **[ Clear Filters ]** or **[ + Create New ]**.

---

## 34. Error States

* Friendly, human-readable alert boxes avoiding raw Firebase error stacks.
* Header: `"Unable to save changes"`.
* Message: `"Please verify your internet connection and try again."`.
* Button: **[ 🔄 Try Again ]**.

---

## 35. Accessibility

* All icon-only buttons include `aria-label` attributes.
* Keyboard navigation: Full `Tab` order and visible 2px focus ring (`focus-visible:ring-2 focus-visible:ring-[--primary]`).
* Color contrast: Strict 4.5:1 ratio for standard text and 3:1 for large metrics against backgrounds.

---

## 36. Admin Workflow (Day-in-the-Life Walkthrough)

1. **Morning Order Check:** Admin opens Dashboard, hears chime, clicks order notification toast. Master-detail view immediately reveals customer address.
2. **1-Click Customer WhatsApp:** Admin clicks `[ 💬 WhatsApp Chat ]` — pre-filled status text opens in WhatsApp Web for instant delivery confirmation.
3. **Packaging Voucher:** Admin clicks `[ 🖨 Print Packing Slip ]` — clean thermal slip prints without page navigation.
4. **Quick Inventory Audit:** Admin switches to Inventory tab, searches `"iPhone 16"`, clicks `[ +10 ]` chip, and clicks `[ Update Stock ]` in under 5 seconds.
5. **Flash Deal Activation:** Admin opens Today's Deal, toggles deal on, picks a product, reviews the live preview, and hits `[ Save Changes ]`.

---

## 37. Existing Function → New UI Mapping

| Existing Action / Function | Original UI Location | Redesigned V2 UI Location | New Interaction Pattern |
| :--- | :--- | :--- | :--- |
| Global Add Product | Top Bar Button | Top Header Right & Products Page Header | Opens multi-step slide-over Product Drawer |
| Live Low Stock Warning | Flashing Amber Bar | Dismissible Top Notification Banner | Amber alert with `[ Review Stock → ]` link |
| Quick Stock Adjustment | QuickStockModal | Inline Table Stepper `[- 24 +]` & Preset Chips | Inline direct adjust or modal for bulk edits |
| Order Status Change | Orders Table Dropdown | Right Order Detail Panel Status Select | Immediate select update + auto customer email |
| WhatsApp Customer Chat | Orders Table Button | Right Order Detail Header Button | Pre-fills order confirmation in WhatsApp |
| Print Packing Slip | Orders Detail Button | Right Order Detail Action Bar | Direct formatted print dialog |
| Print Formal Invoice | Orders Detail Button | Right Order Detail Action Bar | Clean corporate jsPDF invoice dialog |
| Customer PDF Directory | Users Tab Button | Customers Page Header Action | Secondary button generating `jsPDF` table |
| Customer CSV Export | Users Tab Button | Customers Page Header Action | Secondary button generating formatted CSV |
| COD Fee Adjustment | Payments Tab Card | Payments Gateway Card Number Input | Numeric field + **[ Save COD Fee ]** button |
| Today's Deal Banners | TodayDealTab Uploaders | Today's Deal Image Cards + Live Preview | Upload button + instant thumbnail + `[ 🗑 Remove ]` |
| Category Reordering | Categories Tab Up/Down | Categories Table Reorder Arrows `[ ▲ / ▼ ]`| Smooth row reorder with Firestore sort update |
| Bulk Discount Campaign | BulkOfferModal | Products Bulk Action Bar (on selection) | Multi-select bar `[ ⚡ Apply Bulk Discount ]` |
| Cash Flow Add Transaction| CashFlowTab Button | Cash Flow Page Header Button | Primary action opening clean CashFlowModal |
| Repair Ticket Booking | RepairsTab Button | Mobile Repairs Page Header Button | Primary action opening clean RepairModal |
| Coupon Add / Duplicate | CouponsTab Buttons | Promo Codes Table Context Menu `[ ⋮ ]` | Table action with duplicate & status toggle |
| Sign Out | Sidebar Bottom Button | Pinned Sidebar Bottom Utility | Clean red-accented button clearing auth token |

---

## 38. Final Component Hierarchy

```
<AdminDashboardLayout>
  ├── <AdminSidebar>
  │     ├── <SidebarBrandLogo />
  │     ├── <SidebarNavGroups>
  │     │     ├── Group: OVERVIEW (Dashboard)
  │     │     ├── Group: CATALOG (Products, Categories, Mega Menu, Brands, Collections, Showcase)
  │     │     ├── Group: SALES (Orders, Today's Deal, Coupons, Payments, Analytics)
  │     │     ├── Group: OPERATIONS (Inventory, Repairs, Cash Flow, Warranties, Customers)
  │     │     ├── Group: MARKETING (Gallery, Hero, Banners, Reviews, Footer)
  │     │     └── Group: SYSTEM (AI Assistant, Mobile, Settings, Contact)
  │     ├── <SidebarSupportCard />
  │     └── <SidebarSignOutButton />
  │
  ├── <AdminTopHeader>
  │     ├── <MobileMenuTrigger />
  │     ├── <BreadcrumbNav />
  │     ├── <OmnibarSearchInput [⌘K] />
  │     ├── <ThemeToggle [Light/Dark] />
  │     ├── <WhatsAppSupportBadge />
  │     ├── <LiveNotificationBell />
  │     └── <AdminProfileMenu />
  │
  ├── <MainContentArea>
  │     ├── <PageHeader title="" subtitle="">
  │     │     ├── <PageHeaderSecondaryActions />
  │     │     └── <PageHeaderPrimaryAction />
  │     │
  │     ├── <DynamicTabContent activeTab={tab}>
  │     │     ├── <OverviewTab />
  │     │     ├── <ProductsTab />
  │     │     ├── <OrdersTab (POS Master-Detail) />
  │     │     ├── <CategoriesTab />
  │     │     ├── <TodayDealTab (Live Preview) />
  │     │     ├── <InventoryTab (POS Speed) />
  │     │     └── <RemainingTabs ... />
  │     │
  │     ├── <GlobalSlideOverDrawer>
  │     │     ├── <ProductFormDrawer />
  │     │     └── <OrderDetailDrawer />
  │     │
  │     ├── <GlobalModals>
  │     │     ├── <CategoryModal />
  │     │     ├── <OfferBannerModal />
  │     │     ├── <HeroModal />
  │     │     ├── <CouponModal />
  │     │     ├── <RepairModal />
  │     │     ├── <CashFlowModal />
  │     │     └── <QuickStockModal />
  │     │
  │     └── <LiveOrderToastAlert />
  │
</AdminDashboardLayout>
```

---

*This specification serves as the complete, authoritative blueprint for the StreetMobile.lk Admin Panel V2. All 26 existing tabs, database hooks, API contracts, and user interactions are 100% preserved.*
