// /api/getPlantData.js
export default async function handler(req, res) {
  try {
    // 你的 Google Apps Script Web App URL (記得填上你自己的)
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzAaqP79kMX9Uq_QtIqnwMx8tp2v62k6H5lDOCtCZV2W73NwfWN9kFdMz0Myalx2vxRFw/exec";

    // 從 GAS 拿資料
    const response = await fetch(GAS_URL);
    const data = await response.json();

    // 設定 CORS header，讓前端可以抓
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    // 回傳資料給前端
    res.status(200).json(data);
  } catch (err) {
    console.error("Serverless Function 錯誤:", err);
    res.status(500).json({ error: err.message });
  }
}
