import React from 'react';
import { useNavigate } from 'react-router-dom';

// ── Heatmap ─────────────────────────────────────────────────────
function UsageHeatmap({ logs }) {
  const weeks = 26;
  const days  = 5;
  const total = weeks * days;

  const counts = {};
  logs.forEach(log => {
    const d = log.check_in?.split(' ')[0] || log.check_in?.split('T')[0];
    if (d) counts[d] = (counts[d] || 0) + 1;
  });

  const cells = [];
  const today = new Date();
  for (let i = total - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().split('T')[0];
    const n = counts[key] || 0;
    cells.push(n);
  }
  const max = Math.max(...cells, 1);
  const lvl = n => n === 0 ? 0 : n <= max * .25 ? 1 : n <= max * .5 ? 2 : n <= max * .75 ? 3 : 4;
  const colors = ['#f5f0e8','#C0DD97','#97C459','#639922','#3B6D11'];

  const monthLabels = [];
  for (let w = 0; w < weeks; w += 4) {
    const d = new Date(today);
    d.setDate(today.getDate() - (total - 1 - w * days));
    monthLabels.push({ w, label: d.toLocaleDateString('th-TH', { month: 'short' }) });
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 2, marginBottom: 3 }}>
        {Array.from({ length: weeks }, (_, w) => {
          const m = monthLabels.find(ml => ml.w === w);
          return (
            <div key={w} style={{ fontSize: 9, color: '#8c8479', textAlign: 'center' }}>
              {m ? m.label : ''}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 2 }}>
        {Array.from({ length: weeks }, (_, w) =>
          Array.from({ length: days }, (_, d) => {
            const idx = w * days + d;
            const n = cells[idx] || 0;
            return (
              <div
                key={`${w}-${d}`}
                title={`${n} ครั้ง`}
                style={{
                  aspectRatio: '1',
                  borderRadius: 2,
                  background: colors[lvl(n)],
                }}
              />
            );
          })
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
        <span style={{ fontSize: 10, color: '#8c8479', fontWeight: 'bold' }}>น้อย</span>
        {colors.map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c, border: '1px solid #fff' }} />
        ))}
        <span style={{ fontSize: 10, color: '#8c8479', fontWeight: 'bold' }}>มาก</span>
      </div>
    </div>
  );
}

// ── Status pill ──────────────────────────────────────────────────
const STATUS = {
  approved: { label: 'อนุมัติ', bg: '#EAF3DE', color: '#27500A', dot: '#639922' },
  pending:  { label: 'รอตรวจ',   bg: '#FAEEDA', color: '#633806', dot: '#BA7517' },
  rejected: { label: 'ปฏิเสธ', bg: '#FCEBEB', color: '#791F1F', dot: '#E24B4A' },
  completed:{ label: 'เสร็จสิ้น',  bg: '#E6F1FB', color: '#0C447C', dot: '#378ADD' },
};
function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 900, padding: '4px 12px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap', border: '1px solid rgba(0,0,0,0.05)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {s.label}
    </span>
  );
}

// ── Card wrapper ─────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #f0ece6',
    borderRadius: 20, padding: '1.5rem', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
    ...style,
  }}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 800, color: '#8c8479', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 15 }}>
    {children}
  </div>
);

