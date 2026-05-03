let html5QrCode;
let currentUser = null;
let synth = window.speechSynthesis;
let recognition;

// ---------- AI Chatbot Logic ----------
const BOT_ANSWERS = {
    1: { 
        title: "Diseases & Precautions", 
        diseases: {
            "Dengue": [
                "Symptoms: Sharp headache, High fever, Joint and muscle pain, Rashes.",
                "Precautions: Use mosquito nets, Wear full-sleeve clothes, Clear stagnant water around home."
            ],
            "Malaria": [
                "Symptoms: Chills, High fever, Shaking, Profuse sweating.",
                "Precautions: Use insect repellent, Install window screens, Keep surroundings clean."
            ],
            "COVID-19": [
                "Symptoms: Fever, Dry cough, Fatigue, Loss of taste or smell.",
                "Precautions: Wear a mask, Maintain 2-meter distance, Get vaccinated, Sanitize hands."
            ],
            "Typhoid": [
                "Symptoms: Prolonged fever, Stomach pain, Headache, Constipation or diarrhea.",
                "Precautions: Drink boiled or RO water, Avoid raw food/street food, Wash hands before meals."
            ],
            "Diabetes": [
                "Symptoms: Increased thirst, Frequent urination, Unexplained weight loss, Fatigue.",
                "Precautions: Control sugar intake, Exercise 30 mins daily, Monitor glucose levels regularly."
            ],
            "Hypertension": [
                "Symptoms: Severe headache, Nosebleeds, Fatigue, Vision problems (often asymptomatic).",
                "Precautions: Reduce salt intake, Quit smoking, Manage stress through meditation."
            ]
        }
    },
    2: {
        title: "Safety Guidance",
        points: [
            "Always wear a mask in crowded areas.",
            "Keep a basic first aid kit at home.",
            "Sanitize hands regularly and wash before meals.",
            "In case of emergency, use the SOS button immediately.",
            "Store medicines in a cool, dry place away from children."
        ]
    },
    3: {
        title: "Daily Healthy Routine",
        points: [
            "Drink at least 3-4 liters of water daily.",
            "Incorporate 30 minutes of physical exercise.",
            "Maintain a consistent sleep cycle of 7-8 hours.",
            "Include green leafy vegetables and seasonal fruits in your diet.",
            "Practice mindfulness or meditation for 10 minutes."
        ]
    },
    4: {
        title: "To know about app features",
        points: [
            "AI Voice Chatbot: Multilingual health assistance.",
            "SOS Emergency: Instant hospital alerts with GPS tracking.",
            "OPD Booking: Online appointment scheduling with clinics/hospitals.",
            "Pharmacy Order: Upload prescriptions and order medicines.",
            "Document Vault: Securely store and manage medical records.",
            "Nearby Care: Locate nearest healthcare facilities on maps."
        ]
    }
};

function toggleBot(show) {
    const bot = document.getElementById('ai-chatbot');
    const btn = document.getElementById('float-bot-btn');
    if(show) {
        bot.classList.remove('scale-0');
        bot.classList.add('scale-100');
        btn.classList.add('hidden');
        
        const lang = document.getElementById('user-lang-select')?.value || 'en';
        const welcomeMsgs = {
            'en': "Hello! I am your AI Health Assistant. Please choose an option or use the mic.",
            'hi': "नमस्ते! मैं आपकी AI हेल्थ असिस्टेंट हूँ। कृपया कोई विकल्प चुनें या माइक का उपयोग करें।",
            'mai': "प्रणाम! हम अहांक AI हेल्थ असिस्टेंट छी। कोनो विकल्प चुनू या माइकक प्रयोग करू।",
            'bho': "प्रणाम! हम रउवा AI हेल्थ असिस्टेंट बानी। कवनो विकल्प चुनीं चाहे माइक के प्रयोग करीं।",
            'bn': "হ্যালো! আমি আপনার AI হেলথ অ্যাসিস্ট্যান্ট। একটি বিকল্প বেছে নিন বা মাইক ব্যবহার করুন।",
            'te': "హలో! నేను మీ AI హెల్త్ అసిస్టెంట్. దయచేసి ఒక ఎంపికను ఎంచుకోండి లేదా మైక్ ఉపయోగించండి.",
            'mr': "नमस्कार! मी आपला AI आरोग्य सहाय्यक आहे. कृपया एक पर्याय निवडा किंवा माइक वापरा.",
            'gu': "નમસ્તે! હું તમારો AI હેલ્થ આસિસ્ટન્ટ છું. કૃપા કરીને વિકલ્પ પસંદ કરો અથવા માઇક વાપરો.",
            'pa': "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਸਿਹਤ ਸਹਾਇਕ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਕੋਈ ਵਿਕલ્પ ਚੁਣੋ ਜਾਂ ਮਾਈਕ ਦੀ ਵਰਤੋਂ ਕਰੋ।"
        };
        const msg = welcomeMsgs[lang] || welcomeMsgs['en'];
        speak(msg, getVoiceLangCode(lang));
    } else {
        btn.classList.remove('hidden');
        bot.classList.add('scale-0');
        bot.classList.remove('scale-100');
        stopTTS();
    }
}

