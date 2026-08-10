import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, Users, DollarSign, BedDouble, Clock, CalendarCheck,
  Stethoscope, FileText, Star, Pill, FlaskConical, Activity, TrendingUp,
  TrendingDown, Bell, Search, Plus, Package, AlertTriangle, CheckCircle2,
  UserCog, ClipboardList, Beaker, Menu, X, HeartPulse, Syringe, ChevronRight,
  Settings, ShieldCheck, LogOut, UserPlus, Upload, Activity as ActivityIcon,
  Droplet, Scale,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { patientProfilesApi, healthReadingsApi, notificationsApi, reportsApi } from "@/lib/api";
import QuickActionUploadReport from "@/components/reports/QuickActionUploadReport";
import AddHealthReadingModal from "@/components/health/AddHealthReadingModal";

/* ---------------------------------- Design tokens ---------------------------------- */
const C = {
  primary: "#6FB3B5",
  secondary: "#DCE8EE",
  accent: "#9BD3D5",
  bg: "#F4F6F8",
  card: "#FFFFFF",
  text: "#2F3A40",
  muted: "#7A8A92",
  up: "#5C9E7E",
  down: "#C97B63",
  primaryDark: "#4E8C8E",
};

const font =
  "'Manrope','Segoe UI',system-ui,-apple-system,sans-serif";
const numFont =
  "'Inter','Segoe UI',system-ui,-apple-system,sans-serif";

/* ---------------------------------- Mock data ---------------------------------- */

const admin = {
  metrics: [
    { label: "Total revenue", value: "$2,458,900", change: "+15%", up: true, icon: DollarSign },
    { label: "Active patients", value: "12,847", change: "+8%", up: true, icon: Users },
    { label: "Total doctors", value: "125", change: "+12%", up: true, icon: Stethoscope },
    { label: "Bed occupancy", value: "85%", change: "+5%", up: true, icon: BedDouble },
    { label: "Avg. wait time", value: "23 min", change: "-10%", up: false, icon: Clock },
    { label: "Monthly appointments", value: "4,231", change: "+20%", up: true, icon: CalendarCheck },
  ],
  revenueTrend: [
    { m: "Feb", v: 176 }, { m: "Mar", v: 184 }, { m: "Apr", v: 192 }, { m: "May", v: 205 },
    { m: "Jun", v: 198 }, { m: "Jul", v: 214 }, { m: "Aug", v: 221 }, { m: "Sep", v: 230 },
    { m: "Oct", v: 238 }, { m: "Nov", v: 245 }, { m: "Dec", v: 246 },
  ],
  patientGrowth: [
    { m: "Feb", v: 9800 }, { m: "Mar", v: 10120 }, { m: "Apr", v: 10430 }, { m: "May", v: 10800 },
    { m: "Jun", v: 11050 }, { m: "Jul", v: 11400 }, { m: "Aug", v: 11720 }, { m: "Sep", v: 12010 },
    { m: "Oct", v: 12320 }, { m: "Nov", v: 12580 }, { m: "Dec", v: 12847 },
  ],
  deptPerf: [
    { d: "Cardiology", v: 92 }, { d: "Neurology", v: 84 }, { d: "Orthopedics", v: 88 },
    { d: "Pediatrics", v: 95 }, { d: "Oncology", v: 79 }, { d: "Radiology", v: 86 },
  ],
  resourceUse: [
    { n: "ICU beds", v: 32 }, { n: "General beds", v: 41 }, { n: "Operating rooms", v: 14 }, { n: "Equipment", v: 13 },
  ],
  staffDist: [
    { r: "Nurses", v: 310 }, { r: "Doctors", v: 125 }, { r: "Technicians", v: 96 },
    { r: "Admin", v: 58 }, { r: "Support", v: 74 },
  ],
  apptTrend: [
    { m: "Jul", v: 3520 }, { m: "Aug", v: 3680 }, { m: "Sep", v: 3810 }, { m: "Oct", v: 3990 },
    { m: "Nov", v: 4105 }, { m: "Dec", v: 4231 },
  ],
  activities: [
    { t: "2 min ago", txt: "Dr. Amina Raza approved 3 lab requests" },
    { t: "18 min ago", txt: "New staff member onboarded — Radiology" },
    { t: "1 hr ago", txt: "Pharmacy flagged low stock on 4 items" },
    { t: "3 hrs ago", txt: "Monthly financial report generated" },
  ],
  systemHealth: [
    { n: "EHR system", ok: true }, { n: "Billing gateway", ok: true },
    { n: "Lab integration", ok: true }, { n: "Pharmacy sync", ok: false },
  ],
};

const doctor = {
  metrics: [
    { label: "Today's appointments", value: "12", change: null, icon: CalendarCheck },
    { label: "Pending reports", value: "5", change: null, icon: FileText },
    { label: "Total patients", value: "847", change: "+8%", up: true, icon: Users },
    { label: "Average rating", value: "4.8", change: null, icon: Star },
    { label: "Upcoming surgeries", value: "3", change: null, icon: Syringe },
    { label: "Prescriptions written", value: "45", change: "+12%", up: true, icon: Pill },
  ],
  weeklySchedule: [
    { d: "Mon", v: 10 }, { d: "Tue", v: 14 }, { d: "Wed", v: 9 }, { d: "Thu", v: 12 },
    { d: "Fri", v: 15 }, { d: "Sat", v: 6 }, { d: "Sun", v: 2 },
  ],
  demographics: [
    { n: "0–18", v: 120 }, { n: "19–35", v: 260 }, { n: "36–55", v: 310 }, { n: "56+", v: 157 },
  ],
  diagnoses: [
    { d: "Hypertension", v: 132 }, { d: "Diabetes", v: 98 }, { d: "Migraine", v: 76 },
    { d: "Arrhythmia", v: 54 }, { d: "Asthma", v: 41 },
  ],
  outcomes: [
    { m: "Jul", v: 78 }, { m: "Aug", v: 80 }, { m: "Sep", v: 83 }, { m: "Oct", v: 85 },
    { m: "Nov", v: 87 }, { m: "Dec", v: 89 },
  ],
  prescriptionTrend: [
    { m: "Jul", v: 32 }, { m: "Aug", v: 36 }, { m: "Sep", v: 34 }, { m: "Oct", v: 39 },
    { m: "Nov", v: 41 }, { m: "Dec", v: 45 },
  ],
  satisfaction: [
    { subject: "Bedside manner", v: 92 }, { subject: "Wait time", v: 74 },
    { subject: "Clarity", v: 88 }, { subject: "Follow-up", v: 81 }, { subject: "Outcome", v: 90 },
  ],
  schedule: [
    { time: "09:00", name: "Sara Khalid", type: "Follow-up", status: "Waiting" },
    { time: "09:30", name: "Bilal Ahmed", type: "New patient", status: "Waiting" },
    { time: "10:15", name: "Areeba Noor", type: "Lab review", status: "Checked in" },
    { time: "11:00", name: "Hassan Tariq", type: "Follow-up", status: "Scheduled" },
  ],
};

