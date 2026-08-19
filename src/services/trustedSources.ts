import { NewsSourceConfig } from '../types';

export const TRUSTED_NEWS_SOURCES: NewsSourceConfig[] = [
  // 1. Official Government & Press Information Bureau
  {
    id: 'src-rural-taluka-maharashtra',
    name: 'Maharashtra Rural, Taluka & Village News',
    nameMarathi: 'महाराष्ट्र ग्रामीण, तालुका व गाव पातळीवरील घडामोडी',
    type: 'GOV_PORTAL',
    url: 'https://news.google.com/rss/search?q=महाराष्ट्र+तालुका+OR+ग्रामपंचायत+OR+जिल्हा+परिषद+OR+गाव&hl=mr&gl=IN&ceid=IN:mr',
    region: 'MAHARASHTRA',
    trustScore: 95,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-pib-marathi',
    name: 'Press Information Bureau (PIB Mumbai - GoI)',
    nameMarathi: 'प्रेस इन्फॉर्मेशन ब्युरो (भारत सरकार - मुंबई)',
    type: 'PIB',
    url: 'https://news.google.com/rss/search?q=PIB+Maharashtra+OR+भारत+सरकार+महाराष्ट्र&hl=mr&gl=IN&ceid=IN:mr',
    region: 'MAHARASHTRA',
    trustScore: 99,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-dgipr-mahanews',
    name: 'DGIPR Maharashtra (MahaNews Official)',
    nameMarathi: 'माहिती व जनसंपर्क महासंचालनालय (महान्यूज - महाराष्ट्र शासन)',
    type: 'DGIPR',
    url: 'https://news.google.com/rss/search?q=महाराष्ट्र+शासन+निर्णय+OR+मंत्रिमंडळ+निर्णय+OR+महान्यूज&hl=mr&gl=IN&ceid=IN:mr',
    region: 'MAHARASHTRA',
    trustScore: 99,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-air-marathi',
    name: 'All India Radio News (आकाशवाणी मुंबई)',
    nameMarathi: 'आकाशवाणी वृत्त सेवा (महाराष्ट्र)',
    type: 'GOV_PORTAL',
    url: 'https://news.google.com/rss/search?q=आकाशवाणी+बातम्या+महाराष्ट्र+OR+AIR+News+Marathi&hl=mr&gl=IN&ceid=IN:mr',
    region: 'MAHARASHTRA',
    trustScore: 98,
    enabled: true,
    status: 'ACTIVE'
  },

  // 2. Agriculture & Farmers (शेती व शेतकरी)
  {
    id: 'src-agri-maha',
    name: 'Maharashtra Agriculture & Krishi Vibhag',
    nameMarathi: 'कृषी विभाग महाराष्ट्र शासन व शेती घडामोडी',
    type: 'GOV_PORTAL',
    url: 'https://news.google.com/rss/search?q=महाराष्ट्र+शेती+OR+हमीभाव+OR+पीक+विमा+OR+बाजारभाव&hl=mr&gl=IN&ceid=IN:mr',
    region: 'MAHARASHTRA',
    category: 'शेती',
    trustScore: 96,
    enabled: true,
    status: 'ACTIVE'
  },

  // 4. District Feeds - Western Maharashtra (पश्चिम महाराष्ट्र)
  {
    id: 'src-pune',
    name: 'Pune District & Division News',
    nameMarathi: 'पुणे जिल्हा व विभागीय घडामोडी',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=पुणे+जिल्हा+OR+पिंपरी+चिंचवड+OR+पुणे+मनपा&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'पुणे',
    trustScore: 95,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-satara',
    name: 'Satara District News',
    nameMarathi: 'सातारा जिल्हा वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=सातारा+जिल्हा+OR+कराड+OR+महाबळेश्वर&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'सातारा',
    trustScore: 94,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-kolhapur',
    name: 'Kolhapur & Sangli District News',
    nameMarathi: 'कोल्हापूर व सांगली जिल्हा वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=कोल्हापूर+जिल्हा+OR+सांगली+जिल्हा+OR+पंचगंगा&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'कोल्हापूर',
    trustScore: 94,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-solapur',
    name: 'Solapur District News',
    nameMarathi: 'सोलापूर जिल्हा वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=सोलापूर+जिल्हा+OR+पंढरपूर+OR+उजनी&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'सोलापूर',
    trustScore: 94,
    enabled: true,
    status: 'ACTIVE'
  },

  // 5. District Feeds - Marathwada (मराठवाडा)
  {
    id: 'src-sambhajinagar',
    name: 'Chhatrapati Sambhajinagar & Jalna News',
    nameMarathi: 'छत्रपती संभाजीनगर व जालना जिल्हा वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=छत्रपती+संभाजीनगर+OR+औरंगाबाद+OR+जालना&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'छत्रपती संभाजीनगर',
    trustScore: 95,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-nanded',
    name: 'Nanded, Hingoli & Parbhani News',
    nameMarathi: 'नांदेड, हिंगोली व परभणी जिल्हा वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=नांदेड+जिल्हा+OR+परभणी+OR+हिंगोली&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'नांदेड',
    trustScore: 94,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-latur-dharashiv-beed',
    name: 'Latur, Dharashiv & Beed News',
    nameMarathi: 'लातूर, धाराशिव व बीड जिल्हा वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=लातूर+जिल्हा+OR+धाराशिव+OR+बीड+जिल्हा&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'लातूर',
    trustScore: 94,
    enabled: true,
    status: 'ACTIVE'
  },

  // 6. District Feeds - Vidarbha (विदर्भ)
  {
    id: 'src-nagpur',
    name: 'Nagpur & Wardha District News',
    nameMarathi: 'नागपूर व वर्धा जिल्हा वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=नागपूर+जिल्हा+OR+नागपूर+मनपा+OR+वर्धा&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'नागपूर',
    trustScore: 95,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-amravati-akola',
    name: 'Amravati, Akola, Buldhana & Washim News',
    nameMarathi: 'अमरावती, अकोला, बुलढाणा व वाशिम जिल्हा वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=अमरावती+जिल्हा+OR+अकोला+OR+बुलढाणा+OR+वाशिम&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'अमरावती',
    trustScore: 94,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-chandrapur-gadchiroli',
    name: 'Chandrapur, Gadchiroli, Bhandara & Gondia News',
    nameMarathi: 'चंद्रपूर, गडचिरोली, भंडारा व गोंदिया जिल्हा वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=चंद्रपूर+OR+गडचिरोली+OR+भंडारा+OR+गोंदिया&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'चंद्रपूर',
    trustScore: 94,
    enabled: true,
    status: 'ACTIVE'
  },

  // 7. District Feeds - North Maharashtra & Khandesh (उत्तर महाराष्ट्र व खान्देश)
  {
    id: 'src-nashik-ahmednagar',
    name: 'Nashik & Ahilyanagar (Ahmednagar) News',
    nameMarathi: 'नाशिक व अहिल्यानगर (अहमदनगर) जिल्हा वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=नाशिक+जिल्हा+OR+अहिल्यानगर+OR+अहमदनगर&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'नाशिक',
    trustScore: 95,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-jalgaon-dhule-nandurbar',
    name: 'Jalgaon, Dhule & Nandurbar News',
    nameMarathi: 'जळगाव, धुळे व नंदुरबार जिल्हा वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=जळगाव+जिल्हा+OR+धुळे+OR+नंदुरबार&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'जळगाव',
    trustScore: 94,
    enabled: true,
    status: 'ACTIVE'
  },

  // 8. District Feeds - Konkan & Mumbai Metropolitan (कोकण व मुंबई)
  {
    id: 'src-mumbai-thane-palghar',
    name: 'Mumbai, Thane, Palghar & Raigad News',
    nameMarathi: 'मुंबई, ठाणे, पालघर व रायगड जिल्हा वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=मुंबई+महापालिका+OR+ठाणे+OR+नवी+मुंबई+OR+पालघर+OR+रायगड&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'मुंबई',
    trustScore: 96,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-ratnagiri-sindhudurg',
    name: 'Ratnagiri & Sindhudurg Coastal News',
    nameMarathi: 'रत्नागिरी व सिंधुदुर्ग कोकण किनारपट्टी वार्ता',
    type: 'DISTRICT_COLLECTORATE',
    url: 'https://news.google.com/rss/search?q=रत्नागिरी+जिल्हा+OR+सिंधुदुर्ग+OR+कोकण+रेल्वे&hl=mr&gl=IN&ceid=IN:mr',
    region: 'DISTRICT',
    district: 'रत्नागिरी',
    trustScore: 94,
    enabled: true,
    status: 'ACTIVE'
  },

  // 9. India-wide National Developments (राष्ट्रीय घडामोडी)
  {
    id: 'src-national-governance',
    name: 'National Governance, Parliament & Supreme Court',
    nameMarathi: 'राष्ट्रीय घडामोडी, संसद व सर्वोच्च न्यायालय',
    type: 'NEWS_AGENCY',
    url: 'https://news.google.com/rss/search?q=भारत+सरकार+OR+संसद+OR+सर्वोच्च+न्यायालय+OR+पंतप्रधान&hl=mr&gl=IN&ceid=IN:mr',
    region: 'NATIONAL',
    category: 'राष्ट्रीय',
    trustScore: 97,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-national-economy',
    name: 'National Economy, RBI, Markets & Infrastructure',
    nameMarathi: 'राष्ट्रीय अर्थव्यवस्था, आरबीआय व पायाभूत सुविधा',
    type: 'NEWS_AGENCY',
    url: 'https://news.google.com/rss/search?q=भारतीय+अर्थव्यवस्था+OR+RBI+OR+रेल्वे+प्रकल्प+OR+महामार्ग&hl=mr&gl=IN&ceid=IN:mr',
    region: 'NATIONAL',
    category: 'व्यापार',
    trustScore: 96,
    enabled: true,
    status: 'ACTIVE'
  },
  {
    id: 'src-national-tech-science',
    name: 'ISRO, Defence & Technology News',
    nameMarathi: 'इस्रो, संरक्षण दल व विज्ञान तंत्रज्ञान',
    type: 'NEWS_AGENCY',
    url: 'https://news.google.com/rss/search?q=ISRO+OR+भारतीय+संरक्षण+दल+OR+डीआरडीओ+OR+विज्ञान&hl=mr&gl=IN&ceid=IN:mr',
    region: 'NATIONAL',
    category: 'तंत्रज्ञान',
    trustScore: 97,
    enabled: true,
    status: 'ACTIVE'
  }
];

export const MAHARASHTRA_36_DISTRICTS = [
  'मुंबई', 'मुंबई उपनगर', 'ठाणे', 'पालघर', 'रायगड', 'रत्नागिरी', 'सिंधुदुर्ग',
  'पुणे', 'सातारा', 'सांगली', 'सोलापूर', 'कोल्हापूर',
  'नाशिक', 'अहिल्यानगर', 'धुळे', 'जळगाव', 'नंदुरबार',
  'छत्रपती संभाजीनगर', 'जालना', 'बीड', 'लातूर', 'धाराशिव', 'नांदेड', 'परभणी', 'हिंगोली',
  'अमरावती', 'अकोला', 'बुलढाणा', 'वाशिम', 'यवतमाळ',
  'नागपूर', 'वर्धा', 'भंडारा', 'गोंदिया', 'चंद्रपूर', 'गडचिरोली'
];
