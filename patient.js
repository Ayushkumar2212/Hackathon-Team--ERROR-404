let html5QrCode;
let currentUser = null;
let synth = window.speechSynthesis;
let recognition;

// ---------- AI Chatbot Logic ----------
function toggleBot(show) {
    const bot = document.getElementById('ai-chatbot');
    const btn = document.getElementById('float-bot-btn');
    if(show) {
        bot.classList.remove('scale-0');
        bot.classList.add('scale-100');
        btn.classList.add('hidden');
        speak("Hello! Main aapki AI Health Assistant hoon. Kripya koi option chune ya mic par click karke bole.");
    } else {
        btn.classList.remove('hidden');
        bot.classList.add('scale-0');
        bot.classList.remove('scale-100');
        stopTTS();
    }
}

async function sendEmailNotification(subject, message) {
    // Default system keys for ayushdham405@gmail.com automation
    const defaultSvc = "service_0luhpsn";
    const defaultTmp = "template_q1sc05n";

    let pubKey = localStorage.getItem('safescript_emailjs_pub');
    let serviceId = localStorage.getItem('safescript_emailjs_service') || defaultSvc;
    let templateId = localStorage.getItem('safescript_emailjs_template') || defaultTmp;

    if (!pubKey || pubKey === "N/A" || pubKey === "") {
        console.warn("Public Key missing! Kripya Profile mein apni EmailJS Public Key daalein.");
        return;
    }

    try {
        emailjs.init(pubKey);
        const res = await emailjs.send(serviceId, templateId, {
            to_email: "ayushdham405@gmail.com",
            subject: subject,
            message: message,
            user_name: currentUser ? (currentUser.fullName || currentUser.institution) : "User"
        });
        console.log("SUCCESS!", res.status, res.text);
    } catch (err) {
        console.error("FAILED...", err);
    }
}

