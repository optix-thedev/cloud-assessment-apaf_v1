import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   CLOUD ADOPTION ASSESSMENT — PUBLIC WEBSITE
   White-label ready · Apeiron Sumus branded by default
   ═══════════════════════════════════════════════════════════════ */

// ─── WHITE-LABEL CONFIG ───
// Partners: swap this object to rebrand the entire site
const CONFIGS = {
  apeiron: {
    companyName: "Apeiron Sumus",
    tagline: "The Cloud is Our Workplace",
    logo: "https://static.wixstatic.com/media/95abde_9f0598c93c94433c9ae0f8e6f7121e2d~mv2.png/v1/fill/w_400,h_106,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Logo%20home%20Apeiron.png",
    website: "https://www.apeironsumus.com",
    consultUrl: "https://www.apeironsumus.com/free-consultation",
    contactEmail: "info@apeironsumus.com",
    accent: "#38BDF8",
    accentEnd: "#0284C7",
    stats: [
      { value: "11+", label: "Years of Expertise" },
      { value: "50+", label: "Countries Served" },
      { value: "20K+", label: "Successful Projects" },
    ],
  },
  whitelabel: {
    companyName: "Your Company",
    tagline: "Cloud & Digital Transformation",
    logo: "",
    website: "#",
    consultUrl: "#",
    contactEmail: "hello@yourcompany.com",
    accent: "#38BDF8",
    accentEnd: "#0284C7",
    stats: [
      { value: "—", label: "Years of Expertise" },
      { value: "—", label: "Countries Served" },
      { value: "—", label: "Projects Delivered" },
    ],
  },
};

// ─── BRAND TOKENS (derived from config) ───
const mkBrand = (cfg) => ({
  bg: "#0B0E1A", bgCard: "#111528", bgSurface: "#161A2E", bgHover: "#1C2140",
  border: "rgba(100,180,220,0.1)", borderActive: "rgba(100,180,220,0.25)",
  accent: cfg.accent, accentEnd: cfg.accentEnd,
  gradient: `linear-gradient(135deg, ${cfg.accent} 0%, ${cfg.accentEnd} 100%)`,
  glow: `${cfg.accent}40`,
  text: "#E8EDF5", textMuted: "#8B95AD", textDim: "#5A6480",
  success: "#34D399", warning: "#FBBF24", danger: "#F87171",
});

// ─── PILLAR DATA ───
const PILLAR_COLORS = { business:"#38BDF8", people:"#60A5FA", governance:"#A78BFA", platform:"#34D399", security:"#22D3EE", operations:"#818CF8", finops:"#FB923C", ai:"#E879F9", sustainability:"#4ADE80", compliance:"#F9A8D4" };