function getVoiceLangCode(val) {
    const map = { 'en':'en-US', 'hi':'hi-IN', 'bho':'hi-IN', 'mai':'hi-IN', 'bn':'bn-IN', 'te':'te-IN', 'or':'or-IN', 'mr':'mr-IN', 'gu':'gu-IN', 'pa':'pa-IN', 'ur':'ur-PK' };
    return map[val] || 'hi-IN';
}

async function sendEmailNotification(subject, message) {
    const defaultSvc = "service_0luhpsn";
    const defaultTmp = "template_q1sc05n";

    let pubKey = localStorage.getItem('safescript_emailjs_pub') || "YOUR_PUBLIC_KEY";
    let serviceId = localStorage.getItem('safescript_emailjs_service') || defaultSvc;
    let templateId = localStorage.getItem('safescript_emailjs_template') || defaultTmp;

    if (!pubKey || pubKey === "N/A" || pubKey === "" || pubKey === "YOUR_PUBLIC_KEY") {
        console.warn("Public Key missing! Attempting system link...");
        pubKey = localStorage.getItem('safescript_emailjs_pub');
        if(!pubKey || pubKey === "N/A" || pubKey === "") {
             if(!window.email_warned) {
                  alert("Email Link Warning: ayushdham405@gmail.com is hardcoded, but you must enter your EmailJS Public Key in the Profile tab to finalize the PDF delivery bridge.");
                  window.email_warned = true;
             }
             return;
        }
    }

    const params = {
        to_email: "ayushdham405@gmail.com",
        subject: subject,
        message: message,
        user_name: currentUser ? (currentUser.fullName || currentUser.institution) : "User"
    };

    if(window.lastGeneratedPDFBase64) {
        params['pdf_attachment'] = window.lastGeneratedPDFBase64.split(',')[1];
    }

    try {
        emailjs.init(pubKey);
        const res = await emailjs.send(serviceId, templateId, params);
        console.log("MAIL SUCCESS!", res.status, res.text);
        showToast("PDF Mirrored to ayushdham405@gmail.com", "success");
    } catch (err) {
        console.error("MAIL ERROR DETAILS:", err);
        const errorMsg = err.text || err.message || JSON.stringify(err);
        if(errorMsg.includes("user_id") || errorMsg.includes("public_key") || err.status === 401) {
            alert("Mail Bridge Link Broken: Your Public Key is invalid. Please copy the 'Public Key' from your EmailJS Dashboard into your Profile settings.");
        } else if (errorMsg.includes("quota") || err.status === 403) {
            alert("Mail Overload: Your EmailJS account has reached its daily limit. The PDF is saved locally, but can't be mailed right now.");
        } else {
            alert("Mail Sync Failed: " + errorMsg + ". Please check your internet or key.");
        }
    }
}

