
# CustomerPortfolioUploader

🔗 [Live Demo](https://customer-portfolio-uploader.netlify.app/)

https://customer-portfolio-uploader.netlify.app/

Please use the `customer.xlsx` file to upload data.

## Overview

This app allows users to upload an Excel file, view and interact with the parsed data using AG Grid, and manage edits with a centralized store using NgRx.

🔧 Features
📁 Excel Upload: Import customer data from an Excel file.

📊 AG Grid Display: Parsed data is rendered inside AG Grid with advanced features.

🧮 Grid Functionality
✏️ Inline Editing:

Editable fields: Risk Score, Balance, and Last Review Date

🔍 Filtering & Sorting: Available on all columns.

🧩 Dynamic Grouping / Pivoting: Group by any column via drag-and-drop.

💾 Column State Persistence: Save and restore user preferences (e.g., column order, visibility, width).

✅ Validation Rules:

Risk Score must be between 1–5

Balance must be ≥ 0

🗃️ State Management
⚡ NgRx Store + Effects (Angular):

Centralized state for uploaded and edited data

Track which rows have been modified

Display total row count and number of unsaved edits

Save or restore data via actions

Defer backend save until user clicks Save

✨ Bonus Features
🌙 Dark Mode Toggle

📤 Export Edited Data to Excel

🛠️ Tech Stack
Angular

NgRx (Store + Effects)

AG Grid Enterprise

Angular Material




