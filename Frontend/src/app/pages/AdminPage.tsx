import { useState } from 'react';
import {
  LayoutDashboard, FileText, Wrench, Images, Newspaper, MessageSquare,
  Calendar, Settings, Users, Globe, LogOut, Menu, X, Search,
  TrendingUp, Eye, CheckCircle, AlertCircle, Clock, Plus, Pencil, Trash2, Shield
} from 'lucide-react';

type AdminSection =
  | 'dashboard' | 'homepage' | 'services' | 'projects' | 'blog'
  | 'messages' | 'bookings' | 'media' | 'seo' | 'contact' | 'users' | 'settings';

const navItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'homepage', label: 'الصفحة الرئيسية', icon: Globe },
  { id: 'services', label: 'الخدمات', icon: Wrench },
  { id: 'projects', label: 'الأعمال والمشاريع', icon: Images },
  { id: 'blog', label: 'المقالات والأخبار', icon: Newspaper },
  { id: 'messages', label: 'الرسائل الواردة', icon: MessageSquare },
  { id: 'bookings', label: 'طلبات الحجز', icon: Calendar },
  { id: 'media', label: 'مكتبة الوسائط', icon: FileText },
  { id: 'seo', label: 'SEO والميتاداتا', icon: TrendingUp },
  { id: 'contact', label: 'معلومات التواصل', icon: MessageSquare },
  { id: 'users', label: 'المستخدمون والصلاحيات', icon: Users },
  { id: 'settings', label: 'إعدادات الموقع', icon: Settings },
];

const stats = [
  { label: 'طلبات حجز جديدة', value: 12, trend: '+3 اليوم', color: 'text-[#A98B5C]', bg: 'bg-[#A98B5C]/10', icon: Calendar },
  { label: 'رسائل غير مقروءة', value: 7, trend: '+2 اليوم', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: MessageSquare },
  { label: 'مشاريع منشورة', value: 24, trend: 'محدّث', color: 'text-green-400', bg: 'bg-green-400/10', icon: Images },
  { label: 'مقالات مسودة', value: 3, trend: 'قيد المراجعة', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: FileText },
];

