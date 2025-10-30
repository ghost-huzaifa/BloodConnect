# PIEAS Blood Chapter Portal - Design Guidelines

## Design Approach
**Healthcare Trust Pattern** - Drawing inspiration from Red Cross Blood Services and Zocdoc, prioritizing clarity, trustworthiness, and immediate access to critical information. Medical applications demand professional aesthetics with emphasis on data hierarchy and urgency indicators.

## Color System (User-Specified)
```
Primary: hsl(342, 85%, 53%) - Medical Red (CTAs, urgent alerts, blood group tags)
Secondary: hsl(0, 0%, 77%) - Neutral Grey (borders, disabled states)
Background: hsl(0, 0%, 94%) - Light Grey (page background)
Text: hsl(0, 0%, 10%) - Dark (primary content)
Accent: hsl(25, 45%, 80%) - Warm Accent (success states, appreciation elements)

Status Colors:
- Available: hsl(142, 71%, 45%) - Green
- Low: hsl(45, 93%, 47%) - Amber
- Urgent: hsl(0, 84%, 60%) - Bright Red
- Success: hsl(142, 71%, 45%) - Green
- Warning: hsl(45, 93%, 47%) - Amber
```

## Typography
**Primary Font: Poppins (Google Fonts)**
```
Headings: 
- H1: 2.5rem (40px), weight 700, letter-spacing -0.02em
- H2: 2rem (32px), weight 600
- H3: 1.5rem (24px), weight 600
- H4: 1.25rem (20px), weight 500

Body:
- Large: 1.125rem (18px), weight 400, line-height 1.6
- Base: 1rem (16px), weight 400, line-height 1.5
- Small: 0.875rem (14px), weight 400
- Caption: 0.75rem (12px), weight 500, uppercase tracking

UI Elements:
- Buttons: 0.875rem-1rem, weight 500
- Labels: 0.875rem, weight 500
- Badges: 0.75rem, weight 600, uppercase
```

## Layout System
**Tailwind Spacing Units: 1, 2, 4, 6, 8, 12, 16**
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-16
- Card gaps: gap-4 to gap-6
- Form field spacing: space-y-4
- Grid gaps: gap-6 for cards, gap-4 for compact data

**Container Strategy:**
- Max-width: max-w-7xl for main content
- Dashboard sections: max-w-6xl
- Forms: max-w-2xl centered
- Full-width tables and grids as needed

**Border Radius: 0.8rem (user-specified)**
- Cards: rounded-[0.8rem]
- Buttons: rounded-[0.8rem]
- Inputs: rounded-[0.8rem]
- Tags/Badges: rounded-full
- Images: rounded-[0.8rem]

## Core Components

### Cards (Primary Layout Element)
Medical-grade card design with subtle elevation:
- Background: white
- Border: 1px solid hsl(0, 0%, 88%)
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.08)
- Padding: p-6 (standard), p-8 (featured)
- Hover: subtle shadow increase for interactive cards

### Navigation
**Top Navigation Bar:**
- Fixed header with white background, bottom border
- Logo left, primary nav center, user actions right
- Height: h-16
- Links: hover with primary color underline

**Admin Sidebar (Dashboard):**
- Width: w-64 on desktop, collapsible on mobile
- Background: white with subtle border
- Active state: light primary color background
- Icons: 1.25rem with 0.75rem gap to text

### Blood Group Tags
Prominent circular badges for blood type display:
- Size: 3rem × 3rem (featured) or 2rem × 2rem (inline)
- Font: weight 700, 1.125rem
- Border: 2px solid based on status
- Color-coded by availability status

### Status Indicators
**Urgency Badges:**
- Normal: grey badge, 24hrs icon
- Urgent: amber badge, 6hrs icon, subtle pulse
- Emergency: red badge, "Immediate" text, animated pulse

**Availability Tags:**
- Available: green with checkmark icon
- Low: amber with warning icon
- Urgent: red with alert icon

### Forms
Clean, accessible form design:
- Labels: weight 500, mb-2
- Input fields: h-12, bg-white, border grey
- Focus state: primary color border, ring
- Error state: red border with error message
- Success: green border with checkmark
- Checkboxes/Radio: custom styled with primary color