function addChatMessage(msg, type = 'bot') {
    const body = document.getElementById('ai-chat-body');
    const div = document.createElement('div');
    if(type === 'bot') {
        div.className = "bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 inline-block w-11/12 text-slate-600 font-bold mb-2";
    } else {
        div.className = "bg-teal-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm self-end inline-block w-11/12 float-right mb-2";
    }
    div.innerText = msg;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function botLevel1(choice) {
    const options = document.getElementById('ai-options-layer1');
    options.classList.add('hidden');
    
    if(choice === 1) {
        addChatMessage("Diseases aur unke precautions ke baare mein jaanne ke liye niche diye gaye options chune:", "bot");
        speak("Diseases aur unke precautions ke baare mein jaanne ke liye niche diye gaye options chune.");
        const diseases = ['Asthma', 'Cancer', 'Fever', 'Diabetes', 'Malaria'];
        const div = document.createElement('div');
        div.className = "flex flex-wrap gap-2 mt-2";
        diseases.forEach(d => {
            const btn = document.createElement('button');
            btn.className = "px-4 py-2 bg-white border border-teal-200 text-teal-700 rounded-lg text-[10px] font-bold hover:bg-teal-600 hover:text-white transition shadow-sm mb-1";
            btn.innerText = d;
            btn.onclick = (e) => {
                e.preventDefault();
                botLevel2(d);
            };
            div.appendChild(btn);
        });
        document.getElementById('ai-chat-body').appendChild(div);
        document.getElementById('ai-chat-body').scrollTop = document.getElementById('ai-chat-body').scrollHeight;
    } else if(choice === 2) {
        const safety = [
            "1. Haath dhote rahein (Wash hands regularly).",
            "2. Mask pehnein (Wear masks in crowds).",
            "3. Doori banaye rakhein (Maintain social distance).",
            "4. Swachh bhojan karein (Eat clean food).",
            "5. Vaccination pura karein (Complete your vaccinations)."
        ];
        displayBotPoints("Safety Guidance", safety);
    } else if(choice === 3) {
        const routine = [
            "1. Roj 30 min exercise karein (Exercise daily).",
            "2. 7-8 ghante ki neend lein (Sleep 7-8 hours).",
            "3. Khoob paani piyein (Stay hydrated).",
            "4. Yoga aur dhyan karein (Yoga and meditation).",
            "5. Bahar ka khana kam karein (Avoid junk food)."
        ];
        displayBotPoints("Daily Healthy Routine", routine);
    } else if(choice === 4) {
        const features = [
            "1. SOS Emergency Support: One-tap help.",
            "2. AI Scan Station: Scan prescriptions easily.",
            "3. Nearby Care: Find hospitals and pharmacies.",
            "4. Secure Document Vault: Store medical files safely.",
            "5. Easy Booking: Fast OPD appointments.",
            "6. Order Tracking: Real-time medicine orders.",
            "7. Digital EHR: Integrated electronic health records."
        ];
        displayBotPoints("Platform Features", features);
    }
}

function botLevel2(disease) {
    let points = [];
    if(disease === 'Asthma') {
        points = [
            "Symptoms (Laxan): Wheezing (Saans fulna), Chest tightness, Coughing.",
            "1. Dust aur pollution se bachein (Avoid dust/pollution).", 
            "2. Inhaler hamesha apne paas rakhein (Keep inhaler handy).", 
            "3. Smoking aur dhuein se door rahein (Stay away from smoke).", 
            "4. Thandi chizo ka sevan kam karein (Avoid very cold food/drinks).",
            "5. Routine checkup apne doctor se karayein (Regular checkups)."
        ];
    } else if(disease === 'Cancer') {
        points = [
            "Symptoms (Laxan): Unexplained weight loss, Fatigue, Weakness, Lumps.",
            "1. Kisi bhi tarah ke nashe (Tobacco/Alcohol) se bachein.", 
            "2. Healthy aur fresh diet lein (Eat healthy fresh food).", 
            "3. Apna wajan (Weight) control mein rakhein.", 
            "4. Regular medical screenings karayein.",
            "5. Dhup mein nikalte samay savdhani bartein (Sun protection)."
        ];
    } else if(disease === 'Fever') {
        points = [
            "Symptoms (Laxan): High body temp, Chills, Sweating, Muscle ache.",
            "1. Paryapt aaram (Rest) karein.", 
            "2. Khoob saara paani aur liquid piyein (Stay hydrated).", 
            "3. Thande paani ki patti sar par rakhein (Cold compress).", 
            "4. Halka aur supathya bhojan karein (Light meals).",
            "5. Paracetamol lein (Doctor ki salah par / After consulting doctor)."
        ];
    } else if(disease === 'Diabetes') {
        points = [
            "Symptoms (Laxan): Frequent urination, Increased thirst/hunger, Blurred vision.",
            "1. Meethi chizo aur sugar se parhez karein (Avoid sugar).", 
            "2. Roj kam se kam 30 minute walk karein (Daily 30m walk).", 
            "3. Time par apni dawaiyan lein (Take meds on time).", 
            "4. Blood sugar level regular check karte rahein.",
            "5. Fiber-rich diet ka sevan karein (Fiber-rich diet)."
        ];
    } else if(disease === 'Malaria') {
        points = [
            "Symptoms (Laxan): High fever with chills, Headache, Nausea, Sweating.",
            "1. Machhardani (Mosquito net) ka upyog karein.", 
            "2. Sharir ko pura dhakne wale kapde pehnein (Wear full clothes).", 
            "3. Ghar ke aas-pass paani jama na hone dein (Prevent stagnant water).", 
            "4. Odomos ya machhar bhagane wali cream lagayein.",
            "5. Bukhaar hone par turant rakt parikshan karayein (Blood test immediately)."
        ];
    }
    displayBotPoints(disease + " Symptoms & Precautions", points);
}

function displayBotPoints(title, points) {
    const body = document.getElementById('ai-chat-body');
    const msg = `**${title}**:\n` + points.join("\n");
    addChatMessage(msg, "bot");
    speak(points.join(". "));
    
    // Show reset button
    const btn = document.createElement('button');
    btn.className = "mt-4 text-[10px] font-bold text-teal-600 underline cursor-pointer";
    btn.innerText = "Main menu dekhne ke liye click karein";
    btn.onclick = () => {
        const layer1 = document.getElementById('ai-options-layer1');
        if(layer1) layer1.classList.remove('hidden');
        body.scrollTop = body.scrollHeight;
    };
    body.appendChild(btn);
}

function stopTTS() {
    synth.cancel();
}

function startVoiceInput() {
    if(!('webkitSpeechRecognition' in window)) {
        return alert("Your browser does not support Speech Recognition.");
    }
    
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    
    document.getElementById('mic-status').innerText = "Listening...";
    document.getElementById('ai-mic-btn').classList.add('animate-pulse');
    
    recognition.start();
    
    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        addChatMessage(text, "user");
        processVoiceCommand(text);
        stopVoiceUI();
    };
    
    recognition.onerror = () => stopVoiceUI();
    recognition.onend = () => stopVoiceUI();
}