const recentBookings = [
  { name: 'أحمد محمود', phone: '+964 770 111 1111', service: 'فحص وتشخيص', date: '2026-07-20', status: 'pending' },
  { name: 'سارة علي', phone: '+964 771 222 2222', service: 'PPF كامل', date: '2026-07-19', status: 'confirmed' },
  { name: 'كريم حسن', phone: '+964 772 333 3333', service: 'تلميع وعناية', date: '2026-07-18', status: 'completed' },
  { name: 'نور الدين', phone: '+964 773 444 4444', service: 'إصلاح هيكل', date: '2026-07-17', status: 'confirmed' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400',
  confirmed: 'bg-blue-400/10 text-blue-400',
  completed: 'bg-green-400/10 text-green-400',
};
const statusLabels: Record<string, string> = {
  pending: 'قيد المراجعة', confirmed: 'مؤكد', completed: 'مكتمل',
};

const mockArticles = [
  { id: 1, title: 'متى تحتاج مركبتك إلى فحص إلكتروني؟', cat: 'الفحص', status: 'published', date: '2026-06-10' },
  { id: 2, title: 'حماية الطلاء وأفلام PPF', cat: 'العناية', status: 'published', date: '2026-05-22' },
  { id: 3, title: 'صيانة المركبات الهجينة', cat: 'الهجينة', status: 'draft', date: '2026-07-01' },
];

function DashboardView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white text-2xl font-bold mb-2">مرحباً بك في لوحة التحكم</h2>
        <p className="text-[#6B7075]">آخر تحديث: اليوم، 10:30 ص</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-[#15191D] rounded-xl p-5 border border-white/8">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon size={18} className={s.color} />
                </div>
                <span className="text-[#6B7075] text-xs">{s.trend}</span>
              </div>
              <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <p className="text-[#A7ADB2] text-sm">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="bg-[#15191D] rounded-xl border border-white/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <h3 className="text-white font-semibold">طلبات الحجز الأخيرة</h3>
          <button className="text-[#A98B5C] text-sm hover:underline">عرض الكل</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {['الاسم', 'الهاتف', 'الخدمة', 'التاريخ', 'الحالة', 'إجراء'].map((h) => (
                  <th key={h} className="px-6 py-3 text-start text-[#6B7075] text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4 text-white text-sm font-medium">{b.name}</td>
                  <td className="px-6 py-4 text-[#A7ADB2] text-sm" dir="ltr">{b.phone}</td>
                  <td className="px-6 py-4 text-[#A7ADB2] text-sm">{b.service}</td>
                  <td className="px-6 py-4 text-[#A7ADB2] text-sm">{b.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[b.status]}`}>
                      {statusLabels[b.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-[#A7ADB2] hover:text-white transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-[#A7ADB2] hover:text-white transition-colors">
                        <CheckCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity */}
      <div className="bg-[#15191D] rounded-xl border border-white/8 p-6">
        <h3 className="text-white font-semibold mb-4">النشاط الأخير</h3>
        <div className="space-y-4">
          {[
            { icon: Calendar, color: 'text-[#A98B5C]', bg: 'bg-[#A98B5C]/10', msg: 'طلب حجز جديد من أحمد محمود', time: 'منذ 10 دقائق' },
            { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10', msg: 'رسالة جديدة في نموذج التواصل', time: 'منذ 45 دقيقة' },
            { icon: Images, color: 'text-green-400', bg: 'bg-green-400/10', msg: 'تم نشر مشروع PPF — BMW 7 Series', time: 'منذ 2 ساعة' },
            { icon: Newspaper, color: 'text-yellow-400', bg: 'bg-yellow-400/10', msg: 'مقال جديد محفوظ كمسودة', time: 'منذ 3 ساعات' },
          ].map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={a.color} />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{a.msg}</p>
                </div>
                <span className="text-[#6B7075] text-xs shrink-0">{a.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BlogManagement() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-2xl font-bold">إدارة المقالات</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A98B5C] text-white text-sm font-medium hover:bg-[#8f7248] transition-colors"
        >
          <Plus size={16} />
          مقال جديد
        </button>
      </div>

      {showForm && (
        <div className="bg-[#15191D] rounded-xl border border-white/8 p-6">
          <h3 className="text-white font-semibold mb-6">إضافة مقال جديد</h3>
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#A7ADB2] text-sm mb-2 block">العنوان (عربي)</label>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D0F] border border-white/10 text-white text-sm focus:border-[#A98B5C] focus:outline-none" />
              </div>
              <div>
                <label className="text-[#A7ADB2] text-sm mb-2 block">العنوان (إنجليزي)</label>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D0F] border border-white/10 text-white text-sm focus:border-[#A98B5C] focus:outline-none" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="text-[#A7ADB2] text-sm mb-2 block">المحتوى (عربي)</label>
              <textarea rows={4} className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D0F] border border-white/10 text-white text-sm focus:border-[#A98B5C] focus:outline-none resize-none" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-[#A7ADB2] text-sm mb-2 block">التصنيف</label>
                <select className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D0F] border border-white/10 text-white text-sm focus:border-[#A98B5C] focus:outline-none">
                  <option>الصيانة</option>
                  <option>العناية والحماية</option>
                  <option>الفحص والتشخيص</option>
                </select>
              </div>
              <div>
                <label className="text-[#A7ADB2] text-sm mb-2 block">عنوان SEO</label>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D0F] border border-white/10 text-white text-sm focus:border-[#A98B5C] focus:outline-none" />
              </div>
              <div>
                <label className="text-[#A7ADB2] text-sm mb-2 block">الصورة</label>
                <button className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D0F] border border-dashed border-white/20 text-[#6B7075] text-sm hover:border-[#A98B5C] transition-colors">
                  رفع صورة
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2 rounded-xl bg-[#A98B5C] text-white text-sm font-medium hover:bg-[#8f7248] transition-colors">نشر</button>
              <button className="px-6 py-2 rounded-xl border border-white/20 text-[#A7ADB2] text-sm hover:text-white transition-colors">حفظ كمسودة</button>
              <button className="px-6 py-2 rounded-xl border border-white/20 text-[#A7ADB2] text-sm hover:text-white transition-colors">معاينة</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#15191D] rounded-xl border border-white/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-[#6B7075]" />
            <input type="text" placeholder="بحث في المقالات..." className="w-full ps-9 pe-4 py-2 rounded-xl bg-[#0B0D0F] border border-white/10 text-white text-sm focus:border-[#A98B5C] focus:outline-none placeholder:text-[#6B7075]" />
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              {['العنوان', 'التصنيف', 'التاريخ', 'الحالة', 'إجراءات'].map((h) => (
                <th key={h} className="px-6 py-3 text-start text-[#6B7075] text-xs font-medium uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockArticles.map((a) => (
              <tr key={a.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-6 py-4 text-white text-sm font-medium">{a.title}</td>
                <td className="px-6 py-4 text-[#A7ADB2] text-sm">{a.cat}</td>
                <td className="px-6 py-4 text-[#A7ADB2] text-sm">{a.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.status === 'published' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                    {a.status === 'published' ? 'منشور' : 'مسودة'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-[#A7ADB2] hover:text-white transition-colors"><Pencil size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-[#A7ADB2] hover:text-white transition-colors"><Eye size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#A7ADB2] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GenericSection({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h2 className="text-white text-2xl font-bold">{title}</h2>
      <div className="bg-[#15191D] rounded-xl border border-white/8 p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#A98B5C]/10 flex items-center justify-center mx-auto mb-4">
          <Settings size={28} className="text-[#A98B5C]" />
        </div>
        <p className="text-[#A7ADB2]">هذا القسم جاهز للتطوير وإضافة المحتوى الإداري.</p>
      </div>
    </div>
  );
}

export function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@sorouh.com' && password === 'admin123') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  if (!isLoggedIn) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#0B0D0F] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="text-white font-bold text-3xl mb-1">ركن الصروح</div>
            <div className="text-[#A98B5C] text-sm tracking-widest">لوحة الإدارة</div>
          </div>
          <div className="bg-[#15191D] rounded-2xl p-8 border border-white/8">
            <div className="flex items-center gap-3 mb-8">
              <Shield size={20} className="text-[#A98B5C]" />
              <h1 className="text-white font-bold text-xl">تسجيل الدخول</h1>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-[#A7ADB2] text-sm mb-2 block">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sorouh.com"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-xl bg-[#0B0D0F] border border-white/10 text-white text-sm focus:border-[#A98B5C] focus:outline-none placeholder:text-[#6B7075]"
                  required
                />
              </div>
              <div>
                <label className="text-[#A7ADB2] text-sm mb-2 block">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#0B0D0F] border border-white/10 text-white text-sm focus:border-[#A98B5C] focus:outline-none placeholder:text-[#6B7075]"
                  required
                />
              </div>
              {loginError && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={14} />
                  {loginError}
                </div>
              )}
              <button type="submit" className="w-full py-3 rounded-xl bg-[#A98B5C] text-white font-semibold hover:bg-[#8f7248] transition-colors">
                دخول
              </button>
            </form>
            <p className="text-[#6B7075] text-xs text-center mt-6">
              بيانات تجريبية: admin@sorouh.com / admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardView />;
      case 'blog': return <BlogManagement />;
      default: return <GenericSection title={navItems.find(n => n.id === activeSection)?.label || ''} />;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0B0D0F] flex font-['IBM_Plex_Sans_Arabic',sans-serif]">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 end-0 bottom-0 w-64 bg-[#0B0D0F] border-s border-white/8 z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-lg">ركن الصروح</div>
              <div className="text-[#A98B5C] text-xs">لوحة الإدارة</div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#6B7075]"><X size={20} /></button>
          </div>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm transition-all ${
                  activeSection === item.id
                    ? 'bg-[#A98B5C]/20 text-[#A98B5C]'
                    : 'text-[#A7ADB2] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/8">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors text-sm"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:me-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="bg-[#15191D] border-b border-white/8 px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#A7ADB2]"><Menu size={22} /></button>
          <h1 className="text-white font-semibold">
            {navItems.find(n => n.id === activeSection)?.label}
          </h1>
          <div className="me-auto" />
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[#6B7075]" />
              <input
                type="text"
                placeholder="بحث..."
                className="hidden md:block w-48 ps-9 pe-4 py-2 rounded-xl bg-[#0B0D0F] border border-white/10 text-white text-sm focus:border-[#A98B5C] focus:outline-none placeholder:text-[#6B7075]"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B0D0F] border border-white/10">
              <div className="w-7 h-7 rounded-full bg-[#A98B5C]/20 flex items-center justify-center">
                <span className="text-[#A98B5C] text-xs font-bold">م</span>
              </div>
              <span className="text-white text-sm hidden md:block">مدير الموقع</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
