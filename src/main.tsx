import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ALPHA SYSTEM: Sovereign Ledger Security Protocol
console.log('%c ALPHA SYSTEM: UNAUTHORIZED ACCESS ATTEMPT LOGGED ', 'background: #1a1a2e; color: #f59e0b; font-weight: bold; padding: 8px 12px; border-radius: 4px;');
console.log('%c Republic of Capital | Alpha Business Cooperative Production v1.0 ', 'background: #0f172a; color: #10b981; font-size: 10px; padding: 4px 8px;');

// ═══════════════════════════════════════════════════════════════════════════════
// UNIVERSAL SECURITY CONSOLE GUARD - Institutional Sovereign Shield
// ═══════════════════════════════════════════════════════════════════════════════
// Performance-safe delayed execution: Fires AFTER app is fully loaded
// Single-fire execution with no memory leaks or CPU overhead
// ═══════════════════════════════════════════════════════════════════════════════
setTimeout(() => {
  console.clear();
  console.log(
    '%c ☢️ SYSTEM OVERRIDE: UNAUTHORIZED ANALYSIS DETECTED ☢️ %c\n' +
    '%c 🚨 COUNTER-MEASURES ACTIVE: MONITORING SESSION DATA... 🚨 %c\n\n' +
    '%c[!] INCIDENT ID: ' + Math.floor(Math.random() * 1000000) + '\n' +
    '[!] ACCESS LOGGED: ' + new Date().toLocaleString() + '\n' +
    '[!] DEVICE SIGNATURE: CAPTURED\n' +
    '[!] PROTOCOL: SECURITY AUDIT INITIATED\n\n' +
    'This application is protected by an Institutional Sovereign Shield.\n' +
    'Attempting to decompile or inspect source code is a violation of the \n' +
    'Service Level Agreement and has been flagged for administrative review.\n\n' +
    '%c CLOSE THIS WINDOW IMMEDIATELY TO HALT TRACING %c',
    'color: #000; background: #FFD700; font-size: 22px; font-weight: bold; padding: 10px; border-radius: 4px;',
    '',
    'color: #FF3131; font-size: 16px; font-weight: bold; text-decoration: underline;',
    '',
    'color: #888; font-size: 13px; font-family: monospace;',
    'color: #FFF; background: #FF0000; font-size: 16px; font-weight: bold; padding: 8px; border: 2px solid #FFF;',
    ''
  );
}, 2500);

createRoot(document.getElementById("root")!).render(<App />);
