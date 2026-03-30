# Design Guidelines: Unchi Udaan Educational Platform

## Design Approach

**Reference-Based Design** drawing from:
- **Primary**: Razorpay (modern card design, gradients, professional trust-building aesthetics)
- **Secondary**: Linear (clean typography, structured information hierarchy), Notion (intuitive dashboards), Coursera (educational content presentation)

**Design Principles**:
- Trust and professionalism for payment-integrated educational platform
- Clear role-based interface differentiation
- Information density balanced with breathing room
- Modern, aspirational aesthetic for exam preparation

---

## Typography

**Font Stack** (via Google Fonts):
- Primary: `Inter` - Body text, UI elements (400, 500, 600, 700)
- Headings: `Plus Jakarta Sans` - Display text, section headers (600, 700, 800)

**Hierarchy**:
- Hero Headlines: 3xl-5xl, font-bold (Plus Jakarta Sans)
- Section Headers: 2xl-3xl, font-semibold
- Card Titles: lg-xl, font-semibold
- Body Text: base, font-normal, leading-relaxed
- Captions/Labels: sm, font-medium
- Buttons: base, font-semibold, tracking-wide

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24** (e.g., p-4, gap-6, my-12, py-20)

**Container System**:
- Full-width sections: `w-full` with inner `max-w-7xl mx-auto px-6`
- Content containers: `max-w-6xl mx-auto`
- Text-heavy content: `max-w-4xl`
- Dashboard content: `max-w-screen-2xl`

**Grid Patterns**:
- Course/Quiz cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Feature highlights: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8`
- Dashboard stats: `grid-cols-2 md:grid-cols-4 gap-4`

---

## Component Library

### Navigation
**Main Navbar**: Sticky top navigation with backdrop blur
- Logo left, nav links center, Login/Signup right
- Mobile: Hamburger menu with slide-in drawer
- Role-based nav items after login (User/Instructor/Admin differentiation)

**Dashboard Sidebar**: Fixed left sidebar for logged-in users
- Role indicator at top with user avatar
- Grouped navigation sections with icons
- Collapsible on mobile

### Cards & Content Blocks

**Course/Quiz Cards**: Elevated cards with hover lift
- Thumbnail/icon top (aspect-ratio-video for courses)
- Title, brief description
- Metadata row: duration, questions count, difficulty badge
- Price tag with original/discounted display
- CTA button at bottom

**Study Material Cards**: Document-style cards
- File type icon, title, category tags
- Download/View button, paid status indicator

**Job Post Cards**: Clean, scannable listings
- Department badge, title as primary
- Location, last date to apply
- "Apply Now" external link button

**Current Affairs Cards**: News-style cards
- Date badge, headline, brief excerpt
- Category tag, "Read More" link

### Forms & Inputs

**Form Fields**: Consistent styling across all forms
- Label above input, helper text below
- Focus states with border highlight
- Error states with red border and icon
- Input groups for email OTP (6 individual boxes)

**Buttons**: 
- Primary: Solid fill with hover shadow lift
- Secondary: Border with hover fill
- Tertiary: Text with hover underline
- Hero CTAs: Gradient background with blur effect when on images

### Quiz Interface

**Quiz Attempt Page**: Focused, distraction-free
- Fixed timer header with warning states (< 5 min remaining)
- Question counter progress bar
- Single question display with radio options
- Previous/Next navigation, Submit button
- Mobile-optimized single column

**Results Display**: Celebratory or encouraging based on score
- Score circle/gauge visualization
- Breakdown: correct/incorrect/skipped
- "Download PDF" and "Retake Quiz" CTAs

### Dashboards

**Stat Cards**: Minimal with large numbers
- Icon, metric value (large), label (small)
- Subtle background or border treatments

**Data Tables**: Clean, sortable tables
- Zebra striping for rows
- Action buttons (Edit/Delete) right-aligned
- Pagination at bottom
- Search and filter controls above table

**Admin User Management**: Table with role badges, status indicators, inline actions

---

## Page-Specific Layouts

### Public Pages

**Home**: 
- Hero: Full-width gradient background with centered headline, subheadline, dual CTAs (Browse Courses / Start Free Quiz)
- Large aspirational hero image showing students/exam success
- Features section: 4-column grid with icons
- Course highlights: 3-card carousel preview
- Stats section: 4 metrics in a row (Students, Courses, Success Rate, Quizzes)
- Testimonials: 2-column grid
- CTA section: Gradient background with enrollment prompt
- Footer: 4-column layout (About, Quick Links, Resources, Contact)

**Courses Listing**: 
- Filter sidebar (left): Category checkboxes, price range, difficulty
- Main area: Grid of course cards with sort dropdown

**Job Portal**:
- Search bar prominent at top
- Filter chips: Department, Location, Date posted
- Job cards in vertical list format
- Load more pagination

### User Dashboard

**My Dashboard**:
- Welcome header with user name
- 4 stat cards: Enrolled Courses, Completed Quizzes, Study Materials, Upcoming Deadlines
- Recent Activity feed
- Continue Learning section: horizontal scroll of course progress cards

**Quiz Attempt**:
- Clean white background
- Timer in fixed top bar (full width)
- Question number indicator
- Large, readable question text
- Radio buttons with full-width option rows
- Navigation controls fixed bottom (mobile) or inline (desktop)

### Instructor/Admin Dashboards

**Content Management**:
- Top action bar: "Create New" button, filters
- Table view for existing content
- Inline edit/delete actions
- Modal overlays for create/edit forms

**Admin Analytics**:
- Revenue charts, user growth graphs
- Top-performing courses/quizzes tables
- Recent payments list

---

## Images

**Hero Section**: Large aspirational image
- Students studying/celebrating success, exam hall atmosphere, or graduation moment
- High-quality, professional photography
- Positioned as background with gradient overlay for text readability
- Blurred background for CTA buttons

**Course Thumbnails**: Placeholder illustrations/icons for each course category (use icon libraries)

**About Page**: Team photo or classroom environment image

**Dashboard**: Use icons only, keep data-focused without decorative imagery

---

## Visual Treatments

**Gradients**: Use sparingly for impact
- Primary gradient: Bright blue to deeper blue (for CTAs, hero backgrounds)
- Subtle gradients: Light blue to white (for section backgrounds)

**Elevation/Shadows**:
- Cards: `shadow-sm` default, `shadow-lg` on hover
- Modals: `shadow-2xl`
- Floating elements: `shadow-xl`

**Borders**: Minimal use
- Input fields: 1px subtle borders
- Card separators: Divider lines within cards
- Table rows: Hairline borders

**Spacing Rhythm**:
- Section padding: `py-16 md:py-24` for main sections
- Card padding: `p-6`
- Component gaps: `gap-6` or `gap-8`

---

This design creates a **professional, trustworthy educational platform** that balances modern aesthetics with functional clarity across multiple user roles.