const patient = {
  metrics: [
    { label: "Next appointment", value: "Dec 15", change: null, icon: CalendarCheck },
    { label: "Upcoming appointments", value: "2", change: null, icon: Clock },
    { label: "Active prescriptions", value: "3", change: null, icon: Pill },
    { label: "Lab tests pending", value: "1", change: null, icon: FlaskConical },
    { label: "Medical reports", value: "12", change: null, icon: FileText },
    { label: "Health score", value: "85%", change: null, icon: HeartPulse },
  ],
  healthMetrics: [
    { m: "Feb", weight: 71, bp: 122, sugar: 96 }, { m: "Mar", weight: 70.5, bp: 120, sugar: 94 },
    { m: "Apr", weight: 70, bp: 121, sugar: 97 }, { m: "May", weight: 69.4, bp: 118, sugar: 92 },
    { m: "Jun", weight: 69, bp: 119, sugar: 91 }, { m: "Jul", weight: 68.6, bp: 117, sugar: 90 },
  ],
  apptHistory: [
    { m: "Feb", v: 1 }, { m: "Mar", v: 2 }, { m: "Apr", v: 1 }, { m: "May", v: 0 },
    { m: "Jun", v: 2 }, { m: "Jul", v: 1 },
  ],
  medications: [
    { name: "Metformin 500mg", time: "8:00 AM, 8:00 PM", refill: "12 days left" },
    { name: "Atorvastatin 20mg", time: "9:00 PM", refill: "26 days left" },
    { name: "Losartan 50mg", time: "8:00 AM", refill: "4 days left" },
  ],
  labResults: [
    { t: "Glucose", v: 90 }, { t: "Cholesterol", v: 178 }, { t: "HbA1c", v: 6 }, { t: "Vitamin D", v: 32 },
  ],
  doctorVisits: [
    { d: "Dr. Raza", v: 4 }, { d: "Dr. Iqbal", v: 2 }, { d: "Dr. Farooq", v: 1 },
  ],
  healthTrend: [
    { m: "Feb", v: 74 }, { m: "Mar", v: 76 }, { m: "Apr", v: 78 }, { m: "May", v: 80 },
    { m: "Jun", v: 83 }, { m: "Jul", v: 85 },
  ],
  upcoming: [
    { date: "Dec 15", doctor: "Dr. Amina Raza", type: "Cardiology follow-up" },
    { date: "Dec 22", doctor: "Dr. Sana Iqbal", type: "General check-up" },
  ],
};

const lab = {
  metrics: [
    { label: "Tests today", value: "156", change: "+20%", up: true, icon: FlaskConical },
    { label: "Pending tests", value: "23", change: "-15%", up: false, icon: Clock },
    { label: "Completed tests", value: "133", change: "+18%", up: true, icon: CheckCircle2 },
    { label: "Avg. turnaround", value: "4.2 hrs", change: "-8%", up: false, icon: Activity },
    { label: "Equipment status", value: "12/15", change: null, icon: Beaker },
    { label: "Samples collected", value: "89", change: "+10%", up: true, icon: Package },
  ],
  volumeTrend: [
    { d: "Mon", v: 120 }, { d: "Tue", v: 134 }, { d: "Wed", v: 145 }, { d: "Thu", v: 138 },
    { d: "Fri", v: 156 }, { d: "Sat", v: 92 }, { d: "Sun", v: 40 },
  ],
  testTypes: [
    { n: "Blood work", v: 58 }, { n: "Imaging", v: 22 }, { n: "Pathology", v: 14 }, { n: "Microbiology", v: 6 },
  ],
  turnaround: [
    { m: "Jul", v: 5.1 }, { m: "Aug", v: 4.9 }, { m: "Sep", v: 4.7 }, { m: "Oct", v: 4.5 },
    { m: "Nov", v: 4.4 }, { m: "Dec", v: 4.2 },
  ],
  deptRequests: [
    { d: "Cardiology", v: 44 }, { d: "Oncology", v: 38 }, { d: "Pediatrics", v: 29 },
    { d: "Emergency", v: 52 }, { d: "General", v: 61 },
  ],
  rejectionRate: [
    { m: "Jul", v: 3.2 }, { m: "Aug", v: 2.9 }, { m: "Sep", v: 3.0 }, { m: "Oct", v: 2.5 },
    { m: "Nov", v: 2.3 }, { m: "Dec", v: 2.1 },
  ],
  queue: [
    { id: "LB-2291", test: "CBC panel", patient: "Zara Malik", status: "In progress" },
    { id: "LB-2292", test: "Lipid profile", patient: "Umer Sheikh", status: "Queued" },
    { id: "LB-2293", test: "MRI — Brain", patient: "Nida Farooq", status: "Queued" },
  ],
};

const pharmacy = {
  metrics: [
    { label: "Prescriptions filled", value: "89", change: "+25%", up: true, icon: Pill },
    { label: "Pending orders", value: "12", change: "-30%", up: false, icon: Clock },
    { label: "Inventory value", value: "$245,000", change: null, icon: Package },
    { label: "Low stock items", value: "8", change: null, icon: AlertTriangle },
    { label: "Expiring soon", value: "5", change: null, icon: FileText },
    { label: "Daily revenue", value: "$12,450", change: "+15%", up: true, icon: DollarSign },
  ],
  prescriptionTrend: [
    { w: "W1", v: 62 }, { w: "W2", v: 71 }, { w: "W3", v: 68 }, { w: "W4", v: 89 },
  ],
  categoryDist: [
    { n: "Antibiotics", v: 26 }, { n: "Cardiac", v: 22 }, { n: "Diabetes", v: 18 },
    { n: "Pain relief", v: 20 }, { n: "Other", v: 14 },
  ],
  inventoryStatus: [
    { n: "Antibiotics", v: 82 }, { n: "Cardiac", v: 64 }, { n: "Diabetes", v: 38 },
    { n: "Pain relief", v: 91 }, { n: "Vitamins", v: 55 },
  ],
  revenueTrend: [
    { m: "Jul", v: 9800 }, { m: "Aug", v: 10400 }, { m: "Sep", v: 10900 }, { m: "Oct", v: 11500 },
    { m: "Nov", v: 12000 }, { m: "Dec", v: 12450 },
  ],
  topDrugs: [
    { n: "Metformin", v: 210 }, { n: "Atorvastatin", v: 184 }, { n: "Losartan", v: 156 },
    { n: "Amoxicillin", v: 132 }, { n: "Omeprazole", v: 118 },
  ],
  alerts: [
    { n: "Insulin glargine", left: "6 units left" },
    { n: "Amoxicillin 500mg", left: "14 units left" },
    { n: "Salbutamol inhaler", left: "9 units left" },
  ],
};