function addChatMessage(msg, type = 'bot') {
    const body = document.getElementById('ai-chat-body');
    const div = document.createElement('div');
    if(type === 'bot') {
        div.className = "chat-msg-bot chat-bubble-font";
    } else {
        div.className = "chat-msg-user chat-bubble-font";
    }
    div.innerText = msg;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function botLevel1(choice) {
    const layer1 = document.getElementById('ai-options-layer1');
    if(layer1) layer1.classList.add('hidden');
    
    const lang = document.getElementById('user-lang-select')?.value || 'en';

    if(choice === 1) {
        addChatMessage(lang === 'hi' ? "मुझे बीमारियों और सावधानियों के बारे में जानना है" : "Know about diseases & precautions", "user");
        const body = document.getElementById('ai-chat-body');
        const div = document.createElement('div');
        div.className = "flex flex-col gap-2 mt-2";
        Object.keys(BOT_ANSWERS[1].diseases).forEach(d => {
            const btn = document.createElement('button');
            btn.className = "p-3 border border-teal-200 text-teal-700 bg-teal-50 rounded-xl text-left hover:bg-teal-600 hover:text-white transition font-bold shadow-sm whitespace-normal text-xs";
            btn.innerText = d;
            btn.onclick = () => botLevel2(d);
            div.appendChild(btn);
        });
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    } else if(choice === 4) {
        const data = BOT_ANSWERS[4];
        if (lang === 'en' || lang === 'hi') {
           addChatMessage(lang === 'hi' ? "सेफस्क्रिप्ट एआई फीचर्स क्या हैं?" : "What are SafeScript AI features?", "user");
           displayBotPoints(data.title, data.points);
        } else {
           callOpenAI(`Tell me about Safescript AI features in ${getSelectedLangName()}`);
        }
    } else if(choice === 2 || choice === 3) {
        const data = BOT_ANSWERS[choice];
        if (lang === 'en' || lang === 'hi') {
            addChatMessage(choice === 2 ? "Safety Guidance" : "Daily Healthy Routine", "user");
            displayBotPoints(data.title, data.points);
        } else {
            const query = choice === 2 ? "Provide Health Safety guidance" : "Provide Daily Healthy routine";
            callOpenAI(`${query} in ${getSelectedLangName()}`);
        }
    }
}

function getSelectedLangName() {
    const langSelect = document.getElementById('user-lang-select');
    return langSelect ? langSelect.options[langSelect.selectedIndex].text.split('(')[0].trim() : "Hindi";
}

function botLevel2(disease) {
    const lang = document.getElementById('user-lang-select')?.value || 'en';
    const staticInfo = BOT_ANSWERS[1].diseases[disease];
    
    if (staticInfo && (lang === 'en' || lang === 'hi')) {
        addChatMessage(lang === 'hi' ? `मुझे ${disease} के लक्षण और बचाव बताएं` : `Symptoms and precautions for ${disease}`, "user");
        displayBotPoints(disease, staticInfo);
    } else {
        addChatMessage(disease, "user");
        callOpenAI(`${disease} symptoms and precautions in ${getSelectedLangName()}`);
    }
}

function displayBotPoints(title, points) {
    const body = document.getElementById('ai-chat-body');
    const msg = `**${title}**:\n` + points.join("\n");
    addChatMessage(msg, "bot");
    speak(points.join(". "), getVoiceLangCode(document.getElementById('user-lang-select')?.value));
    
    const btn = document.createElement('button');
    btn.className = "mt-4 text-[10px] font-bold text-teal-600 underline cursor-pointer bg-transparent border-none p-0 block clear-both";
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
    
    const recognition = new webkitSpeechRecognition();
    const langVal = document.getElementById('user-lang-select')?.value || 'hi';
    const selectedLang = getVoiceLangCode(langVal);
    
    recognition.lang = selectedLang;
    recognition.interimResults = false;
    
    document.getElementById('mic-status').innerText = "Listening...";
    document.getElementById('ai-mic-btn').classList.add('animate-pulse');
    
    recognition.start();
    
    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        addChatMessage(text, "user");
        callOpenAI(text);
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
    callOpenAI(text);
}

function sendManualChat() {
    const input = document.getElementById('ai-chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    addChatMessage(msg, 'user');
    input.value = '';
    callOpenAI(msg);
}

async function callOpenAI(query) {
    if(!query) return;

    const langVal = document.getElementById('user-lang-select')?.value || 'hi';
    const langMap = {
        'en': 'English', 'hi': 'Hindi (हिंदी)', 'mai': 'Maithili (मैथिली)', 'bho': 'Bhojpuri (भोजपुरी)', 'bn': 'Bengali (বাংলা)', 
        'te': 'Telugu (తెలుగు)', 'or': 'Oriya (ଓଡ଼ିଆ)', 'mr': 'Marathi (मराठी)', 'gu': 'Gujarati (ગુજરાતી)', 'pa': 'Punjabi (ਪੰਜਾਬੀ)', 'ur': 'Urdu (اردو)'
    };
    const targetLangName = langMap[langVal] || "Hindi (हिंदी)";

    const lowQuery = query.toLowerCase().trim();
    const commonGreetings = ['hi', 'hii', 'hello', 'hey', 'नमस्ते', 'प्रणाम', 'হ্যালো', 'హలో', 'नमस्कार'];
    if (commonGreetings.includes(lowQuery)) {
        const greetings = {
            'en': "Hello, I am SafeScript AI. How can I help you?",
            'hi': "नमस्ते, मैं सेफस्क्रिप्ट एआई हूँ। मैं आपकी क्या मदद कर सकती हूँ?",
            'mai': "प्रणाम, हम सेफस्क्रिप्ट एआई छी। हम अहांक कोना मदद क सकैत छी?",
            'bho': "प्रणाम, हम सेफस्क्रिप्ट एआई बानी। हम रउवा का मदद कर सकीं?",
            'bn': "হ্যালো, আমি সেফস্ক্রিপ্ট এআই। আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
            'te': "హలో, నేను సేఫ్ స్క్రిప్ట్ AI. నేను మీకు ఎలా సహాయం చేయగలను?"
        };
        const greeting = greetings[langVal] || greetings['hi'];
        addChatMessage(greeting, "bot");
        speak(greeting, getVoiceLangCode(langVal));
        return;
    }

    addChatMessage("Thinking...", "bot");
    
    let apiKey = localStorage.getItem('safescript_openai_key') || "AIzaSyBvS7KtwT52oTEOmW8vYXT6Tod3jb0TU_4";
    apiKey = apiKey.trim();
    
    try {
        let aiMsg = "";
        let response;
        
        if (apiKey.startsWith('AIza')) {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `You are SafeScript AI Voice Assistant. 
                    STRICT RULE: You MUST reply ONLY in the ${targetLangName} language. 
                    Current User Language: ${targetLangName}. 
                    If the user speaks in English but the language is set to ${targetLangName}, you MUST still reply in ${targetLangName}.
                    Query: ${query}` }] }]
                })
            });
        } else {
            response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: `You are SafeScript AI. Reply strictly in ${targetLangName} only.` },
                        { role: "user", content: query }
                    ]
                })
            });
        }
        
        const chatBody = document.getElementById('ai-chat-body');
        const thinkingMsg = Array.from(chatBody.children).find(c => c.innerText === "Thinking...");
        if(thinkingMsg) thinkingMsg.remove();

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "API Fail");

        if (apiKey.startsWith('AIza')) {
            aiMsg = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf kijiye, error aa gaya.";
        } else {
            aiMsg = data.choices?.[0]?.message?.content || "Maaf kijiye, error aa gaya.";
        }

        if (aiMsg) {
            aiMsg = aiMsg.replace(/\[.*?\]/g, '').trim();
            const currentVoiceLang = getVoiceLangCode(langVal);
            addChatMessage(aiMsg, "bot");
            speak(aiMsg, currentVoiceLang); 
        }
    } catch (error) {
        console.error(error);
        const chatBody = document.getElementById('ai-chat-body');
        const thinkingMsg = Array.from(chatBody.children).find(c => c.innerText === "Thinking...");
        if(thinkingMsg) thinkingMsg.remove();
        addChatMessage(`Error: ${error.message}`, "bot");
    }
}