### Buttons
```
Primary: bg-primary text-white, hover darken 10%
Secondary: border-2 border-primary text-primary, hover bg-primary-light
Tertiary: text-primary underline-offset-4, hover underline
Danger: bg-red text-white for critical actions
Ghost: text-grey hover bg-grey-light

Sizes:
- Small: px-4 py-2, text-sm
- Medium: px-6 py-3, text-base
- Large: px-8 py-4, text-lg

Icon Buttons: Circular w-10 h-10 with centered icon
```

### Data Tables
Professional medical data display:
- Header: background light grey, weight 600, uppercase text-xs
- Rows: hover light primary background
- Borders: subtle grey between rows
- Actions: icon buttons on row hover
- Pagination: bottom center with page numbers
- Filters: top section with search and dropdown combos

### Modals/Dialogs
- Overlay: dark with 60% opacity
- Container: white, rounded-[0.8rem], max-w-2xl
- Header: border-bottom, primary color title
- Footer: border-top, action buttons right-aligned
- Close: X icon top-right

## Page-Specific Layouts

### Public Dashboard (Home)
**Hero Section with Stats:**
- Hero image: Medical/donation scene with gradient overlay (70% opacity)
- Centered headline: "Save Lives Through Blood Donation"
- Live stats cards overlaying hero: Total Donors, Active Requests, Lives Saved
- CTA: "Register as Donor" prominent button

**Blood Availability Grid:**
- 8 cards in 4-column grid (2 on mobile)
- Each shows blood group, status badge, unit count
- Click for details modal

**Active Requests Section:**
- Card-based list with urgency indicators
- Shows location, blood type needed, time remaining
- Quick "I Can Help" button

### Donor Registration Page
- Centered form, max-w-2xl
- Progress indicator if multi-step
- Field groups with clear labels
- Upload section for documents (if needed)
- Terms checkbox before submit
- Success state with confirmation message

### Admin Dashboard
**Layout:** Sidebar + Main Content Area
- Sidebar: Navigation with icons and counts
- Top bar: Search, notifications, profile
- Main: Grid of stat cards + data tables
- Quick actions floating button bottom-right

**Key Sections:**
- Overview: 4-column stat cards with trend indicators
- Pending Approvals: Highlighted section with count badge
- Recent Activity: Timeline view with timestamps
- Charts: Blood group distribution, monthly donations

### Request Management
- Kanban-style columns: New / In Progress / Completed
- Each card shows urgency, blood type, location, time
- Drag-and-drop functionality
- Filter bar: Blood group, urgency, location, date range
- Donor matching panel: Quick view of eligible donors

### Donor Tracker Panel
- Advanced filter toolbar: Blood group, city, batch, eligibility
- Table view with sortable columns
- Eligibility badge prominent (green/red)
- Days since last donation counter
- Quick actions: Contact, View Profile, Mark Donation

## Images
**Hero Image (Home Page):**
- Full-width hero section (h-[500px])
- Image: Diverse group of people donating blood or medical setting
- Dark gradient overlay for text readability
- Blurred background for overlaid stats cards

**Event Archive:**
- Gallery grid with rounded images
- Thumbnail size: 300×200px in 3-column grid
- Hover: slight zoom and overlay with event title

**Donor Certificates:**
- Generated PDF with PIEAS Blood Chapter branding
- Portrait orientation with decorative border
- Donor name, blood type, date, certificate number

**Icons:**
Font Awesome via CDN for medical icons:
- fa-droplet (blood drop)
- fa-heart-pulse (medical)
- fa-location-dot (location)
- fa-calendar-check (scheduling)
- fa-bell (notifications)
- fa-chart-line (analytics)

## Special Elements
**Eligibility Countdown:**
Visual progress ring showing days until eligible to donate again with color coding (red→amber→green)

**WhatsApp Integration:**
Green button with WhatsApp icon, "Contact via WhatsApp" text

**Export Buttons:**
Icon + "Export to Excel" text, subtle background

**Appreciation Elements:**
Warm accent color for thank-you messages, certificates, achievement badges

This design system ensures a trustworthy, efficient, and compassionate user experience aligned with the critical nature of blood donation management.