export interface DistrictInfo {
  id: number;
  nameMarathi: string;
  nameEnglish: string;
  slug: string;
  aliases: string[];
  division: "कोकण" | "पश्चिम महाराष्ट्र" | "मराठवाडा" | "विदर्भ" | "उत्तर महाराष्ट्र";
  website: string;
  youtubeChannel: string;
  description?: string;
}

export const MAHARASHTRA_DISTRICTS: DistrictInfo[] = [
  {
    id: 1,
    nameMarathi: "अहिल्यानगर (अहमदनगर)",
    nameEnglish: "Ahmednagar (Ahilyanagar)",
    slug: "ahmednagar",
    aliases: ["अहिल्यानगर", "अहमदनगर", "Ahmednagar", "Ahilyanagar"],
    division: "पश्चिम महाराष्ट्र",
    website: "Sakal Ahmednagar / Lokmat Ahmednagar",
    youtubeChannel: "Sakal Media Group",
    description: "सह्याद्रीच्या कुशीतील सर्वात मोठा जिल्हा, साखर कारखानदारी आणि शिर्डी साईबाबा देवस्थानसाठी प्रसिद्ध."
  },
  {
    id: 2,
    nameMarathi: "अकोला",
    nameEnglish: "Akola",
    slug: "akola",
    aliases: ["अकोला", "Akola"],
    division: "विदर्भ",
    website: "Lokmat Akola",
    youtubeChannel: "Zee 24 Taas",
    description: "विदर्भातील प्रमुख कापूस व तेलबिया व्यापार केंद्र आणि डॉ. पंजाबराव देशमुख कृषी विद्यापीठाचे शहर."
  },
  {
    id: 3,
    nameMarathi: "अमरावती",
    nameEnglish: "Amravati",
    slug: "amravati",
    aliases: ["अमरावती", "Amravati"],
    division: "विदर्भ",
    website: "Deshonnati",
    youtubeChannel: "Deshonnati News",
    description: "पश्चिम विदर्भाची ऐतिहासिक राजधानी, अंबादेवी मंदिर आणि मेळघाट व्याघ्र प्रकल्पाचा समृद्ध परिसर."
  },
  {
    id: 4,
    nameMarathi: "छत्रपती संभाजीनगर (औरंगाबाद)",
    nameEnglish: "Chhatrapati Sambhajinagar (Aurangabad)",
    slug: "chhatrapati-sambhajinagar",
    aliases: ["छत्रपती संभाजीनगर", "औरंगाबाद", "Chhatrapati Sambhajinagar", "Aurangabad", "Sambhajinagar"],
    division: "मराठवाडा",
    website: "Lokmat Aurangabad",
    youtubeChannel: "TV9 Marathi",
    description: "मराठवाड्याची राजधानी, जागतिक वारसा स्थळे (अजिंठा-वेरूळ लेणी) आणि प्रमुख औद्योगिक केंद्र."
  },
  {
    id: 5,
    nameMarathi: "बीड",
    nameEnglish: "Beed",
    slug: "beed",
    aliases: ["बीड", "Beed"],
    division: "मराठवाडा",
    website: "Sakal Beed",
    youtubeChannel: "Sakal Media Group",
    description: "ऐतिहासिक आणि सांस्कृतिक वारसा लाभलेला जिल्हा, परळी वैजनाथ ज्योतिर्लिंग व शेतीसाठी प्रसिद्ध."
  },
  {
    id: 6,
    nameMarathi: "भंडारा",
    nameEnglish: "Bhandara",
    slug: "bhandara",
    aliases: ["भंडारा", "Bhandara"],
    division: "विदर्भ",
    website: "Lokmat Bhandara",
    youtubeChannel: "ABP Majha",
    description: "पितळेचे भांडी आणि तलावांचा जिल्हा म्हणून ख्यातनाम, भातशेतीचे प्रमुख केंद्र."
  },
  {
    id: 7,
    nameMarathi: "बुलढाणा",
    nameEnglish: "Buldhana",
    slug: "buldhana",
    aliases: ["बुलढाणा", "Buldhana", "Buldana"],
    division: "विदर्भ",
    website: "Deshonnati Buldhana",
    youtubeChannel: "Zee 24 Taas",
    description: "जागतिक दर्जाचे लोणार उल्का सरोवर आणि शेगाव गजानन महाराज मंदिरासाठी जगप्रसिद्ध."
  },
  {
    id: 8,
    nameMarathi: "चंद्रपूर",
    nameEnglish: "Chandrapur",
    slug: "chandrapur",
    aliases: ["चंद्रपूर", "Chandrapur"],
    division: "विदर्भ",
    website: "Lokmat Chandrapur",
    youtubeChannel: "TV9 Marathi",
    description: "काळ्या सोन्याची (कोळसा) भूमी, महाकाली मंदिर आणि ताडोबा-अंधारी राष्ट्रीय व्याघ्र प्रकल्प."
  },
  {
    id: 9,
    nameMarathi: "धुळे",
    nameEnglish: "Dhule",
    slug: "dhule",
    aliases: ["धुळे", "Dhule"],
    division: "उत्तर महाराष्ट्र",
    website: "Sakal Dhule",
    youtubeChannel: "Sakal Media Group",
    description: "खानदेशातील प्रमुख शैक्षणिक केंद्र, पवनऊर्जा आणि मुंबई-आग्रा राष्ट्रीय महामार्गावरील मुख्य जंक्शन."
  },
  {
    id: 10,
    nameMarathi: "गडचिरोली",
    nameEnglish: "Gadchiroli",
    slug: "gadchiroli",
    aliases: ["गडचिरोली", "Gadchiroli"],
    division: "विदर्भ",
    website: "Lokmat Gadchiroli",
    youtubeChannel: "ABP Majha",
    description: "निसर्गसंपन्न घनदाट अरण्य, खनिज संपत्ती आणि समृद्ध आदिवासी लोकसंस्कृतीचा जिल्हा."
  },
  {
    id: 11,
    nameMarathi: "गोंदिया",
    nameEnglish: "Gondia",
    slug: "gondia",
    aliases: ["गोंदिया", "Gondia"],
    division: "विदर्भ",
    website: "Lokmat Gondia",
    youtubeChannel: "Zee 24 Taas",
    description: "भात व तलावांचा जिल्हा, नवेगाव राष्ट्रीय उद्यान आणि मध्य रेल्वेचे महत्त्वाचे केंद्र."
  },
  {
    id: 12,
    nameMarathi: "हिंगोली",
    nameEnglish: "Hingoli",
    slug: "hingoli",
    aliases: ["हिंगोली", "Hingoli"],
    division: "मराठवाडा",
    website: "Sakal Hingoli",
    youtubeChannel: "TV9 Marathi",
    description: "औंढा नागनाथ ज्योतिर्लिंग देवस्थान, इसापूर धरण आणि हळद व्यापाराचे प्रमुख केंद्र."
  },
  {
    id: 13,
    nameMarathi: "जळगाव",
    nameEnglish: "Jalgaon",
    slug: "jalgaon",
    aliases: ["जळगाव", "Jalgaon"],
    division: "उत्तर महाराष्ट्र",
    website: "Lokmat Jalgaon",
    youtubeChannel: "Sakal Media Group",
    description: "सोन्याचे शहर आणि केळीचे जागतिक आगार, उत्तर महाराष्ट्राचे प्रमुख आर्थिक केंद्र."
  },
  {
    id: 14,
    nameMarathi: "जालना",
    nameEnglish: "Jalna",
    slug: "jalna",
    aliases: ["जालना", "Jalna"],
    division: "मराठवाडा",
    website: "Sakal Jalna",
    youtubeChannel: "Zee 24 Taas",
    description: "महाराष्ट्राची स्टील व बियाणे राजधानी, मोसंबीचे प्रमुख उत्पादन केंद्र."
  },
  {
    id: 15,
    nameMarathi: "कोल्हापूर",
    nameEnglish: "Kolhapur",
    slug: "kolhapur",
    aliases: ["कोल्हापूर", "Kolhapur"],
    division: "पश्चिम महाराष्ट्र",
    website: "Pudhari",
    youtubeChannel: "Pudhari News",
    description: "ऐतिहासिक करवीर नगरी, अंबाबाई (महालक्ष्मी) मंदिर, गूळ बाजारपेठ आणि कुस्तीची पंढरी."
  },
  {
    id: 16,
    nameMarathi: "लातूर",
    nameEnglish: "Latur",
    slug: "latur",
    aliases: ["लातूर", "Latur"],
    division: "मराठवाडा",
    website: "Lokmat Latur",
    youtubeChannel: "TV9 Marathi",
    description: "'लातूर पॅटर्न' शैक्षणिक क्रांती, डाळींचे प्रमुख व्यापारी केंद्र आणि मराठवाड्यातील अग्रगण्य शहर."
  },
  {
    id: 17,
    nameMarathi: "मुंबई शहर",
    nameEnglish: "Mumbai City",
    slug: "mumbai-city",
    aliases: ["मुंबई शहर", "दक्षिण मुंबई", "Mumbai City", "South Mumbai"],
    division: "कोकण",
    website: "Loksatta",
    youtubeChannel: "NDTV Marathi",
    description: "भारताची आर्थिक राजधानी, मंत्रालय, उच्च न्यायालय आणि ऐतिहासिक दक्षिण मुंबईचा परिसर."
  },
  {
    id: 18,
    nameMarathi: "मुंबई उपनगर",
    nameEnglish: "Mumbai Suburban",
    slug: "mumbai-suburban",
    aliases: ["मुंबई उपनगर", "उपनगरी मुंबई", "Mumbai Suburban", "Mumbai Suburbs", "मुंबई"],
    division: "कोकण",
    website: "Mumbai Tarun Bharat",
    youtubeChannel: "ABP Majha",
    description: "वांद्रे, अंधेरी, बोरिवली, कुर्ला ते घाटकोपरपर्यंत पसरलेला देशातील सर्वाधिक लोकसंख्येचा उपनगरी जिल्हा."
  },
  {
    id: 19,
    nameMarathi: "नागपूर",
    nameEnglish: "Nagpur",
    slug: "nagpur",
    aliases: ["नागपूर", "Nagpur"],
    division: "विदर्भ",
    website: "The Hitavada",
    youtubeChannel: "Zee 24 Taas",
    description: "महाराष्ट्राची उपराजधानी, संत्रा नगरी, दीक्षाभूमी आणि भारताचा भौगोलिक केंद्रबिंदू (Zero Mile)."
  },
  {
    id: 20,
    nameMarathi: "नांदेड",
    nameEnglish: "Nanded",
    slug: "nanded",
    aliases: ["नांदेड", "Nanded"],
    division: "मराठवाडा",
    website: "Lokmat Nanded",
    youtubeChannel: "TV9 Marathi",
    description: "पवित्र सचखंड गुरुद्वारा, गोदावरी नदीकाठचे तीर्थक्षेत्र आणि संस्कृत कवींची भूमी."
  },
  {
    id: 21,
    nameMarathi: "नंदुरबार",
    nameEnglish: "Nandurbar",
    slug: "nandurbar",
    aliases: ["नंदुरबार", "Nandurbar"],
    division: "उत्तर महाराष्ट्र",
    website: "Sakal Nandurbar",
    youtubeChannel: "Sakal Media Group",
    description: "सातपुड्याच्या रांगांमधील निसर्गरम्य तोरणमाळ थंड हवेचे ठिकाण आणि मिरची उत्पादनाचा जिल्हा."
  },
  {
    id: 22,
    nameMarathi: "नाशिक",
    nameEnglish: "Nashik",
    slug: "nashik",
    aliases: ["नाशिक", "Nashik"],
    division: "उत्तर महाराष्ट्र",
    website: "Deshdoot",
    youtubeChannel: "Sakal Media Group",
    description: "कुंभमेळ्याची तीर्थनगरी, द्राक्षे व वाईनची राजधानी, त्र्यंबकेश्वर ज्योतिर्लिंग व औद्योगिक शहर."
  },
  {
    id: 23,
    nameMarathi: "धाराशिव (उस्मानाबाद)",
    nameEnglish: "Dharashiv (Osmanabad)",
    slug: "dharashiv",
    aliases: ["धाराशिव", "उस्मानाबाद", "Dharashiv", "Osmanabad"],
    division: "मराठवाडा",
    website: "Lokmat Osmanabad",
    youtubeChannel: "TV9 Marathi",
    description: "तुळजापूर तुळजाभवानी माता देवस्थान, धाराशिव लेणी आणि ऐतिहासिक मराठवाडा संस्कृती."
  },
  {
    id: 24,
    nameMarathi: "पालघर",
    nameEnglish: "Palghar",
    slug: "palghar",
    aliases: ["पालघर", "Palghar"],
    division: "कोकण",
    website: "Loksatta",
    youtubeChannel: "ABP Majha",
    description: "महाराष्ट्राचा ३६ वा जिल्हा, तारापूर अणुऊर्जा केंद्र, समृद्ध समुद्रकिनारे आणि वारली चित्रकला."
  },
  {
    id: 25,
    nameMarathi: "परभणी",
    nameEnglish: "Parbhani",
    slug: "parbhani",
    aliases: ["परभणी", "Parbhani"],
    division: "मराठवाडा",
    website: "Sakal Parbhani",
    youtubeChannel: "Zee 24 Taas",
    description: "वसंतराव नाईक मराठवाडा कृषी विद्यापीठ, संत जनाबाईंची भूमी गंगाखेड आणि शेती प्रधान जिल्हा."
  },
  {
    id: 26,
    nameMarathi: "पुणे",
    nameEnglish: "Pune",
    slug: "pune",
    aliases: ["पुणे", "Pune"],
    division: "पश्चिम महाराष्ट्र",
    website: "Sakal Pune",
    youtubeChannel: "Sakal Media Group",
    description: "महाराष्ट्राची सांस्कृतिक राजधानी, विद्येचे माहेरघर, आयटी हब आणि ऐतिहासिक शनिवार वाडा."
  },
  {
    id: 27,
    nameMarathi: "रायगड",
    nameEnglish: "Raigad",
    slug: "raigad",
    aliases: ["रायगड", "Raigad"],
    division: "कोकण",
    website: "Raigad Post",
    youtubeChannel: "ABP Majha",
    description: "छत्रपती शिवाजी महाराजांची राजधानी किल्ले रायगड, अलिबाग समुद्रकिनारे आणि जेएनपीटी बंदर."
  },
  {
    id: 28,
    nameMarathi: "रत्नागिरी",
    nameEnglish: "Ratnagiri",
    slug: "ratnagiri",
    aliases: ["रत्नागिरी", "Ratnagiri"],
    division: "कोकण",
    website: "Konkan Today",
    youtubeChannel: "Zee 24 Taas",
    description: "हापूस आंब्याची राजधानी, लोकमान्य टिळक व सावरकरांची कर्मभूमी, निसर्गरम्य कोकण किनारा."
  },
  {
    id: 29,
    nameMarathi: "सांगली",
    nameEnglish: "Sangli",
    slug: "sangli",
    aliases: ["सांगली", "Sangli"],
    division: "पश्चिम महाराष्ट्र",
    website: "Pudhari Sangli",
    youtubeChannel: "Pudhari News",
    description: "नाट्य पंढरी, हळदीची बाजारपेठ, कृष्णा नदीकाठचे बागायती क्षेत्र आणि साखर पट्टा."
  },
  {
    id: 30,
    nameMarathi: "सातारा",
    nameEnglish: "Satara",
    slug: "satara",
    aliases: ["सातारा", "Satara"],
    division: "पश्चिम महाराष्ट्र",
    website: "Sakal Satara",
    youtubeChannel: "TV9 Marathi",
    description: "कास पठार (जागतिक वारसा), महाबळेश्वर थंड हवेचे ठिकाण, अजिंक्यतारा आणि कोयना जलविद्युत प्रकल्प."
  },
  {
    id: 31,
    nameMarathi: "सिंधुदुर्ग",
    nameEnglish: "Sindhudurg",
    slug: "sindhudurg",
    aliases: ["सिंधुदुर्ग", "Sindhudurg"],
    division: "कोकण",
    website: "Konkan Media",
    youtubeChannel: "ABP Majha",
    description: "भारताचा पहिला पर्यटन जिल्हा, छत्रपती शिवाजी महाराजांनी बांधलेला जलदुर्ग आणि मालवणी संस्कृती."
  },
  {
    id: 32,
    nameMarathi: "सोलापूर",
    nameEnglish: "Solapur",
    slug: "solapur",
    aliases: ["सोलापूर", "Solapur"],
    division: "पश्चिम महाराष्ट्र",
    website: "Sakal Solapur",
    youtubeChannel: "Zee 24 Taas",
    description: "पंढरपूर विठ्ठल रुक्मिणी देवस्थान, सोलापुरी चादर व टॉवेल उद्योग, सिद्धेश्वर यात्रा."
  },
  {
    id: 33,
    nameMarathi: "ठाणे",
    nameEnglish: "Thane",
    slug: "thane",
    aliases: ["ठाणे", "Thane"],
    division: "कोकण",
    website: "Loksatta Thane",
    youtubeChannel: "TV9 Marathi",
    description: "तलावांचे शहर, मुंबईची प्रमुख उपनगरीय वेस, ठाणे खाडी आणि जलद वाढणारे महानगर."
  },
  {
    id: 34,
    nameMarathi: "वर्धा",
    nameEnglish: "Wardha",
    slug: "wardha",
    aliases: ["वर्धा", "Wardha"],
    division: "विदर्भ",
    website: "Lokmat Wardha",
    youtubeChannel: "Deshonnati News",
    description: "महात्मा गांधींचा सेवाग्राम आश्रम, आचार्य विनोबा भावे यांचा पवनार आश्रम आणि शांतता चळवळीचे केंद्र."
  },
  {
    id: 35,
    nameMarathi: "वाशिम",
    nameEnglish: "Washim",
    slug: "washim",
    aliases: ["वाशिम", "Washim"],
    division: "विदर्भ",
    website: "Lokmat Washim",
    youtubeChannel: "Zee 24 Taas",
    description: "प्राचीन वत्सगुल्म नगरी, बालाजी मंदिर, पोहरादेवी तीर्थक्षेत्र आणि सोयाबीन उत्पादक जिल्हा."
  },
  {
    id: 36,
    nameMarathi: "यवतमाळ",
    nameEnglish: "Yavatmal",
    slug: "yavatmal",
    aliases: ["यवतमाळ", "Yavatmal"],
    division: "विदर्भ",
    website: "Punya Nagari",
    youtubeChannel: "Deshonnati News",
    description: "पांढऱ्या सोन्याचा (कापूस) जिल्हा, टिपेश्वर वन्यजीव अभयारण्य आणि पैनगंगा-वर्धा खोरे."
  }
];

export function getDistrictBySlug(slug: string): DistrictInfo | undefined {
  const normalized = (slug || "").toLowerCase().trim();
  return MAHARASHTRA_DISTRICTS.find(d => 
    d.slug === normalized || 
    d.nameEnglish.toLowerCase() === normalized || 
    d.nameMarathi === slug ||
    d.aliases.some(a => a.toLowerCase() === normalized || a === slug)
  );
}

export function getDistrictByName(name: string): DistrictInfo | undefined {
  if (!name) return undefined;
  const clean = name.trim();
  return MAHARASHTRA_DISTRICTS.find(d => 
    d.nameMarathi === clean ||
    d.nameMarathi.includes(clean) ||
    clean.includes(d.nameMarathi) ||
    d.aliases.some(a => a === clean || clean.includes(a) || a.includes(clean))
  );
}