/* ---------------------------------- Reusable pieces ---------------------------------- */

function MetricCard({ m }) {
  const Icon = m.icon;
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "0 1px 2px rgba(47,58,64,0.06)",
        borderTop: `3px solid ${C.primary}`,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: C.muted, fontSize: 13, fontWeight: 600, letterSpacing: 0.2 }}>
          {m.label}
        </span>
        <div
          style={{
            width: 32, height: 32, borderRadius: 10, background: C.secondary,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <Icon size={16} color={C.primaryDark} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: numFont, fontSize: 24, fontWeight: 700, color: C.text, fontVariantNumeric: "tabular-nums" }}>
          {m.value}
        </span>
        {m.change && (
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700,
              color: m.up ? C.up : C.down,
            }}
          >
            {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {m.change}
          </span>
        )}
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children, span }) {
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 14,
        padding: "18px 20px 12px",
        boxShadow: "0 1px 2px rgba(47,58,64,0.06)",
        gridColumn: span ? `span ${span}` : undefined,
        minWidth: 0,
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.text }}>{title}</h3>
        {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { borderRadius: 10, border: `1px solid ${C.secondary}`, fontSize: 12, fontFamily: font },
  labelStyle: { color: C.text, fontWeight: 700 },
};

function LineC({ data, xKey, yKey, color = C.primary, unit = "" }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={C.secondary} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.secondary }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${v}${unit}`, ""]} />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AreaC({ data, xKey, yKey, color = C.primary }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={C.secondary} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.secondary }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} fill={`url(#grad-${yKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function BarC({ data, xKey, yKey, color = C.primary, horizontal = false }) {
  return (
    <ResponsiveContainer width="100%" height={horizontal ? Math.max(180, data.length * 42) : 220}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 5, right: 16, left: horizontal ? 10 : -18, bottom: 0 }}
      >
        <CartesianGrid stroke={C.secondary} horizontal={!horizontal} vertical={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={xKey} width={100} tick={{ fontSize: 11, fill: C.text }} axisLine={false} tickLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.secondary }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={yKey} fill={color} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const PIE_COLORS = [C.primary, C.accent, "#B7DCDD", C.primaryDark, C.secondary, "#89A9AB"];

function PieC({ data, nameKey, valueKey, donut = true }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="48%"
          innerRadius={donut ? 52 : 0}
          outerRadius={82}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend
          verticalAlign="bottom"
          height={30}
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ fontSize: 11, color: C.muted }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function RadarC({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data} outerRadius={80}>
        <PolarGrid stroke={C.secondary} />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10.5, fill: C.muted }} />
        <PolarRadiusAxis tick={false} axisLine={false} />
        <Radar dataKey="v" stroke={C.primary} fill={C.accent} fillOpacity={0.5} />
        <Tooltip {...tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function ListPanel({ title, items, render, action }) {
  return (
    <Panel title={title}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it, i) => (
          <div key={i} style={{ paddingBottom: 10, borderBottom: i < items.length - 1 ? `1px solid ${C.secondary}` : "none" }}>
            {render(it)}
          </div>
        ))}
      </div>
      {action}
    </Panel>
  );
}

function QuickActions({ actions }) {
  return (
    <Panel title="Quick actions">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {actions.map((a, i) => (
          <button
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              background: C.bg, border: `1px solid ${C.secondary}`, borderRadius: 10,
              fontFamily: font, fontSize: 13, fontWeight: 600, color: C.text, cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.secondary)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.bg)}
          >
            <a.icon size={15} color={C.primaryDark} />
            {a.label}
            <ChevronRight size={14} color={C.muted} style={{ marginLeft: "auto" }} />
          </button>
        ))}
      </div>
    </Panel>
  );
}

const grid = (cols) => ({
  display: "grid",
  gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
  gap: 16,
});

/* ---------------------------------- Dashboards ---------------------------------- */

function AdminDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={grid(3)} className="responsive-grid-6">
        {admin.metrics.map((m, i) => (
          <MetricCard key={i} m={m} />
        ))}
      </div>
      <div style={grid(2)} className="responsive-grid-2">
        <Panel title="Revenue trend" subtitle="Monthly, in thousands USD">
          <LineC data={admin.revenueTrend} xKey="m" yKey="v" unit="k" />
        </Panel>
        <Panel title="Patient growth" subtitle="Active patients per month">
          <AreaC data={admin.patientGrowth} xKey="m" yKey="v" />
        </Panel>
        <Panel title="Department performance" subtitle="Efficiency score out of 100">
          <BarC data={admin.deptPerf} xKey="d" yKey="v" />
        </Panel>
        <Panel title="Resource utilization" subtitle="Share of total resources">
          <PieC data={admin.resourceUse} nameKey="n" valueKey="v" />
        </Panel>
        <Panel title="Staff distribution" subtitle="Headcount by role">
          <BarC data={admin.staffDist} xKey="r" yKey="v" horizontal color={C.accent} />
        </Panel>
        <Panel title="Appointment trends" subtitle="Monthly appointment volume">
          <BarC data={admin.apptTrend} xKey="m" yKey="v" color={C.primaryDark} />
        </Panel>
      </div>
      <div style={grid(3)} className="responsive-grid-3">
        <ListPanel
          title="Recent activity"
          items={admin.activities}
          render={(a) => (
            <>
              <p style={{ margin: 0, fontSize: 13, color: C.text }}>{a.txt}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11.5, color: C.muted }}>{a.t}</p>
            </>
          )}
        />
        <Panel title="System health">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {admin.systemHealth.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: C.text }}>{s.n}</span>
                <span
                  style={{
                    fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                    color: s.ok ? "#2E6B4E" : "#8C4A32",
                    background: s.ok ? "#E4F1EA" : "#F7E7E1",
                  }}
                >
                  {s.ok ? "Operational" : "Attention"}
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <QuickActions
          actions={[
            { icon: Stethoscope, label: "Add doctor" },
            { icon: UserCog, label: "Add staff" },
            { icon: FileText, label: "Generate report" },
          ]}
        />
      </div>
    </div>
  );
}

