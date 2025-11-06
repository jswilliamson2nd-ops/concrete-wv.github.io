/* ACI WV · calculators/calcs.js
   Tools: #volume, #trucks, #cylinders, #convert, #water, #temp
   - Mobile-first, no deps
   - LocalStorage persistence
   - Deep-link query params (read & write)
   - Copy results buttons
*/

(function(){
  // ---------------- Utilities ----------------
  const $id = (id, root=document) => root.getElementById(id);
  const qs  = (sel, root=document) => root.querySelector(sel);

  const fmt = (n, d=2) => (Number.isFinite(n) ? n.toFixed(d) : '—');
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const toNum = (val) => {
    if (val == null) return null;
    const s = String(val).trim().replace(/,/g,'');
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  // URL params inside the hash (e.g. #volume?len=24&wid=30)
  function readHash(){
    const h = location.hash || '';
    const [hash, q=''] = h.split('?');
    const params = new URLSearchParams(q);
    return { hash: hash.toLowerCase(), params };
  }
  function writeHash(hash, obj){
    const p = new URLSearchParams();
    Object.entries(obj || {}).forEach(([k,v])=>{
      if (v !== '' && v != null && !Number.isNaN(v)) p.set(k, String(v));
    });
    const next = p.toString() ? `${hash}?${p.toString()}` : hash;
    if (location.hash !== next) history.replaceState(null, '', next);
  }

  // Local storage helpers
  const LS_KEY = 'aciwv_calc_state_v1';
  const LS_TOOL_KEY = 'aciwv_calc_last_tool';
  function loadState(){
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
  }
  function saveState(state){
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
  }
  const state = loadState();

  // Copy helper
  async function copyText(text){
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch {}
      ta.remove(); return ok;
    }
  }

  // Small UI helpers
  function pillCopy(html, getText){
    const wrap = document.createElement('div');
    wrap.style.position='relative';
    wrap.innerHTML = html;
    const out = wrap.firstElementChild;
    const btn = document.createElement('button');
    btn.textContent = 'Copy';
    btn.className = 'btn';
    btn.style.position='absolute';
    btn.style.top='8px';
    btn.style.right='8px';
    btn.style.padding='6px 10px';
    btn.style.fontSize='12px';
    btn.addEventListener('click', async()=>{
      const ok = await copyText(getText());
      btn.textContent = ok ? 'Copied!' : 'Copy failed';
      setTimeout(()=>btn.textContent='Copy', 1200);
    });
    out.style.position='relative';
    out.appendChild(btn);
    return wrap;
  }

  // Mount point
  const mount = $id('tool');
  const titleNode = $id('tool-title');

  // ---------------- Router ----------------
  const tools = {
    '#volume': renderVolume,
    '#trucks': renderTrucks,
    '#cylinders': renderCylinders,
    '#convert': renderConvert,
    '#water': renderWater,
    '#temp': renderTemp,
  };

  function render(){
    let { hash, params } = readHash();

    // Auto-open last tool if no valid hash
    if (!hash || !tools[hash]) {
      const last = localStorage.getItem(LS_TOOL_KEY);
      if (last && tools[last]) { location.hash = last; return; }
    }

    if (!tools[hash]) {
      if (titleNode) titleNode.textContent = 'Select a calculator above';
      if (mount) mount.innerHTML = '<p class="muted">Pick a tool from the cards above.</p>';
      return;
    }
    localStorage.setItem(LS_TOOL_KEY, hash);
    tools[hash](params);
  }
  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', render);

  // =========================================================
  // VOLUME (yd³): slab / trench / column (cylindrical)
  // =========================================================
  function renderVolume(params){
    if (titleNode) titleNode.textContent = 'Volume (yd³) — slab / trench / column';
    if (!mount) return;

    const s = Object.assign({shape:'slab', len:'', wid:'', th_in:'', qty:'1', waste:'5',
                             trench_len:'', trench_w_in:'', trench_d_in:'', trench_qty:'1',
                             col_d_in:'', col_h_ft:'', col_qty:'1'}, state.volume||{});

    ['shape','len','wid','th_in','qty','waste','trench_len','trench_w_in','trench_d_in','trench_qty','col_d_in','col_h_ft','col_qty']
      .forEach(k => { if (params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Volume (yd³)</h2>
      <p class="muted">Estimate concrete volume with optional waste and quick truck-loads. Choose a shape:</p>

      <div class="input-row">
        <label>Shape<br>
          <select id="v_shape">
            <option value="slab">Slab / Pad (rectangular)</option>
            <option value="trench">Trench / Footing (linear)</option>
            <option value="column">Column (cylindrical)</option>
          </select>
        </label>
        <label>Waste (%)<br><input id="v_waste" type="number" step="0.1" min="0" max="30" placeholder="e.g., 5"></label>
      </div>

      <!-- Slab -->
      <section id="v_slab" class="card" style="margin-top:8px">
        <h3>Slab / Pad</h3>
        <div class="input-row">
          <label>Length (ft)<br><input id="v_len" type="number" step="0.01" min="0" placeholder="e.g., 32"></label>
          <label>Width (ft)<br><input id="v_wid" type="number" step="0.01" min="0" placeholder="e.g., 24"></label>
        </div>
        <div class="input-row">
          <label>Thickness (in)<br><input id="v_th" type="number" step="0.1" min="0" placeholder="e.g., 6"></label>
          <label>Quantity<br><input id="v_qty" type="number" step="1" min="1" value="1"></label>
        </div>
        <div class="out" id="v_out_slab">Enter dimensions.</div>
      </section>

      <!-- Trench -->
      <section id="v_trench" class="card" style="margin-top:8px; display:none">
        <h3>Trench / Footing</h3>
        <div class="input-row">
          <label>Total length (ft)<br><input id="vt_len" type="number" step="0.01" min="0" placeholder="e.g., 180"></label>
          <label>Width (in)<br><input id="vt_w" type="number" step="0.1" min="0" placeholder="e.g., 24"></label>
        </div>
        <div class="input-row">
          <label>Depth (in)<br><input id="vt_d" type="number" step="0.1" min="0" placeholder="e.g., 18"></label>
          <label>Quantity<br><input id="vt_qty" type="number" step="1" min="1" value="1"></label>
        </div>
        <div class="out" id="v_out_trench">Enter dimensions.</div>
      </section>

      <!-- Column -->
      <section id="v_column" class="card" style="margin-top:8px; display:none">
        <h3>Column (cylindrical)</h3>
        <div class="input-row">
          <label>Diameter (in)<br><input id="vc_d" type="number" step="0.1" min="0" placeholder="e.g., 18"></label>
          <label>Height (ft)<br><input id="vc_h" type="number" step="0.01" min="0" placeholder="e.g., 10"></label>
        </div>
        <div class="input-row">
          <label>Quantity<br><input id="vc_qty" type="number" step="1" min="1" value="1"></label>
          <div></div>
        </div>
        <div class="out" id="v_out_col">Enter dimensions.</div>
      </section>

      <section id="v_summary" style="margin-top:10px"></section>
    `;

    qs('#v_shape').value = s.shape;
    $id('v_waste').value = s.waste ?? '';

    $id('v_len').value  = s.len ?? '';
    $id('v_wid').value  = s.wid ?? '';
    $id('v_th').value   = s.th_in ?? '';
    $id('v_qty').value  = s.qty ?? '1';

    $id('vt_len').value = s.trench_len ?? '';
    $id('vt_w').value   = s.trench_w_in ?? '';
    $id('vt_d').value   = s.trench_d_in ?? '';
    $id('vt_qty').value = s.trench_qty ?? '1';

    $id('vc_d').value   = s.col_d_in ?? '';
    $id('vc_h').value   = s.col_h_ft ?? '';
    $id('vc_qty').value = s.col_qty ?? '1';

    function syncPanels(){
      const shape = qs('#v_shape').value;
      qs('#v_slab').style.display   = shape==='slab'   ? '' : 'none';
      qs('#v_trench').style.display = shape==='trench' ? '' : 'none';
      qs('#v_column').style.display = shape==='column' ? '' : 'none';
      compute();
    }

    function compute(){
      const shape = qs('#v_shape').value;
      const waste = clamp(toNum($id('v_waste').value) ?? 0, 0, 30);

      state.volume = Object.assign(state.volume||{}, { shape, waste: String(waste) });

      let ft3 = 0, qty = 1;

      if (shape==='slab'){
        const L = toNum($id('v_len').value);
        const W = toNum($id('v_wid').value);
        const Th= toNum($id('v_th').value);
        qty = clamp(toNum($id('v_qty').value) ?? 1, 1, 9999);
        if (L>0 && W>0 && Th>0){
          ft3 = L * W * (Th/12) * qty;
          $id('v_out_slab').innerHTML = `ft³: ${fmt(ft3,2)} (L×W×t × qty)`;
          Object.assign(state.volume, { len:String(L), wid:String(W), th_in:String(Th), qty:String(qty) });
          writeHash('#volume', { shape, len:L, wid:W, th_in:Th, qty, waste });
        } else {
          $id('v_out_slab').textContent = 'Enter dimensions.';
        }
      }
      else if (shape==='trench'){
        const L = toNum($id('vt_len').value);
        const W = toNum($id('vt_w').value);
        const D = toNum($id('vt_d').value);
        qty = clamp(toNum($id('vt_qty').value) ?? 1, 1, 9999);
        if (L>0 && W>0 && D>0){
          ft3 = L * (W/12) * (D/12) * qty;
          $id('v_out_trench').innerHTML = `ft³: ${fmt(ft3,2)} (L × W × D × qty)`;
          Object.assign(state.volume, { trench_len:String(L), trench_w_in:String(W), trench_d_in:String(D), trench_qty:String(qty) });
          writeHash('#volume', { shape, trench_len:L, trench_w_in:W, trench_d_in:D, trench_qty:qty, waste });
        } else {
          $id('v_out_trench').textContent = 'Enter dimensions.';
        }
      }
      else { // column
        const Dia = toNum($id('vc_d').value);
        const H   = toNum($id('vc_h').value);
        qty = clamp(toNum($id('vc_qty').value) ?? 1, 1, 9999);
        if (Dia>0 && H>0){
          const r_ft = (Dia/12)/2;
          ft3 = Math.PI * r_ft * r_ft * H * qty;
          $id('v_out_col').innerHTML = `ft³: ${fmt(ft3,2)} (π r² h × qty)`;
          Object.assign(state.volume, { col_d_in:String(Dia), col_h_ft:String(H), col_qty:String(qty) });
          writeHash('#volume', { shape, col_d_in:Dia, col_h_ft:H, col_qty:qty, waste });
        } else {
          $id('v_out_col').textContent = 'Enter dimensions.';
        }
      }

      saveState(state);

      const yd3 = ft3/27;
      const yd3w = yd3 * (1 + waste/100);

      const loads = [9.0, 9.5, 10.0].map(sz=>{
        const count = Math.ceil(yd3w / sz);
        const over  = count*sz - yd3w;
        return { sz, count, over };
      });

      const summaryText = [
        `Volume: ${fmt(yd3,3)} yd³`,
        `Waste: ${fmt(waste,1)}% → ${fmt(yd3w,3)} yd³ (incl.)`,
        `Loads (9.0): ${loads[0].count} | (9.5): ${loads[1].count} | (10.0): ${loads[2].count}`
      ].join('\n');

      const html = `
        <div class="card">
          <h3>Summary</h3>
          <div class="out" id="v_sum">
            Volume: ${fmt(yd3,3)} yd³<br>
            With waste ${fmt(waste,1)}%: <strong>${fmt(yd3w,3)} yd³</strong><br>
            <span class="small">Truck loads:</span><br>
            • 9.0 yd³: ${loads[0].count} (over ${fmt(loads[0].over,2)} yd³)<br>
            • 9.5 yd³: ${loads[1].count} (over ${fmt(loads[1].over,2)} yd³)<br>
            • 10.0 yd³: ${loads[2].count} (over ${fmt(loads[2].over,2)} yd³)
          </div>
        </div>
      `;
      const node = pillCopy(html, ()=>summaryText);
      const target = $id('v_summary');
      target.innerHTML = '';
      target.appendChild(node);
    }

    ['v_shape','v_waste','v_len','v_wid','v_th','v_qty','vt_len','vt_w','vt_d','vt_qty','vc_d','vc_h','vc_qty']
      .forEach(id => {
        const el = $id(id);
        if (!el) return;
        el.addEventListener('input', compute, { passive:true });
        el.addEventListener('change', compute, { passive:true });
      });

    qs('#v_shape').addEventListener('change', ()=>{
      state.volume = Object.assign(state.volume||{}, { shape: qs('#v_shape').value });
      saveState(state);
      syncPanels();
    });

    syncPanels();
  }

  // =========================================================
  // TRUCK LOADS helper
  // =========================================================
  function renderTrucks(params){
    if (titleNode) titleNode.textContent = 'Truck Loads Helper';
    if (!mount) return;

    const s = Object.assign({ yd3:'', waste:'0', size:'9.5' }, state.trucks||{});
    ['yd3','waste','size'].forEach(k => { if (params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Truck Loads Helper</h2>
      <p class="muted">Convert total yardage into truck counts. Shows 9.0 / 9.5 / 10.0 yd³ for comparison.</p>
      <div class="input-row">
        <label>Total concrete (yd³)<br><input id="t_total" type="number" step="0.01" min="0" placeholder="e.g., 54.25"></label>
        <label>Waste (%)<br><input id="t_waste" type="number" step="0.1" min="0" max="30" placeholder="0–30"></label>
      </div>
      <div class="input-row">
        <label>Primary truck size (yd³)<br>
          <select id="t_size">
            <option value="9">9.0</option>
            <option value="9.5">9.5</option>
            <option value="10">10.0</option>
          </select>
        </label>
        <div></div>
      </div>
      <section id="t_out_wrap"></section>
    `;

    $id('t_total').value = s.yd3 ?? '';
    $id('t_waste').value = s.waste ?? '0';
    $id('t_size').value = s.size ?? '9.5';

    function compute(){
      const yd = toNum($id('t_total').value) ?? 0;
      const waste = clamp(toNum($id('t_waste').value) ?? 0, 0, 30);
      const size = toNum($id('t_size').value) ?? 9.5;

      state.trucks = { yd3:String(yd), waste:String(waste), size:String(size) };
      saveState(state);
      writeHash('#trucks', { yd3: yd, waste, size });

      const ydW = yd * (1 + waste/100);
      const sizes = [9.0, 9.5, 10.0].map(sz=>{
        const count = Math.ceil(ydW / sz);
        const over  = count*sz - ydW;
        return { sz, count, over };
      });

      const primary = sizes.find(x => Math.abs(x.sz - size) < 0.001) || sizes[1];

      const text = [
        `Total (incl. waste): ${fmt(ydW,3)} yd³`,
        `Primary ${fmt(primary.sz,1)} yd³: ${primary.count} trucks (over ${fmt(primary.over,2)} yd³)`,
        `9.0 yd³: ${sizes[0].count} | 9.5 yd³: ${sizes[1].count} | 10.0 yd³: ${sizes[2].count}`
      ].join('\n');

      const html = `
        <div class="card">
          <h3>Loads</h3>
          <div class="out" id="t_out">
            Total (with waste): <strong>${fmt(ydW,3)} yd³</strong><br>
            Primary ${fmt(primary.sz,1)} yd³: <strong>${primary.count} trucks</strong> (over ${fmt(primary.over,2)} yd³)<br>
            <span class="small">Comparison:</span><br>
            • 9.0 yd³: ${sizes[0].count} (over ${fmt(sizes[0].over,2)} yd³)<br>
            • 9.5 yd³: ${sizes[1].count} (over ${fmt(sizes[1].over,2)} yd³)<br>
            • 10.0 yd³: ${sizes[2].count} (over ${fmt(sizes[2].over,2)} yd³)
          </div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $id('t_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['t_total','t_waste','t_size'].forEach(id=>{
      const el=$id(id);
      el.addEventListener('input', compute, { passive:true });
      el.addEventListener('change', compute, { passive:true });
    });
    compute();
  }

  // =========================================================
  // CYLINDER BREAK PLANNER
  // =========================================================
  function renderCylinders(params){
    if (titleNode) titleNode.textContent = 'Cylinder Break Planner';
    if (!mount) return;

    const s = Object.assign({ cast:'', time:'08:00', ages:'7,14,28' }, state.cylinders||{});
    ['cast','time','ages'].forEach(k => { if (params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Cylinder Break Planner</h2>
      <p class="muted">Enter the cast date/time and target ages (days). We’ll list the break dates in your local time.</p>
      <div class="input-row">
        <label>Cast date<br><input id="c_date" type="date"></label>
        <label>Time (HH:MM)<br><input id="c_time" type="time" step="60"></label>
      </div>
      <div class="input-row">
        <label>Ages (days, comma-sep)<br><input id="c_ages" type="text" placeholder="e.g., 7,14,28"></label>
        <div></div>
      </div>
      <section id="c_out_wrap"></section>
    `;

    const todayISO = new Date().toISOString().slice(0,10);
    $id('c_date').value = s.cast || todayISO;
    $id('c_time').value = s.time || '08:00';
    $id('c_ages').value = s.ages || '7,14,28';

    function compute(){
      const dStr = $id('c_date').value;
      const tStr = $id('c_time').value || '08:00';
      const agesStr = ($id('c_ages').value || '7,14,28').replace(/\s+/g,'');
      const ages = agesStr.split(',').map(x=>parseInt(x,10)).filter(x=>Number.isFinite(x) && x>=1 && x<=365);

      state.cylinders = { cast:dStr, time:tStr, ages:ages.join(',') };
      saveState(state);
      writeHash('#cylinders', { cast:dStr, time:tStr, ages:ages.join(',') });

      let base;
      if (dStr){
        const [hh,mm] = (tStr||'08:00').split(':').map(x=>parseInt(x,10)||0);
        const [Y,M,D] = dStr.split('-').map(n=>parseInt(n,10));
        base = new Date(Y, (M-1), D, hh, mm, 0, 0);
      }

      let rows = '';
      if (base && ages.length){
        rows = ages.map(a=>{
          const ms = a*24*60*60*1000;
          const dt = new Date(base.getTime() + ms);
          const dateStr = dt.toLocaleString([], { year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit' });
          return `<tr><td>${a} days</td><td>${dateStr}</td></tr>`;
        }).join('');
      }

      const text = (()=>{
        if (!base || !rows) return 'Enter cast date/time and ages.';
        const lines = ages.map(a=>{
          const ms = a*24*60*60*1000;
          const dt = new Date(base.getTime() + ms);
          return `${a} days: ${dt.toLocaleString()}`;
        });
        return lines.join('\n');
      })();

      const html = `
        <div class="card">
          <h3>Break Schedule</h3>
          <div class="out" id="c_out">
            <table style="width:100%; border-collapse:collapse">
              <thead>
                <tr><th style="text-align:left">Age</th><th style="text-align:left">Break date (local)</th></tr>
              </thead>
              <tbody>${rows || '<tr><td colspan="2">Enter cast date/time and ages.</td></tr>'}</tbody>
            </table>
            <div class="small" style="margin-top:6px">Advisory only. Confirm with your lab’s schedule and pickup times.</div>
          </div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $id('c_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['c_date','c_time','c_ages'].forEach(id=>{
      const el=$id(id);
      el.addEventListener('input', compute, { passive:true });
      el.addEventListener('change', compute, { passive:true });
    });
    compute();
  }

  // =========================================================
  // CONVERTER: psi↔MPa, pcf↔kg/m³, °F↔°C, ft³↔m³, lb↔kg, yd³↔m³
  // =========================================================
  function renderConvert(params){
    if (titleNode) titleNode.textContent = 'Unit Converter';
    if (!mount) return;

    const s = Object.assign({
      psi:'', mpa:'', pcf:'', kgm3:'', f:'', c:'', ft3:'', m3:'', lb:'', kg:'', yd3:'', m3yd:''
    }, state.convert||{});

    ['psi','mpa','pcf','kgm3','f','c','ft3','m3','lb','kg','yd3','m3yd'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Unit Converter</h2>
      <p class="muted">Quick conversions used around concrete work and reporting.</p>

      <div class="card">
        <h3>Pressure</h3>
        <div class="input-row">
          <label>psi<br><input id="cv_psi" type="number" step="0.1" placeholder="e.g., 4000"></label>
          <label>MPa<br><input id="cv_mpa" type="number" step="0.001" placeholder="e.g., 27.58"></label>
        </div>
      </div>

      <div class="card">
        <h3>Density</h3>
        <div class="input-row">
          <label>pcf<br><input id="cv_pcf" type="number" step="0.01" placeholder="e.g., 145"></label>
          <label>kg/m³<br><input id="cv_kgm3" type="number" step="0.1" placeholder="e.g., 2322"></label>
        </div>
      </div>

      <div class="card">
        <h3>Temperature</h3>
        <div class="input-row">
          <label>°F<br><input id="cv_f" type="number" step="0.1" placeholder="e.g., 68"></label>
          <label>°C<br><input id="cv_c" type="number" step="0.1" placeholder="e.g., 20"></label>
        </div>
      </div>

      <div class="card">
        <h3>Volume</h3>
        <div class="input-row">
          <label>ft³<br><input id="cv_ft3" type="number" step="0.001" placeholder="e.g., 27"></label>
          <label>m³<br><input id="cv_m3" type="number" step="0.001" placeholder="e.g., 0.765"></label>
        </div>
        <div class="input-row">
          <label>yd³<br><input id="cv_yd3" type="number" step="0.001" placeholder="e.g., 10"></label>
          <label>m³ (↔ yd³)<br><input id="cv_m3yd" type="number" step="0.001" placeholder="e.g., 7.646"></label>
        </div>
      </div>

      <div class="card">
        <h3>Mass</h3>
        <div class="input-row">
          <label>lb<br><input id="cv_lb" type="number" step="0.001" placeholder="e.g., 100"></label>
          <label>kg<br><input id="cv_kg" type="number" step="0.001" placeholder="e.g., 45.359"></label>
        </div>
      </div>
    `;

    // Prefill
    $id('cv_psi').value = s.psi ?? '';   $id('cv_mpa').value = s.mpa ?? '';
    $id('cv_pcf').value = s.pcf ?? '';   $id('cv_kgm3').value = s.kgm3 ?? '';
    $id('cv_f').value   = s.f ?? '';     $id('cv_c').value    = s.c ?? '';
    $id('cv_ft3').value = s.ft3 ?? '';   $id('cv_m3').value   = s.m3 ?? '';
    $id('cv_yd3').value = s.yd3 ?? '';   $id('cv_m3yd').value = s.m3yd ?? '';
    $id('cv_lb').value  = s.lb ?? '';    $id('cv_kg').value   = s.kg ?? '';

    function sync(){
      // PSI <-> MPa (1 MPa = 145.0377377 psi)
      const psi = toNum($id('cv_psi').value);
      const mpa = toNum($id('cv_mpa').value);
      if (psi != null && document.activeElement === $id('cv_psi')) $id('cv_mpa').value = fmt(psi/145.0377377,3);
      if (mpa != null && document.activeElement === $id('cv_mpa')) $id('cv_psi').value = fmt(mpa*145.0377377,1);

      // pcf <-> kg/m3 (1 pcf = 16.018463 kg/m3)
      const pcf = toNum($id('cv_pcf').value);
      const kgm3= toNum($id('cv_kgm3').value);
      if (pcf != null && document.activeElement === $id('cv_pcf')) $id('cv_kgm3').value = fmt(pcf*16.018463,1);
      if (kgm3!= null && document.activeElement === $id('cv_kgm3')) $id('cv_pcf').value  = fmt(kgm3/16.018463,2);

      // F <-> C
      const F = toNum($id('cv_f').value);
      const C = toNum($id('cv_c').value);
      if (F != null && document.activeElement === $id('cv_f')) $id('cv_c').value = fmt((F-32)*5/9,1);
      if (C != null && document.activeElement === $id('cv_c')) $id('cv_f').value = fmt((C*9/5)+32,1);

      // ft3 <-> m3 (1 m3 = 35.3146667 ft3)
      const ft3 = toNum($id('cv_ft3').value);
      const m3  = toNum($id('cv_m3').value);
      if (ft3 != null && document.activeElement === $id('cv_ft3')) $id('cv_m3').value = fmt(ft3/35.3146667,3);
      if (m3  != null && document.activeElement === $id('cv_m3'))  $id('cv_ft3').value = fmt(m3*35.3146667,3);

      // yd3 <-> m3 (1 yd3 = 0.764554858 m3)
      const yd3 = toNum($id('cv_yd3').value);
      const m3y = toNum($id('cv_m3yd').value);
      if (yd3 != null && document.activeElement === $id('cv_yd3')) $id('cv_m3yd').value = fmt(yd3*0.764554858,3);
      if (m3y != null && document.activeElement === $id('cv_m3yd')) $id('cv_yd3').value = fmt(m3y/0.764554858,3);

      // lb <-> kg (1 kg = 2.20462262 lb)
      const lb = toNum($id('cv_lb').value);
      const kg = toNum($id('cv_kg').value);
      if (lb != null && document.activeElement === $id('cv_lb')) $id('cv_kg').value = fmt(lb/2.20462262,3);
      if (kg != null && document.activeElement === $id('cv_kg')) $id('cv_lb').value = fmt(kg*2.20462262,3);

      // Save + URL
      state.convert = {
        psi:$id('cv_psi').value, mpa:$id('cv_mpa').value, pcf:$id('cv_pcf').value, kgm3:$id('cv_kgm3').value,
        f:$id('cv_f').value, c:$id('cv_c').value, ft3:$id('cv_ft3').value, m3:$id('cv_m3').value,
        yd3:$id('cv_yd3').value, m3yd:$id('cv_m3yd').value, lb:$id('cv_lb').value, kg:$id('cv_kg').value
      };
      saveState(state);
      writeHash('#convert', state.convert);
    }

    ['cv_psi','cv_mpa','cv_pcf','cv_kgm3','cv_f','cv_c','cv_ft3','cv_m3','cv_yd3','cv_m3yd','cv_lb','cv_kg']
      .forEach(id => {
        const el = $id(id);
        el.addEventListener('input', sync, { passive:true });
        el.addEventListener('change', sync, { passive:true });
      });

    sync();
  }

  // =========================================================
  // WATER ADJUSTMENT: aggregates moisture/absorption → water add/remove + w/cm
  // =========================================================
  function renderWater(params){
    if (titleNode) titleNode.textContent = 'Aggregate Moisture / Water Adjustment';
    if (!mount) return;

    const s = Object.assign({
      w_target:'', c_lb:'', // optional cement for w/cm
      c_ssd:'', c_moist:'', c_abs:'', // coarse agg
      f_ssd:'', f_moist:'', f_abs:''  // fine agg
    }, state.water||{});

    ['w_target','c_lb','c_ssd','c_moist','c_abs','f_ssd','f_moist','f_abs'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Aggregate Moisture / Water Adjustment</h2>
      <p class="muted">Adjust batch water for aggregate moisture above/below absorption. Optionally compute updated w/cm.</p>

      <div class="card">
        <h3>Targets</h3>
        <div class="input-row">
          <label>Target water (lb)<br><input id="wa_target" type="number" step="0.1" placeholder="e.g., 275"></label>
          <label>Cement in batch (lb) <span class="small">(optional for w/cm)</span><br><input id="wa_c" type="number" step="0.1" placeholder="e.g., 564"></label>
        </div>
      </div>

      <div class="card">
        <h3>Coarse Aggregate</h3>
        <div class="input-row">
          <label>SSD weight (lb)<br><input id="wa_c_ssd" type="number" step="0.1" placeholder="e.g., 1800"></label>
          <label>Moisture (%)<br><input id="wa_c_m" type="number" step="0.01" placeholder="e.g., 2.3"></label>
        </div>
        <div class="input-row">
          <label>Absorption (%)<br><input id="wa_c_abs" type="number" step="0.01" placeholder="e.g., 0.8"></label>
          <div></div>
        </div>
      </div>

      <div class="card">
        <h3>Fine Aggregate</h3>
        <div class="input-row">
          <label>SSD weight (lb)<br><input id="wa_f_ssd" type="number" step="0.1" placeholder="e.g., 1200"></label>
          <label>Moisture (%)<br><input id="wa_f_m" type="number" step="0.01" placeholder="e.g., 4.5"></label>
        </div>
        <div class="input-row">
          <label>Absorption (%)<br><input id="wa_f_abs" type="number" step="0.01" placeholder="e.g., 1.2"></label>
          <div></div>
        </div>
      </div>

      <section id="wa_out_wrap"></section>
    `;

    // Prefill
    $id('wa_target').value = s.w_target ?? '';
    $id('wa_c').value = s.c_lb ?? '';
    $id('wa_c_ssd').value = s.c_ssd ?? '';
    $id('wa_c_m').value = s.c_moist ?? '';
    $id('wa_c_abs').value = s.c_abs ?? '';
    $id('wa_f_ssd').value = s.f_ssd ?? '';
    $id('wa_f_m').value = s.f_moist ?? '';
    $id('wa_f_abs').value = s.f_abs ?? '';

    function compute(){
      const Wt   = toNum($id('wa_target').value) ?? 0;
      const Ccem = toNum($id('wa_c').value) ?? null;

      const Cssd = toNum($id('wa_c_ssd').value) ?? 0;
      const Cm   = toNum($id('wa_c_m').value) ?? 0;
      const Cabs = toNum($id('wa_c_abs').value) ?? 0;

      const Fssd = toNum($id('wa_f_ssd').value) ?? 0;
      const Fm   = toNum($id('wa_f_m').value) ?? 0;
      const Fabs = toNum($id('wa_f_abs').value) ?? 0;

      // Free moisture above SSD (as fraction)
      const CfreeFrac = Math.max(0, (Cm - Cabs)/100);
      const FfreeFrac = Math.max(0, (Fm - Fabs)/100);

      const Cfree = Cssd * CfreeFrac;
      const Ffree = Fssd * FfreeFrac;
      const FreeWater = Cfree + Ffree;

      // Water to add (positive = add; negative = remove)
      const WaterToAdd = Wt - FreeWater;

      // Optional w/cm
      let wcm = null;
      if (Ccem && Ccem > 0) {
        const effectiveW = Math.max(0, WaterToAdd) + FreeWater; // total water actually in batch
        wcm = effectiveW / Ccem;
      }

      // Save + URL
      state.water = {
        w_target: String(Wt || ''), c_lb: String(Ccem || ''),
        c_ssd: String(Cssd || ''), c_moist: String(Cm || ''), c_abs: String(Cabs || ''),
        f_ssd: String(Fssd || ''), f_moist: String(Fm || ''), f_abs: String(Fabs || '')
      };
      saveState(state);
      writeHash('#water', state.water);

      const badge = (Math.abs(WaterToAdd) <= 5) ? 'ok' : (Math.abs(WaterToAdd) <= 15 ? 'warn' : 'bad');
      const label = WaterToAdd >= 0
        ? `Add ${fmt(WaterToAdd,1)} lb water`
        : `Remove ${fmt(Math.abs(WaterToAdd),1)} lb water`;

      const text = [
        `Free water (coarse): ${fmt(Cfree,1)} lb`,
        `Free water (fine): ${fmt(Ffree,1)} lb`,
        `Total free water: ${fmt(FreeWater,1)} lb`,
        `${label}`,
        (wcm!=null ? `Estimated w/cm: ${fmt(wcm,3)}` : '')
      ].filter(Boolean).join('\n');

      const html = `
        <div class="card">
          <h3>Adjustment</h3>
          <div class="out" id="wa_out">
            Free water — coarse: ${fmt(Cfree,1)} lb · fine: ${fmt(Ffree,1)} lb<br>
            Total free water: <strong>${fmt(FreeWater,1)} lb</strong><br>
            <span class="${badge}">${label}</span>
            ${wcm!=null ? `<br>Estimated w/cm: <strong>${fmt(wcm,3)}</strong>` : ''}
            <div class="small" style="margin-top:6px">Advisory only. Verify with plant scales and current moisture tests.</div>
          </div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $id('wa_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['wa_target','wa_c','wa_c_ssd','wa_c_m','wa_c_abs','wa_f_ssd','wa_f_m','wa_f_abs'].forEach(id=>{
      const el=$id(id);
      el.addEventListener('input', compute, { passive:true });
      el.addEventListener('change', compute, { passive:true });
    });
    compute();
  }

  // =========================================================
  // TEMP ESTIMATE: fresh concrete temperature from component temps/weights
  // =========================================================
  function renderTemp(params){
    if (titleNode) titleNode.textContent = 'Fresh Concrete Temperature (estimate)';
    if (!mount) return;

    const s = Object.assign({
      tw:'', ww:'',   // water temp (°F), weight (lb)
      tc:'', wc:'',   // cement
      tca:'', wca:'', // coarse agg
      tfa:'', wfa:''  // fine agg
    }, state.temp||{});

    ['tw','ww','tc','wc','tca','wca','tfa','wfa'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Fresh Concrete Temperature (estimate)</h2>
      <p class="muted">Weighted heat-capacity average (advisory). Enter temps (°F) and weights (lb).</p>

      <div class="card">
        <h3>Inputs</h3>
        <div class="input-row">
          <label>Water temp °F<br><input id="te_tw" type="number" step="0.1" placeholder="e.g., 60"></label>
          <label>Water weight lb<br><input id="te_ww" type="number" step="0.1" placeholder="e.g., 275"></label>
        </div>
        <div class="input-row">
          <label>Cement temp °F<br><input id="te_tc" type="number" step="0.1" placeholder="e.g., 70"></label>
          <label>Cement weight lb<br><input id="te_wc" type="number" step="0.1" placeholder="e.g., 564"></label>
        </div>
        <div class="input-row">
          <label>Coarse agg temp °F<br><input id="te_tca" type="number" step="0.1" placeholder="e.g., 75"></label>
          <label>Coarse agg weight lb<br><input id="te_wca" type="number" step="0.1" placeholder="e.g., 1800"></label>
        </div>
        <div class="input-row">
          <label>Fine agg temp °F<br><input id="te_tfa" type="number" step="0.1" placeholder="e.g., 78"></label>
          <label>Fine agg weight lb<br><input id="te_wfa" type="number" step="0.1" placeholder="e.g., 1200"></label>
        </div>
      </div>

      <section id="te_out_wrap"></section>
    `;

    $id('te_tw').value = s.tw ?? '';   $id('te_ww').value = s.ww ?? '';
    $id('te_tc').value = s.tc ?? '';   $id('te_wc').value = s.wc ?? '';
    $id('te_tca').value = s.tca ?? ''; $id('te_wca').value = s.wca ?? '';
    $id('te_tfa').value = s.tfa ?? ''; $id('te_wfa').value = s.wfa ?? '';

    function compute(){
      const Tw = toNum($id('te_tw').value),  Ww = toNum($id('te_ww').value);
      const Tc = toNum($id('te_tc').value),  Wc = toNum($id('te_wc').value);
      const Tca= toNum($id('te_tca').value), Wca= toNum($id('te_wca').value);
      const Tfa= toNum($id('te_tfa').value), Wfa= toNum($id('te_wfa').value);

      // Heat capacities (relative, BTU/lb·°F)
      const cW = 1.00, cC = 0.20, cA = 0.21;

      const parts = [
        {w:Ww, c:cW, T:Tw},
        {w:Wc, c:cC, T:Tc},
        {w:Wca,c:cA, T:Tca},
        {w:Wfa,c:cA, T:Tfa},
      ].filter(p=>Number.isFinite(p.w) && p.w>0 && Number.isFinite(p.T));

      let Tmix = null;
      if (parts.length){
        const num = parts.reduce((s,p)=>s + p.w*p.c*p.T, 0);
        const den = parts.reduce((s,p)=>s + p.w*p.c, 0);
        if (den>0) Tmix = num/den;
      }

      state.temp = {
        tw:$id('te_tw').value, ww:$id('te_ww').value,
        tc:$id('te_tc').value, wc:$id('te_wc').value,
        tca:$id('te_tca').value, wca:$id('te_wca').value,
        tfa:$id('te_tfa').value, wfa:$id('te_wfa').value,
      };
      saveState(state);
      writeHash('#temp', state.temp);

      const badge = (Tmix==null) ? 'warn' : (Tmix>=90 ? 'bad' : (Tmix>=80 ? 'warn' : 'ok'));
      const label = (Tmix==null) ? 'Enter temps and weights' :
        (Tmix>=90 ? 'High (watch for set/evap issues)' : (Tmix>=80 ? 'Warm (monitor finishing)' : 'Comfortable range'));

      const text = [
        (Tmix==null ? 'No estimate' : `Estimated fresh concrete temperature: ${fmt(Tmix,1)} °F`),
        label
      ].join('\n');

      const html = `
        <div class="card">
          <h3>Estimate</h3>
          <div class="out" id="te_out">
            ${Tmix==null ? 'Enter temps and weights.' : `Estimated fresh concrete temperature: <strong>${fmt(Tmix,1)} °F</strong>`}<br>
            <span class="${badge}">${label}</span>
            <div class="small" style="margin-top:6px">Advisory only. Verify onsite temperature per method.</div>
          </div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $id('te_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['te_tw','te_ww','te_tc','te_wc','te_tca','te_wca','te_tfa','te_wfa'].forEach(id=>{
      const el=$id(id);
      el.addEventListener('input', compute, { passive:true });
      el.addEventListener('change', compute, { passive:true });
    });
    compute();
  }

})();


