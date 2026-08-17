import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MAHARASHTRA_DISTRICTS, DistrictInfo } from '../data/maharashtraDistricts';
import { MapPin, Globe, Tv, ArrowRight, Search, Sparkles } from 'lucide-react';

export default function DistrictExplorer() {
  const [activeDivision, setActiveDivision] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const divisions = [
    { key: 'all', label: 'सर्व ३६ जिल्हे' },
    { key: 'पश्चिम महाराष्ट्र', label: 'पश्चिम महाराष्ट्र (७)' },
    { key: 'विदर्भ', label: 'विदर्भ (११)' },
    { key: 'मराठवाडा', label: 'मराठवाडा (८)' },
    { key: 'उत्तर महाराष्ट्र', label: 'उत्तर महाराष्ट्र (५)' },
    { key: 'कोकण', label: 'कोकण (५)' },
  ];

  const filteredDistricts = MAHARASHTRA_DISTRICTS.filter(district => {
    const matchesDivision = activeDivision === 'all' || district.division === activeDivision;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesDivision;

    const matchesSearch = 
      district.nameMarathi.toLowerCase().includes(query) ||
      district.nameEnglish.toLowerCase().includes(query) ||
      district.website.toLowerCase().includes(query) ||
      district.youtubeChannel.toLowerCase().includes(query) ||
      district.aliases.some(a => a.toLowerCase().includes(query));

    return matchesDivision && matchesSearch;
  });

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 my-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-brand-red/10 text-brand-red text-xs font-extrabold rounded-full flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              महाराष्ट्र ३६ जिल्हे थेट कव्हरेज
            </span>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
              स्थानिक वृत्तवाहिन्या व वेब पोर्टल्स
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            तुमच्या जिल्ह्याची बातमी निवडा
          </h2>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            महाराष्ट्रातील सर्व ३६ जिल्ह्यांमधील स्थानिक अग्रगण्य वृत्तपत्रे, प्रादेशिक डिजिटल पोर्टल्स आणि युट्यूब ब्रॉडकास्टर्सवरून संकलित थेट सविस्तर वृत्त (१,०००+ शब्द).
          </p>
        </div>

        {/* Live Search Input */}
        <div className="w-full lg:w-72 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="जिल्हा किंवा वृत्तस्रोत शोधा..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Division Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 no-scrollbar border-b border-gray-100">
        {divisions.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveDivision(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeDivision === tab.key
                ? 'bg-brand-red text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* District Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {filteredDistricts.map((district) => (
          <Link
            key={district.slug}
            to={`/district/${district.slug}`}
            className="group p-4 bg-gradient-to-b from-gray-50/70 to-white hover:from-red-50/50 hover:to-white border border-gray-200 hover:border-brand-red/40 rounded-2xl transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                  #{district.id}
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  {district.division}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-gray-900 group-hover:text-brand-red transition-colors flex items-center justify-between">
                <span>{district.nameMarathi}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all shrink-0" />
              </h3>
              <p className="text-[11px] font-medium text-gray-500 mb-3">
                {district.nameEnglish}
              </p>

              {/* Media Partner Badges */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100 text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-600 truncate">
                  <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-semibold truncate" title={district.website}>
                    {district.website}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 truncate">
                  <Tv className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="font-semibold truncate" title={district.youtubeChannel}>
                    {district.youtubeChannel}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between text-xs font-bold text-brand-red group-hover:underline">
              <span>बातम्या पहा (१०००+ शब्द)</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </Link>
        ))}
      </div>

      {filteredDistricts.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          '{searchQuery}' साठी कोणताही जिल्हा आढळला नाही. कृपया वेगळा शब्द शोधा.
        </div>
      )}
    </section>
  );
}
