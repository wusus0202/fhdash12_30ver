* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui; background: #f2f2f2; }

.header {
  height: 70px;
  background: #d9cecd;
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: relative;
}

#data-status {
  position: absolute;
  right: 24px;
  font-size: 12px;
}

.app-container { height: calc(100vh - 70px); }
.app { display: flex; height: 100%; }

/* Sidebar */
.sidebar {
  width: 260px;
  background: #4a4545;
  color: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.dropdown-btn {
  padding: 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.dropdown-list {
  list-style: none;
  padding: 0;
  margin: 8px 0;
  background: #5b5555;
  border-radius: 8px;
}
.dropdown-list.hidden { display: none; }
.dropdown-list li {
  padding: 10px;
  cursor: pointer;
}
.dropdown-list li:hover { background: #777; }

.menu {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.menu div {
  background: #5b5555;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
}
.menu div:hover { background: #777; }

/* Clock */
.clock {
  margin-top: auto;
  background: #5b5555;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  gap: 12px;
}
.clock svg { width: 80px; }
.clock-digital { font-size: 13px; }

/* Main */
.main {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.columns {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
}

.pm25 {
  grid-column: 1 / span 2;
  background: #e8e8e8;
  border-radius: 24px;
  padding: 24px;
  text-align: center;
}
.pm25-value { font-size: 32px; }

.right-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.right-card {
  background: #e8e8e8;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
}

.connected-group {
  grid-column: 1 / span 2;
  display: flex;
  background: #e8e8e8;
  border-radius: 24px;
}
.connected-card {
  flex: 1;
  padding: 20px;
  text-align: center;
  border-right: 1px solid #ccc;
}
.connected-card:last-child { border-right: none; }

.small-card-row {
  display: flex;
  gap: 24px;
}
.small-card {
  flex: 1;
  background: #e8e8e8;
  border-radius: 24px;
  padding: 20px;
  text-align: center;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: none;
  align-items: center;
  justify-content: center;
}
.modal-overlay.active { display: flex; }

.modal-content {
  background: #fff;
  width: 80%;
  height: 70%;
  border-radius: 16px;
  padding: 30px;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
}
.modal-close { cursor: pointer; }
.modal-body {
  margin-top: 20px;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 12px;
}
