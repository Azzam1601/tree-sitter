import { useState } from "react";

const days = [
  {
    date: "16/08",
    day: "الأحد",
    sold: { b91: 5790, b95: 3257, diesel: 1608 },
    val: { b91: 12622.20, b95: 7588.81, diesel: 2878.32 },
    inv: { b91: 3066, b95: 18006, diesel: 729 },
    channels: { cash: 5556.31, mada: 11559.54, visa: 2754.48, petro: 337, sab: 2682 },
    total: 23089.33,
    expenses: 200,
    expDetail: "سلفة حسام",
    diff: 200.00,
    depletion: null,
  },
  {
    date: "17/08",
    day: "الإثنين",
    sold: { b91: 5002, b95: 2108, diesel: 733 },
    val: { b91: 10904.36, b95: 4911.64, diesel: 1312.07 },
    inv: { b91: 17486, b95: 15898, diesel: 0 },
    channels: { cash: 4080.32, mada: 8260.14, visa: 1607, petro: 239, sab: 2927.62 },
    total: 17128.07,
    expenses: 320,
    expDetail: "بلك بناء 300 + إكرامية 20",
    diff: 13.99,
    depletion: { type: "91", time: "10:25 ص", atgRemain: 1436, refilled: true },
  },
  {
    date: "18/08",
    day: "الثلاثاء",
    sold: { b91: 5592, b95: 2549, diesel: 0 },
    val: { b91: 12190.56, b95: 5939.17, diesel: 0 },
    inv: { b91: 11894, b95: 13349, diesel: 0 },
    channels: { cash: 6730.54, mada: 7433, visa: 1718, petro: 153, sab: 1983.5 },
    total: 18129.73,
    expenses: 114,
    expDetail: "بنزين سيارة عزام",
    diff: 111.69,
    depletion: null,
  },
  {
    date: "19/08",
    day: "الأربعاء",
    sold: { b91: 6017, b95: 2724, diesel: 0 },
    val: { b91: 13117.06, b95: 6346.92, diesel: 0 },
    inv: { b91: 5877, b95: 10625, diesel: 0 },
    channels: { cash: 4641.85, mada: 9956.67, visa: 1754.39, petro: 568, sab: 2543.07 },
    total: 19463.98,
    expenses: 0,
    expDetail: "",
    diff: 0,
    depletion: null,
  },
  {
    date: "20/08",
    day: "الخميس",
    sold: { b91: 5700, b95: 2473, diesel: 203 },
    val: { b91: 12426.00, b95: 5762.09, diesel: 363.37 },
    inv: { b91: 0, b95: 8152, diesel: 19794 },
    channels: { cash: 5517.26, mada: 8883.35, visa: 1881.85, petro: 477, sab: 1772 },
    total: 18551.46,
    expenses: 20,
    expDetail: "إكرامية سائق ديزل",
    diff: 20,
    depletion: { type: "91", time: "9:05 م", atgRemain: 1438, refilled: false },
  },
];

const fmt = (n) => n.toLocaleString("en-US");
const fmtR = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const sum = (arr, fn) => arr.reduce((s, d) => s + fn(d), 0);