// ── Main ─────────────────────────────────────────────────────────
export default function StudentHome({ logs = [], myBookings = [] }) {
  const navigate = useNavigate();

  const totalSessions = logs.length;
  const totalMin      = logs.reduce((s, l) => s + (l.duration_min || 0), 0);
  const activeBooks   = myBookings.filter(b => ['pending','approved'].includes(b.status) && new Date(b.end_date || b.start_time) >= new Date());
  const upcoming      = activeBooks.slice(0, 4);

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.check_in) - new Date(a.check_in))
    .slice(0, 5);

  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* ── 1. Statistics Summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'ใช้งานทั้งหมด', value: totalSessions, unit: 'ครั้ง', color: '#2B2B2B', icon: '📊' },
          { label: 'เวลารวม', value: (totalMin / 60).toFixed(1), unit: 'ชม.', color: '#C9A44C', icon: '⏳' },
          { label: 'รายการจองคิว', value: activeBooks.length, unit: 'รายการ', color: '#F27C38', icon: '📅' },
        ].map(({ label, value, unit, color, icon }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 20, padding: '1.5rem', border: '1px solid #f0ece6', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '60px', opacity: 0.05 }}>{icon}</div>
            <div style={{ fontSize: 12, color: '#8c8479', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', relative: 10 }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: color, position: 'relative', zIndex: 10 }}>
              {value} <span style={{ fontSize: 16, fontWeight: 600, color: '#8c8479' }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2. Usage Heatmap (Full Width) ── */}
      <Card style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <SectionLabel>สถิติความถี่การใช้งานรายวัน</SectionLabel>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#2B2B2B' }}>กิจกรรมการวิจัยย้อนหลัง 6 เดือน</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#639922', display: 'block' }}>{totalSessions}</span>
            <span style={{ fontSize: 10, color: '#8c8479', fontWeight: 800, textTransform: 'uppercase' }}>Total Sessions</span>
          </div>
        </div>
        <UsageHeatmap logs={logs} />
      </Card>

      {/* ── 3. Schedule & Activity Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        
        {/* Upcoming bookings */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: '#f5f0e8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📅</div>
                <SectionLabel style={{ marginBottom: 0 }}>รายการจองที่จะมาถึง</SectionLabel>
            </div>
            <button onClick={() => navigate('/dashboard?view=booking')}
              style={{ background: '#f5f0e8', border: 'none', color: '#5a5147', padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
              จองเพิ่ม
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 14, color: '#8c8479', fontWeight: 'bold', fontStyle: 'italic' }}>ไม่มีรายการจองที่กำลังจะมาถึง</div>
          ) : upcoming.map(bk => {
            const d = new Date(bk.start_time);
            return (
              <div key={bk.id} style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 15, alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f5f0e8' }}>
                <div style={{ background: '#f5f0e8', borderRadius: 12, padding: '8px 10px', textAlign: 'center', border: '1px solid #eee' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1, color: '#2B2B2B' }}>{d.getDate()}</div>
                  <div style={{ fontSize: 10, color: '#8c8479', fontWeight: 800, marginTop: 2, textTransform: 'uppercase' }}>
                    {d.toLocaleDateString('th-TH', { month: 'short' })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#2B2B2B', marginBottom: 2 }}>{bk.instrument_name}</div>
                  <div style={{ fontSize: 11, color: '#8c8479', fontWeight: 'bold' }}>
                    <span style={{ color: '#F27C38' }}>{new Date(bk.start_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                    {' • '}{bk.building_name}
                  </div>
                </div>
                <StatusPill status={bk.status} />
              </div>
            );
          })}
        </Card>

        {/* Recent activity */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: '#f5f0e8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📜</div>
                <SectionLabel style={{ marginBottom: 0 }}>กิจกรรมล่าสุด</SectionLabel>
            </div>
            <button onClick={() => navigate('/dashboard?view=history')}
              style={{ background: '#f5f0e8', border: 'none', color: '#5a5147', padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
              ดูทั้งหมด
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: '#8c8479', fontWeight: 'bold' }}>ยังไม่มีประวัติกิจกรรม</div>
              ) : recentLogs.map((log, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < recentLogs.length - 1 ? '1px solid #f5f0e8' : 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: log.check_out ? '#FAEEDA' : '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={log.check_out ? '#854F0B' : '#0F6E56'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {log.check_out
                      ? <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>
                      : <><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>
                      }
                  </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#2B2B2B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.check_out ? 'เช็คเอาท์' : 'เช็คอิน'} {log.instrument_name}
                  </div>
                  <div style={{ fontSize: 11, color: '#8c8479', fontWeight: 'bold', marginTop: 2 }}>
                      {new Date(log.check_in).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                      {' • '}
                      {new Date(log.check_in).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </div>
                  </div>
                  {log.duration_min && (
                  <span style={{ fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 20, background: '#f5f0e8', color: '#5a5147', whiteSpace: 'nowrap' }}>
                      {log.duration_min}m
                  </span>
                  )}
              </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
