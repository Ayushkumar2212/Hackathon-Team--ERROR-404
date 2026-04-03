# SafeScript AI — Changelog

All notable changes to this project are documented here.
Format: `[Version] - YYYY-MM-DD`

---

## [2.0.0] - 2026-04-01

### Added
- Hospital Command Center completely rebuilt with sidebar layout
- **Digital Notepad**: Text mode + Sketch canvas with Brush & Eraser
- **Staff Roster**: Full CRUD for hospital staff with duty assignments
- **SOS Emergency Hub**: Live GPS map per emergency request; Dispatch/Decline workflow
- **Smart Inventory**: Add/remove hospital medical stock
- **Hospital Billing**: Create, calculate, and save invoices
- **OPD Management tab** in Hospital portal with appointment confirmation
- `404.html` error page
- `logout.html` secure session termination page
- `assets/style.css` global shared stylesheet
- `assets/app.js` shared utility functions

### Changed
- Hospital portal reverted to original classic desktop-sidebar layout (`Plus Jakarta Sans`, blue-600 palette)
- Server port updated to 8001 to avoid conflicts with existing services

### Fixed
- localStorage sync between Patient SOS trigger and Hospital SOS queue
- Appointment conflict detection now uses both `date` AND `time` fields

---

## [1.5.0] - 2026-03-31

### Added
- Patient Portal: **Document Vault** (upload, view, delete medical documents)
- Patient Portal: **Nearby Facilities** (hospitals & pharmacies with distance + Maps link)
- Patient Portal: **OPD Booking** with time slot and age field + conflict detection
- Patient Portal: **SOS Ambulance Tracking** with animated map overlay
- Patient Portal: **Profile with GPS** live location map
- Pharmacy Portal: **Digital Billing** with jsPDF invoice download
- Pharmacy Portal: **Online Orders** lifecycle (Pending → Processing → Dispatched → Delivered)
- Pharmacy Portal: **AI QR Scanner** via html5-qrcode

### Changed
- Login: 12-digit Aadhaar for Patients, 15-digit GSTIN for Hospitals/Clinics/Pharmacies/Insurance
- Login: 15-digit Govt ID for Government Health Bodies
- Registration now captures GPS coordinates for institutional verification

---

## [1.0.0] - 2026-03-29

### Added
- Initial project scaffold with Tailwind CSS
- `login.html` with role-based registration
- `hospital.html` — Hospital Command Center (initial version)
- `client.html` — Clinic / Doctor Rx Pad
- `pharmacy.html` — Pharmacy Dashboard
- `patient.html` — Patient Mobile Portal
- `health insurance.html` — Insurance Portal
- `health bodies.html` — Government Regulatory Portal
- `banner.html` — Landing/intro page
- `serve.ps1` — Local PowerShell HTTP server
- `index.html` — Redirect entry point

---
