const config = {
    'A': { name: '小芳堂', id: 'B827EB63D1C8', type: 'lass' },
    'B': { name: '司令台', id: 'B827EBC2994D', type: 'lass' },
    'C': { name: '學務處', id: 'B827EB797224', type: 'lass' },
    'E': { name: '植物觀測', type: 'gas' }
};

const GAS_URL = "https://script.google.com/macros/s/AKfycbzAaqP79kMX9Uq_QtIqnwMx8tp2v62k6H5lDOCtCZV2W73NwfWN9kFdMz0Myalx2vxRFw/exec"; 

let currentSrc = 'A';
let gauge, historyChart, dataInterval;

// --- 1. Color Logic Helper ---
// This function determines the hex color based on the value and type of data
function getColorByLevel(type, value) {
    if (value === null || value === undefined || isNaN(value)) return '#666'; 

    switch (type) {
        case 'temp': // Temperature
            if (value < 18) return '#007bff'; // Cold (Blue)
            if (value <= 28) return '#3aa02d'; // Good (Green)
            return '#fa0000'; // Hot (Red)

        case 'humi': // Humidity
            if (value < 40) return '#ff9800'; // Dry (Orange)
            if (value <= 70) return '#3aa02d'; // Good (Green)
            return '#007bff'; // Humid (Blue)

        case 'co2': // Carbon Dioxide
            if (value < 800) return '#3aa02d';  // Fresh
            if (value < 1000) return '#fbc02d'; // Warning
            return '#fa0000'; // Poor

        case 'tvoc': // Organic Compounds
            if (value < 300) return '#3aa02d';
            return '#fa0000';

        case 'soil': // Soil Moisture
            if (value < 20) return '#fa0000'; // Dry
            return '#3aa02d'; // Wet
            
        default:
            return '#666';
    }
}

window.onload = () => {
    initGauge();
    setupDropdown();
    updateClock();
    setInterval(updateClock, 1000);
    switchPage('A'); 
};

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }

function setupDropdown() {
    const btn = document.getElementById('source-selector');
    const list = document.getElementById('source-list');
    btn.onclick = (e) => { e.stopPropagation(); list.classList.toggle('show'); };
    window.onclick = () => list.classList.remove('show');
    document.querySelectorAll('#source-list li').forEach(li => {
        li.onclick = () => {
            const src = li.dataset.source;
            btn.textContent = config[src].name + " ▼";
            switchPage(src);
        };
    });
}

function switchPage(src) {
    currentSrc = src;
    if (dataInterval) clearInterval(dataInterval);
    
    if (config[src].type === 'gas') {
        document.getElementById('lass-view').classList.add('hidden');
        document.getElementById('plant-view').classList.remove('hidden');
        fetchPlantData();
        dataInterval = setInterval(fetchPlantData, 30000);
    } else {
        document.getElementById('lass-view').classList.remove('hidden');
        document.getElementById('plant-view').classList.add('hidden');
        fetchLassData();
        dataInterval = setInterval(fetchLassData, 30000);
    }
}

// --- 2. LASS Data Handling (Outdoor) ---
async function fetchLassData() {
    const device = config[currentSrc];
    try {
        const res = await fetch(`https://pm25.lass-net.org/data/last.php?device_id=${device.id}`);
        const json = await res.json();
        const d = json.feeds[0][Object.keys(json.feeds[0])[0]];
        updateLassUI(d);
        document.getElementById('data-status').innerHTML = `● ${device.name} 更新成功`;
    } catch (e) { document.getElementById('data-status').innerHTML = `● LASS 連線錯誤`; }
}

