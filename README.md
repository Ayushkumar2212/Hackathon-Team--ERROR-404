# 🏥 SafeScript AI — Advanced Healthcare Audit System

> **A complete, role-based AI-powered healthcare management platform** built as a static web application. It connects Patients, Hospitals, Clinics, Pharmacies, Insurance Companies, and Government Health Bodies in a unified, secure digital ecosystem.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Running Locally](#-running-locally)
- [New: AI Features](#-new-ai-features)
- [Features by Role](#-features-by-role)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Data Storage](#-data-storage)
- [Developer](#-developer)
- [License](#-license)

---

## 🌐 Project Overview

**SafeScript AI** is a healthcare platform that digitizes prescription management, real-time emergency response (SOS), OPD bookings, pharmacy ordering, hospital billing, insurance management, and government-level drug surveillance — all without requiring a backend server.

**Key Pillars:**

- 🔐 **Role-Based Access Control** — Each user type sees only their dashboard
- 🗺️ **GPS-Tagged Registration** — Institutions are verified with real-time geolocation
- 🤖 **AI-Driven Operations** — Voice commands, smart scanners, and automated billing
- 🚑 **Live SOS System** — Patient triggers emergency → Hospital dispatches ambulance
- 💊 **End-to-End Prescription Flow** — Clinic writes Rx → Pharmacy fills → Patient receives

---

## 🚀 Running Locally (Windows)

We use a high-performance PowerShell server for local development.

```powershell
# Step 1: Open PowerShell in the project folder
# Step 2: Run the primary server (recommended)
powershell -ExecutionPolicy Bypass -File .\serve_8050.ps1

# Step 3: Open your browser and go to:
# http://localhost:8050
```

**Alternative Ports:**

- `serve.ps1` (Port 8030)
- `serve_alt.ps1` (Port 8040)

**Demo OTP:** `123456`

---

## 🤖 New: AI Features

### 🎙️ AI Command Center (Hospital Portal)

A floating AI assistant enabled by the **Web Speech API**.

- **Voice Navigation:** "Open Dashboard", "Show SOS", "Go to Inventory".
- **Quick Actions:** "New Bill", "Open Scanner", "Scroll Down".
- **Interactive Overlay:** Real-time transcript visualization.

### 🔍 Enhanced AI QR Scanner

Found in Hospital and Pharmacy portals.

- **Demo Mode:** Generates random medicine data (Name, Brand, Batch, MFG, EXP).
- **Manual Verification:** Fallback trigger if camera usage is not possible.
- **Link Detection:** Automatically identifies URLs in QR codes and provides a "Visit Link" button inside the AI results modal.

---

## ✨ Features by Role

### 🏥 Hospital Portal (`hospital.html`)

| Component             | Features                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| **AI Command Center** | **Voice-controlled navigation** and action execution.                    |
| **SOS Dashboard**     | Live emergency monitoring with patient GPS mapping & ambulance dispatch. |
| **Smart Billing**     | AI-assisted invoice generation with PDF export & email mirroring.        |
| **OPD Matrix**        | Manage and verify patient appointments.                                  |
| **Inventory & Staff** | Smart supply tracking + **Staff Portal Chat** for team communication.    |
| **Digital Notepad**   | Text-based clinical notes & cross-platform drawing canvas.               |
| **Bed Management**    | **Live Bed Inventory Survey** — Broadcast available beds per floor/room. |

---

### 👨‍⚕️ Clinic Portal (`client.html`)

- **Digital Rx Pad:** Create prescriptions with dosage and instructions.
- **Pharmacy Submission:** Direct link to pharmacy inventory for fulfillments.
- **OPD Queue:** View and manage clinic appointments.

---

### 💊 Pharmacy Portal (`pharmacy.html`)

- **Order Lifecycle:** Process patient/clinic orders from "Pending" to "Delivered".
- **Stock Control:** Maintain medicine inventory with low-stock alerts.
- **AI Scanner:** Identify medicines and process billing quickly.

---

### 🧑‍🦱 Patient Portal (`patient.html`)

- **One-Tap SOS:** Instant emergency alert with location sharing.
- **Booking Engine:** Conflict-free appointment slots at nearby facilities.
- **Medicine Store:** Order prescriptions and track delivery in real-time.
- **Health Vault:** Document storage with secure local encryption simulation.

---

## 🛠️ Deep Tech Stack

SafeScript AI uses a **Serverless Static Architecture** where all AI logic and data persistence happen directly in the browser.

### 🎨 Frontend & Design

| Tech                  | Usage                                         |
| --------------------- | --------------------------------------------- |
| **HTML5**             | Semantic structure & modern web standards     |
| **Tailwind CSS**      | Premium glassmorphism UI & responsive layouts |
| **Vanilla JS (ES6+)** | Core application logic & state management     |
| **Font Awesome 6**    | Pro-grade medical & navigational icons        |
| **Plus Jakarta Sans** | Modern typography (Google Fonts)              |

### ⚙️ Persistence & "Backend" Logic

| Tech                   | Usage                                         |
| ---------------------- | --------------------------------------------- |
| **localStorage API**   | Browser-based NoSQL-style data persistence    |
| **JSON**               | Data serialization for roles and inventory    |
| **PowerShell (.NET)**  | High-performance local dev server (Port 8050) |
| **Role-Based Routing** | Logic-based portal access control             |

### 🤖 Special AI & System APIs

| Tech                  | Usage                                            |
| --------------------- | ------------------------------------------------ |
| **Web Speech API**    | Voice-to-Command AI engine (`SpeechRecognition`) |
| **html5-qrcode**      | Real-time computer vision for medicine scanning  |
| **jsPDF / AutoTable** | Client-side report & invoice PDF generation      |
| **EmailJS SDK**       | Automated PDF mirroring to supervisor email      |
| **HTML5 Canvas API**  | Digital clinical sketching & signature capture   |
| **Google Maps API**   | Live GPS-tagged SOS and facility mapping         |

---

## 💾 Data Storage

| Key                       | Contains                         |
| ------------------------- | -------------------------------- |
| `safescript_sos_queue`    | SOS emergency requests           |
| `safescript_appointments` | OPD bookings                     |
| `pharmacy_orders`         | Rx fulfillment requests          |
| `h_bed_inv`               | Live hospital bed data           |
| `h_staff_chat`            | Internal hospital communications |
| `h_inventory`             | Medical supply lists             |
| `h_bills`                 | Billing and invoice history      |
| `safescript_insurance_history` | Insurance claims audit registry |
| `insurance_dataset.csv`   | Actuarial data source for analysis |

---

## 👤 Team & Developer

**Hackathon Team ERROR-404**
**Ayush Kumar**  
📧 ayushdham405@gmail.com  
🏫 Project: SafeScript AI — Healthcare Innovation

---

## 📄 License

© 2026 SafeScript AI. All rights reserved. Built for educational innovation.
