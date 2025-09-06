
# DataInfo Dashboard Documentation

## Project Overview
DataInfo Dashboard is a Next.js-based analytics dashboard for visualizing construction project data. It features interactive charts, KPIs, a sidebar for navigation, and map-based visualizations.

## How to Run the Project

1. **Install dependencies:**
	```bash
	npm install
	```
2. **Start the development server:**
	```bash
	npm run dev
	```
3. **Open in browser:**
	Visit [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Recent Updates & Features

### General Changes
- Company name changed to **DataInfo** throughout the app.
- Sidebar added for improved navigation.
- Data now includes entries from different months for better visualizations.

### Dashboard Visuals
1. **Top Page KPIs**
	- Replaced previous KPIs with:
	  - **Total Projects** (e.g., 152, +12% vs last month) with breakdown by status: On Track / Delayed / Completed. White background used for this KPI.
	  - **Total Estimated Construction Value** (e.g., $250M, +5% Growth).
	  - **Average Project Size** (m²).
	- Statistic Cards inspired by [reui.io/blocks](https://reui.io/blocks) "Statistic Cards".
2. **Projects Added Per Month**
	- Replaces "Average Price by Month" visual.
3. **Market Size by Location (in $)**
	- Replaces "Properties by Status" visual.
4. **Map Visual**
	- Added map visualization with bubbles for location-based data.
5. **Removed Visuals**
	- Removed "Average Size by Month" and "City Performance" visuals.
6. **Recent Activity & Property Type Distribution**
	- Kept these visuals. Property type distribution visual updated for consistent colors and format. Apartment % bug fixed.
7. **Table Visual**
	- Added an Edit button to display all data columns. (Edit functionality is UI only, not functional yet.)

## Libraries Used
- Next.js
- Chart.js / Recharts (for charts)
- React Leaflet or similar (for map visual)

## Folder Structure
- `app/` - Main application pages
- `components/` - Reusable UI components (charts, cards, sidebar, etc.)
- `lib/` - Utility functions
- `public/` - Static assets

## Customization
- Update data in `data.json` for new months or projects.
- Modify visuals in `components/charts/` and `components/ui/` as needed.

## Contact
For questions or contributions, open an issue or pull request on [GitHub](https://github.com/abdo1699/DataInfo).
