console.log('✅ main.js loaded');
let currentSource = 'A';
let currentPageName = '小芳堂';
let isPlantMode = false;
let dataFetchInterval = null;

const sourceConfig = {
  A: { name: '小芳堂', deviceId: 'B827EBC2994D', hasData: true },
  B: { name: '司令台', deviceId: 'B827EBC2994D', hasData: true },
  C: { name: '小田原', deviceId: 'DEVICE_C', hasData: false },
  D: { name: '腳踏車練習場', deviceId: 'DEVICE_D', hasData: false },
  E: { name: '植物觀測', deviceId: 'PLANT_DEVICE', hasData: true }
};

const PLANT_GAS_URL = 'https://script.google.com/macros/s/AKfycbzfUbGWXNdxPdfW7R1c6H03X2g-711TN9L7I4Vn4vS1eyZlIIJtfsulAOz0Yl30-X1LpQ/exec';

document.addEventListener('DOMContentLoaded', () => {
  bindUI();
  switchPage('A');
  updateClock();
  setInterval(updateClock, 1000);
});

function bindUI() {
  const dropdownBtn = document.getElementById('source-selector');
  const dropdownList = document.getElementById('source-list');
  dropdownBtn.addEventListener('click', () => dropdownList.classList.toggle('hidden'));
  document.addEventListener('click', e => {
    if (!dropdownBtn.contains(e.target) && !dropdownList.contains(e.target))
      dropdownList.classList.add('hidden');
  });
  document.querySelectorAll('#source-list li').forEach(item => {
    item.addEventListener('click', () => {
      switchPage(item.dataset.source);
      dropdownList.classList.add('hidden');
    });
  });

  const modal = document.getElementById('history-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalType = document.getElementById('modal-type');
  document.querySelectorAll('.menu div[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      modalTitle.textContent = `${currentPageName} ${btn.textContent}`;
      modalType.textContent = btn.textContent;
      modal.classList.add('active');
    });
  });
  document.getElementById('modal-close').onclick = () => modal.classList.remove('active');
  modal.onclick = e => { if (e.target === modal) modal.classList.remove('active'); };
}

function switchPage(source) {
  currentSource = source;
  currentPageName = sourceConfig[source].name;
  document.getElementById('source-selector').textContent = currentPageName + ' ▼';

  if (dataFetchInterval) { clearInterval(dataFetchInterval); dataFetchInterval = null; }

  if (source === 'E') {
    isPlantMode = true;
    document.getElementById('standard-layout').style.display = 'none';
    document.getElementById('plant-layout').style.display = 'flex';
    updateDataStatus('🌱 植物即時數據', '#e8e8e8', '#888');
    fetchPlantData();
    dataFetchInterval = setInterval(fetchPlantData, 30000);
  } else {
    isPlantMode = false;
    document.getElementById('plant-layout').style.display = 'none';
    document.getElementById('standard-layout').style.display = 'flex';
    if (sourceConfig[source].hasData) {
      updateDataStatus('📡 連線中...', '#e8e8e8', '#888');
      fetchData();
      dataFetchInterval = setInterval(fetchData, 30000);
    } else {
      updateStaticData();
      updateDataStatus('⚠️ 暫無數據', '#e8e8e8', '#888');
    }
  }
}

async function fetchPlantData() {
  try {
    // 抓取同域 Serverless Function
    const res = await fetch("/api/getPlantData");
    const data = await res.json();
    console.log("植物資料:", data);

    if (data.length > 0) {
      const latest = data[data.length - 1]; // 取最後一筆
      document.getElementById('plant-pm25-value').textContent = latest["PM2.5"] + " μg/m³";
      document.getElementById('plant-humidity').textContent = latest["濕度"] + " %";
      document.getElementById('plant-temperature').textContent = latest["溫度"] + " °C";
      document.getElementById('plant-soil-humidity').textContent = latest["土壤濕度"] + " %";
      document.getElementById('plant-co2').textContent = latest["co2"] + " ppm";
    }

    updateDataStatus("✅ 植物資料正常", "#e8e8e8", "#333");
  } catch (err) {
    console.error("抓取植物資料失敗:", err);
    updateDataStatus("❌ 植物資料斷線", "#e8e8e8", "#888");
  }
}


async function fetchData() {
  try {
    const cfg = sourceConfig[currentSource];
    const res = await fetch(`https://pm25.lass-net.org/data/last.php?device_id=${cfg.deviceId}`);
    const data = await res.json();
    document.getElementById('pm25-value').textContent = (data.s_d0 ?? '--') + ' μg/m³';
    document.getElementById('temperature-card').textContent = (data.s_t0 ?? '--') + ' °C';
    document.getElementById('humidity-card').textContent = (data.s_h0 ?? '--') + ' %';
    document.getElementById('windspeed-card').textContent = (data.s_w0 ?? '--') + ' m/s';
    document.getElementById('sunlight-card').textContent = (data.s_lux0 ?? '--') + ' lux';
    document.getElementById('co2-card').textContent = (data.s_co2 ?? '--') + ' ppm';
    document.getElementById('tvoc-card').textContent = (data.s_tvoc ?? '--') + ' ppb';
    updateDataStatus('✅ 環境數據正常', '#e8e8e8', '#333');
  } catch(e) {
    console.error(e);
    updateDataStatus('❌ 環境數據斷線', '#e8e8e8', '#888');
  }
}

function updateStaticData() {
  ['pm25-value','temperature-card','humidity-card','windspeed-card','sunlight-card','co2-card','tvoc-card'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.textContent = '--';
  });
}

function updateDataStatus(text,bg,color){
  const el = document.getElementById('data-status');
  el.textContent = text;
  el.style.background = bg;
  el.style.color = color;
}

function updateClock(){
  const now = new Date();
  const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
  document.getElementById('hour-hand').style.transform = `rotate(${h*30+m*0.5}deg)`;
  document.getElementById('minute-hand').style.transform = `rotate(${m*6}deg)`;
  document.getElementById('second-hand').style.transform = `rotate(${s*6}deg)`;
  const days=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  document.getElementById('date-display').textContent = `${days[now.getDay()]} ${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}`;
  document.getElementById('time-display').textContent = now.toLocaleTimeString('zh-TW',{hour12:false});
}