const PILLARS = [
  { id:"business", name:"Business Strategy", icon:"◆", description:"Alignment of cloud initiatives with business outcomes and value creation",
    recommendations:{ low:"Establish clear cloud business cases tied to revenue, market share, or customer outcomes. Secure executive sponsorship and define ROI metrics.", mid:"Strengthen the link between cloud initiatives and business KPIs. Implement regular business value reviews.", high:"Continue optimizing cloud-driven business innovation. Explore cloud-native business models." },
    questions:[
      { id:"b1", text:"Cloud initiatives are directly tied to measurable business outcomes (revenue, market share, customer satisfaction)", level:"strategic" },
      { id:"b2", text:"A clear cloud business case exists with defined ROI metrics and timeline", level:"strategic" },
      { id:"b3", text:"Executive sponsorship actively drives cloud adoption decisions", level:"strategic" },
      { id:"b4", text:"Cloud strategy is reviewed and adapted based on changing market conditions", level:"tactical" },
      { id:"b5", text:"Business units are engaged in prioritizing workloads for cloud migration", level:"tactical" },
    ]},
  { id:"people", name:"People & Culture", icon:"●", description:"Organizational readiness, skills development, and change management",
    recommendations:{ low:"Invest in a structured cloud skills program. Establish a CCoE and implement change management.", mid:"Expand skills development beyond core teams. Build a culture of experimentation.", high:"Foster cross-functional cloud fluency. Position as a cloud talent magnet." },
    questions:[
      { id:"p1", text:"A structured cloud skills development program exists for technical and non-technical staff", level:"tactical" },
      { id:"p2", text:"Change management processes are in place to support cloud transformation", level:"strategic" },
      { id:"p3", text:"Cloud Center of Excellence (CCoE) or equivalent team is established", level:"tactical" },
      { id:"p4", text:"Talent acquisition strategy includes cloud-native skill requirements", level:"tactical" },
      { id:"p5", text:"Culture encourages experimentation, learning from failure, and continuous improvement", level:"strategic" },
    ]},
  { id:"governance", name:"Governance & Risk", icon:"■", description:"Cloud governance frameworks, risk management, and decision-making structures",
    recommendations:{ low:"Define and document cloud governance policies. Establish approval workflows.", mid:"Automate governance through policy-as-code. Conduct regular audits.", high:"Implement predictive risk management with AI-driven governance analytics." },
    questions:[
      { id:"g1", text:"Cloud governance policies are documented, communicated, and enforced", level:"strategic" },
      { id:"g2", text:"Risk assessment processes specifically address cloud-related risks", level:"tactical" },
      { id:"g3", text:"Cloud resource provisioning follows defined approval workflows", level:"technical" },
      { id:"g4", text:"Regular audits verify compliance with cloud governance policies", level:"tactical" },
      { id:"g5", text:"Multi-cloud or hybrid governance strategy is defined and operational", level:"strategic" },
    ]},
  { id:"platform", name:"Platform & Architecture", icon:"▲", description:"Cloud platform design, landing zones, networking, and infrastructure patterns",
    recommendations:{ low:"Design secure landing zones with identity and networking baselines. Adopt IaC.", mid:"Standardize architecture patterns. Validate DR/HA meets RPO/RTO targets.", high:"Pursue service mesh, edge computing, and multi-region active-active patterns." },
    questions:[
      { id:"pl1", text:"Cloud landing zones are designed with security, networking, and identity baselines", level:"technical" },
      { id:"pl2", text:"Infrastructure-as-Code (IaC) is standard practice for provisioning", level:"technical" },
      { id:"pl3", text:"Architecture patterns (microservices, serverless, containers) are documented and governed", level:"tactical" },
      { id:"pl4", text:"Platform supports workload portability across providers where needed", level:"technical" },
      { id:"pl5", text:"DR/HA architecture meets defined RPO/RTO targets across critical systems", level:"tactical" },
    ]},
  { id:"security", name:"Security & Identity", icon:"◇", description:"Cloud security posture, identity governance, threat detection, and data protection",
    recommendations:{ low:"Implement least-privilege identity and deploy CSPM tools. Establish encryption policies.", mid:"Embed security in CI/CD (DevSecOps). Test incident response playbooks.", high:"Adopt advanced threat intelligence. Pursue security chaos engineering." },
    questions:[
      { id:"s1", text:"Zero-trust or least-privilege identity model is implemented across cloud environments", level:"technical" },
      { id:"s2", text:"Cloud security posture management (CSPM) tools provide continuous monitoring", level:"technical" },
      { id:"s3", text:"Data classification and encryption policies are enforced for data at rest and in transit", level:"tactical" },
      { id:"s4", text:"Incident response playbooks are defined and regularly tested for cloud scenarios", level:"tactical" },
      { id:"s5", text:"Security is embedded in CI/CD pipelines (DevSecOps practices)", level:"technical" },
    ]},
  { id:"operations", name:"Operations & Reliability", icon:"⬡", description:"Cloud operations maturity, observability, incident management, and SRE practices",
    recommendations:{ low:"Deploy centralized observability. Define SLIs/SLOs for critical services.", mid:"Implement automated remediation. Build capacity planning models.", high:"Pursue AIOps and chaos engineering. Build self-healing infrastructure." },
    questions:[
      { id:"o1", text:"Centralized observability platform covers logs, metrics, and traces across environments", level:"technical" },
      { id:"o2", text:"SLIs/SLOs are defined for critical services and actively monitored", level:"tactical" },
      { id:"o3", text:"Automated remediation handles common operational issues without manual intervention", level:"technical" },
      { id:"o4", text:"Capacity planning and auto-scaling policies are in place for key workloads", level:"technical" },
      { id:"o5", text:"Post-incident reviews drive continuous improvement of operational practices", level:"tactical" },
    ]},
  { id:"finops", name:"FinOps & Cost", icon:"◈", description:"Cloud financial management, cost visibility, optimization, and accountability",
    recommendations:{ low:"Establish cost visibility and allocation per team. Implement tagging strategies.", mid:"Build a FinOps practice. Manage reserved instances and anomaly detection.", high:"Track unit economics. Implement predictive cost modeling." },
    questions:[
      { id:"f1", text:"Cloud costs are visible, allocated, and reported per business unit/team/project", level:"tactical" },
      { id:"f2", text:"FinOps practice or team drives cost optimization and accountability", level:"strategic" },
      { id:"f3", text:"Reserved/committed-use discounts are actively managed and reviewed quarterly", level:"technical" },
      { id:"f4", text:"Anomaly detection alerts on unexpected cost spikes in near-real-time", level:"technical" },
      { id:"f5", text:"Unit economics (cost per transaction, per user) are tracked for key services", level:"strategic" },
    ]},
  { id:"ai", name:"AI Readiness", icon:"✦", description:"Organizational readiness for AI/ML adoption, data strategy, and responsible AI",
    recommendations:{ low:"Start with data strategy. Identify 2-3 high-value AI use cases.", mid:"Build MLOps pipelines. Establish responsible AI framework.", high:"Scale AI across functions. Explore generative AI opportunities." },
    questions:[
      { id:"a1", text:"Data strategy supports AI/ML workloads with clean, accessible, governed datasets", level:"tactical" },
      { id:"a2", text:"AI/ML use cases are identified and prioritized based on business value and feasibility", level:"strategic" },
      { id:"a3", text:"Responsible AI framework addresses bias, fairness, transparency, and accountability", level:"strategic" },
      { id:"a4", text:"MLOps pipelines support model training, deployment, monitoring, and retraining", level:"technical" },
      { id:"a5", text:"Team has skills or partnerships to deliver AI/ML solutions effectively", level:"tactical" },
    ]},
  { id:"sustainability", name:"Sustainability", icon:"❋", description:"Environmental impact, green cloud practices, and sustainability reporting",
    recommendations:{ low:"Begin tracking provider sustainability metrics. Right-size unused resources.", mid:"Incorporate sustainability targets into cloud strategy.", high:"Adopt carbon-aware design principles. Lead sustainability reporting." },
    questions:[
      { id:"su1", text:"Cloud provider sustainability metrics (carbon footprint, PUE) are tracked and reported", level:"strategic" },
      { id:"su2", text:"Workload placement considers energy efficiency and renewable energy availability", level:"technical" },
      { id:"su3", text:"Right-sizing and decommissioning unused resources is a regular practice", level:"technical" },
      { id:"su4", text:"Sustainability targets are part of cloud strategy and executive reporting", level:"strategic" },
      { id:"su5", text:"Application architecture considers carbon-aware design principles", level:"tactical" },
    ]},
  { id:"compliance", name:"Compliance & Regulatory", icon:"◉", description:"Industry-specific regulatory compliance, data sovereignty, and audit readiness",
    recommendations:{ low:"Map regulatory requirements to cloud controls. Enforce data residency.", mid:"Implement continuous compliance monitoring. Automate evidence collection.", high:"Achieve compliance-as-code. Build regulatory change intelligence." },
    questions:[
      { id:"c1", text:"Regulatory requirements (GDPR, HIPAA, PCI-DSS, SOX, etc.) are mapped to cloud controls", level:"tactical" },
      { id:"c2", text:"Data residency and sovereignty requirements are enforced at the platform level", level:"technical" },
      { id:"c3", text:"Continuous compliance monitoring provides real-time posture visibility", level:"technical" },
      { id:"c4", text:"Audit trail and evidence collection is automated for compliance reporting", level:"tactical" },
      { id:"c5", text:"Regulatory change management process tracks and adapts to new requirements", level:"strategic" },
    ]},
];
PILLARS.forEach(p => { p.color = PILLAR_COLORS[p.id]; });

const SCORE_LABELS = [
  { value:1, label:"Not Started", desc:"No capability exists" },
  { value:2, label:"Ad Hoc", desc:"Informal, reactive efforts" },
  { value:3, label:"Developing", desc:"Defined but inconsistent" },
  { value:4, label:"Established", desc:"Consistent and measured" },
  { value:5, label:"Optimized", desc:"Continuously improved" },
];
const LEVEL_TAGS = { strategic:{label:"Strategic",color:"#38BDF8"}, tactical:{label:"Tactical",color:"#A78BFA"}, technical:{label:"Technical",color:"#34D399"} };
const COMPANY_SIZES = ["1–50","51–200","201–500","501–1000","1000–5000","5000+"];
const INDUSTRIES = ["Technology","Financial Services","Healthcare","Manufacturing","Retail & E-commerce","Government","Education","Telecom","Energy & Utilities","Media & Entertainment","Other"];