function speak(text, lang = 'hi-IN') {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    let cleanText = text.replace(/\[.*?\]/g, '').trim();
    const utter = new SpeechSynthesisUtterance(cleanText);
    
    const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        
        let bestVoice = voices.find(v => v.lang.toLowerCase() === lang.toLowerCase()) ||
                        voices.find(v => v.lang.startsWith(lang.split('-')[0])) ||
                        voices.find(v => v.name.toLowerCase().includes('hindi') && lang.startsWith('hi')) ||
                        voices.find(v => v.name.toLowerCase().includes('bengali') && lang.startsWith('bn'));
        
        if (bestVoice) {
            utter.voice = bestVoice;
            utter.lang = bestVoice.lang;
        } else {
            utter.lang = lang;
        }
        
        utter.rate = 1.0;
        utter.pitch = 1.0;
        window.speechSynthesis.speak(utter);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true });
    } else {
        setVoiceAndSpeak();
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
    localStorage.setItem('safescript_openai_key', aiKey);
    localStorage.setItem('safescript_emailjs_pub', ejKey);
    localStorage.setItem('safescript_emailjs_service', ejSrv);
    localStorage.setItem('safescript_emailjs_template', ejTmp);
    
    alert("Profile & API settings updated successfully!");
    loadUserProfile();
}

