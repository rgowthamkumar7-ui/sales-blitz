# Sales Blitz - Supabase Integration Verification

This guide outlines how to verify that the Sales Blitz application is correctly using Supabase for all data operations.

## Prerequisites
- Application running (`npm run dev`)
- Supabase project set up and connected (credentials in `.env.local`)

## Verification Steps

### 1. Manager Dashboard
**Goal:** Verify data loads from Supabase and export works.

1.  **Login:**
    - Role: **Manager (AE/AM)**
    - Name: Select any manager (e.g., "Rahul Sharma")
    - *Note: Login now fetches managers directly from Supabase.*

2.  **Dashboard Data:**
    - **Check:** You should see a "Loading dashboard data..." spinner briefly.
    - **Check:** Distributor list in the filter dropdown should match Supabase `distributors` table.
    - **Check:** "Sales by SKU", "Distributor Comparison", and "Trend" charts should reflect data from `sale_transactions` table.
    - **Action:** Select a different date range (e.g., "Last 30 Days"). Charts should update.

3.  **Excel Export:**
    - **Action:** Click "Export Report".
    - **Action:** Select a date range and click "Download Excel".
    - **Verify:** Open the downloaded file. It should contain columns like "WD Code", "TL Name", "DS Name", "Quantity Sold". The data should match what is in Supabase.

4.  **Target Upload:**
    - **Action:** Click "Upload Targets".
    - **Action:** Download the "Sample Template".
    - **Verify:** The template should have the correct headers.
    - **Action:** Upload a populated template file.
    - **Verify:** A success message should appear, and data should be saved to `ds_targets` table in Supabase.

### 2. Team Leader Dashboard
**Goal:** Verify sales entry and stock issuance.

1.  **Login:**
    - Role: **Team Leader**
    - Name: Select any TL (e.g., "Amit Singh")

2.  **Salesman List:**
    - **Check:** Assigned salesmen list should load from Supabase.
    - **Check:** Progress bar should reflect today's entries.

3.  **Sales Entry:**
    - **Action:** Select a salesman.
    - **Action:** Enter "Total Mapped Outlets" (e.g., 25).
    - **Action:** Enter quantities for a few SKUs.
    - **Action:** Click "Save Sales".
    - **Verify:** Success message appears.
    - **Verify (Database):** Check `sale_transactions` table in Supabase to confirm the new records exist.
    - **Verify (Manager Dashboard):** Log back in as Manager to see if the new sales appear in the charts (ensure date range covers today).

## Troubleshooting

- **No Data Loading:** Check browser console for network errors. Ensure Supabase URL/Key in `.env.local` are correct.
- **Login Stuck:** Ensure `users` table has data in Supabase.
- **Export Empty:** Ensure the selected date range has actual sales data.
