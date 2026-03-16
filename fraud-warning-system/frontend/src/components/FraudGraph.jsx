import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const EMPLOYEES = [
  { id: "EMP001", name: "Marcus T.", x: 200, y: 150, risk: 85, dept: "Loans" },
  { id: "EMP002", name: "Priya S.", x: 450, y: 100, risk: 30, dept: "CS" },
  {
    id: "EMP003",
    name: "David C.",
    x: 650,
    y: 200,
    risk: 92,
    dept: "Treasury",
  },
  { id: "EMP004", name: "Lisa R.", x: 150, y: 320, risk: 78, dept: "IT Admin" },
  {
    id: "EMP005",
    name: "James O.",
    x: 500,
    y: 320,
    risk: 45,
    dept: "Compliance",
  },
];

const ACCOUNTS = [
  { id: "ACC001", name: "Account #1092", x: 320, y: 230 },
  { id: "ACC002", name: "Account #4521", x: 550, y: 150 },
  { id: "ACC003", name: "Account #7832", x: 380, y: 350 },
  { id: "ACC004", name: "Account #2214", x: 250, y: 400 },
];

const CONNECTIONS = [
  { from: "EMP001", to: "ACC001", suspicious: true },
  { from: "EMP001", to: "ACC002", suspicious: true },
  { from: "EMP003", to: "ACC002", suspicious: true },
  { from: "EMP002", to: "ACC001", suspicious: false },
  { from: "EMP004", to: "ACC003", suspicious: true },
  { from: "EMP005", to: "ACC003", suspicious: false },
  { from: "EMP005", to: "ACC004", suspicious: false },
];

const getNodeById = (id) => {
  return [...EMPLOYEES, ...ACCOUNTS].find((n) => n.id === id);
};

const getRiskColor = (risk) => {
  if (risk >= 80) return "#ef4444";
  if (risk >= 60) return "#f97316";
  if (risk >= 40) return "#eab308";
  return "#22c55e";
};

export default function FraudGraph() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">
            Employee-Account Network Graph
          </h3>
          <p className="text-slate-500 text-sm">
            Relationship mapping for suspicious activity detection
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-red-500" />
            <span className="text-slate-400">Suspicious</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-slate-500" />
            <span className="text-slate-400">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500/50 border border-blue-400" />
            <span className="text-slate-400">Employee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-500/50 border border-purple-400" />
            <span className="text-slate-400">Account</span>
          </div>
        </div>
      </div>
      <div
        className="relative bg-dark-900/50 rounded-xl overflow-hidden"
        style={{ height: 380 }}
      >
        <svg width="100%" height="100%" viewBox="0 0 800 450">
          {/* Grid */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1e2d4d"
                strokeWidth="0.5"
              />
            </pattern>
            <filter id="glow-red">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="800" height="450" fill="url(#grid)" />

          {/* Connections */}
          {CONNECTIONS.map((conn, i) => {
            const from = getNodeById(conn.from);
            const to = getNodeById(conn.to);
            if (!from || !to) return null;
            return (
              <g key={i}>
                <line
                  x1={from.x}
                  y1={from.y + 10}
                  x2={to.x}
                  y2={to.y + 10}
                  stroke={conn.suspicious ? "#ef4444" : "#334155"}
                  strokeWidth={conn.suspicious ? 2 : 1}
                  strokeDasharray={conn.suspicious ? "5,3" : "none"}
                  strokeOpacity={0.7}
                />
              </g>
            );
          })}

          {/* Account Nodes */}
          {ACCOUNTS.map((acc) => (
            <g key={acc.id} transform={`translate(${acc.x - 40}, ${acc.y})`}>
              <rect
                x={0}
                y={0}
                width={80}
                height={28}
                rx={6}
                fill="rgba(139, 92, 246, 0.15)"
                stroke="rgba(139, 92, 246, 0.5)"
                strokeWidth={1.5}
              />
              <text
                x={40}
                y={14}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#a78bfa"
                fontSize={10}
                fontFamily="monospace"
              >
                {acc.name}
              </text>
            </g>
          ))}

          {/* Employee Nodes */}
          {EMPLOYEES.map((emp) => {
            const color = getRiskColor(emp.risk || 0);
            return (
              <g key={emp.id}>
                <circle
                  cx={emp.x}
                  cy={emp.y}
                  r={24}
                  fill={`${color}20`}
                  stroke={color}
                  strokeWidth={2}
                  filter={emp.risk >= 75 ? "url(#glow-red)" : undefined}
                />
                <text
                  x={emp.x}
                  y={emp.y - 3}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={9}
                  fontWeight="bold"
                >
                  {emp.name}
                </text>
                <text
                  x={emp.x}
                  y={emp.y + 9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={color}
                  fontSize={8}
                >
                  {emp.risk}%
                </text>
                {emp.risk >= 75 && (
                  <circle
                    cx={emp.x + 18}
                    cy={emp.y - 18}
                    r={6}
                    fill="#ef4444"
                    opacity={0.9}
                  >
                    <animate
                      attributeName="opacity"
                      values="1;0.3;1"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </motion.div>
  );
}