function stopVoiceUI() {
    document.getElementById('mic-status').innerText = "Ready...";
    document.getElementById('ai-mic-btn').classList.remove('animate-pulse');
}

function processVoiceCommand(text) {
    text = text.toLowerCase();
    if(text.includes('1') || text.includes('disease') || text.includes('bimari') || text.includes('precaution')) botLevel1(1);
    else if(text.includes('2') || text.includes('safety') || text.includes('suraksha') || text.includes('guidance')) botLevel1(2);
    else if(text.includes('3') || text.includes('routine') || text.includes('health')) botLevel1(3);
    else if(text.includes('4') || text.includes('app') || text.includes('feature') || text.includes('platform')) botLevel1(4);
    else if(text.includes('asthma')) botLevel2('Asthma');
    else if(text.includes('cancer')) botLevel2('Cancer');
    else if(text.includes('fever') || text.includes('bukhar')) botLevel2('Fever');
    else if(text.includes('diabetes')) botLevel2('Diabetes');
    else if(text.includes('malaria')) botLevel2('Malaria');
    else {
        // Fallback to OpenAI
        callOpenAI(text);
    }
}

function sendManualChat() {
    const input = document.getElementById('ai-chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    addChatMessage(msg, 'user');
    input.value = '';
    processVoiceCommand(msg);
}

async function callOpenAI(query) {
    addChatMessage("Thinking...", "bot");
    
    // Clean and retrieve key
    const hardcodedKey = "YOUR_OPENAI_API_KEY";
    let apiKey = localStorage.getItem('safescript_openai_key');
    if (!apiKey || apiKey === 'null') apiKey = hardcodedKey;
    
    apiKey = apiKey.trim(); // Ensure no spaces
    
    if(!apiKey.startsWith('sk-')) {
        const chatBody = document.getElementById('ai-chat-body');
        if(chatBody.lastChild.innerText === "Thinking...") chatBody.lastChild.remove();
        addChatMessage("Invalid API Key! Kripya Profile mein jaakar sahi key enter karein.", "bot");
        return;
    }
    
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { 
                        role: "system", 
                        content: `You are the official SafeScript AI Support Assistant. Your SOLE purpose is to help users understand/navigate the SafeScript platform using the following dataset.

                        STRICT DATASET (MANDATORY KNOWLEDGE):
                        - PROJECT NAME: SafeScript AI (Digital Healthcare Audit)
                        - CURRENT VERSION: 1.2.0 (Stable/Live)
                        - LEAD ARCHITECT: Ayush Kumar (Developer from Patna, Bihar)
                        - REPOSITORY: https://github.com/InnovateX26/Error_404
                        
                        FEATURE BREAKDOWN:
                        1. Patient Portal: Built for mobile-first aid. Features SOS Emergency (GPS-based), OPD Slot Booking, Medicine Orders, and a Secure AI Vault.
                        2. Hospital Portal: Real-time Command Center, OPD management, SOS Ambulance dispatch tracking, Digital Ink Notepad, Staffing.
                        3. Pharmacy Portal: Live inventory monitoring, Order life-cycle management, PDF billing.
                        4. Insurance/Govt: Fraud detection, Drug surveillance, and Audit tools.
                        
                        TECHNICAL STACK:
                        - Built using modern Vanilla JavaScript, Tailwind CSS, and HTML5. 
                        - Data is persisted via Browser LocalStorage (No server-side database required).
                        - Uses jsPDF for generating healthcare bills.

                        RULES & TONE:
                        - Always answer as the developer's official assistant.
                        - Use Mixed Hindi-English (Hinglish).
                        - If a user asks about anything outside this (like politics, recipes, or general science), say: "Maaf kijiye, main keval SafeScript AI aur uske features ke baare mein jaankari de sakta hoon."
                        - Be extremely helpful and proud of the platform.` 
                    },
                    { role: "user", content: query }
                ],
                max_tokens: 400
            })
        });
        
        const data = await response.json();
        const chatBody = document.getElementById('ai-chat-body');
        chatBody.lastChild.remove(); // Remove thinking

        if (data.choices && data.choices[0]) {
            const aiMsg = data.choices[0].message.content;
            addChatMessage(aiMsg, "bot");
            speak(aiMsg.substring(0, 200)); // Speak first bit
        } else {
            throw new Error("Invalid API Response");
        }
    } catch (error) {
        console.error(error);
        const chatBody = document.getElementById('ai-chat-body');
        if(chatBody.lastChild.innerText === "Thinking...") chatBody.lastChild.remove();
        addChatMessage("Sorry, main abhi answer nahi kar pa rahi hoon. Kripya check karein internet ya API settings.", "bot");
    }
}

