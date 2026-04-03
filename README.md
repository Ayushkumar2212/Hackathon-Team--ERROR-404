# 🏥 SafeScript AI — Advanced Healthcare Audit System

> **A complete, role-based AI-powered healthcare management platform** built as a static web application. It connects Patients, Hospitals, Clinics, Pharmacies, Insurance Companies, and Government Health Bodies in a unified, secure digital ecosystem.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Live Demo](#-live-demo)
- [Features by Role](#-features-by-role)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started (Local)](#-getting-started-local)
- [User Flows](#-user-flows)
- [ID Validation Rules](#-id-validation-rules)
- [Data Storage](#-data-storage)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🌐 Project Overview

**SafeScript AI** is a healthcare platform that digitizes prescription management, real-time emergency response (SOS), OPD bookings, pharmacy ordering, hospital billing, insurance management, and government-level drug surveillance — all without requiring a backend server.

**Key Pillars:**
- 🔐 **Role-Based Access Control** — Each user type sees only their dashboard
- 🗺️ **GPS-Tagged Registration** — Institutions are verified with real-time geolocation
- 📱 **Responsive Design** — Mobile & desktop first for all portals
- 🚑 **Live SOS System** — Patient triggers emergency → Hospital dispatches ambulance
- 💊 **End-to-End Prescription Flow** — Clinic writes Rx → Pharmacy fills → Patient receives

---

## 🚀 Live Demo

### Running Locally (Windows)

```powershell
# Step 1: Open PowerShell in the project folder
# Step 2: Run the built-in server script
powershell -ExecutionPolicy Bypass -File .\serve.ps1

# Step 3: Open your browser and go to:
# http://localhost:8001
```

**Demo OTP:** `123456`

---

## ✨ Features by Role

### 🔑 Login & Registration (`login.html`)
- Unified registration form for all 6 roles
- Dynamic field switching based on selected role
- **12-digit Aadhaar** for Patients & Caregivers
- **15-digit GSTIN** for Hospitals, Clinics, Pharmacies, Insurance
- **15-digit Govt ID** for Government Health Bodies
- Real-time GPS coordinates captured on registration
- OTP verification flow (demo: `123456`)
- Auto-redirect to the correct role dashboard after login

---

### 🏥 Hospital Portal (`hospital.html`)
| Tab | Feature |
|---|---|
| **Command Center** | Live revenue counter, safety alert count, daily AI scans, pending SOS count, recent invoices |
| **OPD Management** | View & confirm patient appointments booked via the patient portal |
| **SOS Requests** | Real-time emergency feed with patient GPS on map — Dispatch or Decline ambulance |
| **Smart Inventory** | Add/remove medical supplies and equipment stock |
| **Digital Notepad** | **Text Mode** for clinical notes + **Draw/Sketch Canvas** with Brush & Eraser |
| **Staff Roster** | Add/remove Doctors, Nurses, Support staff with duty assignments |
| **Hospital Profile** | Update name, email, photo; view GSTIN; live GPS map of hospital location |

---

### 👨‍⚕️ Clinic Portal (`client.html`)
| Tab | Feature |
|---|---|
| **Digital Rx Pad** | Create digital prescriptions with medicine name, dosage, duration, instructions |
| **Pending Appointments** | View & confirm clinic-type OPD bookings from patients |
| **Submit to Pharmacy** | Send digital Rx directly to pharmacy order queue |
| **Profile & Map** | Update doctor photo, name, email; live GPS map |

---

### 💊 Pharmacy Portal (`pharmacy.html`)
| Tab | Feature |
|---|---|
| **Dashboard Hub** | Today's total sales, pending orders count, low stock alerts, scan activity |
| **Online Orders** | Manage incoming patient and clinic orders → Process → Dispatch → Deliver → Decline |
| **Digital Billing** | Create itemized invoices with auto-total, download as PDF |
| **Smart Inventory** | Add/remove medicines with quantity and price tracking |
| **AI Vision Scanner** | Scan QR/barcodes on medicine labels using device camera |
| **Pharmacy Profile** | Update store name, email, photo; view GSTIN; live GPS map |

---

### 🧑‍🦱 Patient Portal (`patient.html`)
| Feature | Details |
|---|---|
| **SOS Emergency** | One-tap SOS — sends GPS location to all hospitals; shows ambulance tracking map |
| **OPD Booking** | Book appointments at Hospital or Clinic with date, time slot, age, reason; slot conflict prevention |
| **Order Medicine** | Search and order medicines with quantity and prescription upload |
| **Track Orders** | Real-time status tracking for pharmacy orders |
| **Nearby Facilities** | List of nearby hospitals and pharmacies with distance and Google Maps directions |
| **Document Vault** | Upload, store, and delete medical documents (PDFs, Images) securely |
| **Profile** | Edit name, email, upload DP; view Aadhaar (masked); live GPS location on map |
| **Logout** | Secure session termination |

---

### 🏛️ Health Insurance Portal (`health insurance.html`)
- View and manage insurance claims from patients
- Approve or reject claims with notes
- Claims history and policy management

---

### 🏛️ Government Health Bodies Portal (`health bodies.html`)
- Regional epidemic heatmap (disease distribution)
- Narcotics surveillance — detect suspicious prescription volumes
- Provider registry overview
- Policy compliance monitoring

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Page structure and semantics |
| **Tailwind CSS** (CDN) | Utility-first responsive styling |
| **Vanilla JavaScript** | All application logic, no frameworks |
| **Plus Jakarta Sans** (Google Fonts) | Primary typography |
| **Font Awesome 6** | Icons throughout the UI |
| **html5-qrcode** | Camera-based QR/barcode scanning |
| **jsPDF + AutoTable** | Client-side PDF generation for invoices |
| **Google Maps Embed API** | GPS location display and SOS mapping |
| **localStorage** | All data persistence (no backend required) |
| **PowerShell** | Local static file server (`serve.ps1`) |

---

## 📁 Project Structure

```
safescript-ai/
│
├── index.html              # Entry point → redirects to login.html
├── login.html              # Unified login/registration for all roles
│
├── hospital.html           # Hospital Command Center dashboard
├── client.html             # Clinic / Doctor's Rx pad dashboard
├── pharmacy.html           # Pharmacy management dashboard
├── patient.html            # Patient mobile-first portal
├── health insurance.html   # Health Insurance company portal
├── health bodies.html      # Government regulatory portal
│
├── assets/                 # Static assets (images, icons, etc.)
│   └── (images, logos)
│
├── serve.ps1               # Local PowerShell HTTP server (port 8001)
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

---

## 🔄 User Flows

### 🚑 SOS Emergency Flow
```
Patient (patient.html)
  → Clicks SOS Button
  → GPS coordinates captured
  → Request saved to localStorage['safescript_sos_queue']
  → Status: "Pending"

Hospital (hospital.html → SOS Tab)
  → Sees SOS card with patient name + live map
  → Clicks "Dispatch Ambulance"
  → Status updated to "Approved"

Patient Portal
  → Sees "Ambulance Dispatched" status
  → Map shows ambulance approaching
```

### 💊 Prescription Flow
```
Clinic Doctor (client.html)
  → Fills Digital Rx Pad (medicine, dosage, duration)
  → Clicks "Submit to Pharmacy"
  → Order saved to localStorage['pharmacy_orders']

Pharmacy (pharmacy.html → Online Orders)
  → Sees new order with status "Pending"
  → Clicks Process → Out for Delivery → Delivered

Patient (patient.html → Track Orders)
  → Sees real-time status changes
```

### 📅 OPD Booking Flow
```
Patient (patient.html)
  → Selects Hospital OPD or Clinic
  → Picks date, time slot (conflict-checked), reason, age
  → Booking saved to localStorage['safescript_appointments']

Hospital/Clinic
  → Sees appointment in OPD tab
  → Clicks "Confirm" to verify
```

---

## 🔐 ID Validation Rules

| User Role | ID Type | Format |
|---|---|---|
| Patients & Caregivers | Aadhaar Number | 12 digits numeric |
| Hospitals | GSTIN | 15 alphanumeric characters |
| Clinics | GSTIN | 15 alphanumeric characters |
| Pharmacists | GSTIN | 15 alphanumeric characters |
| Health Insurance Companies | GSTIN | 15 alphanumeric characters |
| Government Health Bodies | Government ID | 15 alphanumeric characters |

---

## 💾 Data Storage

All data is stored in the browser's **localStorage**. No internet connection required after initial load from server.

| Key | Used By | Contains |
|---|---|---|
| `safescript_user` | All portals | Current logged-in user object |
| `safescript_sos_queue` | Patient + Hospital | SOS emergency requests |
| `safescript_appointments` | Patient + Hospital + Clinic | OPD bookings |
| `pharmacy_orders` | Patient + Pharmacy + Clinic | Medicine orders |
| `safescript_patient_orders` | Patient portal | Patient-side order tracking |
| `safescript_inventory` | Pharmacy | Pharmacy stock list |
| `h_inventory` | Hospital | Hospital medical supply stock |
| `h_staff` | Hospital | Staff roster |
| `h_bills` | Hospital | Billing/invoice history |
| `h_alerts` | Hospital | Safety alert counter |
| `h_scs` | Hospital | Daily scan counter |
| `h_note_txt` | Hospital | Notepad text content |
| `h_note_cvs` | Hospital | Notepad canvas drawing (base64) |
| `safescript_pharma_logs` | Pharmacy | Pharmacy sales log |
| `pharma_scans` | Pharmacy | QR scan counter |

> ⚠️ **Warning**: Clearing browser data / cache will permanently delete all records. For production use, migrate to a cloud database (Firebase/Supabase).

---

## 🗺️ Roadmap

### Phase 1 — Current (MVP) ✅
- [x] Role-based login with ID validation
- [x] Hospital Command Center (SOS, OPD, Inventory, Staff, Notepad, Billing)
- [x] Clinic Rx Pad with pharmacy submission
- [x] Pharmacy order lifecycle management
- [x] Patient portal (SOS, OPD, Orders, Vault, Nearby)
- [x] Insurance and Govt portals
- [x] Local server (`serve.ps1`)

### Phase 2 — Backend Integration 🔜
- [ ] Firebase/Supabase real-time database
- [ ] Multi-user concurrent sessions
- [ ] Real OTP via Twilio SMS API
- [ ] EmailJS notifications for bookings

### Phase 3 — Advanced Features 🔜
- [ ] AI-powered prescription analysis
- [ ] Drug interaction checker
- [ ] Telemedicine video consultation
- [ ] Insurance claim processing with OCR
- [ ] Government drug surveillance ML model
- [ ] Mobile app (React Native / Flutter)

### Phase 4 — Deployment 🔜
- [ ] Vercel / Netlify deployment
- [ ] Custom domain (safescript.ai)
- [ ] HTTPS & security hardening
- [ ] PWA (Progressive Web App) support

---

## 👤 Developer

**Ayush Dham**  
📧 ayushdham405@gmail.com  
🏫 Project: SafeScript AI — Healthcare Innovation

---

## 📄 License

This project is built for educational and demonstration purposes.  
© 2026 SafeScript AI. All rights reserved.

---

> 🔑 **Quick Start**: Run `serve.ps1` → Open `http://localhost:8001` → Register with OTP `123456` → Explore your role dashboard!
