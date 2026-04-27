// 'use client';

// import { useState } from 'react';

// export default function AdminAnalyticsPage() {
//   const [activeTab, setActiveTab] = useState('This Month');

//   return (
//     <>
//       <div className="page-header">
//         <h2>Quota Analytics</h2>
//         <p>Comprehensive analysis of quota distribution and usage across companies.</p>
//       </div>

//       <div className="summary-cards-container">
//         <div className="summary-card highlight" style={{ background: 'rgba(255,255,255,0.95)' }}>
//           <div className="summary-icon green" style={{ width: '48px', height: '48px' }}>
//             <span className="material-symbols-outlined">analytics</span>
//           </div>
//           <div className="summary-info">
//             <h3>Total Quota</h3>
//             <div className="summary-value">142,500 <span>kg</span></div>
//           </div>
//         </div>
//         <div className="summary-card" style={{ background: 'rgba(255,255,255,0.85)' }}>
//           <div className="summary-icon yellow" style={{ width: '48px', height: '48px' }}>
//             <span className="material-symbols-outlined">show_chart</span>
//           </div>
//           <div className="summary-info">
//             <h3>Used Quota</h3>
//             <div className="summary-value">93,200 <span>kg</span></div>
//           </div>
//         </div>
//         <div className="summary-card" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
//           <div className="summary-icon" style={{ backgroundColor: '#fff1f2', color: '#dc2626', width: '48px', height: '48px' }}>
//             <span className="material-symbols-outlined">database_off</span>
//           </div>
//           <div className="summary-info">
//             <h3>Remaining</h3>
//             <div className="summary-value" style={{ color: '#dc2626' }}>44,100 <span>kg</span></div>
//           </div>
//         </div>
//         <div className="summary-card" style={{ background: 'rgba(255,255,255,0.85)' }}>
//           <div className="summary-icon blue" style={{ backgroundColor: '#dbeafe', color: '#1e40af', width: '48px', height: '48px' }}>
//             <span className="material-symbols-outlined">add_task</span>
//           </div>
//           <div className="summary-info">
//             <h3>New Requests</h3>
//             <div className="summary-value">24</div>
//           </div>
//         </div>
//       </div>

//       <div className="master-table-card" style={{ marginTop: '24px' }}>
//         <div className="filters-section">
//           <div className="filters-header">
//             <span className="material-symbols-outlined">business</span>
//             Company Quota Analysis
//           </div>
//           <div className="filters-grid">
//             {['Today', 'Monthly', 'This period', 'This Month', 'Next Month', 'Options'].map(tab => (
//               <button 
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`page-btn ${activeTab === tab ? 'active' : ''}`}
//                 style={{ 
//                   backgroundColor: activeTab === tab ? '#1a4a38' : 'transparent',
//                   color: activeTab === tab ? 'white' : '#4b5563',
//                   padding: '8px 16px',
//                   borderRadius: '12px',
//                   border: activeTab === tab ? 'none' : '1px solid #e5e7eb'
//                 }}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="table-section">
//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th>Company Name</th>
//                 <th>Total Quota (kg)</th>
//                 <th>Used Quota (kg)</th>
//                 <th>Remaining (kg)</th>
//                 <th>Usage %</th>
//               </tr>
//             </thead>
//             <tbody>
//               {[
//                 { name: 'Global Tech Ltd', total: 45000, used: 32000, rem: 13000, pct: 71 },
//                 { name: 'Eco Systems Inc', total: 25000, used: 12500, rem: 12500, pct: 50 },
//                 { name: 'Apex Logistics', total: 32000, used: 28400, rem: 3600, pct: 88 },
//                 { name: 'Solaris energy', total: 15000, used: 4200, rem: 10800, pct: 28 },
//                 { name: 'Oceanic Corp', total: 25500, used: 16100, rem: 9400, pct: 63 }
//               ].map(co => (
//                 <tr key={co.name}>
//                   <td className="req-id">{co.name}</td>
//                   <td>{co.total.toLocaleString()}</td>
//                   <td>{co.used.toLocaleString()}</td>
//                   <td>{co.rem.toLocaleString()}</td>
//                   <td>
//                     <div style={{ width: '100px', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
//                       <div style={{ width: `${co.pct}%`, height: '100%', background: co.pct > 80 ? '#dc2626' : co.pct > 50 ? '#f59e0b' : '#16a34a' }} />
//                     </div>
//                     <span style={{ fontSize: '11px', fontWeight: 600 }}>{co.pct}%</span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <div className="table-footer">
//             <button className="btn-primary">
//               <span className="material-symbols-outlined">download</span> Export PDF Report
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

'use client';

import DashboardClient from '@/components/analytics/DashboardClient';

export default function AdminAnalyticsPage() {
  return <DashboardClient initialData={null} />;
}