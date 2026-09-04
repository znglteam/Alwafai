import re

with open("src/components/MainPage.tsx", "r") as f:
    text = f.read()

# Add imports for pie chart or icons
import_stmt = """import { Image, History, Calendar, Award, MapPin, Users, Plus, Trash2, TrendingUp, BookOpen, Network, LogIn, ChevronDown, Activity, Globe } from 'lucide-react';"""
text = re.sub(r'import \{ Image, History, .*? \} from \'lucide-react\';', import_stmt, text)

# Add logic
logic = """
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);

  // Statistics
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const countryStats = members.reduce((acc, member) => {
    const c = member.country || 'غير محدد';
    if (!acc[c]) acc[c] = [];
    acc[c].push(member.name);
    return acc;
  }, {} as Record<string, string[]>);

  const specStats = members.reduce((acc, member) => {
    const s = member.specialization || 'غير محدد';
    if (!acc[s]) acc[s] = [];
    acc[s].push(member.name);
    return acc;
  }, {} as Record<string, string[]>);
"""
text = re.sub(r'  const \[showAddPhoto.*?split\(\'T\'\)\[0\]\);', logic, text, flags=re.DOTALL)

# Add UI for statistics
ui_stats = """
      {/* Statistics Section */}
      <section className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Activity className="text-indigo-600" size={22} />
          إحصائيات العائلة
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Country Stats */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-4">
              <Globe className="text-blue-500" size={16} />
              التوزيع الجغرافي (بلد الإقامة)
            </h4>
            <div className="space-y-2">
              {Object.entries(countryStats).sort((a, b) => b[1].length - a[1].length).map(([country, names]) => (
                <div key={country} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setSelectedCountry(selectedCountry === country ? null : country)}
                    className="w-full bg-slate-50 hover:bg-slate-100 px-4 py-3 flex items-center justify-between transition-colors"
                  >
                    <span className="font-bold text-slate-700 text-sm">{country}</span>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{names.length}</span>
                      <ChevronDown size={14} className={`transform transition-transform ${selectedCountry === country ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {selectedCountry === country && (
                    <div className="px-4 py-3 bg-white border-t border-slate-100 text-xs text-slate-600 leading-loose">
                      {names.join('، ')}
                    </div>
                  )}
                </div>
              ))}
              {Object.keys(countryStats).length === 0 && (
                <div className="text-xs text-slate-400 text-center py-4">لا توجد بيانات متاحة</div>
              )}
            </div>
          </div>

          {/* Specialization Stats */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-4">
              <Award className="text-emerald-500" size={16} />
              التوزيع المهني والعلمي
            </h4>
            <div className="space-y-2">
              {Object.entries(specStats).sort((a, b) => b[1].length - a[1].length).map(([spec, names]) => (
                <div key={spec} className="border border-slate-100 rounded-xl overflow-hidden px-4 py-3 bg-slate-50 flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-sm">{spec}</span>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{names.length}</span>
                </div>
              ))}
              {Object.keys(specStats).length === 0 && (
                <div className="text-xs text-slate-400 text-center py-4">لا توجد بيانات متاحة</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
"""
text = text.replace("{/* Photo Gallery Section */}", ui_stats)

with open("src/components/MainPage.tsx", "w") as f:
    f.write(text)
