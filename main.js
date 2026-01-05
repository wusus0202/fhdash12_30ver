/* Dropdown */
const sourceBtn = document.getElementById('source-btn');
const sourceList = document.getElementById('source-list');

sourceBtn.onclick = () => sourceList.classList.toggle('hidden');
sourceList.querySelectorAll('li').forEach(li => {
  li.onclick = () => {
    sourceBtn.textContent = li.textContent + ' ▼';
    sourceList.classList.add('hidden');
  };
});

/* Menu Modal */
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');

document.querySelectorAll('.menu div').forEach(item => {
  item.onclick = () => {
    modalTitle.textContent = item.textContent + ' 歷史數據';
    modal.classList.add('active');
  };
});

document.getElementById('modal-close').onclick = () => modal.classList.remove('active');
modal.onclick = e => { if(e.target===modal) modal.classList.remove('active'); };

/* Clock */
function updateClock() {
  const now = new Date();
  document.getElementById('date').textContent = now.toLocaleDateString();
  document.getElementById('time').textContent = now.toLocaleTimeString();
  const secLine = document.getElementById('sec');
  secLine.setAttribute('transform', `rotate(${now.getSeconds()*6} 50 50)`);
}
setInterval(updateClock,1000);
updateClock();
