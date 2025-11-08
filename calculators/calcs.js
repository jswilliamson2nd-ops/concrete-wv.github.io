/* ACI WV · calculators/calcs.js — 17 TOOLS — WORKING — NOV 08 2025 */
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

  const LS_KEY = "aciwv_calc_state_v1";
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
      try {
        ok = document.execCommand("copy");
      } catch {}
      ta.remove();
      return ok;
    }
  }

  function pillCopy(html, getText) {
    const wrap = document.createElement("div");
    wrap.style.position = "relative";
    wrap.innerHTML = html;
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
  };

  function render() {
    const { hash, params } = readHash();
    if (!tools[hash]) {
      if (titleNode) titleNode.textContent = "Select a calculator above";
      if (mount)
        mount.innerHTML =
          '<p class="muted">Pick a tool from the cards above.</p>';
      return;
    }
    tools[hash](params || new URLSearchParams());
    setTimeout(() => {
      mount?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }
  window.addEventListener("hashchange", render);
  document.addEventListener("DOMContentLoaded", render);

  // ---------- Small helpers to reduce boilerplate ----------
  function L(label, id, attrs = "") {
    return `<label>${label}<br><input id="${id}" ${attrs}></label>`;
  }
  function S(label, id, optsHtml) {
    return `<label>${label}<br><select id="${id}">${optsHtml}</select></label>`;
  }
  function inputsListen(root, cb) {
    root.querySelectorAll("input, select").forEach((el) =>
      el.addEventListener("input", cb)
    );
  }

  // ====================== VOLUME ======================
  function renderVolume(params) {
    titleNode.textContent = "Volume (yd³) — Slab / Trench / Column";
    const s = {
      shape: "slab",
      len: "",
      wid: "",
      th_in: "",
      qty: "1",
      waste: "5",
      trench_len: "",
      trench_w_in: "",
      trench_d_in: "",
      trench_qty: "1",
      col_d_in: "",
      col_h_ft: "",
      col_qty: "1",
    };
    Object.assign(s, state.volume || {});
    [
      "shape",
      "len",
      "wid",
      "th_in",
      "qty",
      "waste",
      "trench_len",
      "trench_w_in",
      "trench_d_in",
      "trench_qty",
      "col_d_in",
      "col_h_ft",
      "col_qty",
    ].forEach((k) => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${S(
          "Shape",
          "v_shape",
          `<option value="slab">Slab</option><option value="trench">Trench</option><option value="column">Column</option>`
        )}
        ${L("Waste (%)", "v_waste", `type="number" step="0.1" min="0" max="30" value="${s.waste}"`)}
      </div>

      <section id="v_slab"><div class="input-row">
        ${L("Length (ft)", "v_len", `type="number" value="${s.len}"`)}
        ${L("Width (ft)", "v_wid", `type="number" value="${s.wid}"`)}
        ${L("Thickness (in)", "v_th", `type="number" value="${s.th_in}"`)}
        ${L("Qty", "v_qty", `type="number" min="1" value="${s.qty}"`)}
      </div></section>

      <section id="v_trench" style="display:none"><div class="input-row">
        ${L("Total length (ft)", "vt_len", `type="number" value="${s.trench_len}"`)}
        ${L("Width (in)", "vt_w", `type="number" value="${s.trench_w_in}"`)}
        ${L("Depth (in)", "vt_d", `type="number" value="${s.trench_d_in}"`)}
        ${L("Qty", "vt_qty", `type="number" min="1" value="${s.trench_qty}"`)}
      </div></section>

      <section id="v_column" style="display:none"><div class="input-row">
        ${L("Diameter (in)", "vc_d", `type="number" value="${s.col_d_in}"`)}
        ${L("Height (ft)", "vc_h", `type="number" value="${s.col_h_ft}"`)}
        ${L("Qty", "vc_qty", `type="number" min="1" value="${s.col_qty}"`)}
      </div></section>

      <div class="out" id="v_summary">Enter dimensions</div>
    `;

    $("v_shape").value = s.shape;
    const panels = {
      slab: $("v_slab"),
      trench: $("v_trench"),
      column: $("v_column"),
    };
    const showPanel = () => {
      Object.values(panels).forEach((p) => (p.style.display = "none"));
      panels[$("v_shape").value].style.display = "block";
      compute();
    };

    function compute() {
      const waste = clamp(toNum($("v_waste").value) || 0, 0, 30);
      let ft3 = 0;

      if ($("v_shape").value === "slab") {
        const L = toNum($("v_len").value),
          W = toNum($("v_wid").value),
          T = toNum($("v_th").value),
          Q = toNum($("v_qty").value) || 1;
        if (L && W && T) ft3 = L * W * (T / 12) * Q;
      } else if ($("v_shape").value === "trench") {
        const L = toNum($("vt_len").value),
          W = toNum($("vt_w").value),
          D = toNum($("vt_d").value),
          Q = toNum($("vt_qty").value) || 1;
        if (L && W && D) ft3 = L * (W / 12) * (D / 12) * Q;
      } else {
        const D = toNum($("vc_d").value),
          H = toNum($("vc_h").value),
          Q = toNum($("vc_qty").value) || 1;
        if (D && H) ft3 = Math.PI * Math.pow(D / 24, 2) * H * Q;
      }

      const yd3 = ft3 / 27;
      const yd3w = yd3 * (1 + waste / 100);
      const loads = [9, 9.5, 10].map((sz) => ({
        sz,
        count: Math.ceil(yd3w / sz),
        over: fmt(Math.ceil(yd3w / sz) * sz - yd3w, 2),
      }));

      const text =
        `Volume: ${fmt(yd3, 3)} yd³ → ${fmt(yd3w, 3)} yd³ (+${waste}% waste)\n` +
        `9.0 yd: ${loads[0].count} trucks (over ${loads[0].over})\n` +
        `9.5 yd: ${loads[1].count} (over ${loads[1].over})\n` +
        `10.0 yd: ${loads[2].count} (over ${loads[2].over})`;

      $("v_summary").innerHTML = `<strong>${fmt(
        yd3w,
        3
      )} yd³ total</strong><br>${text.replace(/\n/g, "<br>")}`;
      $("v_summary").firstChild.appendChild(
        pillCopy("", () => text).firstChild.lastChild
      );

      state.volume = {
        shape: $("v_shape").value,
        waste: $("v_waste").value,
        len: $("v_len")?.value || "",
        wid: $("v_wid")?.value || "",
        th_in: $("v_th")?.value || "",
        qty: $("v_qty")?.value || "1",
        trench_len: $("vt_len")?.value || "",
        trench_w_in: $("vt_w")?.value || "",
        trench_d_in: $("vt_d")?.value || "",
        trench_qty: $("vt_qty")?.value || "1",
        col_d_in: $("vc_d")?.value || "",
        col_h_ft: $("vc_h")?.value || "",
        col_qty: $("vc_qty")?.value || "1",
      };
      saveState(state);
      writeHash("#volume", state.volume);
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
    ["yd3", "waste"].forEach((k) => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Total yd³", "t_yd", `type="number" step="0.01" value="${s.yd3}"`)}
        ${L(
          "Waste (%)",
          "t_waste",
          `type="number" step="0.1" value="${s.waste}"`
        )}
      </div>
      <div class="out" id="t_summary">Enter total yd³</div>
    `;

    const compute = () => {
      const yd = toNum($("t_yd").value) || 0;
      const waste = toNum($("t_waste").value) || 0;
      const total = yd * (1 + waste / 100);
      const loads = [9, 9.5, 10].map((sz) => ({
        sz,
        count: Math.ceil(total / sz),
        over: fmt(Math.ceil(total / sz) * sz - total, 2),
      }));
      const text =
        `Total needed: ${fmt(total, 3)} yd³\n` +
        `9.0 yd trucks: ${loads[0].count} (over ${loads[0].over})\n` +
        `9.5 yd: ${loads[1].count} (over ${loads[1].over})\n` +
        `10.0 yd: ${loads[2].count} (over ${loads[2].over})`;
      $("t_summary").innerHTML = `<strong>${fmt(
        total,
        3
      )} yd³</strong><br>${text.replace(/\n/g, "<br>")}`;
      $("t_summary").firstChild.appendChild(
        pillCopy("", () => text).firstChild.lastChild
      );
      state.trucks = { yd3: $("t_yd").value, waste: $("t_waste").value };
      saveState(state);
      writeHash("#trucks", state.trucks);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== YIELD ======================
  function renderYield(params) {
    titleNode.textContent = "Yield & Relative Yield (ASTM C138)";
    const s = { design: "27", weight: "", volume: "" };
    Object.assign(s, state.yield || {});
    ["design", "weight", "volume"].forEach(
      (k) => params.has(k) && (s[k] = params.get(k))
    );

    mount.innerHTML = `
      <div class="input-row">
        ${L("Design volume (ft³)", "y_design", `type="number" value="${s.design}"`)}
        ${L("Batch weight (lb)", "y_weight", `type="number" value="${s.weight}"`)}
      </div>
      <div class="input-row">
        ${L("Measured volume (ft³)", "y_volume", `type="number" value="${s.volume}"`)}
      </div>
      <div class="out" id="y_summary">Enter values</div>
    `;

    const compute = () => {
      const design = toNum($("y_design").value) || 27;
      const weight = toNum($("y_weight").value) || 0;
      const vol = toNum($("y_volume").value) || 0;
      if (!weight || !vol) {
        $("y_summary").textContent = "Enter weight and volume";
        return;
      }
      const density = weight / vol; // lb/ft³
      const yield_yd = (weight / density) / 27; // yd³
      const rel_yield = (yield_yd / (design / 27)) * 100;
      const text =
        `Density: ${fmt(density, 1)} pcf\n` +
        `Yield: ${fmt(yield_yd, 3)} yd³\n` +
        `Relative Yield: ${fmt(rel_yield, 1)}%`;
      $("y_summary").innerHTML = `<strong>${fmt(
        yield_yd,
        3
      )} yd³</strong><br>Relative: ${fmt(
        rel_yield,
        1
      )}%<br>${text.replace(/\n/g, "<br>")}`;
      $("y_summary").firstChild.appendChild(
        pillCopy("", () => text).firstChild.lastChild
      );
      state.yield = {
        design: $("y_design").value,
        weight: $("y_weight").value,
        volume: $("y_volume").value,
      };
      saveState(state);
      writeHash("#yield", state.yield);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== W/CM ======================
  function renderWcm(params) {
    titleNode.textContent = "Water–Cementitious Ratio (w/cm)";
    const s = {
      water_lb: "",
      cement_lb: "",
      flyash_lb: "0",
      slag_lb: "0",
      silica_lb: "0",
      eff_fa: "1.0",
      eff_slag: "1.0",
      eff_silica: "1.0",
    };
    Object.assign(s, state.wcm || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Water (lb)", "wc_water", `type="number" step="0.1" value="${s.water_lb}"`)}
        ${L("Cement (lb)", "wc_cem", `type="number" step="0.1" value="${s.cement_lb}"`)}
      </div>
      <div class="input-row">
        ${L("Fly ash (lb)", "wc_fa", `type="number" step="0.1" value="${s.flyash_lb}"`)}
        ${L("Slag (lb)", "wc_slag", `type="number" step="0.1" value="${s.slag_lb}"`)}
        ${L("Silica fume (lb)", "wc_sf", `type="number" step="0.1" value="${s.silica_lb}"`)}
      </div>
      <div class="input-row">
        ${L("FA eff. factor", "wc_eff_fa", `type="number" step="0.1" value="${s.eff_fa}"`)}
        ${L("Slag eff. factor", "wc_eff_slag", `type="number" step="0.1" value="${s.eff_slag}"`)}
        ${L("SF eff. factor", "wc_eff_sf", `type="number" step="0.1" value="${s.eff_silica}"`)}
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

      $("wc_summary").innerHTML = `<strong>w/cm = ${fmt(
        ratio,
        3
      )}</strong><br>${text.replace(/\n/g, "<br>")}`;
      $("wc_summary").firstChild.appendChild(
        pillCopy("", () => text).firstChild.lastChild
      );

      state.wcm = {
        water_lb: $("wc_water").value,
        cement_lb: $("wc_cem").value,
        flyash_lb: $("wc_fa").value,
        slag_lb: $("wc_slag").value,
        silica_lb: $("wc_sf").value,
        eff_fa: $("wc_eff_fa").value,
        eff_slag: $("wc_eff_slag").value,
        eff_silica: $("wc_eff_sf").value,
      };
      saveState(state);
      writeHash("#wcm", state.wcm);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== WATER ADJUST ======================
  function renderWater(params) {
    titleNode.textContent = "Mix Water Adjustment (Aggregate Moisture)";
    const s = {
      agg_lb: "",
      moisture_pct: "",
      absorption_pct: "1.5",
      target_w_cm: "",
      cementitious_lb: "",
    };
    Object.assign(s, state.water || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Total aggregate (lb)", "wa_agg", `type="number" step="0.1" value="${s.agg_lb}"`)}
        ${L("Moisture (%)", "wa_moist", `type="number" step="0.1" value="${s.moisture_pct}"`)}
        ${L("Absorption (%)", "wa_abs", `type="number" step="0.1" value="${s.absorption_pct}"`)}
      </div>
      <div class="input-row">
        ${L("Target w/cm (optional)", "wa_wcm", `type="number" step="0.01" value="${s.target_w_cm}"`)}
        ${L("Cementitious (lb, optional)", "wa_cem", `type="number" step="0.1" value="${s.cementitious_lb}"`)}
      </div>
      <div class="out" id="wa_summary">Enter values</div>
    `;

    const compute = () => {
      const A = toNum($("wa_agg").value) || 0;
      const M = toNum($("wa_moist").value) || 0;
      const AB = toNum($("wa_abs").value) || 0;
      const wcm = toNum($("wa_wcm").value);
      const Cem = toNum($("wa_cem").value);

      // Free moisture contribution from aggregates (over absorption)
      const freePct = Math.max(0, M - AB) / 100;
      const waterFromAgg = A * freePct; // lb water contributed

      let baseWater = NaN;
      if (wcm && Cem) baseWater = wcm * Cem;

      const text =
        `Free moisture: ${fmt(freePct * 100, 2)} % of agg\n` +
        `Water from aggregate: ${fmt(waterFromAgg, 1)} lb\n` +
        (Number.isFinite(baseWater)
          ? `Target batch water for w/cm: ${fmt(baseWater, 1)} lb\n` +
            `Add this much at plant: ${fmt(
              Math.max(0, baseWater - waterFromAgg),
              1
            )} lb`
          : `Tip: provide Target w/cm and Cementitious to compute batch water.`);

      $("wa_summary").innerHTML = text.replace(/\n/g, "<br>");
      state.water = {
        agg_lb: $("wa_agg").value,
        moisture_pct: $("wa_moist").value,
        absorption_pct: $("wa_abs").value,
        target_w_cm: $("wa_wcm").value,
        cementitious_lb: $("wa_cem").value,
      };
      saveState(state);
      writeHash("#water", state.water);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== EVAPORATION RATE ======================
  function renderEvap(params) {
    titleNode.textContent = "Evaporation Rate (lb/ft²·hr)";
    const s = {
      airF: "80",
      concF: "75",
      rh: "50",
      wind_mph: "5",
    };
    Object.assign(s, state.evap || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Air Temp (°F)", "ev_air", `type="number" step="0.1" value="${s.airF}"`)}
        ${L("Concrete Temp (°F)", "ev_conc", `type="number" step="0.1" value="${s.concF}"`)}
        ${L("RH (%)", "ev_rh", `type="number" step="0.1" value="${s.rh}"`)}
        ${L("Wind (mph)", "ev_wind", `type="number" step="0.1" value="${s.wind_mph}"`)}
      </div>
      <div class="out" id="ev_summary">Enter conditions</div>
    `;

    // Approximation based on Menzel/PCA form; good for planning.
    function rateEvap(airF, concF, rh, wind) {
      const Tf = airF;
      const Tc = concF;
      const V = Math.max(0, wind);
      const RH = clamp(rh, 0, 100);

      // Saturation vapor pressure (kPa) via Tetens (°C)
      const FtoC = (f) => (f - 32) * (5 / 9);
      const es = (T_C) => 0.6108 * Math.exp((17.27 * T_C) / (T_C + 237.3)); // kPa
      const ea = (T_C, rhPct) => (rhPct / 100) * es(T_C);

      const Pa = ea(FtoC(Tf), RH);
      const Ps = es(FtoC(Tc));

      // Convert to lb/ft²·hr with tuned coefficient for field alignment
      const E_kg_m2_h = 5.0 * (Pa - Ps) * (1 + 0.4 * V); // rough
      const kg_m2_h_to_lb_ft2_h = 0.204816; // 1 kg/m²·h = 0.204816 lb/ft²·h
      const E = Math.max(0, E_kg_m2_h * kg_m2_h_to_lb_ft2_h);
      return E;
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
        `Guideline threshold ~0.2 lb/ft²·hr\n` +
        `${warn}`;
      $("ev_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.evap = { airF: $("ev_air").value, concF: $("ev_conc").value, rh: $("ev_rh").value, wind_mph: $("ev_wind").value };
      saveState(state);
      writeHash("#evap", state.evap);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== FRESH TEMP ESTIMATE ======================
  function renderTemp(params) {
    titleNode.textContent = "Fresh Concrete Temperature (Weighted Mix)";
    const s = {
      water_lb: "",
      water_F: "",
      agg_lb: "",
      agg_F: "",
      cement_lb: "",
      cement_F: "",
      adm_lb: "0",
      adm_F: "70",
    };
    Object.assign(s, state.temp || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));

    mount.innerHTML = `
      <div class="input-row">
        ${L("Water (lb)", "ft_wlb", `type="number" step="0.1" value="${s.water_lb}"`)}
        ${L("Water Temp (°F)", "ft_wF", `type="number" step="0.1" value="${s.water_F}"`)}
      </div>
      <div class="input-row">
        ${L("Aggregate (lb)", "ft_alb", `type="number" step="0.1" value="${s.agg_lb}"`)}
        ${L("Aggregate Temp (°F)", "ft_aF", `type="number" step="0.1" value="${s.agg_F}"`)}
      </div>
      <div class="input-row">
        ${L("Cementitious (lb)", "ft_clb", `type="number" step="0.1" value="${s.cement_lb}"`)}
        ${L("Cementitious Temp (°F)", "ft_cF", `type="number" step="0.1" value="${s.cement_F}"`)}
      </div>
      <div class="input-row">
        ${L("Admixtures (lb)", "ft_mlb", `type="number" step="0.1" value="${s.adm_lb}"`)}
        ${L("Admixtures Temp (°F)", "ft_mF", `type="number" step="0.1" value="${s.adm_F}"`)}
      </div>
      <div class="out" id="ft_summary">Enter values</div>
    `;

    const compute = () => {
      const W = toNum($("ft_wlb").value) || 0,
        Tw = toNum($("ft_wF").value) || 0;
      const A = toNum($("ft_alb").value) || 0,
        Ta = toNum($("ft_aF").value) || 0;
      const C = toNum($("ft_clb").value) || 0,
        Tc = toNum($("ft_cF").value) || 0;
      const M = toNum($("ft_mlb").value) || 0,
        Tm = toNum($("ft_mF").value) || 0;

      // Simple weighted average (field friendly). More advanced could weight by specific heat.
      const total = W + A + C + M;
      const T =
        total > 0
          ? (W * Tw + A * Ta + C * Tc + M * Tm) / total
          : NaN;

      const text =
        `Estimated fresh temp: ${fmt(T, 1)} °F\n` +
        `Tip: chilling water or shading aggregates has the biggest effect.`;
      $("ft_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.temp = {
        water_lb: $("ft_wlb").value,
        water_F: $("ft_wF").value,
        agg_lb: $("ft_alb").value,
        agg_F: $("ft_aF").value,
        cement_lb: $("ft_clb").value,
        cement_F: $("ft_cF").value,
        adm_lb: $("ft_mlb").value,
        adm_F: $("ft_mF").value,
      };
      saveState(state);
      writeHash("#temp", state.temp);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== CYLINDER PLANNER ======================
  function renderCylinders(params) {
    titleNode.textContent = "Cylinder Break Planner";
    const s = {
      sets: "3",
      per_set: "3",
      ages: "7,14,28",
    };
    Object.assign(s, state.cylinders || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("Number of sets", "cy_sets", `type="number" min="1" step="1" value="${s.sets}"`)}
        ${L("Cylinders per set", "cy_per", `type="number" min="1" step="1" value="${s.per_set}"`)}
        ${L("Break ages (days, comma sep)", "cy_ages", `type="text" value="${s.ages}"`)}
      </div>
      <div class="out" id="cy_summary">Enter details</div>
    `;
    const compute = () => {
      const sets = toInt($("cy_sets").value, 1);
      const per = toInt($("cy_per").value, 1);
      const ages = String($("cy_ages").value)
        .split(",")
        .map((x) => toInt(x.trim(), 0))
        .filter((d) => d > 0);
      const total = sets * per * Math.max(1, ages.length);

      const text =
        `Sets: ${sets}\n` +
        `Cylinders per set: ${per}\n` +
        `Ages: ${ages.join(", ")} days\n` +
        `Total cylinders: ${total}`;
      $("cy_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.cylinders = {
        sets: $("cy_sets").value,
        per_set: $("cy_per").value,
        ages: $("cy_ages").value,
      };
      saveState(state);
      writeHash("#cylinders", state.cylinders);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== REBAR TAKEOFF ======================
  function renderRebar(params) {
    titleNode.textContent = "Rebar Takeoff (Simple)";
    const s = {
      length_ft: "",
      width_ft: "",
      spacing_in: "18",
      bar_size: "#4",
      mat_dir: "both",
    };
    Object.assign(s, state.rebar || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("Length (ft)", "rb_L", `type="number" step="0.1" value="${s.length_ft}"`)}
        ${L("Width (ft)", "rb_W", `type="number" step="0.1" value="${s.width_ft}"`)}
        ${L("Spacing (in)", "rb_S", `type="number" step="0.1" value="${s.spacing_in}"`)}
      </div>
      <div class="input-row">
        ${S("Bar size", "rb_size", `
          <option>#3</option><option selected>#4</option><option>#5</option><option>#6</option><option>#7</option>
        `)}
        ${S("Directions", "rb_dir", `
          <option value="long">Long only</option>
          <option value="trans">Trans only</option>
          <option value="both" selected>Both</option>
        `)}
      </div>
      <div class="out" id="rb_summary">Enter slab and spacing</div>
    `;
    $("rb_size").value = s.bar_size;
    $("rb_dir").value = s.mat_dir;

    const barWt = { "#3": 0.376, "#4": 0.668, "#5": 1.043, "#6": 1.502, "#7": 2.044 }; // lb/ft

    const compute = () => {
      const L = toNum($("rb_L").value) || 0;
      const W = toNum($("rb_W").value) || 0;
      const S = (toNum($("rb_S").value) || 0) / 12;
      const dir = $("rb_dir").value;
      const size = $("rb_size").value;

      let countLong = 0,
        countTrans = 0,
        feetLong = 0,
        feetTrans = 0;
      if (S > 0) {
        if (dir === "long" || dir === "both") {
          countLong = Math.floor(W / S) + 1;
          feetLong = countLong * L;
        }
        if (dir === "trans" || dir === "both") {
          countTrans = Math.floor(L / S) + 1;
          feetTrans = countTrans * W;
        }
      }
      const weight = (feetLong + feetTrans) * (barWt[size] || 0);

      const text =
        `Bars long: ${countLong} × ${fmt(L, 2)} ft = ${fmt(feetLong, 1)} ft\n` +
        `Bars trans: ${countTrans} × ${fmt(W, 2)} ft = ${fmt(feetTrans, 1)} ft\n` +
        `Total weight (${size}): ${fmt(weight, 1)} lb`;
      $("rb_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.rebar = {
        length_ft: $("rb_L").value,
        width_ft: $("rb_W").value,
        spacing_in: $("rb_S").value,
        bar_size: $("rb_size").value,
        mat_dir: $("rb_dir").value,
      };
      saveState(state);
      writeHash("#rebar", state.rebar);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== JOINT SPACING ======================
  function renderJoints(params) {
    titleNode.textContent = "Joint Spacing (Rule-of-Thumb)";
    const s = { slab_th_in: "", factor: "24" };
    Object.assign(s, state.joints || {});
    ["slab_th_in", "factor"].forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("Slab thickness (in)", "j_th", `type="number" step="0.1" value="${s.slab_th_in}"`)}
        ${S("Multiplier (× thickness)", "j_fact", `
          <option value="24">24</option><option value="30" selected>30</option><option value="36">36</option>
        `)}
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
      saveState(state);
      writeHash("#joints", state.joints);
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
        ${L("Rise (in)", "sl_r", `type="number" step="0.1" value="${s.rise_in}"`)}
        ${L("Run (ft)", "sl_run", `type="number" step="0.1" value="${s.run_ft}"`)}
      </div>
      <div class="out" id="sl_summary">Enter values</div>
    `;
    const compute = () => {
      const rise = toNum($("sl_r").value) || 0;
      const run = toNum($("sl_run").value) || 0;
      const slope_pct = run > 0 ? (rise / 12 / run) * 100 : NaN;
      const slope_ratio = run > 0 ? `${fmt(run * 12 / rise, 1)}:1` : "—";
      const text =
        `Grade: ${fmt(slope_pct, 2)} %\n` +
        `Slope ratio: ${slope_ratio}`;
      $("sl_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.slope = { rise_in: $("sl_r").value, run_ft: $("sl_run").value };
      saveState(state);
      writeHash("#slope", state.slope);
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
        ${L("Total volume (yd³)", "pm_total", `type="number" step="0.1" value="${s.total_yd3}"`)}
        ${L("Pump rate (yd³/hr)", "pm_rate", `type="number" step="0.1" value="${s.rate_yd3_hr}"`)}
      </div>
      <div class="out" id="pm_summary">Enter values</div>
    `;
    const compute = () => {
      const V = toNum($("pm_total").value) || 0;
      const R = Math.max(0.1, toNum($("pm_rate").value) || 0.1);
      const hours = V / R;
      const text = `Estimated pump time: ${fmt(hours, 2)} hr`;
      $("pm_summary").innerHTML = text;

      state.pump = {
        total_yd3: $("pm_total").value,
        rate_yd3_hr: $("pm_rate").value,
      };
      saveState(state);
      writeHash("#pump", state.pump);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== TRUCK CYCLE ======================
  function renderCycle(params) {
    titleNode.textContent = "Truck Cycle / Supply Check";
    const s = {
      trucks: "5",
      load_min: "5",
      haul_min: "20",
      pour_min: "8",
      wash_min: "5",
      volume_yd3: "100",
      truck_size_yd3: "9.5",
    };
    Object.assign(s, state.cycle || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("Trucks (count)", "cyc_trk", `type="number" step="1" value="${s.trucks}"`)}
        ${L("Load @ plant (min)", "cyc_load", `type="number" step="0.1" value="${s.load_min}"`)}
        ${L("Haul (one-way, min)", "cyc_haul", `type="number" step="0.1" value="${s.haul_min}"`)}
      </div>
      <div class="input-row">
        ${L("Pour/unload (min)", "cyc_pour", `type="number" step="0.1" value="${s.pour_min}"`)}
        ${L("Wash/return (min)", "cyc_wash", `type="number" step="0.1" value="${s.wash_min}"`)}
      </div>
      <div class="input-row">
        ${L("Total volume (yd³)", "cyc_vol", `type="number" step="0.1" value="${s.volume_yd3}"`)}
        ${L("Truck size (yd³)", "cyc_size", `type="number" step="0.1" value="${s.truck_size_yd3}"`)}
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
      const supplyRate = N * loadsPerHrPerTruck * size; // yd³/hr
      const totalHrs = volume / Math.max(0.1, supplyRate);

      const text =
        `Cycle time: ${fmt(cycleMin, 1)} min\n` +
        `Supply rate: ${fmt(supplyRate, 1)} yd³/hr\n` +
        `Finish in ~${fmt(totalHrs, 2)} hr at this supply`;
      $("cyc_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.cycle = {
        trucks: $("cyc_trk").value,
        load_min: $("cyc_load").value,
        haul_min: $("cyc_haul").value,
        pour_min: $("cyc_pour").value,
        wash_min: $("cyc_wash").value,
        volume_yd3: $("cyc_vol").value,
        truck_size_yd3: $("cyc_size").value,
      };
      saveState(state);
      writeHash("#cycle", state.cycle);
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
        ${L("Area (ft²)", "cv_area", `type="number" step="0.1" value="${s.area_ft2}"`)}
        ${L("Coverage (ft²/gal)", "cv_cov", `type="number" step="0.1" value="${s.coverage_ft2_per_gal}"`)}
        ${S("Container", "cv_unit", `<option value="gal" selected>Gallon</option><option value="5gal">5-Gallon</option>`)}
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
      const text =
        `Required: ${fmt(gal, 2)} gal\n` +
        `5-gal buckets: ${fmt(buckets5, 2)}`;
      $("cv_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.coverage = {
        area_ft2: $("cv_area").value,
        coverage_ft2_per_gal: $("cv_cov").value,
        unit: $("cv_unit").value,
      };
      saveState(state);
      writeHash("#coverage", state.coverage);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== INSULATION ======================
  function renderInsulation(params) {
    titleNode.textContent = "Insulation / Blanket Estimator";
    const s = {
      area_ft2: "",
      dT_F: "40",
      R_value: "5",
      blanket_w: "6",
      blanket_l: "25",
    };
    Object.assign(s, state.insulation || {});
    Object.keys(s).forEach((k) => params.has(k) && (s[k] = params.get(k)));
    mount.innerHTML = `
      <div class="input-row">
        ${L("Area (ft²)", "in_area", `type="number" step="0.1" value="${s.area_ft2}"`)}
        ${L("ΔT (°F)", "in_dt", `type="number" step="0.1" value="${s.dT_F}"`)}
        ${L("Blanket R-value", "in_R", `type="number" step="0.1" value="${s.R_value}"`)}
      </div>
      <div class="input-row">
        ${L("Blanket width (ft)", "in_bw", `type="number" step="0.1" value="${s.blanket_w}"`)}
        ${L("Blanket length (ft)", "in_bl", `type="number" step="0.1" value="${s.blanket_l}"`)}
      </div>
      <div class="out" id="in_summary">Enter values</div>
    `;
    const compute = () => {
      const A = toNum($("in_area").value) || 0;
      const dT = toNum($("in_dt").value) || 0;
      const R = Math.max(0.1, toNum($("in_R").value) || 0.1);
      const Bw = toNum($("in_bw").value) || 6;
      const Bl = toNum($("in_bl").value) || 25;

      const blankets = Math.ceil(A / (Bw * Bl));
      const heatLossBTUhr = (A * dT) / R; // BTU/hr (steady one-dimensional)
      const text =
        `Blankets needed: ${blankets} (each ${fmt(Bw, 1)}×${fmt(Bl, 1)} ft)\n` +
        `Approx heat loss: ${fmt(heatLossBTUhr, 0)} BTU/hr`;
      $("in_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.insulation = {
        area_ft2: $("in_area").value,
        dT_F: $("in_dt").value,
        R_value: $("in_R").value,
        blanket_w: $("in_bw").value,
        blanket_l: $("in_bl").value,
      };
      saveState(state);
      writeHash("#insulation", state.insulation);
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
        ${L("28-day strength (psi)", "st_f28", `type="number" step="1" value="${s.f28}"`)}
        ${L("k (days)", "st_k", `type="number" step="0.1" value="${s.k}"`)}
        ${L("Age t (days)", "st_t", `type="number" step="0.1" value="${s.t_day}"`)}
      </div>
      <div class="out" id="st_summary">Enter values</div>
    `;
    const compute = () => {
      const f28 = toNum($("st_f28").value) || 0;
      const k = Math.max(0.1, toNum($("st_k").value) || 3.5);
      const t = Math.max(0, toNum($("st_t").value) || 0);
      // Hyperbolic: f(t) = f28 * t / (k + t)
      const ft = (f28 * t) / (k + t);
      const pct = (ft / f28) * 100;
      const text =
        `f(t) ≈ ${fmt(ft, 0)} psi (${fmt(pct, 1)}% of f28)\n` +
        `Model: f = f28 * t / (k + t)`;
      $("st_summary").innerHTML = text.replace(/\n/g, "<br>");

      state.strength = { f28: $("st_f28").value, k: $("st_k").value, t_day: $("st_t").value };
      saveState(state);
      writeHash("#strength", state.strength);
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
        ${L("Value", "cv_val", `type="number" step="0.0001" value="${s.val}"`)}
        ${S("From", "cv_from", `${opts(lengthUnits.concat(areaUnits, volUnits, massUnits, tempUnits))}`)}
        ${S("To", "cv_to", `${opts(lengthUnits.concat(areaUnits, volUnits, massUnits, tempUnits))}`)}
      </div>
      <div class="out" id="cv2_summary">Enter value and units</div>
    `;
    $("cv_from").value = s.from;
    $("cv_to").value = s.to;

    function convert(val, from, to) {
      if (from === to) return val;

      // Temps
      if ((from === "°F" || from === "°C") && (to === "°F" || to === "°C")) {
        if (from === "°F" && to === "°C") return (val - 32) * (5 / 9);
        if (from === "°C" && to === "°F") return val * (9 / 5) + 32;
      }

      // Length base: meters
      const L = {
        in: 0.0254,
        ft: 0.3048,
        yd: 0.9144,
        m: 1,
      };
      // Area base: m²
      const A = {
        "ft²": 0.09290304,
        "yd²": 0.83612736,
        "m²": 1,
      };
      // Volume base: m³
      const V = {
        "ft³": 0.028316846592,
        "yd³": 0.764554857984,
        "m³": 1,
        gal: 0.003785411784,
        L: 0.001,
      };
      // Mass base: kg
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
      saveState(state);
      writeHash("#convert", state.convert);
    };
    inputsListen(mount, compute);
    compute();
  }

  // ====================== DONE ======================
  console.log("ACI WV — 17/17 calculators loaded.");
})();






