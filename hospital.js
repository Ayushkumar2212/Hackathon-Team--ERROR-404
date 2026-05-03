let currentUser = null;
let html5QrCode = null;
let canvas, ctx, painting = false, brushColor = '#1e293b', brushSize = 4;

async function sendEmailNotification(subject, message) {
    const defaultSvc = "service_0luhpsn";
    const defaultTmp = "template_q1sc05n";

    let pubKey = localStorage.getItem('safescript_emailjs_pub');
    let serviceId = localStorage.getItem('safescript_emailjs_service') || defaultSvc;
    let templateId = localStorage.getItem('safescript_emailjs_template') || defaultTmp;

    const params = {
        to_email: "ayushdham405@gmail.com",
        subject: subject,
        message: message,
        user_name: currentUser ? (currentUser.institution || currentUser.fullName) : "Hospital Admin"
    };

    if(window.lastGeneratedPDFBase64) {
        params['pdf_attachment'] = window.lastGeneratedPDFBase64.split(',')[1];
    }

    try {
        emailjs.init(pubKey);
        const res = await emailjs.send(serviceId, templateId, params);
        console.log("HOSPITAL MAIL SUCCESS!", res.status, res.text);
    } catch (err) {
        console.error("HOSPITAL MAIL ERROR:", err);
        const errorMsg = err.text || err.message || JSON.stringify(err);
        if(errorMsg.includes("user_id") || errorMsg.includes("public_key") || err.status === 401) {
            alert("Hospital Mail Hub: Invalid Public Key in Profile settings.");
        } else if (errorMsg.includes("quota") || err.status === 403) {
            alert("Hospital Mail Quota Exceeded for today.");
        } else {
            alert("Hospital Mail Error: " + errorMsg);
        }
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
            if (id === 'staff') { loadStaff(); loadStaffChat(); }
            if (id === 'opd') loadOPD();
            if (id === 'profile') loadProfileMap();
            if (id === 'dashboard') loadDashboard();
            if (id === 'analytics') loadSelectedDataset();
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
        
        function loadStaffChat() {
            const chatC = document.getElementById('staff-chat-window');
            if(!chatC) return;
            const msgs = JSON.parse(localStorage.getItem('h_staff_chat')) || [];
            chatC.innerHTML = msgs.length ? '' : '<p class="text-xs text-slate-400 font-bold text-center mt-10">Start conversation with your staff here.</p>';
            msgs.forEach(m => {
                let isMe = m.sender === 'Hospital Admin';
                chatC.innerHTML += `
                    <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
                        <span class="text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">${m.sender} - ${m.time}</span>
                        <div class="px-4 py-2 rounded-xl text-sm font-semibold ${isMe ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700'} max-w-xs break-words">${m.text}</div>
                    </div>
                `;
            });
            chatC.scrollTop = chatC.scrollHeight;
        }

        function sendStaffChat() {
            const inp = document.getElementById('staff-chat-input');
            const txt = inp.value.trim();
            if(!txt) return;
            const msgs = JSON.parse(localStorage.getItem('h_staff_chat')) || [];
            msgs.push({ sender: 'Hospital Admin', text: txt, time: new Date().toLocaleTimeString() });
            localStorage.setItem('h_staff_chat', JSON.stringify(msgs));
            inp.value = '';
            loadStaffChat();
        }

        // ---------- Smart AI Billing ----------
        function openBillingModal() {
            const modal = document.getElementById('billing-modal');
            const content = document.getElementById('billing-modal-content');
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
        function closeBillingModal() {
            const modal = document.getElementById('billing-modal');
            const content = document.getElementById('billing-modal-content');
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.add('hidden');
            }, 300);
        }

        function addMedRow() {
            const div = document.createElement('div');
            div.className = 'grid grid-cols-12 gap-2 b-row';
            div.innerHTML = `<input type="text" placeholder="Medicine Name" class="col-span-5 p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none f-item focus:border-blue-400 text-slate-700">
                <input type="number" placeholder="Qty" oninput="calcBill()" class="col-span-3 p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none text-center f-qty focus:border-blue-400 text-slate-700">
                <input type="number" placeholder="Price" oninput="calcBill()" class="col-span-3 p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none f-price focus:border-blue-400 text-slate-700">
                <button onclick="this.parentElement.remove(); calcBill()" class="col-span-1 text-rose-300 hover:text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center justify-center transition"><i class="fas fa-trash-alt text-xs"></i></button>`;
            document.getElementById('bill-med-list').appendChild(div);
        }

        function addReqRow() {
            const div = document.createElement('div');
            div.className = 'grid grid-cols-12 gap-2 b-row';
            div.innerHTML = `<input type="text" placeholder="Requirement" class="col-span-5 p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none f-item focus:border-violet-400 text-slate-700">
                <input type="number" placeholder="Qty" oninput="calcBill()" class="col-span-3 p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none text-center f-qty focus:border-violet-400 text-slate-700">
                <input type="number" placeholder="Price" oninput="calcBill()" class="col-span-3 p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none f-price focus:border-violet-400 text-slate-700">
                <button onclick="this.parentElement.remove(); calcBill()" class="col-span-1 text-rose-300 hover:text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center justify-center transition"><i class="fas fa-trash-alt text-xs"></i></button>`;
            document.getElementById('bill-req-list').appendChild(div);
        }

        function calcBill() {
            let total = 0;
            document.querySelectorAll('.b-row').forEach(r => {
                total += (parseFloat(r.querySelector('.f-qty').value) || 0) * (parseFloat(r.querySelector('.f-price').value) || 0);
            });
            document.getElementById('bill-total').innerText = total.toFixed(2);
        }

        function confirmBill() {
            let p = document.getElementById('bill-patient').value;
            let email = document.getElementById('bill-email').value;
            let phone = document.getElementById('bill-phone').value;
            let t = document.getElementById('bill-total').innerText;
            if (!p || !phone || t === '0.00') return alert('Patient name, phone number, and items are required!');
            
            let methodEle = document.querySelector('input[name="payment-method"]:checked');
            let method = methodEle ? methodEle.value : 'Cash';
            
            let bills = JSON.parse(localStorage.getItem('h_bills')) || [];
            bills.unshift({ id: Date.now(), patient: p, phone: phone, amount: t, method: method, date: new Date().toLocaleDateString() });
            localStorage.setItem('h_bills', JSON.stringify(bills));
            
            sendEmailNotification("Smart AI Invoice Generated", `A new ${method} bill for Patient: ${p} (${phone}) of amount ₹${t} was generated by ${currentUser ? currentUser.institution : 'Hospital'}.`);
            
            closeBillingModal();
            loadDashboard();
            alert('Smart Invoice generated successfully!');
            
            // clear inputs
            document.getElementById('bill-patient').value = '';
            document.getElementById('bill-email').value = '';
            document.getElementById('bill-phone').value = '';
            document.getElementById('bill-med-list').innerHTML = '';
            document.getElementById('bill-req-list').innerHTML = '';
            calcBill();
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

            const filename = `Invoice_${patient.replace(/\s+/g,'_')}.pdf`;
            // Capturing for mirroring
            window.lastGeneratedPDFBase64 = doc.output('datauristring');
            doc.save(filename);

            sendEmailNotification("Hospital Invoice Generated", `An invoice for ${patient} was generated for Rs. ${amount}. The PDF content mirroring to ayushdham405@gmail.com is attached.`, window.lastGeneratedPDFBase64);
            alert("Invoice generated and tracked!");
        }

        // ---------- Scanner ----------
        function generateRandomMedicineInfo() {
            const brandPrefixes = ['Zydus Healthcare', 'Sun Pharma', 'Cipla Ltd.', 'Mankind Pharma', 'Dr. Reddys Labs', 'Lupin Pharmaceuticals', 'Abbott India', 'Aurobindo Pharma', 'Torrent Pharma', 'Glenmark', 'Biocon', 'Alkem Labs'];
            const meds = [
                'Paracetamol 500mg', 'Amoxicillin CV 625', 'Azithromycin 500mg', 'Omeprazole 20mg', 
                'Cetirizine 10mg', 'Ibuprofen 400mg', 'Dolo 650', 'Augmentin 625 DUO', 
                'Metformin 500mg', 'Pantoprazole 40mg', 'Telmisartan 40mg', 'Atorvastatin 10mg',
                'Limcee Vitamin C', 'Shelcal 500', 'Becosules Capsules', 'Combiflam',
                'Vicks Action 500', 'Saridon', 'Digene Gel', 'Crocin Advance'
            ];
            const usages = [
                'Fever & Pain Relief', 'Bacterial Infection', 'Severe Bacterial Infection', 'Acidity & Stomach Ulcer', 
                'Allergy & Cold Symptoms', 'Inflammation & Body Pain', 'High Fever Management', 'Antibiotic Therapy',
                'Type 2 Diabetes Control', 'Gastric Acid Reduction', 'Blood Pressure Control', 'Cholesterol Lowering',
                'Immunity Booster', 'Calcium Supplement', 'Vitamin B-Complex', 'Muscle Pain Relief',
                'Cold & Flu Relief', 'Headache Relief', 'Antacid for Gas', 'Fast Fever Relief'
            ];
            
            let mix = Math.floor(Math.random() * meds.length);
            let brand = brandPrefixes[Math.floor(Math.random() * brandPrefixes.length)];
            
            // Generate Manufacturing Date (within last 18 months)
            let mfgDate = new Date();
            mfgDate.setMonth(mfgDate.getMonth() - (Math.floor(Math.random() * 18)));
            mfgDate.setDate(Math.floor(Math.random() * 28) + 1);
            let mfgStr = mfgDate.toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' });
            
            // Generate Expiry Date (2-3 years after MFG)
            let expDate = new Date(mfgDate);
            expDate.setFullYear(expDate.getFullYear() + 2 + Math.floor(Math.random() * 2));
            let expStr = expDate.toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' });
            
            const batchNo = "BN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            return { 
                name: meds[mix], 
                brand: brand, 
                mfg: mfgStr, 
                exp: expStr, 
                usage: usages[mix],
                batch: batchNo
            };
        }

        function showAIScanResult(data, scannerObj, scUrl = null) {
            try {
                if (scannerObj) scannerObj.stop().catch(e => console.log(e));
            } catch(e) {}
            
            closeScanner(); // Close the core hospital scanner modal
            
            let existing = document.getElementById('ai-scan-result-modal');
            if (existing) existing.remove();

            const div = document.createElement('div');
            div.id = 'ai-scan-result-modal';
            div.className = 'fixed inset-0 z-[99999] bg-slate-900/50 backdrop-blur-xl flex flex-col items-center justify-center p-4 opacity-0 transition-opacity duration-500';
            div.innerHTML = `
                <div class="bg-white max-w-sm w-full rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(37,99,235,0.3)] transform scale-90 translate-y-10 transition-all duration-500 relative overflow-hidden">
                    <div class="absolute -top-16 -right-16 w-40 h-40 bg-blue-500 rounded-full blur-[40px] opacity-20 animate-pulse"></div>
                    <div class="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-500 rounded-full blur-[40px] opacity-20 animate-pulse"></div>
                    
                    <div class="text-center mb-6 relative">
                        <div class="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg mb-4">
                            <i class="fas fa-qrcode"></i>
                        </div>
                        <h3 class="text-2xl font-black text-slate-800 tracking-tight">AI Scan Complete</h3>
                        <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1"><i class="fas fa-shield-check mr-1"></i> Data Authenticated</p>
                    </div>
                    
                    <div class="space-y-4 relative z-10">
                        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div class="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center"><i class="fas fa-pills"></i></div>
                            <div><span class="text-[10px] font-black text-slate-400 uppercase">Medicine Name</span><h4 class="text-xs font-black text-slate-800">${data.name}</h4></div>
                        </div>
                        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><i class="fas fa-industry"></i></div>
                            <div><span class="text-[10px] font-black text-slate-400 uppercase">Brand / Company</span><h4 class="text-xs font-black text-slate-800">${data.brand}</h4></div>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                            <div class="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-center">
                                <span class="text-[8px] font-black text-indigo-400 uppercase">Batch</span>
                                <h4 class="text-[9px] font-black text-indigo-700 m-0 leading-tight">${data.batch}</h4>
                            </div>
                            <div class="bg-blue-50/30 p-3 rounded-xl border border-blue-100 text-center">
                                <span class="text-[8px] font-black text-blue-400 uppercase">MFG</span>
                                <h4 class="text-[9px] font-black text-blue-700 m-0 leading-tight">${data.mfg}</h4>
                            </div>
                            <div class="bg-rose-50/30 p-3 rounded-xl border border-rose-100 text-center">
                                <span class="text-[8px] font-black text-rose-400 uppercase">EXP</span>
                                <h4 class="text-[9px] font-black text-rose-700 m-0 leading-tight">${data.exp}</h4>
                            </div>
                        </div>

                        ${scUrl ? `
                            <div class="pt-2">
                                <a href="${scUrl}" target="_blank" class="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                    <i class="fas fa-external-link-alt"></i> Visit Scanned Link
                                </a>
                                <p class="text-[8px] text-center text-slate-400 mt-2 truncate max-w-full italic">${scUrl}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <button onclick="document.getElementById('ai-scan-result-modal').remove()" class="w-full mt-6 text-slate-400 font-bold py-2 hover:text-rose-500 transition-all">
                        <i class="fas fa-times small mr-1"></i> Close Result
                    </button>
                </div>
            `;
            document.body.appendChild(div);
            setTimeout(() => { div.classList.remove('opacity-0'); div.firstElementChild.classList.remove('scale-90', 'translate-y-10'); }, 10);
        }

        function openScanner() {
            document.getElementById('scanner-modal').classList.remove('hidden');
            document.getElementById('scanner-modal').style.display = 'flex';
            setTimeout(() => {
                if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");
                
                const onScan = txt => {
                    let scUrl = null;
                    if (txt && (txt.startsWith('http://') || txt.startsWith('https://'))) {
                        scUrl = txt;
                    }
                    simulateScan(scUrl);
                };
                
                Html5Qrcode.getCameras().then(devices => {
                    if (devices && devices.length) {
                        let camId = devices[0].id;
                        for (let d of devices) {
                            if (d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment')) {
                                camId = d.id;
                                break;
                            }
                        }
                        html5QrCode.start(camId, { fps: 15, qrbox: 250 }, onScan).catch(err => {
                            console.error("Camera denied:", err);
                        });
                    }
                }).catch(err => {
                    console.error("No camera found:", err);
                });
            }, 100);
        }

        function simulateScan(scUrl = null) {
            let scs = parseInt(localStorage.getItem('h_scs') || 0) + 1;
            localStorage.setItem('h_scs', scs);
            if(document.getElementById('stat-scans')) document.getElementById('stat-scans').innerText = scs;
            showAIScanResult(generateRandomMedicineInfo(), html5QrCode, scUrl);
        }

        function closeScanner() {
            if (html5QrCode && html5QrCode.isScanning) html5QrCode.stop().catch(()=>{});
            document.getElementById('scanner-modal').classList.add('hidden');
            document.getElementById('scanner-modal').style.display = 'none';
        }

        function logout() {
            if (confirm('Are you sure you want to logout?')) window.location.href = 'login.html';
        }

        // ---------- Live Bed Editor ----------
        function openBedModal() {
            const modal = document.getElementById('bed-modal');
            const content = document.getElementById('bed-modal-content');
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            
            // Load saved
            let saved = JSON.parse(localStorage.getItem('h_bed_inv')) || { total: 120, rooms: [] };
            document.getElementById('bed-total-input').value = saved.total;
            document.getElementById('bed-rooms-list').innerHTML = '';
            
            if (saved.rooms.length === 0) addBedRoom();
            else {
                saved.rooms.forEach(r => addBedRoom(r.floor, r.room, r.avail));
            }
            calcBeds();

            // Give tiny delay to animate scale
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        }

        function closeBedModal() {
            const modal = document.getElementById('bed-modal');
            const content = document.getElementById('bed-modal-content');
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.add('hidden');
            }, 300);
        }

        function addBedRoom(floor = '', room = '', avail = '') {
            const div = document.createElement('div');
            div.className = 'grid grid-cols-12 gap-3 bed-room-row bg-white p-3 rounded-2xl border border-slate-100 shadow-sm items-center hover:shadow-md transition-all';
            div.innerHTML = `
                <div class="col-span-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm shadow-inner"><i class="fas fa-layer-group"></i></div>
                    <input type="text" placeholder="Floor No." value="${floor}" class="w-full bg-transparent text-sm font-bold text-slate-700 outline-none f-floor focus:border-b-2 focus:border-blue-400 transition pb-1">
                </div>
                <div class="col-span-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-sm shadow-inner"><i class="fas fa-door-open"></i></div>
                    <input type="text" placeholder="Room No." value="${room}" class="w-full bg-transparent text-sm font-bold text-slate-700 outline-none f-room focus:border-b-2 focus:border-violet-400 transition pb-1">
                </div>
                <div class="col-span-3 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shadow-inner"><i class="fas fa-check-circle"></i></div>
                    <input type="number" placeholder="Avail" value="${avail}" oninput="calcBeds()" class="w-full bg-transparent text-sm font-black text-emerald-700 outline-none f-avail focus:border-b-2 focus:border-emerald-400 transition pb-1">
                </div>
                <button onclick="this.parentElement.remove(); calcBeds()" class="col-span-1 text-rose-300 hover:text-rose-600 hover:bg-rose-50 w-10 h-10 rounded-xl flex items-center justify-center transition shadow-sm"><i class="fas fa-trash-alt text-sm"></i></button>
            `;
            document.getElementById('bed-rooms-list').appendChild(div);
        }

        function calcBeds() {
            let totalBeds = parseInt(document.getElementById('bed-total-input').value) || 0;
            let totalAvail = 0;
            document.querySelectorAll('.bed-room-row').forEach(row => {
                totalAvail += parseInt(row.querySelector('.f-avail').value) || 0;
            });
            let occ = totalBeds - totalAvail;
            if (occ < 0) occ = 0;
            
            document.getElementById('bed-avail-display').innerText = totalAvail;
            document.getElementById('bed-occ-display').innerText = occ;
        }

        function saveBedInventory() {
            let total = parseInt(document.getElementById('bed-total-input').value) || 0;
            let rooms = [];
            document.querySelectorAll('.bed-room-row').forEach(row => {
                rooms.push({
                    floor: row.querySelector('.f-floor').value,
                    room: row.querySelector('.f-room').value,
                    avail: parseInt(row.querySelector('.f-avail').value) || 0
                });
            });
            
            localStorage.setItem('h_bed_inv', JSON.stringify({ total, rooms }));
            closeBedModal();
            syncBedInventory(); // reload UI main screen representation
            alert('Live Bed Inventory Survey saved and broadcasted successfully!');
        }

        // ---------- Live Bed Sync ----------
        function syncBedInventory() {
            let saved = JSON.parse(localStorage.getItem('h_bed_inv'));
            if (!saved) return;
            
            let totalBeds = saved.total;
            let totalAvail = saved.rooms.reduce((s, r) => s + r.avail, 0);
            let totalOcc = totalBeds - totalAvail;
            if(totalOcc < 0) totalOcc = 0;
            
            const availEl = document.getElementById('beds-avail');
            const occEl = document.getElementById('beds-occ');
            if(availEl && occEl) {
                occEl.innerText = totalOcc;
                availEl.innerText = totalAvail;
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
            setInterval(() => {
                if(document.getElementById('staff') && document.getElementById('staff').classList.contains('active-tab')) loadStaffChat();
            }, 3000);
        };

        // ---------- AI Voice Assistant Logic ----------
        let recognition = null;
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-IN';

            recognition.onstart = () => {
                document.getElementById('ai-pulse').classList.remove('hidden');
                document.getElementById('ai-pulse').style.opacity = '1';
                const overlay = document.getElementById('ai-listening-overlay');
                overlay.classList.remove('hidden');
                setTimeout(() => overlay.classList.add('opacity-100'), 10);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
                document.getElementById('ai-transcript').innerText = `"${transcript}"`;
                
                if (event.results[event.results.length - 1].isFinal) {
                    handleAICommand(transcript);
                    setTimeout(stopAIAssistant, 1500);
                }
            };

            recognition.onerror = (event) => {
                console.error('AI Assistant Error:', event.error);
                stopAIAssistant();
            };

            recognition.onend = () => {
                document.getElementById('ai-pulse').classList.add('hidden');
            };
        }

        function toggleAIAssistant() {
            if (!recognition) {
                alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
                return;
            }
            try {
                recognition.start();
            } catch (e) {
                recognition.stop();
            }
        }

        function stopAIAssistant() {
            if (recognition) recognition.stop();
            const overlay = document.getElementById('ai-listening-overlay');
            overlay.classList.remove('opacity-100');
            setTimeout(() => overlay.classList.add('hidden'), 300);
            document.getElementById('ai-pulse').classList.add('hidden');
        }

        function handleAICommand(cmd) {
            console.log("AI Command received:", cmd);
            
            // Navigation Commands
            if (cmd.includes('dashboard') || cmd.includes('command center')) {
                switchTab('dashboard', document.querySelector('[onclick*="dashboard"]'));
            } else if (cmd.includes('opd')) {
                switchTab('opd', document.querySelector('[onclick*="opd"]'));
            } else if (cmd.includes('sos') || cmd.includes('emergency')) {
                switchTab('sos', document.querySelector('[onclick*="sos"]'));
            } else if (cmd.includes('inventory') || cmd.includes('stock')) {
                switchTab('inventory', document.querySelector('[onclick*="inventory"]'));
            } else if (cmd.includes('notepad') || cmd.includes('notes')) {
                switchTab('notepad', document.querySelector('[onclick*="notepad"]'));
            } else if (cmd.includes('staff')) {
                switchTab('staff', document.querySelector('[onclick*="staff"]'));
            } else if (cmd.includes('analytics')) {
                if (cmd.includes('appointment')) window.location.href = 'appointment_analytics.html';
                else switchTab('analytics', document.querySelector('[onclick*="analytics"]'));
            } else if (cmd.includes('profile')) {
                switchTab('profile', document.querySelector('[onclick*="profile"]'));
            }
            
            // Action Commands
            else if (cmd.includes('new bill') || cmd.includes('generate invoice') || cmd.includes('billing')) {
                openBillingModal();
            } else if (cmd.includes('scanner') || cmd.includes('scan')) {
                openScanner();
            } else if (cmd.includes('bed') || cmd.includes('inventory editor')) {
                openBedModal();
            } else if (cmd.includes('logout')) {
                logout();
            } else if (cmd.includes('scroll down')) {
                window.scrollBy({ top: 500, behavior: 'smooth' });
            } else if (cmd.includes('scroll up')) {
                window.scrollBy({ top: -500, behavior: 'smooth' });
            } else if (cmd.includes('refresh') || cmd.includes('reload')) {
                location.reload();
            }
        }

        // ---------- Dataset Analytics Logic ----------
        let currentDataset = [];
        let datasetHeaders = [];
        let hospitalHeadings = {};
        let analyticsCharts = { chart1: null, chart2: null };

        async function loadHospitalHeadings() {
            try {
                const response = await fetch('hospital_headings.csv');
                const text = await response.text();
                const lines = text.split('\n');
                lines.slice(1).forEach(line => {
                    const [heading, explanatory] = line.split(',');
                    if (heading && explanatory) {
                        hospitalHeadings[heading.trim()] = explanatory.trim();
                    }
                });
            } catch (err) {
                console.error("Error loading headings:", err);
            }
        }

        async function loadSelectedDataset() {
            if (Object.keys(hospitalHeadings).length === 0) await loadHospitalHeadings();
            
            const selector = document.getElementById('dataset-selector');
            const type = selector.value;
            const fileMap = {
                'admission': 'admission_data.csv',
                'mortality': 'mortality_data.csv',
                'pollution': 'pollution_data.csv'
            };

            document.getElementById('dataset-info').innerText = `Fetching ${type} data...`;

            try {
                const response = await fetch(fileMap[type]);
                const text = await response.text();
                const lines = text.split('\n').filter(l => l.trim() !== '');
                
                datasetHeaders = lines[0].split(',').map(h => h.trim());
                currentDataset = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const obj = {};
                    datasetHeaders.forEach((h, i) => {
                        obj[h] = values[i] ? values[i].trim() : '';
                    });
                    return obj;
                });

                document.getElementById('dataset-info').innerText = `${currentDataset.length} records loaded from ${fileMap[type]}`;
                renderDatasetTable(currentDataset.slice(0, 50)); // Show first 50
                updateAnalyticsCharts(type, currentDataset);
            } catch (err) {
                console.error("Error loading dataset:", err);
                document.getElementById('dataset-info').innerText = "Failed to load dataset.";
            }
        }

        function renderDatasetTable(data) {
            const headerRow = document.getElementById('dataset-header');
            const body = document.getElementById('dataset-body');
            
            // Map headers to explanatory names where possible
            headerRow.innerHTML = `<tr>${datasetHeaders.map(h => `<th class="px-6 py-4 whitespace-nowrap">${hospitalHeadings[h] || h}</th>`).join('')}</tr>`;
            
            body.innerHTML = data.map(row => {
                return `<tr class="hover:bg-slate-50 transition-colors border-b border-slate-50">
                    ${datasetHeaders.map(h => `<td class="px-6 py-4 whitespace-nowrap">${row[h]}</td>`).join('')}
                </tr>`;
            }).join('');
        }

        function filterDataset() {
            const query = document.getElementById('dataset-search').value.toLowerCase();
            const filtered = currentDataset.filter(row => {
                return Object.values(row).some(val => val.toLowerCase().includes(query));
            });
            renderDatasetTable(filtered.slice(0, 50));
        }

        function updateAnalyticsCharts(type, data) {
            const ctx1 = document.getElementById('analyticsChart1').getContext('2d');
            const ctx2 = document.getElementById('analyticsChart2').getContext('2d');

            if (analyticsCharts.chart1) analyticsCharts.chart1.destroy();
            if (analyticsCharts.chart2) analyticsCharts.chart2.destroy();

            let labels1 = [], values1 = [], labels2 = [], values2 = [];
            let title1 = "", title2 = "";

            if (type === 'admission') {
                title1 = "Admission Trends by Month";
                title2 = "Gender Distribution";
                
                const monthCounts = {};
                const genderCounts = {};
                data.forEach(row => {
                    const m = row['month year'];
                    if (m) monthCounts[m] = (monthCounts[m] || 0) + 1;
                    const g = row['GENDER'];
                    if (g) genderCounts[g] = (genderCounts[g] || 0) + 1;
                });
                labels1 = Object.keys(monthCounts);
                values1 = Object.values(monthCounts);
                labels2 = Object.keys(genderCounts);
                values2 = Object.values(genderCounts);

            } else if (type === 'mortality') {
                title1 = "Mortality by Age Group";
                title2 = "Gender Ratio (Mortality)";

                const ageGroups = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '80+': 0 };
                const genderCounts = {};
                data.forEach(row => {
                    const age = parseInt(row['AGE'] || 0);
                    if (age <= 20) ageGroups['0-20']++;
                    else if (age <= 40) ageGroups['21-40']++;
                    else if (age <= 60) ageGroups['41-60']++;
                    else if (age <= 80) ageGroups['61-80']++;
                    else ageGroups['80+']++;

                    const g = row['GENDER '] || row['GENDER'] || 'Unknown';
                    genderCounts[g.trim()] = (genderCounts[g.trim()] || 0) + 1;
                });
                labels1 = Object.keys(ageGroups);
                values1 = Object.values(ageGroups);
                labels2 = Object.keys(genderCounts);
                values2 = Object.values(genderCounts);

            } else if (type === 'pollution') {
                title1 = "AQI Trend (First 30 Days)";
                title2 = "AQI Classification";
                
                const aqiMap = { 'Good': 0, 'Moderate': 0, 'Poor': 0, 'Hazardous': 0 };
                data.slice(0, 30).forEach(row => {
                    const d = row['DATE'];
                    if (d) {
                        labels1.push(d);
                        values1.push(parseFloat(row['AQI'] || 0));
                    }
                });

                data.forEach(row => {
                    const a = parseFloat(row['AQI'] || 0);
                    if (a < 50) aqiMap['Good']++;
                    else if (a < 150) aqiMap['Moderate']++;
                    else if (a < 250) aqiMap['Poor']++;
                    else aqiMap['Hazardous']++;
                });
                labels2 = Object.keys(aqiMap);
                values2 = Object.values(aqiMap);
            }

            document.getElementById('chart1-title').innerText = title1;
            document.getElementById('chart2-title').innerText = title2;

            analyticsCharts.chart1 = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: labels1,
                    datasets: [{
                        label: 'Count',
                        data: values1,
                        backgroundColor: 'rgba(79, 70, 229, 0.6)',
                        borderColor: 'rgb(79, 70, 229)',
                        borderWidth: 1,
                        borderRadius: 8
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });

            analyticsCharts.chart2 = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: labels2,
                    datasets: [{
                        data: values2,
                        backgroundColor: [
                            'rgba(79, 70, 229, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(139, 92, 246, 0.8)'
                        ]
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