function saveProfile() {
    const name = document.getElementById('prof-name').value;
    const email = document.getElementById('prof-email').value;
    const ejKey = document.getElementById('emailjs-pubkey').value;
    const ejSrv = document.getElementById('emailjs-service').value;
    const ejTmp = document.getElementById('emailjs-template').value;
    const aiKey = document.getElementById('openai-apikey').value;

    if(!name || !email) return alert("Name and Email are required!");

    currentUser.fullName = name;
    currentUser.email = email;
    currentUser.emailjs_pubkey = ejKey;
    currentUser.emailjs_service = ejSrv;
    currentUser.emailjs_template = ejTmp;
    currentUser.openai_key = aiKey;

    localStorage.setItem('safescript_user', JSON.stringify(currentUser));
    if(aiKey) localStorage.setItem('safescript_openai_key', aiKey);
    
    alert("Profile updated successfully!");
    loadUserProfile();
}

function loadGPSMap() {
    const mapEl = document.getElementById('gps-map');
    if(!mapEl) return;
    
    // Set a default high-quality fallback immediately
    mapEl.src = `https://maps.google.com/maps?q=Hospitals&t=&z=13&ie=UTF8&iwloc=&output=embed`;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            let lat = pos.coords.latitude;
            let lon = pos.coords.longitude;
            mapEl.src = `https://maps.google.com/maps?q=${lat},${lon}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
        }, err => {
            console.warn("GPS Permission Denied, staying on fallback map.");
        });
    }
}

function loadUserProfile() {
    const userData = localStorage.getItem('safescript_user');
    if(userData) {
        currentUser = JSON.parse(userData);
        document.getElementById('user-display-name').innerText = currentUser.fullName.split(' ')[0];
        document.getElementById('user-display-role').innerText = currentUser.role;
        
        // Set ID Label specifically
        let idType = "Aadhar";
        if(currentUser.role === 'Government Health Bodies') idType = "Govt. ID";
        else if(['Hospitals', 'Clinics', 'Pharmacists', 'Health Insurance Companies'].includes(currentUser.role)) idType = "GST Number";

        const idLabelEl = document.getElementById('prof-id-label');
        if(idLabelEl) idLabelEl.innerText = `${idType} (Locked)`;

        if(document.getElementById('apptName')) document.getElementById('apptName').value = currentUser.fullName;
        if(document.getElementById('apptPhone')) document.getElementById('apptPhone').value = currentUser.phone;

        if(document.getElementById('prof-name')) document.getElementById('prof-name').value = currentUser.fullName;
        if(document.getElementById('prof-email')) document.getElementById('prof-email').value = currentUser.email;
        if(document.getElementById('prof-phone')) document.getElementById('prof-phone').value = currentUser.phone;
        if(document.getElementById('prof-id-val')) document.getElementById('prof-id-val').value = currentUser.idVal || 'N/A';
        
        if(document.getElementById('emailjs-pubkey')) document.getElementById('emailjs-pubkey').value = currentUser.emailjs_pubkey || '';
        if(document.getElementById('emailjs-service')) document.getElementById('emailjs-service').value = currentUser.emailjs_service || '';
        if(document.getElementById('emailjs-template')) document.getElementById('emailjs-template').value = currentUser.emailjs_template || '';
        if(document.getElementById('openai-apikey')) document.getElementById('openai-apikey').value = currentUser.openai_key || localStorage.getItem('safescript_openai_key') || '';

        if(currentUser.dp) {
            const dps = document.querySelectorAll('#prof-dp, #user-display-dp');
            dps.forEach(d => { d.src = currentUser.dp; d.classList.remove('hidden'); });
            document.getElementById('prof-dp-placeholder').classList.add('hidden');
            document.getElementById('user-display-icon').classList.add('hidden');
        }

        loadGPSMap();
        loadPatientStatusBoard();
        loadDocumentVault();
        checkSOSStatus();
        setInterval(checkSOSStatus, 3000);
        setInterval(loadPatientStatusBoard, 5000); // Live Sync Stats
    }
}

function loadDocumentVault() {
    const vault = JSON.parse(localStorage.getItem('safescript_vault')) || [];
    const container = document.getElementById('ai-store-list');
    if(!container) return;
    container.innerHTML = '';
    if(vault.length === 0) {
        container.innerHTML = '<p class="text-center text-[10px] text-slate-400 font-bold p-4 bg-white rounded-xl border border-dashed">No documents saved in vault.</p>';
        return;
    }
    vault.forEach((doc, idx) => {
        container.innerHTML += `
            <div class="p-3 bg-white rounded-xl shadow-sm border border-slate-100 flex justify-between items-center group">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center"><i class="fas fa-file-alt"></i></div>
                    <div><p class="font-bold text-slate-800 text-[10px]">${doc.name}</p><p class="text-[8px] text-slate-400">${doc.date}</p></div>
                </div>
                <div class="flex gap-2">
                     <a href="${doc.data}" download="${doc.name}" class="text-teal-500 hover:text-teal-700 p-2"><i class="fas fa-download"></i></a>
                     <button onclick="removeFromVault(${idx})" class="text-rose-400 hover:text-rose-600 p-2"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });
}