function DoctorDashboard({ currentUser }) {
  const patientIds = currentUser?.patients ?? [];
  const filteredSchedule = patientIds.length
    ? doctor.schedule.slice(0, Math.min(patientIds.length, doctor.schedule.length))
    : doctor.schedule;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={grid(3)} className="responsive-grid-6">
        {doctor.metrics.map((m, i) => (
          <MetricCard key={i} m={m} />
        ))}
      </div>
      <div style={grid(2)} className="responsive-grid-2">
        <Panel title="Weekly appointment schedule">
          <BarC data={doctor.weeklySchedule} xKey="d" yKey="v" />
        </Panel>
        <Panel title="Patient demographics" subtitle="By age group">
          <PieC data={doctor.demographics} nameKey="n" valueKey="v" />
        </Panel>
        <Panel title="Common diagnoses" subtitle="Case count, last 90 days">
          <BarC data={doctor.diagnoses} xKey="d" yKey="v" horizontal color={C.accent} />
        </Panel>
        <Panel title="Treatment outcomes" subtitle="Positive outcome rate">
          <LineC data={doctor.outcomes} xKey="m" yKey="v" unit="%" color={C.primaryDark} />
        </Panel>
        <Panel title="Prescription trends" subtitle="Monthly volume">
          <BarC data={doctor.prescriptionTrend} xKey="m" yKey="v" />
        </Panel>
        <Panel title="Patient satisfaction" subtitle="Score by category">
          <RadarC data={doctor.satisfaction} />
        </Panel>
      </div>
      <div style={grid(3)} className="responsive-grid-3">
        <div style={{ gridColumn: "span 2" }} className="responsive-span-2">
          <Panel title="Today's queue">
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filteredSchedule.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "10px 0",
                    borderBottom: i < filteredSchedule.length - 1 ? `1px solid ${C.secondary}` : "none",
                  }}
                >
                  <span style={{ fontFamily: numFont, fontWeight: 700, fontSize: 13, color: C.primaryDark, width: 50 }}>{s.time}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{s.name}</p>
                    <p style={{ margin: 0, fontSize: 11.5, color: C.muted }}>{s.type}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: C.secondary, color: C.primaryDark, flexShrink: 0,
                    }}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <QuickActions
          actions={[
            { icon: Pill, label: "Write prescription" },
            { icon: FileText, label: "View patient history" },
            { icon: Syringe, label: "Schedule surgery" },
          ]}
        />
      </div>
    </div>
  );
}

