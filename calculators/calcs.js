/* ACI WV · calculators/calcs.js
   Tools included: #volume, #rebar, #joints, #slope, #yield, #wc, #water, #pump, #cycle, #coverage, #evap, #temp, #insulation, #strength
   - Mobile-first, no deps
   - LocalStorage persistence
   - Deep-link query params (read & write)
   - Copy results buttons
*/

(function(){
  // ---------------- Utilities ----------------
  const $ = (id, root=document) => root.getElementById(id);
  const qs  = (sel, root=document) => root.querySelector(sel);
  const fmt = (n, d=2) => (Number.isFinite(n) ? n.toFixed(d) : '—');
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const toNum = (val) => {
    if (val == null) return null;
    const s = String(val).trim().replace(/,/g,'');
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  // URL params in the hash (e.g. #pump?rate=60)
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

  // Local storage
  const LS_KEY = 'aciwv_calc_state_v2';
  function loadState(){ try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } }
  function saveState(state){ try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {} }
  const state = loadState();

  // Copy helper & pill wrapper
  async function copyText(text){
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      let ok=false; try { ok = document.execCommand('copy'); } catch {}
      ta.remove(); return ok;
    }
  }
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
    btn.addEventListener('click', async()=>{ const ok=await copyText(getText()); btn.textContent= ok?'Copied!':'Copy failed'; setTimeout(()=>btn.textContent='Copy',1200); });
    out.style.position='relative';
    out.appendChild(btn);
    return wrap;
  }

  // Mount point
  const mount = $('tool');
  const titleNode = $('tool-title');

  // ---------------- Router ----------------
  const tools = {
    '#volume': renderVolume,
    '#rebar': renderRebar,
    '#joints': renderJoints,
    '#slope': renderSlope,
    '#yield': renderYield,
    '#wc': renderWC,
    '#water': renderWater,
    '#pump': renderPump,
    '#cycle': renderCycle,
    '#coverage': renderCoverage,
    '#evap': renderEvap,
    '#temp': renderTemp,
    '#insulation': renderInsulation,
    '#strength': renderStrength,
  };

  function render(){
    const { hash, params } = readHash();
    if (!tools[hash]) {
      if (titleNode) titleNode.textContent = 'Select a calculator above';
      if (mount) mount.innerHTML = '<p class="muted">Pick a tool from the cards above.</p>';
      return;
    }
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
    $('v_waste').value = s.waste ?? '';

    $('v_len').value  = s.len ?? '';
    $('v_wid').value  = s.wid ?? '';
    $('v_th').value   = s.th_in ?? '';
    $('v_qty').value  = s.qty ?? '1';

    $('vt_len').value = s.trench_len ?? '';
    $('vt_w').value   = s.trench_w_in ?? '';
    $('vt_d').value   = s.trench_d_in ?? '';
    $('vt_qty').value = s.trench_qty ?? '1';

    $('vc_d').value   = s.col_d_in ?? '';
    $('vc_h').value   = s.col_h_ft ?? '';
    $('vc_qty').value = s.col_qty ?? '1';

    function syncPanels(){
      const shape = qs('#v_shape').value;
      qs('#v_slab').style.display   = shape==='slab'   ? '' : 'none';
      qs('#v_trench').style.display = shape==='trench' ? '' : 'none';
      qs('#v_column').style.display = shape==='column' ? '' : 'none';
      compute();
    }

    function compute(){
      const shape = qs('#v_shape').value;
      const waste = clamp(toNum($('v_waste').value) ?? 0, 0, 30);

      state.volume = Object.assign(state.volume||{}, { shape, waste: String(waste) });

      let ft3 = 0, qty = 1;

      if (shape==='slab'){
        const L = toNum($('v_len').value);
        const W = toNum($('v_wid').value);
        const Th= toNum($('v_th').value);
        qty = clamp(toNum($('v_qty').value) ?? 1, 1, 9999);
        if (L>0 && W>0 && Th>0){
          ft3 = L * W * (Th/12) * qty;
          $('v_out_slab').innerHTML = `ft³: ${fmt(ft3,2)} (L×W×t × qty)`;
          Object.assign(state.volume, { len:String(L), wid:String(W), th_in:String(Th), qty:String(qty) });
          writeHash('#volume', { shape, len:L, wid:W, th_in:Th, qty, waste });
        } else {
          $('v_out_slab').textContent = 'Enter dimensions.';
        }
      }
      else if (shape==='trench'){
        const L = toNum($('vt_len').value);
        const W = toNum($('vt_w').value);
        const D = toNum($('vt_d').value);
        qty = clamp(toNum($('vt_qty').value) ?? 1, 1, 9999);
        if (L>0 && W>0 && D>0){
          ft3 = L * (W/12) * (D/12) * qty;
          $('v_out_trench').innerHTML = `ft³: ${fmt(ft3,2)} (L × W × D × qty)`;
          Object.assign(state.volume, { trench_len:String(L), trench_w_in:String(W), trench_d_in:String(D), trench_qty:String(qty) });
          writeHash('#volume', { shape, trench_len:L, trench_w_in:W, trench_d_in:D, trench_qty:qty, waste });
        } else {
          $('v_out_trench').textContent = 'Enter dimensions.';
        }
      }
      else { // column
        const Dia = toNum($('vc_d').value);
        const H   = toNum($('vc_h').value);
        qty = clamp(toNum($('vc_qty').value) ?? 1, 1, 9999);
        if (Dia>0 && H>0){
          const r_ft = (Dia/12)/2;
          ft3 = Math.PI * r_ft * r_ft * H * qty;
          $('v_out_col').innerHTML = `ft³: ${fmt(ft3,2)} (π r² h × qty)`;
          Object.assign(state.volume, { col_d_in:String(Dia), col_h_ft:String(H), col_qty:String(qty) });
          writeHash('#volume', { shape, col_d_in:Dia, col_h_ft:H, col_qty:qty, waste });
        } else {
          $('v_out_col').textContent = 'Enter dimensions.';
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
      const target = $('v_summary');
      target.innerHTML = '';
      target.appendChild(node);
    }

    ['v_shape','v_waste','v_len','v_wid','v_th','v_qty','vt_len','vt_w','vt_d','vt_qty','vc_d','vc_h','vc_qty']
      .forEach(id => {
        const el = $(id);
        if (!el) return;
        el.addEventListener('input', compute, { passive:true });
        el.addEventListener('change', compute, { passive:true });
      });

    qs('#v_shape').addEventListener('change', ()=>{ state.volume = Object.assign(state.volume||{}, { shape: qs('#v_shape').value }); saveState(state); syncPanels(); });
    syncPanels();
  }

  // =========================================================
  // REBAR TAKEOFF (simple slab)
  // =========================================================
  function renderRebar(params){
    if (titleNode) titleNode.textContent = 'Rebar Takeoff (simple)';
    if (!mount) return;

    const s = Object.assign({
      len_ft:'', wid_ft:'', spacing_in:'12', dir:'both', bar:'#4', lap_in:'0', waste:'5'
    }, state.rebar||{});
    ['len_ft','wid_ft','spacing_in','dir','bar','lap_in','waste'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Rebar Takeoff (simple)</h2>
      <p class="muted">Uniform grid for a rectangular area. Approximates lap by adding fixed length per bar.</p>
      <div class="input-row">
        <label>Length (ft)<br><input id="rb_len" type="number" step="0.01" placeholder="e.g., 60"></label>
        <label>Width (ft)<br><input id="rb_wid" type="number" step="0.01" placeholder="e.g., 40"></label>
      </div>
      <div class="input-row">
        <label>Spacing (in)<br><input id="rb_sp" type="number" step="0.1" placeholder="e.g., 12"></label>
        <label>Directions<br>
          <select id="rb_dir"><option value="both">Both ways</option><option value="len">Length only</option><option value="wid">Width only</option></select>
        </label>
      </div>
      <div class="input-row">
        <label>Bar size<br>
          <select id="rb_bar">
            <option>#3</option><option selected>#4</option><option>#5</option><option>#6</option><option>#7</option><option>#8</option>
          </select>
        </label>
        <label>Lap add (in/bar) <span class="small">(optional)</span><br><input id="rb_lap" type="number" step="0.1" value="0"></label>
      </div>
      <div class="input-row">
        <label>Waste (%)<br><input id="rb_waste" type="number" step="0.1" value="5"></label>
        <div></div>
      </div>
      <section id="rb_out_wrap"></section>
    `;

    $('rb_len').value = s.len_ft ?? '';
    $('rb_wid').value = s.wid_ft ?? '';
    $('rb_sp').value  = s.spacing_in ?? '12';
    $('rb_dir').value = s.dir ?? 'both';
    $('rb_bar').value = s.bar ?? '#4';
    $('rb_lap').value = s.lap_in ?? '0';
    $('rb_waste').value= s.waste ?? '5';

    const wtPerFt = { '#3':0.376, '#4':0.668, '#5':1.043, '#6':1.502, '#7':2.044, '#8':2.670 };

    function compute(){
      const L = toNum($('rb_len').value);
      const W = toNum($('rb_wid').value);
      const sp = clamp(toNum($('rb_sp').value) ?? 0, 1, 96); // in
      const dir = $('rb_dir').value;
      const bar = $('rb_bar').value;
      const lap = clamp(toNum($('rb_lap').value) ?? 0, 0, 120); // in
      const waste = clamp(toNum($('rb_waste').value) ?? 0, 0, 20);

      state.rebar = { len_ft:String(L||''), wid_ft:String(W||''), spacing_in:String(sp||''), dir, bar, lap_in:String(lap||''), waste:String(waste) };
      saveState(state);
      writeHash('#rebar', state.rebar);

      let countLen=0, countWid=0, totalLenFt=0;

      if (L>0 && W>0 && sp>0){
        if (dir==='both' || dir==='len'){
          countWid = Math.floor(W*12/sp) + 1; // bars running along length, spaced across width
          totalLenFt += countWid * (L + lap/12);
        }
        if (dir==='both' || dir==='wid'){
          countLen = Math.floor(L*12/sp) + 1; // bars running along width, spaced along length
          totalLenFt += countLen * (W + lap/12);
        }
      }

      const totalLenFtWaste = totalLenFt * (1 + waste/100);
      const weight = (wtPerFt[bar]||0) * totalLenFtWaste;

      const text = [
        `Bars along length: ${countLen}`,
        `Bars along width: ${countWid}`,
        `Total bar length (no waste): ${fmt(totalLenFt,1)} ft`,
        `With waste ${fmt(waste,1)}%: ${fmt(totalLenFtWaste,1)} ft`,
        `Bar size: ${bar}, total weight: ${fmt(weight,1)} lb`
      ].join('\n');

      const html = `
        <div class="card">
          <h3>Totals</h3>
          <div class="out">
            Bars along length: ${countLen}<br>
            Bars along width: ${countWid}<br>
            Total length (no waste): ${fmt(totalLenFt,1)} ft<br>
            With waste ${fmt(waste,1)}%: <strong>${fmt(totalLenFtWaste,1)} ft</strong><br>
            Bar size ${bar} · Est. weight: <strong>${fmt(weight,1)} lb</strong>
          </div>
          <div class="small" style="margin-top:6px">Heuristic. Does not account for openings, edge offsets, or hooks.</div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $('rb_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['rb_len','rb_wid','rb_sp','rb_dir','rb_bar','rb_lap','rb_waste'].forEach(id=>{
      const el=$(id); el.addEventListener('input', compute, { passive:true }); el.addEventListener('change', compute, { passive:true });
    });
    compute();
  }

  // =========================================================
  // JOINT SPACING (rule-of-thumb)
  // =========================================================
  function renderJoints(params){
    if (titleNode) titleNode.textContent = 'Joint Spacing';
    if (!mount) return;

    const s = Object.assign({ thick_in:'', mult_min:'24', mult_max:'36' }, state.joints||{});
    ['thick_in','mult_min','mult_max'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Joint Spacing</h2>
      <p class="muted">Rule-of-thumb: spacing (ft) ≈ (multiplier × thickness in inches) ÷ 12. Use 24–36 × t(in) as a typical range.</p>
      <div class="input-row">
        <label>Slab thickness (in)<br><input id="js_t" type="number" step="0.1" placeholder="e.g., 6"></label>
        <label>Target multiplier<br>
          <select id="js_mid">
            <option value="24">24 × t</option>
            <option value="30" selected>30 × t</option>
            <option value="36">36 × t</option>
          </select>
        </label>
      </div>
      <section id="js_out_wrap"></section>
    `;

    $('js_t').value = s.thick_in ?? '';
    $('js_mid').value = '30';

    function compute(){
      const t = toNum($('js_t').value);
      const m = toNum($('js_mid').value) || 30;
      let minFt=null, maxFt=null, targetFt=null;

      if (t>0){
        minFt = (24*t)/12;
        maxFt = (36*t)/12;
        targetFt = (m*t)/12;
      }

      const text = (!t? 'Enter thickness.' : [
        `Min spacing (~24×t): ${fmt(minFt,1)} ft`,
        `Target (~${m}×t): ${fmt(targetFt,1)} ft`,
        `Max spacing (~36×t): ${fmt(maxFt,1)} ft`
      ].join('\n'));

      const html = `
        <div class="card">
          <h3>Spacing</h3>
          <div class="out">
            ${!t?'Enter thickness.':`Min: ${fmt(minFt,1)} ft · Target: <strong>${fmt(targetFt,1)} ft</strong> · Max: ${fmt(maxFt,1)} ft`}
          </div>
          <div class="small" style="margin-top:6px">Advisory guideline only. Follow project specs and jointing plan.</div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $('js_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['js_t','js_mid'].forEach(id=>{ const el=$(id); el.addEventListener('input', compute, {passive:true}); el.addEventListener('change', compute, {passive:true}); });
    compute();
  }

  // =========================================================
  // SLOPE / GRADE
  // =========================================================
  function renderSlope(params){
    if (titleNode) titleNode.textContent = 'Slope / Grade';
    if (!mount) return;

    const s = Object.assign({ run_ft:'', slope_pct:'', width_ft:'', base_th_in:'' }, state.slope||{});
    ['run_ft','slope_pct','width_ft','base_th_in'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Slope / Grade</h2>
      <p class="muted">Compute rise over a run and thickness change across a width from % slope.</p>
      <div class="input-row">
        <label>Run length (ft)<br><input id="sl_run" type="number" step="0.01" placeholder="e.g., 50"></label>
        <label>Slope (%)<br><input id="sl_pct" type="number" step="0.01" placeholder="e.g., 2"></label>
      </div>
      <div class="input-row">
        <label>Slab width (ft) <span class="small">(optional)</span><br><input id="sl_w" type="number" step="0.01" placeholder="e.g., 12"></label>
        <label>Base thickness at high side (in) <span class="small">(optional)</span><br><input id="sl_th" type="number" step="0.1" placeholder="e.g., 6"></label>
      </div>
      <section id="sl_out_wrap"></section>
    `;

    $('sl_run').value = s.run_ft ?? '';
    $('sl_pct').value = s.slope_pct ?? '';
    $('sl_w').value   = s.width_ft ?? '';
    $('sl_th').value  = s.base_th_in ?? '';

    function compute(){
      const run = toNum($('sl_run').value);
      const pct = toNum($('sl_pct').value);
      const width = toNum($('sl_w').value);
      const thBase = toNum($('sl_th').value);

      state.slope = { run_ft:String(run||''), slope_pct:String(pct||''), width_ft:String(width||''), base_th_in:String(thBase||'') };
      saveState(state);
      writeHash('#slope', state.slope);

      let rise_ft=null, dropAcross_in=null, lowTh_in=null;
      if (run>0 && pct!=null){ rise_ft = run * (pct/100); }
      if (width>0 && pct!=null){ dropAcross_in = width*12*(pct/100); }
      if (thBase>0 && dropAcross_in!=null){ lowTh_in = thBase + dropAcross_in; }

      const textLines = [];
      if (rise_ft!=null) textLines.push(`Rise over run: ${fmt(rise_ft,2)} ft over ${fmt(run,2)} ft`);
      if (pct!=null) textLines.push(`Slope: ${fmt(pct,2)} % (${fmt(pct/100,4)} ft/ft)`);
      if (dropAcross_in!=null) textLines.push(`Thickness change across ${fmt(width,2)} ft: ${fmt(dropAcross_in,1)} in`);
      if (lowTh_in!=null) textLines.push(`Low-side thickness (from ${fmt(thBase,1)} in base): ~${fmt(lowTh_in,1)} in`);
      const text = textLines.join('\n') || 'Enter run and % slope.';

      const html = `
        <div class="card">
          <h3>Results</h3>
          <div class="out">
            ${textLines.length? textLines.join('<br>') : 'Enter run and % slope.'}
          </div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $('sl_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['sl_run','sl_pct','sl_w','sl_th'].forEach(id=>{ const el=$(id); el.addEventListener('input', compute, {passive:true}); el.addEventListener('change', compute, {passive:true}); });
    compute();
  }

  // =========================================================
  // YIELD & RELATIVE YIELD (ASTM C138 style)
  // =========================================================
  function renderYield(params){
    if (titleNode) titleNode.textContent = 'Yield (ASTM C138 style)';
    if (!mount) return;

    const s = Object.assign({ pcf:'', batchlb:'', vdesign:'', c_lb:'', w_lb:'' }, state.yield||{});
    ['pcf','batchlb','vdesign','c_lb','w_lb'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Yield & Relative Yield</h2>
      <div class="input-row">
        <label>Measured unit weight (pcf)<br><input id="y_pcf" type="number" step="0.1" placeholder="e.g., 145"></label>
        <label>Total batch mass (lb)<br><input id="y_batch" type="number" step="1" placeholder="e.g., 39150"></label>
      </div>
      <div class="input-row">
        <label>Design volume (yd³) <span class="small">(optional)</span><br><input id="y_vd" type="number" step="0.01" placeholder="e.g., 15"></label>
        <label>Cement in batch (lb) <span class="small">(optional)</span><br><input id="y_c" type="number" step="1" placeholder="e.g., 8460"></label>
      </div>
      <div class="input-row">
        <label>Water in batch (lb) <span class="small">(optional)</span><br><input id="y_w" type="number" step="1" placeholder="e.g., 4125"></label>
        <div></div>
      </div>
      <section id="y_out_wrap"></section>
    `;

    $('y_pcf').value   = s.pcf ?? '';
    $('y_batch').value = s.batchlb ?? '';
    $('y_vd').value    = s.vdesign ?? '';
    $('y_c').value     = s.c_lb ?? '';
    $('y_w').value     = s.w_lb ?? '';

    function compute(){
      const pcf = toNum($('y_pcf').value);
      const batch = toNum($('y_batch').value);
      const vdesign = toNum($('y_vd').value);
      const c = toNum($('y_c').value);
      const w = toNum($('y_w').value);

      state.yield = { pcf:String(pcf||''), batchlb:String(batch||''), vdesign:String(vdesign||''), c_lb:String(c||''), w_lb:String(w||'') };
      saveState(state);
      writeHash('#yield', state.yield);

      if (!(pcf>0 && batch>0)){
        $('y_out_wrap').innerHTML = '<div class="card"><div class="out">Enter unit weight and batch mass.</div></div>';
        return;
      }
      const ft3 = batch/pcf;
      const yd3 = ft3/27;
      let rel=null, pct=null;
      if (vdesign>0){ rel = yd3/vdesign; pct=(rel-1)*100; }

      const c_yd = (c>0)? c/yd3 : null;
      const w_yd = (w>0)? w/yd3 : null;

      const lines = [
        `Yield: ${fmt(yd3,3)} yd³ (ft³: ${fmt(ft3,1)})`,
        (vdesign>0 ? `Relative yield: ${fmt(rel,3)} (${pct>=0?'+':''}${fmt(pct,1)}%)` : null),
        (c_yd!=null ? `Cement per yd³: ${fmt(c_yd,1)} lb/yd³` : null),
        (w_yd!=null ? `Water per yd³: ${fmt(w_yd,1)} lb/yd³` : null),
      ].filter(Boolean);

      const text = lines.join('\n');

      const cls = (pct==null)? '' : (Math.abs(pct)<=1?'ok':(Math.abs(pct)<=3?'warn':'bad'));
      const html = `
        <div class="card">
          <h3>Results</h3>
          <div class="out">
            Yield: <strong>${fmt(yd3,3)} yd³</strong> (ft³: ${fmt(ft3,1)})<br>
            ${vdesign>0?`Rel. yield: <span class="${cls}">${fmt(rel,3)} (${pct>=0?'+':''}${fmt(pct,1)}%)</span><br>`:''}
            ${c_yd!=null?`Cement per yd³: ${fmt(c_yd,1)} lb/yd³<br>`:''}
            ${w_yd!=null?`Water per yd³: ${fmt(w_yd,1)} lb/yd³<br>`:''}
          </div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $('y_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['y_pcf','y_batch','y_vd','y_c','y_w'].forEach(id=>{ const el=$(id); el.addEventListener('input', compute, {passive:true}); el.addEventListener('change', compute, {passive:true}); });
    compute();
  }

  // =========================================================
  // w/c and w/cm
  // =========================================================
  function renderWC(params){
    if (titleNode) titleNode.textContent = 'w/c and w/cm';
    if (!mount) return;

    const s = Object.assign({ water:'', c:'', scm:'', mode:'wc' }, state.wc||{});
    ['water','c','scm','mode'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>w/c & w/cm</h2>
      <div class="input-row">
        <label>Total water (lb)<br><input id="wc_w" type="number" step="0.1" placeholder="e.g., 275"></label>
        <label>Cement only (lb)<br><input id="wc_c" type="number" step="0.1" placeholder="e.g., 564"></label>
      </div>
      <div class="input-row">
        <label>SCM (lb) <span class="small">(optional)</span><br><input id="wc_scm" type="number" step="0.1" placeholder="e.g., 100"></label>
        <label>Report mode<br>
          <select id="wc_mode"><option value="wc">w/c</option><option value="wcm">w/cm</option></select>
        </label>
      </div>
      <section id="wc_out_wrap"></section>
    `;

    $('wc_w').value   = s.water ?? '';
    $('wc_c').value   = s.c ?? '';
    $('wc_scm').value = s.scm ?? '';
    $('wc_mode').value= s.mode ?? 'wc';

    function compute(){
      const water = toNum($('wc_w').value);
      const c = toNum($('wc_c').value);
      const scm = toNum($('wc_scm').value) || 0;
      const mode = $('wc_mode').value;

      state.wc = { water:String(water||''), c:String(c||''), scm:String(scm||''), mode };
      saveState(state);
      writeHash('#wc', state.wc);

      if (!(water>0 && c>0)){
        $('wc_out_wrap').innerHTML = '<div class="card"><div class="out">Enter water and cement.</div></div>';
        return;
      }
      const wc = water/c;
      const wcm = water/(c+scm);

      const text = (mode==='wc')
        ? `w/c: ${fmt(wc,3)}\nw/cm: ${fmt(wcm,3)}`
        : `w/cm: ${fmt(wcm,3)}\nw/c: ${fmt(wc,3)}`;

      const html = `
        <div class="card">
          <h3>Ratio</h3>
          <div class="out">${text.replace(/\n/g,'<br>')}</div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $('wc_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['wc_w','wc_c','wc_scm','wc_mode'].forEach(id=>{ const el=$(id); el.addEventListener('input', compute, {passive:true}); el.addEventListener('change', compute, {passive:true}); });
    compute();
  }

  // =========================================================
  // WATER ADJUSTMENT (moisture / absorption)
  // =========================================================
  function renderWater(params){
    if (titleNode) titleNode.textContent = 'Aggregate Moisture / Water Adjustment';
    if (!mount) return;

    const s = Object.assign({ w_target:'', c_lb:'', c_ssd:'', c_moist:'', c_abs:'', f_ssd:'', f_moist:'', f_abs:'' }, state.water||{});
    ['w_target','c_lb','c_ssd','c_moist','c_abs','f_ssd','f_moist','f_abs'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Aggregate Moisture / Water Adjustment</h2>
      <p class="muted">Adjust batch water for aggregate moisture above/below absorption. Optionally compute updated w/cm.</p>

      <div class="card">
        <h3>Targets</h3>
        <div class="input-row">
          <label>Target water (lb)<br><input id="wa_target" type="number" step="0.1" placeholder="e.g., 275"></label>
          <label>Cement in batch (lb) <span class="small">(optional)</span><br><input id="wa_c" type="number" step="0.1" placeholder="e.g., 564"></label>
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

    $('wa_target').value = s.w_target ?? '';
    $('wa_c').value = s.c_lb ?? '';
    $('wa_c_ssd').value = s.c_ssd ?? '';
    $('wa_c_m').value = s.c_moist ?? '';
    $('wa_c_abs').value = s.c_abs ?? '';
    $('wa_f_ssd').value = s.f_ssd ?? '';
    $('wa_f_m').value = s.f_moist ?? '';
    $('wa_f_abs').value = s.f_abs ?? '';

    function compute(){
      const Wt   = toNum($('wa_target').value) ?? 0;
      const Ccem = toNum($('wa_c').value) ?? null;

      const Cssd = toNum($('wa_c_ssd').value) ?? 0;
      const Cm   = toNum($('wa_c_m').value) ?? 0;
      const Cabs = toNum($('wa_c_abs').value) ?? 0;

      const Fssd = toNum($('wa_f_ssd').value) ?? 0;
      const Fm   = toNum($('wa_f_m').value) ?? 0;
      const Fabs = toNum($('wa_f_abs').value) ?? 0;

      const CfreeFrac = Math.max(0, (Cm - Cabs)/100);
      const FfreeFrac = Math.max(0, (Fm - Fabs)/100);

      const Cfree = Cssd * CfreeFrac;
      const Ffree = Fssd * FfreeFrac;
      const FreeWater = Cfree + Ffree;

      const WaterToAdd = Wt - FreeWater;

      let wcm = null;
      if (Ccem && Ccem > 0) {
        const effectiveW = Math.max(0, WaterToAdd) + FreeWater;
        wcm = effectiveW / Ccem;
      }

      state.water = {
        w_target: String(Wt || ''), c_lb: String(Ccem || ''),
        c_ssd: String(Cssd || ''), c_moist: String(Cm || ''), c_abs: String(Cabs || ''),
        f_ssd: String(Fssd || ''), f_moist: String(Fm || ''), f_abs: String(Fabs || '')
      };
      saveState(state);
      writeHash('#water', state.water);

      const badge = (Math.abs(WaterToAdd) <= 5) ? 'ok' : (Math.abs(WaterToAdd) <= 15 ? 'warn' : 'bad');
      const label = WaterToAdd >= 0 ? `Add ${fmt(WaterToAdd,1)} lb water` : `Remove ${fmt(Math.abs(WaterToAdd),1)} lb water`;

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
      const wrap = $('wa_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['wa_target','wa_c','wa_c_ssd','wa_c_m','wa_c_abs','wa_f_ssd','wa_f_m','wa_f_abs'].forEach(id=>{
      const el=$(id); el.addEventListener('input', compute, { passive:true }); el.addEventListener('change', compute, { passive:true });
    });
    compute();
  }

  // =========================================================
  // PUMP TIME & OUTPUT
  // =========================================================
  function renderPump(params){
    if (titleNode) titleNode.textContent = 'Pump Time & Output';
    if (!mount) return;

    const s = Object.assign({ volume:'', rate:'60', crew_target:'30', truck_size:'9.5' }, state.pump||{});
    ['volume','rate','crew_target','truck_size'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Pump Time & Output</h2>
      <div class="input-row">
        <label>Total volume (yd³)<br><input id="pm_vol" type="number" step="0.01" placeholder="e.g., 120"></label>
        <label>Pump rate (yd³/hr)<br><input id="pm_rate" type="number" step="0.1" placeholder="e.g., 60"></label>
      </div>
      <div class="input-row">
        <label>Crew target (yd³/hr) <span class="small">(for pacing)</span><br><input id="pm_crew" type="number" step="0.1" placeholder="e.g., 30"></label>
        <label>Truck size (yd³)<br>
          <select id="pm_truck"><option>9.0</option><option selected>9.5</option><option>10.0</option></select>
        </label>
      </div>
      <section id="pm_out_wrap"></section>
    `;

    $('pm_vol').value = s.volume ?? '';
    $('pm_rate').value = s.rate ?? '60';
    $('pm_crew').value = s.crew_target ?? '30';
    $('pm_truck').value = s.truck_size ?? '9.5';

    function compute(){
      const vol = toNum($('pm_vol').value);
      const rate = toNum($('pm_rate').value);
      const crew = toNum($('pm_crew').value);
      const truck = toNum($('pm_truck').value) || 9.5;

      state.pump = { volume:String(vol||''), rate:String(rate||''), crew_target:String(crew||''), truck_size:String(truck||'') };
      saveState(state);
      writeHash('#pump', state.pump);

      if (!(vol>0 && rate>0)){
        $('pm_out_wrap').innerHTML = '<div class="card"><div class="out">Enter volume and pump rate.</div></div>';
        return;
      }

      const hours = vol / rate;
      const trucksPerHourAtRate = rate / truck;
      const trucksPerHourAtCrew = crew>0 ? crew / truck : null;

      const text = [
        `Estimated pump time: ${fmt(hours,2)} hr`,
        `Loads/hour @ pump rate: ${fmt(trucksPerHourAtRate,2)} trucks/hr`,
        (trucksPerHourAtCrew!=null?`Loads/hour @ crew target: ${fmt(trucksPerHourAtCrew,2)} trucks/hr`:null)
      ].filter(Boolean).join('\n');

      const html = `
        <div class="card">
          <h3>Output</h3>
          <div class="out">
            Estimated pump time: <strong>${fmt(hours,2)} hr</strong><br>
            Loads/hour @ pump rate: ${fmt(trucksPerHourAtRate,2)} trucks/hr<br>
            ${trucksPerHourAtCrew!=null?`Loads/hour @ crew target: ${fmt(trucksPerHourAtCrew,2)} trucks/hr`:''}
          </div>
          <div class="small" style="margin-top:6px">Heuristic. Actuals depend on setup, hose size, mix, and interruptions.</div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $('pm_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['pm_vol','pm_rate','pm_crew','pm_truck'].forEach(id=>{ const el=$(id); el.addEventListener('input', compute, {passive:true}); el.addEventListener('change', compute, {passive:true}); });
    compute();
  }

  // =========================================================
  // TRUCK CYCLE PLANNER
  // =========================================================
  function renderCycle(params){
    if (titleNode) titleNode.textContent = 'Truck Cycle Planner';
    if (!mount) return;

    const s = Object.assign({ target_rate:'40', truck_size:'9.5', plant_mi:'12', avg_mph:'40', load_min:'8', unload_min:'12', standby_min:'0' }, state.cycle||{});
    ['target_rate','truck_size','plant_mi','avg_mph','load_min','unload_min','standby_min'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Truck Cycle Planner</h2>
      <div class="input-row">
        <label>Target supply (yd³/hr)<br><input id="cy_rate" type="number" step="0.1" placeholder="e.g., 40"></label>
        <label>Truck size (yd³)<br>
          <select id="cy_truck"><option>9.0</option><option selected>9.5</option><option>10.0</option></select>
        </label>
      </div>
      <div class="input-row">
        <label>Plant distance (mi, one way)<br><input id="cy_mi" type="number" step="0.1" placeholder="e.g., 12"></label>
        <label>Average speed (mph)<br><input id="cy_mph" type="number" step="0.1" placeholder="e.g., 40"></label>
      </div>
      <div class="input-row">
        <label>Plant load time (min)<br><input id="cy_load" type="number" step="0.1" placeholder="e.g., 8"></label>
        <label>Onsite unload time (min)<br><input id="cy_unload" type="number" step="0.1" placeholder="e.g., 12"></label>
      </div>
      <div class="input-row">
        <label>Standby / queue (min) <span class="small">(optional)</span><br><input id="cy_standby" type="number" step="0.1" placeholder="e.g., 0"></label>
        <div></div>
      </div>
      <section id="cy_out_wrap"></section>
    `;

    $('cy_rate').value   = s.target_rate ?? '40';
    $('cy_truck').value  = s.truck_size ?? '9.5';
    $('cy_mi').value     = s.plant_mi ?? '12';
    $('cy_mph').value    = s.avg_mph ?? '40';
    $('cy_load').value   = s.load_min ?? '8';
    $('cy_unload').value = s.unload_min ?? '12';
    $('cy_standby').value= s.standby_min ?? '0';

    function compute(){
      const rate = toNum($('cy_rate').value);
      const truck = toNum($('cy_truck').value) || 9.5;
      const mi = toNum($('cy_mi').value);
      const mph = toNum($('cy_mph').value);
      const load = toNum($('cy_load').value) || 0;
      const unload = toNum($('cy_unload').value) || 0;
      const standby = toNum($('cy_standby').value) || 0;

      state.cycle = { target_rate:String(rate||''), truck_size:String(truck||''), plant_mi:String(mi||''), avg_mph:String(mph||''), load_min:String(load||''), unload_min:String(unload||''), standby_min:String(standby||'') };
      saveState(state);
      writeHash('#cycle', state.cycle);

      if (!(rate>0 && mi>=0 && mph>0)){
        $('cy_out_wrap').innerHTML = '<div class="card"><div class="out">Enter target rate, distance, and speed.</div></div>';
        return;
      }

      const travelMin = (mi/mph)*60; // one way
      const cycleMin = load + travelMin + unload + travelMin + standby;
      const cycleHr = cycleMin/60;
      const loadsPerHrTarget = rate / truck;
      const fleetNeeded = loadsPerHrTarget * cycleHr; // trucks
      const trucksRounded = Math.ceil(fleetNeeded);

      const text = [
        `One-way travel: ${fmt(travelMin,1)} min`,
        `Cycle time: ${fmt(cycleMin,1)} min`,
        `Target loads/hr: ${fmt(loadsPerHrTarget,2)}`,
        `Fleet needed: ${fmt(fleetNeeded,2)} → ${trucksRounded} trucks`
      ].join('\n');

      const html = `
        <div class="card">
          <h3>Fleet Plan</h3>
          <div class="out">
            One-way travel: ${fmt(travelMin,1)} min<br>
            Cycle time: <strong>${fmt(cycleMin,1)} min</strong><br>
            Target loads/hr: ${fmt(loadsPerHrTarget,2)}<br>
            Fleet needed: <strong>${fmt(fleetNeeded,2)} → ${trucksRounded} trucks</strong>
          </div>
          <div class="small" style="margin-top:6px">Heuristic. Add contingency for traffic, spacing limits, and site constraints.</div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $('cy_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['cy_rate','cy_truck','cy_mi','cy_mph','cy_load','cy_unload','cy_standby'].forEach(id=>{ const el=$(id); el.addEventListener('input', compute, {passive:true}); el.addEventListener('change', compute, {passive:true}); });
    compute();
  }

  // =========================================================
  // SURFACE COVERAGE
  // =========================================================
  function renderCoverage(params){
    if (titleNode) titleNode.textContent = 'Surface Coverage';
    if (!mount) return;

    const s = Object.assign({ area_ft2:'', rate_ft2_per_gal:'300', coats:'1', waste:'5', container_gal:'5' }, state.coverage||{});
    ['area_ft2','rate_ft2_per_gal','coats','waste','container_gal'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Surface Coverage</h2>
      <div class="input-row">
        <label>Area (ft²)<br><input id="cv_area" type="number" step="0.1" placeholder="e.g., 12000"></label>
        <label>Coverage rate (ft²/gal)<br><input id="cv_rate" type="number" step="0.1" placeholder="e.g., 300"></label>
      </div>
      <div class="input-row">
        <label>Coats<br><input id="cv_coats" type="number" step="1" min="1" value="1"></label>
        <label>Waste (%)<br><input id="cv_waste" type="number" step="0.1" value="5"></label>
      </div>
      <div class="input-row">
        <label>Container size (gal)<br><input id="cv_size" type="number" step="0.1" value="5"></label>
        <div></div>
      </div>
      <section id="cv_out_wrap"></section>
    `;

    $('cv_area').value  = s.area_ft2 ?? '';
    $('cv_rate').value  = s.rate_ft2_per_gal ?? '300';
    $('cv_coats').value = s.coats ?? '1';
    $('cv_waste').value = s.waste ?? '5';
    $('cv_size').value  = s.container_gal ?? '5';

    function compute(){
      const A = toNum($('cv_area').value);
      const R = toNum($('cv_rate').value);
      const coats = clamp(toNum($('cv_coats').value) ?? 1, 1, 10);
      const waste = clamp(toNum($('cv_waste').value) ?? 0, 0, 20);
      const size = clamp(toNum($('cv_size').value) ?? 5, 0.5, 55);

      state.coverage = { area_ft2:String(A||''), rate_ft2_per_gal:String(R||''), coats:String(coats||''), waste:String(waste||''), container_gal:String(size||'') };
      saveState(state);
      writeHash('#coverage', state.coverage);

      if (!(A>0 && R>0)){
        $('cv_out_wrap').innerHTML = '<div class="card"><div class="out">Enter area and coverage rate.</div></div>';
        return;
      }

      const gal = (A / R) * coats;
      const galW = gal * (1 + waste/100);
      const containers = Math.ceil(galW / size);

      const text = [
        `Base gallons: ${fmt(gal,2)} gal`,
        `With waste ${fmt(waste,1)}%: ${fmt(galW,2)} gal`,
        `Containers (${fmt(size,1)} gal): ${containers}`
      ].join('\n');

      const html = `
        <div class="card">
          <h3>Material</h3>
          <div class="out">
            Base gallons: ${fmt(gal,2)} gal<br>
            With waste ${fmt(waste,1)}%: <strong>${fmt(galW,2)} gal</strong><br>
            Containers (${fmt(size,1)} gal): <strong>${containers}</strong>
          </div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $('cv_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['cv_area','cv_rate','cv_coats','cv_waste','cv_size'].forEach(id=>{ const el=$(id); el.addEventListener('input', compute, {passive:true}); el.addEventListener('change', compute, {passive:true}); });
    compute();
  }

  // =========================================================
  // EVAPORATION RATE (nomograph-style approximation)
  // =========================================================
  function renderEvap(params){
    if (titleNode) titleNode.textContent = 'Evaporation Rate (estimate)';
    if (!mount) return;

    const s = Object.assign({ tc_f:'', ta_f:'', v_mph:'', rh:'40' }, state.evap||{});
    ['tc_f','ta_f','v_mph','rh'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Evaporation Rate (estimate)</h2>
      <div class="input-row">
        <label>Concrete temp Tc (°F)<br><input id="ev_tc" type="number" step="0.1" placeholder="e.g., 70"></label>
        <label>Air temp Ta (°F)<br><input id="ev_ta" type="number" step="0.1" placeholder="e.g., 70"></label>
      </div>
      <div class="input-row">
        <label>Wind speed (mph)<br><input id="ev_v" type="number" step="0.1" placeholder="e.g., 10"></label>
        <label>RH (%)<br><input id="ev_rh" type="number" step="0.1" placeholder="e.g., 40"></label>
      </div>
      <section id="ev_out_wrap"></section>
    `;

    $('ev_tc').value = s.tc_f ?? '';
    $('ev_ta').value = s.ta_f ?? '';
    $('ev_v').value  = s.v_mph ?? '';
    $('ev_rh').value = s.rh ?? '40';

    function compute(){
      const TcF = toNum($('ev_tc').value), TaF = toNum($('ev_ta').value);
      const Vmph= toNum($('ev_v').value), RHin= toNum($('ev_rh').value);

      state.evap = { tc_f:String(TcF||''), ta_f:String(TaF||''), v_mph:String(Vmph||''), rh:String(RHin||'') };
      saveState(state);
      writeHash('#evap', state.evap);

      if ([TcF,TaF,Vmph,RHin].some(v=>v==null)){
        $('ev_out_wrap').innerHTML = '<div class="card"><div class="out">Enter Tc, Ta, wind, RH.</div></div>';
        return;
      }

      const RH=Math.min(100,Math.max(0,RHin));
      const Vkmh=Math.max(0,Vmph)*1.60934;
      const Tc=(TcF-32)*5/9, Ta=(TaF-32)*5/9;

      const sat=tC=>Math.pow(Math.max(0,tC+18),2.5);
      const base=Math.max(0, sat(Tc) - (RH/100)*sat(Ta));
      const wind=1 + 0.4*Vkmh;

      const E_kgm2h=Math.max(0, 1e-6 * base * wind);
      const E_lbft2h=E_kgm2h * 0.204816;

      const risk=E_lbft2h>=0.20?"bad":(E_lbft2h>=0.15?"warn":"ok");
      const label=E_lbft2h>=0.20?"≥ 0.20 caution":(E_lbft2h>=0.15?"0.15–0.20 watch":"< 0.15 lower risk");

      const text = [
        `Evap rate: ${fmt(E_kgm2h,2)} kg/m²/h`,
        `${fmt(E_lbft2h,3)} lb/ft²/hr`,
        label
      ].join('\n');

      const html = `
        <div class="card">
          <h3>Rate</h3>
          <div class="out">
            Evap rate: ${fmt(E_kgm2h,2)} kg/m²/h | ${fmt(E_lbft2h,3)} lb/ft²/hr · <span class="${risk}">${label}</span><br>
            <div class="small" style="margin-top:6px">Advisory only. Compare to the common caution threshold of 0.20 lb/ft²/hr.</div>
          </div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $('ev_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['ev_tc','ev_ta','ev_v','ev_rh'].forEach(id=>{ const el=$(id); el.addEventListener('input', compute, {passive:true}); el.addEventListener('change', compute, {passive:true}); });
    compute();
  }

  // =========================================================
  // FRESH CONCRETE TEMP (estimate)
  // =========================================================
  function renderTemp(params){
    if (titleNode) titleNode.textContent = 'Fresh Concrete Temperature (estimate)';
    if (!mount) return;

    const s = Object.assign({ tw:'', ww:'', tc:'', wc:'', tca:'', wca:'', tfa:'', wfa:'' }, state.temp||{});
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

    $('te_tw').value = s.tw ?? '';   $('te_ww').value = s.ww ?? '';
    $('te_tc').value = s.tc ?? '';   $('te_wc').value = s.wc ?? '';
    $('te_tca').value = s.tca ?? ''; $('te_wca').value = s.wca ?? '';
    $('te_tfa').value = s.tfa ?? ''; $('te_wfa').value = s.wfa ?? '';

    function compute(){
      const Tw = toNum($('te_tw').value),  Ww = toNum($('te_ww').value);
      const Tc = toNum($('te_tc').value),  Wc = toNum($('te_wc').value);
      const Tca= toNum($('te_tca').value), Wca= toNum($('te_wca').value);
      const Tfa= toNum($('te_tfa').value), Wfa= toNum($('te_wfa').value);

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

      state.temp = { tw:$('te_tw').value, ww:$('te_ww').value, tc:$('te_tc').value, wc:$('te_wc').value, tca:$('te_tca').value, wca:$('te_wca').value, tfa:$('te_tfa').value, wfa:$('te_wfa').value };
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
          <div class="out">
            ${Tmix==null ? 'Enter temps and weights.' : `Estimated fresh concrete temperature: <strong>${fmt(Tmix,1)} °F</strong>`}<br>
            <span class="${badge}">${label}</span>
            <div class="small" style="margin-top:6px">Advisory only. Verify onsite temperature per method.</div>
          </div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $('te_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['te_tw','te_ww','te_tc','te_wc','te_tca','te_wca','te_tfa','te_wfa'].forEach(id=>{ const el=$(id); el.addEventListener('input', compute, { passive:true }); el.addEventListener('change', compute, { passive:true }); });
    compute();
  }

  // =========================================================
  // INSULATION NEED (basic heuristic)
  // =========================================================
  function renderInsulation(params){
    if (titleNode) titleNode.textContent = 'Insulation Need (basic)';
    if (!mount) return;

    const s = Object.assign({ t_target:'50', t_ambient:'20', wind_mph:'5', hours:'12' }, state.insulation||{});
    ['t_target','t_ambient','wind_mph','hours'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Insulation Need (basic)</h2>
      <p class="muted">Heuristic blanket R-value suggestion from ΔT, wind, and duration. Advisory only.</p>
      <div class="input-row">
        <label>Target min concrete temp (°F)<br><input id="in_tgt" type="number" step="0.1" value="50"></label>
        <label>Ambient temp (°F)<br><input id="in_amb" type="number" step="0.1" value="20"></label>
      </div>
      <div class="input-row">
        <label>Wind speed (mph)<br><input id="in_wind" type="number" step="0.1" value="5"></label>
        <label>Exposure duration (hr)<br><input id="in_hr" type="number" step="1" value="12"></label>
      </div>
      <section id="in_out_wrap"></section>
    `;

    $('in_tgt').value = s.t_target ?? '50';
    $('in_amb').value = s.t_ambient ?? '20';
    $('in_wind').value= s.wind_mph ?? '5';
    $('in_hr').value  = s.hours ?? '12';

    function compute(){
      const Tt = toNum($('in_tgt').value);
      const Ta = toNum($('in_amb').value);
      const W  = toNum($('in_wind').value) || 0;
      const H  = toNum($('in_hr').value) || 0;

      state.insulation = { t_target:String(Tt||''), t_ambient:String(Ta||''), wind_mph:String(W||''), hours:String(H||'') };
      saveState(state);
      writeHash('#insulation', state.insulation);

      if (Tt==null || Ta==null){
        $('in_out_wrap').innerHTML = '<div class="card"><div class="out">Enter target and ambient temps.</div></div>';
        return;
      }

      const dT = Math.max(0, Tt - Ta);
      // Very simple heuristic: baseline R ≈ dT / 10; wind bumps it: R ≈ (dT/10) * (1 + W/20); long duration adds 10% per 12 hr
      let R = (dT/10) * (1 + (W/20)) * (1 + (H/12)*0.10);
      R = Math.max(0, R);

      // Blanket suggestion (typical products ~R=1.0–1.5 per layer)
      const perLayer = 1.25;
      const layers = Math.max(1, Math.ceil(R / perLayer));

      const text = [
        `ΔT: ${fmt(dT,1)} °F`,
        `Estimated R-value: ${fmt(R,1)}`,
        `Suggested blankets: ~${layers} layer(s)`
      ].join('\n');

      const html = `
        <div class="card">
          <h3>Recommendation</h3>
          <div class="out">
            ΔT: ${fmt(dT,1)} °F<br>
            Estimated R-value: <strong>${fmt(R,1)}</strong><br>
            Suggested insulating blankets: <strong>~${layers} layer(s)</strong>
          </div>
          <div class="small" style="margin-top:6px">Heuristic only. Use project-specific thermal control plans for critical placements.</div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $('in_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['in_tgt','in_amb','in_wind','in_hr'].forEach(id=>{ const el=$(id); el.addEventListener('input', compute, {passive:true}); el.addEventListener('change', compute, {passive:true}); });
    compute();
  }

  // =========================================================
  // STRENGTH GAIN (heuristic)
  // =========================================================
  function renderStrength(params){
    if (titleNode) titleNode.textContent = 'Strength Gain (heuristic)';
    if (!mount) return;

    const s = Object.assign({ fc:'4000', curve:'normal' }, state.strength||{});
    ['fc','curve'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML = `
      <h2>Strength Gain (heuristic)</h2>
      <div class="input-row">
        <label>f'c (psi)<br><input id="st_fc" type="number" step="1" value="4000"></label>
        <label>Curve<br>
          <select id="st_curve">
            <option value="normal" selected>Normal cement</option>
            <option value="scm">SCM-rich / slower early</option>
          </select>
        </label>
      </div>
      <section id="st_out_wrap"></section>
    `;

    $('st_fc').value = s.fc ?? '4000';
    $('st_curve').value = s.curve ?? 'normal';

    function compute(){
      const fc = toNum($('st_fc').value) || 4000;
      const curve = $('st_curve').value;

      state.strength = { fc:String(fc||''), curve };
      saveState(state);
      writeHash('#strength', state.strength);

      // Typical heuristic % of 28-day f'c (these are advisory ballparks)
      const pctNormal = { 1:0.25, 3:0.45, 7:0.65, 14:0.80, 21:0.90, 28:1.00, 56:1.10 };
      const pctSCM    = { 1:0.15, 3:0.30, 7:0.50, 14:0.70, 21:0.85, 28:1.00, 56:1.15 };
      const table = (curve==='scm') ? pctSCM : pctNormal;

      const ages = Object.keys(table).map(a=>parseInt(a,10)).sort((a,b)=>a-b);
      const rows = ages.map(a=>{
        const f = fc * table[a];
        return `<tr><td>${a} d</td><td>${fmt(table[a]*100,0)}%</td><td>${fmt(f,0)} psi</td></tr>`;
      }).join('');

      const text = ages.map(a=>`${a} d: ${fmt(table[a]*100,0)}% → ${fmt(fc*table[a],0)} psi`).join('\n');

      const html = `
        <div class="card">
          <h3>Typical Strength Gain</h3>
          <div class="out">
            <table style="width:100%; border-collapse:collapse">
              <thead><tr><th style="text-align:left">Age</th><th style="text-align:left">% of 28-day</th><th style="text-align:left">Est. psi</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
            <div class="small" style="margin-top:6px">Heuristic only. Use maturity, project data, or lab curves for decisions.</div>
          </div>
        </div>
      `;
      const node = pillCopy(html, ()=>text);
      const wrap = $('st_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }

    ['st_fc','st_curve'].forEach(id=>{ const el=$(id); el.addEventListener('input', compute, {passive:true}); el.addEventListener('change', compute, {passive:true}); });
    compute();
  }

})();




