const config = {
    'A': { name: '小芳堂', id: 'B827EB63D1C8', type: 'lass' },
    'B': { name: '司令台', id: 'B827EBC2994D', type: 'lass' },
    'C': { name: '學務處', id: 'B827EB797224', type: 'lass' },
    'E': { name: '植物觀測', type: 'gas' }
};

const GAS_URL = "https://script.google.com/macros/s/AKfycbzAaqP79kMX9Uq_QtIqnwMx8tp2v62k6H5lDOCtCZV2W73NwfWN9kFdMz0Myalx2vxRFw/exec"; 

let currentSrc = 'A';
let gauge, historyChart, dataInterval;

// --- Helper: Logic for Level-Based Colors ---
function getColorByLevel(type, value) {
    if (value === null || value === undefined || isNaN(value)) return '#666'; 

    switch (type) {
        case 'temp': // Temperature logic
            if (value < 18) return '#007bff'; // Cold (Blue)
            if (value <= 28) return '#3aa02d'; // Comfortable (Green)
            return '#fa0000'; // Hot (Red)

        case 'humi': // Humidity logic
            if (value < 40) return '#ff9800'; // Dry (Orange)
            if (value <= 70) return '#3aa02d'; // Ideal (Green)
            return '#007bff'; // Too Humid (Blue)

        case 'co2': // CO2 logic
            if (value < 800) return '#3aa02d';  // Fresh (Green)
            if (value < 1000) return '#fbc02d'; // Warning (Yellow)
            return '#fa0000'; // Poor (Red)

        case 'tvoc': // TVOC logic
            if (value < 300) return '#3aa02d'; // Safe
            return '#fa0000'; // High

        case 'soil': // Soil Moisture
            if (value < 20) return '#fa0000'; // Needs Water
            return '#3aa02d'; // Healthy
            
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

async function fetchPlantData() {
    try {
        const res = await fetch(GAS_URL, { redirect: "follow" });
        const data = await res.json();
        const last = data[data.length - 1]; 

        // Extract values
        const t = last["溫度"] || last.temp;
        const h = last["濕度"] || last.humi;
        const s = last["土壤濕度"] || last.soil;
        const c = last["CO2"] || last.co2;

        // Update Plant UI with colors
        const pTemp = document.getElementById('p-temp');
        pTemp.textContent = t || "--";
        pTemp.style.color = getColorByLevel('temp', t);

        const pHumi = document.getElementById('p-humi');
        pHumi.textContent = h || "--";
        pHumi.style.color = getColorByLevel('humi', h);

        const pSoil = document.getElementById('p-soil');
        pSoil.textContent = s || "--";
        pSoil.style.color = getColorByLevel('soil', s);

        const pCo2 = document.getElementById('p-co2');
        pCo2.textContent = c || "--";
        pCo2.style.color = getColorByLevel('co2', c);
        
        document.getElementById('data-status').innerHTML = `● 植物數據更新成功`;
    } catch (e) { 
        console.error(e);
        document.getElementById('data-status').innerHTML = `● 植物系統連線失敗`; 
    }
}

function updateLassUI(d) {
    const pm = Math.round(d.s_d0);
    const pmColor = pm < 30 ? '#3aa02d' : (pm < 70 ? '#fffd21' : '#fa0000');
    
    // PM2.5 Update
    const pmValEl = document.getElementById('pm25-val');
    pmValEl.textContent = pm;
    pmValEl.style.color = pmColor;

    const notice = document.getElementById('aqi-notice');
    notice.textContent = pm < 30 ? '良好' : '普通';
    notice.style.backgroundColor = pmColor;

    gauge.data.datasets[0].backgroundColor = [pmColor, '#e0e0e0'];
    gauge.data.datasets[0].data = [pm, 150 - pm];
    gauge.update();

    // Temperature Update
    const tempEl = document.getElementById('temp-display');
    tempEl.textContent = `${d.s_t0.toFixed(1)} °C`;
    tempEl.style.color = getColorByLevel('temp', d.s_t0);

    // Humidity Update
    const humiEl = document.getElementById('humi-display');
    humiEl.textContent = `${Math.round(d.s_h0)} %`;
    humiEl.style.color = getColorByLevel('humi', d.s_h0);

    // CO2 Update
    const co2El = document.getElementById('co2-display');
    co2El.textContent = `${Math.round(d.s_g8)} ppm`;
    co2El.style.color = getColorByLevel('co2', d.s_g8);

    // TVOC Update
    const tvocEl = document.getElementById('tvoc-display');
    tvocEl.textContent = `${Math.round(d.s_gg || 0)} ppb`;
    tvocEl.style.color = getColorByLevel('tvoc', d.s_gg);
}

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
