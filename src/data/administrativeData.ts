export interface TownshipData {
  id: string;
  nameMM: string;
  nameEN: string;
}

export interface DistrictData {
  id: string;
  nameMM: string;
  nameEN: string;
  townships: TownshipData[];
}

export interface RegionData {
  id: string;
  nameMM: string;
  nameEN: string;
  districts: DistrictData[];
}

export const MYANMAR_ADMINISTRATIVE_DATA: RegionData[] = [
  {
    id: 'tanintharyi',
    nameMM: 'တနင်္သာရီတိုင်းဒေသကြီး',
    nameEN: 'Tanintharyi Region',
    districts: [
      {
        id: 'dawei_district',
        nameMM: 'ထားဝယ်ခရိုင်',
        nameEN: 'Dawei District',
        townships: [
          { id: 'dawei_township', nameMM: 'ထားဝယ်မြို့နယ်', nameEN: 'Dawei Township' },
          { id: 'launglon_township', nameMM: 'လောင်းလုံးမြို့နယ်', nameEN: 'Launglon Township' },
          { id: 'thayetchaung_township', nameMM: 'သရက်ချောင်းမြို့နယ်', nameEN: 'Thayetchaung Township' },
          { id: 'yephyu_township', nameMM: 'ရေဖြူမြို့နယ်', nameEN: 'Yebyu Township' }
        ]
      },
      {
        id: 'myeik_district',
        nameMM: 'မြိတ်ခရိုင်',
        nameEN: 'Myeik District',
        townships: [
          { id: 'myeik_township', nameMM: 'မြိတ်မြို့နယ်', nameEN: 'Myeik Township' },
          { id: 'kyunsu_township', nameMM: 'ကျွန်းစုမြို့နယ်', nameEN: 'Kyunsu Township' },
          { id: 'palaw_township', nameMM: 'ပုလောမြို့နယ်', nameEN: 'Palaw Township' },
          { id: 'tanintharyi_township', nameMM: 'တနင်္သာရီမြို့နယ်', nameEN: 'Tanintharyi Township' }
        ]
      },
      {
        id: 'kawthaung_district',
        nameMM: 'ကော့သောင်းခရိုင်',
        nameEN: 'Kawthaung District',
        townships: [
          { id: 'kawthaung_township', nameMM: 'ကော့သောင်းမြို့နယ်', nameEN: 'Kawthaung Township' },
          { id: 'bokpyin_township', nameMM: 'ဘုတ်ပြင်းမြို့နယ်', nameEN: 'Bokpyin Township' }
        ]
      }
    ]
  },
  {
    id: 'yangon',
    nameMM: 'ရန်ကုန်တိုင်းဒေသကြီး',
    nameEN: 'Yangon Region',
    districts: [
      {
        id: 'yangon_north',
        nameMM: 'ရန်ကုန်မြောက်ပိုင်းခရိုင်',
        nameEN: 'Yangon North District',
        townships: [
          { id: 'insein_township', nameMM: 'အင်းစိန်မြို့နယ်', nameEN: 'Insein Township' },
          { id: 'mingaladon_township', nameMM: 'မင်္ဂလာဒုံမြို့နယ်', nameEN: 'Mingaladon Township' },
          { id: 'hlegu_township', nameMM: 'လှည်းကူးမြို့နယ်', nameEN: 'Hlegu Township' },
          { id: 'hmawbi_township', nameMM: 'မှော်ဘီမြို့နယ်', nameEN: 'Hmawbi Township' },
          { id: 'taikkyi_township', nameMM: 'တိုက်ကြီးမြို့နယ်', nameEN: 'Taikkyi Township' },
          { id: 'shwepyitha_township', nameMM: 'ရွှေပြည်သာမြို့နယ်', nameEN: 'Shwepyitha Township' },
          { id: 'hlaingtharya_township', nameMM: 'လှိုင်သာယာမြို့နယ်', nameEN: 'Hlaingtharya Township' }
        ]
      },
      {
        id: 'yangon_east',
        nameMM: 'ရန်ကုန်အရှေ့ပိုင်းခရိုင်',
        nameEN: 'Yangon East District',
        townships: [
          { id: 'thingangyun_township', nameMM: 'သင်္ဃန်းကျွန်းမြို့နယ်', nameEN: 'Thingangyun Township' },
          { id: 'south_okkalapa_township', nameMM: 'တောင်ဥက္ကလာပမြို့နယ်', nameEN: 'South Okkalapa Township' },
          { id: 'north_okkalapa_township', nameMM: 'မြောက်ဥက္ကလာပမြို့နယ်', nameEN: 'North Okkalapa Township' },
          { id: 'thaketa_township', nameMM: 'သာကေတမြို့နယ်', nameEN: 'Thaketa Township' },
          { id: 'dawbon_township', nameMM: 'ဒေါပုံမြို့နယ်', nameEN: 'Dawbon Township' },
          { id: 'dagon_seikkan_township', nameMM: 'ဒဂုံမြို့သစ်ဆိပ်ကမ်းမြို့နယ်', nameEN: 'Dagon Seikkan Township' },
          { id: 'tamwe_township', nameMM: 'တာမွေမြို့နယ်', nameEN: 'Tamwe Township' }
        ]
      },
      {
        id: 'yangon_west',
        nameMM: 'ရန်ကုန်အနောက်ပိုင်းခရိုင်',
        nameEN: 'Yangon West District',
        townships: [
          { id: 'kamayut_township', nameMM: 'ကမရွတ်မြို့နယ်', nameEN: 'Kamayut Township' },
          { id: 'kyauktada_township', nameMM: 'ကျောက်တံတားမြို့နယ်', nameEN: 'Kyauktada Township' },
          { id: 'bahan_township', nameMM: 'ဗဟန်းမြို့နယ်', nameEN: 'Bahan Township' },
          { id: 'dagon_township', nameMM: 'ဒဂုံမြို့နယ်', nameEN: 'Dagon Township' },
          { id: 'sanchaung_township', nameMM: 'စမ်းချောင်းမြို့နယ်', nameEN: 'Sanchaung Township' },
          { id: 'ahlone_township', nameMM: 'အလုံမြို့နယ်', nameEN: 'Ahlone Township' },
          { id: 'hlaing_township', nameMM: 'လှိုင်မြို့နယ်', nameEN: 'Hlaing Township' },
          { id: 'mayangone_township', nameMM: 'မယန်းကုန်းမြို့နယ်', nameEN: 'Mayangone Township' }
        ]
      },
      {
        id: 'yangon_south',
        nameMM: 'ရန်ကုန်တောင်ပိုင်းခရိုင်',
        nameEN: 'Yangon South District',
        townships: [
          { id: 'thanlyin_township', nameMM: 'သန်လျင်မြို့နယ်', nameEN: 'Thanlyin Township' },
          { id: 'kyauktan_township', nameMM: 'ကျောက်တန်းမြို့နယ်', nameEN: 'Kyauktan Township' },
          { id: 'twante_township', nameMM: 'တွံတေးမြို့နယ်', nameEN: 'Twante Township' },
          { id: 'kawhmu_township', nameMM: 'ကော့မှူးမြို့နယ်', nameEN: 'Kawhmu Township' },
          { id: 'kyayan_township', nameMM: 'ခရမ်းမြို့နယ်', nameEN: 'Kayan Township' }
        ]
      }
    ]
  },
  {
    id: 'mandalay',
    nameMM: 'မန္တလေးတိုင်းဒေသကြီး',
    nameEN: 'Mandalay Region',
    districts: [
      {
        id: 'mandalay_district',
        nameMM: 'မန္တလေးခရိုင် / မဟာအောင်မြေခရိုင်',
        nameEN: 'Mandalay District',
        townships: [
          { id: 'aungmyethazan_township', nameMM: 'အောင်မြေသာစံမြို့နယ်', nameEN: 'Aungmyethazan Township' },
          { id: 'chanayethazan_township', nameMM: 'ချမ်းအေးသာစံမြို့နယ်', nameEN: 'Chanayethazan Township' },
          { id: 'mahaaungmye_township', nameMM: 'မဟာအောင်မြေမြို့နယ်', nameEN: 'Mahaaungmye Township' },
          { id: 'chanmyathazi_township', nameMM: 'ချမ်းမြသာစည်မြို့နယ်', nameEN: 'Chanmyathazi Township' },
          { id: 'pyigyidagun_township', nameMM: 'ပြည်ကြီးတံခွန်မြို့နယ်', nameEN: 'Pyigyidagun Township' },
          { id: 'amarapura_township', nameMM: 'အမရပူရမြို့နယ်', nameEN: 'Amarapura Township' },
          { id: 'patheingyi_township', nameMM: 'ပုသိမ်ကြီးမြို့နယ်', nameEN: 'Patheingyi Township' }
        ]
      },
      {
        id: 'pyinoolwin_district',
        nameMM: 'ပြင်ဦးလွင်ခရိုင်',
        nameEN: 'Pyinoolwin District',
        townships: [
          { id: 'pyinoolwin_township', nameMM: 'ပြင်ဦးလွင်မြို့နယ်', nameEN: 'Pyinoolwin Township' },
          { id: 'mogok_township', nameMM: 'မိုးကုတ်မြို့နယ်', nameEN: 'Mogok Township' },
          { id: 'singu_township', nameMM: 'စင်းကူးမြို့နယ်', nameEN: 'Singu Township' }
        ]
      },
      {
        id: 'meiktila_district',
        nameMM: 'မိတ္ထီလာခရိုင်',
        nameEN: 'Meiktila District',
        townships: [
          { id: 'meiktila_township', nameMM: 'မိတ္ထီလာမြို့နယ်', nameEN: 'Meiktila Township' },
          { id: 'wundwin_township', nameMM: 'ဝမ်းတွင်းမြို့နယ်', nameEN: 'Wundwin Township' },
          { id: 'mahlaing_township', nameMM: 'မလှိုင်မြို့နယ်', nameEN: 'Mahlaing Township' },
          { id: 'thazi_township', nameMM: 'သာစည်မြို့နယ်', nameEN: 'Thazi Township' }
        ]
      },
      {
        id: 'myingyan_district',
        nameMM: 'မြင်းခြံခရိုင်',
        nameEN: 'Myingyan District',
        townships: [
          { id: 'myingyan_township', nameMM: 'မြင်းခြံမြို့နယ်', nameEN: 'Myingyan Township' },
          { id: 'taungtha_township', nameMM: 'တောင်သာမြို့နယ်', nameEN: 'Taungtha Township' },
          { id: 'natogyi_township', nameMM: 'နတ်ထိုးကြီးမြို့နယ်', nameEN: 'Natogyi Township' }
        ]
      },
      {
        id: 'kyaukse_district',
        nameMM: 'ကျောက်ဆည်ခရိုင်',
        nameEN: 'Kyaukse District',
        townships: [
          { id: 'kyaukse_township', nameMM: 'ကျောက်ဆည်မြို့နယ်', nameEN: 'Kyaukse Township' },
          { id: 'sintgaing_township', nameMM: 'စင်ကူးမြို့နယ်', nameEN: 'Sintgaing Township' },
          { id: 'myittha_township', nameMM: 'မြစ်သားမြို့နယ်', nameEN: 'Myittha Township' }
        ]
      }
    ]
  },
  {
    id: 'ayeyarwady',
    nameMM: 'ဧရာဝတီတိုင်းဒေသကြီး',
    nameEN: 'Ayeyarwady Region',
    districts: [
      {
        id: 'pathein_district',
        nameMM: 'ပုသိမ်ခရိုင်',
        nameEN: 'Pathein District',
        townships: [
          { id: 'pathein_township', nameMM: 'ပုသိမ်မြို့နယ်', nameEN: 'Pathein Township' },
          { id: 'kangal_township', nameMM: 'ကန်ကြီးထောင့်မြို့နယ်', nameEN: 'Kangyidaunt Township' },
          { id: 'thabaung_township', nameMM: 'သာပေါင်းမြို့နယ်', nameEN: 'Thabaung Township' },
          { id: 'ngapudaw_township', nameMM: 'ငပုတောမြို့နယ်', nameEN: 'Ngapudaw Township' }
        ]
      },
      {
        id: 'hinthada_district',
        nameMM: 'ဟင်္သာတခရိုင်',
        nameEN: 'Hinthada District',
        townships: [
          { id: 'hinthada_township', nameMM: 'ဟင်္သာတမြို့နယ်', nameEN: 'Hinthada Township' },
          { id: 'zalun_township', nameMM: 'ဇလွန်မြို့နယ်', nameEN: 'Zalun Township' },
          { id: 'lana_township', nameMM: 'လေးမျက်နှာမြို့နယ်', nameEN: 'Lemyethna Township' }
        ]
      },
      {
        id: 'myaungmya_district',
        nameMM: 'မြောင်းမြခရိုင်',
        nameEN: 'Myaungmya District',
        townships: [
          { id: 'myaungmya_township', nameMM: 'မြောင်းမြမြို့နယ်', nameEN: 'Myaungmya Township' },
          { id: 'einme_township', nameMM: 'အိမ်မဲမြို့နယ်', nameEN: 'Einme Township' },
          { id: 'wakema_township', nameMM: 'ဝါးခယ်မမြို့နယ်', nameEN: 'Wakema Township' }
        ]
      },
      {
        id: 'pyapon_district',
        nameMM: 'ဖျာပုံခရိုင်',
        nameEN: 'Pyapon District',
        townships: [
          { id: 'pyapon_township', nameMM: 'ဖျာပုံမြို့နယ်', nameEN: 'Pyapon Township' },
          { id: 'bogale_township', nameMM: 'ဘိုကလေးမြို့နယ်', nameEN: 'Bogale Township' },
          { id: 'dedaye_township', nameMM: 'ဒေးဒရဲမြို့နယ်', nameEN: 'Dedaye Township' }
        ]
      }
    ]
  },
  {
    id: 'bago',
    nameMM: 'ပဲခူးတိုင်းဒေသကြီး',
    nameEN: 'Bago Region',
    districts: [
      {
        id: 'bago_district',
        nameMM: 'ပဲခူးခရိုင်',
        nameEN: 'Bago District',
        townships: [
          { id: 'bago_township', nameMM: 'ပဲခူးမြို့နယ်', nameEN: 'Bago Township' },
          { id: 'thanatpin_township', nameMM: 'သနပ်ပင်မြို့နယ်', nameEN: 'Thanatpin Township' },
          { id: 'kawa_township', nameMM: 'ကဝမြို့နယ်', nameEN: 'Kawa Township' },
          { id: 'waw_township', nameMM: 'ဝေါမြို့နယ်', nameEN: 'Waw Township' }
        ]
      },
      {
        id: 'taungoo_district',
        nameMM: 'တောင်ငူခရိုင်',
        nameEN: 'Taungoo District',
        townships: [
          { id: 'taungoo_township', nameMM: 'တောင်ငူမြို့နယ်', nameEN: 'Taungoo Township' },
          { id: 'yedashe_township', nameMM: 'ရေတာရှည်မြို့နယ်', nameEN: 'Yedashe Township' },
          { id: 'pyu_township', nameMM: 'ဖြူးမြို့နယ်', nameEN: 'Pyu Township' },
          { id: 'kyaukkyi_township', nameMM: 'ကျောက်ကြီးမြို့နယ်', nameEN: 'Kyaukkyi Township' }
        ]
      },
      {
        id: 'pyay_district',
        nameMM: 'ပြည်ခရိုင်',
        nameEN: 'Pyay District',
        townships: [
          { id: 'pyay_township', nameMM: 'ပြည်မြို့နယ်', nameEN: 'Pyay Township' },
          { id: 'paukkhaung_township', nameMM: 'ပေါက်ခေါင်းမြို့နယ်', nameEN: 'Paukkhaung Township' },
          { id: 'padaung_township', nameMM: 'ပန်းတောင်းမြို့နယ်', nameEN: 'Padaung Township' }
        ]
      }
    ]
  },
  {
    id: 'magway',
    nameMM: 'မကွေးတိုင်းဒေသကြီး',
    nameEN: 'Magway Region',
    districts: [
      {
        id: 'magway_district',
        nameMM: 'မကွေးခရိုင်',
        nameEN: 'Magway District',
        townships: [
          { id: 'magway_township', nameMM: 'မကွေးမြို့နယ်', nameEN: 'Magway Township' },
          { id: 'yenangyaung_township', nameMM: 'ရေနံချောင်းမြို့နယ်', nameEN: 'Yenangyaung Township' },
          { id: 'chauck_township', nameMM: 'ချောက်မြို့နယ်', nameEN: 'Chauk Township' },
          { id: 'taungdwingyi_township', nameMM: 'တောင်တွင်းကြီးမြို့နယ်', nameEN: 'Taungdwingyi Township' }
        ]
      },
      {
        id: 'pakokku_district',
        nameMM: 'ပခုက္ကူခရိုင်',
        nameEN: 'Pakokku District',
        townships: [
          { id: 'pakokku_township', nameMM: 'ပခုက္ကူမြို့နယ်', nameEN: 'Pakokku Township' },
          { id: 'yesagyo_township', nameMM: 'ရေစကြိုမြို့နယ်', nameEN: 'Yesagyo Township' },
          { id: 'myaing_township', nameMM: 'မြိုင်မြို့နယ်', nameEN: 'Myaing Township' }
        ]
      },
      {
        id: 'minbu_district',
        nameMM: 'မင်းဘူးခရိုင်',
        nameEN: 'Minbu District',
        townships: [
          { id: 'minbu_township', nameMM: 'မင်းဘူးမြို့နယ်', nameEN: 'Minbu Township' },
          { id: 'sagu_township', nameMM: 'စကုမြို့နယ်', nameEN: 'Sagu Township' },
          { id: 'pwinbyu_township', nameMM: 'ပွင့်ဖြူမြို့နယ်', nameEN: 'Pwinbyu Township' }
        ]
      }
    ]
  },
  {
    id: 'sagaing',
    nameMM: 'စစ်ကိုင်းတိုင်းဒေသကြီး',
    nameEN: 'Sagaing Region',
    districts: [
      {
        id: 'sagaing_district',
        nameMM: 'စစ်ကိုင်းခရိုင်',
        nameEN: 'Sagaing District',
        townships: [
          { id: 'sagaing_township', nameMM: 'စစ်ကိုင်းမြို့နယ်', nameEN: 'Sagaing Township' },
          { id: 'myinmu_township', nameMM: 'မြင်းမူမြို့နယ်', nameEN: 'Myinmu Township' },
          { id: 'myaung_township', nameMM: 'မြောင်မြို့နယ်', nameEN: 'Myaung Township' }
        ]
      },
      {
        id: 'monywa_district',
        nameMM: 'မုံရွာခရိုင်',
        nameEN: 'Monywa District',
        townships: [
          { id: 'monywa_township', nameMM: 'မုံရွာမြို့နယ်', nameEN: 'Monywa Township' },
          { id: 'budalin_township', nameMM: 'ဘုတလင်မြို့နယ်', nameEN: 'Budalin Township' },
          { id: 'ayadaw_township', nameMM: 'အရာတော်မြို့နယ်', nameEN: 'Ayadaw Township' },
          { id: 'yinmabin_township', nameMM: 'ယင်းမာပင်မြို့နယ်', nameEN: 'Yinmabin Township' }
        ]
      },
      {
        id: 'shwebo_district',
        nameMM: 'ရွှေဘိုခရိုင်',
        nameEN: 'Shwebo District',
        townships: [
          { id: 'shwebo_township', nameMM: 'ရွှေဘိုမြို့နယ်', nameEN: 'Shwebo Township' },
          { id: 'wetlet_township', nameMM: 'ဝက်လက်မြို့နယ်', nameEN: 'Wetlet Township' },
          { id: 'khin-u_township', nameMM: 'ခင်ဦးမြို့နယ်', nameEN: 'Khin-U Township' }
        ]
      },
      {
        id: 'kalay_district',
        nameMM: 'ကလေးခရိုင်',
        nameEN: 'Kalay District',
        townships: [
          { id: 'kalay_township', nameMM: 'ကလေးမြို့နယ်', nameEN: 'Kalay Township' },
          { id: 'kalewa_township', nameMM: 'ကလေးဝမြို့နယ်', nameEN: 'Kalewa Township' },
          { id: 'mingin_township', nameMM: 'မင်းကင်းမြို့နယ်', nameEN: 'Mingin Township' }
        ]
      }
    ]
  },
  {
    id: 'kachin',
    nameMM: 'ကချင်ပြည်နယ်',
    nameEN: 'Kachin State',
    districts: [
      {
        id: 'myitkyina_district',
        nameMM: 'မြစ်ကြီးနားခရိုင်',
        nameEN: 'Myitkyina District',
        townships: [
          { id: 'myitkyina_township', nameMM: 'မြစ်ကြီးနားမြို့နယ်', nameEN: 'Myitkyina Township' },
          { id: 'waingmaw_township', nameMM: 'ဝိုင်းမော်မြို့နယ်', nameEN: 'Waingmaw Township' },
          { id: 'injangyang_township', nameMM: 'အင်ဂျန်းယန်မြို့နယ်', nameEN: 'Injangyang Township' }
        ]
      },
      {
        id: 'bhamo_district',
        nameMM: 'ဗန်းမော်ခရိုင်',
        nameEN: 'Bhamo District',
        townships: [
          { id: 'bhamo_township', nameMM: 'ဗန်းမော်မြို့နယ်', nameEN: 'Bhamo Township' },
          { id: 'shwegu_township', nameMM: 'ရွှေကူမြို့နယ်', nameEN: 'Shwegu Township' },
          { id: 'mommauk_township', nameMM: 'မိုးမောက်မြို့နယ်', nameEN: 'Mansi Township' }
        ]
      },
      {
        id: 'mohnyin_district',
        nameMM: 'မိုးညှင်းခရိုင်',
        nameEN: 'Mohnyin District',
        townships: [
          { id: 'mohnyin_township', nameMM: 'မိုးညှင်းမြို့နယ်', nameEN: 'Mohnyin Township' },
          { id: 'mogaung_township', nameMM: 'မိုးကောင်းမြို့နယ်', nameEN: 'Mogaung Township' },
          { id: 'hpakant_township', nameMM: 'ဖားကန့်မြို့နယ်', nameEN: 'Hpakant Township' }
        ]
      }
    ]
  },
  {
    id: 'kayah',
    nameMM: 'ကယားပြည်နယ်',
    nameEN: 'Kayah State',
    districts: [
      {
        id: 'loikaw_district',
        nameMM: 'လွိုင်ကော်ခရိုင်',
        nameEN: 'Loikaw District',
        townships: [
          { id: 'loikaw_township', nameMM: 'လွိုင်ကော်မြို့နယ်', nameEN: 'Loikaw Township' },
          { id: 'demoso_township', nameMM: 'ဒီးမော့ဆိုမြို့နယ်', nameEN: 'Demoso Township' },
          { id: 'pruso_township', nameMM: 'ဖရူးဆိုမြို့နယ်', nameEN: 'Pruso Township' },
          { id: 'shadaw_township', nameMM: 'ရှားတောမြို့နယ်', nameEN: 'Shadaw Township' }
        ]
      },
      {
        id: 'bawlakhe_district',
        nameMM: 'ဘောလခဲခရိုင်',
        nameEN: 'Bawlakhe District',
        townships: [
          { id: 'bawlakhe_township', nameMM: 'ဘောလခဲမြို့နယ်', nameEN: 'Bawlakhe Township' },
          { id: 'pasawng_township', nameMM: 'ဖာဆောင်းမြို့နယ်', nameEN: 'Pasawng Township' },
          { id: 'mesae_township', nameMM: 'မယ်စဲ့မြို့နယ်', nameEN: 'Mese Township' }
        ]
      }
    ]
  },
  {
    id: 'kayin',
    nameMM: 'ကရင်ပြည်နယ်',
    nameEN: 'Kayin State',
    districts: [
      {
        id: 'hpaan_district',
        nameMM: 'ဘားအံခရိုင်',
        nameEN: 'Hpa-An District',
        townships: [
          { id: 'hpaan_township', nameMM: 'ဘားအံမြို့နယ်', nameEN: 'Hpa-An Township' },
          { id: 'hlaingbwe_township', nameMM: 'လှိုင်းဘွဲ့မြို့နယ်', nameEN: 'Hlaingbwe Township' },
          { id: 'thandaunggyi_township', nameMM: 'သံတောင်ကြီးမြို့နယ်', nameEN: 'Thandaunggyi Township' }
        ]
      },
      {
        id: 'myawaddy_district',
        nameMM: 'မြဝတီခရိုင်',
        nameEN: 'Myawaddy District',
        townships: [
          { id: 'myawaddy_township', nameMM: 'မြဝတီမြို့နယ်', nameEN: 'Myawaddy Township' }
        ]
      },
      {
        id: 'kawkareik_district',
        nameMM: 'ကော့ကရိတ်ခရိုင်',
        nameEN: 'Kawkareik District',
        townships: [
          { id: 'kawkareik_township', nameMM: 'ကော့ကရိတ်မြို့နယ်', nameEN: 'Kawkareik Township' },
          { id: 'kyainseikgyi_township', nameMM: 'ကြာအင်းဆိပ်ကြီးမြို့နယ်', nameEN: 'Kyain Seikgyi Township' }
        ]
      }
    ]
  },
  {
    id: 'chin',
    nameMM: 'ချင်းပြည်နယ်',
    nameEN: 'Chin State',
    districts: [
      {
        id: 'hakha_district',
        nameMM: 'ဟားခါးခရိုင်',
        nameEN: 'Hakha District',
        townships: [
          { id: 'hakha_township', nameMM: 'ဟားခါးမြို့နယ်', nameEN: 'Hakha Township' },
          { id: 'thantlang_township', nameMM: 'ထန်တလန်မြို့နယ်', nameEN: 'Thantlang Township' }
        ]
      },
      {
        id: 'falam_district',
        nameMM: 'ဖလမ်းခရိုင်',
        nameEN: 'Falam District',
        townships: [
          { id: 'falam_township', nameMM: 'ဖလမ်းမြို့နယ်', nameEN: 'Falam Township' },
          { id: 'tedim_township', nameMM: 'တီးတိန်မြို့နယ်', nameEN: 'Tedim Township' },
          { id: 'tonzang_township', nameMM: 'တွန်းဇံမြို့နယ်', nameEN: 'Tonzang Township' }
        ]
      },
      {
        id: 'mindat_district',
        nameMM: 'မင်းတပ်ခရိုင်',
        nameEN: 'Mindat District',
        townships: [
          { id: 'mindat_township', nameMM: 'မင်းတပ်မြို့နယ်', nameEN: 'Mindat Township' },
          { id: 'kanpetlet_township', nameMM: 'ကန်ပက်လက်မြို့နယ်', nameEN: 'Kanpetlet Township' }
        ]
      }
    ]
  },
  {
    id: 'mon',
    nameMM: 'မွန်ပြည်နယ်',
    nameEN: 'Mon State',
    districts: [
      {
        id: 'mawlamyine_district',
        nameMM: 'မော်လမြိုင်ခရိုင်',
        nameEN: 'Mawlamyine District',
        townships: [
          { id: 'mawlamyine_township', nameMM: 'မော်လမြိုင်မြို့နယ်', nameEN: 'Mawlamyine Township' },
          { id: 'mudon_township', nameMM: 'မုဒုံမြို့နယ်', nameEN: 'Mudon Township' },
          { id: 'thanbyuzayat_township', nameMM: 'သံဖြူဇရပ်မြို့နယ်', nameEN: 'Thanbyuzayat Township' },
          { id: 'ye_township', nameMM: 'ရေးမြို့နယ်', nameEN: 'Ye Township' },
          { id: 'chaungzon_township', nameMM: 'ချောင်းဆုံမြို့နယ်', nameEN: 'Chaungzon Township' },
          { id: 'kyaikmaraw_township', nameMM: 'ကျိုက်မရောမြို့နယ်', nameEN: 'Kyaikmaraw Township' }
        ]
      },
      {
        id: 'thaton_district',
        nameMM: 'သထုံခရိုင်',
        nameEN: 'Thaton District',
        townships: [
          { id: 'thaton_township', nameMM: 'သထုံမြို့နယ်', nameEN: 'Thaton Township' },
          { id: 'kyaikto_township', nameMM: 'ကျိုက်ထိုမြို့နယ်', nameEN: 'Kyaikto Township' },
          { id: 'bilin_township', nameMM: 'ဘီးလင်းမြို့နယ်', nameEN: 'Bilin Township' },
          { id: 'paung_township', nameMM: 'ပေါင်မြို့နယ်', nameEN: 'Paung Township' }
        ]
      }
    ]
  },
  {
    id: 'rakhine',
    nameMM: 'ရခိုင်ပြည်နယ်',
    nameEN: 'Rakhine State',
    districts: [
      {
        id: 'sittwe_district',
        nameMM: 'စစ်တွေခရိုင်',
        nameEN: 'Sittwe District',
        townships: [
          { id: 'sittwe_township', nameMM: 'စစ်တွေမြို့နယ်', nameEN: 'Sittwe Township' },
          { id: 'ponnagyun_township', nameMM: 'ပုဏ္ဏားကျွန်းမြို့နယ်', nameEN: 'Ponnagyun Township' },
          { id: 'rathedaung_township', nameMM: 'ရသေ့တောင်မြို့နယ်', nameEN: 'Rathedaung Township' },
          { id: 'pauktaw_township', nameMM: 'ပေါက်တောမြို့နယ်', nameEN: 'Pauktaw Township' }
        ]
      },
      {
        id: 'kyaukpyu_district',
        nameMM: 'ကျောက်ဖြူခရိုင်',
        nameEN: 'Kyaukpyu District',
        townships: [
          { id: 'kyaukpyu_township', nameMM: 'ကျောက်ဖြူမြို့နယ်', nameEN: 'Kyaukpyu Township' },
          { id: 'ann_township', nameMM: 'အမ်းမြို့နယ်', nameEN: 'Ann Township' },
          { id: 'ramree_township', nameMM: 'ရမ်းဗြဲမြို့နယ်', nameEN: 'Ramree Township' },
          { id: 'manaung_township', nameMM: 'မာန်အောင်မြို့နယ်', nameEN: 'Manaung Township' }
        ]
      },
      {
        id: 'thandwe_district',
        nameMM: 'သံတွဲခရိုင်',
        nameEN: 'Thandwe District',
        townships: [
          { id: 'thandwe_township', nameMM: 'သံတွဲမြို့နယ်', nameEN: 'Thandwe Township' },
          { id: 'toungup_township', nameMM: 'တောင်ကုတ်မြို့နယ်', nameEN: 'Toungup Township' },
          { id: 'gwa_township', nameMM: 'ဂွမြို့နယ်', nameEN: 'Gwa Township' }
        ]
      },
      {
        id: 'maungdaw_district',
        nameMM: 'မောင်တောခရိုင်',
        nameEN: 'Maungdaw District',
        townships: [
          { id: 'maungdaw_township', nameMM: 'မောင်တောမြို့နယ်', nameEN: 'Maungdaw Township' },
          { id: 'buthidaung_township', nameMM: 'ဘူးသီးတောင်မြို့နယ်', nameEN: 'Buthidaung Township' }
        ]
      }
    ]
  },
  {
    id: 'shan',
    nameMM: 'ရှမ်းပြည်နယ်',
    nameEN: 'Shan State',
    districts: [
      {
        id: 'taunggyi_district',
        nameMM: 'တောင်ကြီးခရိုင်',
        nameEN: 'Taunggyi District',
        townships: [
          { id: 'taunggyi_township', nameMM: 'တောင်ကြီးမြို့နယ်', nameEN: 'Taunggyi Township' },
          { id: 'kalaw_township', nameMM: 'ကလောမြို့နယ်', nameEN: 'Kalaw Township' },
          { id: 'nyaungshwe_township', nameMM: 'ညောင်ရွှေမြို့နယ်', nameEN: 'Nyaungshwe Township' },
          { id: 'lawksawk_township', nameMM: 'ရပ်စောက်မြို့နယ်', nameEN: 'Lawksawk Township' },
          { id: 'hopong_township', nameMM: 'ဟိုပုန်းမြို့နယ်', nameEN: 'Hopong Township' }
        ]
      },
      {
        id: 'lashio_district',
        nameMM: 'လားရှိုးခရိုင်',
        nameEN: 'Lashio District',
        townships: [
          { id: 'lashio_township', nameMM: 'လားရှိုးမြို့နယ်', nameEN: 'Lashio Township' },
          { id: 'muse_township', nameMM: 'မူဆယ်မြို့နယ်', nameEN: 'Muse Township' },
          { id: 'hsipaw_township', nameMM: 'သီပေါမြို့နယ်', nameEN: 'Hsipaw Township' },
          { id: 'tangyan_township', nameMM: 'တန့်ယန်းမြို့နယ်', nameEN: 'Tangyan Township' }
        ]
      },
      {
        id: 'tachileik_district',
        nameMM: 'တာချီလိတ်ခရိုင်',
        nameEN: 'Tachileik District',
        townships: [
          { id: 'tachileik_township', nameMM: 'တာချီလိတ်မြို့နယ်', nameEN: 'Tachileik Township' }
        ]
      },
      {
        id: 'kengtung_district',
        nameMM: 'ကျိုင်းတုံခရိုင်',
        nameEN: 'Kengtung District',
        townships: [
          { id: 'kengtung_township', nameMM: 'ကျိုင်းတုံမြို့နယ်', nameEN: 'Kengtung Township' },
          { id: 'monghpayak_township', nameMM: 'မိုင်းဖြတ်မြို့နယ်', nameEN: 'Mong Hpayak Township' }
        ]
      }
    ]
  },
  {
    id: 'naypyidaw',
    nameMM: 'နေပြည်တော် ပြည်ထောင်စုနယ်မြေ',
    nameEN: 'Naypyidaw Council Territory',
    districts: [
      {
        id: 'ottara_district',
        nameMM: 'ဥတ္တရခရိုင်',
        nameEN: 'Ottara District',
        townships: [
          { id: 'ottarathiri_township', nameMM: 'ဥတ္တရသီရိမြို့နယ်', nameEN: 'Ottarathiri Township' },
          { id: 'zeyarthiri_township', nameMM: 'ဇေယျာသီရိမြို့နယ်', nameEN: 'Zeyarthiri Township' },
          { id: 'tatkon_township', nameMM: 'တပ်ကုန်းမြို့နယ်', nameEN: 'Tatkon Township' },
          { id: 'pobbathiri_township', nameMM: 'ပုဗ္ဗသီရိမြို့နယ်', nameEN: 'Pobbathiri Township' }
        ]
      },
      {
        id: 'dekkhina_district',
        nameMM: 'ဒက္ခိဏခရိုင်',
        nameEN: 'Dekkhina District',
        townships: [
          { id: 'dekkhinathiri_township', nameMM: 'ဒက္ခိဏသီရိမြို့နယ်', nameEN: 'Dekkhinathiri Township' },
          { id: 'zambuthiri_township', nameMM: 'ဇမ္ဗူသီရိမြို့နယ်', nameEN: 'Zambuthiri Township' },
          { id: 'pyinmana_township', nameMM: 'ပျဉ်းမနားမြို့နယ်', nameEN: 'Pyinmana Township' },
          { id: 'lewe_township', nameMM: 'လယ်ဝေးမြို့နယ်', nameEN: 'Lewe Township' }
        ]
      }
    ]
  }
];

export function getRegions(): RegionData[] {
  return MYANMAR_ADMINISTRATIVE_DATA;
}

export function getDistricts(regionId: string): DistrictData[] {
  const region = MYANMAR_ADMINISTRATIVE_DATA.find(r => r.id === regionId);
  return region ? region.districts : [];
}

export function getTownships(regionId: string, districtId: string): TownshipData[] {
  const districts = getDistricts(regionId);
  const district = districts.find(d => d.id === districtId);
  return district ? district.townships : [];
}

export function findTownshipLocationInfo(townshipId: string): {
  region: RegionData | null;
  district: DistrictData | null;
  township: TownshipData | null;
  fullLocationMM: string;
} {
  for (const r of MYANMAR_ADMINISTRATIVE_DATA) {
    for (const d of r.districts) {
      for (const t of d.townships) {
        if (t.id === townshipId) {
          return {
            region: r,
            district: d,
            township: t,
            fullLocationMM: `${r.nameMM}၊ ${t.nameMM}`
          };
        }
      }
    }
  }
  return {
    region: null,
    district: null,
    township: null,
    fullLocationMM: ''
  };
}