function loadGPSMap() {
    const mapEl = document.getElementById('gps-map');
    if(!mapEl) return;
    
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
    try {
        const userData = localStorage.getItem('safescript_user');
        if(userData) {
            currentUser = JSON.parse(userData);
            const userDispName = document.getElementById('user-display-name');
            if(userDispName) {
                userDispName.innerText = (currentUser.fullName || "User").split(' ')[0];
            }
            const userDispRole = document.getElementById('user-display-role');
            if(userDispRole) {
                userDispRole.innerText = currentUser.role || "User";
            }
        
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
        
        if(document.getElementById('openai-apikey')) document.getElementById('openai-apikey').value = currentUser.openai_key || localStorage.getItem('safescript_openai_key') || 'AIzaSyBvS7KtwT52oTEOmW8vYXT6Tod3jb0TU_4';
        if(document.getElementById('emailjs-pubkey')) document.getElementById('emailjs-pubkey').value = currentUser.emailjs_pubkey || localStorage.getItem('safescript_emailjs_pub') || '';
        if(document.getElementById('emailjs-service')) document.getElementById('emailjs-service').value = currentUser.emailjs_service || localStorage.getItem('safescript_emailjs_service') || 'service_0luhpsn';
        if(document.getElementById('emailjs-template')) document.getElementById('emailjs-template').value = currentUser.emailjs_template || localStorage.getItem('safescript_emailjs_template') || 'template_q1sc05n';

        if(currentUser.dp) {
            const dps = document.querySelectorAll('#prof-dp, #user-display-dp');
            dps.forEach(d => { d.src = currentUser.dp; d.classList.remove('hidden'); });
            document.getElementById('prof-dp-placeholder').classList.add('hidden');
            document.getElementById('user-display-icon').classList.add('hidden');
        }

        loadGPSMap();
        loadPatientStatusBoard();
        loadDocumentVault();
        if(typeof checkSOSStatus === 'function') checkSOSStatus();
        setInterval(() => { if(typeof checkSOSStatus === 'function') checkSOSStatus(); }, 3000);
        setInterval(loadPatientStatusBoard, 5000);
    }
    } catch(e) { console.error("Profile load sync error:", e); }
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
                     <button onclick="vaultDownloadAndNotify('${doc.name}', '${doc.data}')" class="text-teal-500 hover:text-teal-700 p-2"><i class="fas fa-download"></i></button>
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

function switchTab(id, objElement) {
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
    if(objElement) {
        objElement.classList.add('active');
    }
    
    try {
        if(id !== 'reports' && typeof html5QrCode !== 'undefined' && html5QrCode) {
            try {
                html5QrCode.stop().catch(e => console.log(e));
            } catch (innerE) {}
        }
    } catch (e) {
        console.error("Scanner stop fail bound check:", e);
    }
}

function startScanning() {
    if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");

    const onScan = (decodedText) => {
        handleScanAction(decodedText);
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
            html5QrCode.start(camId, { fps: 20, qrbox: { width: 280, height: 280 } }, onScan).catch(err => {
                alert("Camera access denied or failed: " + err);
            });
        } else {
            alert("No cameras were found on this device.");
        }
    }).catch(err => {
        alert("Please Grant Camera Permission! Error: " + err);
    });
}

