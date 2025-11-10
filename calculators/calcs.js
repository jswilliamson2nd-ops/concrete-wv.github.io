/* ACI WV · calculators/calcs.js — FULL REWRITE — NOV 10 2025 */
(function () {
  // ---------------- Utilities ----------------
  const $ = (id, root = document) => root.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const fmt = (n, d = 2) => (Number.isFinite(n) ? Number(n).toFixed(d) : "—");
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const toNum = (val) => {
    if (val == null) return null;
    const s = String(val).trim().replace(/,/g, "");
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };
  const toInt = (val, def = 0) => {
    const n = toNum(val);
    return Number.isFinite(n) ? Math.round(n) : def;
  };

  function readHash() {
    const h = location.hash || "";
    const [hash, q = ""] = h.split("?");
    const params = new URLSearchParams(q);
    return { hash: hash.toLowerCase(), params };
  }
  function writeHash(hash, obj) {
    const p = new URLSearchParams();
    Object.entries(obj || {}).forEach(([k, v]) => {
      if (v !== "" && v != null && !Number.isNaN(v)) p.set(k, String(v));
    });
    const next = p.toString() ? `${hash}?${p.toString()}` : hash;
    if (location.hash !== next) history.replaceState(null, "", next);
  }

  const LS_KEY = "aciwv_calc_state_v2";
  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    } catch {
      return {};
    }
  }
  function saveState(state) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {}
  }
  const state = loadState();

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch {}
      ta.remove();
      return ok;
    }
  }

  function pillCopy(html, getText) {
    const wrap = document.createElement("div");
    wrap.style.position = "relative";
    wrap.innerHTML = html || '<div></div>';
    const out = wrap.firstElementChild;
    out.style.position = "relative";
    const btn = document.createElement("button");
    btn.textContent = "Copy";
    btn.className = "copy-btn";
    btn.style.position = "absolute";
    btn.style.top = "8px";
    btn.style.right = "8px";
    btn.style.padding = "6px 10px";
    btn.style.fontSize = "12px";
    btn.style.zIndex = "10";
    btn.style.background = "var(--orange, #ffbf47)";
    btn.style.color = "#000";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.addEventListener("click", async () => {
      const ok = await copyText(getText());
      btn.textContent = ok ? "Copied!" : "Failed";
      setTimeout(() => (btn.textContent = "Copy"), 1500);
    });
    out.appendChild(btn);
    return wrap;
  }

  const mount = $("tool");
  const titleNode = $("tool-title");

  const tools = {
    "#volume": renderVolume,
    "#trucks": renderTrucks,
    "#yield": renderYield,
    "#wcm": renderWcm,
    "#water": renderWater,
    "#evap": renderEvap,
    "#temp": renderTemp,
    "#cylinders": renderCylinders,
    "#rebar": renderRebar,
    "#joints": renderJoints,
    "#slope": renderSlope,
    "#pump": renderPump,
    "#cycle": renderCycle,
    "#coverage": renderCoverage,
    "#insulation": renderInsulation,
    "#strength": renderStrength,
    "#convert": renderConvert,
    "#maxtemp": renderMaxTemp, // NEW
  };

  function render() {
    const { hash, params } = readHash();
    if (!tools[hash]) {
      if (titleNode) titleNode.textContent = "Select a calculator above";
      if (mount) mount.innerHTML = '<p class="muted">Pick a tool from the cards above.</p>';
      return;
    }
    tools[hash](params || new URLSearchParams());
    setTimeout(() => { mount?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 0);
  }
  window.addEventListener("hashchange", render);
  document.addEventListener("DOMContentLoaded", render);

  // ---------- Small helpers ----------
  function L(label, id, attrs = "") {
    return `<label>${label}<br><input id="${id}" ${attrs}></label>`;
  }
  function S(label, id, optsHtml) {
    return `<label>${label}<br><select id="${id}">${optsHtml}</select></label>`;
  }
  function inputsListen(root, cb) {
    root.querySelectorAll("input, select").forEach((el) => el.addEventListener("input", cb));
  }

  // ====================== VOLUME ======================
  function renderVolume(params) {
    titleNode.textContent = "Volume (yd³) — Slab / Trench / Column";
    const s = {
      shape: "slab", len: "", wid: "", th_in: "", qty: "1", waste: "5",
      trench_len: "", trench_w_in: "", trench_d_in: "", trench_qty: "1",
      col_d_in: "", col_h_ft: "", col_qty: "1",
    };
    Object.assign(s, state.volume || {});
    ["shape","len","wid","th_in","qty","waste","trench_len","trench_w_in","trench_d_in","trench_qty","col_d_in","col_h_ft","col_qty"].forEach((k) => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${S("Shape","v_shape",`<option value="slab">Slab</option><option value="trench">Trench</option><option value="column">Column</option>`)}
        ${L("Waste (%)","v_waste",`type="number" step="0.1" min="0" max="30" value="${s.waste}"`)}
      </div>

      <section id="v_slab"><div class="input-row">
        ${L("Length (ft)","v_len",`type="number" value="${s.len}"`)}
        ${L("Width (ft)","v_wid",`type="number" value="${s.wid}"`)}
        ${L("Thickness (in)","v_th",`type="number" value="${s.th_in}"`)}
        ${L("Qty","v_qty",`type="number" min="1" value="${s.qty}"`)}
      </div></section>

      <section id="v_trench" style="display:none"><div class="input-row">
        ${L("Total length (ft)","vt_len",`type="number" value="${s.trench_len}"`)}
        ${L("Width (in)","vt_w",`type="number" value="${s.trench_w_in}"`)}
        ${L("Depth (in)","vt_d",`type="number" value="${s.trench_d_in}"`)}
        ${L("Qty","vt_qty",`type="number" min="1" value="${s.trench_qty}"`)}
      </div></section>

      <section id="v_column" style="display:none"><div class="input-row">
        ${L("Diameter (in)","vc_d",`type="number" value="${s.col_d_in}"`)}
        ${L("Height (ft)","vc_h",`type="number" value="${s.col_h_ft}"`)}
        ${L("Qty","vc_qty",`type="number" min="1" value="${s.col_qty}"`)}
      </div></section>

      <div class="out" id="v_summary">Enter dimensions</div>
    `;

    $("v_shape").value = s.shape;
    const panels = { slab: $("v_slab"), trench: $("v_trench"), column: $("v_column") };
    const showPanel = () => {
      Object.values(panels).forEach((p) => (p.style.display = "none"));
      panels[$("v_shape").value].style.display = "block";
      compute();
    };

    function compute() {
      const waste = clamp(toNum($("v_waste").value) || 0, 0, 30);
      let ft3 = 0;

      if ($("v_shape").value === "slab") {
        const Lf = toNum($("v_len").value), Wf = toNum($("v_wid").value), T = toNum($("v_th").value), Q = toNum($("v_qty").value) || 1;
        if (Lf && Wf && T) ft3 = Lf * Wf * (T / 12) * Q;
      } else if ($("v_shape").value === "trench") {
        const Lf = toNum($("vt_len").value), W = toNum($("vt_w").value), D = toNum($("vt_d").value), Q = toNum($("vt_qty").value) || 1;
        if (Lf && W && D) ft3 = Lf * (W / 12) * (D / 12) * Q;
      } else {
        const D = toNum($("vc_d").value), H = toNum($("vc_h").value), Q = toNum($("vc_qty").value) || 1;
        if (D && H) ft3 = Math.PI * Math.pow(D / 24, 2) * H * Q;
      }

      const yd3 = ft3 / 27;
      const yd3w = yd3 * (1 + waste / 100);
      const loads = [9, 9.5, 10].map((sz) => ({ sz, count: Math.ceil(yd3w / sz), over: fmt(Math.ceil(yd3w / sz) * sz - yd3w, 2) }));

      const text =
        `Volume: ${fmt(yd3, 3)} yd³ → ${fmt(yd3w, 3)} yd³ (+${waste}% waste)\n` +
        `9.0 yd: ${loads[0].count} trucks (over ${loads[0].over})\n` +
        `9.5 yd: ${loads[1].count} (over ${loads[1].over})\n` +
        `10.0 yd: ${loads[2].count} (over ${loads[2].over})`;

      $("v_summary").innerHTML = `<strong>${fmt(yd3w, 3)} yd³ total</strong><br>${text.replace(/\n/g, "<br>")}`;
      $("v_summary").firstChild.appendChild(pillCopy("", () => text).firstChild.lastChild);

      state.volume = {
        shape: $("v_shape").value, waste: $("v_waste").value,
        len: $("v_len")?.value || "", wid: $("v_wid")?.value || "", th_in: $("v_th")?.value || "", qty: $("v_qty")?.value || "1",
        trench_len: $("vt_len")?.value || "", trench_w_in: $("vt_w")?.value || "", trench_d_in: $("vt_d")?.value || "", trench_qty: $("vt_qty")?.value || "1",
        col_d_in: $("vc_d")?.value || "", col_h_ft: $("vc_h")?.value || "", col_qty: $("vc_qty")?.value || "1",
      };
      saveState(state); writeHash("#volume", state.volume);
    }

    $("v_shape").addEventListener("change", showPanel);
    inputsListen(mount, compute);
    showPanel();
  }

  // ====================== TRUCKS ======================
  function renderTrucks(params) {
    titleNode.textContent = "Truck Loads";
    const s = { yd3: "", waste: "5" };
    Object.assign(s, state.trucks || {});
    ["yd3","waste"].forEach((k) => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Total yd³","t_yd",`type="number" step="0.01" value="${s.yd3}"`)}
        ${L("Waste (%)","t_waste",`type="number" step="0.1" value="${s.waste}"`)}
      </div>
      <div class="out" id="t_summary">Enter total yd³</div>
    `;

    const compute = () => {
      const yd = toNum($("t_yd").value) || 0;
      const waste = toNum($("t_waste").value) || 0;
      const total = yd * (1 + waste / 100);
      const loads = [9, 9.5, 10].map((sz) => ({ sz, count: Math.ceil(total / sz), over: fmt(Math.ceil(total / sz) * sz - total, 2) }));
      const text =
        `Total needed: ${fmt(total, 3)} yd³\n` +
        `9.0 yd trucks: ${loads[0].count} (over ${loads[0].over})\n` +
        `9.5 yd: ${loads[1].count} (over ${loads[1].over})\n` +
        `10.0 yd: ${loads[2].count} (over ${loads[2].over})`;
      $("t_summary").innerHTML = `<strong>${fmt(total, 3)} yd³</strong><br>${text.replace(/\n/g, "<br>")}`;
      $("t_summary").firstChild.appendChild(pillCopy("", () => text).firstChild.lastChild);
      state.trucks = { yd3: $("t_yd").value, waste: $("t_waste").value };
      saveState(state); writeHash("#trucks", state.trucks);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== YIELD (UPGRADED) ======================
  function renderYield(params) {
    titleNode.textContent = "Yield & Theoretical Air (ASTM C138 style)";
    const s = {
      design_vol_ft3: "27",
      design_total_wt_lb: "",
      actual_total_wt_lb: "",
      bucket_factor_ft3: "0.25",
      bucket_empty_lb: "",
      bucket_full_lb: "",
    };
    Object.assign(s, state.yield || {});
    ["design_vol_ft3","design_total_wt_lb","actual_total_wt_lb","bucket_factor_ft3","bucket_empty_lb","bucket_full_lb"].forEach((k)=>params.has(k)&&(s[k]=params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Design volume (ft³)","y_des_vol",`type="number" step="0.01" value="${s.design_vol_ft3}"`)}
        ${L("Design total weight (lb)","y_des_wt",`type="number" step="0.1" value="${s.design_total_wt_lb}"`)}
      </div>
      <div class="input-row">
        ${L("Actual batch total weight (lb)","y_act_wt",`type="number" step="0.1" value="${s.actual_total_wt_lb}"`)}
        ${L("Bucket factor (ft³)","y_bkt_fac",`type="number" step="0.0001" value="${s.bucket_factor_ft3}"`)}
      </div>
      <div class="input-row">
        ${L("Bucket empty (lb)","y_bkt_emp",`type="number" step="0.1" value="${s.bucket_empty_lb}"`)}
        ${L("Bucket + concrete (lb)","y_bkt_full",`type="number" step="0.1" value="${s.bucket_full_lb}"`)}
      </div>
      <div class="out" id="y_summary">Enter weights and volumes</div>
    `;

    const compute = () => {
      const Vdes = toNum($("y_des_vol").value) || 27;
      const Wdes = toNum($("y_des_wt").value);
      const Wact = toNum($("y_act_wt").value);
      const Vbkt = Math.max(0.0001, toNum($("y_bkt_fac").value) || 0.25);
      const WbE  = toNum($("y_bkt_emp").value) || 0;
      const WbF  = toNum($("y_bkt_full").value) || 0;

      const Msamp = (WbF > 0 && WbE >= 0) ? (WbF - WbE) : NaN;
      const density = Number.isFinite(Msamp) ? (Msamp / Vbkt) : NaN; // pcf

      const yield_yd3 = (Number.isFinite(density) && Wact > 0) ? (Wact / density) / 27 : NaN;
      const rel_yield = (Number.isFinite(yield_yd3) && Vdes > 0) ? (yield_yd3 / (Vdes / 27)) * 100 : NaN;

      let air_theoretical = NaN;
      if (Number.isFinite(density) && Wdes > 0 && Vdes > 0) {
        const U0 = Wdes / Vdes; // zero-air density (pcf)
        if (U0 > 0) air_theoretical = 100 * (1 - (density / U0));
      }

      const lines = [];
      lines.push(`Bucket factor: ${fmt(Vbkt,4)} ft³`);
      if (Number.isFinite(Msamp)) lines.push(`Concrete in bucket: ${fmt(Msamp,1)} lb`);
      lines.push(`Measured density (unit weight): <strong>${fmt(density,1)} pcf</strong>`);
      if (Number.isFinite(yield_yd3)) lines.push(`Batch yield: <strong>${fmt(yield_yd3,3)} yd³</strong>`);
      else lines.push(`Batch yield: — (enter Actual batch total weight)`);
      if (Number.isFinite(rel_yield)) lines.push(`Relative yield: <strong>${fmt(rel_yield,1)} %</strong> (vs ${fmt(Vdes/27,3)} yd³ design)`);
      if (Number.isFinite(air_theoretical)) {
        lines.push(`Theoretical air (gravimetric): <strong>${fmt(air_theoretical,1)} %</strong>`);
        if (air_theoretical > 10) lines.push(`⚠️ High theoretical air — check materials, bucket factor, or scale.`);
        else if (air_theoretical < -1) lines.push(`⚠️ Negative theoretical air — verify design totals and unit weight.`);
      } else {
        lines.push(`Tip: enter Design total weight to compute theoretical air %.`);
      }

      $("y_summary").innerHTML = lines.join("<br>");

      state.yield = {
        design_vol_ft3: $("y_des_vol").value,
        design_total_wt_lb: $("y_des_wt").value,
        actual_total_wt_lb: $("y_act_wt").value,
        bucket_factor_ft3: $("y_bkt_fac").value,
        bucket_empty_lb: $("y_bkt_emp").value,
        bucket_full_lb: $("y_bkt_full").value,
      };
      saveState(state); writeHash("#yield", state.yield);
    };

    inputsListen(mount, compute);
    compute();
  }

  // ====================== W/CM ======================
  function renderWcm(params) {
    titleNode.textContent = "Water–Cementitious Ratio (w/cm)";
    const s = {
      water_lb: "", cement_lb: "",
      flyash_lb: "0", slag_lb: "0", silica_lb: "0",
      eff_fa: "1.0", eff_slag: "1.0", eff_silica: "1.0",
    };
    Object.assign(s, state.wcm || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Water (lb)","wc_water",`type="number" step="0.1" value="${s.water_lb}"`)}
        ${L("Cement (lb)","wc_cem",`type="number" step="0.1" value="${s.cement_lb}"`)}
      </div>
      <div class="input-row">
        ${L("Fly ash (lb)","wc_fa",`type="number" step="0.1" value="${s.flyash_lb}"`)}
        ${L("Slag (lb)","wc_slag",`type="number" step="0.1" value="${s.slag_lb}"`)}
        ${L("Silica fume (lb)","wc_sf",`type="number" step="0.1" value="${s.silica_lb}"`)}
      </div>
      <div class="input-row">
        ${L("FA eff. factor","wc_eff_fa",`type="number" step="0.1" value="${s.eff_fa}"`)}
        ${L("Slag eff. factor","wc_eff_slag",`type="number" step="0.1" value="${s.eff_slag}"`)}
        ${L("SF eff. factor","wc_eff_sf",`type="number" step="0.1" value="${s.eff_silica}"`)}
      </div>
      <div class="out" id="wc_summary">Enter ingredients</div>
    `;

    const compute = () => {
      const W = toNum($("wc_water").value) || 0;
      const C = toNum($("wc_cem").value) || 0;
      const FA = toNum($("wc_fa").value) || 0;
      const SG = toNum($("wc_slag").value) || 0;
      const SF = toNum($("wc_sf").value) || 0;
      const eFA = toNum($("wc_eff_fa").value) || 1;
      const eSG = toNum($("wc_eff_slag").value) || 1;
      const eSF = toNum($("wc_eff_sf").value) || 1;

      const cemEff = C + eFA * FA + eSG * SG + eSF * SF;
      const ratio = cemEff > 0 ? W / cemEff : NaN;

      const text =
        `Water: ${fmt(W, 1)} lb\nCementitious (eff): ${fmt(cemEff, 1)} lb\n` +
        `w/cm: ${fmt(ratio, 3)}\n` +
        `Typical limits: 0.35–0.50 (exposure dependent)`;

      $("wc_summary").innerHTML = `<strong>w/cm = ${fmt(ratio, 3)}</strong><br>${text.replace(/\n/g, "<br>")}`;
      $("wc_summary").firstChild.appendChild(pillCopy("", () => text).firstChild.lastChild);

      state.wcm = {
        water_lb: $("wc_water").value, cement_lb: $("wc_cem").value,
        flyash_lb: $("wc_fa").value, slag_lb: $("wc_slag").value, silica_lb: $("wc_sf").value,
        eff_fa: $("wc_eff_fa").value, eff_slag: $("wc_eff_slag").value, eff_silica: $("wc_eff_sf").value,
      };
      saveState(state); writeHash("#wcm", state.wcm);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== WATER ADJUST ======================
  function renderWater(params) {
    titleNode.textContent = "Mix Water Adjustment (Aggregate Moisture)";
    const s = {
      agg_lb: "", moisture_pct: "", absorption_pct: "1.5", target_w_cm: "", cementitious_lb: "",
    };
    Object.assign(s, state.water || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Total aggregate (lb)","wa_agg",`type="number" step="0.1" value="${s.agg_lb}"`)}
        ${L("Moisture (%)","wa_moist",`type="number" step="0.1" value="${s.moisture_pct}"`)}
        ${L("Absorption (%)","wa_abs",`type="number" step="0.1" value="${s.absorption_pct}"`)}
      </div>
      <div class="input-row">
        ${L("Target w/cm (optional)","wa_wcm",`type="number" step="0.01" value="${s.target_w_cm}"`)}
        ${L("Cementitious (lb, optional)","wa_cem",`type="number" step="0.1" value="${s.cementitious_lb}"`)}
      </div>
      <div class="out" id="wa_summary">Enter values</div>
    `;

    const compute = () => {
      const A = toNum($("wa_agg").value) || 0;
      const M = toNum($("wa_moist").value) || 0;
      const AB = toNum($("wa_abs").value) || 0;
      const wcm = toNum($("wa_wcm").value);
      const Cem = toNum($("wa_cem").value);

      const freePct = Math.max(0, M - AB) / 100;
      const waterFromAgg = A * freePct;

      let baseWater = NaN;
      if (wcm && Cem) baseWater = wcm * Cem;

      const text =
        `Free moisture: ${fmt(freePct * 100, 2)} % of agg\n` +
        `Water from aggregate: ${fmt(waterFromAgg, 1)} lb\n` +
        (Number.isFinite(baseWater)
          ? `Target batch water for w/cm: ${fmt(baseWater, 1)} lb\n` +
            `Add this much at plant: ${fmt(Math.max(0, baseWater - waterFromAgg), 1)} lb`
          : `Tip: provide Target w/cm and Cementitious to compute batch water.`);

      $("wa_summary").innerHTML = text.replace(/\n/g, "<br>");
      state.water = {
        agg_lb: $("wa_agg").value, moisture_pct: $("wa_moist").value, absorption_pct: $("wa_abs").value,
        target_w_cm: $("wa_wcm").value, cementitious_lb: $("wa_cem").value,
      };
      saveState(state); writeHash("#water", state.water);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== EVAPORATION RATE (FIXED) ======================
  function renderEvap(params) {
    titleNode.textContent = "Evaporation Rate (lb/ft²·hr)";
    const s = { airF: "80", concF: "75", rh: "50", wind_mph: "5" };
    Object.assign(s, state.evap || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Air Temp (°F)","ev_air",`type="number" step="0.1" value="${s.airF}"`)}
        ${L("Concrete Temp (°F)","ev_conc",`type="number" step="0.1" value="${s.concF}"`)}
        ${L("RH (%)","ev_rh",`type="number" step="0.1" value="${s.rh}"`)}
        ${L("Wind (mph)","ev_wind",`type="number" step="0.1" value="${s.wind_mph}"`)}
      </div>
      <div class="out" id="ev_summary">Enter conditions</div>
    `;

    // ACI/PCA (Menzel) using Tetens (kPa) → lb/ft²·hr
    function rateEvap(airF, concF, rh, wind) {
      const V  = Math.max(0, Number(wind) || 0);
      const RH = Math.max(0, Math.min(100, Number(rh) || 0));
      const FtoC  = f => (f - 32) * (5 / 9);
      const es_kPa = T_C => 0.6108 * Math.exp((17.27 * T_C) / (T_C + 237.3)); // sat vp (kPa)
      const Pw = es_kPa(FtoC(concF));             // kPa @ concrete temp
      const Pa = es_kPa(FtoC(airF)) * (RH / 100); // kPa actual air vp
      const coef = 5e-8; // kPa-based coefficient to lb/ft²·hr
      const E = ((concF + 18) ** 2.5) * (V + 4) * coef * (Pw - Pa);
      return Math.max(0, E);
    }

    const compute = () => {
      const air = toNum($("ev_air").value) || 0;
      const conc = toNum($("ev_conc").value) || 0;
      const rh = toNum($("ev_rh").value) || 0;
      const wind = toNum($("ev_wind").value) || 0;

      const E = rateEvap(air, conc, rh, wind);
      const warn = E >= 0.2 ? "⚠️ High evaporation risk — consider measures." : "OK";

      const text =
        `Evaporation rate: ${fmt(E, 3)} lb/ft²·hr\n` +
        `Guideline threshold ~0.20 lb/ft²·hr\n` +
        `${warn}`;
      $("ev_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.evap = { airF: $("ev_air").value, concF: $("ev_conc").value, rh: $("ev_rh").value, wind_mph: $("ev_wind").value };
      saveState(state); writeHash("#evap", state.evap);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== FRESH TEMP ======================
  function renderTemp(params) {
    titleNode.textContent = "Fresh Concrete Temperature (Weighted Mix)";
    const s = {
      water_lb: "", water_F: "", agg_lb: "", agg_F: "", cement_lb: "", cement_F: "",
      adm_lb: "0", adm_F: "70",
    };
    Object.assign(s, state.temp || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Water (lb)","ft_wlb",`type="number" step="0.1" value="${s.water_lb}"`)}
        ${L("Water Temp (°F)","ft_wF",`type="number" step="0.1" value="${s.water_F}"`)}
      </div>
      <div class="input-row">
        ${L("Aggregate (lb)","ft_alb",`type="number" step="0.1" value="${s.agg_lb}"`)}
        ${L("Aggregate Temp (°F)","ft_aF",`type="number" step="0.1" value="${s.agg_F}"`)}
      </div>
      <div class="input-row">
        ${L("Cementitious (lb)","ft_clb",`type="number" step="0.1" value="${s.cement_lb}"`)}
        ${L("Cementitious Temp (°F)","ft_cF",`type="number" step="0.1" value="${s.cement_F}"`)}
      </div>
      <div class="input-row">
        ${L("Admixtures (lb)","ft_mlb",`type="number" step="0.1" value="${s.adm_lb}"`)}
        ${L("Admixtures Temp (°F)","ft_mF",`type="number" step="0.1" value="${s.adm_F}"`)}
      </div>
      <div class="out" id="ft_summary">Enter values</div>
    `;

    const compute = () => {
      const W = toNum($("ft_wlb").value) || 0, Tw = toNum($("ft_wF").value) || 0;
      const A = toNum($("ft_alb").value) || 0, Ta = toNum($("ft_aF").value) || 0;
      const C = toNum($("ft_clb").value) || 0, Tc = toNum($("ft_cF").value) || 0;
      const M = toNum($("ft_mlb").value) || 0, Tm = toNum($("ft_mF").value) || 0;

      const total = W + A + C + M;
      const T = total > 0 ? (W * Tw + A * Ta + C * Tc + M * Tm) / total : NaN;

      const text = `Estimated fresh temp: ${fmt(T, 1)} °F\nTip: chilling water or shading aggregates has the biggest effect.`;
      $("ft_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.temp = {
        water_lb: $("ft_wlb").value, water_F: $("ft_wF").value,
        agg_lb: $("ft_alb").value, agg_F: $("ft_aF").value,
        cement_lb: $("ft_clb").value, cement_F: $("ft_cF").value,
        adm_lb: $("ft_mlb").value, adm_F: $("ft_mF").value,
      };
      saveState(state); writeHash("#temp", state.temp);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== CYLINDER PLANNER ======================
  function renderCylinders(params) {
    titleNode.textContent = "Cylinder Break Planner";
    const s = { sets: "3", per_set: "3", ages: "7,14,28" };
    Object.assign(s, state.cylinders || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("Number of sets","cy_sets",`type="number" min="1" step="1" value="${s.sets}"`)}
        ${L("Cylinders per set","cy_per",`type="number" min="1" step="1" value="${s.per_set}"`)}
        ${L("Break ages (days, comma sep)","cy_ages",`type="text" value="${s.ages}"`)}
      </div>
      <div class="out" id="cy_summary">Enter details</div>
    `;
    const compute = () => {
      const sets = toInt($("cy_sets").value, 1);
      const per = toInt($("cy_per").value, 1);
      const ages = String($("cy_ages").value).split(",").map((x) => toInt(x.trim(), 0)).filter((d) => d > 0);
      const total = sets * per * Math.max(1, ages.length);

      const text =
        `Sets: ${sets}\n` +
        `Cylinders per set: ${per}\n` +
        `Ages: ${ages.join(", ")} days\n` +
        `Total cylinders: ${total}`;
      $("cy_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.cylinders = { sets: $("cy_sets").value, per_set: $("cy_per").value, ages: $("cy_ages").value };
      saveState(state); writeHash("#cylinders", state.cylinders);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== REBAR TAKEOFF ======================
  function renderRebar(params) {
    titleNode.textContent = "Rebar Takeoff (Simple)";
    const s = { length_ft: "", width_ft: "", spacing_in: "18", bar_size: "#4", mat_dir: "both" };
    Object.assign(s, state.rebar || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("Length (ft)","rb_L",`type="number" step="0.1" value="${s.length_ft}"`)}
        ${L("Width (ft)","rb_W",`type="number" step="0.1" value="${s.width_ft}"`)}
        ${L("Spacing (in)","rb_S",`type="number" step="0.1" value="${s.spacing_in}"`)}
      </div>
      <div class="input-row">
        ${S("Bar size","rb_size",`<option>#3</option><option selected>#4</option><option>#5</option><option>#6</option><option>#7</option>`)}
        ${S("Directions","rb_dir",`<option value="long">Long only</option><option value="trans">Trans only</option><option value="both" selected>Both</option>`)}
      </div>
      <div class="out" id="rb_summary">Enter slab and spacing</div>
    `;
    $("rb_size").value = s.bar_size;
    $("rb_dir").value = s.mat_dir;

    const barWt = { "#3": 0.376, "#4": 0.668, "#5": 1.043, "#6": 1.502, "#7": 2.044 }; // lb/ft

    const compute = () => {
      const Lf = toNum($("rb_L").value) || 0;
      const Wf = toNum($("rb_W").value) || 0;
      const S = (toNum($("rb_S").value) || 0) / 12;
      const dir = $("rb_dir").value;
      const size = $("rb_size").value;

      let countLong = 0, countTrans = 0, feetLong = 0, feetTrans = 0;
      if (S > 0) {
        if (dir === "long" || dir === "both") { countLong = Math.floor(Wf / S) + 1; feetLong = countLong * Lf; }
        if (dir === "trans" || dir === "both") { countTrans = Math.floor(Lf / S) + 1; feetTrans = countTrans * Wf; }
      }
      const weight = (feetLong + feetTrans) * (barWt[size] || 0);

      const text =
        `Bars long: ${countLong} × ${fmt(Lf, 2)} ft = ${fmt(feetLong, 1)} ft\n` +
        `Bars trans: ${countTrans} × ${fmt(Wf, 2)} ft = ${fmt(feetTrans, 1)} ft\n` +
        `Total weight (${size}): ${fmt(weight, 1)} lb`;
      $("rb_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.rebar = {
        length_ft: $("rb_L").value, width_ft: $("rb_W").value, spacing_in: $("rb_S").value,
        bar_size: $("rb_size").value, mat_dir: $("rb_dir").value,
      };
      saveState(state); writeHash("#rebar", state.rebar);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== JOINT SPACING ======================
  function renderJoints(params) {
    titleNode.textContent = "Joint Spacing (Rule-of-Thumb)";
    const s = { slab_th_in: "", factor: "30" };
    Object.assign(s, state.joints || {});
    ["slab_th_in","factor"].forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("Slab thickness (in)","j_th",`type="number" step="0.1" value="${s.slab_th_in}"`)}
        ${S("Multiplier (× thickness)","j_fact",`<option value="24">24</option><option value="30" selected>30</option><option value="36">36</option>`)}
      </div>
      <div class="out" id="j_summary">Enter slab thickness</div>
    `;
    $("j_fact").value = s.factor;

    const compute = () => {
      const T = toNum($("j_th").value) || 0;
      const F = toNum($("j_fact").value) || 30;
      const spacing_ft = (T * F) / 12;
      const text = `Recommended max joint spacing: ${fmt(spacing_ft, 1)} ft (≈ ${F}× thickness)`;
      $("j_summary").innerHTML = text;
      state.joints = { slab_th_in: $("j_th").value, factor: $("j_fact").value };
      saveState(state); writeHash("#joints", state.joints);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== SLOPE / GRADE ======================
  function renderSlope(params) {
    titleNode.textContent = "Slope / Grade Calculator";
    const s = { rise_in: "", run_ft: "" };
    Object.assign(s, state.slope || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("Rise (in)","sl_r",`type="number" step="0.1" value="${s.rise_in}"`)}
        ${L("Run (ft)","sl_run",`type="number" step="0.1" value="${s.run_ft}"`)}
      </div>
      <div class="out" id="sl_summary">Enter values</div>
    `;
    const compute = () => {
      const rise = toNum($("sl_r").value) || 0;
      const run = toNum($("sl_run").value) || 0;
      const slope_pct = run > 0 ? (rise / 12 / run) * 100 : NaN;
      const slope_ratio = run > 0 ? `${fmt(run * 12 / rise, 1)}:1` : "—";
      const text = `Grade: ${fmt(slope_pct, 2)} %\nSlope ratio: ${slope_ratio}`;
      $("sl_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.slope = { rise_in: $("sl_r").value, run_ft: $("sl_run").value };
      saveState(state); writeHash("#slope", state.slope);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== PUMP TIME ======================
  function renderPump(params) {
    titleNode.textContent = "Pump Time Estimator";
    const s = { total_yd3: "", rate_yd3_hr: "30" };
    Object.assign(s, state.pump || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("Total volume (yd³)","pm_total",`type="number" step="0.1" value="${s.total_yd3}"`)}
        ${L("Pump rate (yd³/hr)","pm_rate",`type="number" step="0.1" value="${s.rate_yd3_hr}"`)}
      </div>
      <div class="out" id="pm_summary">Enter values</div>
    `;
    const compute = () => {
      const V = toNum($("pm_total").value) || 0;
      const R = Math.max(0.1, toNum($("pm_rate").value) || 0.1);
      const hours = V / R;
      const text = `Estimated pump time: ${fmt(hours, 2)} hr`;
      $("pm_summary").innerHTML = text;

      state.pump = { total_yd3: $("pm_total").value, rate_yd3_hr: $("pm_rate").value };
      saveState(state); writeHash("#pump", state.pump);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== TRUCK CYCLE ======================
  function renderCycle(params) {
    titleNode.textContent = "Truck Cycle / Supply Check";
    const s = {
      trucks: "5", load_min: "5", haul_min: "20", pour_min: "8", wash_min: "5",
      volume_yd3: "100", truck_size_yd3: "9.5",
    };
    Object.assign(s, state.cycle || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("Trucks (count)","cyc_trk",`type="number" step="1" value="${s.trucks}"`)}
        ${L("Load @ plant (min)","cyc_load",`type="number" step="0.1" value="${s.load_min}"`)}
        ${L("Haul (one-way, min)","cyc_haul",`type="number" step="0.1" value="${s.haul_min}"`)}
      </div>
      <div class="input-row">
        ${L("Pour/unload (min)","cyc_pour",`type="number" step="0.1" value="${s.pour_min}"`)}
        ${L("Wash/return (min)","cyc_wash",`type="number" step="0.1" value="${s.wash_min}"`)}
      </div>
      <div class="input-row">
        ${L("Total volume (yd³)","cyc_vol",`type="number" step="0.1" value="${s.volume_yd3}"`)}
        ${L("Truck size (yd³)","cyc_size",`type="number" step="0.1" value="${s.truck_size_yd3}"`)}
      </div>
      <div class="out" id="cyc_summary">Enter inputs</div>
    `;
    const compute = () => {
      const N = toInt($("cyc_trk").value, 1);
      const tLoad = toNum($("cyc_load").value) || 0;
      const tHaul = toNum($("cyc_haul").value) || 0;
      const tPour = toNum($("cyc_pour").value) || 0;
      const tWash = toNum($("cyc_wash").value) || 0;
      const size = toNum($("cyc_size").value) || 9.5;
      const volume = toNum($("cyc_vol").value) || 0;

      const cycleMin = tLoad + 2 * tHaul + tPour + tWash;
      const loadsPerHrPerTruck = 60 / cycleMin;
      const supplyRate = N * loadsPerHrPerTruck * size;
      const totalHrs = volume / Math.max(0.1, supplyRate);

      const text =
        `Cycle time: ${fmt(cycleMin, 1)} min\n` +
        `Supply rate: ${fmt(supplyRate, 1)} yd³/hr\n` +
        `Finish in ~${fmt(totalHrs, 2)} hr at this supply`;
      $("cyc_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.cycle = {
        trucks: $("cyc_trk").value, load_min: $("cyc_load").value, haul_min: $("cyc_haul").value,
        pour_min: $("cyc_pour").value, wash_min: $("cyc_wash").value, volume_yd3: $("cyc_vol").value, truck_size_yd3: $("cyc_size").value,
      };
      saveState(state); writeHash("#cycle", state.cycle);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== COVERAGE ======================
  function renderCoverage(params) {
    titleNode.textContent = "Coverage Calculator";
    const s = { area_ft2: "", coverage_ft2_per_gal: "300", unit: "gal" };
    Object.assign(s, state.coverage || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("Area (ft²)","cv_area",`type="number" step="0.1" value="${s.area_ft2}"`)}
        ${L("Coverage (ft²/gal)","cv_cov",`type="number" step="0.1" value="${s.coverage_ft2_per_gal}"`)}
        ${S("Container","cv_unit",`<option value="gal" selected>Gallon</option><option value="5gal">5-Gallon</option>`)}
      </div>
      <div class="out" id="cv_summary">Enter values</div>
    `;
    $("cv_unit").value = s.unit;

    const compute = () => {
      const A = toNum($("cv_area").value) || 0;
      const C = Math.max(0.0001, toNum($("cv_cov").value) || 0.0001);
      const unit = $("cv_unit").value;
      const gal = A / C;
      const buckets5 = gal / 5;
      const text = `Required: ${fmt(gal, 2)} gal\n5-gal buckets: ${fmt(buckets5, 2)}`;
      $("cv_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.coverage = { area_ft2: $("cv_area").value, coverage_ft2_per_gal: $("cv_cov").value, unit: $("cv_unit").value };
      saveState(state); writeHash("#coverage", state.coverage);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== INSULATION (UPGRADED + REQUIRED R) ======================
  function renderInsulation(params) {
    titleNode.textContent = "Insulation / Blanket Estimator";
    const s = {
      area_ft2: "",
      dT_F: "40",
      R_value: "5",       // per layer
      layers: "1",        // stacked layers
      wet_pct: "0",       // performance reduction (%)
      overlap_pct: "8",   // lap/waste (%)
      blanket_w: "6",
      blanket_l: "25",
      target_Q_btu_hr: "" // target max heat loss (BTU/hr)
    };
    Object.assign(s, state.insulation || {});
    Object.keys(s).forEach(k => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Area (ft²)","in_area",`type="number" step="0.1" value="${s.area_ft2}"`)}
        ${L("ΔT (°F)","in_dt",`type="number" step="0.1" value="${s.dT_F}"`)}
        ${L("Blanket R (per layer)","in_R",`type="number" step="0.1" value="${s.R_value}"`)}
      </div>
      <div class="input-row">
        ${L("Layers (stacked)","in_layers",`type="number" step="1" min="1" value="${s.layers}"`)}
        ${L("Wet/snow penalty (%)","in_wet",`type="number" step="1" min="0" max="50" value="${s.wet_pct}"`)}
        ${L("Overlap/waste (%)","in_ovlp",`type="number" step="1" min="0" max="25" value="${s.overlap_pct}"`)}
      </div>
      <div class="input-row">
        ${L("Blanket width (ft)","in_bw",`type="number" step="0.1" value="${s.blanket_w}"`)}
        ${L("Blanket length (ft)","in_bl",`type="number" step="0.1" value="${s.blanket_l}"`)}
        ${L("Target max heat loss (BTU/hr, optional)","in_targetQ",`type="number" step="1" value="${s.target_Q_btu_hr}"`)}
      </div>
      <div class="out" id="in_summary">Enter values</div>
    `;

    const compute = () => {
      const A   = toNum($("in_area").value)  || 0;
      const dT  = toNum($("in_dt").value)    || 0;
      const R1  = Math.max(0.1, toNum($("in_R").value) || 0.1);
      const n   = Math.max(1, Math.round(toNum($("in_layers").value) || 1));
      const wet = clamp(toNum($("in_wet").value) || 0, 0, 50) / 100;
      const ovp = clamp(toNum($("in_ovlp").value) || 0, 0, 25) / 100;
      const Bw  = toNum($("in_bw").value)  || 6;
      const Bl  = toNum($("in_bl").value)  || 25;
      const Qmax = toNum($("in_targetQ").value);

      const R_eff_dry = R1 * n;
      const R_eff = R_eff_dry * (1 - wet);

      const Q_btu_hr = (R_eff > 0 ? (A * dT) / R_eff : NaN);
      const Q_kW = Q_btu_hr * 0.000293071;

      const usablePerBlanket = Bw * Bl * (1 - ovp);
      const blanketsPerLayer = usablePerBlanket > 0 ? Math.ceil(A / usablePerBlanket) : 0;
      const totalBlankets = blanketsPerLayer * n;

      const lines = [];
      lines.push(`Layers: ${n}  •  R (per layer): ${fmt(R1,1)} → R_eff (dry): ${fmt(R_eff_dry,1)}  •  Wet penalty: ${fmt(wet*100,0)}%`);
      lines.push(`<strong>Effective R in place: ${fmt(R_eff,1)}</strong>`);
      lines.push(`Heat loss with current layers: <strong>${fmt(Q_btu_hr,0)} BTU/hr</strong>  (≈ ${fmt(Q_kW,2)} kW)`);
      lines.push(`Blanket ${fmt(Bw,1)}×${fmt(Bl,1)} ft with ${fmt(ovp*100,0)}% lap → usable ${fmt(usablePerBlanket,1)} ft² each`);
      lines.push(`Blankets per layer: ${blanketsPerLayer}  •  Total blankets (all layers): <strong>${totalBlankets}</strong>`);

      if (Number.isFinite(Qmax) && Qmax > 0) {
        const R_req_total = (A * dT) / Qmax;
        const perLayerEffR = R1 * (1 - wet);
        const layers_req = perLayerEffR > 0 ? Math.ceil(R_req_total / perLayerEffR) : NaN;
        const totalBlankets_req = Number.isFinite(layers_req) ? layers_req * blanketsPerLayer : NaN;

        lines.push(`<hr>`);
        lines.push(`Target max heat loss: <strong>${fmt(Qmax,0)} BTU/hr</strong>`);
        lines.push(`Required total R to meet target: <strong>${fmt(R_req_total,1)}</strong>`);
        lines.push(`Required layers (with ${fmt(wet*100,0)}% wet penalty): <strong>${layers_req}</strong>`);
        if (Number.isFinite(totalBlankets_req)) {
          lines.push(`Blankets per layer: ${blanketsPerLayer} → Total blankets needed at required layers: <strong>${totalBlankets_req}</strong>`);
        }
        if (Number.isFinite(Q_btu_hr)) {
          lines.push(Q_btu_hr <= Qmax
            ? `✅ Current setup meets the target (Q=${fmt(Q_btu_hr,0)} ≤ ${fmt(Qmax,0)} BTU/hr).`
            : `❌ Current setup does NOT meet the target. Add layers until ≥ ${layers_req}.`);
        }
      } else {
        const suggest = Q_btu_hr * 1.3;
        lines.push(`Sizing hint: plan ≈ ${fmt(suggest,0)} BTU/hr (includes ~30% contingency).`);
      }

      $("in_summary").innerHTML = lines.join("<br>");

      state.insulation = {
        area_ft2: $("in_area").value, dT_F: $("in_dt").value, R_value: $("in_R").value,
        layers: $("in_layers").value, wet_pct: $("in_wet").value, overlap_pct: $("in_ovlp").value,
        blanket_w: $("in_bw").value, blanket_l: $("in_bl").value, target_Q_btu_hr: $("in_targetQ").value
      };
      saveState(state); writeHash("#insulation", state.insulation);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== STRENGTH GAIN ======================
  function renderStrength(params) {
    titleNode.textContent = "Strength Gain (Hyperbolic)";
    const s = { f28: "4000", k: "3.5", t_day: "7" };
    Object.assign(s, state.strength || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("28-day strength (psi)","st_f28",`type="number" step="1" value="${s.f28}"`)}
        ${L("k (days)","st_k",`type="number" step="0.1" value="${s.k}"`)}
        ${L("Age t (days)","st_t",`type="number" step="0.1" value="${s.t_day}"`)}
      </div>
      <div class="out" id="st_summary">Enter values</div>
    `;
    const compute = () => {
      const f28 = toNum($("st_f28").value) || 0;
      const k = Math.max(0.1, toNum($("st_k").value) || 3.5);
      const t = Math.max(0, toNum($("st_t").value) || 0);
      const ft = (f28 * t) / (k + t);
      const pct = (ft / f28) * 100;
      const text = `f(t) ≈ ${fmt(ft, 0)} psi (${fmt(pct, 1)}% of f28)\nModel: f = f28 * t / (k + t)`;
      $("st_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.strength = { f28: $("st_f28").value, k: $("st_k").value, t_day: $("st_t").value };
      saveState(state); writeHash("#strength", state.strength);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== CONVERT ======================
  function renderConvert(params) {
    titleNode.textContent = "Unit Converter";
    const s = { val: "", from: "ft", to: "m" };
    Object.assign(s, state.convert || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));

    const opts = (arr) => arr.map((x) => `<option>${x}</option>`).join("");
    const lengthUnits = ["in", "ft", "yd", "m"];
    const areaUnits = ["ft²", "yd²", "m²"];
    const volUnits = ["ft³", "yd³", "m³", "gal", "L"];
    const massUnits = ["lb", "kg"];
    const tempUnits = ["°F", "°C"];

    mount.innerHTML = `
      <div class="input-row">
        ${L("Value","cv_val",`type="number" step="0.0001" value="${s.val}"`)}
        ${S("From","cv_from",`${opts(lengthUnits.concat(areaUnits, volUnits, massUnits, tempUnits))}`)}
        ${S("To","cv_to",`${opts(lengthUnits.concat(areaUnits, volUnits, massUnits, tempUnits))}`)}
      </div>
      <div class="out" id="cv2_summary">Enter value and units</div>
    `;
    $("cv_from").value = s.from;
    $("cv_to").value = s.to;

    function convert(val, from, to) {
      if (from === to) return val;

      if ((from === "°F" || from === "°C") && (to === "°F" || to === "°C")) {
        if (from === "°F" && to === "°C") return (val - 32) * (5 / 9);
        if (from === "°C" && to === "°F") return val * (9 / 5) + 32;
      }

      const L = { in: 0.0254, ft: 0.3048, yd: 0.9144, m: 1 };
      const A = { "ft²": 0.09290304, "yd²": 0.83612736, "m²": 1 };
      const V = { "ft³": 0.028316846592, "yd³": 0.764554857984, "m³": 1, gal: 0.003785411784, L: 0.001 };
      const M = { lb: 0.45359237, kg: 1 };

      if (L[from] && L[to]) return (val * L[from]) / L[to];
      if (A[from] && A[to]) return (val * A[from]) / A[to];
      if (V[from] && V[to]) return (val * V[from]) / V[to];
      if (M[from] && M[to]) return (val * M[from]) / M[to];

      return NaN;
    }

    const compute = () => {
      const v = toNum($("cv_val").value) ?? NaN;
      const from = $("cv_from").value;
      const to = $("cv_to").value;
      const out = convert(v, from, to);
      const text = `= ${fmt(out, 6)} ${to}`;
      $("cv2_summary").innerHTML = text;

      state.convert = { val: $("cv_val").value, from, to };
      saveState(state); writeHash("#convert", state.convert);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== MAX TEMP ESTIMATOR (NEW) ======================
  function renderMaxTemp(params) {
    titleNode.textContent = "Estimated Max Temperature (Mass Concrete)";
    const s = {
      thickness_ft: "4",
      exposure: "forms+blankets",
      ambient_F: "70",
      placement_F: "75",
      cem_lb: "600", slag_lb: "0", flyash_lb: "0",
      H_cem: "120", H_slag: "80", H_fa: "50",
      tau_cem_h: "12", tau_slag_h: "30", tau_fa_h: "36",
      k1_h: "0.08",
      deltaT_limit_F: "35"
    };
    Object.assign(s, state.maxtemp || {});
    Object.keys(s).forEach(k => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Thickness (ft)","mt_thk",`type="number" step="0.1" value="${s.thickness_ft}"`)}
        ${S("Exposure","mt_exp",`
          <option value="insulated">Insulated (tight forms/blankets)</option>
          <option value="forms+blankets" selected>Forms + blankets</option>
          <option value="bare-form">Bare forms</option>
          <option value="fully-exposed">Fully exposed faces</option>`)}
        ${L("Ambient under cover (°F)","mt_amb",`type="number" step="0.1" value="${s.ambient_F}"`)}
      </div>
      <div class="input-row">
        ${L("Placement temp (°F)","mt_T0",`type="number" step="0.1" value="${s.placement_F}"`)}
        ${L("Cement (lb/yd³)","mt_cem",`type="number" step="1" value="${s.cem_lb}"`)}
        ${L("Slag (lb/yd³)","mt_slag",`type="number" step="1" value="${s.slag_lb}"`)}
        ${L("Fly ash (lb/yd³)","mt_fa",`type="number" step="1" value="${s.flyash_lb}"`)}
      </div>
      <details class="muted"><summary>Advanced (heats, kinetics, cooling, ΔT limit)</summary>
        <div class="input-row">
          ${L("H_cement (Btu/lb)","mt_Hc",`type="number" step="1" value="${s.H_cem}"`)}
          ${L("H_slag (Btu/lb)","mt_Hs",`type="number" step="1" value="${s.H_slag}"`)}
          ${L("H_fly ash (Btu/lb)","mt_Hf",`type="number" step="1" value="${s.H_fa}"`)}
        </div>
        <div class="input-row">
          ${L("τ_cement (h)","mt_tc",`type="number" step="1" value="${s.tau_cem_h}"`)}
          ${L("τ_slag (h)","mt_ts",`type="number" step="1" value="${s.tau_slag_h}"`)}
          ${L("τ_fly ash (h)","mt_tf",`type="number" step="1" value="${s.tau_fa_h}"`)}
        </div>
        <div class="input-row">
          ${L("k at 1 ft (h⁻¹)","mt_k1",`type="number" step="0.001" value="${s.k1_h}"`)}
          ${L("ΔT limit (°F)","mt_dlim",`type="number" step="1" value="${s.deltaT_limit_F}"`)}
        </div>
      </details>
      <div class="out" id="mt_summary">Enter values</div>
    `;

    $("mt_exp").value = s.exposure;

    function simulate() {
      const thk   = Math.max(0.5, toNum($("mt_thk").value) || 4);
      const exp   = $("mt_exp").value;
      const Tamb  = toNum($("mt_amb").value) || 70;
      const T0    = toNum($("mt_T0").value) || 75;

      const Wc    = Math.max(0, toNum($("mt_cem").value)  || 0);
      const Ws    = Math.max(0, toNum($("mt_slag").value) || 0);
      const Wf    = Math.max(0, toNum($("mt_fa").value)   || 0);

      const Hc    = Math.max(0, toNum($("mt_Hc").value) || 120);
      const Hs    = Math.max(0, toNum($("mt_Hs").value) || 80);
      const Hf    = Math.max(0, toNum($("mt_Hf").value) || 50);

      const tc    = Math.max(1, toNum($("mt_tc").value) || 12);
      const ts    = Math.max(1, toNum($("mt_ts").value) || 30);
      const tf    = Math.max(1, toNum($("mt_tf").value) || 36);

      const k1    = Math.max(0.001, toNum($("mt_k1").value) || 0.08);
      const dLim  = Math.max(0, toNum($("mt_dlim").value) || 35);

      const C = 890; // Btu/°F·yd³

      const Qtot = Wc*Hc + Ws*Hs + Wf*Hf; // Btu/yd³
      const Wtot = Wc + Ws + Wf;
      const tau  = Wtot > 0 ? (Wc*tc + Ws*ts + Wf*tf) / Wtot : 24;

      let k = k1 / thk;
      if (exp === "insulated") k *= 0.5;
      else if (exp === "forms+blankets") k *= 0.8;
      else if (exp === "bare-form") k *= 1.2;
      else if (exp === "fully-exposed") k *= 1.6;

      const dt = 0.25, tEnd = 96;
      let T = T0, t = 0, Tmax = T0, tAtMax = 0;
      const rows = [];
      const qScale = Qtot / tau;

      while (t <= tEnd) {
        if (Math.abs(t - Math.round(t)) < 1e-9) rows.push([t, T]);
        if (T > Tmax) { Tmax = T; tAtMax = t; }
        const q = qScale * Math.exp(-t / tau);   // Btu/h·yd³
        const dTdt = (q / C) - k * (T - Tamb);   // °F/h
        T += dTdt * dt;
        t += dt;
      }

      const dT_adiab = Qtot / C;
      const proxyGrad = Tmax - Tamb; // proxy ΔT (core vs ambient)
      const warn = proxyGrad > dLim
        ? `⚠️ Proxy ΔT = ${fmt(proxyGrad,1)} °F exceeds limit ${fmt(dLim,0)} °F — add cooling, reduce T₀, or add SCMs/insulation.`
        : `OK: Proxy ΔT = ${fmt(proxyGrad,1)} °F ≤ ${fmt(dLim,0)} °F.`;

      const lines = [];
      lines.push(`Adiabatic rise (upper bound): <strong>${fmt(dT_adiab,1)} °F</strong>`);
      lines.push(`Cooling k: ${fmt(k,3)} h⁻¹  (thickness ${fmt(thk,1)} ft, ${exp})`);
      lines.push(`Peak core temperature: <strong>${fmt(Tmax,1)} °F</strong> at ~${fmt(tAtMax,1)} h`);
      lines.push(`Placement: ${fmt(T0,1)} °F  •  Ambient: ${fmt(Tamb,1)} °F`);
      lines.push(warn);

      const text = rows.map(r => `${r[0]} h\t${fmt(r[1],1)} °F`).join("\n");
      const html = `<strong>96-hour core temp (hourly):</strong><br>${rows.map(r => `${r[0]} h — ${fmt(r[1],1)} °F`).join("<br>")}`;
      $("mt_summary").innerHTML = lines.join("<br>") + "<br><br>" + html;
      $("mt_summary").appendChild(pillCopy("", () => text).firstChild.lastChild);

      state.maxtemp = {
        thickness_ft: $("mt_thk").value, exposure: $("mt_exp").value,
        ambient_F: $("mt_amb").value, placement_F: $("mt_T0").value,
        cem_lb: $("mt_cem").value, slag_lb: $("mt_slag").value, flyash_lb: $("mt_fa").value,
        H_cem: $("mt_Hc").value, H_slag: $("mt_Hs").value, H_fa: $("mt_Hf").value,
        tau_cem_h: $("mt_tc").value, tau_slag_h: $("mt_ts").value, tau_fa_h: $("mt_tf").value,
        k1_h: $("mt_k1").value, deltaT_limit_F: $("mt_dlim").value
      };
      saveState(state); writeHash("#maxtemp", state.maxtemp);
    }

    inputsListen(mount, simulate);
    simulate();
  }

  // ====================== DONE ======================
  console.log("ACI WV — calculators loaded (full).");
  // DOUBLE-TAP = VOICE COMMAND (quick volume fill)
  if ('webkitSpeechRecognition' in window) {
    const rec = new webkitSpeechRecognition();
    rec.continuous = false; rec.lang = 'en-US';
    rec.onresult = e => {
      const cmd = e.results[0][0].transcript.toLowerCase();
      const nums = cmd.match(/\d+/g);
      if (nums && nums.length >= 3) {
        location.hash = `#volume?len=${nums[0]}&wid=${nums[1]}&th_in=${nums[2]}`;
        alert(`Heard: ${nums[0]} × ${nums[1]} × ${nums[2]}" — Volume loaded!`);
      }
    };
    document.body.ondblclick = () => rec.start();
    console.log('Double-tap anywhere = voice command');
  }
})();