function analyzeAndStoreFile() {
    const fileInput = document.getElementById('ai-store-file');
    if(!fileInput.files[0]) return alert("Please select a document first!");
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const vault = JSON.parse(localStorage.getItem('safescript_vault')) || [];
        vault.unshift({ name: file.name, data: e.target.result, date: new Date().toLocaleString() });
        localStorage.setItem('safescript_vault', JSON.stringify(vault));
        loadDocumentVault();
        sendEmailNotification("New Document Added to Vault", `A new document named ${file.name} was saved at ${new Date().toLocaleString()}.`);
        alert("Document successfully saved to your private Document Vault!");
    };
    reader.readAsDataURL(file);
}

function removeFromVault(idx) {
    if(confirm("Are you sure you want to remove this document from your vault?")) {
        const vault = JSON.parse(localStorage.getItem('safescript_vault')) || [];
        vault.splice(idx, 1);
        localStorage.setItem('safescript_vault', JSON.stringify(vault));
        loadDocumentVault();
    }
}

function findNearby() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            let lat = pos.coords.latitude; let lon = pos.coords.longitude;
            document.getElementById('nearby-map').src = `https://maps.google.com/maps?q=Hospitals+near+${lat},${lon}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
            
            document.getElementById('nearby-list').innerHTML = `
                <div class="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:border-teal-300 transition">
                    <div><p class="font-black text-slate-800 text-sm">City Hospital</p><p class="text-[10px] text-slate-500 font-bold">1.2 km away • Always Open</p></div>
                    <span class="text-teal-600 bg-teal-50 px-3 py-2 rounded-xl text-xs font-bold"><i class="fas fa-directions mr-1"></i> Go</span>
                </div>
                <div class="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:border-teal-300 transition">
                    <div><p class="font-black text-slate-800 text-sm">Apollo Pharmacy</p><p class="text-[10px] text-slate-500 font-bold">1.5 km away • Home Delivery Available</p></div>
                    <span class="text-teal-600 bg-teal-50 px-3 py-2 rounded-xl text-xs font-bold"><i class="fas fa-directions mr-1"></i> Go</span>
                </div>
            `;
        }, err => alert("Please allow location access to find nearby hospitals."));
    }
}

function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.remove('active-tab');
        t.classList.add('hidden');
    });
    
    let targetTab = document.getElementById(id);
    if(targetTab) {
        targetTab.classList.add('active-tab');
        targetTab.classList.remove('hidden');
        if(id === 'profile') loadGPSMap();
    }
    
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
    
    if(id !== 'reports' && html5QrCode) {
        html5QrCode.stop().catch(e => console.log(e));
    }
}

function startScanning() {
    html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 20, qrbox: { width: 280, height: 280 } };

    html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
        handleScanAction(decodedText);
    }).catch(err => console.log("Camera failed", err));
}

// Global AI Mock Medicine Generator
const getAiMockMedicine = () => {
    const names = ["Gasofast", "Paracetamol", "Azithromycin", "Dolo 650", "Pan-D", "Allegra 120", "Limcee", "Cyclopam"];
    const brands = ["Cipla", "Sun Pharma", "Dr. Reddy's", "Abbott India", "Mankind Pharma", "Lupin", "Torrent Pharma"];
    const name = names[Math.floor(Math.random() * names.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const mfg = 2023 + Math.floor(Math.random() * 3); // 2023-2025
    const exp = mfg + 2 + Math.floor(Math.random() * 3); // mfg + 2-4 years
    const batch = "BN" + Math.floor(100000 + Math.random() * 900000);
    
    return { name, brand, mfg: "04/" + mfg, exp: "04/" + exp, batch };
};

function handleScanAction(data) {
    speak("Scan successful. Analyzing molecular data.");
    const urlPattern = /^(https?:\/\/|www\.)[^\s$.?#].[^\s]*$/i;
    
    if (urlPattern.test(data)) {
        document.getElementById('camera-container').classList.add('hidden');
        document.getElementById('scan-feedback').classList.remove('hidden');
        setTimeout(() => {
            window.open(data.startsWith('http') ? data : 'https://' + data, '_blank');
            resetScanner();
        }, 1500);
    } else {
        html5QrCode.stop();
        document.getElementById('camera-container').classList.add('hidden');
        document.getElementById('ai-output-container').classList.remove('hidden');
        
        const mock = getAiMockMedicine();
        const displayData = `
            🔍 AI DETECTION: MEDICINE VERIFIED
            -----------------------------------
            MEDICINE: ${mock.name}
            BRAND   : ${mock.brand}
            MFG DATE: ${mock.mfg}
            EXP DATE: ${mock.exp}
            BATCH NO: ${mock.batch}
            -----------------------------------
            RAW QR DATA: ${data}
        `;
        
        document.getElementById('qr-data-display').innerText = displayData;
        speak(`Humne ${mock.name} report analyze kar li hai. Ye ${mock.brand} ka product hai.`);
    }
}

function resetScanner() {
    document.getElementById('camera-container').classList.remove('hidden');
    document.getElementById('scan-feedback').classList.add('hidden');
    document.getElementById('ai-output-container').classList.add('hidden');
    if(html5QrCode) startScanning();
}

function speak(text) {
    if (!synth) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'hi-IN';
    utter.rate = 1.0;
    synth.speak(utter);
}

function addPatientMedRow() {
    let container = document.getElementById('med-list-container');
    let div = document.createElement('div');
    div.className = "flex gap-3 med-row";
    div.innerHTML = `
        <input type="text" placeholder="Medicine Name" class="flex-1 p-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm med-name">
        <input type="number" placeholder="Qty" class="w-20 p-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm text-center med-qty">
        <button onclick="this.parentElement.remove()" class="text-rose-400 hover:text-rose-600 px-3"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(div);
}

