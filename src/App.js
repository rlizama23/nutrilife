import { useState } from "react";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:"#F7F3EE", card:"#FFFFFF", green:"#2D6A4F", greenLight:"#52B788",
  greenPale:"#D8F3DC", teal:"#1B4332", accent:"#E76F51", accentLight:"#FFF0EB",
  text:"#1A1A2E", muted:"#8E9BAE", border:"#EDE8E0", softGreen:"#F0FAF4",
  purple:"#7C5CBF", purplePale:"#F0EBF8", yellow:"#F4A261", yellowPale:"#FEF3E2",
};
const F = { display:"'Playfair Display', Georgia, serif", body:"'DM Sans', sans-serif" };

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
  .fade-up  { animation:fadeUp  0.38s ease forwards; }
  .slide-in { animation:slideIn 0.32s ease forwards; }
`;

// ── All possible meals ─────────────────────────────────────────────────────
const ALL_MEALS = [
  { id:"desayuno",    label:"Desayuno",           icon:"🍳", defaultNote:"Completo y equilibrado" },
  { id:"colacion_m",  label:"Colación mañana",    icon:"🍎", defaultNote:"Fruta o lácteo descremado" },
  { id:"almuerzo",    label:"Almuerzo",            icon:"🥗", defaultNote:"Plato principal según plan" },
  { id:"colacion_t",  label:"Colación tarde",      icon:"🥑", defaultNote:"Alta en proteína" },
  { id:"once",        label:"Once",                icon:"🫖", defaultNote:"Liviana, sin azúcar añadida" },
  { id:"cena",        label:"Cena",                icon:"🍲", defaultNote:"Cena ligera antes de las 21h" },
  { id:"colacion_n",  label:"Colación nocturna",   icon:"🌙", defaultNote:"Solo si hay indicación médica" },
  { id:"hidratacion", label:"Hidratación",         icon:"💧", defaultNote:"8 vasos de agua al día" },
  { id:"sin_azucar",  label:"Sin azúcar añadida",  icon:"🚫", defaultNote:"Evitar azúcar libre todo el día" },
];

const MOODS    = [{v:1,e:"😫",l:"Muy mal"},{v:2,e:"😕",l:"Mal"},{v:3,e:"😐",l:"Regular"},{v:4,e:"🙂",l:"Bien"},{v:5,e:"😄",l:"Excelente"}];
const ENERGIES = [{v:1,e:"🪫",l:"Sin energía"},{v:2,e:"😴",l:"Cansada"},{v:3,e:"😊",l:"Normal"},{v:4,e:"⚡",l:"Con energía"},{v:5,e:"🔋",l:"Muy activa"}];

const MSG_TYPES = [
  {value:"praise",label:"Reconocimiento 👏",color:C.green,   bg:C.greenPale},
  {value:"alert", label:"Aviso ⚠️",         color:C.accent,  bg:C.accentLight},
  {value:"goal",  label:"Meta semanal 🎯",  color:C.purple,  bg:C.purplePale},
  {value:"tip",   label:"Consejo 💡",        color:C.yellow,  bg:C.yellowPale},
];

const PRESET_MSGS = [
  "Vi que esta semana cumpliste súper bien tu hidratación 👏",
  "Ojo con el desayuno, llevas 3 días sin registrarlo 🍳",
  "Excelente avance esta semana 💪",
  "Recuerda priorizar colaciones altas en proteína 🥚",
  "Meta de esta semana: consumir verduras en 2 comidas al día 🥦",
  "Tu glucosa se ha mantenido muy estable, ¡felicitaciones! 🩸",
];

const MSG_STYLE = {
  praise:{bg:"#EAF7EE",border:C.greenLight,icon:"👏",label:"Reconocimiento",labelColor:C.green},
  alert: {bg:"#FFF4F0",border:C.accent,    icon:"⚠️",label:"Aviso",         labelColor:C.accent},
  goal:  {bg:"#F0EBF8",border:C.purple,    icon:"🎯",label:"Meta semanal",  labelColor:C.purple},
  tip:   {bg:C.yellowPale,border:C.yellow, icon:"💡",label:"Consejo",       labelColor:C.yellow},
};

const PATIENT_TYPES = ["Embarazada","Nodriza","Bebé (mamá)","Adulto","Adulto Mayor","Otro"];
const CONDITIONS    = ["Diabetes tipo 2","Hipertensión","Dislipidemia","Obesidad","Diabetes gestacional","Seguimiento general","Alimentación complementaria","Otro"];

const typeColor = t => ({"Embarazada":"#E0BBE4","Nodriza":"#FFC8A2","Adulto":"#B5EAD7","Adulto Mayor":"#C7CEEA","Bebé (mamá)":"#FFDAC1","Otro":"#D4E6F1"}[t]||C.greenPale);

// ── Initial data ───────────────────────────────────────────────────────────
const INIT_PATIENTS = [
  {
    id:1, name:"María González", avatar:"MG", type:"Embarazada", age:28,
    condition:"Diabetes gestacional", nextControl:"2026-05-18",
    adherence:85, mood:4, energy:4,
    plan:[
      {id:"desayuno",   label:"Desayuno",          icon:"🍳",note:"Incluir proteína + carbohidrato complejo",done:true},
      {id:"colacion_m", label:"Colación mañana",   icon:"🍎",note:"Fruta de bajo IG + lácteo descremado",   done:true},
      {id:"almuerzo",   label:"Almuerzo",           icon:"🥗",note:"Plato equilibrado sin harinas refinadas",done:false},
      {id:"colacion_t", label:"Colación tarde",     icon:"🥑",note:"Alta en proteína, evitar fruta sola",   done:false},
      {id:"cena",       label:"Cena",               icon:"🍲",note:"Liviana antes de las 20:30h",           done:false},
      {id:"hidratacion",label:"Hidratación",        icon:"💧",note:"Mínimo 8 vasos de agua",                done:true},
      {id:"sin_azucar", label:"Sin azúcar añadida", icon:"🚫",note:"Evitar azúcar libre todo el día",       done:false},
    ],
    messages:[
      {id:1,type:"praise",text:"Vi que esta semana cumpliste súper bien tu hidratación 👏 ¡Sigue así!",date:"Hoy, 09:15",read:false},
      {id:2,type:"goal",  text:"Meta de esta semana: consumir verduras en 2 comidas al día 🥦",       date:"Lun, 08:00",read:true},
    ],
    doubts:[
      {id:1,question:"¿Puedo comer fruta en la noche?",date:"2026-05-09",answered:false},
      {id:2,question:"¿El plátano está permitido?",    date:"2026-05-01",answered:true,answer:"Con moderación sí, prefiere el plátano verde. Una porción pequeña (80g) en el desayuno está bien."},
    ],
  },
  {
    id:2, name:"Carlos Ruiz", avatar:"CR", type:"Adulto", age:54,
    condition:"Hipertensión + Dislipidemia", nextControl:"2026-05-14",
    adherence:62, mood:2, energy:2,
    plan:[
      {id:"desayuno",   label:"Desayuno",  icon:"🍳",note:"Sin sal añadida, avena o pan integral",     done:false},
      {id:"almuerzo",   label:"Almuerzo",  icon:"🥗",note:"Proteína magra + verduras al vapor",        done:false},
      {id:"once",       label:"Once",      icon:"🫖",note:"Sin embutidos, preferir queso fresco",      done:false},
      {id:"cena",       label:"Cena",      icon:"🍲",note:"Sopa o ensalada, porción moderada",         done:false},
      {id:"hidratacion",label:"Hidratación",icon:"💧",note:"2 litros diarios, evitar bebidas con gas", done:false},
    ],
    messages:[
      {id:1,type:"alert",text:"Ojo con el desayuno, llevas 3 días sin registrarlo 🍳 ¿Todo bien?",date:"Ayer, 18:30",read:false},
    ],
    doubts:[],
  },
  {
    id:3, name:"Sofía Mendoza", avatar:"SM", type:"Adulto Mayor", age:67,
    condition:"Diabetes tipo 2", nextControl:"2026-05-20",
    adherence:91, mood:5, energy:4,
    plan:[
      {id:"desayuno",   label:"Desayuno",          icon:"🍳",note:"Fraccionado, pequeño y nutritivo",      done:true},
      {id:"colacion_m", label:"Colación mañana",   icon:"🍎",note:"Yogur natural sin azúcar",             done:true},
      {id:"almuerzo",   label:"Almuerzo",           icon:"🥗",note:"Porción mediana, masticar bien",       done:true},
      {id:"colacion_t", label:"Colación tarde",     icon:"🥑",note:"Puñado de nueces o almendras",        done:false},
      {id:"cena",       label:"Cena",               icon:"🍲",note:"Sopa liviana o puré sin papa",        done:false},
      {id:"hidratacion",label:"Hidratación",        icon:"💧",note:"6-8 vasos, puede ser agua con gas",   done:true},
      {id:"sin_azucar", label:"Sin azúcar añadida", icon:"🚫",note:"Usar stevia si necesita endulzar",    done:false},
    ],
    messages:[
      {id:1,type:"praise",text:"Excelente avance esta semana 💪 Tu glucosa se ha mantenido muy estable.",date:"Dom, 17:00",read:true},
    ],
    doubts:[
      {id:1,question:"¿Cuántas porciones de carbohidrato puedo tener en el almuerzo?",date:"2026-05-07",answered:true,answer:"Para tu caso, te recomiendo 2 porciones de carbohidrato de bajo índice glucémico."},
    ],
  },
];

const VALID_CODES = [
  {code:"MG-2847", rut:"12.345.678-9", patientId:1},
  {code:"CR-5512", rut:"8.765.432-1",  patientId:2},
  {code:"SM-9901", rut:"5.111.222-3",  patientId:3},
];

// ── Shared small components ────────────────────────────────────────────────
const Avatar = ({initials,bg=C.green,size=38}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:F.body,fontWeight:700,fontSize:size*0.34,flexShrink:0}}>{initials}</div>
);
const Badge = ({label,color=C.greenPale,text=C.green}) => (
  <span style={{background:color,color:text,borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>
);
const Card = ({children,style={}}) => (
  <div style={{background:C.card,borderRadius:18,border:`1px solid ${C.border}`,padding:18,boxShadow:"0 2px 12px rgba(0,0,0,0.04)",...style}}>{children}</div>
);
const ProgressBar = ({value,color=C.greenLight,height=8}) => (
  <div style={{background:C.border,borderRadius:8,height,overflow:"hidden"}}>
    <div style={{width:`${Math.min(value,100)}%`,height:"100%",background:color,borderRadius:8,transition:"width 0.5s ease"}}/>
  </div>
);
const Btn = ({children,onClick,variant="primary",disabled=false,full=false,style={}}) => {
  const v = {
    primary:{background:disabled?"#C8D8CF":C.green,color:"#fff"},
    ghost:{background:"none",color:C.muted,border:`1.5px solid ${C.border}`},
    soft:{background:C.softGreen,color:C.green},
    accent:{background:C.accent,color:"#fff"},
  };
  return <button onClick={onClick} disabled={disabled}
    style={{border:"none",borderRadius:12,padding:"11px 18px",fontFamily:F.body,fontWeight:700,fontSize:13,cursor:disabled?"not-allowed":"pointer",transition:"all 0.2s",width:full?"100%":"auto",...v[variant],...style}}>
    {children}
  </button>;
};
const Input = ({label,value,onChange,placeholder,type="text",hint}) => (
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label && <label style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:0.5}}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{border:`1.5px solid ${C.border}`,borderRadius:12,padding:"10px 14px",fontFamily:F.body,fontSize:14,color:C.text,background:C.bg,outline:"none"}}
      onFocus={e=>e.target.style.borderColor=C.greenLight} onBlur={e=>e.target.style.borderColor=C.border}/>
    {hint && <p style={{fontSize:11,color:C.muted}}>{hint}</p>}
  </div>
);

const daysUntil = d => Math.ceil((new Date(d)-new Date("2026-05-10"))/86400000);

// ══════════════════════════════════════════════════════════════════════════
// AUTH SCREENS
// ══════════════════════════════════════════════════════════════════════════
const Landing = ({onNutri, onPatient}) => (
  <div className="fade-up" style={{minHeight:"100vh",background:"#E0D8CF",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:32}}>
    <div style={{textAlign:"center"}}>
      <p style={{fontFamily:F.display,fontSize:42,color:C.teal,fontWeight:700,lineHeight:1}}>Nutri<span style={{color:C.greenLight}}>Track</span></p>
      <p style={{fontSize:14,color:C.muted,marginTop:10}}>Seguimiento nutricional personalizado</p>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%",maxWidth:420}}>
      {[
        {icon:"👩‍⚕️",title:"Soy nutricionista",desc:"Gestiona pacientes, planes y seguimiento",onClick:onNutri,bg:`linear-gradient(135deg,${C.teal},${C.green})`},
        {icon:"🧑‍💼",title:"Soy paciente",desc:"Ingresa con tu código de acceso",onClick:onPatient,bg:`linear-gradient(135deg,${C.green},${C.greenLight})`},
      ].map(c=>(
        <div key={c.title} onClick={c.onClick}
          style={{background:c.bg,borderRadius:20,padding:"22px 24px",cursor:"pointer",display:"flex",gap:18,alignItems:"center",boxShadow:"0 8px 24px rgba(0,0,0,0.12)",transition:"transform 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
          <span style={{fontSize:36}}>{c.icon}</span>
          <div>
            <p style={{fontFamily:F.display,fontSize:20,color:"#fff",fontWeight:700}}>{c.title}</p>
            <p style={{color:"rgba(255,255,255,0.7)",fontSize:13,marginTop:4}}>{c.desc}</p>
          </div>
          <span style={{color:"rgba(255,255,255,0.6)",fontSize:22,marginLeft:"auto"}}>→</span>
        </div>
      ))}
    </div>
  </div>
);

const NutriLogin = ({onLogin, onBack}) => {
  const [pass, setPass] = useState("");
  const [err, setErr]   = useState("");
  const attempt = () => {
    if (pass === "nutri123") { onLogin(); }
    else { setErr("Contraseña incorrecta"); }
  };
  return (
    <div style={{minHeight:"100vh",background:"#E0D8CF",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:400}} className="fade-up">
        <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,fontFamily:F.body,fontSize:13,cursor:"pointer",fontWeight:600,marginBottom:20}}>← Volver</button>
        <Card>
          <div style={{textAlign:"center",marginBottom:24}}>
            <span style={{fontSize:40}}>👩‍⚕️</span>
            <p style={{fontFamily:F.display,fontSize:22,color:C.teal,fontWeight:700,marginTop:10}}>Panel Nutricionista</p>
            <p style={{fontSize:13,color:C.muted,marginTop:4}}>Contraseña de prueba: <strong>nutri123</strong></p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Input label="Contraseña" value={pass} onChange={setPass} placeholder="••••••••" type="password"/>
            {err && <p style={{fontSize:13,color:C.accent,fontWeight:500}}>{err}</p>}
            <Btn onClick={attempt} full>Ingresar →</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
};

const PatientLogin = ({onLogin, onBack}) => {
  const [digits, setDigits] = useState(["","","","","",""]);
  const [rut, setRut]       = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");

  const handleDigit = (val, i) => {
    const d = [...digits]; d[i] = val.toUpperCase().slice(-1); setDigits(d);
    if (val && i < 5) document.getElementById(`d${i+1}`)?.focus();
  };
  const code = digits.slice(0,2).join("") + "-" + digits.slice(2).join("");

  const attempt = () => {
    setLoading(true); setErr("");
    setTimeout(() => {
      const match = VALID_CODES.find(c => c.code===code.toUpperCase() && c.rut===rut.trim());
      if (match) { onLogin(match.patientId); }
      else { setErr("Código o RUT incorrecto. Verifica los datos."); }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{minHeight:"100vh",background:"#E0D8CF",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:400}} className="fade-up">
        <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,fontFamily:F.body,fontSize:13,cursor:"pointer",fontWeight:600,marginBottom:20}}>← Volver</button>
        <Card>
          <div style={{textAlign:"center",marginBottom:24}}>
            <p style={{fontFamily:F.display,fontSize:22,color:C.teal,fontWeight:700}}>Ingresa a tu cuenta</p>
            <p style={{fontSize:13,color:C.muted,marginTop:6}}>Usa el código que te envió tu nutricionista</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:10}}>🔑 Código de acceso</label>
              <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"center"}}>
                {[0,1].map(i=>(
                  <input key={i} id={`d${i}`} maxLength={1} value={digits[i]} onChange={e=>handleDigit(e.target.value,i)}
                    style={{width:46,height:54,textAlign:"center",fontSize:20,fontWeight:700,border:`2px solid ${digits[i]?C.greenLight:C.border}`,borderRadius:12,background:digits[i]?C.softGreen:C.bg,color:C.teal,outline:"none",fontFamily:F.body,textTransform:"uppercase",transition:"all 0.2s"}}/>
                ))}
                <span style={{fontSize:22,color:C.muted,fontWeight:300}}>-</span>
                {[2,3,4,5].map(i=>(
                  <input key={i} id={`d${i}`} maxLength={1} value={digits[i]} onChange={e=>handleDigit(e.target.value,i)}
                    style={{width:46,height:54,textAlign:"center",fontSize:20,fontWeight:700,border:`2px solid ${digits[i]?C.greenLight:C.border}`,borderRadius:12,background:digits[i]?C.softGreen:C.bg,color:C.teal,outline:"none",fontFamily:F.body,textTransform:"uppercase",transition:"all 0.2s"}}/>
                ))}
              </div>
            </div>
            <Input label="🪪 RUT / Cédula" value={rut} onChange={setRut} placeholder="Ej. 12.345.678-9"/>
            {err && <div style={{background:"#FDE8E8",borderRadius:12,padding:"10px 14px"}}><p style={{fontSize:13,color:"#C0392B"}}>{err}</p></div>}
            <Btn onClick={attempt} disabled={code.replace("-","").length<6||rut.length<6||loading} full>
              {loading ? "Verificando..." : "Ingresar →"}
            </Btn>
            <div style={{background:C.softGreen,borderRadius:12,padding:12,border:`1px solid ${C.greenPale}`}}>
              <p style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:4}}>🧪 Datos de prueba</p>
              <p style={{fontSize:12,color:C.muted,lineHeight:1.8}}>
                MG2847 · RUT: 12.345.678-9 (María)<br/>
                CR5512 · RUT: 8.765.432-1 (Carlos)<br/>
                SM9901 · RUT: 5.111.222-3 (Sofía)
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PATIENT APP
// ══════════════════════════════════════════════════════════════════════════
const PatientApp = ({patient, setPatient, onLogout}) => {
  const [tab, setTab]     = useState("home");
  const [mood, setMood]   = useState(null);
  const [energy, setEnergy] = useState(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [newQ, setNewQ]   = useState("");
  const [sentQ, setSentQ] = useState(false);

  const toggleMeal = id => setPatient(p => ({...p, plan:p.plan.map(m=>m.id===id?{...m,done:!m.done}:m)}));
  const markRead   = id => setPatient(p => ({...p, messages:p.messages.map(m=>m.id===id?{...m,read:true}:m)}));
  const sendDoubt  = () => {
    if (!newQ.trim()) return;
    setPatient(p => ({...p, doubts:[{id:Date.now(),question:newQ,date:"2026-05-10",answered:false},...p.doubts]}));
    setNewQ(""); setSentQ(true); setTimeout(()=>setSentQ(false),2500);
  };
  const saveMood = () => { if(mood&&energy){ setMoodSaved(true); setPatient(p=>({...p,mood,energy})); }};

  const done  = patient.plan.filter(m=>m.done).length;
  const total = patient.plan.length;
  const pct   = Math.round((done/total)*100);
  const unread = patient.messages.filter(m=>!m.read).length;
  const days  = daysUntil(patient.nextControl);

  const NAV = [
    {id:"home",    icon:"🏠",label:"Inicio"},
    {id:"plan",    icon:"🍽️",label:"Mi plan"},
    {id:"messages",icon:"💌",label:"Mensajes"},
    {id:"doubts",  icon:"💬",label:"Dudas"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#E0D8CF",display:"flex",justifyContent:"center",alignItems:"flex-start",padding:"0 0 0 0"}}>
      <div style={{width:"100%",maxWidth:430,background:C.bg,minHeight:"100vh",position:"relative",display:"flex",flexDirection:"column"}}>

        {/* Top bar */}
        <div style={{background:C.teal,padding:"14px 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <p style={{fontFamily:F.display,fontSize:18,color:"#fff",fontWeight:700}}>Nutri<span style={{color:C.greenLight}}>Track</span></p>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"5px 12px",color:"rgba(255,255,255,0.7)",fontFamily:F.body,fontSize:12,cursor:"pointer"}}>Salir</button>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:"20px 18px 90px"}}>

          {/* HOME */}
          {tab==="home" && (
            <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:16}}>
              {/* Header card */}
              <div style={{background:`linear-gradient(145deg,${C.teal},${C.green})`,borderRadius:20,padding:"22px 20px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <p style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginBottom:4}}>Hola 👋</p>
                    <h2 style={{fontFamily:F.display,fontSize:22,color:"#fff",fontWeight:700}}>{patient.name.split(" ")[0]}</h2>
                    <p style={{color:"rgba(255,255,255,0.6)",fontSize:12,marginTop:4}}>{patient.condition}</p>
                  </div>
                  <div style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"10px 14px",textAlign:"center"}}>
                    <p style={{fontFamily:F.display,fontSize:26,color:"#fff",fontWeight:700,lineHeight:1}}>{days}</p>
                    <p style={{color:"rgba(255,255,255,0.6)",fontSize:10}}>días control</p>
                  </div>
                </div>
              </div>

              {/* Mood check-in */}
              <Card style={{border:`1.5px solid ${moodSaved?C.greenLight:C.border}`}}>
                <p style={{fontFamily:F.display,fontSize:15,color:C.teal,fontWeight:600,marginBottom:12}}>¿Cómo te sientes hoy?</p>
                {!moodSaved ? (
                  <>
                    <p style={{fontSize:12,color:C.muted,marginBottom:8}}>Ánimo</p>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                      {MOODS.map(m=>(
                        <button key={m.v} onClick={()=>setMood(m.v)}
                          style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:mood===m.v?C.softGreen:"none",border:`1.5px solid ${mood===m.v?C.greenLight:C.border}`,borderRadius:12,padding:"8px 4px",cursor:"pointer",flex:1,margin:"0 2px",transition:"all 0.2s"}}>
                          <span style={{fontSize:22}}>{m.e}</span>
                          <span style={{fontSize:9,color:mood===m.v?C.green:C.muted,fontWeight:mood===m.v?700:400}}>{m.l}</span>
                        </button>
                      ))}
                    </div>
                    <p style={{fontSize:12,color:C.muted,marginBottom:8}}>Energía</p>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                      {ENERGIES.map(e=>(
                        <button key={e.v} onClick={()=>setEnergy(e.v)}
                          style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:energy===e.v?C.purplePale:"none",border:`1.5px solid ${energy===e.v?C.purple:C.border}`,borderRadius:12,padding:"8px 4px",cursor:"pointer",flex:1,margin:"0 2px",transition:"all 0.2s"}}>
                          <span style={{fontSize:22}}>{e.e}</span>
                          <span style={{fontSize:9,color:energy===e.v?C.purple:C.muted,fontWeight:energy===e.v?700:400}}>{e.l}</span>
                        </button>
                      ))}
                    </div>
                    <Btn onClick={saveMood} disabled={!mood||!energy} full>Registrar cómo me siento</Btn>
                  </>
                ) : (
                  <div style={{textAlign:"center",padding:"6px 0"}}>
                    <p style={{fontSize:30,marginBottom:6}}>{MOODS.find(m=>m.v===mood)?.e} {ENERGIES.find(e=>e.v===energy)?.e}</p>
                    <p style={{fontWeight:600,color:C.green,fontSize:13}}>¡Tu nutricionista puede ver cómo te sientes! 🌱</p>
                  </div>
                )}
              </Card>

              {/* Messages preview */}
              {unread > 0 && (
                <div onClick={()=>setTab("messages")} style={{background:`linear-gradient(135deg,${C.purple}18,${C.purple}06)`,border:`1.5px solid ${C.purple}44`,borderRadius:16,padding:14,cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{position:"relative",flexShrink:0}}>
                    <span style={{fontSize:26}}>💌</span>
                    <div style={{position:"absolute",top:-2,right:-2,background:C.accent,borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{color:"#fff",fontSize:9,fontWeight:700}}>{unread}</span>
                    </div>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:700,fontSize:13,color:C.purple}}>{unread} mensaje{unread>1?"s":""} de tu nutricionista</p>
                    <p style={{fontSize:12,color:C.muted,marginTop:2}}>{patient.messages.find(m=>!m.read)?.text.slice(0,50)}...</p>
                  </div>
                  <span style={{color:C.muted}}>→</span>
                </div>
              )}

              {/* Plan summary */}
              <Card>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <p style={{fontFamily:F.display,fontSize:15,color:C.teal,fontWeight:600}}>Mi plan de hoy</p>
                  <span style={{fontSize:13,fontWeight:700,color:pct>=70?C.green:C.accent}}>{done}/{total}</span>
                </div>
                <ProgressBar value={pct} color={pct>=70?C.greenLight:C.accent} height={10}/>
                <p style={{fontSize:12,color:C.muted,marginTop:8}}>{pct===100?"¡Plan completado! 🎉":pct>=70?"¡Vas muy bien! 🌱":"Puedes seguir sumando 💪"}</p>
                <Btn onClick={()=>setTab("plan")} variant="soft" full style={{marginTop:12}}>Ver mi plan completo →</Btn>
              </Card>
            </div>
          )}

          {/* PLAN */}
          {tab==="plan" && (
            <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <p style={{fontFamily:F.display,fontSize:20,color:C.teal,fontWeight:700}}>Mi plan del día</p>
                <p style={{fontSize:12,color:C.muted,marginTop:2}}>Toca cada comida cuando la realices</p>
              </div>
              <Card style={{display:"flex",gap:16,alignItems:"center"}}>
                <svg width="68" height="68" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="30" fill="none" stroke={C.border} strokeWidth="8"/>
                  <circle cx="36" cy="36" r="30" fill="none" stroke={C.greenLight} strokeWidth="8"
                    strokeDasharray={`${pct*1.885} 188.5`} strokeLinecap="round" transform="rotate(-90 36 36)"
                    style={{transition:"stroke-dasharray 0.5s ease"}}/>
                  <text x="36" y="41" textAnchor="middle" fontSize="15" fontWeight="700" fill={C.teal} fontFamily={F.body}>{pct}%</text>
                </svg>
                <div>
                  <p style={{fontFamily:F.display,fontSize:16,color:C.teal,fontWeight:600}}>{done} de {total} realizadas</p>
                  <p style={{fontSize:12,color:C.muted,marginTop:4}}>Plan de {total} comidas/hábitos</p>
                </div>
              </Card>
              {patient.plan.map(m=>(
                <div key={m.id} onClick={()=>toggleMeal(m.id)}
                  style={{background:C.card,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:14,cursor:"pointer",border:`1.5px solid ${m.done?C.greenLight:C.border}`,transition:"all 0.2s"}}>
                  <span style={{fontSize:24,flexShrink:0,marginTop:2}}>{m.icon}</span>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,fontWeight:700,color:m.done?C.green:C.text,textDecoration:m.done?"line-through":"none"}}>{m.label}</p>
                    <p style={{fontSize:12,color:C.muted,marginTop:4,lineHeight:1.4,fontStyle:"italic"}}>{m.note}</p>
                  </div>
                  <div style={{width:24,height:24,borderRadius:"50%",background:m.done?C.green:C.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.2s",marginTop:2}}>
                    {m.done&&<span style={{color:"#fff",fontSize:12}}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MESSAGES */}
          {tab==="messages" && (
            <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <p style={{fontFamily:F.display,fontSize:20,color:C.teal,fontWeight:700}}>Mensajes</p>
                <p style={{fontSize:12,color:C.muted,marginTop:2}}>Acompañamiento de tu nutricionista</p>
              </div>
              {patient.messages.map(m=>{
                const s=MSG_STYLE[m.type];
                return(
                  <div key={m.id} onClick={()=>markRead(m.id)}
                    style={{background:s.bg,borderRadius:16,padding:16,borderLeft:`4px solid ${s.border}`,cursor:"pointer",opacity:m.read?0.85:1,transition:"opacity 0.2s",position:"relative"}}>
                    {!m.read&&<div style={{position:"absolute",top:14,right:14,width:9,height:9,borderRadius:"50%",background:C.accent}}/>}
                    <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <span style={{fontSize:22,flexShrink:0}}>{s.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                          <span style={{fontSize:10,fontWeight:700,color:s.labelColor,textTransform:"uppercase",letterSpacing:0.5}}>{s.label}</span>
                          <span style={{fontSize:10,color:C.muted}}>{m.date}</span>
                        </div>
                        <p style={{fontSize:14,color:C.text,lineHeight:1.55}}>{m.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {patient.messages.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted}}><p style={{fontSize:32,marginBottom:10}}>💌</p><p>Tu nutricionista aún no ha enviado mensajes</p></div>}
            </div>
          )}

          {/* DOUBTS */}
          {tab==="doubts" && (
            <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <p style={{fontFamily:F.display,fontSize:20,color:C.teal,fontWeight:700}}>Mis dudas</p>
                <p style={{fontSize:12,color:C.muted,marginTop:2}}>Consulta a tu nutricionista</p>
              </div>
              <Card>
                <p style={{fontFamily:F.display,fontSize:15,color:C.teal,marginBottom:10}}>Nueva consulta</p>
                <textarea value={newQ} onChange={e=>setNewQ(e.target.value)} placeholder="Escribe tu pregunta aquí..."
                  style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:12,padding:12,fontFamily:F.body,fontSize:13,color:C.text,background:C.bg,resize:"none",height:85,outline:"none"}}
                  onFocus={e=>e.target.style.borderColor=C.greenLight} onBlur={e=>e.target.style.borderColor=C.border}/>
                <Btn onClick={sendDoubt} full style={{marginTop:10,background:sentQ?C.greenLight:C.green,color:"#fff"}}>
                  {sentQ?"✓ Enviada":"Enviar pregunta"}
                </Btn>
              </Card>
              {patient.doubts.map(d=>(
                <div key={d.id} style={{background:C.card,borderRadius:16,padding:16,borderLeft:`4px solid ${d.answered?C.greenLight:C.accent}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:11,color:C.muted}}>{d.date}</span>
                    <Badge label={d.answered?"Respondida ✓":"Pendiente..."} color={d.answered?C.greenPale:C.accentLight} text={d.answered?C.green:C.accent}/>
                  </div>
                  <p style={{fontSize:14,color:C.text,lineHeight:1.5,fontStyle:"italic"}}>"{d.question}"</p>
                  {d.answered&&(
                    <div style={{marginTop:12,background:C.softGreen,borderRadius:10,padding:12}}>
                      <p style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:4}}>Tu nutricionista:</p>
                      <p style={{fontSize:13,color:C.teal,lineHeight:1.5}}>{d.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.card,borderTop:`1px solid ${C.border}`,padding:"10px 8px 18px",display:"flex",justifyContent:"space-around",zIndex:100}}>
          {NAV.map(n=>{
            const active=tab===n.id;
            return(
              <button key={n.id} onClick={()=>setTab(n.id)}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"6px 14px",borderRadius:12,position:"relative"}}>
                <span style={{fontSize:20,filter:active?"none":"grayscale(60%) opacity(0.55)"}}>{n.icon}</span>
                <span style={{fontSize:10,fontFamily:F.body,fontWeight:active?700:400,color:active?C.green:C.muted}}>{n.label}</span>
                {n.id==="messages"&&unread>0&&<div style={{position:"absolute",top:4,right:8,background:C.accent,borderRadius:"50%",width:8,height:8}}/>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// NUTRITIONIST PANEL
// ══════════════════════════════════════════════════════════════════════════
const NutritionistPanel = ({patients, setPatients, onLogout}) => {
  const [view, setView]       = useState("dashboard"); // dashboard | plan-editor | messages | register
  const [editingId, setEditingId] = useState(null);
  const [msgForm, setMsgForm] = useState({patientId:"all",type:"praise",text:"",scheduled:false,schedDate:""});
  const [msgSent, setMsgSent] = useState(false);
  const [navOpen, setNavOpen] = useState(true);

  // ── Plan editor ──
  const PlanEditor = ({patient}) => {
    const [sel, setSel]   = useState(patient.plan.map(m=>({...m})));
    const [saved, setSaved] = useState(false);
    const isSelected = id => sel.some(m=>m.id===id);
    const toggle = meal => {
      if(isSelected(meal.id)) setSel(p=>p.filter(m=>m.id!==meal.id));
      else setSel(p=>[...p,{...meal,note:meal.defaultNote,done:false}]);
    };
    const updateNote = (id,note) => setSel(p=>p.map(m=>m.id===id?{...m,note}:m));
    const ordered = ALL_MEALS.filter(m=>isSelected(m.id)).map(m=>({...sel.find(s=>s.id===m.id)}));
    const save = () => {
      setSaved(true);
      setPatients(prev=>prev.map(p=>p.id===patient.id?{...p,plan:ordered}:p));
      setTimeout(()=>{ setEditingId(null); setView("dashboard"); },800);
    };
    return (
      <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:20}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <button onClick={()=>{setEditingId(null);setView("dashboard");}} style={{background:"none",border:"none",color:C.muted,fontFamily:F.body,fontSize:13,cursor:"pointer",fontWeight:600}}>← Volver</button>
          <Avatar initials={patient.avatar} size={44}/>
          <div>
            <p style={{fontFamily:F.display,fontSize:20,color:C.teal,fontWeight:700}}>{patient.name}</p>
            <p style={{fontSize:13,color:C.muted}}>{patient.condition}</p>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <Card>
            <p style={{fontFamily:F.display,fontSize:16,color:C.teal,marginBottom:4}}>Seleccionar comidas</p>
            <p style={{fontSize:12,color:C.muted,marginBottom:14}}>Activa solo las que correspondan a este paciente</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {ALL_MEALS.map(meal=>{
                const active=isSelected(meal.id);
                return(
                  <div key={meal.id} onClick={()=>toggle(meal)}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:13,border:`1.5px solid ${active?C.greenLight:C.border}`,background:active?C.softGreen:C.bg,cursor:"pointer",transition:"all 0.2s"}}>
                    <span style={{fontSize:20,flexShrink:0}}>{meal.icon}</span>
                    <p style={{flex:1,fontSize:13,fontWeight:active?700:400,color:active?C.green:C.text}}>{meal.label}</p>
                    <div style={{width:22,height:22,borderRadius:"50%",background:active?C.green:C.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {active&&<span style={{color:"#fff",fontSize:11}}>✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {ordered.length>0 ? (
              <Card>
                <p style={{fontFamily:F.display,fontSize:16,color:C.teal,marginBottom:14}}>Indicaciones por comida</p>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {ordered.map(m=>(
                    <div key={m.id}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                        <span style={{fontSize:16}}>{m.icon}</span>
                        <p style={{fontSize:13,fontWeight:700,color:C.teal}}>{m.label}</p>
                      </div>
                      <textarea value={m.note} onChange={e=>updateNote(m.id,e.target.value)}
                        style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:10,padding:"8px 12px",fontFamily:F.body,fontSize:12,color:C.text,background:C.bg,resize:"none",height:58,outline:"none",lineHeight:1.5}}
                        onFocus={e=>e.target.style.borderColor=C.greenLight} onBlur={e=>e.target.style.borderColor=C.border}/>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,minHeight:180}}>
                <span style={{fontSize:32}}>🍽️</span>
                <p style={{fontSize:13,color:C.muted,textAlign:"center"}}>Selecciona comidas para agregar indicaciones</p>
              </Card>
            )}
            {ordered.length>0&&(
              <Card style={{background:`linear-gradient(135deg,${C.teal},${C.green})`,border:"none"}}>
                <p style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginBottom:6}}>Plan de {ordered.length} comidas</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {ordered.map(m=><span key={m.id} style={{background:"rgba(255,255,255,0.15)",color:"#fff",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:600}}>{m.icon} {m.label}</span>)}
                </div>
              </Card>
            )}
            <Btn onClick={save} disabled={ordered.length===0||saved} full
              style={{background:saved?C.greenLight:C.green,color:"#fff"}}>
              {saved?"✓ Guardado":"Guardar plan"}
            </Btn>
          </div>
        </div>
      </div>
    );
  };

  // ── Messages ──
  const sendMessage = () => {
    if(!msgForm.text) return;
    const msg = {id:Date.now(),type:msgForm.type,text:msgForm.text,date:"Ahora",read:false};
    if(msgForm.patientId==="all") {
      setPatients(prev=>prev.map(p=>({...p,messages:[msg,...p.messages]})));
    } else {
      setPatients(prev=>prev.map(p=>p.id===Number(msgForm.patientId)?{...p,messages:[msg,...p.messages]}:p));
    }
    setMsgForm({patientId:"all",type:"praise",text:"",scheduled:false,schedDate:""});
    setMsgSent(true); setTimeout(()=>setMsgSent(false),2500);
  };

  const NUTRI_NAV = [
    {id:"dashboard",icon:"🏠",label:"Dashboard"},
    {id:"messages", icon:"💌",label:"Mensajes"},
    {id:"register", icon:"➕",label:"Registrar"},
  ];

  // ── Register patient ──
  const [regStep, setRegStep] = useState(1);
  const [regData, setRegData] = useState({name:"",id:"",phone:"",age:"",type:"",customType:"",condition:"",notes:"",nextControl:""});
  const [regCode, setRegCode] = useState("");
  const [regCopied, setRegCopied] = useState(false);

  const genCode = () => {
    const ini = regData.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"PA";
    return `${ini}-${Math.floor(1000+Math.random()*9000)}`;
  };

  const goRegStep3 = () => { setRegCode(genCode()); setRegStep(3); };
  const regMsg = `Hola ${regData.name.split(" ")[0]||""}! 👋\n\nBienvenida/o a NutriLife.\n\n🔑 Código: *${regCode}*\n🪪 RUT: *${regData.id}*\n\n¡Estoy aquí para acompañarte! 🌱`;

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.bg}}>
      {/* Sidebar */}
      <div style={{width:navOpen?210:62,background:C.teal,display:"flex",flexDirection:"column",padding:navOpen?"22px 14px":"22px 10px",flexShrink:0,transition:"width 0.25s ease",overflow:"hidden",position:"sticky",top:0,height:"100vh"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:navOpen?"space-between":"center",marginBottom:28}}>
          {navOpen&&<p style={{fontFamily:F.display,fontSize:18,color:"#fff",fontWeight:700,whiteSpace:"nowrap"}}>Nutri<span style={{color:C.greenLight}}>Track</span></p>}
          <button onClick={()=>setNavOpen(o=>!o)} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:"#fff",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {navOpen?"◀":"▶"}
          </button>
        </div>
        <nav style={{display:"flex",flexDirection:"column",gap:4,flex:1}}>
          {NUTRI_NAV.map(n=>{
            const active=view===n.id||(view==="plan-editor"&&n.id==="dashboard");
            return(
              <button key={n.id} onClick={()=>{setView(n.id);setEditingId(null);}} title={!navOpen?n.label:""}
                style={{display:"flex",alignItems:"center",gap:navOpen?10:0,justifyContent:navOpen?"flex-start":"center",padding:"10px",borderRadius:12,border:"none",background:active?"rgba(255,255,255,0.12)":"none",color:active?"#fff":"rgba(255,255,255,0.6)",fontFamily:F.body,fontSize:13,fontWeight:active?700:400,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"}}>
                <span style={{fontSize:18,flexShrink:0}}>{n.icon}</span>
                {navOpen&&n.label}
              </button>
            );
          })}
        </nav>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:14,display:"flex",alignItems:"center",gap:navOpen?10:0,justifyContent:navOpen?"flex-start":"center"}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:C.greenLight,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12,flexShrink:0}}>TN</div>
          {navOpen&&<div style={{overflow:"hidden"}}><p style={{fontSize:12,fontWeight:600,color:"#fff",whiteSpace:"nowrap"}}>Nutricionista</p><button onClick={onLogout} style={{background:"none",border:"none",color:"rgba(255,255,255,0.5)",fontFamily:F.body,fontSize:11,cursor:"pointer",padding:0,marginTop:2}}>Cerrar sesión</button></div>}
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,padding:28,overflowY:"auto",maxWidth:"calc(100vw - 62px)"}}>

        {/* DASHBOARD */}
        {(view==="dashboard"||view==="plan-editor") && !editingId && (
          <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
              <div>
                <h2 style={{fontFamily:F.display,fontSize:26,color:C.teal,fontWeight:700}}>Dashboard</h2>
                <p style={{fontSize:13,color:C.muted,marginTop:4}}>{patients.length} pacientes activos · Domingo 10 mayo 2026</p>
              </div>
            </div>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
              {[
                {label:"Pacientes",value:patients.length,icon:"👥"},
                {label:"Adherencia prom.",value:`${Math.round(patients.reduce((a,p)=>a+p.adherence,0)/patients.length)}%`,icon:"📊"},
                {label:"Mensajes sin leer",value:patients.reduce((a,p)=>a+p.messages.filter(m=>!m.read).length,0),icon:"💌"},
                {label:"Dudas pendientes",value:patients.reduce((a,p)=>a+p.doubts.filter(d=>!d.answered).length,0),icon:"💬"},
              ].map(k=>(
                <Card key={k.label} style={{display:"flex",flexDirection:"column",gap:6}}>
                  <span style={{fontSize:22}}>{k.icon}</span>
                  <p style={{fontFamily:F.display,fontSize:28,fontWeight:700,color:C.green}}>{k.value}</p>
                  <p style={{fontSize:11,color:C.muted}}>{k.label}</p>
                </Card>
              ))}
            </div>
            {/* Patients */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
              {patients.map(p=>{
                const pct=Math.round((p.plan.filter(m=>m.done).length/p.plan.length)*100);
                return(
                  <Card key={p.id} style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <Avatar initials={p.avatar} size={44}/>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontWeight:700,fontSize:15,color:C.text}}>{p.name}</p>
                        <p style={{fontSize:12,color:C.muted,marginTop:1}}>{p.condition}</p>
                      </div>
                      <Badge label={p.type} color={typeColor(p.type)} text={C.teal}/>
                    </div>
                    {/* Mood & energy */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <div style={{background:C.greenPale,borderRadius:10,padding:"8px 12px"}}>
                        <p style={{fontSize:10,color:C.muted,marginBottom:2}}>Ánimo</p>
                        <p style={{fontSize:18}}>{MOODS.find(m=>m.v===p.mood)?.e||"—"}</p>
                      </div>
                      <div style={{background:C.purplePale,borderRadius:10,padding:"8px 12px"}}>
                        <p style={{fontSize:10,color:C.muted,marginBottom:2}}>Energía</p>
                        <p style={{fontSize:18}}>{ENERGIES.find(e=>e.v===p.energy)?.e||"—"}</p>
                      </div>
                    </div>
                    {/* Plan pills */}
                    <div>
                      <p style={{fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Plan · {p.plan.length} comidas</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {p.plan.map(m=><span key={m.id} style={{background:C.softGreen,color:C.green,borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:600}}>{m.icon} {m.label}</span>)}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <ProgressBar value={pct} color={pct>70?C.greenLight:C.accent}/>
                      <span style={{fontSize:12,fontWeight:700,color:pct>70?C.green:C.accent,whiteSpace:"nowrap"}}>{pct}%</span>
                    </div>
                    <Btn onClick={()=>{setEditingId(p.id);setView("plan-editor");}} variant="soft" full>✏️ Editar plan de comidas</Btn>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* PLAN EDITOR */}
        {view==="plan-editor" && editingId && (
          <PlanEditor patient={patients.find(p=>p.id===editingId)}/>
        )}

        {/* MESSAGES */}
        {view==="messages" && (
          <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:20}}>
            <h2 style={{fontFamily:F.display,fontSize:26,color:C.teal,fontWeight:700}}>Mensajes de acompañamiento</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <Card style={{display:"flex",flexDirection:"column",gap:14}}>
                <p style={{fontFamily:F.display,fontSize:17,color:C.teal}}>Redactar mensaje</p>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:6}}>Destinatario</label>
                  <select value={msgForm.patientId} onChange={e=>setMsgForm(f=>({...f,patientId:e.target.value}))}
                    style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:12,padding:"10px 14px",fontFamily:F.body,fontSize:13,background:C.bg,outline:"none"}}>
                    <option value="all">📢 Todos los pacientes</option>
                    {patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:8}}>Tipo</label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {MSG_TYPES.map(t=>(
                      <button key={t.value} onClick={()=>setMsgForm(f=>({...f,type:t.value}))}
                        style={{padding:"8px",borderRadius:10,border:`1.5px solid ${msgForm.type===t.value?t.color:C.border}`,background:msgForm.type===t.value?t.bg:C.card,color:msgForm.type===t.value?t.color:C.muted,fontFamily:F.body,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:6}}>Mensajes rápidos</label>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {PRESET_MSGS.map(m=>(
                      <button key={m} onClick={()=>setMsgForm(f=>({...f,text:m}))}
                        style={{textAlign:"left",padding:"7px 11px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:9,fontFamily:F.body,fontSize:12,color:C.text,cursor:"pointer",lineHeight:1.4}}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={msgForm.text} onChange={e=>setMsgForm(f=>({...f,text:e.target.value}))} placeholder="Escribe tu mensaje..."
                  style={{width:"100%",border:`1.5px solid ${C.border}`,borderRadius:10,padding:12,fontFamily:F.body,fontSize:13,color:C.text,background:C.bg,resize:"none",height:85,outline:"none"}}
                  onFocus={e=>e.target.style.borderColor=C.greenLight} onBlur={e=>e.target.style.borderColor=C.border}/>
                <Btn onClick={sendMessage} disabled={!msgForm.text||msgSent} full
                  style={{background:msgSent?C.greenLight:C.green,color:"#fff"}}>
                  {msgSent?"✓ Enviado":"✉️ Enviar mensaje"}
                </Btn>
              </Card>
              {/* Ánimo de pacientes */}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <p style={{fontFamily:F.display,fontSize:17,color:C.teal}}>Estado de pacientes</p>
                {patients.map(p=>(
                  <Card key={p.id} style={{display:"flex",gap:12,alignItems:"center"}}>
                    <Avatar initials={p.avatar} size={38}/>
                    <div style={{flex:1}}>
                      <p style={{fontWeight:700,fontSize:13,color:C.text}}>{p.name}</p>
                      <div style={{display:"flex",gap:10,marginTop:6,alignItems:"center"}}>
                        <span style={{fontSize:18}}>{MOODS.find(m=>m.v===p.mood)?.e||"—"}</span>
                        <span style={{fontSize:18}}>{ENERGIES.find(e=>e.v===p.energy)?.e||"—"}</span>
                        <ProgressBar value={p.adherence} color={p.adherence>70?C.greenLight:C.accent}/>
                        <span style={{fontSize:11,fontWeight:700,color:p.adherence>70?C.green:C.accent,whiteSpace:"nowrap"}}>{p.adherence}%</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REGISTER */}
        {view==="register" && (
          <div className="fade-up" style={{maxWidth:520,display:"flex",flexDirection:"column",gap:20}}>
            <h2 style={{fontFamily:F.display,fontSize:26,color:C.teal,fontWeight:700}}>Registrar paciente</h2>
            {/* Steps indicator */}
            <div style={{display:"flex",alignItems:"center"}}>
              {["Datos","Clínico","Código"].map((s,i)=>(
                <div key={s} style={{display:"flex",alignItems:"center",flex:i<2?1:"none"}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:regStep>i+1?C.green:regStep===i+1?C.greenLight:C.border,color:regStep>=i+1?"#fff":C.muted,fontSize:12,fontWeight:700,transition:"all 0.3s"}}>
                      {regStep>i+1?"✓":i+1}
                    </div>
                    <span style={{fontSize:10,color:regStep===i+1?C.green:C.muted,fontWeight:regStep===i+1?700:400}}>{s}</span>
                  </div>
                  {i<2&&<div style={{flex:1,height:2,background:regStep>i+1?C.greenLight:C.border,margin:"0 6px",marginBottom:16,transition:"background 0.4s"}}/>}
                </div>
              ))}
            </div>
            <Card>
              {regStep===1&&(
                <div style={{display:"flex",flexDirection:"column",gap:14}} className="fade-up">
                  <p style={{fontFamily:F.display,fontSize:18,color:C.teal}}>Datos del paciente</p>
                  <Input label="Nombre completo" value={regData.name} onChange={v=>setRegData(p=>({...p,name:v}))} placeholder="Ej. María González"/>
                  <Input label="RUT / Cédula" value={regData.id} onChange={v=>setRegData(p=>({...p,id:v}))} placeholder="Ej. 12.345.678-9" hint="El paciente usará esto para ingresar"/>
                  <Input label="Teléfono" value={regData.phone} onChange={v=>setRegData(p=>({...p,phone:v}))} placeholder="+56 9 1234 5678" type="tel"/>
                  <Input label="Edad" value={regData.age} onChange={v=>setRegData(p=>({...p,age:v}))} placeholder="32" type="number"/>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    <label style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:0.5}}>Tipo de paciente</label>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                      {PATIENT_TYPES.map(t=>(
                        <button key={t} onClick={()=>setRegData(p=>({...p,type:t,customType:""}))}
                          style={{padding:"9px 6px",borderRadius:10,border:`1.5px solid ${regData.type===t?C.greenLight:C.border}`,background:regData.type===t?C.softGreen:C.card,color:regData.type===t?C.green:C.muted,fontFamily:F.body,fontSize:12,fontWeight:regData.type===t?700:400,cursor:"pointer",transition:"all 0.2s"}}>
                          {t}
                        </button>
                      ))}
                    </div>
                    {regData.type==="Otro"&&(
                      <Input value={regData.customType} onChange={v=>setRegData(p=>({...p,customType:v}))} placeholder="Especifica el tipo de paciente..."/>
                    )}
                  </div>
                  <Btn onClick={()=>setRegStep(2)} disabled={!regData.name||!regData.id||!regData.type||(regData.type==="Otro"&&!regData.customType)} full>Continuar →</Btn>
                </div>
              )}
              {regStep===2&&(
                <div style={{display:"flex",flexDirection:"column",gap:14}} className="slide-in">
                  <p style={{fontFamily:F.display,fontSize:18,color:C.teal}}>Información clínica</p>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    <label style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:0.5}}>Diagnóstico</label>
                    <select value={regData.condition} onChange={e=>setRegData(p=>({...p,condition:e.target.value}))}
                      style={{border:`1.5px solid ${C.border}`,borderRadius:12,padding:"10px 14px",fontFamily:F.body,fontSize:14,color:regData.condition?C.text:C.muted,background:C.bg,outline:"none"}}>
                      <option value="">Selecciona...</option>
                      {CONDITIONS.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <Input label="Observaciones" value={regData.notes} onChange={v=>setRegData(p=>({...p,notes:v}))} placeholder="Antecedentes relevantes..."/>
                  <Input label="Próximo control" value={regData.nextControl} onChange={v=>setRegData(p=>({...p,nextControl:v}))} type="date"/>
                  <div style={{display:"flex",gap:10}}>
                    <Btn onClick={()=>setRegStep(1)} variant="ghost" style={{flex:1}}>← Atrás</Btn>
                    <Btn onClick={goRegStep3} disabled={!regData.condition||!regData.nextControl} style={{flex:2,background:C.green,color:"#fff"}}>Generar código →</Btn>
                  </div>
                </div>
              )}
              {regStep===3&&(
                <div style={{display:"flex",flexDirection:"column",gap:16,textAlign:"center"}} className="fade-up">
                  <div>
                    <p style={{fontSize:40,marginBottom:8}}>🎉</p>
                    <p style={{fontFamily:F.display,fontSize:20,color:C.teal}}>¡Paciente registrado!</p>
                    <p style={{fontSize:13,color:C.muted,marginTop:4}}>{regData.name} ya puede ingresar a NutriLife</p>
                  </div>
                  <div style={{background:`linear-gradient(135deg,${C.teal},${C.green})`,borderRadius:16,padding:20}}>
                    <p style={{color:"rgba(255,255,255,0.6)",fontSize:11,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Código de acceso</p>
                    <p style={{fontFamily:F.display,fontSize:40,color:"#fff",fontWeight:700,letterSpacing:4}}>{regCode}</p>
                    <p style={{color:"rgba(255,255,255,0.5)",fontSize:11,marginTop:6}}>RUT: {regData.id}</p>
                  </div>
                  <div style={{background:C.softGreen,borderRadius:12,padding:14,textAlign:"left",fontSize:13,color:C.teal,lineHeight:1.7,whiteSpace:"pre-line",border:`1px solid ${C.greenPale}`}}>
                    {regMsg}
                  </div>
                  <Btn onClick={()=>{navigator.clipboard?.writeText(regMsg);setRegCopied(true);setTimeout(()=>setRegCopied(false),2000);}} full
                    style={{background:regCopied?C.greenLight:C.greenPale,color:regCopied?"#fff":C.green}}>
                    {regCopied?"✓ ¡Copiado!":"📋 Copiar mensaje para WhatsApp"}
                  </Btn>
                  <Btn onClick={()=>{setRegStep(1);setRegData({name:"",id:"",phone:"",age:"",type:"",customType:"",condition:"",notes:"",nextControl:""});}} full>
                    + Registrar otro paciente
                  </Btn>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen]   = useState("landing"); // landing | nutri-login | nutri | patient-login | patient
  const [patients, setPatients] = useState(INIT_PATIENTS);
  const [patientId, setPatientId] = useState(null);

  const updatePatient = (updater) => {
    setPatients(prev => prev.map(p => p.id===patientId ? (typeof updater==="function"?updater(p):updater) : p));
  };

  const currentPatient = patients.find(p=>p.id===patientId);

  return (
    <>
      <style>{globalStyle}</style>
      {screen==="landing"      && <Landing onNutri={()=>setScreen("nutri-login")} onPatient={()=>setScreen("patient-login")}/>}
      {screen==="nutri-login"  && <NutriLogin onLogin={()=>setScreen("nutri")} onBack={()=>setScreen("landing")}/>}
      {screen==="nutri"        && <NutritionistPanel patients={patients} setPatients={setPatients} onLogout={()=>setScreen("landing")}/>}
      {screen==="patient-login"&& <PatientLogin onLogin={id=>{setPatientId(id);setScreen("patient");}} onBack={()=>setScreen("landing")}/>}
      {screen==="patient" && currentPatient && <PatientApp patient={currentPatient} setPatient={updatePatient} onLogout={()=>setScreen("landing")}/>}
    </>
  );
}
