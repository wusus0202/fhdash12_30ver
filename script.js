const config = {
    'A': { name: '小芳堂', id: 'B827EB63D1C8', type: 'lass' },
    'B': { name: '司令台', id: 'B827EBC2994D', type: 'lass' },
    'C': { name: '小田原', type: 'none' },
    'D': { name: '腳踏車練習場', type: 'none' },
    'E': { name: '植物觀測', id: 'AKfycbzAaqP79kMX9Uq_QtIqnwMx8tp2v62k6H5lDOCtCZV2W73NwfWN9kFdMz0Myalx2vxRFw', type: 'gas' }
};

let currentSrc = 'A';
let gauge, historyChart, dataTimer;

window.onload = () => {
    initGauge();
    updateClock();
    setInterval(updateClock, 1000);
    setupDropdown();
    switchPage('A');
};

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
    if (dataTimer) clearInterval(dataTimer);
    
    updateAllToNull();
    document.getElementById('standard-layout').classList.add('hidden');
    document.getElementById('no-data-layout').classList.add('hidden');
    document.getElementById('pm25-section').style.opacity = "1";
    document.getElementById('extra-label').textContent = "風速";

    if (config[src].type === 'lass') {
        document.getElementById('standard-layout').classList.remove('hidden');
        fetchData();
        dataTimer = setInterval(fetchData, 30000);
    } else if (config[src].type === 'gas') {
        document.getElementById('standard-layout').classList.remove('hidden');
        document.getElementById('pm25-section').style.opacity = "0.3";
        document.getElementById('extra-label').textContent = "土壤濕度";
        fetchPlantData();
        dataTimer = setInterval(fetchPlantData, 60000);
    } else {
        document.getElementById('no-data-layout').classList.remove('hidden');
    }
}

function initGauge() {
    const ctx = document.getElementById('pm25Gauge').getContext('2d');
    gauge = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: [0, 150], backgroundColor: ['#95b991', '#e8e8e8'], borderWidth: 0, circumference: 270, rotation: 225, cutout: '80%', borderRadius: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

async function fetchData() {
    try {
        const res = await fetch(`https://pm25.lass-net.org/data/last.php?device_id=${config[currentSrc].id}`);
        const json = await res.json();
        if (!json.feeds || json.feeds.length === 0) return;

        const d = json.feeds[0][Object.keys(json.feeds[0])[0]];
        updateUI(d.s_d0, d.s_t0, d.s_h0, d.s_g8, d.s_gg, "--");
        
        document.getElementById('data-status').innerHTML = `● ${config[currentSrc].name} 已更新`;
        document.getElementById('data-status').style.color = '#2e7d32';
    } catch (e) { console.error(e); updateAllToNull(); }
}

async function fetchPlantData() {
    try {
        const gasUrl = `https://script.google.com/macros/s/${config[currentSrc].id}/exec`;
        const res = await fetch(gasUrl);
        const data = await res.json();
        
        if (data && data.length > 0) {
            const last = data[data.length - 1];
            updateUI(
                last["PM2.5"] || 0, 
                parseFloat(last["溫度"]), 
                parseFloat(last["濕度"]), 
                last["CO2"], 
                "--", 
                last["土壤濕度"] + " %"
            );
            document.getElementById('data-status').innerHTML = `● 植物監測站 已更新`;
            document.getElementById('data-status').style.color = '#2e7d32';
        }
    } catch (e) { 
        console.error("GAS Fetch Error:", e); 
        document.getElementById('data-status').innerHTML = `● GAS 讀取失敗`;
        document.getElementById('data-status').style.color = '#d32f2f';
    }
}

function updateUI(pm25, temp, humi, co2, tvoc, extra) {
    document.getElementById('pm25-val').textContent = pm25 != null ? Math.round(pm25) : "--";
    const color = pm25 < 30 ? '#3aa02d' : (pm25 < 70 ? '#fffd21' : '#fa0000');
    document.getElementById('aqi-notice').textContent = pm25 < 30 ? '良好' : (pm25 < 70 ? '普通' : '警惕');
    document.getElementById('aqi-notice').style.backgroundColor = color;
    gauge.data.datasets[0].backgroundColor = [color, '#e8e8e8'];
    gauge.data.datasets[0].data = [pm25, Math.max(0, 150 - pm25)];
    gauge.update();

    document.getElementById('temp-display').textContent = temp != null ? `${temp.toFixed(1)} °C` : `-- °C`;
    document.getElementById('humi-display').textContent = humi != null ? `${humi.toFixed(0)} %` : `-- %`;
    document.getElementById('co2-display').textContent = co2 != null ? `${co2} ppm` : `-- ppm`;
    document.getElementById('tvoc-display').textContent = tvoc != null ? `${tvoc} ppb` : `-- ppb`;
    document.getElementById('extra-display').textContent = extra;

    if (temp != null && humi != null) {
        let prob = (Math.pow(humi, 2) / 115) + (temp > 28 ? 8 : 0);
        prob = Math.min(95, Math.max(5, prob));
        document.getElementById('precip-display').textContent = `${prob.toFixed(0)} %`;
        document.getElementById('weather-icon').textContent = prob > 70 ? '🌧️' : (prob > 40 ? '☁️' : '⛅');
    }
}

function updateAllToNull() {
    const ids = ['pm25-val', 'temp-display', 'humi-display', 'co2-display', 'tvoc-display', 'extra-display', 'precip-display'];
    ids.forEach(id => { document.getElementById(id).textContent = "--"; });
    document.getElementById('data-status').innerHTML = '● 數據讀取中...';
    document.getElementById('data-status').style.color = '#777';
}

function updateClock() {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    document.getElementById('hr').style.transform = `translateX(-50%) rotate(${(h % 12) * 30 + m * 0.5}deg)`;
    document.getElementById('mn').style.transform = `translateX(-50%) rotate(${m * 6}deg)`;
    document.getElementById('sc').style.transform = `translateX(-50%) rotate(${s * 6}deg)`;
    document.getElementById('time-display').textContent = now.toLocaleTimeString('zh-TW', {hour12: false});
    document.getElementById('date-display').textContent = now.toLocaleDateString('zh-TW', { weekday: 'long', month: 'numeric', day: 'numeric' });
}

function openModal(t) {
    document.getElementById('modal-title').textContent = t + " 歷史趨勢";
    document.getElementById('history-modal').classList.add('active');
    const parent = document.getElementById('chartParent');
    parent.innerHTML = '<canvas id="historyChart"></canvas>';
    setTimeout(() => {
        const ctx = document.getElementById('historyChart').getContext('2d');
        historyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
                datasets: [{ label: t, data: [15, 22, 28, 24, 19, 21], borderColor: '#4a4545', tension: 0.4, fill: true, backgroundColor: 'rgba(74, 69, 69, 0.05)' }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }, 50);
}

function closeModal() { document.getElementById('history-modal').classList.remove('active'); }