function generateMedBill() {
    const pharmacy = document.getElementById('pharmacyName').value || "GenMed";
    
    let medItems = [];
    document.querySelectorAll('.med-row').forEach(row => {
        let name = row.querySelector('.med-name').value;
        let qty = row.querySelector('.med-qty').value;
        if(name && qty) medItems.push({name, qty});
    });

    if(medItems.length === 0) return alert("Please add medicine.");

    let orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    let combinedNames = medItems.map(m => m.name).join(', ');
    
    let orderObj = { id: orderId, patientName: "You", medName: combinedNames, qty: medItems.length, status: "Pending", time: new Date().toLocaleTimeString() };
    
    let pharmacyOrders = JSON.parse(localStorage.getItem('pharmacy_orders')) || [];
    pharmacyOrders.unshift(orderObj);
    localStorage.setItem('pharmacy_orders', JSON.stringify(pharmacyOrders));

    let patientOrders = JSON.parse(localStorage.getItem('safescript_patient_orders')) || [];
    patientOrders.unshift(orderObj);
    localStorage.setItem('safescript_patient_orders', JSON.stringify(patientOrders));

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("SafeScript AI Order: " + orderId, 10, 10);
    doc.save(orderId + ".pdf");

    sendEmailNotification("New Medicine Order: " + orderId, `Order details: ${combinedNames}. Quantity: ${medItems.length}. Pharmacy: ${pharmacy}.`);
    
    alert("Order Sent!");
}

