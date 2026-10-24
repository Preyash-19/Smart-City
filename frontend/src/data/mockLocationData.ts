// Mock Administrative Hierarchy Data (Comprehensive National & Regional Directory)
// Cascading Hierarchy: State -> District -> City -> Division

export interface DivisionItem {
  id: string;
  nameEn: string;
  nameHi: string;
  nameMr: string;
}

export interface CityItem {
  id: string;
  nameEn: string;
  nameHi: string;
  nameMr: string;
  divisions: DivisionItem[];
}

export interface DistrictItem {
  id: string;
  nameEn: string;
  nameHi: string;
  nameMr: string;
  cities: CityItem[];
}

export interface StateItem {
  id: string;
  nameEn: string;
  nameHi: string;
  nameMr: string;
  districts: DistrictItem[];
}

export const MOCK_ADMINISTRATIVE_LOCATIONS: StateItem[] = [
  // ── 1. MAHARASHTRA ──
  {
    id: 'MH',
    nameEn: 'Maharashtra',
    nameHi: 'महाराष्ट्र',
    nameMr: 'महाराष्ट्र',
    districts: [
      {
        id: 'MH_NGP',
        nameEn: 'Nagpur',
        nameHi: 'नागपुर',
        nameMr: 'नागपूर',
        cities: [
          {
            id: 'MH_NGP_CITY',
            nameEn: 'Nagpur Municipal Corporation',
            nameHi: 'नागपुर महानगरपालिका',
            nameMr: 'नागपूर महानगरपालिका',
            divisions: [
              { id: 'DIV_NORTH', nameEn: 'North Division', nameHi: 'उत्तर प्रभाग', nameMr: 'उत्तर विभाग' },
              { id: 'DIV_SOUTH', nameEn: 'South Division', nameHi: 'दक्षिण प्रभाग', nameMr: 'दक्षिण विभाग' },
              { id: 'DIV_EAST', nameEn: 'East Division', nameHi: 'पूर्व प्रभाग', nameMr: 'पूर्व विभाग' },
              { id: 'DIV_WEST', nameEn: 'West Division', nameHi: 'पश्चिम प्रभाग', nameMr: 'पश्चिम विभाग' },
              { id: 'DIV_CENTRAL', nameEn: 'Central Division', nameHi: 'मध्य प्रभाग', nameMr: 'मध्य विभाग' },
              { id: 'DIV_DHARAMPETH', nameEn: 'Dharampeth Zone (Zone 2)', nameHi: 'धरमपेठ क्षेत्र (क्षेत्र 2)', nameMr: 'धरमपेठ विभाग (विभाग 2)' },
              { id: 'DIV_HANUMAN_NAGAR', nameEn: 'Hanuman Nagar Zone (Zone 3)', nameHi: 'हनुमान नगर क्षेत्र (क्षेत्र 3)', nameMr: 'हनुमान नगर विभाग (विभाग 3)' },
              { id: 'DIV_GANDHIBAGH', nameEn: 'Gandhibagh Zone (Zone 6)', nameHi: 'गांधीबाग क्षेत्र (क्षेत्र 6)', nameMr: 'गांधीबाग विभाग (विभाग 6)' },
              { id: 'DIV_MANGALWARI', nameEn: 'Mangalwari Zone (Zone 10)', nameHi: 'मंगलवारी क्षेत्र (क्षेत्र 10)', nameMr: 'मंगळवारी विभाग (विभाग 10)' },
              { id: 'DIV_LAKADGANJ', nameEn: 'Lakadganj Zone (Zone 8)', nameHi: 'लकड़गंज क्षेत्र (क्षेत्र 8)', nameMr: 'लाकडगंज विभाग (विभाग 8)' },
            ],
          },
          {
            id: 'MH_NGP_UMR',
            nameEn: 'Umred',
            nameHi: 'उमरेड',
            nameMr: 'उमरेड',
            divisions: [
              { id: 'DIV_NORTH', nameEn: 'North Division', nameHi: 'उत्तर प्रभाग', nameMr: 'उत्तर विभाग' },
              { id: 'DIV_SOUTH', nameEn: 'South Division', nameHi: 'दक्षिण प्रभाग', nameMr: 'दक्षिण विभाग' },
              { id: 'DIV_EAST', nameEn: 'East Division', nameHi: 'पूर्व प्रभाग', nameMr: 'पूर्व विभाग' },
              { id: 'DIV_WEST', nameEn: 'West Division', nameHi: 'पश्चिम प्रभाग', nameMr: 'पश्चिम विभाग' },
              { id: 'DIV_CENTRAL', nameEn: 'Central Division', nameHi: 'मध्य प्रभाग', nameMr: 'मध्य विभाग' },
            ],
          },
          {
            id: 'MH_NGP_KAMPTEE',
            nameEn: 'Kamptee',
            nameHi: 'कामठी',
            nameMr: 'कामठी',
            divisions: [
              { id: 'DIV_KAMP_CANTT', nameEn: 'Cantonment Division', nameHi: 'छावनी प्रभाग', nameMr: 'कंटेन्मेंट विभाग' },
              { id: 'DIV_KAMP_OLD', nameEn: 'Old Town Division', nameHi: 'पुराना शहर प्रभाग', nameMr: 'जुने शहर विभाग' },
              { id: 'DIV_KAMP_DRAGON', nameEn: 'Dragon Palace Zone', nameHi: 'ड्रैगन पैलेस क्षेत्र', nameMr: 'ड्रॅगन पॅलेस विभाग' },
            ],
          },
          {
            id: 'MH_NGP_KATOL',
            nameEn: 'Katol',
            nameHi: 'काटोल',
            nameMr: 'काटोल',
            divisions: [
              { id: 'DIV_KATOL_TOWN', nameEn: 'Town Council Division', nameHi: 'नगर परिषद प्रभाग', nameMr: 'नगर परिषद विभाग' },
              { id: 'DIV_KATOL_MIDC', nameEn: 'MIDC Industrial Zone', nameHi: 'एमआईडीसी औद्योगिक क्षेत्र', nameMr: 'एमआयडीसी औद्योगिक विभाग' },
            ],
          },
          {
            id: 'MH_NGP_RAMTEK',
            nameEn: 'Ramtek',
            nameHi: 'रामटेक',
            nameMr: 'रामटेक',
            divisions: [
              { id: 'DIV_RAMTEK_CENTRAL', nameEn: 'Heritage & Temple Zone', nameHi: 'मंदिर व धरोहर क्षेत्र', nameMr: 'मंदिर व वारसा विभाग' },
              { id: 'DIV_RAMTEK_CIVIC', nameEn: 'Municipal Council Division', nameHi: 'नगर पालिका प्रभाग', nameMr: 'नगर पालिका विभाग' },
            ],
          },
        ],
      },
      {
        id: 'MH_MUM_SUB',
        nameEn: 'Mumbai Suburban',
        nameHi: 'मुंबई उपनगर',
        nameMr: 'मुंबई उपनगर',
        cities: [
          {
            id: 'MH_MUM_WEST_SUB',
            nameEn: 'Western Suburbs (BMC)',
            nameHi: 'पश्चिमी उपनगर (बीएमसी)',
            nameMr: 'पश्चिम उपनगरे (मनपा)',
            divisions: [
              { id: 'DIV_BANDRA_W', nameEn: 'Bandra West (H/West Ward)', nameHi: 'बांद्रा पश्चिम (एच/पश्चिम वार्ड)', nameMr: 'वांद्रे पश्चिम (एच/पश्चिम वॉर्ड)' },
              { id: 'DIV_ANDHERI_E', nameEn: 'Andheri East (K/East Ward)', nameHi: 'अंधेरी पूर्व (के/पूर्व वार्ड)', nameMr: 'अंधेरी पूर्व (के/पूर्व वॉर्ड)' },
              { id: 'DIV_ANDHERI_W', nameEn: 'Andheri West (K/West Ward)', nameHi: 'अंधेरी पश्चिम (के/पश्चिम वार्ड)', nameMr: 'अंधेरी पश्चिम (के/पश्चिम वॉर्ड)' },
              { id: 'DIV_BORIVALI', nameEn: 'Borivali (R/Central Ward)', nameHi: 'बोरीवली (आर/मध्य वार्ड)', nameMr: 'बोरिवली (आर/मध्य वॉर्ड)' },
              { id: 'DIV_GOREGAON', nameEn: 'Goregaon (P/South Ward)', nameHi: 'गोरेगांव (पी/दक्षिण वार्ड)', nameMr: 'गोरेगाव (पी/दक्षिण वॉर्ड)' },
              { id: 'DIV_MALAD', nameEn: 'Malad (P/North Ward)', nameHi: 'मलाड (पी/उत्तर वार्ड)', nameMr: 'मालाड (पी/उत्तर वॉर्ड)' },
              { id: 'DIV_KANDIVALI', nameEn: 'Kandivali (R/South Ward)', nameHi: 'कांदिवली (आर/दक्षिण वार्ड)', nameMr: 'कांदिवली (आर/दक्षिण वॉर्ड)' },
            ],
          },
          {
            id: 'MH_MUM_EAST_SUB',
            nameEn: 'Eastern Suburbs (BMC)',
            nameHi: 'पूर्वी उपनगर (बीएमसी)',
            nameMr: 'पूर्व उपनगरे (मनपा)',
            divisions: [
              { id: 'DIV_KURLA', nameEn: 'Kurla (L Ward)', nameHi: 'कुर्ला (एल वार्ड)', nameMr: 'कुर्ला (एल वॉर्ड)' },
              { id: 'DIV_GHATKOPAR', nameEn: 'Ghatkopar (N Ward)', nameHi: 'घाटकोपर (एन वार्ड)', nameMr: 'घाटकोपर (एन वॉर्ड)' },
              { id: 'DIV_CHEMBUR', nameEn: 'Chembur (M/West Ward)', nameHi: 'चेंबूर (एम/पश्चिम वार्ड)', nameMr: 'चेंबर (एम/पश्चिम वॉर्ड)' },
              { id: 'DIV_MULUND', nameEn: 'Mulund (T Ward)', nameHi: 'मुलुंड (टी वार्ड)', nameMr: 'मुलुंड (टी वॉर्ड)' },
              { id: 'DIV_BHANDUP', nameEn: 'Bhandup (S Ward)', nameHi: 'भांडुप (एस वार्ड)', nameMr: 'भांडुप (एस वॉर्ड)' },
            ],
          },
        ],
      },
      {
        id: 'MH_MUM_CITY',
        nameEn: 'Mumbai City (Island City)',
        nameHi: 'मुंबई शहर (आईलैंड सिटी)',
        nameMr: 'मुंबई शहर (दक्षिण मुंबई)',
        cities: [
          {
            id: 'MH_MUM_SOUTH',
            nameEn: 'South Mumbai (BMC)',
            nameHi: 'दक्षिण मुंबई (बीएमसी)',
            nameMr: 'दक्षिण मुंबई (मनपा)',
            divisions: [
              { id: 'DIV_COLABA', nameEn: 'Colaba / Fort (A Ward)', nameHi: 'कुलाबा / फोर्ट (ए वार्ड)', nameMr: 'कुलाबा / फोर्ट (ए वॉर्ड)' },
              { id: 'DIV_MARINE_LINES', nameEn: 'Marine Lines / Girgaon (C Ward)', nameHi: 'मरीन लाइन्स / गिरगांव (सी वार्ड)', nameMr: 'मरीन लाईन्स / गिरगाव (सी वॉर्ड)' },
              { id: 'DIV_BYCULLA', nameEn: 'Byculla / Nagpada (E Ward)', nameHi: 'भायखला / नागपाड़ा (ई वार्ड)', nameMr: 'भायखळा / नागपाडा (ई वॉर्ड)' },
              { id: 'DIV_DADAR', nameEn: 'Dadar / Prabhadevi (G/North Ward)', nameHi: 'दादर / प्रभादेवी (जी/उत्तर वार्ड)', nameMr: 'दादर / प्रभादेवी (जी/उत्तर वॉर्ड)' },
              { id: 'DIV_WORLI', nameEn: 'Worli / Lower Parel (G/South Ward)', nameHi: 'वर्ली / लोअर परेल (जी/दक्षिण वार्ड)', nameMr: 'वरळी / लोअर परळ (जी/दक्षिण वॉर्ड)' },
            ],
          },
        ],
      },
      {
        id: 'MH_PUN',
        nameEn: 'Pune',
        nameHi: 'पुणे',
        nameMr: 'पुणे',
        cities: [
          {
            id: 'MH_PUN_PMC',
            nameEn: 'Pune Municipal Corporation',
            nameHi: 'पुणे महानगरपालिका',
            nameMr: 'पुणे महानगरपालिका',
            divisions: [
              { id: 'DIV_SHIVAJINAGAR', nameEn: 'Shivajinagar-Ghole Road Division', nameHi: 'शिवाजीनगर-घोले रोड प्रभाग', nameMr: 'शिवाजीनगर-घोले रस्ता विभाग' },
              { id: 'DIV_KOTHRUD', nameEn: 'Kothrud-Bavdhan Division', nameHi: 'कोथरूड-बावधन प्रभाग', nameMr: 'कोथरूड-बावधन विभाग' },
              { id: 'DIV_HADAPSAR', nameEn: 'Hadapsar-Mundhwa Division', nameHi: 'हडपसर-मुंढवा प्रभाग', nameMr: 'हडपसर-मुंढवा विभाग' },
              { id: 'DIV_AUNDH_BANER', nameEn: 'Aundh-Baner-Balewadi Division', nameHi: 'औंध-बानेर प्रभाग', nameMr: 'औंध-बाणेर-बालेवाडी विभाग' },
              { id: 'DIV_VIMAN_NAGAR', nameEn: 'Nagar Road-Vadgaon Sheri Division', nameHi: 'विमान नगर प्रभाग', nameMr: 'नगर रोड-वडगाव शेरी विभाग' },
              { id: 'DIV_SINHAGAD', nameEn: 'Sinhagad Road-Dhayari Division', nameHi: 'सिंहगड रोड प्रभाग', nameMr: 'सिंहगड रस्ता-धायरी विभाग' },
              { id: 'DIV_KASBA', nameEn: 'Kasba-Vishrambaug Wada Division', nameHi: 'कसबा-विश्रामबाग प्रभाग', nameMr: 'कसबा-विश्रामबाग वाडा विभाग' },
            ],
          },
          {
            id: 'MH_PUN_PCMC',
            nameEn: 'Pimpri-Chinchwad (PCMC)',
            nameHi: 'पिंपरी-चिंचवड (पीसीएमसी)',
            nameMr: 'पिंपरी-चिंचवड (मनपा)',
            divisions: [
              { id: 'DIV_BHOSARI', nameEn: 'Bhosari Zone (Zone E)', nameHi: 'भोसरी क्षेत्र', nameMr: 'भोसरी विभाग' },
              { id: 'DIV_NIGDI', nameEn: 'Nigdi-Pradhikaran Zone (Zone A)', nameHi: 'निगड़ी क्षेत्र', nameMr: 'निगडी-प्राधिकरण विभाग' },
              { id: 'DIV_CHINCHWAD', nameEn: 'Chinchwad Station Zone (Zone B)', nameHi: 'चिंचवड क्षेत्र', nameMr: 'चिंचवड स्टेशन विभाग' },
              { id: 'DIV_WAKAD', nameEn: 'Wakad-Pimple Saudagar Zone (Zone D)', nameHi: 'वाकड-पिंपले सौदागर', nameMr: 'वाकड-पिंपळे सौदागर विभाग' },
            ],
          },
        ],
      },
      {
        id: 'MH_THN',
        nameEn: 'Thane',
        nameHi: 'ठाणे',
        nameMr: 'ठाणे',
        cities: [
          {
            id: 'MH_THN_TMC',
            nameEn: 'Thane Municipal Corporation',
            nameHi: 'ठाणे महानगरपालिका',
            nameMr: 'ठाणे महानगरपालिका',
            divisions: [
              { id: 'DIV_NAUPADA', nameEn: 'Naupada-Kopri Ward', nameHi: 'नौपाड़ा-कोपरी वार्ड', nameMr: 'नौपाडा-कोपरी वॉर्ड' },
              { id: 'DIV_MAJIWADA', nameEn: 'Majiwada-Manpada Ward', nameHi: 'माजीवाड़ा-मानपाड़ा वार्ड', nameMr: 'माजीवडा-मानपाडा वॉर्ड' },
              { id: 'DIV_GHODBUNDER', nameEn: 'Ghodbunder-Wagle Estate Ward', nameHi: 'घोड़बंदर-वागले एस्टेट', nameMr: 'घोडबंदर-वागळे इस्टेट वॉर्ड' },
              { id: 'DIV_KALWA', nameEn: 'Kalwa-Mumbra Ward', nameHi: 'कलवा-मुंब्रा वार्ड', nameMr: 'कळवा-मुंब्रा वॉर्ड' },
            ],
          },
          {
            id: 'MH_NMMC',
            nameEn: 'Navi Mumbai (NMMC)',
            nameHi: 'नवी मुंबई महानगरपालिका',
            nameMr: 'नवी मुंबई महानगरपालिका',
            divisions: [
              { id: 'DIV_VASHI', nameEn: 'Vashi Division', nameHi: 'वाशी प्रभाग', nameMr: 'वाशी विभाग' },
              { id: 'DIV_NERUL', nameEn: 'Nerul Division', nameHi: 'नेरुल प्रभाग', nameMr: 'नेरूळ विभाग' },
              { id: 'DIV_BELAPUR', nameEn: 'CBD Belapur Division', nameHi: 'सीबीडी बेलापुर प्रभाग', nameMr: 'सीबीडी बेलापूर विभाग' },
              { id: 'DIV_AIROLI', nameEn: 'Airoli-Kopar Khairane Division', nameHi: 'ऐरोली-कोपर खैराने', nameMr: 'ऐरोली-कोपरखैरणे विभाग' },
            ],
          },
          {
            id: 'MH_KDMC',
            nameEn: 'Kalyan-Dombivli (KDMC)',
            nameHi: 'कल्याण-डोंबिवली',
            nameMr: 'कल्याण-डोंबिवली',
            divisions: [
              { id: 'DIV_KALYAN_W', nameEn: 'Kalyan West Ward', nameHi: 'कल्याण पश्चिम वार्ड', nameMr: 'कल्याण पश्चिम वॉर्ड' },
              { id: 'DIV_DOMBIVLI_E', nameEn: 'Dombivli East Ward', nameHi: 'डोंबिवली पूर्व वार्ड', nameMr: 'डोंबिवली पूर्व वॉर्ड' },
            ],
          },
        ],
      },
      {
        id: 'MH_NSK',
        nameEn: 'Nashik',
        nameHi: 'नासिक',
        nameMr: 'नाशिक',
        cities: [
          {
            id: 'MH_NSK_NMC',
            nameEn: 'Nashik Municipal Corporation',
            nameHi: 'नासिक महानगरपालिका',
            nameMr: 'नाशिक महानगरपालिका',
            divisions: [
              { id: 'DIV_PANCHAVATI', nameEn: 'Panchavati Division', nameHi: 'पंचवटी प्रभाग', nameMr: 'पंचवटी विभाग' },
              { id: 'DIV_CIDCO_NSK', nameEn: 'CIDCO Nashik Division', nameHi: 'सिडको नासिक प्रभाग', nameMr: 'सिडको नाशिक विभाग' },
              { id: 'DIV_NASHIK_ROAD', nameEn: 'Nashik Road Division', nameHi: 'नासिक रोड प्रभाग', nameMr: 'नाशिक रोड विभाग' },
              { id: 'DIV_SATPUR', nameEn: 'Satpur Industrial Division', nameHi: 'सातपुर प्रभाग', nameMr: 'सातपूर विभाग' },
            ],
          },
        ],
      },
      {
        id: 'MH_CSN',
        nameEn: 'Chhatrapati Sambhajinagar',
        nameHi: 'छत्रपति संभाजीनगर',
        nameMr: 'छत्रपती संभाजीनगर',
        cities: [
          {
            id: 'MH_CSN_CSMC',
            nameEn: 'Chhatrapati Sambhajinagar (MC)',
            nameHi: 'छत्रपति संभाजीनगर मनपा',
            nameMr: 'छत्रपती संभाजीनगर मनपा',
            divisions: [
              { id: 'DIV_CIDCO_CSN', nameEn: 'CIDCO Zone', nameHi: 'सिडको क्षेत्र', nameMr: 'सिडको विभाग' },
              { id: 'DIV_GARKHEDA', nameEn: 'Garkheda Zone', nameHi: 'गारखेड़ा क्षेत्र', nameMr: 'गारखेडा विभाग' },
              { id: 'DIV_WALUJ', nameEn: 'Waluj Industrial Zone', nameHi: 'वालुज औद्योगिक क्षेत्र', nameMr: 'वाळूज औद्योगिक विभाग' },
              { id: 'DIV_CANTONMENT', nameEn: 'Cantonment-Central Zone', nameHi: 'छावनी-मध्य क्षेत्र', nameMr: 'कंटेन्मेंट-मध्य विभाग' },
            ],
          },
        ],
      },
    ],
  },

  // ── 2. DELHI (NCT) ──
  {
    id: 'DL',
    nameEn: 'Delhi (NCT)',
    nameHi: 'दिल्ली (एनसीटी)',
    nameMr: 'दिल्ली (राष्ट्रीय राजधानी क्षेत्र)',
    districts: [
      {
        id: 'DL_NEW_DELHI',
        nameEn: 'New Delhi',
        nameHi: 'नई दिल्ली',
        nameMr: 'नवी दिल्ली',
        cities: [
          {
            id: 'DL_NDMC',
            nameEn: 'New Delhi Municipal Council (NDMC)',
            nameHi: 'नई दिल्ली नगर पालिका परिषद (एनडीएमसी)',
            nameMr: 'नवी दिल्ली नगरपालिका परिषद',
            divisions: [
              { id: 'DIV_CP', nameEn: 'Connaught Place Commercial Division', nameHi: 'कनॉट प्लेस वाणिज्यिक प्रभाग', nameMr: 'कॅनॉट प्लेस व्यावसायिक विभाग' },
              { id: 'DIV_CHANAKYA', nameEn: 'Chanakyapuri Diplomatic Division', nameHi: 'चाणक्यपुरी राजनयिक प्रभाग', nameMr: 'चाणक्यपुरी मुत्सद्दी विभाग' },
              { id: 'DIV_GOLE_MKT', nameEn: 'Gole Market Residential Division', nameHi: 'गोल मार्केट आवासीय प्रभाग', nameMr: 'गोल मार्केट निवासी विभाग' },
              { id: 'DIV_INDIA_GATE', nameEn: 'Central Vista / India Gate Division', nameHi: 'इंडिया गेट क्षेत्र', nameMr: 'इंडिया गेट विभाग' },
            ],
          },
        ],
      },
      {
        id: 'DL_SOUTH',
        nameEn: 'South Delhi',
        nameHi: 'दक्षिण दिल्ली',
        nameMr: 'दक्षिण दिल्ली',
        cities: [
          {
            id: 'DL_MCD_SOUTH',
            nameEn: 'Municipal Corporation of Delhi (South)',
            nameHi: 'दिल्ली नगर निगम (दक्षिण)',
            nameMr: 'दिल्ली महानगरपालिका (दक्षिण)',
            divisions: [
              { id: 'DIV_HAUZ_KHAS', nameEn: 'Hauz Khas Division', nameHi: 'हौज़ खास प्रभाग', nameMr: 'हौझ खास विभाग' },
              { id: 'DIV_SAKET', nameEn: 'Saket-Mehrauli Division', nameHi: 'साकेत-महरौली प्रभाग', nameMr: 'साकेत-महरौली विभाग' },
              { id: 'DIV_VASANT_KUNJ', nameEn: 'Vasant Kunj Division', nameHi: 'वसंत कुंज प्रभाग', nameMr: 'वसंत कुंज विभाग' },
              { id: 'DIV_GK', nameEn: 'Greater Kailash Division', nameHi: 'ग्रेटर कैलाश प्रभाग', nameMr: 'ग्रेटर कैलाश विभाग' },
            ],
          },
        ],
      },
      {
        id: 'DL_CENTRAL',
        nameEn: 'Central Delhi',
        nameHi: 'मध्य दिल्ली',
        nameMr: 'मध्य दिल्ली',
        cities: [
          {
            id: 'DL_MCD_CENTRAL',
            nameEn: 'Municipal Corporation of Delhi (Central)',
            nameHi: 'दिल्ली नगर निगम (मध्य)',
            nameMr: 'दिल्ली महानगरपालिका (मध्य)',
            divisions: [
              { id: 'DIV_KAROL_BAGH', nameEn: 'Karol Bagh Division', nameHi: 'करोल बाग प्रभाग', nameMr: 'करोल बाग विभाग' },
              { id: 'DIV_PAHARGANJ', nameEn: 'Paharganj Division', nameHi: 'पहाड़गंज प्रभाग', nameMr: 'पहारगंज विभाग' },
              { id: 'DIV_DARYAGANJ', nameEn: 'Daryaganj-Old Delhi Division', nameHi: 'दरियागंज प्रभाग', nameMr: 'दर्यागंज विभाग' },
            ],
          },
        ],
      },
      {
        id: 'DL_NORTH',
        nameEn: 'North Delhi',
        nameHi: 'उत्तर दिल्ली',
        nameMr: 'उत्तर दिल्ली',
        cities: [
          {
            id: 'DL_MCD_NORTH',
            nameEn: 'Municipal Corporation of Delhi (North)',
            nameHi: 'दिल्ली नगर निगम (उत्तर)',
            nameMr: 'दिल्ली महानगरपालिका (उत्तर)',
            divisions: [
              { id: 'DIV_ROHINI', nameEn: 'Rohini Zone', nameHi: 'रोहिणी क्षेत्र', nameMr: 'रोहिणी विभाग' },
              { id: 'DIV_CIVIL_LINES', nameEn: 'Civil Lines Division', nameHi: 'सिविल लाइन्स प्रभाग', nameMr: 'सिव्हिल लाईन्स विभाग' },
              { id: 'DIV_PITAMPURA', nameEn: 'Pitampura Division', nameHi: 'पीतमपुरा प्रभाग', nameMr: 'पितामपुरा विभाग' },
            ],
          },
        ],
      },
    ],
  },

  // ── 3. KARNATAKA ──
  {
    id: 'KA',
    nameEn: 'Karnataka',
    nameHi: 'कर्नाटक',
    nameMr: 'कर्नाटक',
    districts: [
      {
        id: 'KA_BLR_U',
        nameEn: 'Bengaluru Urban',
        nameHi: 'बेंगलुरु शहरी',
        nameMr: 'बंगळुरू शहर',
        cities: [
          {
            id: 'KA_BBMP',
            nameEn: 'Bengaluru (BBMP)',
            nameHi: 'बेंगलुरु (बीबीएमपी)',
            nameMr: 'बंगळुरू महानगरपालिका (बीबीएमपी)',
            divisions: [
              { id: 'DIV_BLR_EAST', nameEn: 'East Zone (Indiranagar / Halasuru)', nameHi: 'पूर्वी क्षेत्र (इंदिरानगर)', nameMr: 'पूर्व विभाग (इंदिरानगर)' },
              { id: 'DIV_BLR_SOUTH', nameEn: 'South Zone (Jayanagar / Koramangala)', nameHi: 'दक्षिणी क्षेत्र (जयनगर)', nameMr: 'दक्षिण विभाग (जयनगर/कोरामंगला)' },
              { id: 'DIV_BLR_WEST', nameEn: 'West Zone (Malleshwaram / Rajajinagar)', nameHi: 'पश्चिमी क्षेत्र (मल्लेश्वरम)', nameMr: 'पश्चिम विभाग (मल्लेश्वरम)' },
              { id: 'DIV_BLR_WHITEFIELD', nameEn: 'Mahadevapura Zone (Whitefield / ITPL)', nameHi: 'महादेवपुरा क्षेत्र (व्हाइटफील्ड)', nameMr: 'महादेवपुरा विभाग (आयटीपीएल/व्हाईटफिल्ड)' },
              { id: 'DIV_BLR_BOMMANAHALLI', nameEn: 'Bommanahalli Zone (HSR Layout / Electronic City)', nameHi: 'बोम्मनहल्ली क्षेत्र (एचएसआर)', nameMr: 'बोम्मनहळ्ळी विभाग (एचएसआर लेआउट)' },
              { id: 'DIV_BLR_YELAHANKA', nameEn: 'Yelahanka Zone (North Bengaluru)', nameHi: 'यलहंका क्षेत्र', nameMr: 'यलहंका विभाग' },
            ],
          },
        ],
      },
      {
        id: 'KA_MYS',
        nameEn: 'Mysuru',
        nameHi: 'मैसूर',
        nameMr: 'म्हैसूर',
        cities: [
          {
            id: 'KA_MCC',
            nameEn: 'Mysuru City Corporation',
            nameHi: 'मैसूर नगर निगम',
            nameMr: 'म्हैसूर महानगरपालिका',
            divisions: [
              { id: 'DIV_MYS_CHAMUNDI', nameEn: 'Chamundeshwari Division', nameHi: 'चामुंडेश्वरी प्रभाग', nameMr: 'चामुंडेश्वरी विभाग' },
              { id: 'DIV_MYS_KRISHNA', nameEn: 'Krishnaraja Division', nameHi: 'कृष्णराज प्रभाग', nameMr: 'कृष्णराज विभाग' },
              { id: 'DIV_MYS_VIJAY', nameEn: 'Vijayanagar Zone', nameHi: 'विजयनगर क्षेत्र', nameMr: 'विजयनगर विभाग' },
            ],
          },
        ],
      },
    ],
  },

  // ── 4. GUJARAT ──
  {
    id: 'GJ',
    nameEn: 'Gujarat',
    nameHi: 'गुजरात',
    nameMr: 'गुजरात',
    districts: [
      {
        id: 'GJ_AMD',
        nameEn: 'Ahmedabad',
        nameHi: 'अहमदाबाद',
        nameMr: 'अहमदाबाद',
        cities: [
          {
            id: 'GJ_AMD_AMC',
            nameEn: 'Ahmedabad Municipal Corporation',
            nameHi: 'अहमदाबाद महानगरपालिका',
            nameMr: 'अहमदाबाद महानगरपालिका',
            divisions: [
              { id: 'DIV_WEST_ZONE', nameEn: 'West Zone (Navrangpura / Ashram Road)', nameHi: 'पश्चिम क्षेत्र (नवरंगपुरा)', nameMr: 'पश्चिम विभाग (नवरंगपुरा)' },
              { id: 'DIV_NORTH_ZONE', nameEn: 'North Zone (Memnagar / Sabarmati)', nameHi: 'उत्तर क्षेत्र (मेमनगर)', nameMr: 'उत्तर विभाग (मेमनगर)' },
              { id: 'DIV_CENTRAL_ZONE', nameEn: 'Central Zone (Bhadra / Lal Darwaja)', nameHi: 'मध्य क्षेत्र (भद्रा)', nameMr: 'मध्य विभाग (भद्रा)' },
              { id: 'DIV_SOUTH_ZONE', nameEn: 'South Zone (Maninagar / Kankaria)', nameHi: 'दक्षिण क्षेत्र (मणिनगर)', nameMr: 'दक्षिण विभाग (मणिनगर)' },
              { id: 'DIV_NEW_WEST', nameEn: 'New West Zone (Bodakdev / SG Highway)', nameHi: 'नया पश्चिम क्षेत्र (बोडकदेव)', nameMr: 'नवीन पश्चिम विभाग (एसजी हायवे)' },
            ],
          },
        ],
      },
      {
        id: 'GJ_SURAT',
        nameEn: 'Surat',
        nameHi: 'सूरत',
        nameMr: 'सुरत',
        cities: [
          {
            id: 'GJ_SURAT_SMC',
            nameEn: 'Surat Municipal Corporation',
            nameHi: 'सूरत महानगरपालिका',
            nameMr: 'सुरत महानगरपालिका',
            divisions: [
              { id: 'DIV_ATHWA', nameEn: 'Athwa Zone (South-West)', nameHi: 'अठवा क्षेत्र', nameMr: 'अठवा विभाग' },
              { id: 'DIV_RANDER', nameEn: 'Rander Zone (West)', nameHi: 'रांदेर क्षेत्र', nameMr: 'रांदेर विभाग' },
              { id: 'DIV_KATARGAM', nameEn: 'Katargam Zone (North)', nameHi: 'कतारगाम क्षेत्र', nameMr: 'कतारगाम विभाग' },
              { id: 'DIV_VARACHHA', nameEn: 'Varachha Zone (East)', nameHi: 'वराछा क्षेत्र', nameMr: 'वराछा विभाग' },
            ],
          },
        ],
      },
      {
        id: 'GJ_VADODARA',
        nameEn: 'Vadodara',
        nameHi: 'वडोदरा',
        nameMr: 'वडोदरा',
        cities: [
          {
            id: 'GJ_VMC',
            nameEn: 'Vadodara Municipal Corporation',
            nameHi: 'वडोदरा महानगरपालिका',
            nameMr: 'वडोदरा महानगरपालिका',
            divisions: [
              { id: 'DIV_ALKAPURI', nameEn: 'Alkapuri-Sayajigunj Ward', nameHi: 'अलकापुरी प्रभाग', nameMr: 'अलकापुरी विभाग' },
              { id: 'DIV_MANJALPUR', nameEn: 'Manjalpur-Makarpura Ward', nameHi: 'मांजलपुर प्रभाग', nameMr: 'मांजलपूर विभाग' },
            ],
          },
        ],
      },
    ],
  },

  // ── 5. UTTAR PRADESH ──
  {
    id: 'UP',
    nameEn: 'Uttar Pradesh',
    nameHi: 'उत्तर प्रदेश',
    nameMr: 'उत्तर प्रदेश',
    districts: [
      {
        id: 'UP_LKO',
        nameEn: 'Lucknow',
        nameHi: 'लखनऊ',
        nameMr: 'लखनौ',
        cities: [
          {
            id: 'UP_LMC',
            nameEn: 'Lucknow Municipal Corporation',
            nameHi: 'लखनऊ नगर निगम',
            nameMr: 'लखनौ महानगरपालिका',
            divisions: [
              { id: 'DIV_HAZRATGANJ', nameEn: 'Hazratganj Zone 1', nameHi: 'हज़रतगंज ज़ोन 1', nameMr: 'हजरतगंज विभाग 1' },
              { id: 'DIV_GOMTI_NAGAR', nameEn: 'Gomti Nagar Zone 4', nameHi: 'गोमती नगर ज़ोन 4', nameMr: 'गोमती नगर विभाग 4' },
              { id: 'DIV_ALAMBAGH', nameEn: 'Alambagh Zone 5', nameHi: 'आलमबाग ज़ोन 5', nameMr: 'आलमबाग विभाग 5' },
              { id: 'DIV_INDIRA_NAGAR', nameEn: 'Indira Nagar Zone 7', nameHi: 'इंदिरा नगर ज़ोन 7', nameMr: 'इंदिरा नगर विभाग 7' },
              { id: 'DIV_CHOWK', nameEn: 'Chowk Heritage Zone 6', nameHi: 'चौक हेरिटेज ज़ोन 6', nameMr: 'चौक वारसा विभाग 6' },
            ],
          },
        ],
      },
      {
        id: 'UP_NOIDA',
        nameEn: 'Gautam Buddha Nagar (Noida)',
        nameHi: 'गौतम बुद्ध नगर (नोएडा)',
        nameMr: 'गौतम बुद्ध नगर (नोएडा)',
        cities: [
          {
            id: 'UP_NOIDA_AUTH',
            nameEn: 'Noida Authority',
            nameHi: 'नोएडा प्राधिकरण',
            nameMr: 'नोएडा विकास प्राधिकरण',
            divisions: [
              { id: 'DIV_SEC_18', nameEn: 'Sector 18 Commercial Division', nameHi: 'सेक्टर 18 वाणिज्यिक प्रभाग', nameMr: 'सेक्टर 18 व्यावसायिक विभाग' },
              { id: 'DIV_SEC_62', nameEn: 'Sector 62 Institutional Division', nameHi: 'सेक्टर 62 संस्थागत प्रभाग', nameMr: 'सेक्टर 62 संस्थागत विभाग' },
              { id: 'DIV_SEC_137', nameEn: 'Sector 137 Expressway Residential', nameHi: 'सेक्टर 137 एक्सप्रेसवे प्रभाग', nameMr: 'सेक्टर 137 द्रुतगती विभाग' },
            ],
          },
          {
            id: 'UP_GR_NOIDA',
            nameEn: 'Greater Noida Authority',
            nameHi: 'ग्रेटर नोएडा प्राधिकरण',
            nameMr: 'ग्रेटर नोएडा प्राधिकरण',
            divisions: [
              { id: 'DIV_PARI_CHOWK', nameEn: 'Pari Chowk Central Division', nameHi: 'परी चौक प्रभाग', nameMr: 'परी चौक मध्य विभाग' },
              { id: 'DIV_KNOWLEDGE_PARK', nameEn: 'Knowledge Park Zone', nameHi: 'नॉलेज पार्क क्षेत्र', nameMr: 'नॉलेज पार्क विभाग' },
            ],
          },
        ],
      },
      {
        id: 'UP_VARANASI',
        nameEn: 'Varanasi',
        nameHi: 'वाराणसी',
        nameMr: 'वाराणसी',
        cities: [
          {
            id: 'UP_VMC',
            nameEn: 'Varanasi Municipal Corporation',
            nameHi: 'वाराणसी नगर निगम',
            nameMr: 'वाराणसी महानगरपालिका',
            divisions: [
              { id: 'DIV_GHATS', nameEn: 'Dashashwamedh Ghats Zone', nameHi: 'दशाश्वमेध घाट क्षेत्र', nameMr: 'दशाश्वमेध घाट विभाग' },
              { id: 'DIV_SIGRA', nameEn: 'Sigra-Cantt Zone', nameHi: 'सिगरा-कैंट क्षेत्र', nameMr: 'सिग्रा-कंटेन्मेंट विभाग' },
              { id: 'DIV_BHELPUR', nameEn: 'Bhelupur-BHU Zone', nameHi: 'भेलूपुर क्षेत्र', nameMr: 'भेलूपुर विभाग' },
            ],
          },
        ],
      },
    ],
  },

  // ── 6. MADHYA PRADESH ──
  {
    id: 'MP',
    nameEn: 'Madhya Pradesh',
    nameHi: 'मध्य प्रदेश',
    nameMr: 'मध्य प्रदेश',
    districts: [
      {
        id: 'MP_BPL',
        nameEn: 'Bhopal',
        nameHi: 'भोपाल',
        nameMr: 'भोपाळ',
        cities: [
          {
            id: 'MP_BPL_BMC',
            nameEn: 'Bhopal Municipal Corporation',
            nameHi: 'भोपाल नगर निगम',
            nameMr: 'भोपाळ महानगरपालिका',
            divisions: [
              { id: 'DIV_MP_NAGAR', nameEn: 'MP Nagar Commercial Zone', nameHi: 'एमपी नगर वाणिज्यिक प्रभाग', nameMr: 'एमपी नगर व्यावसायिक विभाग' },
              { id: 'DIV_TT_NAGAR', nameEn: 'TT Nagar-New Market Division', nameHi: 'टीटी नगर-न्यू मार्केट', nameMr: 'टीटी नगर-न्यू मार्केट विभाग' },
              { id: 'DIV_BAIRAGARH', nameEn: 'Bairagarh (Sant Hirdaram Nagar)', nameHi: 'बैरागढ़ प्रभाग', nameMr: 'बैरागढ विभाग' },
              { id: 'DIV_KOLAR', nameEn: 'Kolar Road Residential Division', nameHi: 'कोलार रोड प्रभाग', nameMr: 'कोलार रस्ता विभाग' },
            ],
          },
        ],
      },
      {
        id: 'MP_IND',
        nameEn: 'Indore',
        nameHi: 'इंदौर',
        nameMr: 'इंदूर',
        cities: [
          {
            id: 'MP_IND_IMC',
            nameEn: 'Indore Municipal Corporation',
            nameHi: 'इंदौर नगर निगम',
            nameMr: 'इंदूर महानगरपालिका',
            divisions: [
              { id: 'DIV_VIJAY_NAGAR', nameEn: 'Vijay Nagar Zone (Zone 8)', nameHi: 'विजय नगर क्षेत्र', nameMr: 'विजय नगर विभाग' },
              { id: 'DIV_PALASIA', nameEn: 'Palasia-Old City Zone (Zone 3)', nameHi: 'पलासिया क्षेत्र', nameMr: 'पलासिया विभाग' },
              { id: 'DIV_RAJWADA', nameEn: 'Rajwada Heritage Zone (Zone 2)', nameHi: 'राजवाड़ा क्षेत्र', nameMr: 'राजवाडा वारसा विभाग' },
              { id: 'DIV_ANNAPURNA', nameEn: 'Annapurna-Sudama Nagar (Zone 13)', nameHi: 'अन्नपूर्णा क्षेत्र', nameMr: 'अन्नपूर्णा विभाग' },
            ],
          },
        ],
      },
    ],
  },

  // ── 7. TELANGANA ──
  {
    id: 'TG',
    nameEn: 'Telangana',
    nameHi: 'तेलंगाना',
    nameMr: 'तेलंगणा',
    districts: [
      {
        id: 'TG_HYD',
        nameEn: 'Hyderabad',
        nameHi: 'हैदराबाद',
        nameMr: 'हैदराबाद',
        cities: [
          {
            id: 'TG_GHMC',
            nameEn: 'Greater Hyderabad (GHMC)',
            nameHi: 'ग्रेटर हैदराबाद नगर निगम',
            nameMr: 'ग्रेटर हैदराबाद महानगरपालिका',
            divisions: [
              { id: 'DIV_HITEC_CITY', nameEn: 'Serilingampally (HITEC City / Gachibowli)', nameHi: 'हाईटेक सिटी क्षेत्र', nameMr: 'हायटेक सिटी विभाग' },
              { id: 'DIV_BANJARA', nameEn: 'Khairatabad (Banjara Hills / Jubilee Hills)', nameHi: 'बंजारा हिल्स क्षेत्र', nameMr: 'बंजारा हिल्स विभाग' },
              { id: 'DIV_CHARMINAR', nameEn: 'Charminar Heritage Zone', nameHi: 'चारमीनार क्षेत्र', nameMr: 'चारमिनार वारसा विभाग' },
              { id: 'DIV_SECUNDERABAD', nameEn: 'Secunderabad Zone', nameHi: 'सिकंदराबाद क्षेत्र', nameMr: 'सिकंदराबाद विभाग' },
              { id: 'DIV_KUKATPALLY', nameEn: 'Kukatpally Industrial Zone', nameHi: 'कुकटपल्ली क्षेत्र', nameMr: 'कुकटपल्ली विभाग' },
            ],
          },
        ],
      },
    ],
  },

  // ── 8. TAMIL NADU ──
  {
    id: 'TN',
    nameEn: 'Tamil Nadu',
    nameHi: 'तमिलनाडु',
    nameMr: 'तमिळनाडू',
    districts: [
      {
        id: 'TN_CHN',
        nameEn: 'Chennai',
        nameHi: 'चेन्नई',
        nameMr: 'चेन्नई',
        cities: [
          {
            id: 'TN_GCC',
            nameEn: 'Greater Chennai Corporation',
            nameHi: 'ग्रेटर चेन्नई कॉर्पोरेशन',
            nameMr: 'ग्रेटर चेन्नई महानगरपालिका',
            divisions: [
              { id: 'DIV_TNAGAR', nameEn: 'T. Nagar Commercial Zone (Zone 10)', nameHi: 'टी. नगर क्षेत्र', nameMr: 'टी. नगर विभाग' },
              { id: 'DIV_ANNA_NAGAR', nameEn: 'Anna Nagar Zone (Zone 8)', nameHi: 'अन्ना नगर क्षेत्र', nameMr: 'अण्णा नगर विभाग' },
              { id: 'DIV_ADYAR', nameEn: 'Adyar-Besant Nagar (Zone 13)', nameHi: 'अड्यार क्षेत्र', nameMr: 'अड्यार विभाग' },
              { id: 'DIV_VELACHERY', nameEn: 'Perungudi-Velachery (Zone 14)', nameHi: 'वेलाचेरी क्षेत्र', nameMr: 'वेलाचेरी विभाग' },
              { id: 'DIV_MYLAPORE', nameEn: 'Mylapore-Royapettah (Zone 9)', nameHi: 'माइलापुर क्षेत्र', nameMr: 'मायलापूर विभाग' },
            ],
          },
        ],
      },
      {
        id: 'TN_CBE',
        nameEn: 'Coimbatore',
        nameHi: 'कोयंबटूर',
        nameMr: 'कोइम्बतूर',
        cities: [
          {
            id: 'TN_CCMC',
            nameEn: 'Coimbatore Municipal Corporation',
            nameHi: 'कोयंबटूर नगर निगम',
            nameMr: 'कोइम्बतूर महानगरपालिका',
            divisions: [
              { id: 'DIV_RS_PURAM', nameEn: 'West Zone (RS Puram)', nameHi: 'पश्चिम क्षेत्र (आरएस पुरम)', nameMr: 'पश्चिम विभाग (आरएस पुरम)' },
              { id: 'DIV_GANDHIPURAM', nameEn: 'Central Zone (Gandhipuram)', nameHi: 'मध्य क्षेत्र (गांधीपुरम)', nameMr: 'मध्य विभाग (गांधीपुरम)' },
              { id: 'DIV_PEELAMEDU', nameEn: 'East Zone (Peelamedu)', nameHi: 'पूर्व क्षेत्र', nameMr: 'पूर्व विभाग' },
            ],
          },
        ],
      },
    ],
  },

  // ── 9. RAJASTHAN ──
  {
    id: 'RJ',
    nameEn: 'Rajasthan',
    nameHi: 'राजस्थान',
    nameMr: 'राजस्थान',
    districts: [
      {
        id: 'RJ_JPR',
        nameEn: 'Jaipur',
        nameHi: 'जयपुर',
        nameMr: 'जयपूर',
        cities: [
          {
            id: 'RJ_JMC',
            nameEn: 'Jaipur Municipal Corporation',
            nameHi: 'जयपुर नगर निगम',
            nameMr: 'जयपूर महानगरपालिका',
            divisions: [
              { id: 'DIV_WALLED_CITY', nameEn: 'Heritage Walled City Zone', nameHi: 'चारदीवारी हेरिटेज क्षेत्र', nameMr: 'चारभिंती वारसा विभाग' },
              { id: 'DIV_MALVIYA', nameEn: 'Malviya Nagar Zone', nameHi: 'मालवीय नगर क्षेत्र', nameMr: 'मालवीय नगर विभाग' },
              { id: 'DIV_MANSAROVAR', nameEn: 'Mansarovar Zone', nameHi: 'मानसरोवर क्षेत्र', nameMr: 'मानसरोवर विभाग' },
              { id: 'DIV_VAISHALI', nameEn: 'Vaishali Nagar Zone', nameHi: 'वैशाली नगर क्षेत्र', nameMr: 'वैशाली नगर विभाग' },
            ],
          },
        ],
      },
    ],
  },

  // ── 10. WEST BENGAL ──
  {
    id: 'WB',
    nameEn: 'West Bengal',
    nameHi: 'पश्चिम बंगाल',
    nameMr: 'पश्चिम बंगाल',
    districts: [
      {
        id: 'WB_KOL',
        nameEn: 'Kolkata',
        nameHi: 'कोलकाता',
        nameMr: 'कोलकाता',
        cities: [
          {
            id: 'WB_KMC',
            nameEn: 'Kolkata Municipal Corporation',
            nameHi: 'कोलकाता नगर निगम',
            nameMr: 'कोलकाता महानगरपालिका',
            divisions: [
              { id: 'DIV_PARK_STREET', nameEn: 'Central Zone (Park Street / Esplanade)', nameHi: 'मध्य क्षेत्र (पार्क स्ट्रीट)', nameMr: 'मध्य विभाग (पार्क स्ट्रीट)' },
              { id: 'DIV_SALT_LAKE', nameEn: 'Bidhannagar / Salt Lake IT Sector', nameHi: 'साल्ट लेक आईटी क्षेत्र', nameMr: 'सॉल्ट लेक आयटी विभाग' },
              { id: 'DIV_SOUTH_KOL', nameEn: 'South Zone (Bhowanipore / Alipore)', nameHi: 'दक्षिण क्षेत्र (अलीपुर)', nameMr: 'दक्षिण विभाग (अलिपूर)' },
              { id: 'DIV_NORTH_KOL', nameEn: 'North Zone (Shyambazar / Dum Dum)', nameHi: 'उत्तर क्षेत्र (श्यामबाजार)', nameMr: 'उत्तर विभाग (श्यामबाजार)' },
            ],
          },
        ],
      },
    ],
  },
];

export interface LocationSelection {
  state: string;
  district: string;
  city: string;
  division: string;
  stateName?: string;
  districtName?: string;
  cityName?: string;
  divisionName?: string;
}