function PatientDashboard({ currentUser }) {
  console.log('PatientDashboard component mounted');
  const { user } = useAuth();
  console.log('Auth user:', user);
  const [, navigate] = useLocation();
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [healthReadings, setHealthReadings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddReadingModal, setShowAddReadingModal] = useState(false);
  const [newFamilyMember, setNewFamilyMember] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    bloodGroup: '',
    gender: '',
  });

  useEffect(() => {
    console.log('User effect triggered, user:', user);
    const userId = user?._id || user?.id;
    console.log('Extracted userId:', userId);
    if (userId) {
      console.log('Calling loadProfiles');
      loadProfiles();
      loadNotifications();
    } else {
      console.log('No userId available, skipping loadProfiles');
    }
  }, [user]);

  useEffect(() => {
    console.log('Active profile changed:', activeProfile);
    if (activeProfile?._id) {
      loadHealthReadings(activeProfile._id);
      loadReports(activeProfile._id);
    }
  }, [activeProfile]);

  // Refresh health readings when component mounts or when user navigates back
  useEffect(() => {
    if (activeProfile?._id) {
      loadHealthReadings(activeProfile._id);
    }
  }, []);

  const loadProfiles = async () => {
    console.log('loadProfiles called');
    try {
      const userId = user?._id || user?.id;
      console.log('Loading profiles for user:', userId);
      if (!userId) {
        console.error('User ID is undefined');
        return;
      }
      const data = await patientProfilesApi.getAll(userId);
      console.log('Profiles API response:', data);
      if (data.patientProfiles) {
        console.log('Setting profiles:', data.patientProfiles);
        setProfiles(data.patientProfiles);
        setActiveProfile(data.patientProfiles[0]);
        console.log('Active profile set to:', data.patientProfiles[0]);
      } else {
        console.log('No patientProfiles in response');
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const loadHealthReadings = async (profileId) => {
    try {
      // Get readings for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const data = await healthReadingsApi.getByProfile(profileId, {
        startDate: thirtyDaysAgo.toISOString(),
      });
      console.log('Health readings API response:', data);
      if (data.readings) {
        setHealthReadings(data.readings);
        console.log('Health readings set:', data.readings);
      } else {
        console.log('No readings in response');
      }
    } catch (error) {
      console.error('Failed to load health readings:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        console.log('No user ID available for notifications');
        return;
      }
      const data = await notificationsApi.getByUser(userId);
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadReports = async (profileId) => {
    try {
      console.log('Loading reports for profileId:', profileId);
      const data = await reportsApi.getFolders(profileId);
      console.log('Reports API response:', data);
      if (data) {
        const allReports = Object.values(data).flatMap(folder => folder.reports || []);
        console.log('Flattened reports:', allReports);
        console.log('Number of reports:', allReports.length);
        setReports(allReports);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleReportUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeProfile?._id) return;

    setUploadingReport(true);
    try {
      console.log('Uploading report:', file.name);
      // Upload to Cloudinary
      const cloudinaryResult = await reportsApi.uploadToCloudinary(file);
      console.log('Cloudinary result:', cloudinaryResult);
      
      const reportData = {
        title: file.name.split('.')[0],
        profileId: activeProfile._id,
        fileUrl: cloudinaryResult.fileUrl,
        publicId: cloudinaryResult.publicId,
        fileName: file.name,
        fileType: file.name.split('.').pop(),
        fileSize: file.size,
        extractedText: '', // You may want to add OCR later
      };

      console.log('Sending report data:', reportData);
      const result = await reportsApi.upload(reportData);
      console.log('Upload result:', result);
      
      if (result.success || result.report) {
        loadReports(activeProfile._id);
        alert('Report uploaded and analyzed successfully!');
      } else {
        alert('Failed to upload report: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to upload report:', error);
      alert('Failed to upload report: ' + error.message);
    } finally {
      setUploadingReport(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    try {
      const userId = user?._id || user?.id;
      console.log('Current user:', user);
      console.log('User ID being used:', userId);
      
      const profileData = {
        ...newFamilyMember,
        userId: userId,
        relationship: newFamilyMember.relationship.toLowerCase(),
        gender: newFamilyMember.gender.toLowerCase(),
      };

      console.log('Creating family member with data:', profileData);
      const result = await patientProfilesApi.create(profileData);
      console.log('Create result:', result);
      
      if (result.patientProfile || result.success) {
        loadProfiles();
        setShowAddFamilyModal(false);
        setNewFamilyMember({
          name: '',
          relationship: '',
          dateOfBirth: '',
          bloodGroup: '',
          gender: '',
        });
        alert('Family member added successfully!');
      } else {
        alert('Failed to add family member: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to add family member:', error);
      alert('Failed to add family member: ' + error.message);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getLatestReadingByType = (type) => {
    return healthReadings.find(r => r.type === type);
  };

  // Transform health readings data for chart display
  const getHealthMetricsChartData = () => {
    if (!healthReadings || healthReadings.length === 0) {
      return [];
    }

    console.log('Health readings for chart:', healthReadings);

    // Get unique dates from readings (by day, not month)
    const readingsByDate = {};
    
    healthReadings.forEach(reading => {
      const date = new Date(reading.measuredAt);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!readingsByDate[dateKey]) {
        readingsByDate[dateKey] = {
          m: dateKey,
          weight: null,
          bp: null,
          sugar: null,
          bmi: null,
        };
      }

      if (reading.type === 'weight' && reading.value) {
        readingsByDate[dateKey].weight = reading.value;
      } else if (reading.type === 'blood_pressure' && reading.systolic) {
        readingsByDate[dateKey].bp = reading.systolic;
      } else if (reading.type === 'blood_sugar' && reading.value) {
        readingsByDate[dateKey].sugar = reading.value;
      } else if (reading.type === 'bmi' && reading.value) {
        readingsByDate[dateKey].bmi = reading.value;
      }
    });

    console.log('Chart data:', Object.values(readingsByDate));

    // Convert to array and sort by date
    return Object.values(readingsByDate).sort((a, b) => {
      const dateA = new Date(a.m);
      const dateB = new Date(b.m);
      return dateA - dateB;
    });
  };

  const doctorNames = {
    doc1: "Dr. Sarah Johnson", doc2: "Dr. Michael Chen",
    doc3: "Dr. Emily Rodriguez", doc4: "Dr. James Wilson",
  };
  const myDoctor = currentUser?.doctorId ? doctorNames[currentUser.doctorId] ?? "Assigned Doctor" : "Assigned Doctor";
  const myCondition = currentUser?.condition;

  const personalizedUpcoming = currentUser
    ? [
        { date: "Dec 15", doctor: myDoctor, type: myCondition ? `${myCondition} follow-up` : "Follow-up" },
        { date: "Dec 22", doctor: myDoctor, type: "General check-up" },
      ]
    : patient.upcoming;

  // Dynamic metrics based on real data
  const dynamicMetrics = [
    { label: "Medical Reports", value: reports.length.toString(), change: null, icon: FileText },
    { label: "Upcoming Appointments", value: "2", change: null, icon: CalendarCheck },
    { label: "Lab Bookings", value: "1", change: null, icon: FlaskConical },
    { label: "Active Prescriptions", value: "3", change: null, icon: Pill },
    { label: "Medicine Orders", value: "2", change: null, icon: Package },
    { label: "Recent Readings", value: healthReadings.length.toString(), change: null, icon: ActivityIcon },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header with Profile Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.text }}>
            Welcome back, {user?.name || 'Patient'}!
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        {/* Profile Switcher */}
        {profiles.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Viewing:</span>
            <select
              value={activeProfile?._id}
              onChange={(e) => setActiveProfile(profiles.find(p => p._id === e.target.value))}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: `1.5px solid ${C.secondary}`,
                background: C.card,
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
                cursor: "pointer",
              }}
            >
              {profiles.map(profile => (
                <option key={profile._id} value={profile._id}>
                  {profile.name} ({profile.relationship})
                </option>
              ))}
            </select>
            <button
              onClick={() => {/* TODO: Open add profile modal */}}
              style={{
                padding: "8px",
                borderRadius: 8,
                border: `1.5px solid ${C.secondary}`,
                background: C.card,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserPlus size={16} color={C.primaryDark} />
            </button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div style={grid(3)} className="responsive-grid-6">
        {dynamicMetrics.map((m, i) => (
          <MetricCard key={i} m={m} />
        ))}
      </div>

      {/* Quick Actions */}
      <div style={grid(6)} className="responsive-grid-6">
        <QuickActions
          actions={[
            { 
              icon: Upload, 
              label: "Upload Report",
              onClick: () => setShowUploadModal(true)
            },
            { icon: CalendarCheck, label: "Book Appointment" },
            { icon: FlaskConical, label: "Book Lab Test" },
            { icon: Pill, label: "Order Medicines" },
            { icon: ActivityIcon, label: "Add Reading", onClick: () => setShowAddReadingModal(true) },
            { icon: UserPlus, label: "Add Family Member", onClick: () => setShowAddFamilyModal(true) },
          ]}
        />
      </div>

      {/* Medical Reports Panel */}
      <Panel title="Medical Reports" subtitle="AI-analyzed reports">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
            You have {reports.length} report(s) uploaded
          </p>
          <button
            onClick={() => navigate('/medical-reports')}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: `1.5px solid ${C.primary}`,
              background: "transparent",
              color: C.primary,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.primary; }}
          >
            View All Reports
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 250, overflowY: "auto" }}>
          {reports.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, color: C.muted, textAlign: "center", padding: 20 }}>
              No reports uploaded yet. Click "Upload Report" to add your first report.
            </p>
          ) : (
            reports.slice(0, 3).map((report) => (
              <div
                key={report._id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${C.secondary}`,
                  background: C.card,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => navigate('/medical-reports')}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{report.title}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: C.muted }}>{report.category}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 12,
                      background: report.aiOverallStatus === 'Normal' ? '#E4F1EA' : 
                                 report.aiOverallStatus === 'Needs Attention' ? '#FFF4E5' :
                                 report.aiOverallStatus === 'Concerning' ? '#FEE2E2' : '#FECACA',
                      color: report.aiOverallStatus === 'Normal' ? '#2E6B4E' :
                             report.aiOverallStatus === 'Needs Attention' ? '#92400E' :
                             report.aiOverallStatus === 'Concerning' ? '#991B1B' : '#7F1D1D',
                    }}
                  >
                    {report.aiOverallStatus || 'Normal'}
                  </span>
                </div>
                {report.aiSummary && (
                  <p style={{ margin: "8px 0 0", fontSize: 11, color: C.muted, lineHeight: 1.4 }}>
                    {report.aiSummary.substring(0, 80)}...
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </Panel>

      {/* Health Monitoring & Medical Reports */}
      <div style={grid(2)} className="responsive-grid-2">
        <Panel title="Health metrics over time" subtitle="Weight (kg), BP (systolic), sugar (mg/dL)">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={getHealthMetricsChartData()} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={C.secondary} vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.secondary }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: C.muted }}>{v}</span>} />
              <Line type="monotone" dataKey="weight" name="Weight" stroke={C.primary} strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
              <Line type="monotone" dataKey="bp" name="Blood pressure" stroke={C.primaryDark} strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
              <Line type="monotone" dataKey="sugar" name="Sugar" stroke="#C9A24E" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        {/* Current Health Readings */}
        <Panel title="Current Health Readings" subtitle="Latest recorded values">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(() => {
              const bpReading = getLatestReadingByType('blood_pressure');
              const sugarReading = getLatestReadingByType('blood_sugar');
              const weightReading = getLatestReadingByType('weight');
              const bmiReading = getLatestReadingByType('bmi');

              return (
                <>
                  {/* Blood Pressure */}
                  <div style={{ padding: 12, borderRadius: 8, background: C.secondary, border: `1px solid ${C.secondary}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <HeartPulse size={16} color={C.primaryDark} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Blood Pressure</span>
                    </div>
                    {bpReading ? (
                      <div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
                          {bpReading.systolic}/{bpReading.diastolic}
                        </span>
                        <span style={{ fontSize: 12, color: C.muted, marginLeft: 4 }}>mmHg</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: C.muted }}>No reading recorded</span>
                    )}
                  </div>

                  {/* Blood Sugar */}
                  <div style={{ padding: 12, borderRadius: 8, background: C.secondary, border: `1px solid ${C.secondary}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Droplet size={16} color="#C9A24E" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Blood Sugar</span>
                    </div>
                    {sugarReading ? (
                      <div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
                          {sugarReading.value}
                        </span>
                        <span style={{ fontSize: 12, color: C.muted, marginLeft: 4 }}>{sugarReading.unit}</span>
                        {sugarReading.mealContext && (
                          <span style={{ fontSize: 10, color: C.muted, marginLeft: 8 }}>
                            ({sugarReading.mealContext})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: C.muted }}>No reading recorded</span>
                    )}
                  </div>

                  {/* Weight */}
                  <div style={{ padding: 12, borderRadius: 8, background: C.secondary, border: `1px solid ${C.secondary}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Scale size={16} color={C.primary} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Weight</span>
                    </div>
                    {weightReading ? (
                      <div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
                          {weightReading.value}
                        </span>
                        <span style={{ fontSize: 12, color: C.muted, marginLeft: 4 }}>{weightReading.unit}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: C.muted }}>No reading recorded</span>
                    )}
                  </div>

                  {/* BMI */}
                  <div style={{ padding: 12, borderRadius: 8, background: C.secondary, border: `1px solid ${C.secondary}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Activity size={16} color={C.accent} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>BMI</span>
                    </div>
                    {bmiReading ? (
                      <div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
                          {bmiReading.value}
                        </span>
                        <span style={{ fontSize: 12, color: C.muted, marginLeft: 4 }}>{bmiReading.unit}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: C.muted }}>No reading recorded</span>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </Panel>
      </div>

      {/* AI Health Insights */}
      <Panel title="AI Health Insights" subtitle="Powered by AI analysis">
        <div style={{ padding: 16, background: "#F0F7F9", borderRadius: 12, border: `1px solid ${C.secondary}` }}>
          <p style={{ margin: 0, fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 8 }}>
            📊 Health Summary
          </p>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: C.muted }}>
            Based on your recent health readings, your blood pressure and blood sugar levels are within normal ranges. 
            Continue maintaining your current lifestyle and medication schedule.
          </p>
          <p style={{ margin: 0, fontSize: 11, color: C.primaryDark, fontStyle: "italic" }}>
            ⚠️ Disclaimer: AI insights are for informational purposes only and should not replace professional medical advice.
          </p>
        </div>
      </Panel>

      {/* Family Profiles */}
      <Panel title="Family Profiles" subtitle="Manage your family members">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {profiles.map(profile => (
            <div
              key={profile._id}
              style={{
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${C.secondary}`,
                background: C.card,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => setActiveProfile(profile)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.primaryDark }}>
                    {profile.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{profile.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{profile.relationship}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, fontSize: 11, color: C.muted }}>
                <span>Blood: {profile.bloodGroup}</span>
                <span>Age: {calculateAge(profile.dateOfBirth)}</span>
              </div>
            </div>
          ))}
          <button
            onClick={() => setShowAddFamilyModal(true)}
            style={{
              padding: 16,
              borderRadius: 12,
              border: `1.5px dashed ${C.secondary}`,
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              color: C.muted,
            }}
          >
            <UserPlus size={24} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Add Family Member</span>
          </button>
        </div>
      </Panel>

      {/* Notifications & Emergency Info */}
      <div style={grid(2)} className="responsive-grid-2">
        <ListPanel
          title="Notifications"
          items={notifications.slice(0, 5)}
          render={(n) => (
            <>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{n.title}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11.5, color: C.muted }}>{n.message}</p>
            </>
          )}
        />
        <Panel title="Emergency Information" subtitle="Quick access to critical info">
          {activeProfile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>BLOOD GROUP</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>{activeProfile.bloodGroup}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>ALLERGIES</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {activeProfile.allergies?.length > 0 ? (
                    activeProfile.allergies.map((allergy, i) => (
                      <span key={i} style={{ padding: "4px 8px", borderRadius: 12, background: "#F7E7E1", color: "#8C4A32", fontSize: 11, fontWeight: 600 }}>
                        {allergy}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: 12, color: C.muted }}>No known allergies</span>
                  )}
                </div>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>MEDICAL CONDITIONS</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {activeProfile.medicalConditions?.length > 0 ? (
                    activeProfile.medicalConditions.map((condition, i) => (
                      <span key={i} style={{ padding: "4px 8px", borderRadius: 12, background: "#E4F1EA", color: "#2E6B4E", fontSize: 11, fontWeight: 600 }}>
                        {condition}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: 12, color: C.muted }}>No known conditions</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* Upcoming Appointments */}
      <div style={grid(3)} className="responsive-grid-3">
        <ListPanel
          title="Upcoming appointments"
          items={personalizedUpcoming}
          render={(u) => (
            <>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{u.type}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11.5, color: C.muted }}>{u.doctor} · {u.date}</p>
            </>
          )}
        />
        <Panel title="Medication reminder">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {patient.medications.map((med, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Pill size={15} color={C.primaryDark} />
                <div>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: C.text }}>{med.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{med.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Lab test results" subtitle="Recent test results">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {reports.slice(0, 3).map((report) => (
              <div key={report._id} style={{ padding: 8, borderRadius: 6, background: C.secondary, border: `1px solid ${C.secondary}` }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.text }}>{report.title}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{report.category}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Add Family Member Modal */}
      {showAddFamilyModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowAddFamilyModal(false)}
        >
          <div
            style={{
              background: C.card,
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: C.text }}>
              Add Family Member
            </h3>
            <form onSubmit={handleAddFamilyMember} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newFamilyMember.name}
                  onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${C.secondary}`,
                    background: C.bg,
                    color: C.text,
                    fontSize: 13,
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>
                  Relationship *
                </label>
                <select
                  required
                  value={newFamilyMember.relationship}
                  onChange={(e) => setNewFamilyMember({ ...newFamilyMember, relationship: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${C.secondary}`,
                    background: C.bg,
                    color: C.text,
                    fontSize: 13,
                  }}
                >
                  <option value="">Select relationship</option>
                  <option value="self">Self</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={newFamilyMember.dateOfBirth}
                  onChange={(e) => setNewFamilyMember({ ...newFamilyMember, dateOfBirth: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${C.secondary}`,
                    background: C.bg,
                    color: C.text,
                    fontSize: 13,
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>
                  Blood Group
                </label>
                <select
                  value={newFamilyMember.bloodGroup}
                  onChange={(e) => setNewFamilyMember({ ...newFamilyMember, bloodGroup: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${C.secondary}`,
                    background: C.bg,
                    color: C.text,
                    fontSize: 13,
                  }}
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>
                  Gender
                </label>
                <select
                  value={newFamilyMember.gender}
                  onChange={(e) => setNewFamilyMember({ ...newFamilyMember, gender: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${C.secondary}`,
                    background: C.bg,
                    color: C.text,
                    fontSize: 13,
                  }}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAddFamilyModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 8,
                    border: `1.5px solid ${C.secondary}`,
                    background: 'transparent',
                    color: C.text,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 8,
                    border: 'none',
                    background: C.primary,
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Report Modal */}
      <QuickActionUploadReport
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        profileId={activeProfile?._id}
        onSuccess={() => {
          loadReports(activeProfile._id);
        }}
      />

      {/* Add Health Reading Modal */}
      <AddHealthReadingModal
        isOpen={showAddReadingModal}
        onClose={() => setShowAddReadingModal(false)}
        profileId={activeProfile?._id}
        onAdd={() => {
          loadHealthReadings(activeProfile._id);
        }}
      />
    </div>
  );
}

function LabDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={grid(3)} className="responsive-grid-6">
        {lab.metrics.map((m, i) => (
          <MetricCard key={i} m={m} />
        ))}
      </div>
      <div style={grid(2)} className="responsive-grid-2">
        <Panel title="Test volume trend" subtitle="Daily test count">
          <BarC data={lab.volumeTrend} xKey="d" yKey="v" />
        </Panel>
        <Panel title="Test types distribution">
          <PieC data={lab.testTypes} nameKey="n" valueKey="v" />
        </Panel>
        <Panel title="Turnaround time" subtitle="Average hours per test">
          <LineC data={lab.turnaround} xKey="m" yKey="v" unit="h" color={C.primaryDark} />
        </Panel>
        <Panel title="Department requests" subtitle="Requests by department">
          <BarC data={lab.deptRequests} xKey="d" yKey="v" horizontal color={C.accent} />
        </Panel>
        <Panel title="Rejection rate" subtitle="% of samples rejected">
          <LineC data={lab.rejectionRate} xKey="m" yKey="v" unit="%" color={C.down} />
        </Panel>
        <Panel title="Equipment maintenance">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { n: "Centrifuge A", s: "Operational" },
              { n: "Hematology analyzer", s: "Operational" },
              { n: "MRI scanner 2", s: "Maintenance due" },
            ].map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: C.text }}>{e.n}</span>
                <span
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                    color: e.s === "Operational" ? "#2E6B4E" : "#8C4A32",
                    background: e.s === "Operational" ? "#E4F1EA" : "#F7E7E1",
                  }}
                >
                  {e.s}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div style={grid(3)} className="responsive-grid-3">
        <div style={{ gridColumn: "span 2" }} className="responsive-span-2">
          <Panel title="Test queue">
            <div style={{ display: "flex", flexDirection: "column" }}>
              {lab.queue.map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < lab.queue.length - 1 ? `1px solid ${C.secondary}` : "none" }}>
                  <span style={{ fontFamily: numFont, fontSize: 12, fontWeight: 700, color: C.primaryDark, width: 70 }}>{q.id}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{q.test}</p>
                    <p style={{ margin: 0, fontSize: 11.5, color: C.muted }}>{q.patient}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: C.secondary, color: C.primaryDark }}>{q.status}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <QuickActions
          actions={[
            { icon: FlaskConical, label: "Log test" },
            { icon: Package, label: "Update sample status" },
            { icon: FileText, label: "Generate report" },
          ]}
        />
      </div>
    </div>
  );
}

function PharmacyDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={grid(3)} className="responsive-grid-6">
        {pharmacy.metrics.map((m, i) => (
          <MetricCard key={i} m={m} />
        ))}
      </div>
      <div style={grid(2)} className="responsive-grid-2">
        <Panel title="Prescription trends" subtitle="Weekly volume">
          <BarC data={pharmacy.prescriptionTrend} xKey="w" yKey="v" />
        </Panel>
        <Panel title="Medication category distribution">
          <PieC data={pharmacy.categoryDist} nameKey="n" valueKey="v" />
        </Panel>
        <Panel title="Inventory status" subtitle="% of target stock level">
          <BarC data={pharmacy.inventoryStatus} xKey="n" yKey="v" horizontal color={C.accent} />
        </Panel>
        <Panel title="Revenue trend" subtitle="Monthly revenue, USD">
          <LineC data={pharmacy.revenueTrend} xKey="m" yKey="v" color={C.primaryDark} />
        </Panel>
        <Panel title="Top prescribed drugs" subtitle="Units dispensed">
          <BarC data={pharmacy.topDrugs} xKey="n" yKey="v" horizontal />
        </Panel>
        <Panel title="Low stock alerts">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pharmacy.alerts.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <AlertTriangle size={15} color={C.down} />
                <div>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: C.text }}>{a.n}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{a.left}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div style={grid(3)} className="responsive-grid-3">
        <Panel title="Expiry tracking">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { n: "Amoxicillin 500mg", d: "Expires in 12 days" },
              { n: "Insulin glargine", d: "Expires in 20 days" },
              { n: "Ibuprofen 400mg", d: "Expires in 28 days" },
            ].map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: C.text }}>{e.n}</span>
                <span style={{ fontSize: 11.5, color: C.muted }}>{e.d}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Order management">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { n: "PO-1042 — Cardiac line", s: "In transit" },
              { n: "PO-1043 — Antibiotics", s: "Pending approval" },
            ].map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: C.text }}>{o.n}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: C.secondary, color: C.primaryDark }}>{o.s}</span>
              </div>
            ))}
          </div>
        </Panel>
        <QuickActions
          actions={[
            { icon: Pill, label: "Process prescription" },
            { icon: Package, label: "Order stock" },
            { icon: ClipboardList, label: "Update inventory" },
          ]}
        />
      </div>
    </div>
  );
}

/* ---------------------------------- App shell ---------------------------------- */

const ROLE_META = {
  admin:    { label: "Admin",    icon: LayoutDashboard },
  doctor:   { label: "Doctor",   icon: Stethoscope },
  patient:  { label: "Patient",  icon: HeartPulse },
  lab:      { label: "Lab",      icon: FlaskConical },
  pharmacy: { label: "Pharmacy", icon: Pill },
};

function greetingFor(user) {
  if (user.role === "admin") return "Facility overview";
  if (user.role === "lab") return user.name + " — Diagnostics";
  if (user.role === "pharmacy") return user.name + " — Pharmacy";
  return user.name;
}

function subtitleFor(user) {
  if (user.role === "doctor" && user.specialization) return `${ROLE_META[user.role].label} · ${user.specialization}`;
  if (user.role === "patient" && user.condition) return `Patient · ${user.condition}`;
  return ROLE_META[user.role].label + " dashboard";
}

export default function HealthcarePlatform({ currentUser }) {
  const { logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const role = currentUser.role;
  const meta = ROLE_META[role];
  const Icon = meta.icon;

  const dashboards = {
    admin:    <AdminDashboard />,
    doctor:   <DoctorDashboard currentUser={currentUser} />,
    patient:  <PatientDashboard currentUser={currentUser} />,
    lab:      <LabDashboard />,
    pharmacy: <PharmacyDashboard />,
  };

  const initials = currentUser.name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  return (
    <div style={{ fontFamily: font, background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 980px) {
          .responsive-grid-2 { grid-template-columns: 1fr !important; }
          .responsive-grid-6 { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
          .responsive-grid-3 { grid-template-columns: 1fr !important; }
          .responsive-span-2 { grid-column: span 1 !important; }
          .sidebar-fixed { transform: translateX(-100%); position: fixed !important; height: 100vh; }
          .sidebar-fixed.open { transform: translateX(0); }
        }
        @media (max-width: 560px) {
          .responsive-grid-6 { grid-template-columns: 1fr !important; }
        }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 980px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      <div style={{ display: "flex" }}>
        <aside
          className={`sidebar-fixed${navOpen ? " open" : ""}`}
          style={{
            width: 220, flexShrink: 0, background: C.card, minHeight: "100vh",
            padding: "22px 14px", position: "sticky", top: 0, alignSelf: "flex-start",
            borderRight: `1px solid ${C.secondary}`, transition: "transform .25s ease", zIndex: 20,
            display: "flex", flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 22px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HeartPulse size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15.5, color: C.text }}>Vitalis</span>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <button
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 10, border: "none", cursor: "default", fontFamily: font,
                fontSize: 13.5, fontWeight: 700, textAlign: "left",
                background: C.primary, color: "#fff",
              }}
            >
              <Icon size={17} />
              {meta.label}
            </button>
          </nav>

          <div style={{ marginTop: 18, padding: "12px", borderRadius: 12, background: C.secondary }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.primaryDark, fontWeight: 600 }}>ID: {currentUser.id}</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: "12px", borderRadius: 12, background: C.secondary }}>
            <ShieldCheck size={16} color={C.primaryDark} />
            <p style={{ margin: "6px 0 0", fontSize: 11.5, color: C.primaryDark, fontWeight: 600, lineHeight: 1.5 }}>
              HIPAA-compliant · encrypted at rest.
            </p>
          </div>

          <button
            onClick={logout}
            style={{
              marginTop: "auto", display: "flex", alignItems: "center", gap: 8,
              padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.secondary}`,
              background: "transparent", fontFamily: font, fontSize: 13, fontWeight: 700,
              color: C.muted, cursor: "pointer", width: "100%", marginBottom: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.secondary; e.currentTarget.style.color = C.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.muted; }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>
          <header
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 24px", background: C.card, borderBottom: `1px solid ${C.secondary}`,
              position: "sticky", top: 0, zIndex: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => setNavOpen((v) => !v)}
                className="mobile-menu-btn"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                aria-label="Toggle menu"
              >
                {navOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <p style={{ margin: 0, fontSize: 11.5, color: C.muted, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase" }}>
                  {subtitleFor(currentUser)}
                </p>
                <h1 style={{ margin: "2px 0 0", fontSize: 19, fontWeight: 800, color: C.text }}>{greetingFor(currentUser)}</h1>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Search size={15} color={C.muted} style={{ position: "absolute", left: 10 }} />
                <input
                  placeholder="Search..."
                  style={{
                    padding: "8px 12px 8px 32px", borderRadius: 10, border: `1px solid ${C.secondary}`,
                    background: C.bg, fontSize: 13, fontFamily: font, width: 170, color: C.text, outline: "none",
                  }}
                />
              </div>
              <button style={{ position: "relative", background: C.bg, border: `1px solid ${C.secondary}`, borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={16} color={C.muted} />
                <span style={{ position: "absolute", top: 6, right: 7, width: 7, height: 7, borderRadius: "50%", background: C.down }} />
              </button>
              <div
                style={{
                  width: 36, height: 36, borderRadius: "50%", background: C.primary,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}
              >
                {initials}
              </div>
            </div>
          </header>

          <div style={{ padding: 24 }}>{dashboards[role]}</div>
        </main>
      </div>
    </div>
  );
}