function updateLassUI(d) {
    const pm = Math.round(d.s_d0);
    const pmColor = pm < 30 ? '#3aa02d' : (pm < 70 ? '#fbc02d' : '#fa0000');
    
    // PM2.5 Text & Gauge
    const pmValEl = document.getElementById('pm25-val');
    pmValEl.textContent = pm;
    pmValEl.style.setProperty('color', pmColor, 'important');

    const notice = document.getElementById('aqi-notice');
    notice.textContent = pm < 30 ? '良好' : '普通';
    notice.style.backgroundColor = pmColor;

    gauge.data.datasets[0].backgroundColor = [pmColor, '#e0e0e0'];
    gauge.data.datasets[0].data = [pm, 150 - pm];
    gauge.update();

    // Temperature
    const tEl = document.getElementById('temp-display');
    tEl.textContent = `${d.s_t0.toFixed(1)} °C`;
    tEl.style.setProperty('color', getColorByLevel('temp', d.s_t0), 'important');

    // Humidity
    const hEl = document.getElementById('humi-display');
    hEl.textContent = `${Math.round(d.s_h0)} %`;
    hEl.style.setProperty('color', getColorByLevel('humi', d.s_h0), 'important');

    // CO2
    const cEl = document.getElementById('co2-display');
    cEl.textContent = `${Math.round(d.s_g8)} ppm`;
    cEl.style.setProperty('color', getColorByLevel('co2', d.s_g8), 'important');

    // TVOC
    const vEl = document.getElementById('tvoc-display');
    vEl.textContent = `${Math.round(d.s_gg || 0)} ppb`;
    vEl.style.setProperty('color', getColorByLevel('tvoc', d.s_gg), 'important');
}

// --- 3. Plant Data Handling (Indoor/GAS) ---
async function fetchPlantData() {
    try {
        const res = await fetch(GAS_URL, { redirect: "follow" });
        const data = await res.json();
        const last = data[data.length - 1]; 

        const t = parseFloat(last["溫度"] || last.temp);
        const h = parseFloat(last["濕度"] || last.humi);
        const s = parseFloat(last["土壤濕度"] || last.soil);
        const c = parseFloat(last["CO2"] || last.co2);

        // Update Plant UI Elements and Colors
        updateElementWithColor('p-temp', t, 'temp');
        updateElementWithColor('p-humi', h, 'humi');
        updateElementWithColor('p-soil', s, 'soil');
        updateElementWithColor('p-co2', c, 'co2');
        
        document.getElementById('data-status').innerHTML = `● 植物數據更新成功`;
    } catch (e) { 
        console.error(e);
        document.getElementById('data-status').innerHTML = `● 植物系統連線失敗`; 
    }
}

// Helper to update text and color at once
function updateElementWithColor(id, val, type) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = isNaN(val) ? "--" : val;
        el.style.setProperty('color', getColorByLevel(type, val), 'important');
    }
}

// --- 4. Modal & Charting ---
function openModal(label, key) {
    document.getElementById('modal-title').innerText = `${label} 趨勢圖`;
    document.getElementById('history-modal').classList.add('active');
    
    const ctx = document.getElementById('historyChart').getContext('2d');
    if (historyChart) historyChart.destroy();
    
    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
            datasets: [{
                label: label,
                data: [22, 25, 27, 24, 26, 23],
                borderColor: '#4a4545',
                backgroundColor: 'rgba(74, 69, 69, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function navToModal(label, key) { 
    if (window.innerWidth <= 768) toggleSidebar(); 
    openModal(label, key); 
}

function closeModal() { document.getElementById('history-modal').classList.remove('active'); }

// --- 5. Gauges & Clock ---
function initGauge() {
    const ctx = document.getElementById('pm25Gauge').getContext('2d');
    gauge = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: [0, 150], backgroundColor: ['#3aa02d', '#e0e0e0'], circumference: 270, rotation: 225, cutout: '80%', borderRadius: 10 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function updateClock() {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    document.getElementById('hr').style.transform = `translateX(-50%) rotate(${(h % 12) * 30 + m * 0.5}deg)`;
    document.getElementById('mn').style.transform = `translateX(-50%) rotate(${m * 6}deg)`;
    document.getElementById('sc').style.transform = `translateX(-50%) rotate(${s * 6}deg)`;
    document.getElementById('time-display').textContent = now.toLocaleTimeString('zh-TW', {hour12: false});
    document.getElementById('date-display').textContent = now.toLocaleDateString('zh-TW', { weekday: 'short', month: 'numeric', day: 'numeric' });
}
