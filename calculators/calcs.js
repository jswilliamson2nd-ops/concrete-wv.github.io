<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Concrete Calculators · ACI West Virginia</title>

  <link rel="icon" href="/assets/aciwv_logo_favicon_256x256.png" type="image/png" />
  <link rel="canonical" href="https://concrete-wv.org/calculators/" />
  <meta name="theme-color" content="#0b1220" />

  <!-- PWA -->
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="apple-touch-icon" href="/assets/pwa/icon-192.png">

  <!-- SEO / social -->
  <meta name="description" content="Phone-friendly concrete calculators for field use — volume, rebar, joint spacing, slope/grade, yield, w/cm, moisture adjustment, pump output, truck cycle, coverage, evaporation, fresh temp, insulation, strength gain, and cylinder break planner." />
  <meta property="og:title" content="Concrete Calculators · ACI West Virginia" />
  <meta property="og:description" content="Fast, field-ready concrete calculators that work great on phones." />
  <meta property="og:image" content="https://concrete-wv.org/assets/aciwv_logo_white_square.png" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://concrete-wv.org/calculators/" />
  <meta name="twitter:card" content="summary_large_image" />

  <style>
    :root{ --bg:#0b1220; --bg2:#0f172a; --border:#1f2a44; --text:#e6edf3; --dim:#b9c4d0; --accent:#2aa198; --card:#101828; --shadow:0 6px 18px rgba(0,0,0,.25) }
    *{box-sizing:border-box} html,body{height:100%}
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:linear-gradient(180deg,var(--bg),var(--bg2));color:var(--text);line-height:1.6}
    a{color:var(--text);text-decoration:none} a:hover{color:var(--accent)}
    .container{width:min(1080px,92vw);margin:0 auto}
    header{position:sticky;top:0;z-index:50;border-bottom:1px solid var(--border);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);background:rgba(11,18,32,.7)}
    .nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 0;flex-wrap:wrap}
    .logo{height:48px;filter:drop-shadow(0 6px 16px rgba(0,0,0,.35))}
    nav a{color:var(--dim);padding:6px 2px} nav a.active{color:var(--accent);font-weight:600}
    h1{margin:18px 0 6px}
    .muted{color:var(--dim)}
    .grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:18px 0 40px}
    .card{border:1px solid var(--border);border-radius:16px;background:var(--card);padding:18px;box-shadow:var(--shadow)}
    .btn{display:inline-block;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:#0e1627;color:var(--text);text-align:center;cursor:pointer;transition:.15s transform, .15s background}
    .btn:hover{transform:translateY(-1px)}
    .badge{display:inline-block;font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid var(--border);color:var(--dim)}
    .tool{margin:10px 0 30px}
    .input-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0}
    .input-row label{font-size:13px;color:var(--dim)}
    input[type="number"], select, input[type="text"], input[type="date"], input[type="time"]{
      width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);background:#0e1627;color:var(--text)
    }
    .out{padding:10px;border-radius:10px;background:#0e1627;border:1px dashed var(--border);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
    .ok{color:#7bd389}.warn{color:#ffd166}.bad{color:#ff6b6b}
    .small{font-size:12px;color:var(--dim)}
    footer{border-top:1px solid var(--border);text-align:center;color:var(--dim);font-size:14px;padding:20px 0}
    @media (max-width:520px){ .grid{grid-template-columns:1fr} .input-row{grid-template-columns:1fr} }
  </style>
</head>
<body>
  <header>
    <div class="container nav">
      <a href="/" aria-label="Home"><img class="logo" src="/assets/aciwv_logo_body.png?v=5" alt="ACI WV" /></a>
      <nav aria-label="Primary">
        <a href="/">Home</a>
        <a href="/topics/">Topics</a>
        <a href="/wvdoh.html">WVDOH Info Corner</a>
        <a href="/calculators/" class="active">Calculators</a>
        <a href="/#verify">Verify</a>
        <a href="/#contact">Contact</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <h1>Concrete Calculators</h1>
    <p class="muted">Fast, phone-friendly tools. Results are advisory—verify against contract docs and official methods.</p>

    <!-- Hub cards -->
    <section class="grid" aria-label="Calculator list">
      <article class="card"><h2>Volume (yd³) <span class="badge">Slab/Trench/Column</span></h2><p class="muted">Estimate yd³ with waste and quick truck loads.</p><p><a class="btn" href="#volume">Open Volume</a></p></article>
      <article class="card"><h2>Rebar Takeoff (simple)</h2><p class="muted">Bar counts, cut length, total weight.</p><p><a class="btn" href="#rebar">Open Rebar</a></p></article>
      <article class="card"><h2>Joint Spacing</h2><p class="muted">Rule-of-thumb from slab thickness.</p><p><a class="btn" href="#joints">Open Joint Spacing</a></p></article>
      <article class="card"><h2>Slope / Grade</h2><p class="muted">Rise/run, % slope, thickness change.</p><p><a class="btn" href="#slope">Open Slope</a></p></article>
      <article class="card"><h2>Yield (ASTM C138)</h2><p class="muted">yd³ and relative yield; optional cement/water per yd³.</p><p><a class="btn" href="#yield">Open Yield</a></p></article>
      <article class="card"><h2>w/c & w/cm</h2><p class="muted">Water–cement and water–cementitious ratios.</p><p><a class="btn" href="#wc">Open w/c</a></p></article>
      <article class="card"><h2>Moisture / Absorption Adjust</h2><p class="muted">Add/remove batch water; updated w/cm.</p><p><a class="btn" href="#water">Open Moisture</a></p></article>
      <article class="card"><h2>Pump Time & Output</h2><p class="muted">Yards/hour and pour duration.</p><p><a class="btn" href="#pump">Open Pump</a></p></article>
      <article class="card"><h2>Truck Cycle Planner</h2><p class="muted">Loads, cycle time, fleet size.</p><p><a class="btn" href="#cycle">Open Cycle Planner</a></p></article>
      <article class="card"><h2>Surface Coverage</h2><p class="muted">Curing/sealer gallons from ft² & rate.</p><p><a class="btn" href="#coverage">Open Coverage</a></p></article>
      <article class="card"><h2>Evaporation Rate</h2><p class="muted">Nomograph-style estimate (caution ≥ 0.20 lb/ft²/hr).</p><p><a class="btn" href="#evap">Open Evap Rate</a></p></article>
      <article class="card"><h2>Fresh Concrete Temp</h2><p class="muted">Component temps/weights → mix temp.</p><p><a class="btn" href="#temp">Open Temp</a></p></article>
      <article class="card"><h2>Insulation Need (basic)</h2><p class="muted">Heuristic blankets from ΔT & exposure.</p><p><a class="btn" href="#insulation">Open Insulation</a></p></article>
      <article class="card"><h2>Strength Gain (heuristic)</h2><p class="muted">Typical % vs age; normal vs SCM.</p><p><a class="btn" href="#strength">Open Strength Gain</a></p></article>
      <article class="card"><h2>Cylinder Break Planner</h2><p class="muted">7/14/28-day dates; custom ages.</p><p><a class="btn" href="#cylinders">Open Planner</a></p></article>
    </section>

    <!-- Tool mount point -->
    <section id="tool" class="card tool" aria-live="polite">
      <h2 id="tool-title">Select a calculator above</h2>
      <p class="muted">Deep links like <code>/calculators/#yield</code> will load here.</p>
    </section>

    <p class="muted" style="margin-top:12px">Questions or requests? <a href="mailto:info@concrete-wv.org">info@concrete-wv.org</a></p>
    <p><a href="/wvdoh.html">← Back to WVDOH Info Corner</a></p>
  </main>

  <footer>© <span id="y"></span> ACI West Virginia Interest Group</footer>

  <script>
    (function(){ const y=document.getElementById('y'); if(y) y.textContent=new Date().getFullYear(); })();
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(()=>{}); }
  </script>

  <!-- Calculator logic -->
  <script src="./calcs.js" defer></script>
</body>
</html>
/calculators/calcs.js (replace the whole file)
javascript
Copy code
/* ACI WV · calculators/calcs.js
   Tools: #volume, #rebar, #joints, #slope, #yield, #wc, #water,
          #pump, #cycle, #coverage, #evap, #temp, #insulation, #strength, #cylinders
   - Mobile-first, no deps
   - LocalStorage persistence
   - Deep-link params (read & write)
   - Copy buttons on result cards
*/
(function(){
  // ---------- utils ----------
  const $  = (id, root=document) => root.getElementById(id);
  const qs = (sel, root=document) => root.querySelector(sel);
  const fmt = (n, d=2) => (Number.isFinite(n) ? n.toFixed(d) : '—');
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const num = (v) => { if(v==null) return null; const n = Number(String(v).trim().replace(/,/g,'')); return Number.isFinite(n)?n:null; };

  function readHash(){ const h=location.hash||''; const [hash,q='']=h.split('?'); return {hash:hash.toLowerCase(), params:new URLSearchParams(q)}; }
  function writeHash(hash,obj){ const p=new URLSearchParams(); Object.entries(obj||{}).forEach(([k,v])=>{ if(v!==''&&v!=null&&!Number.isNaN(v)) p.set(k,String(v)); }); const next=p.toString()?`${hash}?${p}`:hash; if(location.hash!==next) history.replaceState(null,'',next); }

  const LS_KEY='aciwv_calc_state_v4';
  const load=()=>{ try{return JSON.parse(localStorage.getItem(LS_KEY)||'{}')}catch{return{}} };
  const save=s=>{ try{localStorage.setItem(LS_KEY,JSON.stringify(s))}catch{} };
  const state=load();

  async function copyText(text){
    try{ await navigator.clipboard.writeText(text); return true; }
    catch{ const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); let ok=false; try{ ok=document.execCommand('copy'); }catch{} ta.remove(); return ok; }
  }
  function pillCopy(html,getText){
    const wrap=document.createElement('div'); wrap.style.position='relative'; wrap.innerHTML=html;
    const out=wrap.firstElementChild; const btn=document.createElement('button');
    btn.textContent='Copy'; btn.className='btn'; btn.style.position='absolute'; btn.style.top='8px'; btn.style.right='8px'; btn.style.padding='6px 10px'; btn.style.fontSize='12px';
    btn.addEventListener('click',async()=>{ const ok=await copyText(getText()); btn.textContent=ok?'Copied!':'Copy failed'; setTimeout(()=>btn.textContent='Copy',1200); });
    out.style.position='relative'; out.appendChild(btn); return wrap;
  }

  const mount=$('tool'); const titleNode=$('tool-title');

  // ---------- router ----------
  const tools={
    '#volume':renderVolume, '#rebar':renderRebar, '#joints':renderJoints, '#slope':renderSlope,
    '#yield':renderYield, '#wc':renderWC, '#water':renderWater,
    '#pump':renderPump, '#cycle':renderCycle, '#coverage':renderCoverage,
    '#evap':renderEvap, '#temp':renderTemp, '#insulation':renderInsulation, '#strength':renderStrength,
    '#cylinders':renderCylinders
  };
  function render(){ const {hash,params}=readHash(); if(!tools[hash]){ if(titleNode) titleNode.textContent='Select a calculator above'; if(mount) mount.innerHTML='<p class="muted">Pick a tool from the cards above.</p>'; return; } tools[hash](params); }
  window.addEventListener('hashchange',render); document.addEventListener('DOMContentLoaded',render);

  // =========================================================
  // VOLUME (yd³): slab / trench / column
  // =========================================================
  function renderVolume(params){
    if (titleNode) titleNode.textContent='Volume (yd³) — slab / trench / column';
    if (!mount) return;

    const s=Object.assign({shape:'slab', waste:'5',
      len:'',wid:'',th_in:'',qty:'1',
      trench_len:'',trench_w_in:'',trench_d_in:'',trench_qty:'1',
      col_d_in:'',col_h_ft:'',col_qty:'1'
    }, state.volume||{});
    ['shape','waste','len','wid','th_in','qty','trench_len','trench_w_in','trench_d_in','trench_qty','col_d_in','col_h_ft','col_qty']
      .forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML=`
      <h2>Volume (yd³)</h2>
      <p class="muted">Estimate volume with optional waste and quick truck-loads.</p>
      <div class="input-row">
        <label>Shape<br>
          <select id="v_shape">
            <option value="slab">Slab / Pad (rect)</option>
            <option value="trench">Trench / Footing</option>
            <option value="column">Column (cyl)</option>
          </select>
        </label>
        <label>Waste (%)<br><input id="v_waste" type="number" step="0.1" min="0" max="30" placeholder="e.g., 5"></label>
      </div>

      <section id="v_slab" class="card" style="margin-top:8px">
        <h3>Slab / Pad</h3>
        <div class="input-row">
          <label>Length (ft)<br><input id="v_len" type="number" step="0.01" min="0"></label>
          <label>Width (ft)<br><input id="v_wid" type="number" step="0.01" min="0"></label>
        </div>
        <div class="input-row">
          <label>Thickness (in)<br><input id="v_th" type="number" step="0.1" min="0"></label>
          <label>Quantity<br><input id="v_qty" type="number" step="1" min="1" value="1"></label>
        </div>
        <div class="out" id="v_out_slab">Enter dimensions.</div>
      </section>

      <section id="v_trench" class="card" style="margin-top:8px;display:none">
        <h3>Trench / Footing</h3>
        <div class="input-row">
          <label>Total length (ft)<br><input id="vt_len" type="number" step="0.01" min="0"></label>
          <label>Width (in)<br><input id="vt_w" type="number" step="0.1" min="0"></label>
        </div>
        <div class="input-row">
          <label>Depth (in)<br><input id="vt_d" type="number" step="0.1" min="0"></label>
          <label>Quantity<br><input id="vt_qty" type="number" step="1" min="1" value="1"></label>
        </div>
        <div class="out" id="v_out_trench">Enter dimensions.</div>
      </section>

      <section id="v_column" class="card" style="margin-top:8px;display:none">
        <h3>Column (cylindrical)</h3>
        <div class="input-row">
          <label>Diameter (in)<br><input id="vc_d" type="number" step="0.1" min="0"></label>
          <label>Height (ft)<br><input id="vc_h" type="number" step="0.01" min="0"></label>
        </div>
        <div class="input-row">
          <label>Quantity<br><input id="vc_qty" type="number" step="1" min="1" value="1"></label>
          <div></div>
        </div>
        <div class="out" id="v_out_col">Enter dimensions.</div>
      </section>

      <section id="v_summary" style="margin-top:10px"></section>
    `;
    qs('#v_shape').value=s.shape; $('#v_waste').value=s.waste??'';
    $('#v_len').value=s.len??''; $('#v_wid').value=s.wid??''; $('#v_th').value=s.th_in??''; $('#v_qty').value=s.qty??'1';
    $('#vt_len').value=s.trench_len??''; $('#vt_w').value=s.trench_w_in??''; $('#vt_d').value=s.trench_d_in??''; $('#vt_qty').value=s.trench_qty??'1';
    $('#vc_d').value=s.col_d_in??''; $('#vc_h').value=s.col_h_ft??''; $('#vc_qty').value=s.col_qty??'1';

    function syncPanels(){ const shape=qs('#v_shape').value;
      qs('#v_slab').style.display=shape==='slab'?'':'none';
      qs('#v_trench').style.display=shape==='trench'?'':'none';
      qs('#v_column').style.display=shape==='column'?'':'none';
      compute();
    }

    function compute(){
      const shape=qs('#v_shape').value; const waste=clamp(num($('#v_waste').value)??0,0,30);
      state.volume=Object.assign(state.volume||{}, {shape,waste:String(waste)});
      let ft3=0, qty=1;

      if(shape==='slab'){
        const L=num($('#v_len').value), W=num($('#v_wid').value), Th=num($('#v_th').value); qty=clamp(num($('#v_qty').value)??1,1,9999);
        if(L>0&&W>0&&Th>0){ ft3=L*W*(Th/12)*qty; $('#v_out_slab').innerHTML=`ft³: ${fmt(ft3,2)} (L×W×t × qty)`; Object.assign(state.volume,{len:String(L),wid:String(W),th_in:String(Th),qty:String(qty)}); writeHash('#volume',{shape,len:L,wid:W,th_in:Th,qty,waste}); }
        else $('#v_out_slab').textContent='Enter dimensions.';
      } else if(shape==='trench'){
        const L=num($('#vt_len').value), W=num($('#vt_w').value), D=num($('#vt_d').value); qty=clamp(num($('#vt_qty').value)??1,1,9999);
        if(L>0&&W>0&&D>0){ ft3=L*(W/12)*(D/12)*qty; $('#v_out_trench').innerHTML=`ft³: ${fmt(ft3,2)} (L × W × D × qty)`; Object.assign(state.volume,{trench_len:String(L),trench_w_in:String(W),trench_d_in:String(D),trench_qty:String(qty)}); writeHash('#volume',{shape,trench_len:L,trench_w_in:W,trench_d_in:D,trench_qty:qty,waste}); }
        else $('#v_out_trench').textContent='Enter dimensions.';
      } else {
        const Dia=num($('#vc_d').value), H=num($('#vc_h').value); qty=clamp(num($('#vc_qty').value)??1,1,9999);
        if(Dia>0&&H>0){ const r_ft=(Dia/12)/2; ft3=Math.PI*r_ft*r_ft*H*qty; $('#v_out_col').innerHTML=`ft³: ${fmt(ft3,2)} (π r² h × qty)`; Object.assign(state.volume,{col_d_in:String(Dia),col_h_ft:String(H),col_qty:String(qty)}); writeHash('#volume',{shape,col_d_in:Dia,col_h_ft:H,col_qty:qty,waste}); }
        else $('#v_out_col').textContent='Enter dimensions.';
      }
      save(state);

      const yd3=ft3/27, yd3w=yd3*(1+waste/100);
      const loads=[9.0,9.5,10.0].map(sz=>{ const count=Math.ceil(yd3w/sz); const over=count*sz-yd3w; return {sz,count,over};});
      const summaryText=[`Volume: ${fmt(yd3,3)} yd³`,`Waste: ${fmt(waste,1)}% → ${fmt(yd3w,3)} yd³`,`Loads 9.0/9.5/10.0: ${loads[0].count}/${loads[1].count}/${loads[2].count}`].join('\n');
      const html=`<div class="card"><h3>Summary</h3><div class="out" id="v_sum">Volume: ${fmt(yd3,3)} yd³<br>With waste ${fmt(waste,1)}%: <strong>${fmt(yd3w,3)} yd³</strong><br>• 9.0 yd³: ${loads[0].count} (over ${fmt(loads[0].over,2)} yd³)<br>• 9.5 yd³: ${loads[1].count} (over ${fmt(loads[1].over,2)} yd³)<br>• 10.0 yd³: ${loads[2].count} (over ${fmt(loads[2].over,2)} yd³)</div></div>`;
      const node=pillCopy(html,()=>summaryText); const target=$('#v_summary'); target.innerHTML=''; target.appendChild(node);
    }

    ['v_shape','v_waste','v_len','v_wid','v_th','v_qty','vt_len','vt_w','vt_d','vt_qty','vc_d','vc_h','vc_qty'].forEach(id=>{ const el=$(id); el&&el.addEventListener('input',compute,{passive:true}); el&&el.addEventListener('change',compute,{passive:true}); });
    qs('#v_shape').addEventListener('change',()=>{ state.volume=Object.assign(state.volume||{}, {shape:qs('#v_shape').value}); save(state); syncPanels(); });
    syncPanels();
  }

  // =========================================================
  // REBAR TAKEOFF (simple)
  // =========================================================
  function renderRebar(params){
    if (titleNode) titleNode.textContent='Rebar Takeoff (simple)';
    if (!mount) return;
    const wtPerFt = { '#3':0.376, '#4':0.668, '#5':1.043, '#6':1.502, '#7':2.044, '#8':2.670 };
    const s=Object.assign({dir:'both', L:'', W:'', spacing:'12', bar:'#4', lap_in:'0', waste:'5'}, state.rebar||{});
    ['dir','L','W','spacing','bar','lap_in','waste'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });

    mount.innerHTML=`
      <h2>Rebar Takeoff (simple)</h2>
      <p class="muted">Grid bars by spacing. Assumes straight bars with optional lap allowance.</p>
      <div class="input-row">
        <label>Direction<br>
          <select id="rb_dir"><option value="x">One way</option><option value="both">Both ways</option></select>
        </label>
        <label>Bar size<br>
          <select id="rb_bar">${Object.keys(wtPerFt).map(k=>`<option value="${k}">${k}</option>`).join('')}</select>
        </label>
      </div>
      <div class="input-row">
        <label>Length L (ft)<br><input id="rb_L" type="number" step="0.1" min="0"></label>
        <label>Width W (ft)<br><input id="rb_W" type="number" step="0.1" min="0"></label>
      </div>
      <div class="input-row">
        <label>Spacing (in)<br><input id="rb_s" type="number" step="0.1" min="2"></label>
        <label>Lap allowance per bar (in)<br><input id="rb_lap" type="number" step="0.1" min="0" value="0"></label>
      </div>
      <div class="input-row">
        <label>Waste (%)<br><input id="rb_waste" type="number" step="0.1" min="0" max="20" value="5"></label>
        <div></div>
      </div>
      <section id="rb_out_wrap"></section>
    `;
    $('#rb_dir').value=s.dir; $('#rb_bar').value=s.bar; $('#rb_L').value=s.L??''; $('#rb_W').value=s.W??''; $('#rb_s').value=s.spacing??'12'; $('#rb_lap').value=s.lap_in??'0'; $('#rb_waste').value=s.waste??'5';

    function compute(){
      const dir=$('#rb_dir').value; const L=num($('#rb_L').value)||0; const W=num($('#rb_W').value)||0; const s_in=Math.max(1,num($('#rb_s').value)||0); const lap=num($('#rb_lap').value)||0; const waste=clamp(num($('#rb_waste').value)||0,0,20); const bar=$('#rb_bar').value;
      state.rebar={dir,L:String(L),W:String(W),spacing:String(s_in),bar,lap_in:String(lap),waste:String(waste)}; save(state); writeHash('#rebar',state.rebar);

      let countX=0, countY=0, lenFt=0;
      if (L>0 && W>0 && s_in>0){
        countX = Math.floor((W*12)/s_in)+1; // bars along L, spaced across W
        countY = (dir==='both') ? Math.floor((L*12)/s_in)+1 : 0; // bars along W
        const lenBarX = L + lap/12;
        const lenBarY = W + lap/12;
        lenFt = countX*lenBarX + countY*lenBarY;
      }
      const lenFtWaste = lenFt*(1+waste/100);
      const wt = (wtPerFt[bar]||0)*lenFtWaste;
      const text = [`Bars one way: ${countX}`, (dir==='both'?`Bars other way: ${countY}`:''), `Total length: ${fmt(lenFtWaste,1)} ft (incl. waste)`, `Est. weight: ${fmt(wt,1)} lb (${bar})`].filter(Boolean).join('\n');
      const html = `<div class="card"><h3>Totals</h3><div class="out">One way: ${countX}${dir==='both'?` · Other way: ${countY}`:''}<br>Total length: <strong>${fmt(lenFtWaste,1)} ft</strong><br>Estimated weight: <strong>${fmt(wt,1)} lb</strong> (${bar})</div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#rb_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['rb_dir','rb_bar','rb_L','rb_W','rb_s','rb_lap','rb_waste'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); });
    compute();
  }

  // =========================================================
  // JOINT SPACING (rule of thumb: 24–36 × thickness in → spacing in)
  // =========================================================
  function renderJoints(params){
    if (titleNode) titleNode.textContent='Joint Spacing';
    if (!mount) return;
    const s=Object.assign({t_in:'', target:'30'}, state.joints||{}); ['t_in','target'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Joint Spacing</h2>
      <p class="muted">Rule-of-thumb: spacing (in) ≈ 24–36 × thickness (in). Target commonly ~30×.</p>
      <div class="input-row">
        <label>Slab thickness (in)<br><input id="j_t" type="number" step="0.1" min="2"></label>
        <label>Target multiplier (×)<br><input id="j_m" type="number" step="1" min="20" max="40"></label>
      </div>
      <section id="j_out_wrap"></section>
    `;
    $('#j_t').value=s.t_in??''; $('#j_m').value=s.target??'30';
    function compute(){
      const t=num($('#j_t').value)||0; const m=clamp(num($('#j_m').value)||30,20,40);
      state.joints={t_in:String(t),target:String(m)}; save(state); writeHash('#joints',state.joints);
      const minIn=24*t, tgtIn=m*t, maxIn=36*t; const minFt=minIn/12, tgtFt=tgtIn/12, maxFt=maxIn/12;
      const text=[`Min: ${fmt(minFt,2)} ft`, `Target: ${fmt(tgtFt,2)} ft`, `Max: ${fmt(maxFt,2)} ft`].join('\n');
      const html=`<div class="card"><h3>Spacing</h3><div class="out">Min (24×): ${fmt(minFt,2)} ft<br>Target (${fmt(m,0)}×): <strong>${fmt(tgtFt,2)} ft</strong><br>Max (36×): ${fmt(maxFt,2)} ft</div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#j_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['j_t','j_m'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }

  // =========================================================
  // SLOPE / GRADE
  // =========================================================
  function renderSlope(params){
    if (titleNode) titleNode.textContent='Slope / Grade';
    if (!mount) return;
    const s=Object.assign({run_ft:'', rise_in:'', pct:''}, state.slope||{}); ['run_ft','rise_in','pct'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Slope / Grade</h2>
      <p class="muted">Convert rise/run, % slope, and thickness change across a width.</p>
      <div class="input-row">
        <label>Run (ft)<br><input id="sl_run" type="number" step="0.01" min="0"></label>
        <label>Rise (in)<br><input id="sl_rise" type="number" step="0.01" min="0"></label>
      </div>
      <div class="input-row">
        <label>% Slope<br><input id="sl_pct" type="number" step="0.01" min="0"></label>
        <div></div>
      </div>
      <section id="sl_out_wrap"></section>
    `;
    $('#sl_run').value=s.run_ft??''; $('#sl_rise').value=s.rise_in??''; $('#sl_pct').value=s.pct??'';
    function compute(){
      const run=num($('#sl_run').value); const rise=num($('#sl_rise').value); const pct=num($('#sl_pct').value);
      let useRun=run, useRise=rise, usePct=pct;
      if (Number.isFinite(run) && Number.isFinite(rise) && run>0){ usePct = (rise/(run*12))*100; }
      else if (Number.isFinite(run) && Number.isFinite(pct) && run>0){ useRise = (pct/100)*(run*12); }
      else if (Number.isFinite(rise) && Number.isFinite(pct) && pct>0){ useRun = (rise/(pct/100))/12; }
      state.slope={run_ft:String(useRun||''),rise_in:String(useRise||''),pct:String(usePct||'')}; save(state); writeHash('#slope',state.slope);
      const text=[`Run: ${fmt(useRun||0,2)} ft`,`Rise: ${fmt(useRise||0,2)} in`,`Slope: ${fmt(usePct||0,2)} %`].join('\n');
      const html=`<div class="card"><h3>Results</h3><div class="out">Run: ${fmt(useRun||0,2)} ft<br>Rise: ${fmt(useRise||0,2)} in<br>Slope: <strong>${fmt(usePct||0,2)} %</strong></div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#sl_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['sl_run','sl_rise','sl_pct'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }

  // =========================================================
  // YIELD (ASTM C138 style) + relative yield + optional cement/water per yd³
  // =========================================================
  function renderYield(params){
    if (titleNode) titleNode.textContent='Yield (ASTM C138)';
    if (!mount) return;
    const s=Object.assign({pcf:'',batchlb:'',plan:'', c_tot:'', w_tot:''}, state.yield||{});
    ['pcf','batchlb','plan','c_tot','w_tot'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Yield (ASTM C138)</h2>
      <p class="muted">Enter measured unit weight (pcf) and batch mass (lb). Optional: plan yd³, cement/water totals.</p>
      <div class="input-row">
        <label>Measured unit weight (pcf)<br><input id="y_pcf" type="number" step="0.1" min="60" max="170"></label>
        <label>Total batch mass (lb)<br><input id="y_batch" type="number" step="1" min="1"></label>
      </div>
      <div class="input-row">
        <label>Plan quantity (yd³) <span class="small">(optional)</span><br><input id="y_plan" type="number" step="0.01" min="0"></label>
        <div></div>
      </div>
      <div class="card">
        <h3>Optional per-yd³</h3>
        <div class="input-row">
          <label>Total cement (lb)<br><input id="y_c" type="number" step="0.1" min="0"></label>
          <label>Total water (lb)<br><input id="y_w" type="number" step="0.1" min="0"></label>
        </div>
      </div>
      <section id="y_out_wrap"></section>
    `;
    $('#y_pcf').value=s.pcf??''; $('#y_batch').value=s.batchlb??''; $('#y_plan').value=s.plan??''; $('#y_c').value=s.c_tot??''; $('#y_w').value=s.w_tot??'';
    function compute(){
      const pcf=num($('#y_pcf').value), batch=num($('#y_batch').value), plan=num($('#y_plan').value);
      const c=num($('#y_c').value), w=num($('#y_w').value);
      state.yield={pcf:String(pcf||''),batchlb:String(batch||''),plan:String(plan||''),c_tot:String(c||''),w_tot:String(w||'')}; save(state); writeHash('#yield',state.yield);
      let ft3=0, yd3=0, rel=null, pct=null;
      if (pcf>0 && batch>0){ ft3=batch/pcf; yd3=ft3/27; if(plan>0){ rel=yd3/plan; pct=(rel-1)*100; } }
      const cementPer = (c>0 && yd3>0) ? c/yd3 : null;
      const waterPer  = (w>0 && yd3>0) ? w/yd3 : null;
      const badge = (rel==null)?'':(Math.abs(pct)<=1?'ok':(Math.abs(pct)<=3?'warn':'bad'));
      const relStr = (rel==null)?'—':`${fmt(rel,3)} (${pct>=0?'+':''}${fmt(pct,1)}%)`;
      const text=[`Yield: ${fmt(yd3,3)} yd³`, (rel!=null?`Relative yield: ${relStr}`:''), (cementPer!=null?`Cement/yd³: ${fmt(cementPer,1)} lb`:''), (waterPer!=null?`Water/yd³: ${fmt(waterPer,1)} lb`:'')].filter(Boolean).join('\n');
      const html=`<div class="card"><h3>Results</h3><div class="out">ft³: ${fmt(ft3,2)} | yd³: <strong>${fmt(yd3,3)}</strong><br>Relative yield: <span class="${badge}">${relStr}</span>${cementPer!=null?`<br>Cement/yd³: ${fmt(cementPer,1)} lb`:''}${waterPer!=null?` · Water/yd³: ${fmt(waterPer,1)} lb`:''}</div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#y_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['y_pcf','y_batch','y_plan','y_c','y_w'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }

  // =========================================================
  // w/c & w/cm
  // =========================================================
  function renderWC(params){
    if (titleNode) titleNode.textContent='w/c & w/cm';
    if (!mount) return;
    const s=Object.assign({water:'', c:'', scm:'', mode:'wc'}, state.wc||{}); ['water','c','scm','mode'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Water–Cement / Water–Cementitious Ratio</h2>
      <div class="input-row">
        <label>Total water (lb)<br><input id="wc_w" type="number" step="0.1" min="0"></label>
        <label>Cement only (lb)<br><input id="wc_c" type="number" step="0.1" min="0"></label>
      </div>
      <div class="input-row">
        <label>SCM (lb) <span class="small">(if any)</span><br><input id="wc_scm" type="number" step="0.1" min="0"></label>
        <label>Report mode<br>
          <select id="wc_mode"><option value="wc">w/c</option><option value="wcm">w/cm</option></select>
        </label>
      </div>
      <section id="wc_out_wrap"></section>
    `;
    $('#wc_w').value=s.water??''; $('#wc_c').value=s.c??''; $('#wc_scm').value=s.scm??''; $('#wc_mode').value=s.mode||'wc';
    function compute(){
      const w=num($('#wc_w').value), c=num($('#wc_c').value), scm=num($('#wc_scm').value)||0; const mode=$('#wc_mode').value;
      if(w>0 && c>0){ const wc=w/c, wcm=w/(c+scm); state.wc={water:String(w),c:String(c),scm:String(scm),mode}; save(state); writeHash('#wc',state.wc);
        const text = [`w/c: ${fmt(wc,3)}`, `w/cm: ${fmt(wcm,3)}`].join('\n');
        const html = `<div class="card"><h3>Ratios</h3><div class="out">${mode==='wc'?`w/c: <strong>${fmt(wc,3)}</strong> · w/cm: ${fmt(wcm,3)}`:`w/cm: <strong>${fmt(wcm,3)}</strong> · w/c: ${fmt(wc,3)}`}</div></div>`;
        const node=pillCopy(html,()=>text); const wrap=$('#wc_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
      } else { $('#wc_out_wrap').innerHTML='<div class="card"><div class="out">Enter water & cement.</div></div>'; }
    }
    ['wc_w','wc_c','wc_scm','wc_mode'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }

  // =========================================================
  // WATER ADJUSTMENT (moisture / absorption)
  // =========================================================
  function renderWater(params){
    if (titleNode) titleNode.textContent='Aggregate Moisture / Water Adjustment';
    if (!mount) return;
    const s=Object.assign({w_target:'', c_lb:'', c_ssd:'', c_moist:'', c_abs:'', f_ssd:'', f_moist:'', f_abs:''}, state.water||{});
    ['w_target','c_lb','c_ssd','c_moist','c_abs','f_ssd','f_moist','f_abs'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Aggregate Moisture / Water Adjustment</h2>
      <p class="muted">Adjust batch water for moisture above/below absorption. Optionally compute updated w/cm.</p>
      <div class="card"><h3>Targets</h3>
        <div class="input-row">
          <label>Target water (lb)<br><input id="wa_target" type="number" step="0.1"></label>
          <label>Cement in batch (lb) <span class="small">(optional for w/cm)</span><br><input id="wa_c" type="number" step="0.1"></label>
        </div>
      </div>
      <div class="card"><h3>Coarse Aggregate</h3>
        <div class="input-row">
          <label>SSD weight (lb)<br><input id="wa_c_ssd" type="number" step="0.1"></label>
          <label>Moisture (%)<br><input id="wa_c_m" type="number" step="0.01"></label>
        </div>
        <div class="input-row">
          <label>Absorption (%)<br><input id="wa_c_abs" type="number" step="0.01"></label><div></div>
        </div>
      </div>
      <div class="card"><h3>Fine Aggregate</h3>
        <div class="input-row">
          <label>SSD weight (lb)<br><input id="wa_f_ssd" type="number" step="0.1"></label>
          <label>Moisture (%)<br><input id="wa_f_m" type="number" step="0.01"></label>
        </div>
        <div class="input-row">
          <label>Absorption (%)<br><input id="wa_f_abs" type="number" step="0.01"></label><div></div>
        </div>
      </div>
      <section id="wa_out_wrap"></section>
    `;
    $('#wa_target').value=s.w_target??''; $('#wa_c').value=s.c_lb??''; $('#wa_c_ssd').value=s.c_ssd??''; $('#wa_c_m').value=s.c_moist??''; $('#wa_c_abs').value=s.c_abs??''; $('#wa_f_ssd').value=s.f_ssd??''; $('#wa_f_m').value=s.f_moist??''; $('#wa_f_abs').value=s.f_abs??'';
    function compute(){
      const Wt=num($('#wa_target').value)||0, Ccem=num($('#wa_c').value)||null;
      const Cssd=num($('#wa_c_ssd').value)||0, Cm=num($('#wa_c_m').value)||0, Cabs=num($('#wa_c_abs').value)||0;
      const Fssd=num($('#wa_f_ssd').value)||0, Fm=num($('#wa_f_m').value)||0, Fabs=num($('#wa_f_abs').value)||0;
      const Cfree=Math.max(0,(Cm-Cabs)/100)*Cssd, Ffree=Math.max(0,(Fm-Fabs)/100)*Fssd, Free=Cfree+Ffree;
      const WaterToAdd = Wt - Free;
      let wcm=null; if(Ccem&&Ccem>0){ const effectiveW=Math.max(0,WaterToAdd)+Free; wcm=effectiveW/Ccem; }
      state.water={w_target:String(Wt||''),c_lb:String(Ccem||''),c_ssd:String(Cssd||''),c_moist:String(Cm||''),c_abs:String(Cabs||''),f_ssd:String(Fssd||''),f_moist:String(Fm||''),f_abs:String(Fabs||'')}; save(state); writeHash('#water',state.water);
      const badge=(Math.abs(WaterToAdd)<=5)?'ok':(Math.abs(WaterToAdd)<=15?'warn':'bad');
      const label=WaterToAdd>=0?`Add ${fmt(WaterToAdd,1)} lb water`:`Remove ${fmt(Math.abs(WaterToAdd),1)} lb water`;
      const text=[`Free water coarse: ${fmt(Cfree,1)} lb`,`Free water fine: ${fmt(Ffree,1)} lb`,`Total free: ${fmt(Free,1)} lb`,label,(wcm!=null?`Estimated w/cm: ${fmt(wcm,3)}`:'')].filter(Boolean).join('\n');
      const html=`<div class="card"><h3>Adjustment</h3><div class="out">Free water — coarse: ${fmt(Cfree,1)} lb · fine: ${fmt(Ffree,1)} lb<br>Total free: <strong>${fmt(Free,1)} lb</strong><br><span class="${badge}">${label}</span>${wcm!=null?`<br>Estimated w/cm: <strong>${fmt(wcm,3)}</strong>`:''}</div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#wa_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['wa_target','wa_c','wa_c_ssd','wa_c_m','wa_c_abs','wa_f_ssd','wa_f_m','wa_f_abs'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }

  // =========================================================
  // PUMP TIME & OUTPUT
  // =========================================================
  function renderPump(params){
    if (titleNode) titleNode.textContent='Pump Time & Output';
    if (!mount) return;
    const s=Object.assign({yd3:'', rate:'80', eff:'90'}, state.pump||{});
    ['yd3','rate','eff'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Pump Time & Output</h2>
      <div class="input-row">
        <label>Total concrete (yd³)<br><input id="pm_y" type="number" step="0.01" min="0"></label>
        <label>Nominal pump rate (yd³/hr)<br><input id="pm_r" type="number" step="1" min="1"></label>
      </div>
      <div class="input-row">
        <label>Efficiency (%)<br><input id="pm_e" type="number" step="1" min="50" max="100"></label>
        <div></div>
      </div>
      <section id="pm_out_wrap"></section>
    `;
    $('#pm_y').value=s.yd3??''; $('#pm_r').value=s.rate??'80'; $('#pm_e').value=s.eff??'90';
    function compute(){
      const y=num($('#pm_y').value)||0, r=num($('#pm_r').value)||0, e=clamp(num($('#pm_e').value)||90,50,100);
      const effRate=r*(e/100); const hours = effRate>0 ? y/effRate : null; const minutes = hours!=null? hours*60 : null;
      state.pump={yd3:String(y),rate:String(r),eff:String(e)}; save(state); writeHash('#pump',state.pump);
      const text=[`Effective rate: ${fmt(effRate,1)} yd³/hr`, `Duration: ${hours==null?'—':fmt(hours,2)} hr (${minutes==null?'—':fmt(minutes,0)} min)`].join('\n');
      const html=`<div class="card"><h3>Results</h3><div class="out">Effective rate: <strong>${fmt(effRate,1)} yd³/hr</strong><br>Duration: <strong>${hours==null?'—':fmt(hours,2)} hr</strong> (~${minutes==null?'—':fmt(minutes,0)} min)</div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#pm_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['pm_y','pm_r','pm_e'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }

  // =========================================================
  // TRUCK CYCLE PLANNER
  // =========================================================
  function renderCycle(params){
    if (titleNode) titleNode.textContent='Truck Cycle Planner';
    if (!mount) return;
    const s=Object.assign({size:'9.5', trucks:'5', distance:'15', speed:'40', load:'8', unload:'10', site:'5', targetRate:'60'}, state.cycle||{});
    ['size','trucks','distance','speed','load','unload','site','targetRate'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Truck Cycle Planner</h2>
      <div class="input-row">
        <label>Truck size (yd³)<br>
          <select id="cy_size"><option>9.0</option><option selected>9.5</option><option>10.0</option></select>
        </label>
        <label>Truck count<br><input id="cy_trucks" type="number" step="1" min="1"></label>
      </div>
      <div class="input-row">
        <label>Plant ↔ Site distance (mi, one-way)<br><input id="cy_dist" type="number" step="0.1" min="0"></label>
        <label>Avg speed (mph)<br><input id="cy_speed" type="number" step="1" min="1"></label>
      </div>
      <div class="input-row">
        <label>Plant load (min)<br><input id="cy_load" type="number" step="1" min="0"></label>
        <label>Unload on site (min)<br><input id="cy_unload" type="number" step="1" min="0"></label>
      </div>
      <div class="input-row">
        <label>Site wait/other (min)<br><input id="cy_site" type="number" step="1" min="0"></label>
        <label>Target pour rate (yd³/hr)<br><input id="cy_target" type="number" step="1" min="1"></label>
      </div>
      <section id="cy_out_wrap"></section>
    `;
    $('#cy_size').value=s.size; $('#cy_trucks').value=s.trucks; $('#cy_dist').value=s.distance; $('#cy_speed').value=s.speed; $('#cy_load').value=s.load; $('#cy_unload').value=s.unload; $('#cy_site').value=s.site; $('#cy_target').value=s.targetRate;
    function compute(){
      const size=num($('#cy_size').value)||9.5, n=clamp(num($('#cy_trucks').value)||1,1,100);
      const dist=num($('#cy_dist').value)||0, speed=Math.max(1,num($('#cy_speed').value)||1);
      const tLoad=num($('#cy_load').value)||0, tUnload=num($('#cy_unload').value)||0, tSite=num($('#cy_site').value)||0;
      const target=num($('#cy_target').value)||0;
      state.cycle={size:String(size),trucks:String(n),distance:String(dist),speed:String(speed),load:String(tLoad),unload:String(tUnload),site:String(tSite),targetRate:String(target)}; save(state); writeHash('#cycle',state.cycle);

      const travelMin = (2*dist)/speed*60;  // round-trip
      const cycleMin = travelMin + tLoad + tUnload + tSite;
      const cyclesPerHrPerTruck = 60 / (cycleMin||1e9);
      const fleetRate = size * n * cyclesPerHrPerTruck;
      const trucksNeeded = Math.ceil(target / (size * cyclesPerHrPerTruck));
      const text=[`Cycle time: ${fmt(cycleMin,1)} min`,`Fleet capacity: ${fmt(fleetRate,1)} yd³/hr`,`Trucks needed for ${fmt(target,0)} yd³/hr: ${trucksNeeded}`].join('\n');
      const html=`<div class="card"><h3>Results</h3><div class="out">Cycle time: <strong>${fmt(cycleMin,1)} min</strong><br>Fleet capacity: <strong>${fmt(fleetRate,1)} yd³/hr</strong><br>Trucks needed for ${fmt(target,0)} yd³/hr: <strong>${trucksNeeded}</strong></div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#cy_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['cy_size','cy_trucks','cy_dist','cy_speed','cy_load','cy_unload','cy_site','cy_target'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }

  // =========================================================
  // SURFACE COVERAGE
  // =========================================================
  function renderCoverage(params){
    if (titleNode) titleNode.textContent='Surface Coverage';
    if (!mount) return;
    const s=Object.assign({area:'', rate:'300', waste:'10'}, state.coverage||{});
    ['area','rate','waste'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Surface Coverage</h2>
      <div class="input-row">
        <label>Area (ft²)<br><input id="cv_a" type="number" step="0.1" min="0"></label>
        <label>Coverage rate (ft²/gal)<br><input id="cv_r" type="number" step="1" min="1"></label>
      </div>
      <div class="input-row">
        <label>Waste (%)<br><input id="cv_w" type="number" step="0.1" min="0" max="30"></label><div></div>
      </div>
      <section id="cv_out_wrap"></section>
    `;
    $('#cv_a').value=s.area??''; $('#cv_r').value=s.rate??'300'; $('#cv_w').value=s.waste??'10';
    function compute(){
      const A=num($('#cv_a').value)||0, R=Math.max(1,num($('#cv_r').value)||1), W=clamp(num($('#cv_w').value)||0,0,30);
      state.coverage={area:String(A),rate:String(R),waste:String(W)}; save(state); writeHash('#coverage',state.coverage);
      const gal = (A/R)*(1+W/100);
      const text=[`Area: ${fmt(A,1)} ft²`,`Coverage: ${fmt(R,0)} ft²/gal`,`Gallons (incl. waste): ${fmt(gal,2)}`].join('\n');
      const html=`<div class="card"><h3>Material</h3><div class="out">Gallons required (incl. waste): <strong>${fmt(gal,2)}</strong></div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#cv_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['cv_a','cv_r','cv_w'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }

  // =========================================================
  // EVAPORATION RATE (nomograph-style heuristic)
  // =========================================================
  function renderEvap(params){
    if (titleNode) titleNode.textContent='Evaporation Rate (estimate)';
    if (!mount) return;
    const s=Object.assign({tc:'',ta:'',v:'',rh:''}, state.evap||{}); ['tc','ta','v','rh'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Evaporation Rate (beta)</h2>
      <div class="input-row">
        <label>Concrete temp Tc (°F)<br><input id="ev_tc_f" type="number" step="0.1"></label>
        <label>Air temp Ta (°F)<br><input id="ev_ta_f" type="number" step="0.1"></label>
      </div>
      <div class="input-row">
        <label>Wind speed V (mph)<br><input id="ev_v_mph" type="number" step="0.1" min="0"></label>
        <label>Relative humidity RH (%)<br><input id="ev_rh" type="number" step="0.1" min="0" max="100"></label>
      </div>
      <section id="ev_out_wrap"></section>
    `;
    $('#ev_tc_f').value=s.tc??''; $('#ev_ta_f').value=s.ta??''; $('#ev_v_mph').value=s.v??''; $('#ev_rh').value=s.rh??'';
    function compute(){
      const TcF=num($('#ev_tc_f').value), TaF=num($('#ev_ta_f').value), Vmph=num($('#ev_v_mph').value), RHin=num($('#ev_rh').value);
      if([TcF,TaF,Vmph,RHin].some(v=>v==null)){ $('#ev_out_wrap').innerHTML='<div class="card"><div class="out">Enter Tc, Ta, wind, RH.</div></div>'; return; }
      const RH=clamp(RHin,0,100); const Vkmh=Math.max(0,Vmph)*1.60934; const Tc=(TcF-32)*5/9, Ta=(TaF-32)*5/9;
      const sat=tC=>Math.pow(Math.max(0,tC+18),2.5); const base=Math.max(0, sat(Tc) - (RH/100)*sat(Ta)); const wind=1+0.4*Vkmh;
      const E_kgm2h=Math.max(0,1e-6*base*wind); const E_lbft2h=E_kgm2h*0.204816;
      const risk=E_lbft2h>=0.20?'bad':(E_lbft2h>=0.15?'warn':'ok'); const label=E_lbft2h>=0.20?'≥ 0.20 caution':(E_lbft2h>=0.15?'0.15–0.20 watch':'< 0.15 lower risk');
      state.evap={tc:String(TcF),ta:String(TaF),v:String(Vmph),rh:String(RH)}; save(state); writeHash('#evap',state.evap);
      const text=[`Evap rate: ${fmt(E_kgm2h,2)} kg/m²/h`, `${fmt(E_lbft2h,3)} lb/ft²/hr (${label})`].join('\n');
      const html=`<div class="card"><h3>Rate</h3><div class="out">Evap rate: ${fmt(E_kgm2h,2)} kg/m²/h | <strong>${fmt(E_lbft2h,3)} lb/ft²/hr</strong><br><span class="${risk}">${label}</span><div class="small" style="margin-top:6px">Advisory only. Confirm with official charts/instruments onsite.</div></div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#ev_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['ev_tc_f','ev_ta_f','ev_v_mph','ev_rh'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }

  // =========================================================
  // FRESH CONCRETE TEMP (estimate)
  // =========================================================
  function renderTemp(params){
    if (titleNode) titleNode.textContent='Fresh Concrete Temperature (estimate)';
    if (!mount) return;
    const s=Object.assign({tw:'',ww:'',tc:'',wc:'',tca:'',wca:'',tfa:'',wfa:''}, state.temp||{});
    ['tw','ww','tc','wc','tca','wca','tfa','wfa'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Fresh Concrete Temperature (estimate)</h2>
      <p class="muted">Weighted heat-capacity average (advisory). Enter temps (°F) and weights (lb).</p>
      <div class="card"><h3>Inputs</h3>
        <div class="input-row"><label>Water temp °F<br><input id="te_tw" type="number" step="0.1"></label><label>Water weight lb<br><input id="te_ww" type="number" step="0.1"></label></div>
        <div class="input-row"><label>Cement temp °F<br><input id="te_tc" type="number" step="0.1"></label><label>Cement weight lb<br><input id="te_wc" type="number" step="0.1"></label></div>
        <div class="input-row"><label>Coarse agg temp °F<br><input id="te_tca" type="number" step="0.1"></label><label>Coarse agg weight lb<br><input id="te_wca" type="number" step="0.1"></label></div>
        <div class="input-row"><label>Fine agg temp °F<br><input id="te_tfa" type="number" step="0.1"></label><label>Fine agg weight lb<br><input id="te_wfa" type="number" step="0.1"></label></div>
      </div>
      <section id="te_out_wrap"></section>
    `;
    $('#te_tw').value=s.tw??''; $('#te_ww').value=s.ww??''; $('#te_tc').value=s.tc??''; $('#te_wc').value=s.wc??''; $('#te_tca').value=s.tca??''; $('#te_wca').value=s.wca??''; $('#te_tfa').value=s.tfa??''; $('#te_wfa').value=s.wfa??'';
    function compute(){
      const Tw=num($('#te_tw').value), Ww=num($('#te_ww').value), Tc=num($('#te_tc').value), Wc=num($('#te_wc').value), Tca=num($('#te_tca').value), Wca=num($('#te_wca').value), Tfa=num($('#te_tfa').value), Wfa=num($('#te_wfa').value);
      const cW=1.00, cC=0.20, cA=0.21;
      const parts=[{w:Ww,c:cW,T:Tw},{w:Wc,c:cC,T:Tc},{w:Wca,c:cA,T:Tca},{w:Wfa,c:cA,T:Tfa}].filter(p=>Number.isFinite(p.w)&&p.w>0&&Number.isFinite(p.T));
      let Tmix=null; if(parts.length){ const nume=parts.reduce((s,p)=>s+p.w*p.c*p.T,0); const den=parts.reduce((s,p)=>s+p.w*p.c,0); if(den>0) Tmix=nume/den; }
      state.temp={tw:String(Tw||''),ww:String(Ww||''),tc:String(Tc||''),wc:String(Wc||''),tca:String(Tca||''),wca:String(Wca||''),tfa:String(Tfa||''),wfa:String(Wfa||'')}; save(state); writeHash('#temp',state.temp);
      const badge=(Tmix==null)?'warn':(Tmix>=90?'bad':(Tmix>=80?'warn':'ok')); const label=(Tmix==null)?'Enter temps and weights':(Tmix>=90?'High (watch for set/evap issues)':(Tmix>=80?'Warm (monitor finishing)':'Comfortable range'));
      const text=[Tmix==null?'No estimate':`Estimated fresh concrete temperature: ${fmt(Tmix,1)} °F`, label].join('\n');
      const html=`<div class="card"><h3>Estimate</h3><div class="out">${Tmix==null?'Enter temps and weights.':`Estimated fresh concrete temperature: <strong>${fmt(Tmix,1)} °F</strong>`}<br><span class="${badge}">${label}</span></div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#te_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['te_tw','te_ww','te_tc','te_wc','te_tca','te_wca','te_tfa','te_wfa'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }

  // =========================================================
  // INSULATION NEED (basic heuristic)
  // =========================================================
  function renderInsulation(params){
    if (titleNode) titleNode.textContent='Insulation Need (basic)';
    if (!mount) return;
    const s=Object.assign({target:'55', ambient:'25', exposure:'moderate'}, state.insulation||{});
    ['target','ambient','exposure'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Insulation Need (basic)</h2>
      <p class="muted">Heuristic, advisory only. Assumes ~R-4 per curing blanket layer.</p>
      <div class="input-row">
        <label>Target minimum concrete temp (°F)<br><input id="in_tgt" type="number" step="1"></label>
        <label>Ambient (°F)<br><input id="in_amb" type="number" step="1"></label>
      </div>
      <div class="input-row">
        <label>Exposure<br>
          <select id="in_exp"><option value="sheltered">Sheltered</option><option value="moderate">Moderate</option><option value="windy">Windy</option></select>
        </label>
        <div></div>
      </div>
      <section id="in_out_wrap"></section>
    `;
    $('#in_tgt').value=s.target??'55'; $('#in_amb').value=s.ambient??'25'; $('#in_exp').value=s.exposure||'moderate';
    function compute(){
      const tgt=num($('#in_tgt').value)||55, amb=num($('#in_amb').value)||25, exp=$('#in_exp').value;
      state.insulation={target:String(tgt),ambient:String(amb),exposure:exp}; save(state); writeHash('#insulation',state.insulation);
      const dT=Math.max(0,tgt-amb);
      const expFactor = exp==='sheltered'?0.9:(exp==='moderate'?1.0:1.2);
      const neededR = (dT/12) * expFactor; // very rough thumb
      const layers = Math.max(0, Math.ceil(neededR/4)); // R≈4 per blanket
      const text=[`ΔT: ${fmt(dT,1)} °F`,`Estimated R-value needed: ${fmt(neededR,1)}`,`Suggested blankets: ${layers} layer(s)`].join('\n');
      const html=`<div class="card"><h3>Suggestion</h3><div class="out">ΔT: ${fmt(dT,1)} °F<br>Estimated R needed: ${fmt(neededR,1)}<br>Blankets (R≈4 each): <strong>${layers}</strong><div class="small" style="margin-top:6px">Advisory heuristic. Verify with contractor procedures and monitoring.</div></div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#in_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['in_tgt','in_amb','in_exp'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }

  // =========================================================
  // STRENGTH GAIN (heuristic curves)
  // =========================================================
  function renderStrength(params){
    if (titleNode) titleNode.textContent='Strength Gain (heuristic)';
    if (!mount) return;
    const s=Object.assign({age:'7', curve:'normal'}, state.strength||{}); ['age','curve'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Strength Gain (heuristic)</h2>
      <p class="muted">Not a spec tool. Generic curves to visualize typical gain.</p>
      <div class="input-row">
        <label>Age (days)<br><input id="st_age" type="number" step="1" min="1" max="365"></label>
        <label>Curve<br>
          <select id="st_curve"><option value="normal">Normal cement</option><option value="scm">With SCMs (slower early)</option></select>
        </label>
      </div>
      <section id="st_out_wrap"></section>
    `;
    $('#st_age').value=s.age??'7'; $('#st_curve').value=s.curve||'normal';
    function pctAt(day, curve){ const k = curve==='scm'?0.10:0.15; const p = 1 - Math.exp(-k*day); return Math.min(1, Math.max(0, p)); }
    function compute(){
      const age=clamp(num($('#st_age').value)||7,1,365); const curve=$('#st_curve').value;
      state.strength={age:String(age),curve}; save(state); writeHash('#strength',state.strength);
      const p= pctAt(age,curve)*100;
      const keyAges=[1,3,7,14,28,56,90].map(d=>`${d}d: ${fmt(pctAt(d,curve)*100,0)}%`).join(' · ');
      const text=[`At ${age} days: ${fmt(p,0)}% of 28-day nominal`,`Curve: ${curve==='scm'?'SCM (slower early)':'Normal cement'}`,keyAges].join('\n');
      const html=`<div class="card"><h3>Estimate</h3><div class="out">At ${age} days: <strong>${fmt(p,0)}%</strong> of 28-day nominal<br><span class="small">${keyAges}</span></div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#st_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['st_age','st_curve'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }

  // =========================================================
  // CYLINDER BREAK PLANNER
  // =========================================================
  function renderCylinders(params){
    if (titleNode) titleNode.textContent='Cylinder Break Planner';
    if (!mount) return;
    const s=Object.assign({cast:'', time:'08:00', ages:'7,14,28'}, state.cylinders||{}); ['cast','time','ages'].forEach(k=>{ if(params.has(k)) s[k]=params.get(k); });
    mount.innerHTML=`
      <h2>Cylinder Break Planner</h2>
      <p class="muted">Enter cast date/time and target ages. We’ll list the break dates in your local time.</p>
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
    const todayISO=new Date().toISOString().slice(0,10);
    $('#c_date').value=s.cast||todayISO; $('#c_time').value=s.time||'08:00'; $('#c_ages').value=s.ages||'7,14,28';
    function compute(){
      const dStr=$('#c_date').value; const tStr=$('#c_time').value||'08:00'; const agesStr=($('#c_ages').value||'7,14,28').replace(/\s+/g,''); const ages=agesStr.split(',').map(x=>parseInt(x,10)).filter(x=>Number.isFinite(x)&&x>=1&&x<=365);
      state.cylinders={cast:dStr,time:tStr,ages:ages.join(',')}; save(state); writeHash('#cylinders',state.cylinders);
      let base; if(dStr){ const [hh,mm]=(tStr||'08:00').split(':').map(x=>parseInt(x,10)||0); const [Y,M,D]=dStr.split('-').map(n=>parseInt(n,10)); base=new Date(Y,(M-1),D,hh,mm,0,0); }
      let rows=''; if(base&&ages.length){ rows=ages.map(a=>{ const dt=new Date(base.getTime()+a*24*60*60*1000); const ds=dt.toLocaleString([], {year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'}); return `<tr><td>${a} days</td><td>${ds}</td></tr>`; }).join(''); }
      const text = (!base||!rows)?'Enter cast date/time and ages.':ages.map(a=>{ const dt=new Date(base.getTime()+a*24*60*60*1000); return `${a} days: ${dt.toLocaleString()}`; }).join('\n');
      const html=`<div class="card"><h3>Break Schedule</h3><div class="out"><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left">Age</th><th style="text-align:left">Break date (local)</th></tr></thead><tbody>${rows||'<tr><td colspan="2">Enter cast date/time and ages.</td></tr>'}</tbody></table><div class="small" style="margin-top:6px">Advisory only. Confirm with your lab schedule.</div></div></div>`;
      const node=pillCopy(html,()=>text); const wrap=$('#c_out_wrap'); wrap.innerHTML=''; wrap.appendChild(node);
    }
    ['c_date','c_time','c_ages'].forEach(id=>{ const el=$(id); el.addEventListener('input',compute,{passive:true}); el.addEventListener('change',compute,{passive:true}); }); compute();
  }
})();