function measureHealth() {
    speak("Measuring health...");
    setTimeout(() => {
        let hr = Math.floor(Math.random() * 30) + 60;
        let gluc = Math.floor(Math.random() * 40) + 80;
        document.getElementById('hr-val').innerText = hr;
        document.getElementById('glucose-val').innerText = gluc;
        speak(`Heart rate is ${hr}, Glucose is ${gluc}.`);
    }, 2000);
}

function triggerSOS() {
    let sosData = { id: "SOS-" + Date.now(), patientName: currentUser ? currentUser.fullName : "User", status: "Pending", time: new Date().toLocaleTimeString(), lat: 25.5941, lon: 85.1376 };
    localStorage.setItem('safescript_sos', JSON.stringify(sosData));
    let queue = JSON.parse(localStorage.getItem('safescript_sos_queue')) || [];
    queue.push(sosData);
    localStorage.setItem('safescript_sos_queue', JSON.stringify(queue));
    alert("SOS Sent!");
}

function bookAppointment() {
    const type = document.getElementById('apptType').value;
    const name = document.getElementById('apptName').value;
    const reason = document.getElementById('apptReason').value;
    const date = document.getElementById('apptDate').value;
    const time = document.getElementById('apptTime').value;

    if(!name || !reason || !date || !time) return alert("Fill all fields");

    let appts = JSON.parse(localStorage.getItem('safescript_appointments')) || [];
    appts.push({ id: "APT-" + Date.now(), type, name, reason, date, time, status: 'Pending' });
    localStorage.setItem('safescript_appointments', JSON.stringify(appts));
    alert("Appointment Booked!");
}

function loadPatientStatusBoard() {
    const container = document.getElementById('status-bars');
    if(!container) return;
    container.innerHTML = '';

    // Load Orders
    let patientOrders = JSON.parse(localStorage.getItem('safescript_patient_orders')) || [];
    // Load Appointments
    let appointments = JSON.parse(localStorage.getItem('safescript_appointments')) || [];

    if(patientOrders.length === 0 && appointments.length === 0) {
        container.innerHTML = '<p class="text-center text-[10px] text-slate-400 font-bold p-4 bg-white rounded-xl border border-dashed">No active statuses found.</p>';
        return;
    }

    // Render Orders
    patientOrders.slice(0, 3).forEach(o => {
        container.innerHTML += `
            <div class="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><i class="fas fa-box-open"></i></div>
                    <div><p class="font-black text-slate-800 text-xs">Order ${o.id}</p><p class="text-[9px] text-slate-400 font-bold">${o.medName.substring(0,25)}...</p></div>
                </div>
                <span class="text-[8px] font-black uppercase px-3 py-1 rounded-full ${o.status === 'Pending' ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}">${o.status}</span>
            </div>
        `;
    });

    // Render Appointments
    appointments.slice(0, 3).forEach(a => {
        container.innerHTML += `
            <div class="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center"><i class="fas fa-calendar-check"></i></div>
                    <div><p class="font-black text-slate-800 text-xs">${a.type}</p><p class="text-[9px] text-slate-400 font-bold">${a.date} at ${a.time}</p></div>
                </div>
                <span class="text-[8px] font-black uppercase px-3 py-1 rounded-full ${a.status === 'Pending' ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}">${a.status}</span>
            </div>
        `;
    });
}