const getML = (s) => { if(s===0)return"Not Assessed";if(s<2)return"Not Started";if(s<3)return"Ad Hoc";if(s<4)return"Developing";if(s<4.5)return"Established";return"Optimized"; };
const getMC = (s,B) => { if(s===0)return B.textDim;if(s<2)return B.danger;if(s<3)return"#FB923C";if(s<4)return B.warning;if(s<4.5)return B.success;return"#22C55E"; };

// ─── RADAR CHART ───
function Radar({ scores, pillars, size=400, B }) {
  const c=size/2, r=size/2-55, as=(2*Math.PI)/pillars.length;
  const gp=(i,v)=>{const a=as*i-Math.PI/2;const R=(v/5)*r;return{x:c+R*Math.cos(a),y:c+R*Math.sin(a)};};
  const gl=Array.from({length:5},(_,i)=>pillars.map((_,j)=>{const a=as*j-Math.PI/2;const R=((i+1)/5)*r;return`${c+R*Math.cos(a)},${c+R*Math.sin(a)}`;}).join(" "));
  const dp=pillars.map((p,i)=>gp(i,scores[p.id]||0));
  return(
    <svg viewBox={`0 0 ${size} ${size}`} style={{width:"100%",maxWidth:size,margin:"0 auto",display:"block"}}>
      <defs><radialGradient id="rf2"><stop offset="0%" stopColor={B.accent} stopOpacity="0.3"/><stop offset="100%" stopColor={B.accent} stopOpacity="0.05"/></radialGradient>
      <filter id="gl2"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      {gl.map((pts,i)=><polygon key={i} points={pts} fill="none" stroke={B.border} strokeWidth="1"/>)}
      {pillars.map((_,i)=>{const e=gp(i,5);return<line key={i} x1={c} y1={c} x2={e.x} y2={e.y} stroke="rgba(100,180,220,0.06)" strokeWidth="1"/>;} )}
      <polygon points={dp.map(p=>`${p.x},${p.y}`).join(" ")} fill="url(#rf2)" stroke={B.accent} strokeWidth="2.5" strokeLinejoin="round" filter="url(#gl2)"/>
      {dp.map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r="5" fill={pillars[i].color} stroke={B.bg} strokeWidth="2.5"/><circle cx={p.x} cy={p.y} r="2" fill="#fff"/></g>)}
      {pillars.map((p,i)=>{const lp=gp(i,6.5);const isL=lp.x<c-10;const isR=lp.x>c+10;return<text key={i} x={lp.x} y={lp.y} textAnchor={isL?"end":isR?"start":"middle"} dominantBaseline="middle" style={{fontSize:"9px",fill:B.textMuted,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600}}>{p.name}</text>;})}
    </svg>
  );
}

// ─── useInView hook ───
function useInView(opts={threshold:0.15}) {
  const ref=useRef(null);const[visible,setVisible]=useState(false);
  useEffect(()=>{const el=ref.current;if(!el)return;const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVisible(true);obs.disconnect();}},opts);obs.observe(el);return()=>obs.disconnect();},[]);
  return[ref,visible];
}

