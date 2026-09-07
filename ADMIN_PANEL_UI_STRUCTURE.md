# 📱 StreetMobile.lk — Admin Panel UI Structure & Buttons Guide

This document provides a complete, UI-only breakdown of the **StreetMobile.lk Admin Panel**. It covers the layout architecture, color schemes, sidebar navigation, top header, all 26 dashboard tabs, data tables, cards, badges, and all interactive action buttons and modals.

---

## 🎨 1. Global UI Theme & Design System

The Admin Panel is designed with a **Cyberpunk / Dark Slate Luxury Theme** (`#090D14` background and `#0F172A` cards) optimized for desktop and mobile devices.

### Color Hierarchy
| Color Role | Tailwind Classes | Hex / Look | Used For |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `bg-[#090D14]` | `#090D14` Deep Charcoal Black | Whole admin workspace page canvas |
| **Surface / Card Background** | `bg-[#0F172A]` | `#0F172A` Midnight Slate | Dashboard cards, data tables, modals, sidebars |
| **Border Outline** | `border border-white/10` | Subtle 10% white border | Card separation, inputs, headers, dividers |
| **Primary Accent (Blue)** | `bg-blue-600 hover:bg-blue-700` | `#2563EB` Electric Blue | Main action buttons (`Add Product`, `Save`, `Edit`) |
| **Success Accent (Green)** | `bg-emerald-600`, `text-emerald-400` | Emerald Green | Completed status, Paid, In-Stock, Excel/PDF export |
| **Warning Accent (Amber)** | `bg-amber-500`, `text-amber-400` | Warm Amber | Low stock alerts, Pending COD orders, Processing |
| **Danger / Delete (Red)** | `bg-red-600`, `text-red-400` | Coral Red | Delete buttons, Out of stock, Cancelled status |
| **Text Primary** | `text-white font-extrabold` | Pure White | Headings, titles, primary metrics |
| **Text Muted / Subtitle** | `text-white/60`, `text-white/40` | Muted Gray-White | Secondary captions, timestamps, table header |

---

## 🖥️ 2. Global Layout Shell (Header, Sidebar & Toasts)

The admin shell consists of 3 structural elements:

```
┌────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (270px)    │  TOP HEADER BAR (h-16)                           │
│  - Logo & Brand     │  - Hamburger (Mobile)                            │
│  - WhatsApp Support │  - Title: "StreetMobile Admin"                   │
│  - 26 Scroll Tabs   │  - Global Search Input [ ⌘ K ]                   │
│  - Sign Out Button  │  - Primary Button: [+ Add Product]               │
├─────────────────────┼──────────────────────────────────────────────────┤
│                     │  DYNAMIC TAB CONTENT CANVAS (bg-[#090D14])       │
│                     │  (Renders the selected Tab component)            │
│                     │                                                  │
│                     │                      ┌────────────────────────┐  │
│                     │                      │ FLOATING ORDER TOAST   │  │
│                     │                      │ [View Order] [Dismiss] │  │
│                     │                      └────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### A. Left Navigation Sidebar (`w-[270px] bg-[#0F172A]`)
* **Brand Header**:
  * Blue rounded square box with `Smartphone` icon.
  * Title: **StreetMobile.lk** (with blue `.lk`).
  * Subtitle: `ADMIN PANEL` (small uppercase tracking).
  * Mobile Close button (`X` icon on screens `< 1024px`).
* **Support Card**:
  * "Need Help? WhatsApp Support" card.
  * **[ Contact ] Button**: `px-2.5 py-1 bg-white/10 hover:bg-blue-600` (Directly opens WhatsApp chat with `+94 77 414 1118`).
* **Navigation Links (26 Items)**:
  * Inactive Item: `text-slate-300 hover:text-white hover:bg-white/10` with icon.
  * Active Item: `bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 ring-1 ring-blue-400/30` with white icon.
* **Bottom Sign Out**:
  * Pinned at the bottom with a divider.
  * **[ Sign Out ] Button**: `w-full border border-red-500/20 text-red-400 hover:bg-red-500/10` with `LogOut` icon. Clears session and redirects to `/admin/login`.

### B. Top Header Bar (`h-16 bg-[#0F172A] border-b border-white/10`)
* **Mobile Menu Trigger**: `Menu` hamburger icon for opening drawer on mobile.
* **Admin Title**: `StreetMobile Admin` (bold white).
* **Global Search Box**:
  * `Search` icon on left.
  * Input placeholder: *"Search anything..."*.
  * Keyboard shortcut indicator: `⌘ K` pill.
* **Action Buttons**:
  * **[ + Add Product ] Button**: `bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow-md`. Opens global `ProductModal`.

### C. Real-Time Floating Order Alert Toast
* Appears at bottom-right (`fixed bottom-6 right-6 z-50 bg-[#1E293B]`) whenever a new order enters Firestore.
* Bouncing blue shopping bag icon + chime sound.
* Displays Customer name & Order total LKR.
* **[ View Order ] Button**: Blue button navigating to `?tab=orders`.
* **[ Dismiss ] Button**: White/10 subtle button to hide. Auto-dismisses in 5s.

---

## 📑 3. Complete Breakdown of All 26 Admin Tabs

---

### Tab 1: Overview Dashboard (`?tab=overview`)
* **Header**: "Overview Dashboard" — "Here's what's happening with your store today."
* **Live Low Stock Alert Banner (Dynamic)**:
  * Flashing amber banner: *"⚠️ Live Stock Alert: X Products Low or Out of Stock!"*.
  * **[ Update Stock Now ] Button**: `bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-4 py-2 rounded-xl`. Navigates to Inventory tab.
* **4 KPI Metric Cards**:
  1. **Total Revenue**: LKR formatted, Green trend badge (`↑ 18.6%`), `$` icon.
  2. **Orders**: Total order count, Blue trend badge (`↑ 12.4%`), `ShoppingBag` icon.
  3. **Products**: Total product count, Purple trend badge (`↑ 7.3%`), `Package` icon.
  4. **Customers**: Total customer count, Orange trend badge (`↑ 15.8%`), `Users` icon.
* **Charts Section**:
  * **Revenue Overview (8-col Card)**: Monthly sales SVG area line graph with blue gradient fill and data points. Period dropdown selector (`This Month` / `Last 7 Days` / `Today`).
  * **Order Status (4-col Card)**: Multi-colored SVG Donut Chart with breakdown percentages (Delivered: Green, Processing: Blue, COD Pending: Amber, Cancelled: Purple).
* **Bottom Section**:
  * **Recent Orders Table (8-col Card)**: Columns: Order ID (`#SM...`), Customer name & phone, Product thumbnail + name, Payment method, Status badge, Total price.
  * **[ View All Orders ] Button**: Blue outline button routing to Orders tab.
  * **Low Stock Quick View (4-col Card)**: Product thumbnail, title, variant, and red badge (`Stock 3`).
  * **PayHere Status Card**: Green badge (`Connected`) + checkmark.

---

### Tab 2: Products (`?tab=products`)
* **Header**:
  * Title: "Products Catalog" + total count.
  * **[ + Add Product ] Primary Button**: Blue button opening `ProductModal`.
  * **[ ⚡ Launch Campaign Offer ] Button**: Violet gradient button opening `BulkOfferModal` for category/brand-wide discounts.
  * **[ 🔄 Normalize Catalog ] Button**: Normalizes brand & category naming in Firestore.
* **Filter Bar**:
  * Search input by product name, SKU, or brand.
  * Category dropdown filter (e.g. Smartphones, Audio, Accessories).
  * Brand dropdown filter (Apple, Samsung, Xiaomi, Google, etc.).
  * Showcase status dropdown filter (All, Featured, New Arrival, Best Seller).
  * Stock status chips: `All`, `In Stock`, `Low Stock (<=5)`, `Out of Stock`.
* **Bulk Action Toolbar (Appears when products are checked)**:
  * Count badge: *"X products selected"*.
  * Category re-assignment dropdown + **[ Apply Category ] Button**.
  * Brand re-assignment dropdown + **[ Apply Brand ] Button**.
  * **[ Apply Bulk Offer ] Button**: Launches discount modal for selected items.
  * **[ Deselect All ] Button**.
* **Accordion Hierarchical View**:
  * Level 1: Categories (e.g., "Smartphones (24 items)") with expand/collapse chevron.
  * Level 2: Brands under that category (e.g., "Apple (10 items)").
  * Level 3: Products Data Table:
    * Checkbox for selection.
    * Thumbnail image + Product Title + SKU.
    * Price & Original Price with discount percentage pill.
    * Category & Brand tags.
    * Stock Count Pill with **Inline Quick Edit**: Clicking the stock count turns it into an inline number input + **[ Save ] Button**.
    * Status Tag (`In Stock` in green, `Low Stock` in amber, `Out of Stock` in red).
    * Action Buttons:
      * **[ ✏️ Edit ] Button**: Blue/white icon button opening `ProductModal`.
      * **[ 🗑️ Delete ] Button**: Red icon button with confirmation prompt.

---

### Tab 3: Orders (`?tab=orders`)
* **Header**:
  * Title: "Orders Management" + order count.
  * Filter Summary chips: Status, Payment method, Date.
  * Action Buttons:
    * **[ 🔄 Refresh Data ] Button**: Syncs latest orders from Firestore.
    * **[ 📥 Export CSV ] Button**: Downloads full CSV table.
    * **[ 🖨️ Bulk Print Invoices ] Button**: Multi-page PDF generator for selected orders.
* **Search & Filter Bar**:
  * Search input (Order ID, Customer name, Phone, Address).
  * Date Filter Dropdown: `All Time`, `Today`, `This Week`, `This Month`.
  * Payment Method Dropdown: `All`, `Cash on Delivery (COD)`, `PayHere Online`, `Bank Transfer`.
  * Payment Status Filter: `All`, `Paid`, `Pending`, `Failed`, `Refunded`.
  * Order Status Filter: `All`, `Pending`, `Processing`, `Packed`, `Shipped`, `Delivered`, `Cancelled`.
* **Split Layout (Master-Detail View)**:
  * **Left Panel: Orders Table (Table view)**:
    * Checkbox for bulk actions.
    * Order ID (`#SM-XXXXX`) + Date/time.
    * Customer Name, Phone number, Delivery City.
    * Items summary with small preview thumbnails.
    * Payment Method badge (COD in amber, PayHere in green).
    * Order Status Badge with color-coded pills.
    * Total Price in bold LKR.
    * Action: Clicking any row opens its full details in the Right Panel.
  * **Right Panel: Order Detail Slide-Over / Card**:
    * Order Header: ID, Date, Print invoice icon button.
    * Customer Info Card: Full name, phone, email, full delivery address with district.
    * WhatsApp Direct Chat Button: **[ 💬 Chat on WhatsApp ]** (Pre-fills order status update message to customer's phone).
    * Items Purchased List: Thumbnail, product title, storage/color variants, quantity, unit price, item subtotal.
    * Pricing Breakdown: Subtotal, Delivery Fee, COD Fee, Promo Discount, Final Total.
    * Status Change Dropdown: Quick change to `Processing`, `Packed`, `Shipped`, `Delivered`, `Cancelled` (Automatically triggers customer email notification!).
    * Courier Tracking Number Input + **[ Save Tracking ] Button**.
    * Internal Admin Notes Textarea + **[ Save Note ] Button**.
    * **[ 🖨️ Print Packing Slip ] Button**.
    * **[ 🖨️ Print Formal Invoice ] Button**.
    * **[ 🗑️ Delete Order ] Button**: Red button with confirmation.

---

### Tab 4: Shop by Category (`?tab=categories`)
* **Header**:
  * Title: "Category Management" + count.
  * **[ + Add Category ] Primary Button**: Opens `CategoryModal`.
  * Status Filter Tabs: `All Categories`, `Active`, `Hidden`, `Shown on Homepage`.
  * Search Bar: Filters categories by name or slug.
* **Category Cards Grid**:
  * Category Icon / Thumbnail image.
  * Name & Slug badge.
  * Linked Products Count pill (`e.g., 28 Products linked`).
  * Sort Order display with **[ ▲ Up ]** and **[ ▼ Down ]** reorder buttons.
  * Homepage Visibility Switch: **[ 👁️ Show / Hide on Home ]** toggle.
  * Action Buttons on each card:
    * **[ 📋 Duplicate ] Button**: Duplicates category data.
    * **[ ✏️ Edit ] Button**: Opens `CategoryModal`.
    * **[ 🗑️ Delete ] Button**: Safe-delete with modal warning if products are linked.

---

### Tab 5: Category Mega Menu (`?tab=mega-menu`)
* **Header**:
  * Title: "Category Mega Menu Management".
  * Subtitle: "Configure header navigation hover drawer, multi-column categories, featured product spotlights, and quick links."
  * **[ 💾 Save Mega Menu Settings ] Button**: Green button persisting settings to Firestore.
* **UI Controls**:
  * **Enable Mega Menu Toggle Switch**: On/Off switch for desktop header mega menu.
  * **Menu Columns Layout Builder**:
    * Re-orderable category links list with drag/order controls.
    * Add/Remove categories from the dropdown menu.
    * Sub-category tagging (e.g. Smartwatches, Audio, Adapters).
  * **Right Spotlight Banner Card**:
    * Upload promotional image for the right side of the mega menu.
    * Title, subtitle, and target destination URL input.
    * Live preview of the mega menu drawer.

---

### Tab 6: Shop by Brand (`?tab=brands`)
* **Header**:
  * Title: "Brands Management" + count.
  * **[ + Add New Brand ] Button**: Adds new manufacturer/brand.
  * Search bar for filtering brands.
* **Brand Cards Grid**:
  * Brand Logo Preview (SVG or PNG).
  * Brand Name (e.g. Apple, Samsung, Xiaomi, Anker, JBL, Sony).
  * Slug identifier.
  * Products Count badge (dynamically counted from catalog).
  * Popular / Featured Brand Toggle Switch.
  * Action Buttons:
    * **[ ✏️ Edit Brand ] Button**.
    * **[ 🗑️ Delete Brand ] Button**.

---

### Tab 7: Featured Collections (`?tab=collections`)
* **Header**:
  * Title: "Featured Collections & Curated Grids".
  * **[ + Create New Collection ] Button**.
  * **[ 💾 Save Collections ] Button**: Primary blue button.
* **Collection Blocks**:
  * Title input (e.g. "Flagship Smartphones", "Best Wireless Earbuds").
  * Subtitle input.
  * Badge Text input (e.g. "TRENDING", "20% OFF").
  * Multi-product Picker: Checkbox list of products to include in this collection.
  * Grid Display Style Selector: 4-column grid, 6-column carousel, or banner-split.
  * Active / Inactive switch.
  * Action Buttons: **[ Reorder Up/Down ]**, **[ 🗑️ Remove Collection ]**.

---

### Tab 8: Visual Showcase (`?tab=showcase`)
* **Header**:
  * Title: "Visual Product Showcase Banners".
  * Subtitle: "Manage large 3-column / 2-column image banner feature cards on the homepage."
  * **[ 💾 Save Showcase Settings ] Button**: Emerald green button.
* **Showcase Cards Builder**:
  * Card 1 (Large Main Feature) & Card 2 / 3 (Stacked Mini Features).
  * Background Image Upload / URL input with live preview.
  * Badge text (e.g. "NEW ARRIVAL", "SALE").
  * Headline & Subheadline text inputs.
  * Button Label input (e.g. "Shop Now", "Explore Apple").
  * Link URL input (e.g. `/products?category=smartphones`).
  * Text Color picker / theme selector (Light text vs Dark text).
  * Active Toggle switch.

---

### Tab 9: Today's Deal (`?tab=today-deal`)
* **Header**:
  * Title: "Today’s Deal Banner & Promotional Flash Sale".
  * Subtitle: "Configure the homepage flash deal card, countdown timer, pricing, and banners."
  * **[ 💾 Save Changes ] Button**: Emerald green sticky button (`Save Today's Deal Settings`).
* **Section 1: General Activation & Product Selection**:
  * **Enable Today's Deal Section**: Large toggle switch.
  * Product Selector: Dropdown searching store catalog. Automatically fills product title, regular price, and thumbnail.
* **Section 2: Deal Pricing & Discount**:
  * Original Price input (e.g. `Rs. 385,000`).
  * Deal Sale Price input (e.g. `Rs. 349,000`).
  * Computed Discount Pill: Displays auto-calculated savings (e.g. `Save Rs. 36,000 (9% OFF)`).
  * Stock / Availability limit progress bar (Units Sold vs Total Units).
* **Section 3: Countdown Timer**:
  * Deal End Date & Time picker.
  * "Timer Status": Active countdown preview (Days : Hours : Minutes : Seconds).
* **Section 4: Promotional Banners & Live Previews**:
  * **Desktop Banner (16:9 / Landscape)**: File upload button (`Upload Desktop Banner`) + URL input + live thumbnail preview + **[ 🗑️ Remove ] Button**.
  * **Mobile Banner (Square / Portrait)**: File upload button (`Upload Mobile Banner`) + URL input + live thumbnail preview + **[ 🗑️ Remove ] Button**.
  * **Square Product Image (1:1)**: File upload button (`Upload Square Image`) + URL input + live thumbnail preview + **[ 🗑️ Remove ] Button**.
* **Section 5: Key Highlights & Features**:
  * Dynamic bullet point list for deal highlights (e.g. "1 Year Apple Care Warranty", "Free MagSafe Case", "Islandwide Express Delivery").
  * **[ + Add Highlight ] Button** & **[ 🗑️ Delete Highlight ] Button**.

---

### Tab 10: Mobile Repairs (`?tab=repairs`)
* **Header**:
  * Title: "Mobile Device Repair Tracker".
  * **[ + Book Repair Job ] Primary Button**: Opens `RepairModal`.
  * Search Bar: Customer name, phone, IMEI, device model.
  * Status Filter: `All`, `Pending Diagnostic`, `In Progress`, `Waiting for Parts`, `Completed`, `Delivered`.
* **Repair Jobs Table**:
  * Ticket ID (e.g. `#REP-1042`).
  * Customer Name & Phone number.
  * Device Model (e.g. "iPhone 15 Pro Max", "Samsung S23 Ultra").
  * Reported Issue (e.g. "Broken OLED Screen + Battery replacement").
  * Estimated Cost & Advance Paid in LKR.
  * Status Badge (Color-coded pills).
  * Action Buttons:
    * **[ 💬 WhatsApp Customer ] Button**: Opens WhatsApp with repair status update.
    * **[ ✏️ Edit Job ] Button**: Opens `RepairModal`.
    * **[ 🗑️ Delete Job ] Button**.

---

### Tab 11: Cash Flow (`?tab=cashflow`)
* **Header**:
  * Title: "Cash Flow & Daily Accounts Tracker".
  * Real-Time Firestore Synchronization badge.
  * **[ + Add Transaction ] Primary Button**: Opens `CashFlowModal`.
* **Top Summary KPI Cards**:
  1. **Total Inflow (Revenue / Income)**: Green card with `TrendingUp` icon.
  2. **Total Outflow (Expenses / Supplier Payments)**: Red card with `TrendingDown` icon.
  3. **Net Cash Balance**: Slate blue card with `Activity` icon.
* **Filters Bar**:
  * Search input by description, invoice number, or recipient.
  * Type Filter: `All`, `Income`, `Expense`.
  * Category Filter: `Sales`, `Inventory Purchase`, `Rent & Utilities`, `Salaries`, `Marketing`, `Repairs`.
  * Date Range Filter: `All`, `Today`, `This Month`, `Custom`.
* **Transactions Table**:
  * Date & Time.
  * Transaction Title & Category pill.
  * Income / Expense Indicator (`+ Rs.` in green or `- Rs.` in red).
  * Payment Mode (Cash, Bank Transfer, Cheque).
  * Action Buttons: **[ ✏️ Edit ]**, **[ 🗑️ Delete ]**.

---

### Tab 12: Warranty Management (`?tab=warranties`)
* **Header**:
  * Title: "Product Warranty Claims & Serial Tracker".
  * **[ + Register Warranty ] Button**.
  * Search by Serial Number / IMEI / Customer Phone.
* **Warranty Claims & Directory Table**:
  * Serial Number / IMEI code.
  * Product Name.
  * Customer Name & Contact.
  * Purchase Date & Expiration Date.
  * Warranty Status Badge: `Active (Green)`, `Expiring Soon (Amber)`, `Expired (Red)`.
  * Action Buttons:
    * **[ Check Status ] Button**.
    * **[ 🖨️ Print Warranty Card ] Button**.
    * **[ ✏️ Edit / Extend ] Button**.

---

### Tab 13: Customers (`?tab=users`)
* **Header**:
  * Title: "Customers Management" + customer count.
  * Subtitle: "Registered customer accounts and saved profile data."
  * **[ 📥 Download PDF ] Button**: Blue button generating formal `jsPDF` customer directory.
  * **[ 📥 Export Excel / CSV ] Button**: Green button downloading UTF-8 CSV table.
* **Customer Directory Table**:
  * Customer Avatar with initial letter.
  * Customer Name (Guest or Registered).
  * Contact Email address.
  * Phone Number (clickable tel/WhatsApp link).
  * Total Orders Count pill (`e.g. 3 Orders`).
  * Customer Tag: `Registered User` (Emerald pill) or `Guest Customer` (Purple pill).
  * Action Buttons:
    * **[ View Orders ] Button**: Blue text button jumping to filtered orders.
    * **[ 🗑️ Delete ] Button**: Red button deleting profile record from Firestore.

---

### Tab 14: Store Gallery (`?tab=gallery`)
* **Header**:
  * Title: "Store Gallery & Customer Showcase".
  * **[ + Upload Photo ] Button**: Opens `GalleryModal`.
  * Subtitle: "Manage store interior, unboxing, and customer photo wall."
* **Animation & Display Settings Card**:
  * Continuous Marquee / Auto-scroll Speed slider (Slow, Medium, Fast).
  * Infinite Loop Toggle.
  * Pause on Hover Toggle.
  * **[ 💾 Save Gallery Settings ] Button**.
* **Gallery Photo Grid**:
  * Square preview image thumbnail.
  * Title & Category tag.
  * Sort order index.
  * Action Buttons:
    * **[ ✏️ Edit ] Button**.
    * **[ 🗑️ Delete ] Button**.

---

### Tab 15: Hero Slider (`?tab=hero`)
* **Header**:
  * Title: "Homepage Hero Slider".
  * Subtitle: "Manage top banner carousels, slide headlines, buttons, and mobile graphics."
  * **[ + Add New Slide ] Button**: Blue button opening `HeroModal`.
* **Hero Slides List (Reorderable Cards)**:
  * Slide Thumbnail (Desktop & Mobile view preview).
  * Headline & Subtitle text.
  * CTA Button text & Target Link URL.
  * Slide Active / Inactive Switch.
  * Action Buttons:
    * **[ ✏️ Edit Slide ] Button**: Opens `HeroModal`.
    * **[ 🗑️ Delete Slide ] Button**: Red button with confirmation.
    * **[ ▲ Up ] / [ ▼ Down ] Reorder Buttons**.

---

### Tab 16: Offers & Banners (`?tab=banners`)
* **Header**:
  * Title: "Promotional Offers & Banners".
  * Subtitle: "Manage middle-page promo strips, category banners, and discount calls-to-action."
  * **[ + Create Banner ] Button**: Opens `OfferBannerModal`.
* **Banners Grid**:
  * Desktop Banner preview thumbnail + Mobile Banner preview thumbnail.
  * Internal Name & Headline.
  * Placement Indicator: `homepage_after_categories`, `middle_strip`, `footer_banner`.
  * Status Toggle Button: `Active (Green)` vs `Paused (Amber)`.
  * Action Buttons:
    * **[ 📋 Duplicate ] Button**: Clones banner settings.
    * **[ ✏️ Edit ] Button**: Opens `OfferBannerModal`.
    * **[ 🗑️ Delete ] Button**: Red delete button.

---

### Tab 17: Promo Codes & Coupons (`?tab=coupons`)
* **Header**:
  * Title: "Promo Codes & Discount Coupons".
  * **[ + Add Coupon ] Button**: Opens `CouponModal`.
  * Search coupons by code or campaign name.
* **Coupons Table**:
  * Coupon Code pill in bold font (e.g. `WELCOME10`, `STREET5000`).
  * Campaign Title.
  * Discount Value: Percentage (`% OFF`) or Flat LKR (`Rs. OFF`).
  * Minimum Order Value in LKR.
  * Expiry Date & Usage Count (`e.g. 42 / 100 used`).
  * Status Switch: `Active` / `Disabled`.
  * Action Buttons:
    * **[ 📋 Duplicate ] Button**.
    * **[ ✏️ Edit ] Button**.
    * **[ 🗑️ Delete ] Button**.

---

### Tab 18: Footer Settings (`?tab=footer`)
* **Header**:
  * Title: "Footer & Legal Configuration".
  * **[ 💾 Save Footer Settings ] Button**: Emerald green button.
* **Settings Sections**:
  * **Company Bio & About Summary**: Rich text area.
  * **Social Media Links**: Facebook, Instagram, TikTok, YouTube, WhatsApp links.
  * **Quick Link Columns**: Add / Edit / Remove custom links in Footer columns.
  * **Payment Methods Icons**: Toggle display of Visa, MasterCard, PayHere, Koko, Mintpay badges.
  * **Copyright & Registration Details**: Company registration number & copyright notice text.

---

### Tab 19: Inventory Management (`?tab=inventory`)
* **Header**:
  * Title: "Inventory & Stock Levels".
  * Subtitle: "Track stock quantities, variant stocks, and restock alerts."
* **Search & Stock Filter**:
  * Search input: Filter by product name or SKU.
  * Stock Filter Tabs: `All Items`, `In Stock (>5)`, `Low Stock (<=5)`, `Out of Stock (0)`.
* **Inventory Table**:
  * Product Thumbnail + Name.
  * Category name.
  * Variants listed (e.g. `128GB, 256GB, 512GB`).
  * Stock Quantity Number badge.
  * Stock Status Pill: `In Stock` (Green) or `Low Stock` (Red).
  * Action Button:
    * **[ Update Stock ] Button**: Blue button opening the `QuickAddStockModal`.

---

### Tab 20: Payments & Gateways (`?tab=payments`)
* **Header**:
  * Title: "Payments & Gateway Settings".
  * Subtitle: "Manage Cash on Delivery (COD) fee, PayHere online payments, and WhatsApp checkout settings."
* **3 Configuration Cards Grid**:
  1. **PayHere Online Gateway Card**:
     * Status: `Connected & Verified` (Green checkmark).
     * Subtitle: Merchant ID configured • LKR Sandbox & Production active.
  2. **Cash on Delivery (COD) Fee Configuration Card**:
     * Numeric input: `Rs. [ 250 ]`.
     * **[ Save COD Fee ] Button**: `bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-xl`.
     * Green success message on save: *"✓ COD Fee updated to Rs. X!"*.
  3. **WhatsApp Direct Order Card**:
     * Displays target order hotline: `+94 77 414 1118`.
     * Subtitle: Auto-formatted message redirect active.

---

### Tab 21: Google Reviews (`?tab=reviews`)
* **Header**:
  * Title: "Google Reviews & Testimonials".
  * Subtitle: "Curate verified customer reviews shown on the homepage."
  * **[ + Add Review ] Button**: Opens `ReviewModal`.
* **Google Overall Rating Settings Card**:
  * Average rating input (e.g. `4.9`), Total review count input (e.g. `520+ Reviews`).
  * Google Maps link input.
  * **[ 💾 Save Google Settings ] Button**.
* **Reviews Table & Cards**:
  * Reviewer Avatar + Customer Name.
  * Star rating (1 to 5 yellow stars).
  * Review snippet text.
  * Verified Buyer Pill.
  * Featured on Homepage switch.
  * Visibility Toggle switch (`Visible` / `Hidden`).
  * Action Buttons:
    * **[ ▲ Up ] / [ ▼ Down ] Reorder Buttons**.
    * **[ ✏️ Edit ] Button**.
    * **[ 🗑️ Delete ] Button**.

---

### Tab 22: Analytics & Reports (`?tab=analytics`)
* **Header**:
  * Title: "Analytics & Performance Reports".
  * Subtitle: "Real-time revenue, conversion rates, and inventory turnover."
* **2 Analytics Cards**:
  * **Monthly Sales Breakdown Card**: Line chart visualizing LKR revenue growth across 31 days.
  * **Payment Method Distribution Card**: Breakdown bar: PayHere Online (55%), COD (35%), WhatsApp Checkout (10%).

---

### Tab 23: Streetla AI Assistant (`?tab=assistant`)
* **Header**:
  * Title: "Streetla AI Sales & Catalog Assistant".
  * Subtitle: "Configure AI chatbot responses, system prompt, store knowledge, and recommended products."
  * **[ 💾 Save AI Settings ] Button**: Emerald green button.
* **Control Panels**:
  * **Chatbot Enable / Disable Toggle Switch**.
  * **AI Welcome Message Input**: Greeting text for web visitors.
  * **Store Knowledge Base Textarea**: Return policies, warranty terms, store location details for AI to reference.
  * **AI Model Sensitivity & Tone Dropdown**: Friendly, Professional, Sales-focused.
  * **Test Chat Window**: Live interactive test sandbox to test AI responses.

---

### Tab 24: Mobile Experience (`?tab=mobile`)
* **Header**:
  * Title: "Mobile Experience & Bottom Bar Navigation".
  * Subtitle: "Customize mobile sticky bottom navigation bar, quick action buttons, and mobile app-like drawer."
  * **[ 💾 Save Mobile Settings ] Button**.
* **Controls**:
  * Mobile Bottom Bar On/Off switch.
  * Bottom Bar Items configuration: `Home`, `Categories`, `Today's Deal`, `Cart`, `WhatsApp`.
  * Mobile Floating Call / WhatsApp bubble position selector.

---

### Tab 25: Store & Auth Settings (`?tab=settings`)
* **Header**:
  * Title: "Store & Authentication Settings".
  * Subtitle: "Change admin login credentials, store maintenance mode, and SEO metadata."
* **Controls**:
  * **Change Admin Password Form**:
    * Current Password, New Password, Confirm New Password inputs.
    * **[ Update Password ] Button**.
  * **Maintenance Mode Switch**:
    * Puts website into "Under Maintenance" state with custom notice text.
  * **Store SEO & Meta Tags**:
    * Default Meta Title, Meta Description, OpenGraph share banner.
    * **[ 💾 Save Store Settings ] Button**.

---

### Tab 26: Contact & Store Times (`?tab=contact-settings`)
* **Header**:
  * Title: "Contact Details & Store Operating Hours".
  * Subtitle: "Configure store physical address, customer hotlines, email, and daily opening hours."
  * **[ 💾 Save Contact Settings ] Button**: Primary blue button.
* **Form Sections**:
  * **Store Hotline & WhatsApp Numbers**: Phone inputs with country code.
  * **Support Email Address**: e.g. `info@streetmobile.lk`.
  * **Store Physical Address**: Street, City, Google Maps Embed URL.
  * **Daily Working Hours Table**:
    * Monday to Sunday open/close time pickers.
    * "Open Today" live badge status preview.

---

## 🪟 4. Global Admin Modals & Form Dialogs

### 1. Product Modal (`ProductModal.tsx`)
Triggered from Top Header `[+ Add Product]`, Products Tab `[Add/Edit]`, or Inventory Tab.
* **Header**: Title "Add New Product" or "Edit Product" + Close (`X`) button.
* **Tabs**:
  1. **Basic Info**: Name, Slug, SKU, Category dropdown, Brand dropdown, Description rich text.
  2. **Pricing & Offers**: Regular Price (LKR), Sale/Discount Price, Wholesale Price, Deal checkbox.
  3. **Images**: Multi-image uploader, direct URL input, drag-and-drop reordering, set Primary Image button.
  4. **Stock & Storage**: Storage capacity variants (e.g. 128GB, 256GB, 512GB), Color variants with color pickers, Initial Stock Count.
  5. **Specs & Warranty**: RAM, Display size, Processor, Battery capacity, Warranty period (e.g. 1 Year Company Warranty).
* **Footer Action Buttons**:
  * **[ Cancel ] Button**: White/10 subtle button.
  * **[ 💾 Save Product ] Button**: Blue button saving product directly to Firestore.

### 2. Category Modal (`CategoryModal.tsx`)
Triggered from Categories Tab.
* Fields: Category Name, URL Slug, Description, Image Upload / URL input with live preview, Sort Order number.
* Toggles: "Show on Homepage", "Include in Mega Menu".
* Buttons: **[ Cancel ]**, **[ 💾 Save Category ]**.

### 3. Offer Banner Modal (`OfferBannerModal.tsx`)
Triggered from Offers & Banners Tab.
* Fields: Internal Campaign Name, Headline, Subheadline, CTA Button Label, Target URL Link.
* Banner Images: Desktop Image (Landscape) upload & Mobile Image (Portrait) upload.
* Placement selector: Homepage top, Middle strip, or Footer.
* Buttons: **[ Cancel ]**, **[ 💾 Save Offer Banner ]**.

### 4. Hero Slide Modal (`HeroModal.tsx`)
Triggered from Hero Slider Tab.
* Fields: Title, Subtitle, Badge text, Button label, Redirect Link, Slide Display Order.
* Images: Desktop Slide banner + Mobile Slide banner.
* Toggles: Slide Active / Inactive.
* Buttons: **[ Cancel ]**, **[ 💾 Save Hero Slide ]**.

### 5. Quick Add Stock Modal
Triggered from Inventory Tab or Overview Tab.
* Displays Product Thumbnail & Current Stock Count.
* Additional Quantity Input (number).
* **Preset Quantity Quick Buttons**:
  * **[ +5 ]**, **[ +10 ]**, **[ +25 ]**, **[ +50 ]**.
* Action Buttons:
  * **[ Cancel ] Button**.
  * **[ Confirm +X Stock ] Button**: Emerald green button updating Firestore.

### 6. Bulk Offer Campaign Modal (`BulkOfferModal.tsx`)
Triggered from Products Tab `[Launch Campaign Offer]`.
* Target Selector: Apply to specific Category, specific Brand, or selected product IDs.
* Discount Type: Percentage Discount (e.g. `15% OFF`) or Flat Discount (e.g. `Rs. 5,000 OFF`).
* Promotional Badge Text (e.g. "MEGA SALE", "NEW YEAR OFFER").
* Buttons: **[ Cancel ]**, **[ 🚀 Apply Campaign to X Products ]**.

### 7. Repair Job Modal (`RepairModal.tsx`)
Triggered from Mobile Repairs Tab.
* Fields: Customer Name, Phone, Alternate Contact, Device Brand, Device Model, IMEI/Serial, Issue description, Estimated completion date, Total estimate, Advance received.
* Buttons: **[ Cancel ]**, **[ 💾 Save Repair Job ]**.

### 8. Cash Flow Modal (`CashFlowModal.tsx`)
Triggered from Cash Flow Tab.
* Type Toggle: **[ Income (+)]** vs **[ Expense (-)]**.
* Fields: Transaction Title, Category, Amount in LKR, Payment Method (Cash, Card, Bank), Date, Receipt image attachment.
* Buttons: **[ Cancel ]**, **[ 💾 Save Transaction ]**.

---

## 💡 Summary of Common Button Styles

| Button Type | Tailwind Classes | Hover & Active State |
| :--- | :--- | :--- |
| **Primary Action** | `bg-blue-600 text-white rounded-xl font-bold px-4 py-2` | `hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-600/30` |
| **Success / Save** | `bg-emerald-600 text-white rounded-xl font-extrabold px-4 py-2` | `hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/30` |
| **Danger / Delete** | `bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg px-2.5 py-1` | `hover:bg-red-500 hover:text-white transition-colors` |
| **Secondary / Cancel** | `bg-white/10 text-white rounded-xl font-bold px-4 py-2` | `hover:bg-white/20 active:scale-95` |
| **Icon Action (Table)** | `p-2 rounded-lg bg-white/5 border border-white/10 text-white/70` | `hover:text-white hover:bg-white/10` |
| **WhatsApp Direct** | `bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-xl px-3 py-1.5` | Instant redirect to customer phone chat |