function loadReminders() {
    let rems = JSON.parse(localStorage.getItem('safescript_reminders')) || [];
    const list = document.getElementById('reminders-list');
    if(!list) return;
    list.innerHTML = rems.map(r => `<div class="p-3 bg-white border rounded-xl mb-2">${r.title} at ${r.time}</div>`).join('');
}

function addReminder() {
    let title = document.getElementById('rem-title').value;
    let time = document.getElementById('rem-time').value;
    if(!title || !time) return alert("Fill all fields");
    let rems = JSON.parse(localStorage.getItem('safescript_reminders')) || [];
    rems.push({ title, time });
    localStorage.setItem('safescript_reminders', JSON.stringify(rems));
    loadReminders();
}

function checkSOSStatus() {}

function loadUserProfile() {
    const userData = localStorage.getItem('safescript_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        document.getElementById('prof-name').value = currentUser.fullName || '';
        document.getElementById('prof-email').value = currentUser.email || '';
        document.getElementById('prof-phone').value = currentUser.phone || '';
        document.getElementById('prof-id-val').value = currentUser.idVal || '';
        
        if (currentUser.dp) {
            document.getElementById('prof-dp').src = currentUser.dp;
            document.getElementById('prof-dp').classList.remove('hidden');
            document.getElementById('prof-dp-placeholder').classList.add('hidden');
        }
    }
    
    // Load Keys with Defaults
    document.getElementById('openai-apikey').value = localStorage.getItem('safescript_openai_key') || 'YOUR_OPENAI_API_KEY';
    document.getElementById('emailjs-pubkey').value = localStorage.getItem('safescript_emailjs_pub') || '';
    document.getElementById('emailjs-service').value = localStorage.getItem('safescript_emailjs_service') || 'service_0luhpsn';
    document.getElementById('emailjs-template').value = localStorage.getItem('safescript_emailjs_template') || 'template_q1sc05n';
}

function saveProfile() {
    const name = document.getElementById('prof-name').value;
    const email = document.getElementById('prof-email').value;
    const openaiKey = document.getElementById('openai-apikey').value;
    const emailjsPub = document.getElementById('emailjs-pubkey').value;
    const emailjsSvc = document.getElementById('emailjs-service').value;
    const emailjsTmp = document.getElementById('emailjs-template').value;

    if (currentUser) {
        currentUser.fullName = name;
        currentUser.email = email;
        localStorage.setItem('safescript_user', JSON.stringify(currentUser));
    }

    localStorage.setItem('safescript_openai_key', openaiKey);
    localStorage.setItem('safescript_emailjs_pub', emailjsPub);
    localStorage.setItem('safescript_emailjs_service', emailjsSvc);
    localStorage.setItem('safescript_emailjs_template', emailjsTmp);

    alert("Profile & API settings updated!");
}

function uploadDP(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgData = e.target.result;
            document.getElementById('prof-dp').src = imgData;
            document.getElementById('prof-dp').classList.remove('hidden');
            document.getElementById('prof-dp-placeholder').classList.add('hidden');
            if (currentUser) {
                currentUser.dp = imgData;
                localStorage.setItem('safescript_user', JSON.stringify(currentUser));
            }
        };
        reader.readAsDataURL(file);
    }
}

function deleteDP() {
    if (confirm("Delete profile picture?")) {
        document.getElementById('prof-dp').src = "";
        document.getElementById('prof-dp').classList.add('hidden');
        document.getElementById('prof-dp-placeholder').classList.remove('hidden');
        if (currentUser) {
            delete currentUser.dp;
            localStorage.setItem('safescript_user', JSON.stringify(currentUser));
        }
    }
}

window.onload = function() {
    loadUserProfile();
    loadReminders();
    loadDocumentVault();
    loadPatientStatusBoard();
};

function logout() {
    localStorage.removeItem('safescript_user');
    window.location.href = 'login.html';
}
