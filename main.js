* { box-sizing: border-box; margin:0; padding:0; }
body { font-family: system-ui; background: #f2f2f2; }

/* Header */
.header {
  height: 60px; background: #d9cecd;
  display:flex; align-items:center; padding:0 20px; position:relative;
}
#data-status { position:absolute; right:20px; font-size:12px; }

/* Layout */
.app-container { display:flex; height: calc(100vh - 60px); }
.sidebar { width:260px; background:#4a4545; color:#fff; padding:20px; display:flex; flex-direction:column; }
.main { flex:1; padding:20px; display:flex; flex-direction:column; gap:20px; }

/* Dropdown */
.dropdown-btn { padding:10px; border-radius:8px; cursor:pointer; background:#666; color:#fff; border:none; }
.dropdown-list { list-style:none; margin-top:5px; background:#555; border-radius:8px; overflow:hidden; }
.dropdown-list.hidden { display:none; }
.dropdown-list li { padding:10px; cursor:pointer; color:#fff; }
.dropdown-list li:hover { background:#777; }

/* Menu */
.menu { margin-top:20px; display:flex; flex-direction:column; gap:10px; }
.menu div { background:#5b5555; padding:12px; border-radius:8px; cursor:pointer; }
.menu div:hover { background:#777; }

/* Clock */
.clock { margin-top:auto; display:flex; gap:10px; align-items:center; background:#5b5555; padding:10px; border-radius:12px; color:#fff; }
.clock svg { width:60px; height:60px; }
.clock-digital { font-size:12px; }

/* Columns & Cards */
.columns { display:grid; grid-template-columns: 2fr 1fr; gap:20px; }
.pm25 { background:#e8e8e8; border-radius:16px; padding:20px; text-align:center; font-size:18px; }
.pm25-value { font-size:28px; margin-top:10px; }

.right-stack { display:flex; flex-direction:column; gap:10px; }
.right-card { background:#e8e8e8; border-radius:12px; padding:15px; text-align:center; }

.connected-group { display:flex; background:#e8e8e8; border-radius:16px; }
.connected-card { flex:1; padding:15px; text-align:center; border-right:1px solid #ccc; }
.connected-card:last-child { border-right:none; }

.small-card-row { display:flex; gap:10px; }
.small-card { flex:1; background:#e8e8e8; border-radius:16px; padding:15px; text-align:center; }

/* Modal */
.modal-overlay { position:fixed; inset:0; background: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; display:none; }
.modal-overlay.active { display:flex; }
.modal-content { background:#fff; width:70%; height:60%; border-radius:16px; padding:20px; display:flex; flex-direction:column; }
.modal-header { display:flex; justify-content:space-between; align-items:center; }
.modal-close { cursor:pointer; }
.modal-body { margin-top:20px; background:#f5f5f5; flex:1; padding:10px; border-radius:8px; overflow:auto; }
