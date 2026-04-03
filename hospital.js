let currentUser = null;
let html5QrCode = null;
let canvas, ctx, painting = false, brushColor = '#1e293b', brushSize = 4;

async function sendEmailNotification(subject, message) {
    const defaultSvc = "service_0luhpsn";
    const defaultTmp = "template_q1sc05n";

    let pubKey = localStorage.getItem('safescript_emailjs_pub');
    let serviceId = localStorage.getItem('safescript_emailjs_service') || defaultSvc;
    let templateId = localStorage.getItem('safescript_emailjs_template') || defaultTmp;

    if (!pubKey || pubKey === "" || pubKey === "N/A") {
        console.warn("EmailJS Public Key missing in hospital hub.");
        return;
    }

    try {
        emailjs.init(pubKey);
        const res = await emailjs.send(serviceId, templateId, {
            to_email: "ayushdham405@gmail.com",
            subject: subject,
            message: message,
            user_name: currentUser ? (currentUser.institution || currentUser.fullName) : "Hospital Admin"
        });
        console.log("HOSPITAL MAIL SUCCESS!", res.status, res.text);
    } catch (err) {
        console.error("HOSPITAL MAIL FAILED...", err);
    }
}

        // ---------- Tab System ----------
        function switchTab(id, el) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-tab'));
            if (document.getElementById(id)) document.getElementById(id).classList.add('active-tab');
            document.querySelectorAll('.sidebar-item').forEach(btn => {
                btn.classList.remove('active');
            });
            if (el) el.classList.add('active');

            if (id === 'sos') loadSOS();
            if (id === 'inventory') loadInventory();
            if (id === 'notepad') initNotepad();
            if (id === 'staff') loadStaff();
            if (id === 'opd') loadOPD();
            if (id === 'profile') loadProfileMap();
            if (id === 'dashboard') loadDashboard();
        }

        // ---------- Profile ----------
        function loadProfile() {
            const userData = localStorage.getItem('safescript_user');
            if (userData) {
                currentUser = JSON.parse(userData);
                document.getElementById('user-display-name').innerText = (currentUser.institution || currentUser.fullName || '').split(' ')[0];
                document.getElementById('user-display-role').innerText = currentUser.role || 'Administrator';
                if (document.getElementById('prof-name')) document.getElementById('prof-name').value = currentUser.institution || currentUser.fullName || '';
                if (document.getElementById('prof-email')) document.getElementById('prof-email').value = currentUser.email || '';
                if (document.getElementById('prof-phone')) document.getElementById('prof-phone').value = currentUser.phone || '';
                if (document.getElementById('prof-gstin')) document.getElementById('prof-gstin').value = currentUser.idVal || '';
                if (currentUser.dp) {
                    document.getElementById('prof-dp').src = currentUser.dp;
                    document.getElementById('user-display-dp').src = currentUser.dp;
                    document.getElementById('prof-dp').classList.remove('hidden');
                    document.getElementById('user-display-dp').classList.remove('hidden');
                    document.getElementById('prof-dp-placeholder').classList.add('hidden');
                    document.getElementById('user-display-icon').classList.add('hidden');
                }
            }
        }

        function uploadDP(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imgData = e.target.result;
                    document.getElementById('prof-dp').src = imgData;
                    document.getElementById('user-display-dp').src = imgData;
                    document.getElementById('prof-dp').classList.remove('hidden');
                    document.getElementById('user-display-dp').classList.remove('hidden');
                    document.getElementById('prof-dp-placeholder').classList.add('hidden');
                    document.getElementById('user-display-icon').classList.add('hidden');
                    if (currentUser) { currentUser.dp = imgData; localStorage.setItem('safescript_user', JSON.stringify(currentUser)); }
                };
                reader.readAsDataURL(file);
            }
        }

        function saveProfile() {
            if (currentUser) {
                currentUser.fullName = document.getElementById('prof-name').value;
                currentUser.institution = document.getElementById('prof-name').value;
                currentUser.email = document.getElementById('prof-email').value;
                localStorage.setItem('safescript_user', JSON.stringify(currentUser));
                loadProfile();
                alert('Profile Updated Successfully!');
            }
        }

        function loadProfileMap() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    document.getElementById('gps-map').src = `https://maps.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}&z=14&output=embed`;
                });
            } else {
                document.getElementById('gps-map').src = `https://maps.google.com/maps?q=New+Delhi&z=12&output=embed`;
            }
        }

        // ---------- SOS ----------
        function loadSOS() {
            let req = JSON.parse(localStorage.getItem('safescript_sos'));
            const container = document.getElementById('sos-list');
            container.innerHTML = '';
            
            // Allow hospitals to see multiple if needed, but the main one from patient
            let queue = [];
            if(req) queue.push(req);
            
            let storedQueue = JSON.parse(localStorage.getItem('safescript_sos_queue')) || [];
            if(req && !storedQueue.find(r => r.id === req.id)) {
                storedQueue.push(req);
                localStorage.setItem('safescript_sos_queue', JSON.stringify(storedQueue));
            }
            queue = storedQueue;

            if (queue.length === 0) {
                container.innerHTML = `<div class="col-span-2 bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                    <i class="fas fa-check-circle text-4xl text-emerald-400 mb-4"></i>
                    <p class="text-slate-400 font-bold">No active SOS requests. Monitoring live.</p>
                </div>`;
                document.getElementById('stat-sos').innerText = '0';
                return;
            }
            let pending = 0;
            queue.forEach(reqObj => {
                if (reqObj.status === 'Pending') pending++;
                const isActive = reqObj.status === 'Pending';
                // GPS logic: Hospital fixed loc (demo) to patient loc
                let mapUrl = `https://maps.google.com/maps?q=${reqObj.lat},${reqObj.lon}&z=13&output=embed`;
                container.innerHTML += `
                    <div class="bg-white rounded-2xl p-6 shadow-sm border ${isActive ? 'border-red-200' : 'border-emerald-100'}">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <span class="text-[10px] font-black uppercase px-3 py-1 rounded-lg ${isActive ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}">${reqObj.status}</span>
                                <h4 class="text-lg font-black text-slate-800 mt-2">${reqObj.patientName || 'Emergency Patient'}</h4>
                                <p class="text-[10px] font-bold text-slate-400 uppercase">ID: ${reqObj.id} &bull; ${reqObj.time}</p>
                            </div>
                        </div>
                        <div class="h-36 bg-slate-50 rounded-2xl mb-4 overflow-hidden border border-slate-100">
                            <iframe src="${mapUrl}" class="w-full h-full grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"></iframe>
                        </div>
                        ${isActive ? `
                            <div class="grid grid-cols-2 gap-3">
                                <button onclick="handleSOS('${reqObj.id}', 'Approved')" class="bg-emerald-600 text-white py-3 rounded-xl font-black text-xs shadow-md hover:bg-emerald-700 transition-all">
                                    <i class="fas fa-truck-medical mr-1"></i> Dispatch Ambulance
                                </button>
                                <button onclick="handleSOS('${reqObj.id}', 'Declined')" class="bg-slate-100 text-slate-500 py-3 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all">
                                    <i class="fas fa-times mr-1"></i> Decline
                                </button>
                            </div>
                        ` : `<div class="py-3 bg-emerald-50 text-emerald-600 rounded-xl text-center font-black text-xs border border-emerald-100"><i class="fas fa-check-double mr-2"></i>Status: ${reqObj.status}</div>`}
                    </div>`;
            });
            document.getElementById('stat-sos').innerText = pending;
        }

        function handleSOS(id, status) {
            let queue = JSON.parse(localStorage.getItem('safescript_sos_queue')) || [];
            let i = queue.findIndex(r => r.id === id);
            if (i > -1) {
                queue[i].status = status;
                localStorage.setItem('safescript_sos_queue', JSON.stringify(queue));
                
                // Update specific patient SOS status sync
                let pSos = JSON.parse(localStorage.getItem('safescript_sos'));
                if(pSos && pSos.id === id) {
                    pSos.status = status;
                    localStorage.setItem('safescript_sos', JSON.stringify(pSos));
                }

                if (status === 'Approved') {
                    let alerts = parseInt(localStorage.getItem('h_alerts') || 0) + 1;
                    localStorage.setItem('h_alerts', alerts);
                    document.getElementById('stat-alerts').innerText = alerts;
                }
                loadSOS();
            }
        }

        // ---------- OPD ----------
        function loadOPD() {
            let appts = JSON.parse(localStorage.getItem('safescript_appointments')) || [];
            let mine = appts.filter(a => a.type === 'Hospital OPD');
            const tb = document.getElementById('opd-list');
            tb.innerHTML = mine.length === 0
                ? `<tr><td colspan="4" class="px-6 py-12 text-center text-slate-400 font-bold">No hospital OPD appointments.</td></tr>`
                : mine.map(a => `<tr>
                    <td class="px-6 py-4 text-blue-600 font-black">${a.id}</td>
                    <td class="px-6 py-4 text-slate-800">${a.name}<br><span class="text-[10px] text-slate-400 font-bold"><i class="fas fa-phone mr-1"></i>${a.phone}</span></td>
                    <td class="px-6 py-4 text-slate-600">${a.reason}<br><span class="text-[10px] font-bold text-blue-500">${a.date} | ${a.time}</span></td>
                    <td class="px-6 py-4 text-center flex flex-col items-center justify-center gap-2">
                        ${a.status === 'Pending' ? `
                            <button onclick="confirmAppt('${a.id}', 'Confirmed')" class="w-full bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-200">Approve</button>
                            <button onclick="confirmAppt('${a.id}', 'Rejected')" class="w-full bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-200">Reject</button>
                        ` : `
                            <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${a.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}">${a.status}</span>
                        `}
                    </td>
                </tr>`).join('');
        }

        function confirmAppt(id, status) {
            let appts = JSON.parse(localStorage.getItem('safescript_appointments')) || [];
            let i = appts.findIndex(a => a.id === id);
            if (i > -1) { 
                appts[i].status = status; 
                localStorage.setItem('safescript_appointments', JSON.stringify(appts)); 
                loadOPD(); 
                alert(`Appointment ${status}! PDF capability updated for patient.`); 
            }
        }

        // ---------- Inventory ----------
        function loadInventory() {
            let inv = JSON.parse(localStorage.getItem('h_inventory')) || [{ id: 1, name: 'Surgical Kits', qty: 340 }, { id: 2, name: 'IV Drips', qty: 8 }];
            const tb = document.getElementById('inventory-list');
            tb.innerHTML = '';
            inv.forEach(i => {
                const low = parseInt(i.qty) < 20;
                tb.innerHTML += `<tr>
                    <td class="px-6 py-4 font-semibold text-slate-800">${i.name}</td>
                    <td class="px-6 py-4 text-center font-black ${low ? 'text-rose-600' : 'text-slate-700'}">${i.qty} Units</td>
                    <td class="px-6 py-4"><span class="text-[10px] font-black uppercase px-3 py-1 rounded-lg ${low ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}">${low ? 'Low Stock' : 'Stable'}</span></td>
                    <td class="px-6 py-4 text-right"><button onclick="removeInv('${i.id}')" class="text-slate-300 hover:text-rose-500 transition-all"><i class="fas fa-trash-alt"></i></button></td>
                </tr>`;
            });
        }

        function openStockModal() { document.getElementById('stock-modal').style.display = 'flex'; }
        function closeStockModal() { document.getElementById('stock-modal').style.display = 'none'; }
        function addStock() {
            let n = document.getElementById('new-item-name').value, q = document.getElementById('new-item-qty').value;
            let statusItem = document.getElementById('new-item-status').value;
            if (!n || !q) return alert('Fill all fields');
            
            let inv = JSON.parse(localStorage.getItem('h_inventory')) || [];
            let newId = Date.now();
            inv.unshift({ id: newId, name: n, qty: q, statusField: statusItem });
            localStorage.setItem('h_inventory', JSON.stringify(inv));
            
            // Push to pharmacy orders if pending
            if(statusItem === 'Pending') {
                let pOrders = JSON.parse(localStorage.getItem('pharmacy_orders')) || [];
                pOrders.unshift({
                    id: "HREQ-" + newId,
                    patientName: "Hospital Administration",
                    phone: "N/A",
                    medName: n + " (Hospital Restock)",
                    qty: q,
                    status: "Pending",
                    time: new Date().toLocaleTimeString()
                });
                localStorage.setItem('pharmacy_orders', JSON.stringify(pOrders));
                alert('Stock added and Pharmacy request generated!');
            } else {
                alert('Stock added successfully!');
            }

            loadInventory(); closeStockModal();
            document.getElementById('new-item-name').value = ''; document.getElementById('new-item-qty').value = '';
        }
        function removeInv(id) {
            let inv = JSON.parse(localStorage.getItem('h_inventory')) || [];
            inv = inv.filter(i => i.id != id);
            localStorage.setItem('h_inventory', JSON.stringify(inv)); loadInventory();
        }

        // ---------- Notepad ----------
        function initNotepad() {
            canvas = document.getElementById('note-canvas');
            if (!canvas) return;
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            ctx = canvas.getContext('2d');
            canvas.removeEventListener('mousedown', startP); canvas.removeEventListener('mouseup', endP); canvas.removeEventListener('mousemove', drawP);
            canvas.addEventListener('mousedown', startP); canvas.addEventListener('mouseup', endP); canvas.addEventListener('mousemove', drawP);
            document.getElementById('notepad-textarea').value = localStorage.getItem('h_note_txt') || '';
            document.getElementById('notepad-textarea').oninput = (e) => localStorage.setItem('h_note_txt', e.target.value);
            const saved = localStorage.getItem('h_note_cvs');
            if (saved) { let im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0); im.src = saved; }
        }
        function startP(e) { painting = true; drawP(e); }
        function endP() { painting = false; ctx.beginPath(); if (canvas) localStorage.setItem('h_note_cvs', canvas.toDataURL()); }
        function drawP(e) {
            if (!painting) return;
            const rect = canvas.getBoundingClientRect();
            ctx.lineWidth = brushSize; ctx.lineCap = 'round'; ctx.strokeStyle = brushColor;
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        }
        function setNoteMode(m) {
            document.getElementById('note-text-container').classList.toggle('hidden', m !== 'text');
            document.getElementById('note-draw-container').classList.toggle('hidden', m !== 'draw');
            document.getElementById('note-text-btn').className = m === 'text' ? 'px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold' : 'px-4 py-2 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50';
            document.getElementById('note-draw-btn').className = m === 'draw' ? 'px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold' : 'px-4 py-2 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50';
            if (m === 'draw') setTimeout(initNotepad, 100);
        }
        function setBrush(m) {
            brushColor = m === 'eraser' ? '#ffffff' : '#1e293b'; brushSize = m === 'eraser' ? 28 : 4;
            document.getElementById('btn-brush').className = m === 'brush' ? 'w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md text-sm' : 'w-10 h-10 bg-white text-slate-400 border border-slate-200 rounded-xl flex items-center justify-center text-sm';
            document.getElementById('btn-eraser').className = m === 'eraser' ? 'w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md text-sm' : 'w-10 h-10 bg-white text-slate-400 border border-slate-200 rounded-xl flex items-center justify-center text-sm';
        }
        function clearNotepad() {
            if (confirm('Clear all notes?')) {
                document.getElementById('notepad-textarea').value = ''; localStorage.removeItem('h_note_txt');
                if (ctx && canvas) { ctx.clearRect(0, 0, canvas.width, canvas.height); localStorage.removeItem('h_note_cvs'); }
            }
        }

        // ---------- Staff ----------
        function loadStaff() {
            const list = JSON.parse(localStorage.getItem('h_staff')) || [];
            const container = document.getElementById('staff-list');
            container.innerHTML = list.length === 0 ? `<div class="col-span-3 py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 font-bold">No staff added yet. Click "Add Staff" to begin.</div>` : '';
            list.forEach((s, idx) => {
                const roleColor = s.role === 'Doctor' ? 'blue' : s.role === 'Nurse' ? 'violet' : 'slate';
                container.innerHTML += `
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-12 h-12 bg-${roleColor}-50 text-${roleColor}-600 rounded-xl flex items-center justify-center"><i class="fas fa-user-shield"></i></div>
                            <button onclick="removeStaff(${idx})" class="text-slate-300 hover:text-rose-500 transition-all"><i class="fas fa-trash-alt text-sm"></i></button>
                        </div>
                        <h5 class="font-black text-slate-800 text-lg">${s.name}</h5>
                        <span class="text-[10px] font-black text-${roleColor}-600 uppercase tracking-wider bg-${roleColor}-50 px-2 py-1 rounded-lg">${s.role}</span>
                        <div class="mt-4 pt-4 border-t border-slate-50">
                            <p class="text-[10px] font-bold text-slate-400 uppercase">Duty</p>
                            <p class="text-sm font-bold text-slate-700 mt-1">${s.duty}</p>
                        </div>
                    </div>`;
            });
        }
        function toggleStaffForm() { document.getElementById('staff-form').classList.toggle('hidden'); }
        function addStaff() {
            let n = document.getElementById('staff-name').value, r = document.getElementById('staff-role').value, d = document.getElementById('staff-duty').value;
            if (!n || !d) return alert('Fill name and duty');
            let list = JSON.parse(localStorage.getItem('h_staff')) || [];
            list.unshift({ name: n, role: r, duty: d });
            localStorage.setItem('h_staff', JSON.stringify(list));
            loadStaff();
            document.getElementById('staff-name').value = ''; document.getElementById('staff-duty').value = '';
            document.getElementById('staff-form').classList.add('hidden');
        }
        function removeStaff(i) {
            let list = JSON.parse(localStorage.getItem('h_staff')) || [];
            list.splice(i, 1); localStorage.setItem('h_staff', JSON.stringify(list)); loadStaff();
        }

        // ---------- Billing ----------
        function openBillingModal() { document.getElementById('billing-modal').style.display = 'flex'; }
        function closeBillingModal() { document.getElementById('billing-modal').style.display = 'none'; }
        function addBillRow() {
            const div = document.createElement('div'); div.className = 'grid grid-cols-12 gap-2 b-row';
            div.innerHTML = `<input type="text" placeholder="Charge" class="col-span-6 p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none f-item">
                <input type="number" placeholder="Qty" oninput="calcBill()" class="col-span-2 p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none text-center f-qty">
                <input type="number" placeholder="Price" oninput="calcBill()" class="col-span-3 p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none f-price">
                <button onclick="this.parentElement.remove(); calcBill()" class="col-span-1 text-rose-300 hover:text-rose-500"><i class="fas fa-times"></i></button>`;
            document.getElementById('bill-items-list').appendChild(div);
        }
        function calcBill() {
            let total = 0;
            document.querySelectorAll('.b-row').forEach(r => { total += (r.querySelector('.f-qty').value || 0) * (r.querySelector('.f-price').value || 0); });
            document.getElementById('bill-total').innerText = total.toFixed(2);
        }
        function confirmBill() {
            let p = document.getElementById('bill-patient').value, t = document.getElementById('bill-total').innerText;
            if (!p || t === '0.00') return alert('Patient name and charges required');
            let bills = JSON.parse(localStorage.getItem('h_bills')) || [];
            bills.unshift({ id: Date.now(), patient: p, amount: t, date: new Date().toLocaleDateString() });
            localStorage.setItem('h_bills', JSON.stringify(bills));
            
            sendEmailNotification("Hospital Invoice Generated", `A new bill for Patient: ${p} of amount ₹${t} was generated by ${currentUser ? currentUser.institution : 'Hospital'}.`);
            
            closeBillingModal(); loadDashboard(); alert('Invoice saved!');
        }

        // ---------- Dashboard ----------
        function loadDashboard() {
            let bills = JSON.parse(localStorage.getItem('h_bills')) || [];
            let total = bills.reduce((s, b) => s + parseFloat(b.amount), 0);
            document.getElementById('stat-revenue').innerText = '₹' + total.toFixed(2);
            document.getElementById('stat-alerts').innerText = localStorage.getItem('h_alerts') || 0;
            document.getElementById('stat-scans').innerText = localStorage.getItem('h_scs') || 0;
            let sos = JSON.parse(localStorage.getItem('safescript_sos_queue')) || [];
            document.getElementById('stat-sos').innerText = sos.filter(s => s.status === 'Pending').length;
            const tb = document.getElementById('invoice-list');
            tb.innerHTML = bills.length === 0 ? `<tr><td colspan="4" class="px-6 py-8 text-center text-slate-400 font-bold">No invoices yet.</td></tr>` :
                bills.slice(0, 6).map(b => `<tr>
                    <td class="px-6 py-4 font-semibold text-slate-800">${b.patient}</td>
                    <td class="px-6 py-4 text-slate-500">${b.date}</td>
                    <td class="px-6 py-4"><span class="text-[10px] font-black uppercase px-3 py-1 rounded-xl bg-emerald-50 text-emerald-600">PAID</span></td>
                    <td class="px-6 py-4 text-right flex items-center justify-end gap-3">
                        <span class="font-black text-slate-800">₹${b.amount}</span>
                        <button onclick="downloadHospBill('${b.patient}', '${b.amount}', '${b.date}')" class="text-blue-600 hover:text-blue-700 bg-blue-50 p-2 rounded-lg" title="Download PDF"><i class="fas fa-file-pdf"></i></button>
                    </td>
                </tr>`).join('');
        }

        function downloadHospBill(patient, amount, date) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFillColor(37, 99, 235); // Blue 600
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("SafeScript AI - HOSPITAL INVOICE", 15, 25);
            
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(12);
            doc.text(`Patient: ${patient}`, 15, 55);
            doc.text(`Date: ${date}`, 15, 65);
            
            doc.setFontSize(16);
            doc.text(`Total Amount Paid: Rs. ${amount}`, 15, 85);

            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text("Authorized by Hospital Administration.", 15, 110);
            doc.text("This receipt is verified digitally.", 15, 115);

            doc.save(`Invoice_${patient.replace(/\s+/g,'_')}.pdf`);
        }

        // ---------- Scanner ----------
        function openScanner() {
            document.getElementById('scanner-modal').style.display = 'flex';
            if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");
            html5QrCode.start({ facingMode: "environment" }, { fps: 15, qrbox: 250 }, txt => {
                let scs = parseInt(localStorage.getItem('h_scs') || 0) + 1;
                localStorage.setItem('h_scs', scs);
                document.getElementById('stat-scans').innerText = scs;
                alert('QR Detected: ' + txt);
                closeScanner();
            }).catch(() => {});
        }
        function closeScanner() {
            if (html5QrCode && html5QrCode.isScanning) html5QrCode.stop();
            document.getElementById('scanner-modal').style.display = 'none';
        }

        function logout() {
            if (confirm('Are you sure you want to logout?')) window.location.href = 'login.html';
        }

        // ---------- Live Bed Sync ----------
        function syncBedInventory() {
            const totalBeds = 120;
            // Floor distribution limits
            const floors = [
                { id: "floor-0-stats", max: 20 }, // ICU
                { id: "floor-1-stats", max: 50 }, // General
                { id: "floor-2-stats", max: 50 }  // Surgical
            ];

            let currentTotalOccupied = 0;

            floors.forEach(f => {
                const el = document.getElementById(f.id);
                if(el) {
                    // Randomly fluctuate occupied beds per floor
                    let occ = Math.floor(Math.random() * (f.max + 1));
                    el.innerHTML = `<i class="fas fa-bed"></i> ${occ}/${f.max}`;
                    currentTotalOccupied += occ;
                }
            });

            // Update main dashboard counters
            const availEl = document.getElementById('beds-avail');
            const occEl = document.getElementById('beds-occ');
            
            if(availEl && occEl) {
                occEl.innerText = currentTotalOccupied;
                availEl.innerText = totalBeds - currentTotalOccupied;
                
                // Visual feedback of change
                occEl.classList.add('scale-110', 'text-rose-500');
                availEl.classList.add('scale-110', 'text-emerald-500');
                setTimeout(() => {
                    occEl.classList.remove('scale-110', 'text-rose-500');
                    availEl.classList.remove('scale-110', 'text-emerald-500');
                }, 1000);
            }
        }

        // ---------- Init ----------
        window.onload = function () {
            loadProfile();
            loadDashboard();
            syncBedInventory(); // Load initial state
            setInterval(loadSOS, 5000); // Sync SOS every 5s
            setInterval(syncBedInventory, 5000); // Sync Beds every 5s
        };