// ─── PDF Generator ───
function genPDF(cd,ps,ans,os,cfg) {
  const d=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const gR=(p)=>{const s=ps[p.id];if(s<2.5)return p.recommendations.low;if(s<4)return p.recommendations.mid;return p.recommendations.high;};
  const sorted=[...PILLARS].filter(p=>ps[p.id]>0).sort((a,b)=>ps[a.id]-ps[b.id]);
  return`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cloud Assessment — ${cd.company}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Plus Jakarta Sans',sans-serif;color:#0B0E1A;background:#fff;padding:48px;max-width:900px;margin:0 auto}
.hdr{text-align:center;margin-bottom:48px;padding-bottom:32px;border-bottom:3px solid ${cfg.accent}}.hdr h1{font-size:32px;font-weight:800;margin-bottom:4px}
.hdr .sub{font-size:11px;color:#5A6480;font-family:'JetBrains Mono',monospace;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px}
.hdr .br{font-size:13px;color:${cfg.accent};font-weight:700;margin-bottom:12px;letter-spacing:1px}
.meta{display:flex;justify-content:center;gap:24px;font-size:11px;color:#8B95AD;font-family:'JetBrains Mono',monospace}
.ov{text-align:center;margin:36px 0;padding:32px;background:linear-gradient(135deg,#F0F9FF,#E0F2FE);border-radius:16px;border:1px solid #BAE6FD}
.ov .sc{font-size:72px;font-weight:800;color:#0284C7}.ov .lb{font-size:18px;color:#0369A1;margin-top:4px}
.pc{margin:20px 0;padding:20px 24px;border:1px solid #E2E8F0;border-radius:12px;page-break-inside:avoid}
.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.pn{font-size:15px;font-weight:700}
.ps{font-size:24px;font-weight:800;font-family:'JetBrains Mono',monospace}
.bt{height:6px;background:#E2E8F0;border-radius:3px;margin-bottom:12px}.bf{height:100%;border-radius:3px}
.rc{font-size:13px;color:#475569;line-height:1.7;padding:12px 16px;background:#F8FAFC;border-left:3px solid ${cfg.accent};border-radius:0 6px 6px 0}
.qt{width:100%;border-collapse:collapse;margin:12px 0}.qt td{padding:6px 8px;font-size:11px;border-bottom:1px solid #F1F5F9}.qt td:last-child{text-align:center;font-family:'JetBrains Mono',monospace;width:50px}
.pr{margin:36px 0;padding:24px;background:linear-gradient(135deg,#F0F9FF,#FFF7ED);border:1px solid #BAE6FD;border-radius:16px}.pr h3{font-size:20px;font-weight:700;margin-bottom:16px}
.pi{display:flex;align-items:flex-start;gap:12px;margin:12px 0}.pnum{width:28px;height:28px;border-radius:50%;background:${cfg.accent};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
.ft{text-align:center;margin-top:48px;padding-top:24px;border-top:2px solid ${cfg.accent};font-size:11px;color:#94A3B8;font-family:'JetBrains Mono',monospace}
@media print{body{padding:24px}.pc{break-inside:avoid}}</style></head><body>
<div class="hdr"><div class="br">${cfg.companyName.toUpperCase()}</div><div class="sub">Vendor-Neutral Cloud Adoption Assessment</div><h1>Assessment Report</h1>
<div class="meta"><span>${cd.company}</span><span>${cd.industry}</span><span>${d}</span><span>Prepared for ${cd.name}</span></div></div>
<div class="ov"><div class="sc">${os.toFixed(1)}</div><div class="lb">Overall Maturity — ${getML(os)}</div></div>
<div class="pr"><h3>Priority Focus Areas</h3>${sorted.slice(0,3).map((p,i)=>`<div class="pi"><div class="pnum">${i+1}</div><div><strong>${p.name}</strong> — Score: ${ps[p.id].toFixed(1)} (${getML(ps[p.id])})<br/><span style="font-size:12px;color:#666">${gR(p)}</span></div></div>`).join("")}</div>
${PILLARS.map(p=>{const s=ps[p.id];return`<div class="pc"><div class="ph"><div class="pn">${p.icon} ${p.name}</div><div class="ps" style="color:${p.color}">${s>0?s.toFixed(1):"—"}</div></div><div class="bt"><div class="bf" style="width:${(s/5)*100}%;background:${p.color}"></div></div><div class="rc">${s>0?gR(p):"Not assessed"}</div><table class="qt">${p.questions.map(q=>`<tr><td>${q.text}</td><td>${ans[q.id]||"—"}</td></tr>`).join("")}</table></div>`;}).join("")}
<div class="ft">${cfg.companyName} · Cloud Adoption Assessment · Vendor-Neutral · ${d}</div></body></html>`;
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [brandKey, setBrandKey] = useState("apeiron");
  const cfg = CONFIGS[brandKey];
  const B = mkBrand(cfg);

  const [page, setPage] = useState("landing"); // landing | assess
  const [phase, setPhase] = useState("assess"); // assess | teaser | gate | report
  const [cPillar, setCPillar] = useState(0);
  const [answers, setAnswers] = useState({});
  const [filterLevel, setFilterLevel] = useState("all");
  const [cust, setCust] = useState({name:"",email:"",company:"",role:"",size:"",industry:"",phone:""});
  const [formErr, setFormErr] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const cRef = useRef(null);

  const pillar = PILLARS[cPillar];
  const fQs = pillar?.questions.filter(q=>filterLevel==="all"||q.level===filterLevel)||[];
  const setA = (qId,v) => setAnswers(p=>({...p,[qId]:v}));
  const gPS = (p) => { const a=p.questions.filter(q=>answers[q.id]); if(!a.length)return 0; return+(a.reduce((s,q)=>s+answers[q.id],0)/a.length).toFixed(1); };
  const pScores={}; PILLARS.forEach(p=>{pScores[p.id]=gPS(p);});
  const oScore=(()=>{const s=PILLARS.filter(p=>pScores[p.id]>0);if(!s.length)return 0;return+(s.reduce((a,p)=>a+pScores[p.id],0)/s.length).toFixed(1);})();
  const tAns=Object.keys(answers).length, tQs=PILLARS.reduce((s,p)=>s+p.questions.length,0), prog=Math.round((tAns/tQs)*100);
  const pCnt=(p)=>p.questions.filter(q=>answers[q.id]).length;
  const gR=(p)=>{const s=pScores[p.id];if(s<2.5)return p.recommendations.low;if(s<4)return p.recommendations.mid;return p.recommendations.high;};

  const validate=()=>{const e={};if(!cust.name.trim())e.name=1;if(!cust.email.trim()||!/\S+@\S+\.\S+/.test(cust.email))e.email=1;if(!cust.company.trim())e.company=1;if(!cust.role.trim())e.role=1;if(!cust.size)e.size=1;if(!cust.industry)e.industry=1;setFormErr(e);return!Object.keys(e).length;};
  const handleGate=async()=>{if(!validate())return;setSaving(true);try{const r={id:`local_${Date.now()}`};setSavedId(r.id);}catch(e){}setPhase("report");setSaving(false);};
  const handlePDF=()=>{const h=genPDF(cust,pScores,answers,oScore,cfg);const b=new Blob([h],{type:"text/html"});const u=URL.createObjectURL(b);const w=window.open(u,"_blank");setTimeout(()=>{if(w)w.print();},1000);};

  useEffect(()=>{if(cRef.current)cRef.current.scrollTop=0;},[cPillar,phase]);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    html{scroll-behavior:smooth}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes pulse-ring{0%{transform:scale(0.9);opacity:0.6}100%{transform:scale(1.3);opacity:0}}
    @keyframes gradient-x{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    .anim{animation:fadeUp 0.7s ease forwards}.d1{animation-delay:0.15s;opacity:0}.d2{animation-delay:0.3s;opacity:0}.d3{animation-delay:0.45s;opacity:0}.d4{animation-delay:0.6s;opacity:0}
    .vis{animation:fadeUp 0.7s ease forwards}
    input:focus,select:focus{outline:none;border-color:${B.accent}!important;box-shadow:0 0 0 3px ${B.glow}!important}
    select{appearance:none}
    ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${B.glow};border-radius:3px}
    .glow-bar{height:3px;background:${B.gradient};border-radius:2px}
    body{background:${B.bg};overflow-x:hidden}
  `;

  const iSt=(err)=>({padding:"12px 16px",borderRadius:10,width:"100%",border:err?`1.5px solid ${B.danger}`:`1.5px solid ${B.border}`,background:B.bgCard,color:B.text,fontSize:"14px",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"all 0.2s"});
  const sSt=(err,hv)=>({...iSt(err),color:hv?B.text:B.textDim});
  const btnP=(dis)=>({padding:"14px 36px",borderRadius:10,border:"none",background:dis?B.textDim:B.gradient,color:"#fff",fontSize:"15px",fontWeight:700,cursor:dis?"wait":"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:dis?"none":`0 4px 24px ${B.glow}`,transition:"all 0.2s"});
  const btnS=()=>({padding:"14px 36px",borderRadius:10,border:`1px solid ${B.border}`,background:"transparent",color:B.textMuted,fontSize:"15px",fontWeight:500,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"});

  // ─── Scroll Section ───
  function Section({children,className=""}) {
    const[ref,vis]=useInView();
    return <div ref={ref} className={vis?`vis ${className}`:className} style={{opacity:vis?1:0,transition:"opacity 0.3s"}}>{children}</div>;
  }

  // ═══ LANDING PAGE ═══
  if (page === "landing") {
    return (
      <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",color:B.text,background:B.bg,minHeight:"100vh"}}>
        <style>{css}</style>

        {/* ── NAV ── */}
        <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(11,14,26,0.85)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${B.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {cfg.logo ? <img src={cfg.logo} alt={cfg.companyName} style={{height:30}} /> : <span style={{fontSize:"18px",fontWeight:800,color:B.text}}>{cfg.companyName}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            {/* White-label toggle */}
            <button onClick={()=>setBrandKey(k=>k==="apeiron"?"whitelabel":"apeiron")} style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${B.border}`,background:"transparent",color:B.textDim,fontSize:"10px",fontFamily:"'JetBrains Mono',monospace",cursor:"pointer"}} title="Toggle white-label mode">
              {brandKey==="apeiron"?"⚙ White-label":"◆ Apeiron"}
            </button>
            <button onClick={()=>{setPage("assess");setPhase("assess");}} style={{...btnP(false),padding:"10px 24px",fontSize:"13px"}}>
              Start Free Assessment
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"120px 32px 80px",position:"relative",overflow:"hidden"}}>
          {/* Grid bg */}
          <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${B.border} 1px, transparent 1px), linear-gradient(90deg, ${B.border} 1px, transparent 1px)`,backgroundSize:"80px 80px",opacity:0.25}}/>
          {/* Glow orb */}
          <div style={{position:"absolute",top:"-20%",right:"-10%",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle, ${B.glow} 0%, transparent 70%)`,filter:"blur(80px)"}}/>
          <div style={{maxWidth:800,textAlign:"center",position:"relative",zIndex:1}} className="anim">
            <div className="glow-bar" style={{width:60,margin:"0 auto 32px"}}/>
            <div style={{fontSize:"11px",letterSpacing:"5px",color:B.textMuted,fontFamily:"'JetBrains Mono',monospace",marginBottom:24,textTransform:"uppercase"}} className="anim d1">
              Vendor-Neutral · 10 Pillars · 50 Questions
            </div>
            <h1 style={{fontSize:"clamp(36px,6vw,64px)",fontWeight:800,lineHeight:1.05,margin:"0 0 24px",background:`linear-gradient(135deg, ${B.text} 30%, ${B.accent} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}} className="anim d2">
              How Cloud-Ready<br/>Is Your Organization?
            </h1>
            <p style={{fontSize:"18px",color:B.textMuted,lineHeight:1.7,maxWidth:560,margin:"0 auto 16px"}} className="anim d3">
              Assess your cloud maturity across strategy, security, AI, FinOps, sustainability, and compliance — in under 15 minutes.
            </p>
            <p style={{fontSize:"14px",color:B.textDim,marginBottom:40}} className="anim d3">
              Get a personalized maturity score with actionable recommendations.
            </p>
            <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}} className="anim d4">
              <button onClick={()=>{setPage("assess");setPhase("assess");}} style={btnP(false)}>
                Start Free Assessment →
              </button>
              <a href="#how-it-works" style={{...btnS(),textDecoration:"none",display:"inline-flex",alignItems:"center"}}>
                See How It Works
              </a>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" style={{padding:"100px 32px",maxWidth:1000,margin:"0 auto"}}>
          <Section>
            <div style={{textAlign:"center",marginBottom:60}}>
              <div style={{fontSize:"11px",letterSpacing:"4px",color:B.accent,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",marginBottom:12}}>Process</div>
              <h2 style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:800}}>Three Steps to Clarity</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:32}}>
              {[
                {num:"01",title:"Assess",desc:"Answer 50 questions across 10 pillars covering business, technical, financial, and emerging dimensions of cloud adoption.",icon:"📋"},
                {num:"02",title:"Analyze",desc:"Get your maturity score with a radar visualization showing strengths and gaps across every dimension.",icon:"📊"},
                {num:"03",title:"Act",desc:"Receive tailored recommendations, priority focus areas, and a downloadable PDF report for your leadership team.",icon:"🚀"},
              ].map((s,i)=>(
                <div key={i} style={{padding:32,borderRadius:16,background:B.bgCard,border:`1px solid ${B.border}`,transition:"all 0.3s",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-20,right:-20,fontSize:120,fontWeight:900,color:B.border,fontFamily:"'JetBrains Mono',monospace",lineHeight:1,opacity:0.5}}>{s.num}</div>
                  <div style={{fontSize:40,marginBottom:16}}>{s.icon}</div>
                  <h3 style={{fontSize:20,fontWeight:700,marginBottom:8,color:B.accent}}>{s.title}</h3>
                  <p style={{fontSize:14,color:B.textMuted,lineHeight:1.7}}>{s.desc}</p>
                </div>
              ))}
            </div>
          </Section>
        </section>

        {/* ── PILLARS ── */}
        <section style={{padding:"80px 32px",background:B.bgCard}}>
          <Section>
            <div style={{maxWidth:1000,margin:"0 auto"}}>
              <div style={{textAlign:"center",marginBottom:60}}>
                <div style={{fontSize:"11px",letterSpacing:"4px",color:B.accent,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",marginBottom:12}}>Framework</div>
                <h2 style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:800,marginBottom:12}}>10 Pillars of Cloud Maturity</h2>
                <p style={{fontSize:15,color:B.textMuted,maxWidth:500,margin:"0 auto"}}>A comprehensive, vendor-neutral framework that goes beyond traditional cloud assessments.</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16}}>
                {PILLARS.map((p,i)=>(
                  <div key={p.id} style={{padding:"20px 18px",borderRadius:12,background:B.bgSurface,border:`1px solid ${B.border}`,transition:"all 0.3s",cursor:"default"}}>
                    <div style={{fontSize:20,marginBottom:8,color:p.color}}>{p.icon}</div>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:4,color:B.text}}>{p.name}</div>
                    <div style={{fontSize:11,color:B.textDim,lineHeight:1.5}}>{p.questions.length} questions</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </section>

        {/* ── STATS ── */}
        <section style={{padding:"80px 32px"}}>
          <Section>
            <div style={{maxWidth:800,margin:"0 auto",display:"flex",justifyContent:"center",gap:60,flexWrap:"wrap",textAlign:"center"}}>
              {cfg.stats.map((s,i)=>(
                <div key={i}>
                  <div style={{fontSize:"clamp(36px,5vw,56px)",fontWeight:800,background:B.gradient,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>{s.value}</div>
                  <div style={{fontSize:13,color:B.textMuted,marginTop:8,fontFamily:"'JetBrains Mono',monospace"}}>{s.label}</div>
                </div>
              ))}
            </div>
          </Section>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{padding:"100px 32px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",bottom:"-30%",left:"50%",transform:"translateX(-50%)",width:800,height:400,borderRadius:"50%",background:`radial-gradient(circle, ${B.glow} 0%, transparent 70%)`,filter:"blur(100px)"}}/>
          <Section>
            <div style={{position:"relative",zIndex:1}}>
              <h2 style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:800,marginBottom:16}}>Ready to Find Out?</h2>
              <p style={{fontSize:16,color:B.textMuted,marginBottom:36,maxWidth:480,margin:"0 auto 36px"}}>
                Take 15 minutes. Get a complete picture. Walk away with a roadmap.
              </p>
              <button onClick={()=>{setPage("assess");setPhase("assess");}} style={{...btnP(false),fontSize:17,padding:"16px 48px"}}>
                Start Free Assessment →
              </button>
            </div>
          </Section>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{padding:"32px",borderTop:`1px solid ${B.border}`,textAlign:"center"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:12}}>
            {cfg.logo ? <img src={cfg.logo} alt={cfg.companyName} style={{height:22,opacity:0.6}} /> : <span style={{fontSize:14,fontWeight:700,color:B.textDim}}>{cfg.companyName}</span>}
          </div>
          <p style={{fontSize:11,color:B.textDim,fontFamily:"'JetBrains Mono',monospace"}}>
            © {new Date().getFullYear()} {cfg.companyName} · Cloud Adoption Assessment · Vendor-Neutral Framework
          </p>
          {cfg.website!=="#" && <a href={cfg.website} target="_blank" rel="noopener" style={{fontSize:11,color:B.accent,textDecoration:"none",fontFamily:"'JetBrains Mono',monospace"}}>{cfg.website.replace("https://www.","")}</a>}
        </footer>
      </div>
    );
  }

  // ═══ ASSESSMENT APP (all phases) ═══

  // ── GATE ──
  if (phase==="gate") {
    return(<div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",minHeight:"100vh",background:`radial-gradient(ellipse at 50% 0%,#0F172A 0%,${B.bg} 70%)`,color:B.text,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}><style>{css}</style>
      <div style={{maxWidth:500,width:"100%"}} className="anim">
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:56,fontWeight:800,color:getMC(oScore,B)}}>{oScore.toFixed(1)}</div>
          <div style={{fontSize:14,color:getMC(oScore,B),marginBottom:8}}>{getML(oScore)} Maturity</div>
          <div className="glow-bar" style={{width:40,margin:"16px auto"}}/>
          <h2 style={{fontSize:24,fontWeight:700,margin:"12px 0 8px"}}>Unlock Your Full Report</h2>
          <p style={{color:B.textMuted,fontSize:13,lineHeight:1.6}}>Get detailed recommendations, priority actions, and a PDF report.</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[["name","Full Name","John Smith","text"],["email","Work Email","john@company.com","email"]].map(([k,l,ph,t])=>(
            <div key={k}><label style={{fontSize:11,color:B.textMuted,fontFamily:"'JetBrains Mono',monospace",marginBottom:4,display:"block"}}>{l} *</label>
            <input value={cust[k]} onChange={e=>setCust(p=>({...p,[k]:e.target.value}))} placeholder={ph} type={t} style={iSt(formErr[k])}/></div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={{fontSize:11,color:B.textMuted,fontFamily:"'JetBrains Mono',monospace",marginBottom:4,display:"block"}}>Company *</label>
            <input value={cust.company} onChange={e=>setCust(p=>({...p,company:e.target.value}))} placeholder="Acme Corp" style={iSt(formErr.company)}/></div>
            <div><label style={{fontSize:11,color:B.textMuted,fontFamily:"'JetBrains Mono',monospace",marginBottom:4,display:"block"}}>Job Title *</label>
            <input value={cust.role} onChange={e=>setCust(p=>({...p,role:e.target.value}))} placeholder="VP Engineering" style={iSt(formErr.role)}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={{fontSize:11,color:B.textMuted,fontFamily:"'JetBrains Mono',monospace",marginBottom:4,display:"block"}}>Company Size *</label>
            <select value={cust.size} onChange={e=>setCust(p=>({...p,size:e.target.value}))} style={sSt(formErr.size,cust.size)}>
              <option value="">Select</option>{COMPANY_SIZES.map(s=><option key={s} value={s}>{s}</option>)}
            </select></div>
            <div><label style={{fontSize:11,color:B.textMuted,fontFamily:"'JetBrains Mono',monospace",marginBottom:4,display:"block"}}>Industry *</label>
            <select value={cust.industry} onChange={e=>setCust(p=>({...p,industry:e.target.value}))} style={sSt(formErr.industry,cust.industry)}>
              <option value="">Select</option>{INDUSTRIES.map(i=><option key={i} value={i}>{i}</option>)}
            </select></div>
          </div>
          <div><label style={{fontSize:11,color:B.textMuted,fontFamily:"'JetBrains Mono',monospace",marginBottom:4,display:"block"}}>Phone (optional)</label>
          <input value={cust.phone} onChange={e=>setCust(p=>({...p,phone:e.target.value}))} placeholder="+1 (555) 000-0000" style={iSt(false)}/></div>
        </div>
        <button onClick={handleGate} disabled={saving} style={{...btnP(saving),width:"100%",marginTop:20}}>{saving?"Generating...":"Get My Full Report →"}</button>
        <p style={{textAlign:"center",fontSize:11,color:B.textDim,marginTop:14}}>Your data is stored securely and used only to deliver your report.</p>
      </div>
    </div>);
  }

  // ── REPORT ──
  if (phase==="report") {
    const sorted=[...PILLARS].filter(p=>pScores[p.id]>0).sort((a,b)=>pScores[a.id]-pScores[b.id]);
    return(<div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",minHeight:"100vh",background:B.bg,color:B.text,display:"flex",flexDirection:"column"}}><style>{css}</style>
      <header style={{padding:"12px 24px",borderBottom:`1px solid ${B.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {cfg.logo?<img src={cfg.logo} alt={cfg.companyName} style={{height:28}}/>:<span style={{fontWeight:800,fontSize:16}}>{cfg.companyName}</span>}
          <span style={{fontSize:12,color:B.textMuted,fontFamily:"'JetBrains Mono',monospace"}}>— {cust.company}</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>window.print()} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${B.border}`,background:"transparent",color:B.textMuted,fontSize:12,cursor:"pointer"}}>Print</button>
          <button onClick={handlePDF} style={{padding:"8px 16px",borderRadius:8,border:"none",background:B.gradient,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Export PDF</button>
          <button onClick={()=>setPhase("assess")} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${B.border}`,background:"transparent",color:B.textMuted,fontSize:12,cursor:"pointer"}}>Edit</button>
          <button onClick={()=>setPage("landing")} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${B.border}`,background:"transparent",color:B.textMuted,fontSize:12,cursor:"pointer"}}>Home</button>
        </div>
      </header>
      <main style={{flex:1,overflowY:"auto",padding:"32px 40px",maxWidth:960,margin:"0 auto",width:"100%"}}>
        <div className="anim" style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:11,letterSpacing:"3px",color:B.textMuted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",marginBottom:8}}>Executive Summary · {new Date().toLocaleDateString()}</div>
          <div style={{fontSize:72,fontWeight:800,color:getMC(oScore,B),lineHeight:1}}>{oScore.toFixed(1)}</div>
          <div style={{fontSize:18,color:getMC(oScore,B),marginTop:4}}>{getML(oScore)} Maturity</div>
          <div style={{fontSize:12,color:B.textDim,fontFamily:"'JetBrains Mono',monospace",marginTop:12}}>{cust.company} · {cust.industry} · {cust.size} employees · {tAns}/{tQs} assessed</div>
        </div>
        <Radar scores={pScores} pillars={PILLARS} B={B}/>
        {sorted.length>=1&&(<div style={{margin:"40px 0",padding:28,borderRadius:14,background:B.bgCard,border:`1px solid ${B.borderActive}`}}>
          <h3 style={{fontSize:20,fontWeight:700,margin:"0 0 20px"}}>Priority Focus Areas</h3>
          {sorted.slice(0,3).map((p,i)=>(<div key={p.id} style={{display:"flex",gap:14,marginBottom:20}}>
            <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:B.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>{i+1}</div>
            <div><div style={{fontSize:14,fontWeight:700,marginBottom:4}}><span style={{color:p.color}}>{p.icon}</span> {p.name}<span style={{fontSize:12,color:B.textDim,fontFamily:"'JetBrains Mono',monospace",marginLeft:8}}>{pScores[p.id].toFixed(1)} — {getML(pScores[p.id])}</span></div>
            <p style={{fontSize:13,color:B.textMuted,lineHeight:1.6,margin:0}}>{gR(p)}</p></div>
          </div>))}
        </div>)}
        <h3 style={{fontSize:20,fontWeight:700,margin:"36px 0 20px"}}>Detailed Analysis</h3>
        {PILLARS.map(p=>{const s=pScores[p.id];return(<div key={p.id} style={{padding:"22px 24px",borderRadius:14,marginBottom:14,background:B.bgCard,border:`1px solid ${B.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{color:p.color,fontSize:15}}>{p.icon}</span><span style={{fontSize:14,fontWeight:700}}>{p.name}</span><span style={{fontSize:11,color:B.textDim,fontFamily:"'JetBrains Mono',monospace"}}>{getML(s)}</span></div>
            <span style={{fontSize:22,fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:getMC(s,B)}}>{s>0?s.toFixed(1):"—"}</span>
          </div>
          <div style={{height:4,borderRadius:2,background:B.bgSurface,marginBottom:14}}><div style={{width:`${(s/5)*100}%`,height:"100%",borderRadius:2,background:p.color,transition:"width 0.4s"}}/></div>
          {s>0&&<div style={{padding:"12px 16px",marginBottom:14,borderRadius:8,background:B.bgSurface,borderLeft:`3px solid ${p.color}`,fontSize:13,color:B.textMuted,lineHeight:1.7}}>{gR(p)}</div>}
          {p.questions.map(q=>(<div key={q.id} style={{display:"flex",alignItems:"center",gap:10,padding:"4px 0"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:answers[q.id]?getMC(answers[q.id],B):B.border,flexShrink:0}}/>
            <span style={{fontSize:11.5,color:B.textMuted,flex:1}}>{q.text}</span>
            <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:answers[q.id]?getMC(answers[q.id],B):B.textDim,minWidth:18,textAlign:"right"}}>{answers[q.id]||"—"}</span>
          </div>))}
        </div>);})}
        <div style={{margin:"40px 0",padding:32,borderRadius:14,textAlign:"center",background:B.bgCard,border:`1px solid ${B.borderActive}`}}>
          <h3 style={{fontSize:22,fontWeight:700,margin:"0 0 12px"}}>Ready to Accelerate?</h3>
          <p style={{color:B.textMuted,fontSize:14,lineHeight:1.6,margin:"0 0 24px"}}>This assessment shows where you are. Let's build a roadmap for where you want to be.</p>
          <button onClick={()=>window.open(cfg.consultUrl,"_blank")} style={btnP(false)}>Schedule Free Consultation →</button>
        </div>
        <div style={{textAlign:"center",padding:"24px 0 40px",fontSize:11,color:B.textDim,fontFamily:"'JetBrains Mono',monospace"}}>
          {cfg.companyName} · Cloud Adoption Assessment · {new Date().toLocaleDateString()} · ID: {savedId||"LOCAL"}
        </div>
      </main>
    </div>);
  }

  // ── ASSESS (with teaser overlay) ──
  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",minHeight:"100vh",background:B.bg,color:B.text,display:"flex",flexDirection:"column"}}>
      <style>{css}</style>
      <header style={{padding:"12px 24px",borderBottom:`1px solid ${B.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {cfg.logo?<img src={cfg.logo} alt={cfg.companyName} style={{height:26,cursor:"pointer"}} onClick={()=>setPage("landing")}/>:<span style={{fontWeight:800,fontSize:16,cursor:"pointer"}} onClick={()=>setPage("landing")}>{cfg.companyName}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:B.textMuted}}>{tAns}/{tQs} · {prog}%</span>
          <div style={{width:100,height:4,borderRadius:2,background:B.bgSurface}}><div style={{width:`${prog}%`,height:"100%",borderRadius:2,background:B.gradient,transition:"width 0.4s"}}/></div>
          {tAns>=5&&<button onClick={()=>setPhase("teaser")} style={{padding:"6px 14px",borderRadius:8,border:"none",background:`${B.accent}20`,color:B.accent,fontSize:12,fontWeight:700,cursor:"pointer"}}>Preview Results</button>}
        </div>
      </header>

      {phase==="teaser"&&(
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(11,14,26,0.88)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div className="anim" style={{maxWidth:520,width:"100%",textAlign:"center",background:B.bgCard,borderRadius:20,padding:"40px 36px",border:`1px solid ${B.borderActive}`,boxShadow:`0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${B.glow}`}}>
            <div style={{fontSize:11,letterSpacing:"3px",color:B.textMuted,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",marginBottom:16}}>Your Maturity Score</div>
            <div style={{fontSize:72,fontWeight:800,color:getMC(oScore,B),lineHeight:1}}>{oScore.toFixed(1)}</div>
            <div style={{fontSize:16,color:getMC(oScore,B),marginTop:4,marginBottom:24}}>{getML(oScore)}</div>
            <div style={{maxWidth:320,margin:"0 auto 24px"}}><Radar scores={pScores} pillars={PILLARS} size={300} B={B}/></div>
            <div style={{padding:16,borderRadius:10,marginBottom:28,background:B.bgSurface,border:`1px solid ${B.border}`,position:"relative",overflow:"hidden"}}>
              <div style={{filter:"blur(4px)",fontSize:12,color:B.textMuted,lineHeight:1.6}}>Based on your scores, we recommend prioritizing Security & Identity improvements, establishing a FinOps practice...</div>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(11,14,26,0.5)"}}>
                <span style={{fontSize:13,color:B.accent,fontWeight:700}}>🔒 Unlock full recommendations</span>
              </div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setPhase("assess")} style={btnS()}>← Keep Assessing</button>
              <button onClick={()=>setPhase("gate")} style={btnP(false)}>Get Full Report →</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <nav style={{width:230,minWidth:230,borderRight:`1px solid ${B.border}`,padding:"12px 0",overflowY:"auto",background:B.bgCard}}>
          {PILLARS.map((p,i)=>{const sc=pScores[p.id],cnt=pCnt(p),isA=cPillar===i;return(
            <button key={p.id} onClick={()=>{setCPillar(i);if(phase==="teaser")setPhase("assess");}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 18px",border:"none",cursor:"pointer",background:isA?B.bgHover:"transparent",borderLeft:isA?`3px solid ${p.color}`:"3px solid transparent",textAlign:"left",transition:"all 0.15s"}}>
              <span style={{color:p.color,fontSize:12,width:16,textAlign:"center"}}>{p.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:isA?700:500,color:isA?B.text:B.textMuted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:B.textDim,marginTop:1}}>{cnt}/{p.questions.length}{sc>0?` · ${sc.toFixed(1)}`:""}</div>
              </div>
              {cnt===p.questions.length&&<span style={{color:B.success,fontSize:11}}>✓</span>}
            </button>
          );})}
          {tAns>=10&&<div style={{padding:"16px 18px",marginTop:8}}><button onClick={()=>setPhase("gate")} style={{...btnP(false),width:"100%",padding:10,fontSize:12}}>Get Full Report →</button></div>}
        </nav>

        <main ref={cRef} style={{flex:1,overflowY:"auto",padding:"24px 32px"}}>
          <div style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <span style={{color:pillar.color,fontSize:20}}>{pillar.icon}</span>
              <h2 style={{margin:0,fontSize:24,fontWeight:800}}>{pillar.name}</h2>
            </div>
            <p style={{color:B.textMuted,fontSize:13,margin:"2px 0 0 30px"}}>{pillar.description}</p>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:20,marginLeft:30}}>
            {["all","strategic","tactical","technical"].map(l=>(<button key={l} onClick={()=>setFilterLevel(l)} style={{padding:"4px 10px",borderRadius:6,border:"none",background:filterLevel===l?B.bgHover:"transparent",color:filterLevel===l?B.text:B.textDim,fontSize:11,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",textTransform:"capitalize"}}>{l==="all"?"All":l}</button>))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginLeft:30}}>
            {fQs.map((q,qi)=>(
              <div key={q.id} style={{padding:"16px 18px",borderRadius:12,background:B.bgCard,border:answers[q.id]?`1px solid ${B.borderActive}`:`1px solid ${B.border}`,transition:"border-color 0.2s"}}>
                <div style={{display:"flex",gap:10}}>
                  <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:B.textDim,minWidth:20,paddingTop:2}}>{String(qi+1).padStart(2,"0")}</span>
                  <div style={{flex:1}}>
                    <span style={{fontSize:9,fontFamily:"'JetBrains Mono',monospace",textTransform:"uppercase",letterSpacing:"1.5px",color:LEVEL_TAGS[q.level].color,background:`${LEVEL_TAGS[q.level].color}15`,padding:"2px 7px",borderRadius:4,display:"inline-block",marginBottom:6}}>{LEVEL_TAGS[q.level].label}</span>
                    <p style={{margin:"6px 0 10px",fontSize:13,lineHeight:1.6,color:B.text}}>{q.text}</p>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      {SCORE_LABELS.map(s=>(
                        <button key={s.value} onClick={()=>setA(q.id,s.value)} title={s.desc} style={{width:42,height:42,borderRadius:10,border:answers[q.id]===s.value?`2px solid ${pillar.color}`:`2px solid ${B.border}`,background:answers[q.id]===s.value?pillar.color:B.bgSurface,color:answers[q.id]===s.value?"#fff":B.textDim,fontSize:15,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",transition:"all 0.2s",boxShadow:answers[q.id]===s.value?`0 0 16px ${pillar.color}33`:"none"}}>{s.value}</button>
                      ))}
                      <span style={{fontSize:11,color:B.textMuted,fontFamily:"'JetBrains Mono',monospace",marginLeft:8}}>{answers[q.id]?SCORE_LABELS[answers[q.id]-1].label:""}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:28,marginLeft:30}}>
            <button onClick={()=>setCPillar(Math.max(0,cPillar-1))} disabled={cPillar===0} style={{padding:"10px 22px",borderRadius:8,border:`1px solid ${B.border}`,background:"transparent",color:cPillar===0?B.textDim:B.textMuted,fontSize:13,cursor:cPillar===0?"default":"pointer"}}>← Previous</button>
            {cPillar<PILLARS.length-1?(
              <button onClick={()=>setCPillar(cPillar+1)} style={{padding:"10px 22px",borderRadius:8,border:"none",background:pillar.color,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 2px 12px ${pillar.color}44`}}>Next: {PILLARS[cPillar+1].name} →</button>
            ):(
              <button onClick={()=>setPhase(tAns>=5?"teaser":"gate")} style={btnP(false)}>{tAns>=5?"Preview Results →":"Get Results →"}</button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