export default function App() {
  const [tab, setTab] = useState("sold");

  const totals = {
    sold91: sum(days, d => d.sold.b91),
    sold95: sum(days, d => d.sold.b95),
    soldD: sum(days, d => d.sold.diesel),
    val91: sum(days, d => d.val.b91),
    val95: sum(days, d => d.val.b95),
    valD: sum(days, d => d.val.diesel),
    sales: sum(days, d => d.total),
    exp: sum(days, d => d.expenses),
    diff: sum(days, d => d.diff),
    cash: sum(days, d => d.channels.cash),
    mada: sum(days, d => d.channels.mada),
    visa: sum(days, d => d.channels.visa),
    petro: sum(days, d => d.channels.petro),
    sab: sum(days, d => d.channels.sab),
  };
  totals.liters = totals.sold91 + totals.sold95 + totals.soldD;

  const tabs = [
    { id: "sold", label: "المباع", icon: "⛽" },
    { id: "inv", label: "المخزون", icon: "🛢️" },
    { id: "channels", label: "القبض", icon: "💳" },
    { id: "summary", label: "ملخص", icon: "📊" },
  ];

  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", background: "#f0f2f5", minHeight: "100vh", padding: "10px", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e40af)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: 1 }}>محطة البدائع — مور للوقود</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>تقرير المبيعات والمخزون</div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>16 – 20 أغسطس 2026 (5 أيام)</div>
          </div>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{fmtR(totals.sales)}</div>
            <div style={{ fontSize: 9, opacity: 0.7 }}>إجمالي المبيعات ر.س</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
        {[
          { label: "اللترات", val: fmt(totals.liters), sub: "لتر", color: "#2563eb", bg: "#eff6ff" },
          { label: "المصروفات", val: fmtR(totals.exp), sub: "ر.س", color: "#d97706", bg: "#fffbeb" },
          { label: "الفروقات", val: fmtR(totals.diff), sub: "ر.س", color: totals.diff > 100 ? "#dc2626" : "#059669", bg: totals.diff > 100 ? "#fef2f2" : "#f0fdf4" },
        ].map((k, i) => (
          <div key={i} style={{ background: k.bg, borderRadius: 10, padding: "8px 10px", borderBottom: `3px solid ${k.color}` }}>
            <div style={{ fontSize: 9, color: "#6b7280" }}>{k.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: k.color, marginTop: 1 }}>{k.val}</div>
            <div style={{ fontSize: 8, color: "#9ca3af" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#e2e8f0", borderRadius: 10, padding: 3, marginBottom: 10, gap: 2 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "7px 0", border: "none", borderRadius: 8, cursor: "pointer",
            fontSize: 11, fontWeight: 600, transition: "all 0.2s",
            background: tab === t.id ? "#fff" : "transparent",
            color: tab === t.id ? "#1e40af" : "#64748b",
            boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          }}>
            <span style={{ fontSize: 13 }}>{t.icon}</span>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      {/* ===== SOLD TAB ===== */}
      {tab === "sold" && (
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ background: "#1e40af", color: "#fff", padding: "8px 12px", fontSize: 12, fontWeight: 600 }}>
            الكميات المباعة يومياً (لتر + ر.س)
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 380 }}>
              <thead>
                <tr style={{ background: "#dbeafe" }}>
                  <th style={th}>التاريخ</th>
                  <th style={th}>بنزين 91</th>
                  <th style={th}>بنزين 95</th>
                  <th style={th}>ديزل</th>
                  <th style={th}>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ ...td, fontWeight: 600 }}>
                      <div>{d.date}</div>
                      <div style={{ fontSize: 8, color: "#94a3b8" }}>{d.day}</div>
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 600, color: "#1e40af" }}>{fmt(d.sold.b91)}</div>
                      <div style={{ fontSize: 9, color: "#64748b" }}>{fmtR(d.val.b91)}</div>
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 600, color: "#7c3aed" }}>{fmt(d.sold.b95)}</div>
                      <div style={{ fontSize: 9, color: "#64748b" }}>{fmtR(d.val.b95)}</div>
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 600, color: d.sold.diesel === 0 ? "#cbd5e1" : "#0d9488" }}>
                        {d.sold.diesel === 0 ? "—" : fmt(d.sold.diesel)}
                      </div>
                      {d.val.diesel > 0 && <div style={{ fontSize: 9, color: "#64748b" }}>{fmtR(d.val.diesel)}</div>}
                    </td>
                    <td style={{ ...td, fontWeight: 700, color: "#0f172a", fontSize: 11 }}>
                      <div>{fmtR(d.total)}</div>
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#0f172a", color: "#fff" }}>
                  <td style={{ ...td, fontWeight: 700 }}>المجموع</td>
                  <td style={td}>
                    <div style={{ fontWeight: 700 }}>{fmt(totals.sold91)}</div>
                    <div style={{ fontSize: 9, opacity: 0.7 }}>{fmtR(totals.val91)}</div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 700 }}>{fmt(totals.sold95)}</div>
                    <div style={{ fontSize: 9, opacity: 0.7 }}>{fmtR(totals.val95)}</div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 700 }}>{fmt(totals.soldD)}</div>
                    <div style={{ fontSize: 9, opacity: 0.7 }}>{fmtR(totals.valD)}</div>
                  </td>
                  <td style={{ ...td, fontWeight: 800, fontSize: 12 }}>{fmtR(totals.sales)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Expenses & Diffs */}
          <div style={{ padding: 10, borderTop: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 6 }}>المصروفات والفروقات</div>
            {days.filter(d => d.expenses > 0 || d.diff > 0).map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid #f1f5f9", fontSize: 10 }}>
                <span style={{ color: "#64748b" }}>{d.date}</span>
                <span style={{ color: "#374151" }}>{d.expDetail || "—"}</span>
                <div style={{ textAlign: "left" }}>
                  {d.expenses > 0 && <span style={{ color: "#d97706", marginLeft: 8 }}>مصروف: {fmt(d.expenses)}</span>}
                  {d.diff > 0 && <span style={{ color: "#dc2626", marginLeft: 8 }}>فرق: {fmtR(d.diff)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== INVENTORY TAB ===== */}
      {tab === "inv" && (
        <div>
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 10 }}>
            <div style={{ background: "#065f46", color: "#fff", padding: "8px 12px", fontSize: 12, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
              <span>جرد المخزون نهاية اليوم (لتر)</span>
              <span style={{ fontSize: 10, opacity: 0.8 }}>سعة كل خزان: 45,000</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 380 }}>
                <thead>
                  <tr style={{ background: "#d1fae5" }}>
                    <th style={th}>التاريخ</th>
                    <th style={th}>بنزين 91</th>
                    <th style={th}>بنزين 95</th>
                    <th style={th}>ديزل</th>
                    <th style={th}>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((d, i) => {
                    const totalInv = d.inv.b91 + d.inv.b95 + d.inv.diesel;
                    return (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#f0fdf4" : "#fff", borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ ...td, fontWeight: 600 }}>
                          <div>{d.date}</div>
                          <div style={{ fontSize: 8, color: "#94a3b8" }}>{d.day}</div>
                          {d.depletion && (
                            <div style={{ fontSize: 8, color: "#dc2626", fontWeight: 700, marginTop: 2 }}>
                              ⚠ نفاذ {d.depletion.time}
                            </div>
                          )}
                        </td>
                        <td style={td}><InvCell val={d.inv.b91} cap={45000} prev={i > 0 ? days[i-1].inv.b91 : null} depleted={d.depletion?.type === "91"} refilled={d.depletion?.refilled} /></td>
                        <td style={td}><InvCell val={d.inv.b95} cap={45000} prev={i > 0 ? days[i-1].inv.b95 : null} /></td>
                        <td style={td}><InvCell val={d.inv.diesel} cap={45000} prev={i > 0 ? days[i-1].inv.diesel : null} refilled={d.inv.diesel > 0 && i > 0 && days[i-1].inv.diesel === 0} /></td>
                        <td style={{ ...td, fontWeight: 700, color: "#065f46", fontSize: 11 }}>{fmt(totalInv)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tank Level Bars */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 8 }}>مستوى الخزانات — آخر جرد (20/08)</div>
            {[
              { label: "بنزين 91", val: 0, color: "#ef4444" },
              { label: "بنزين 95", val: 8152, color: "#8b5cf6" },
              { label: "ديزل", val: 19794, color: "#0d9488" },
            ].map((t, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600 }}>{t.label}</span>
                  <span style={{ color: t.val === 0 ? "#dc2626" : "#64748b" }}>
                    {t.val === 0 ? "نفذ ❌" : `${fmt(t.val)} / 45,000 (${Math.round(t.val/450)}%)`}
                  </span>
                </div>
                <div style={{ background: "#e5e7eb", borderRadius: 6, height: 10, overflow: "hidden" }}>
                  <div style={{ background: t.val === 0 ? "#fca5a5" : t.color, borderRadius: 6, height: 10, width: `${Math.max((t.val / 45000) * 100, t.val === 0 ? 100 : 0)}%`, transition: "width 0.5s", opacity: t.val === 0 ? 0.3 : 1 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Depletion Events */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#dc2626", marginBottom: 8 }}>⚠ حالات نفاذ بنزين 91</div>
            {[
              { date: "17/08", time: "10:25 ص", atg: "1,436 لتر (درَك)", action: "تم التوريد ✅", actionColor: "#059669" },
              { date: "20/08", time: "9:05 م", atg: "1,438 لتر (درَك)", action: "لم يُورَّد ❌", actionColor: "#dc2626" },
            ].map((e, i) => (
              <div key={i} style={{ background: "#fef2f2", borderRadius: 8, padding: 8, marginBottom: 6, border: "1px solid #fecaca" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                  <span style={{ fontWeight: 700, color: "#991b1b" }}>{e.date} — {e.time}</span>
                  <span style={{ fontWeight: 700, color: e.actionColor }}>{e.action}</span>
                </div>
                <div style={{ fontSize: 9, color: "#7f1d1d", marginTop: 2 }}>متبقي ATG: {e.atg}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== CHANNELS TAB ===== */}
      {tab === "channels" && (
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ background: "#7c3aed", color: "#fff", padding: "8px 12px", fontSize: 12, fontWeight: 600 }}>
            قنوات القبض اليومية (ر.س)
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, minWidth: 400 }}>
              <thead>
                <tr style={{ background: "#ede9fe" }}>
                  <th style={th}>التاريخ</th>
                  <th style={th}>كاش</th>
                  <th style={th}>شبكة</th>
                  <th style={th}>فيزا</th>
                  <th style={th}>بترو</th>
                  <th style={th}>اب ساب</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#faf5ff" : "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ ...td, fontWeight: 600, fontSize: 10 }}>{d.date}</td>
                    <td style={td}>{fmtR(d.channels.cash)}</td>
                    <td style={td}>{fmtR(d.channels.mada)}</td>
                    <td style={td}>{fmtR(d.channels.visa)}</td>
                    <td style={td}>{fmtR(d.channels.petro)}</td>
                    <td style={td}>{fmtR(d.channels.sab)}</td>
                  </tr>
                ))}
                <tr style={{ background: "#4c1d95", color: "#fff" }}>
                  <td style={{ ...td, fontWeight: 700 }}>المجموع</td>
                  <td style={{ ...td, fontWeight: 600 }}>{fmtR(totals.cash)}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{fmtR(totals.mada)}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{fmtR(totals.visa)}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{fmtR(totals.petro)}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{fmtR(totals.sab)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 8 }}>توزيع القبض — إجمالي الفترة</div>
            {[
              { label: "شبكة (مدى)", val: totals.mada, color: "#2563eb" },
              { label: "كاش", val: totals.cash, color: "#10b981" },
              { label: "اب ساب", val: totals.sab, color: "#f59e0b" },
              { label: "فيزا", val: totals.visa, color: "#8b5cf6" },
              { label: "بترو", val: totals.petro, color: "#ec4899" },
            ].map((ch, i) => {
              const pct = (ch.val / totals.sales) * 100;
              return (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600 }}>{ch.label}</span>
                    <span style={{ color: "#64748b" }}>{fmtR(ch.val)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div style={{ background: "#e5e7eb", borderRadius: 4, height: 7 }}>
                    <div style={{ background: ch.color, borderRadius: 4, height: 7, width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== SUMMARY TAB ===== */}
      {tab === "summary" && (
        <div>
          {/* Sales by Fuel Type */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 10 }}>توزيع المبيعات حسب النوع</div>
            {[
              { label: "بنزين 91", liters: totals.sold91, val: totals.val91, color: "#2563eb", pct: (totals.sold91 / totals.liters * 100) },
              { label: "بنزين 95", liters: totals.sold95, val: totals.val95, color: "#8b5cf6", pct: (totals.sold95 / totals.liters * 100) },
              { label: "ديزل", liters: totals.soldD, val: totals.valD, color: "#0d9488", pct: (totals.soldD / totals.liters * 100) },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, color: f.color, fontSize: 12 }}>{f.label}</span>
                  <span style={{ fontSize: 10, color: "#64748b" }}>{f.pct.toFixed(0)}%</span>
                </div>
                <div style={{ background: "#f1f5f9", borderRadius: 6, height: 8, marginBottom: 4 }}>
                  <div style={{ background: f.color, borderRadius: 6, height: 8, width: `${f.pct}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b" }}>
                  <span>{fmt(f.liters)} لتر</span>
                  <span>{fmtR(f.val)} ر.س</span>
                </div>
              </div>
            ))}
          </div>

          {/* Worker Performance */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 8 }}>المتوسط اليومي</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "المبيعات", val: fmtR(totals.sales / 5), unit: "ر.س/يوم" },
                { label: "اللترات", val: fmt(Math.round(totals.liters / 5)), unit: "لتر/يوم" },
                { label: "أعلى يوم", val: "16/08", unit: fmtR(23089.33) + " ر.س" },
                { label: "أقل يوم", val: "17/08", unit: fmtR(17128.07) + " ر.س" },
              ].map((m, i) => (
                <div key={i} style={{ background: "#f8fafc", borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginTop: 1 }}>{m.val}</div>
                  <div style={{ fontSize: 9, color: "#64748b" }}>{m.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Observations */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 8 }}>ملاحظات</div>
            {[
              { icon: "🔴", text: "نفاذ بنزين 91 مرتين (17 و 20 أغسطس) — تكرار النفاذ يشير لنقص في جدولة التوريد" },
              { icon: "⛽", text: "الديزل غير متوفر 3 أيام (18-19-20 حتى وصول التوريد مساء 20)" },
              { icon: "⚠️", text: "فروقات 17/08 بلغت 200 ر.س (سلفة حسام) و 18/08 بلغت 111.69 ر.س" },
              { icon: "📈", text: "أعلى مبيعات يوم 16/08 (23,089 ر.س) بسبب ارتفاع مبيعات الديزل" },
            ].map((n, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, padding: "6px 8px", background: "#f8fafc", borderRadius: 6, fontSize: 10, color: "#374151", lineHeight: 1.5 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{n.icon}</span>
                <span>{n.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InvCell({ val, cap, prev, depleted, refilled }) {
  const isZero = val === 0;
  const isLow = val > 0 && val < 5000;
  const change = prev !== null ? val - prev : null;
  const hasRefill = change !== null && change > 0;

  return (
    <div>
      <div style={{
        fontWeight: 700, fontSize: 11,
        color: isZero ? "#dc2626" : isLow ? "#d97706" : "#065f46",
        background: isZero ? "#fef2f2" : isLow ? "#fffbeb" : "transparent",
        borderRadius: 4, padding: isZero || isLow ? "1px 4px" : 0, display: "inline-block",
      }}>
        {isZero ? "نفذ ❌" : fmt(val)}
      </div>
      {change !== null && !isZero && (
        <div style={{ fontSize: 8, color: hasRefill ? "#059669" : "#94a3b8", marginTop: 1, fontWeight: hasRefill ? 600 : 400 }}>
          {hasRefill ? `▲ +${fmt(change)} توريد` : `▼ ${fmt(change)}`}
        </div>
      )}
      {depleted && refilled && (
        <div style={{ fontSize: 8, color: "#059669", fontWeight: 600 }}>نفذ ثم وُرِّد ✅</div>
      )}
    </div>
  );
}

const th = { padding: "7px 4px", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#374151" };
const td = { padding: "7px 4px", textAlign: "center" };
