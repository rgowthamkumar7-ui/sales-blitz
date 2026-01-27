

# 📱 Sales Punch - Mobile Sales Tracking System

A game-like, mobile-first sales tracking app where salesmen record sales by tapping product images with automatic incentive calculation.

---

## 🎯 Core Concept

**"Tap to Sell"** - A frictionless sales entry experience where each product tap = 1 sale. No typing, one-thumb operation, with satisfying animations and haptic feedback.

---

## 🏗️ Architecture Overview

### User Roles
1. **Salesman** - Punch sales via image taps, view their performance
2. **Team Leader** - Issue stock, monitor team's stock vs sales
3. **Manager** - Dashboards, reports, Excel exports

### Backend
- **Supabase** for database, authentication & real-time sync
- Role-based access with secure RLS policies

---

## 📱 Phase 1: Salesman Experience (Primary Focus)

### Login Screen
- Simple PIN-based authentication (4-6 digit code per salesman)
- Large numeric keypad optimized for thumb entry
- Remember last logged-in user option

### Start Day Screen
- Auto-filled today's date
- Recent outlets at top for quick selection
- Search/filter for outlet list
- Big "START SALES" button

### Sales Punch Screen (⭐ The Game Screen)
- **Product Cards Grid** (2 columns, 3-6 visible at once)
  - Large product image (tap target)
  - SKU name below image
  - Counter badge showing quantity (0, 1, 2, 3...)
  - **Tap** = +1 (with bounce animation + haptic)
  - **Long press** = -1 (with subtle feedback)
- Floating "SUBMIT SALE" button at bottom
- Running total display
- Smooth, professional animations (not childish)

### Sale Submitted Screen
- ✅ Success animation (confetti or checkmark burst)
- Summary: Total units sold, Points earned
- "Next Outlet" and "End Day" buttons

### My Performance Screen
- Today's sales summary
- Monthly points progress
- **Incentive Meter** - Visual progress bar toward next slab
- Current incentive earned (₹ amount)

---

## 👨‍💼 Phase 2: Team Leader Features

### Stock Issuance
- Select salesman from team list
- Issue stock via product cards (with quantity input)
- Confirmation with issued summary

### Team Overview
- List of salesmen with today's status
- For each: Issued vs Sold vs Balance
- Visual flags for anomalies (sold > issued = red alert)

---

## 📊 Phase 3: Manager Dashboard

### Overview Dashboard
- Cards: Total Sales, Total Incentive Payout, Top Salesman
- Quick date range selector (Today/Week/Month)

### Reports Section
- Filters: Date range, Salesman, SKU, Outlet
- **Excel Exports:**
  - Sales Report
  - Incentive Report
  - Stock vs Sales Reconciliation

### Configuration (Admin)
- Manage SKUs (add/edit product images & points)
- Set incentive slabs
- Manage outlets
- Manage users & roles

---

## 🎨 Design System

### Visual Style
- **Professional & Modern** - Clean card-based UI
- **Mobile-First** - Large touch targets (min 48px)
- **Color Palette** - Corporate blue/teal primary, green for success, amber for points
- **Typography** - Bold counters, readable labels

### Animations
- Tap: Scale bounce + ripple effect
- Counter increment: Number pop animation
- Submit: Confetti/success burst
- Page transitions: Smooth slide

### Haptic Feedback
- Light vibration on each tap
- Stronger feedback on submit

---

## 📦 Data Structure

1. **Users** - id, name, phone, PIN, role, team_leader_id
2. **Outlets** - id, name, address, area
3. **SKUs** - id, name, image_url, points_per_unit, is_active
4. **Stock Issued** - id, salesman_id, sku_id, quantity, date, issued_by
5. **Sales Transactions** - id, salesman_id, outlet_id, sku_id, quantity, points, timestamp
6. **Incentive Slabs** - id, min_points, max_points, incentive_amount

---

## ✅ Success Metrics

- Sales entry in **under 10 seconds** per outlet
- **One-thumb operation** throughout
- **Zero typing** for salesmen
- Feels like a game, works like enterprise software

---

## 🚀 Implementation Approach

1. Set up Supabase with all data tables & security
2. Build salesman flow first (login → punch → submit → performance)
3. Add Team Leader stock issuance & monitoring
4. Build Manager dashboard & Excel exports
5. Polish animations & haptic feedback
6. Add offline support (cache sales, sync when online)

