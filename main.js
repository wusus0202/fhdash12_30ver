// 下拉選單開關
const sourceBtn = document.getElementById('source-selector');
const sourceList = document.getElementById('source-list');
sourceBtn.addEventListener('click', () => {
  sourceList.classList.toggle('hidden');
});

// 下拉選單選擇事件
sourceList.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', () => {
    const val = li.dataset.source;
    sourceBtn.textContent = li.textContent + ' ▼';
    sourceList.classList.add('hidden');

    // 根據選擇顯示格子
    const plantCards = document.getElementById('plant-cards');
    if (val === 'E') {
      plantCards.style.display = 'grid';
    } else {
      plantCards.style.display = 'none';
    }
  });
});

// 時鐘更新
function updateClock() {
  const now = new Date();
  document.getElementById('date-display').textContent = now.toLocaleDateString();
  document.getElementById('time-display').textContent = now.toLocaleTimeString();
  requestAnimationFrame(updateClock);
}
updateClock();