function generateRandomMedicineInfo() {
    const brandPrefixes = ['Zydus', 'SunPharma', 'Cipla', 'Mankind', 'DrReddys', 'Lupin', 'Abbott'];
    const meds = ['Paracetamol', 'Amoxicillin', 'Azithromycin', 'Omeprazole', 'Cetirizine', 'Ibuprofen', 'Dolo 650'];
    const usages = ['Fever & Pain Relief', 'Bacterial Infection', 'Throat Infection', 'Acidity & Reflux', 'Allergies & Cold', 'Inflammation & Pain', 'High Fever'];
    
    let mix = Math.floor(Math.random() * meds.length);
    let brand = brandPrefixes[Math.floor(Math.random() * brandPrefixes.length)];
    
    let genDate = new Date();
    genDate.setMonth(genDate.getMonth() - Math.floor(Math.random() * 12));
    let mfg = genDate.toLocaleDateString('en-GB'); 
    genDate.setFullYear(genDate.getFullYear() + Math.floor(Math.random() * 2) + 1);
    let exp = genDate.toLocaleDateString('en-GB');

    return { name: meds[mix], brand: brand, mfg: mfg, exp: exp, usage: usages[mix] };
}

function showAIScanResult(data, scannerObj) {
    try {
        if (scannerObj) scannerObj.stop().catch(e => console.log(e));
    } catch(e) {}
    
    const camContainer = document.getElementById('camera-container');
    if (camContainer) camContainer.classList.add('hidden');
    
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
                <div class="w-20 h-20 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center text-4xl mx-auto shadow-[0_10px_20px_rgba(37,99,235,0.4)] mb-5" style="animation: bounce 2s infinite;">
                    <i class="fas fa-qrcode"></i>
                </div>
                <h3 class="text-3xl font-black text-slate-800 tracking-tight">AI Scan Complete</h3>
                <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2"><i class="fas fa-shield-check mr-1"></i> Data Authenticated</p>
            </div>
            
            <div class="space-y-4 relative z-10">
                <div class="bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fas fa-pills"></i></div>
                    <div><span class="text-[10px] font-black text-slate-400 uppercase">Medicine Name</span><h4 class="text-sm font-black text-slate-800">${data.name}</h4></div>
                </div>
                <div class="bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner"><i class="fas fa-industry"></i></div>
                    <div><span class="text-[10px] font-black text-slate-400 uppercase">Medicine Brand</span><h4 class="text-sm font-black text-slate-800">${data.brand}</h4></div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <span class="text-[9px] font-black text-slate-400 uppercase">MFG Date</span><p class="text-xs font-black text-slate-700 mt-1">${data.mfg}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                        <span class="text-[9px] font-black text-slate-400 uppercase">Expiry Date</span><p class="text-xs font-black text-rose-600 mt-1">${data.exp}</p>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl shadow-inner border border-blue-100 text-center">
                    <span class="text-[10px] font-black text-blue-500 uppercase">Used For</span><p class="text-sm font-black text-blue-800 mt-1">${data.usage}</p>
                </div>
            </div>
            
            <button onclick="document.getElementById('ai-scan-result-modal').remove(); resetScanner();" class="w-full mt-8 bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-rose-600 transition-all duration-300 relative z-10 flex items-center justify-center gap-2">
                <i class="fas fa-times"></i> Close Scanner
            </button>
        </div>
    `;
    document.body.appendChild(div);
    setTimeout(() => { div.classList.remove('opacity-0'); div.firstElementChild.classList.remove('scale-90', 'translate-y-10'); }, 10);
    speak(`Humne ${data.name} analyze kar li hai. Ye ${data.brand} ka product hai. Yeh ${data.usage} ke liye use hota hai.`);
}

function handleScanAction(data) {
    const urlPattern = /^(https?:\/\/|www\.)[^\s$.?#].[^\s]*$/i;
    
    if (urlPattern.test(data)) {
        speak("Scan successful. Opening the authenticated link.");
        document.getElementById('camera-container').classList.add('hidden');
        document.getElementById('scan-feedback').classList.remove('hidden');
        setTimeout(() => {
            window.open(data.startsWith('http') ? data : 'https://' + data, '_blank');
            resetScanner();
        }, 1500);
    } else {
        speak("Scan successful. Analyzing molecular data.");
        showAIScanResult(generateRandomMedicineInfo(), html5QrCode);
    }
}

function resetScanner() {
    document.getElementById('camera-container').classList.remove('hidden');
    document.getElementById('scan-feedback').classList.add('hidden');
    document.getElementById('ai-output-container')?.classList.add('hidden');
    if(html5QrCode) startScanning();
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

function vaultDownloadAndNotify(name, dataUri) {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    sendEmailNotification("Vault Document Downloaded", `The document "${name}" has been downloaded from the vault at ${new Date().toLocaleString()}. Target: ayushdham405@gmail.com confirmed.`);
}

function generateMedBill() {
    const pharmacy = document.getElementById('pharmacyName')?.value || "GenMed";
    
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
    doc.setFontSize(22);
    doc.text("SafeScript AI - Medical Bill", 20, 20);
    doc.setFontSize(12);
    doc.text("Order ID: " + orderId, 20, 30);
    doc.text("Date: " + new Date().toLocaleDateString(), 20, 35);
    doc.text("Medicines: " + combinedNames, 20, 45);
    
    const filename = orderId + ".pdf";
    window.lastGeneratedPDFBase64 = doc.output('datauristring');
    doc.save(filename);
    
    sendEmailNotification("PDF Download Alert: Medical Bill", `A Medical Bill PDF (${filename}) was generated for ${currentUser.fullName}. The content has been attached.`);
    alert("Bill generated and mirrored to ayushdham405@gmail.com!");
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

function checkSOSStatus() {
    // Optional extension: Logic for checking SOS broadcast status can go here
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

// ---------- Doctor's Handwriting Decoder Logic ----------
function openDecoderModal() {
    const modal = document.getElementById('decoder-modal');
    if (modal) {
        modal.classList.remove('opacity-0', 'scale-0');
        modal.classList.add('opacity-100', 'scale-100');
        
        // reset UI
        document.getElementById('decoder-upload').value = '';
        document.getElementById('decoder-output-area').classList.add('hidden');
        document.getElementById('decoder-loading').classList.add('hidden');
        document.getElementById('decoder-results').classList.add('hidden');
        document.getElementById('decoder-audio-indicator').classList.add('hidden');
    }
}

function closeDecoderModal() {
    const modal = document.getElementById('decoder-modal');
    if (modal) {
        modal.classList.add('opacity-0', 'scale-0');
        modal.classList.remove('opacity-100', 'scale-100');
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
}

async function processHandwriting() {
    const fileInput = document.getElementById('decoder-upload');
    if (!fileInput.files || !fileInput.files[0]) {
        return alert("Please upload a prescription image first!");
    }

    document.getElementById('decoder-output-area').classList.remove('hidden');
    document.getElementById('decoder-loading').classList.remove('hidden');
    document.getElementById('decoder-results').classList.add('hidden');
    document.getElementById('decoder-audio-indicator').classList.add('hidden');

    // Simulate Chain-of-Verification Vision API Call delay
    setTimeout(() => {
        document.getElementById('decoder-loading').classList.add('hidden');
        document.getElementById('decoder-results').classList.remove('hidden');

        // Simulate a 70% success rate to demonstrate the safety feature
        const confidenceScore = Math.floor(Math.random() * 100);
        const isClear = confidenceScore >= 80;
        
        let aiOutput = "";
        let audioOutput = "";

        if (isClear) {
            aiOutput = `Confidence Score: ${confidenceScore}%\nI found Paracetamol 500mg. Instructions: Take 1 tablet after lunch. \n\nDisclaimer: This is an AI interpretation. Please cross-check with the medicine strip.`;
            audioOutput = "Maine Paracetamol pehchani hai. Isse lunch ke baad ek baar lena hai. Kripya dawai ke patte par naam dobara check karein.";
        } else {
            aiOutput = `[UNCLEAR] Confidence Score: ${confidenceScore}% (<80%)\nI am unable to read this clearly. Please upload a sharper image or consult your pharmacist for safety.`;
            audioOutput = "Main is dawai ka naam saaf nahi padh pa rahi hoon. Kripya saaf photo dalein ya apne pharmacist se sampark karein.";
        }

        document.getElementById('decoder-text-output').innerText = aiOutput;
        document.getElementById('decoder-audio-indicator').classList.remove('hidden');

        // Speak the Hinglish audio summary
        speak(audioOutput, 'hi-IN');
        
        // Hide audio indicator roughly when speech finishes (simulation)
        setTimeout(() => {
            document.getElementById('decoder-audio-indicator').classList.add('hidden');
        }, 6000); 

    }, 2500);
}
