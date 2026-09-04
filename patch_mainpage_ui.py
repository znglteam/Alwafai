import re

with open("src/components/MainPage.tsx", "r") as f:
    text = f.read()

bad_country_ui = """                  {selectedCountry === country && (
                    <div className="px-4 py-3 bg-white border-t border-slate-100 text-xs text-slate-600 leading-loose">
                      {names.join('، ')}
                    </div>
                  )}"""

good_country_ui = """                  {selectedCountry === country && (
                    <div className="px-4 py-3 bg-white border-t border-slate-100 text-xs text-slate-600 leading-loose flex flex-wrap gap-2">
                      {names.map((person, idx) => (
                        <button 
                          key={person.id}
                          onClick={() => onGoToTree(person.id)}
                          className="hover:text-indigo-600 hover:underline transition-colors"
                        >
                          {person.name}{idx < names.length - 1 ? '،' : ''}
                        </button>
                      ))}
                    </div>
                  )}"""
text = text.replace(bad_country_ui, good_country_ui)


bad_spec_ui = """              {Object.entries(specStats).sort((a, b) => b[1].length - a[1].length).map(([spec, names]) => (
                <div key={spec} className="border border-slate-100 rounded-xl overflow-hidden px-4 py-3 bg-slate-50 flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-sm">{spec}</span>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{names.length}</span>
                </div>
              ))}"""

good_spec_ui = """              {Object.entries(specStats).sort((a, b) => b[1].length - a[1].length).map(([spec, names]) => (
                <div key={spec} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setSelectedSpec(selectedSpec === spec ? null : spec)}
                    className="w-full bg-slate-50 hover:bg-slate-100 px-4 py-3 flex items-center justify-between transition-colors"
                  >
                    <span className="font-bold text-slate-700 text-sm">{spec}</span>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{names.length}</span>
                      <ChevronDown size={14} className={`transform transition-transform ${selectedSpec === spec ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {selectedSpec === spec && (
                    <div className="px-4 py-3 bg-white border-t border-slate-100 text-xs text-slate-600 leading-loose flex flex-wrap gap-2">
                      {names.map((person, idx) => (
                        <button 
                          key={person.id}
                          onClick={() => onGoToTree(person.id)}
                          className="hover:text-indigo-600 hover:underline transition-colors"
                        >
                          {person.name}{idx < names.length - 1 ? '،' : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}"""
text = text.replace(bad_spec_ui, good_spec_ui)

with open("src/components/MainPage.tsx", "w") as f:
    f.write(text)
