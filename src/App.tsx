import {useState} from 'react';import {Routes,Route,Navigate,useParams,NavLink} from 'react-router-dom';
import {AuthCtx,useAuth,api} from './lib';import * as P from './pages';import {RepairArt} from './art';
const NAV:any={admin:[['dashboard','Dashboard'],['customers','Customers'],['devices','Devices'],['technicians','Technicians'],['service-requests','Service requests'],['job-cards','Job cards'],['inventory','Inventory'],['billing','Billing'],['reports','Reports']],
receptionist:[['dashboard','Dashboard'],['customers','Customers'],['devices','Devices'],['service-requests','Service requests'],['job-cards','Job cards']],
technician:[['dashboard','Dashboard'],['assigned-jobs','Assigned jobs'],['repair-updates','Repair updates'],['parts-used','Parts used']],
customer:[['dashboard','Dashboard'],['devices','My devices'],['service-requests','Requests'],['repair-status','Repair status'],['bills','Bills'],['history','History']]};
const PAGES:any={admin:{dashboard:P.Dashboard,customers:P.Customers,devices:P.Devices,technicians:P.Technicians,'service-requests':P.Requests,'job-cards':P.JobCards,inventory:P.Inventory,billing:P.Billing,reports:P.Reports},
receptionist:{dashboard:P.Dashboard,customers:P.Customers,devices:P.Devices,'service-requests':P.Requests,'job-cards':P.JobCards},
technician:{dashboard:P.Dashboard,'assigned-jobs':()=><P.Jobs mode="list"/>,'repair-updates':()=><P.Jobs mode="update"/>,'parts-used':()=><P.Jobs mode="parts"/>},
customer:{dashboard:P.Dashboard,devices:P.Devices,'service-requests':()=><P.Requests readOnly/>,'repair-status':()=><P.Track mode="status"/>,bills:P.Billing,history:()=><P.Track mode="history"/>}};
function Shell({nav,children}:any){const {user,logout}=useAuth();const [open,setOpen]=useState(false);
const pill=({isActive}:any)=>`pill ${isActive?'!bg-amber !text-ink !font-extrabold':''}`;
const items=nav.map(([p,l]:any)=><NavLink key={p} to={`/${user.role}/${p}`} className={pill} onClick={()=>setOpen(false)}>{l}</NavLink>);
return(<div className="min-h-screen"><header className="sticky top-3 z-40 mx-3 mt-3 rounded-2xl border-2 border-teal bg-teal text-white" style={{boxShadow:'5px 5px 0 #d6246e'}}>
<div className="flex items-center gap-3 px-3 py-2"><div className="w-9 h-9 rounded-full border-4 border-tag grid place-items-center shrink-0"><div className="w-2.5 h-2.5 rounded-full bg-white"/></div><span className="font-head font-extrabold text-2xl">Bench</span>
<nav className="hidden lg:flex flex-wrap gap-1 ml-4">{items}</nav>
<div className="ml-auto flex items-center gap-2"><span className="hidden sm:block text-right leading-tight"><b className="block text-sm">{user.name}</b><span className="text-xs text-white/60 capitalize">{user.role}</span></span>
<button className="hidden lg:block btn2 !text-ink" onClick={logout}>Sign out</button>
<button aria-label="Menu" aria-expanded={open} className="lg:hidden text-2xl leading-none w-10 h-10 rounded-xl border-2 border-white/40" onClick={()=>setOpen(!open)}>{open?'✕':'☰'}</button></div></div>
{open&&<div className="lg:hidden border-t-2 border-white/20 p-3"><nav className="grid grid-cols-2 sm:grid-cols-3 gap-2">{items}</nav><button className="btn2 !text-ink mt-3 w-full" onClick={logout}>Sign out</button></div>}</header>
<RepairArt className="fixed -bottom-12 -right-12 w-72 opacity-[.08] pointer-events-none z-0"/><main className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 min-w-0">{children}</main></div>)}
function Guard(){const {role,page}:any=useParams();const {user}=useAuth();if(!user)return <Navigate to="/login"/>;if(role!==user.role)return <Navigate to={`/${user.role}/dashboard`}/>;const C=PAGES[role]?.[page];return <Shell nav={NAV[role]}>{C?<C key={page}/>:<p>Page not found.</p>}</Shell>}
function Login(){const {login,user}=useAuth();const [e,setE]=useState('');const [p,setP]=useState('');const [err,setErr]=useState('');
if(user)return <Navigate to={`/${user.role}/dashboard`}/>;
const go=async()=>{if(!e||!p)return setErr('Enter your email and password');try{const r=await api.get('/users',{params:{email:e,password:p}});r.data[0]?login(r.data[0]):setErr('Email or password is wrong')}catch{setErr('Cannot reach the API. Run npm run api.')}};
const demo=[['Admin','admin@bench.com','admin123'],['Reception','reception@bench.com','desk123'],['Technician','tech@bench.com','tech123'],['Customer','customer@bench.com','cust123']];
return(<div className="min-h-screen grid place-items-center p-4"><div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl w-full"><div className="hidden md:block"><span className="kicker">Mobile service center</span><h2 className="text-5xl font-extrabold mt-3 mb-2">Fix it fast. Track every step.</h2><RepairArt className="w-full max-w-sm"/></div><div className="tagcard w-full max-w-sm mx-auto !p-6 !pt-10"><h1 className="text-3xl font-extrabold mb-1">Drop it off. Track it live.</h1><p className="text-sm text-teal/70 mb-4">Sign in to the Bench service desk.</p>
<input className="inp mb-2" placeholder="Email" value={e} onChange={x=>setE(x.target.value)}/><input className="inp mb-2" type="password" placeholder="Password" value={p} onChange={x=>setP(x.target.value)} onKeyDown={x=>x.key==='Enter'&&go()}/>
{err&&<p className="text-sm text-red-600 mb-2">{err}</p>}<button className="btn w-full" onClick={go}>Sign in</button>
<div className="mt-4 pt-3 border-t border-dashed border-teal/30"><p className="text-xs text-teal/60 mb-2">Demo accounts</p><div className="flex flex-wrap gap-1">{demo.map(d=><button key={d[0]} className="btn2" onClick={()=>{setE(d[1]);setP(d[2])}}>{d[0]}</button>)}</div></div></div></div></div>)}
export default function App(){const [user,setUser]=useState<any>(()=>{try{return JSON.parse(localStorage.getItem('u')||'null')}catch{return null}});
const login=(u:any)=>{localStorage.setItem('u',JSON.stringify(u));setUser(u)};const logout=()=>{localStorage.removeItem('u');setUser(null)};
return(<AuthCtx.Provider value={{user,login,logout}}><Routes><Route path="/login" element={<Login/>}/><Route path="/:role/:page" element={<Guard/>}/><Route path="*" element={<Navigate to={user?`/${user.role}/dashboard`:'/login'}/>}/></Routes></AuthCtx.Provider>)}
