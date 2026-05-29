export type ThaiProvince = { id: number; name_in_thai: string }
export type ThaiDistrict = { id: number; province_id: number; name_in_thai: string }
export type ThaiSubdistrict = { id: number; district_id: number; name_in_thai: string; zip_code: number }

export const thaiAddressData = {
  "provinces": [
    {
      "id": 15,
      "code": 24,
      "name_in_thai": "ฉะเชิงเทรา",
      "name_in_english": "Chachoengsao"
    },
    {
      "id": 9,
      "code": 18,
      "name_in_thai": "ชัยนาท",
      "name_in_english": "Chai Nat"
    },
    {
      "id": 17,
      "code": 26,
      "name_in_thai": "นครนายก",
      "name_in_english": "Nakhon Nayok"
    },
    {
      "id": 64,
      "code": 80,
      "name_in_thai": "นครศรีธรรมราช",
      "name_in_english": "Nakhon Si Thammarat"
    },
    {
      "id": 58,
      "code": 72,
      "name_in_thai": "สุพรรณบุรี",
      "name_in_english": "Suphan Buri"
    }
  ],
  "districts": [
    {
      "id": 792,
      "code": 8015,
      "name_in_thai": "ขนอม",
      "name_in_english": "Khanom",
      "province_id": 64
    },
    {
      "id": 177,
      "code": 2411,
      "name_in_thai": "คลองเขื่อน",
      "name_in_english": "Khlong Khuean",
      "province_id": 15
    },
    {
      "id": 796,
      "code": 8019,
      "name_in_thai": "จุฬาภรณ์",
      "name_in_english": "Chulabhorn",
      "province_id": 64
    },
    {
      "id": 781,
      "code": 8004,
      "name_in_thai": "ฉวาง",
      "name_in_english": "Chawang",
      "province_id": 64
    },
    {
      "id": 800,
      "code": 8023,
      "name_in_thai": "เฉลิมพระเกียรติ",
      "name_in_english": "Chaloem Phra Kiet",
      "province_id": 64
    },
    {
      "id": 784,
      "code": 8007,
      "name_in_thai": "ชะอวด",
      "name_in_english": "Cha-uat",
      "province_id": 64
    },
    {
      "id": 799,
      "code": 8022,
      "name_in_thai": "ช้างกลาง",
      "name_in_english": "Chang Klang",
      "province_id": 64
    },
    {
      "id": 783,
      "code": 8006,
      "name_in_thai": "เชียรใหญ่",
      "name_in_english": "Chian Yai",
      "province_id": 64
    },
    {
      "id": 744,
      "code": 7206,
      "name_in_thai": "ดอนเจดีย์",
      "name_in_english": "Don Chedi",
      "province_id": 58
    },
    {
      "id": 741,
      "code": 7203,
      "name_in_thai": "ด่านช้าง",
      "name_in_english": "Dan Chang",
      "province_id": 58
    },
    {
      "id": 740,
      "code": 7202,
      "name_in_thai": "เดิมบางนางบวช",
      "name_in_english": "Doem Bang Nang Buat",
      "province_id": 58
    },
    {
      "id": 795,
      "code": 8018,
      "name_in_thai": "ถ้ำพรรณรา",
      "name_in_english": "Tham Phannara",
      "province_id": 64
    },
    {
      "id": 176,
      "code": 2410,
      "name_in_thai": "ท่าตะเกียบ",
      "name_in_english": "Tha Takiap",
      "province_id": 15
    },
    {
      "id": 785,
      "code": 8008,
      "name_in_thai": "ท่าศาลา",
      "name_in_english": "Tha Sala",
      "province_id": 64
    },
    {
      "id": 786,
      "code": 8009,
      "name_in_thai": "ทุ่งสง",
      "name_in_english": "Thung Song",
      "province_id": 64
    },
    {
      "id": 788,
      "code": 8011,
      "name_in_thai": "ทุ่งใหญ่",
      "name_in_english": "Thung Yai",
      "province_id": 64
    },
    {
      "id": 798,
      "code": 8021,
      "name_in_thai": "นบพิตำ",
      "name_in_english": "Nopphitam",
      "province_id": 64
    },
    {
      "id": 787,
      "code": 8010,
      "name_in_thai": "นาบอน",
      "name_in_english": "Na Bon",
      "province_id": 64
    },
    {
      "id": 117,
      "code": 1808,
      "name_in_thai": "เนินขาม",
      "name_in_english": "Noen Kham",
      "province_id": 9
    },
    {
      "id": 794,
      "code": 8017,
      "name_in_thai": "บางขัน",
      "name_in_english": "Bang Khan",
      "province_id": 64
    },
    {
      "id": 168,
      "code": 2402,
      "name_in_thai": "บางคล้า",
      "name_in_english": "Bang Khla",
      "province_id": 15
    },
    {
      "id": 169,
      "code": 2403,
      "name_in_thai": "บางน้ำเปรี้ยว",
      "name_in_english": "Bang Nam Priao",
      "province_id": 15
    },
    {
      "id": 742,
      "code": 7204,
      "name_in_thai": "บางปลาม้า",
      "name_in_english": "Bang Pla Ma",
      "province_id": 58
    },
    {
      "id": 170,
      "code": 2404,
      "name_in_thai": "บางปะกง",
      "name_in_english": "Bang Pakong",
      "province_id": 15
    },
    {
      "id": 187,
      "code": 2603,
      "name_in_thai": "บ้านนา",
      "name_in_english": "Ban Na",
      "province_id": 17
    },
    {
      "id": 171,
      "code": 2405,
      "name_in_thai": "บ้านโพธิ์",
      "name_in_english": "Ban Pho",
      "province_id": 15
    },
    {
      "id": 789,
      "code": 8012,
      "name_in_thai": "ปากพนัง",
      "name_in_english": "Pak Phanang",
      "province_id": 64
    },
    {
      "id": 186,
      "code": 2602,
      "name_in_thai": "ปากพลี",
      "name_in_english": "Pak Phli",
      "province_id": 17
    },
    {
      "id": 175,
      "code": 2409,
      "name_in_thai": "แปลงยาว",
      "name_in_english": "Pleang Yao",
      "province_id": 15
    },
    {
      "id": 172,
      "code": 2406,
      "name_in_thai": "พนมสารคาม",
      "name_in_english": "Phanom Sarakham",
      "province_id": 15
    },
    {
      "id": 779,
      "code": 8002,
      "name_in_thai": "พรหมคีรี",
      "name_in_english": "Phrom Khiri",
      "province_id": 64
    },
    {
      "id": 797,
      "code": 8020,
      "name_in_thai": "พระพรหม",
      "name_in_english": "Phra Phrom",
      "province_id": 64
    },
    {
      "id": 782,
      "code": 8005,
      "name_in_thai": "พิปูน",
      "name_in_english": "Phipun",
      "province_id": 64
    },
    {
      "id": 111,
      "code": 1802,
      "name_in_thai": "มโนรมย์",
      "name_in_english": "Manorom",
      "province_id": 9
    },
    {
      "id": 167,
      "code": 2401,
      "name_in_thai": "เมืองฉะเชิงเทรา",
      "name_in_english": "Mueang Chachoengsao",
      "province_id": 15
    },
    {
      "id": 110,
      "code": 1801,
      "name_in_thai": "เมืองชัยนาท",
      "name_in_english": "Mueang Chai Nat",
      "province_id": 9
    },
    {
      "id": 185,
      "code": 2601,
      "name_in_thai": "เมืองนครนายก",
      "name_in_english": "Mueang Nakhon Nayok",
      "province_id": 17
    },
    {
      "id": 778,
      "code": 8001,
      "name_in_thai": "เมืองนครศรีธรรมราช",
      "name_in_english": "Mueang Nakhon Si Thammarat",
      "province_id": 64
    },
    {
      "id": 739,
      "code": 7201,
      "name_in_thai": "เมืองสุพรรณบุรี",
      "name_in_english": "Mueang Saphan Buri",
      "province_id": 58
    },
    {
      "id": 790,
      "code": 8013,
      "name_in_thai": "ร่อนพิบูลย์",
      "name_in_english": "Ron Phibun",
      "province_id": 64
    },
    {
      "id": 173,
      "code": 2407,
      "name_in_thai": "ราชสาส์น",
      "name_in_english": "Ratchasan",
      "province_id": 15
    },
    {
      "id": 780,
      "code": 8003,
      "name_in_thai": "ลานสกา",
      "name_in_english": "Lan Saka",
      "province_id": 64
    },
    {
      "id": 112,
      "code": 1803,
      "name_in_thai": "วัดสิงห์",
      "name_in_english": "Wat Sing",
      "province_id": 9
    },
    {
      "id": 743,
      "code": 7205,
      "name_in_thai": "ศรีประจันต์",
      "name_in_english": "Si Prachan",
      "province_id": 58
    },
    {
      "id": 174,
      "code": 2408,
      "name_in_thai": "สนามชัยเขต",
      "name_in_english": "Sanam Chai Khet",
      "province_id": 15
    },
    {
      "id": 114,
      "code": 1805,
      "name_in_thai": "สรรคบุรี",
      "name_in_english": "Sankhaburi",
      "province_id": 9
    },
    {
      "id": 113,
      "code": 1804,
      "name_in_thai": "สรรพยา",
      "name_in_english": "Sapphaya",
      "province_id": 9
    },
    {
      "id": 745,
      "code": 7207,
      "name_in_thai": "สองพี่น้อง",
      "name_in_english": "Song Phi Nong",
      "province_id": 58
    },
    {
      "id": 746,
      "code": 7208,
      "name_in_thai": "สามชุก",
      "name_in_english": "Sam Chuk",
      "province_id": 58
    },
    {
      "id": 791,
      "code": 8014,
      "name_in_thai": "สิชล",
      "name_in_english": "Sichon",
      "province_id": 64
    },
    {
      "id": 116,
      "code": 1807,
      "name_in_thai": "หนองมะโมง",
      "name_in_english": "Nong Mamong",
      "province_id": 9
    },
    {
      "id": 748,
      "code": 7210,
      "name_in_thai": "หนองหญ้าไซ",
      "name_in_english": "Nong Ya Sai",
      "province_id": 58
    },
    {
      "id": 115,
      "code": 1806,
      "name_in_thai": "หันคา",
      "name_in_english": "Hankha",
      "province_id": 9
    },
    {
      "id": 793,
      "code": 8016,
      "name_in_thai": "หัวไทร",
      "name_in_english": "Hua Sai",
      "province_id": 64
    },
    {
      "id": 188,
      "code": 2604,
      "name_in_thai": "องครักษ์",
      "name_in_english": "Ongkharak",
      "province_id": 17
    },
    {
      "id": 747,
      "code": 7209,
      "name_in_thai": "อู่ทอง",
      "name_in_english": "U Thong",
      "province_id": 58
    }
  ],
  "subDistricts": [
    {
      "id": 5953,
      "code": 720913,
      "name_in_thai": "กระจัน",
      "name_in_english": "Krachan",
      "latitude": "14.367",
      "longitude": "99.928",
      "district_id": 747,
      "zip_code": 72160
    },
    {
      "id": 5940,
      "code": 720807,
      "name_in_thai": "กระเสียว",
      "name_in_english": "Krasiao",
      "latitude": "14.801",
      "longitude": "100.056",
      "district_id": 746,
      "zip_code": 72130
    },
    {
      "id": 6441,
      "code": 802102,
      "name_in_thai": "กรุงชิง",
      "name_in_english": "Krung Ching",
      "latitude": "8.804",
      "longitude": "99.635",
      "district_id": 798,
      "zip_code": 80160
    },
    {
      "id": 6376,
      "code": 801107,
      "name_in_thai": "กรุงหยัน",
      "name_in_english": "Krung Yan",
      "latitude": "8.187",
      "longitude": "99.403",
      "district_id": 788,
      "zip_code": 80240
    },
    {
      "id": 5895,
      "code": 720405,
      "name_in_thai": "กฤษณา",
      "name_in_english": "Kritsana",
      "latitude": "14.290",
      "longitude": "100.178",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 6345,
      "code": 800802,
      "name_in_thai": "กลาย",
      "name_in_english": "Klai",
      "latitude": "8.812",
      "longitude": "99.902",
      "district_id": 785,
      "zip_code": 80160
    },
    {
      "id": 1272,
      "code": 241101,
      "name_in_thai": "ก้อนแก้ว",
      "name_in_english": "Kon Kaeo",
      "latitude": "13.765",
      "longitude": "101.136",
      "district_id": 177,
      "zip_code": 24000
    },
    {
      "id": 6319,
      "code": 800502,
      "name_in_thai": "กะทูน",
      "name_in_english": "Kathun",
      "latitude": "8.638",
      "longitude": "99.530",
      "district_id": 782,
      "zip_code": 80270
    },
    {
      "id": 812,
      "code": 180802,
      "name_in_thai": "กะบกเตี้ย",
      "name_in_english": "Kabok Tia",
      "latitude": "15.036",
      "longitude": "99.816",
      "district_id": 117,
      "zip_code": 17130
    },
    {
      "id": 6361,
      "code": 800908,
      "name_in_thai": "กะปาง",
      "name_in_english": "Kapang",
      "latitude": "8.029",
      "longitude": "99.683",
      "district_id": 786,
      "zip_code": 80310
    },
    {
      "id": 6312,
      "code": 800406,
      "name_in_thai": "กะเปียด",
      "name_in_english": "Kapiat",
      "latitude": "8.519",
      "longitude": "99.460",
      "district_id": 781,
      "zip_code": 80260
    },
    {
      "id": 6442,
      "code": 802103,
      "name_in_thai": "กะหรอ",
      "name_in_english": "Karo",
      "latitude": "8.666",
      "longitude": "99.827",
      "district_id": 798,
      "zip_code": 80160
    },
    {
      "id": 6330,
      "code": 800611,
      "name_in_thai": "การะเกด",
      "name_in_english": "Karaket",
      "latitude": "8.073",
      "longitude": "100.154",
      "district_id": 783,
      "zip_code": 80190
    },
    {
      "id": 6288,
      "code": 800112,
      "name_in_thai": "กำแพงเซา",
      "name_in_english": "Kamphaeng Sao",
      "latitude": "8.401",
      "longitude": "99.868",
      "district_id": 778,
      "zip_code": 80280
    },
    {
      "id": 6306,
      "code": 800304,
      "name_in_thai": "กำโลน",
      "name_in_english": "Kamlon",
      "latitude": "8.442",
      "longitude": "99.757",
      "district_id": 780,
      "zip_code": 80230
    },
    {
      "id": 810,
      "code": 180704,
      "name_in_thai": "กุดจอก",
      "name_in_english": "Kut Chok",
      "latitude": "15.241",
      "longitude": "99.894",
      "district_id": 116,
      "zip_code": 17120
    },
    {
      "id": 6373,
      "code": 801104,
      "name_in_thai": "กุแหระ",
      "name_in_english": "Kurae",
      "latitude": "8.194",
      "longitude": "99.337",
      "district_id": 788,
      "zip_code": 80240
    },
    {
      "id": 1251,
      "code": 240601,
      "name_in_thai": "เกาะขนุน",
      "name_in_english": "Ko Khanun",
      "latitude": "13.695",
      "longitude": "101.399",
      "district_id": 172,
      "zip_code": 24120
    },
    {
      "id": 6340,
      "code": 800708,
      "name_in_thai": "เกาะขันธ์",
      "name_in_english": "Ko Khan",
      "latitude": "7.910",
      "longitude": "99.935",
      "district_id": 784,
      "zip_code": 80180
    },
    {
      "id": 6381,
      "code": 801206,
      "name_in_thai": "เกาะทวด",
      "name_in_english": "Ko Thuat",
      "latitude": "8.283",
      "longitude": "100.092",
      "district_id": 789,
      "zip_code": 80330
    },
    {
      "id": 6422,
      "code": 801611,
      "name_in_thai": "เกาะเพชร",
      "name_in_english": "Ko Phet",
      "latitude": "8.112",
      "longitude": "100.291",
      "district_id": 793,
      "zip_code": 80170
    },
    {
      "id": 1355,
      "code": 260202,
      "name_in_thai": "เกาะโพธิ์",
      "name_in_english": "Ko Pho",
      "latitude": "14.156",
      "longitude": "101.231",
      "district_id": 186,
      "zip_code": 26130
    },
    {
      "id": 1235,
      "code": 240502,
      "name_in_thai": "เกาะไร่",
      "name_in_english": "Ko Rai",
      "latitude": "13.678",
      "longitude": "100.958",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 1354,
      "code": 260201,
      "name_in_thai": "เกาะหวาย",
      "name_in_english": "Ko Wai",
      "latitude": "14.175",
      "longitude": "101.271",
      "district_id": 186,
      "zip_code": 26130
    },
    {
      "id": 6369,
      "code": 801003,
      "name_in_thai": "แก้วแสน",
      "name_in_english": "Kaeo Saen",
      "latitude": "8.282",
      "longitude": "99.528",
      "district_id": 787,
      "zip_code": 80220
    },
    {
      "id": 6409,
      "code": 801501,
      "name_in_thai": "ขนอม",
      "name_in_english": "Khanom",
      "latitude": "9.166",
      "longitude": "99.838",
      "district_id": 792,
      "zip_code": 80210
    },
    {
      "id": 6393,
      "code": 801218,
      "name_in_thai": "ขนาบนาก",
      "name_in_english": "Khanap Nak",
      "latitude": "8.220",
      "longitude": "100.247",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 6339,
      "code": 800707,
      "name_in_thai": "ขอนหาด",
      "name_in_english": "Khon Hat",
      "latitude": "7.872",
      "longitude": "100.059",
      "district_id": 784,
      "zip_code": 80180
    },
    {
      "id": 6307,
      "code": 800305,
      "name_in_thai": "ขุนทะเล",
      "name_in_english": "Khun Thale",
      "latitude": "8.344",
      "longitude": "99.848",
      "district_id": 780,
      "zip_code": 80230
    },
    {
      "id": 6303,
      "code": 800301,
      "name_in_thai": "เขาแก้ว",
      "name_in_english": "Khao Kaeo",
      "latitude": "8.374",
      "longitude": "99.742",
      "district_id": 780,
      "zip_code": 80230
    },
    {
      "id": 786,
      "code": 180403,
      "name_in_thai": "เขาแก้ว",
      "name_in_english": "Khao Kaeo",
      "latitude": "15.142",
      "longitude": "100.316",
      "district_id": 113,
      "zip_code": 17150
    },
    {
      "id": 6366,
      "code": 800913,
      "name_in_thai": "เขาขาว",
      "name_in_english": "Khao Khao",
      "latitude": "8.173",
      "longitude": "99.500",
      "district_id": 786,
      "zip_code": 80110
    },
    {
      "id": 5874,
      "code": 720204,
      "name_in_thai": "เขาดิน",
      "name_in_english": "Khao Din",
      "latitude": "14.803",
      "longitude": "100.189",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 1233,
      "code": 240412,
      "name_in_thai": "เขาดิน",
      "name_in_english": "Khao Din",
      "latitude": "13.528",
      "longitude": "101.026",
      "district_id": 170,
      "zip_code": 24130
    },
    {
      "id": 765,
      "code": 180105,
      "name_in_thai": "เขาท่าพระ",
      "name_in_english": "Khao Tha Phra",
      "latitude": "15.218",
      "longitude": "100.134",
      "district_id": 110,
      "zip_code": 17000
    },
    {
      "id": 6407,
      "code": 801408,
      "name_in_thai": "เขาน้อย",
      "name_in_english": "Khao Noi",
      "latitude": "8.945",
      "longitude": "99.787",
      "district_id": 791,
      "zip_code": 80120
    },
    {
      "id": 5871,
      "code": 720201,
      "name_in_thai": "เขาพระ",
      "name_in_english": "Khao Phra",
      "latitude": "14.853",
      "longitude": "100.095",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 6320,
      "code": 800503,
      "name_in_thai": "เขาพระ",
      "name_in_english": "Khao Phra",
      "latitude": "8.634",
      "longitude": "99.615",
      "district_id": 782,
      "zip_code": 80270
    },
    {
      "id": 1352,
      "code": 260112,
      "name_in_thai": "เขาพระ",
      "name_in_english": "Khao Phra",
      "latitude": "14.301",
      "longitude": "101.212",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 6342,
      "code": 800710,
      "name_in_thai": "เขาพระทอง",
      "name_in_english": "Khao Phra Thong",
      "latitude": "7.974",
      "longitude": "99.905",
      "district_id": 784,
      "zip_code": 80180
    },
    {
      "id": 6331,
      "code": 800612,
      "name_in_thai": "เขาพระบาท",
      "name_in_english": "Khao Phrabat",
      "latitude": "8.084",
      "longitude": "100.191",
      "district_id": 783,
      "zip_code": 80190
    },
    {
      "id": 6416,
      "code": 801605,
      "name_in_thai": "เขาพังไกร",
      "name_in_english": "Khao Phang Krai",
      "latitude": "7.976",
      "longitude": "100.272",
      "district_id": 793,
      "zip_code": 80170
    },
    {
      "id": 1369,
      "code": 260309,
      "name_in_thai": "เขาเพิ่ม",
      "name_in_english": "Khao Phoem",
      "latitude": "14.362",
      "longitude": "101.096",
      "district_id": 187,
      "zip_code": 26110
    },
    {
      "id": 6360,
      "code": 800907,
      "name_in_thai": "เขาโร",
      "name_in_english": "Khao Ro",
      "latitude": "8.047",
      "longitude": "99.594",
      "district_id": 786,
      "zip_code": 80110
    },
    {
      "id": 1258,
      "code": 240608,
      "name_in_thai": "เขาหินซ้อน",
      "name_in_english": "Khao Hin Son",
      "latitude": "13.750",
      "longitude": "101.494",
      "district_id": 172,
      "zip_code": 24120
    },
    {
      "id": 6380,
      "code": 801205,
      "name_in_thai": "คลองกระบือ",
      "name_in_english": "Khlong Krabue",
      "latitude": "8.317",
      "longitude": "100.143",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 1236,
      "code": 240503,
      "name_in_thai": "คลองขุด",
      "name_in_english": "Khlong Khut",
      "latitude": "13.611",
      "longitude": "101.194",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 1273,
      "code": 241102,
      "name_in_thai": "คลองเขื่อน",
      "name_in_english": "Khlong Khuean",
      "latitude": "13.772",
      "longitude": "101.185",
      "district_id": 177,
      "zip_code": 24000
    },
    {
      "id": 1190,
      "code": 240107,
      "name_in_thai": "คลองจุกกระเฌอ",
      "name_in_english": "Khlong Chuk Khachoe",
      "latitude": "13.686",
      "longitude": "101.125",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 1271,
      "code": 241002,
      "name_in_thai": "คลองตะเกรา",
      "name_in_english": "Khlong Takrao",
      "latitude": "13.299",
      "longitude": "101.739",
      "district_id": 176,
      "zip_code": 24160
    },
    {
      "id": 1193,
      "code": 240110,
      "name_in_thai": "คลองนครเนื่องเขต",
      "name_in_english": "Khlong Nakhon Nueang Khet",
      "latitude": "13.766",
      "longitude": "101.008",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 6377,
      "code": 801202,
      "name_in_thai": "คลองน้อย",
      "name_in_english": "Khlong Noi",
      "latitude": "8.358",
      "longitude": "100.108",
      "district_id": 789,
      "zip_code": 80330
    },
    {
      "id": 1187,
      "code": 240104,
      "name_in_thai": "คลองนา",
      "name_in_english": "Khlong Na",
      "latitude": "13.648",
      "longitude": "101.102",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 1237,
      "code": 240504,
      "name_in_thai": "คลองบ้านโพธิ์",
      "name_in_english": "Khlong Ban Pho",
      "latitude": "13.572",
      "longitude": "101.057",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 1238,
      "code": 240505,
      "name_in_thai": "คลองประเวศ",
      "name_in_english": "Khlong Prawet",
      "latitude": "13.630",
      "longitude": "101.024",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 1199,
      "code": 240116,
      "name_in_thai": "คลองเปรง",
      "name_in_english": "Khlong Preng",
      "latitude": "13.707",
      "longitude": "100.933",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 6428,
      "code": 801802,
      "name_in_thai": "คลองเส",
      "name_in_english": "Khlong Se",
      "latitude": "8.491",
      "longitude": "99.419",
      "district_id": 795,
      "zip_code": 80260
    },
    {
      "id": 1201,
      "code": 240118,
      "name_in_thai": "คลองหลวงแพ่ง",
      "name_in_english": "Khlong Luang Phaeng",
      "latitude": "13.780",
      "longitude": "100.927",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 1381,
      "code": 260411,
      "name_in_thai": "คลองใหญ่",
      "name_in_english": "Khlong Yai",
      "latitude": "14.127",
      "longitude": "100.980",
      "district_id": 188,
      "zip_code": 26120
    },
    {
      "id": 1200,
      "code": 240117,
      "name_in_thai": "คลองอุดมชลจร",
      "name_in_english": "Khlong Udom Chonlachon",
      "latitude": "13.736",
      "longitude": "100.920",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 6284,
      "code": 800103,
      "name_in_thai": "คลัง",
      "name_in_english": "Khlang",
      "latitude": "8.434",
      "longitude": "99.966",
      "district_id": 778,
      "zip_code": 80000
    },
    {
      "id": 6357,
      "code": 800904,
      "name_in_thai": "ควนกรด",
      "name_in_english": "Khuan Krot",
      "latitude": "8.149",
      "longitude": "99.632",
      "district_id": 786,
      "zip_code": 80110
    },
    {
      "id": 6322,
      "code": 800505,
      "name_in_thai": "ควนกลาง",
      "name_in_english": "Khuan Klang",
      "latitude": "8.534",
      "longitude": "99.553",
      "district_id": 782,
      "zip_code": 80270
    },
    {
      "id": 6397,
      "code": 801304,
      "name_in_thai": "ควนเกย",
      "name_in_english": "Khuan Koei",
      "latitude": "8.140",
      "longitude": "99.900",
      "district_id": 790,
      "zip_code": 80130
    },
    {
      "id": 6420,
      "code": 801609,
      "name_in_thai": "ควนชะลิก",
      "name_in_english": "Khuan Chalik",
      "latitude": "7.907",
      "longitude": "100.206",
      "district_id": 793,
      "zip_code": 80170
    },
    {
      "id": 6399,
      "code": 801306,
      "name_in_thai": "ควนชุม",
      "name_in_english": "Khuan Chum",
      "latitude": "8.183",
      "longitude": "99.919",
      "district_id": 790,
      "zip_code": 80130
    },
    {
      "id": 6410,
      "code": 801502,
      "name_in_thai": "ควนทอง",
      "name_in_english": "Khuan Thong",
      "latitude": "9.181",
      "longitude": "99.782",
      "district_id": 792,
      "zip_code": 80210
    },
    {
      "id": 6398,
      "code": 801305,
      "name_in_thai": "ควนพัง",
      "name_in_english": "Khuan Phang",
      "latitude": "8.159",
      "longitude": "99.977",
      "district_id": 790,
      "zip_code": 80130
    },
    {
      "id": 6432,
      "code": 801903,
      "name_in_thai": "ควนหนองคว้า",
      "name_in_english": "Khuan Nong Kwa",
      "latitude": "8.103",
      "longitude": "99.935",
      "district_id": 796,
      "zip_code": 80130
    },
    {
      "id": 6341,
      "code": 800709,
      "name_in_thai": "ควนหนองหงษ์",
      "name_in_english": "Khuan Nong Hong",
      "latitude": "8.009",
      "longitude": "99.885",
      "district_id": 784,
      "zip_code": 80180
    },
    {
      "id": 770,
      "code": 180201,
      "name_in_thai": "คุ้งสำเภา",
      "name_in_english": "Khung Samphao",
      "latitude": "15.291",
      "longitude": "100.091",
      "district_id": 111,
      "zip_code": 17110
    },
    {
      "id": 1262,
      "code": 240801,
      "name_in_thai": "คู้ยายหมี",
      "name_in_english": "Khu Yai Mi",
      "latitude": "13.644",
      "longitude": "101.461",
      "district_id": 174,
      "zip_code": 24160
    },
    {
      "id": 6336,
      "code": 800704,
      "name_in_thai": "เคร็ง",
      "name_in_english": "Khreng",
      "latitude": "7.952",
      "longitude": "100.103",
      "district_id": 784,
      "zip_code": 80180
    },
    {
      "id": 1357,
      "code": 260204,
      "name_in_thai": "โคกกรวด",
      "name_in_english": "Khok Kruat",
      "latitude": "14.180",
      "longitude": "101.306",
      "district_id": 186,
      "zip_code": 26130
    },
    {
      "id": 5891,
      "code": 720401,
      "name_in_thai": "โคกคราม",
      "name_in_english": "Khok Khram",
      "latitude": "14.414",
      "longitude": "100.151",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 5856,
      "code": 720106,
      "name_in_thai": "โคกโคเฒ่า",
      "name_in_english": "Khok Kho Thao",
      "latitude": "14.464",
      "longitude": "100.233",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 5877,
      "code": 720207,
      "name_in_thai": "โคกช้าง",
      "name_in_english": "Khok Chang",
      "latitude": "14.910",
      "longitude": "100.169",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 5943,
      "code": 720903,
      "name_in_thai": "จรเข้สามพัน",
      "name_in_english": "Chorakhe Sam Phan",
      "latitude": "14.317",
      "longitude": "99.850",
      "district_id": 747,
      "zip_code": 72160
    },
    {
      "id": 5899,
      "code": 720409,
      "name_in_thai": "จรเข้ใหญ่",
      "name_in_english": "Chorakhe Yai",
      "latitude": "14.421",
      "longitude": "100.236",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 6317,
      "code": 800416,
      "name_in_thai": "จันดี",
      "name_in_english": "Chan Di",
      "latitude": "8.391",
      "longitude": "99.554",
      "district_id": 781,
      "zip_code": 80250
    },
    {
      "id": 5951,
      "code": 720911,
      "name_in_thai": "เจดีย์",
      "name_in_english": "Chedi",
      "latitude": "14.353",
      "longitude": "99.966",
      "district_id": 747,
      "zip_code": 72160
    },
    {
      "id": 5957,
      "code": 721004,
      "name_in_thai": "แจงงาม",
      "name_in_english": "Chaeng Ngam",
      "latitude": "14.820",
      "longitude": "99.804",
      "district_id": 748,
      "zip_code": 72240
    },
    {
      "id": 6402,
      "code": 801403,
      "name_in_thai": "ฉลอง",
      "name_in_english": "Chalong",
      "latitude": "8.890",
      "longitude": "99.773",
      "district_id": 791,
      "zip_code": 80120
    },
    {
      "id": 6308,
      "code": 800401,
      "name_in_thai": "ฉวาง",
      "name_in_english": "Chawang",
      "latitude": "8.397",
      "longitude": "99.501",
      "district_id": 781,
      "zip_code": 80150
    },
    {
      "id": 6355,
      "code": 800902,
      "name_in_thai": "ชะมาย",
      "name_in_english": "Chamai",
      "latitude": "8.148",
      "longitude": "99.673",
      "district_id": 786,
      "zip_code": 80110
    },
    {
      "id": 6379,
      "code": 801204,
      "name_in_thai": "ชะเมา",
      "name_in_english": "Chamao",
      "latitude": "8.275",
      "longitude": "100.054",
      "district_id": 789,
      "zip_code": 80330
    },
    {
      "id": 6333,
      "code": 800701,
      "name_in_thai": "ชะอวด",
      "name_in_english": "Cha-Uat",
      "latitude": "7.996",
      "longitude": "100.020",
      "district_id": 784,
      "zip_code": 80180
    },
    {
      "id": 764,
      "code": 180104,
      "name_in_thai": "ชัยนาท",
      "name_in_english": "Chai Nat",
      "latitude": "15.129",
      "longitude": "100.151",
      "district_id": 110,
      "zip_code": 17000
    },
    {
      "id": 6444,
      "code": 802201,
      "name_in_thai": "ช้างกลาง",
      "name_in_english": "Chang Klang",
      "latitude": "8.336",
      "longitude": "99.638",
      "district_id": 799,
      "zip_code": 80250
    },
    {
      "id": 6439,
      "code": 802004,
      "name_in_thai": "ช้างซ้าย",
      "name_in_english": "Chang Sai",
      "latitude": "8.311",
      "longitude": "99.966",
      "district_id": 797,
      "zip_code": 80000
    },
    {
      "id": 1380,
      "code": 260410,
      "name_in_thai": "ชุมพล",
      "name_in_english": "Chum Phon",
      "latitude": "13.990",
      "longitude": "100.937",
      "district_id": 188,
      "zip_code": 26120
    },
    {
      "id": 6447,
      "code": 802301,
      "name_in_thai": "เชียรเขา",
      "name_in_english": "Chian Khao",
      "latitude": "8.184",
      "longitude": "100.078",
      "district_id": 800,
      "zip_code": 80190
    },
    {
      "id": 6323,
      "code": 800601,
      "name_in_thai": "เชียรใหญ่",
      "name_in_english": "Chian Yai",
      "latitude": "8.202",
      "longitude": "100.116",
      "district_id": 783,
      "zip_code": 80190
    },
    {
      "id": 6289,
      "code": 800113,
      "name_in_thai": "ไชยมนตรี",
      "name_in_english": "Chai Montri",
      "latitude": "8.401",
      "longitude": "99.914",
      "district_id": 778,
      "zip_code": 80000
    },
    {
      "id": 796,
      "code": 180506,
      "name_in_thai": "ดงคอน",
      "name_in_english": "Dong Khon",
      "latitude": "14.976",
      "longitude": "100.135",
      "district_id": 114,
      "zip_code": 17140
    },
    {
      "id": 1261,
      "code": 240703,
      "name_in_thai": "ดงน้อย",
      "name_in_english": "Dong Noi",
      "latitude": "13.836",
      "longitude": "101.291",
      "district_id": 173,
      "zip_code": 24120
    },
    {
      "id": 1348,
      "code": 260108,
      "name_in_thai": "ดงละคร",
      "name_in_english": "Dong Lakhon",
      "latitude": "14.136",
      "longitude": "101.167",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 797,
      "code": 180507,
      "name_in_thai": "ดอนกำ",
      "name_in_english": "Don Kam",
      "latitude": "14.966",
      "longitude": "100.236",
      "district_id": 114,
      "zip_code": 17140
    },
    {
      "id": 5860,
      "code": 720110,
      "name_in_thai": "ดอนกำยาน",
      "name_in_english": "Don Kamyan",
      "latitude": "14.454",
      "longitude": "100.064",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 1217,
      "code": 240306,
      "name_in_thai": "ดอนเกาะกา",
      "name_in_english": "Don Ko Ka",
      "latitude": "13.944",
      "longitude": "101.016",
      "district_id": 169,
      "zip_code": 24170
    },
    {
      "id": 5948,
      "code": 720908,
      "name_in_thai": "ดอนคา",
      "name_in_english": "Don Kha",
      "latitude": "14.452",
      "longitude": "99.854",
      "district_id": 747,
      "zip_code": 72160
    },
    {
      "id": 5914,
      "code": 720601,
      "name_in_thai": "ดอนเจดีย์",
      "name_in_english": "Don Chedi",
      "latitude": "14.633",
      "longitude": "99.959",
      "district_id": 744,
      "zip_code": 72170
    },
    {
      "id": 1219,
      "code": 240308,
      "name_in_thai": "ดอนฉิมพลี",
      "name_in_english": "Don Chimphli",
      "latitude": "13.908",
      "longitude": "100.964",
      "district_id": 169,
      "zip_code": 24170
    },
    {
      "id": 6448,
      "code": 802302,
      "name_in_thai": "ดอนตรอ",
      "name_in_english": "Don Tro",
      "latitude": "8.213",
      "longitude": "100.039",
      "district_id": 800,
      "zip_code": 80290
    },
    {
      "id": 6351,
      "code": 800810,
      "name_in_thai": "ดอนตะโก",
      "name_in_english": "Don Tako",
      "latitude": "8.560",
      "longitude": "99.903",
      "district_id": 785,
      "zip_code": 80160
    },
    {
      "id": 5857,
      "code": 720107,
      "name_in_thai": "ดอนตาล",
      "name_in_english": "Don Tan",
      "latitude": "14.490",
      "longitude": "100.208",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 1239,
      "code": 240506,
      "name_in_thai": "ดอนทราย",
      "name_in_english": "Don Sai",
      "latitude": "13.631",
      "longitude": "101.125",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 5909,
      "code": 720505,
      "name_in_thai": "ดอนปรู",
      "name_in_english": "Don Pru",
      "latitude": "14.722",
      "longitude": "100.190",
      "district_id": 743,
      "zip_code": 72140
    },
    {
      "id": 5861,
      "code": 720111,
      "name_in_thai": "ดอนโพธิ์ทอง",
      "name_in_english": "Don Pho Thong",
      "latitude": "14.426",
      "longitude": "100.032",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 5946,
      "code": 720906,
      "name_in_thai": "ดอนมะเกลือ",
      "name_in_english": "Don Makluea",
      "latitude": "14.263",
      "longitude": "99.950",
      "district_id": 747,
      "zip_code": 72220
    },
    {
      "id": 5933,
      "code": 720715,
      "name_in_thai": "ดอนมะนาว",
      "name_in_english": "Don Manao",
      "latitude": "14.166",
      "longitude": "100.011",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 5858,
      "code": 720108,
      "name_in_thai": "ดอนมะสังข์",
      "name_in_english": "Don Masang",
      "latitude": "14.524",
      "longitude": "100.181",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 1346,
      "code": 260106,
      "name_in_thai": "ดอนยอ",
      "name_in_english": "Don Yo",
      "latitude": "14.128",
      "longitude": "101.109",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 5885,
      "code": 720302,
      "name_in_thai": "ด่านช้าง",
      "name_in_english": "Dan Chang",
      "latitude": "14.744",
      "longitude": "99.527",
      "district_id": 741,
      "zip_code": 72180
    },
    {
      "id": 6429,
      "code": 801803,
      "name_in_thai": "ดุสิต",
      "name_in_english": "Dusit",
      "latitude": "8.466",
      "longitude": "99.347",
      "district_id": 795,
      "zip_code": 80260
    },
    {
      "id": 805,
      "code": 180609,
      "name_in_thai": "เด่นใหญ่",
      "name_in_english": "Den Yai",
      "latitude": "15.017",
      "longitude": "99.930",
      "district_id": 115,
      "zip_code": 17130
    },
    {
      "id": 5872,
      "code": 720202,
      "name_in_thai": "เดิมบาง",
      "name_in_english": "Doem Bang",
      "latitude": "14.893",
      "longitude": "100.109",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 5928,
      "code": 720710,
      "name_in_thai": "ต้นตาล",
      "name_in_english": "Ton Tan",
      "latitude": "14.220",
      "longitude": "100.061",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 6352,
      "code": 800811,
      "name_in_thai": "ตลิ่งชัน",
      "name_in_english": "Taling Chan",
      "latitude": "8.783",
      "longitude": "99.821",
      "district_id": 785,
      "zip_code": 80160
    },
    {
      "id": 5864,
      "code": 720114,
      "name_in_thai": "ตลิ่งชัน",
      "name_in_english": "Taling Chan",
      "latitude": "14.559",
      "longitude": "100.029",
      "district_id": 739,
      "zip_code": 72230
    },
    {
      "id": 785,
      "code": 180402,
      "name_in_thai": "ตลุก",
      "name_in_english": "Taluk",
      "latitude": "15.195",
      "longitude": "100.198",
      "district_id": 113,
      "zip_code": 17150
    },
    {
      "id": 5893,
      "code": 720403,
      "name_in_thai": "ตะค่า",
      "name_in_english": "Takha",
      "latitude": "14.348",
      "longitude": "100.171",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 6427,
      "code": 801801,
      "name_in_thai": "ถ้ำพรรณรา",
      "name_in_english": "Tham Phannara",
      "latitude": "8.414",
      "longitude": "99.373",
      "district_id": 795,
      "zip_code": 80260
    },
    {
      "id": 6364,
      "code": 800911,
      "name_in_thai": "ถ้ำใหญ่",
      "name_in_english": "Tham Yai",
      "latitude": "8.164",
      "longitude": "99.742",
      "district_id": 786,
      "zip_code": 80110
    },
    {
      "id": 6414,
      "code": 801603,
      "name_in_thai": "ทรายขาว",
      "name_in_english": "Sai Khao",
      "latitude": "8.040",
      "longitude": "100.226",
      "district_id": 793,
      "zip_code": 80170
    },
    {
      "id": 1376,
      "code": 260406,
      "name_in_thai": "ทรายมูล",
      "name_in_english": "Sai Mun",
      "latitude": "14.123",
      "longitude": "101.069",
      "district_id": 188,
      "zip_code": 26120
    },
    {
      "id": 6411,
      "code": 801503,
      "name_in_thai": "ท้องเนียน",
      "name_in_english": "Thong Nian",
      "latitude": "9.280",
      "longitude": "99.814",
      "district_id": 792,
      "zip_code": 80210
    },
    {
      "id": 6328,
      "code": 800607,
      "name_in_thai": "ท้องลำเจียก",
      "name_in_english": "Thong Lamchiak",
      "latitude": "8.147",
      "longitude": "100.117",
      "district_id": 783,
      "zip_code": 80190
    },
    {
      "id": 1365,
      "code": 260305,
      "name_in_thai": "ทองหลาง",
      "name_in_english": "Thong Lang",
      "latitude": "14.207",
      "longitude": "101.037",
      "district_id": 187,
      "zip_code": 26110
    },
    {
      "id": 6301,
      "code": 800204,
      "name_in_thai": "ทอนหงส์",
      "name_in_english": "Thon Hong",
      "latitude": "8.580",
      "longitude": "99.776",
      "district_id": 779,
      "zip_code": 80320
    },
    {
      "id": 5918,
      "code": 720605,
      "name_in_thai": "ทะเลบก",
      "name_in_english": "Thale Bok",
      "latitude": "14.708",
      "longitude": "99.838",
      "district_id": 744,
      "zip_code": 72250
    },
    {
      "id": 5853,
      "code": 720103,
      "name_in_thai": "ทับตีเหล็ก",
      "name_in_english": "Thap Ti Lek",
      "latitude": "14.434",
      "longitude": "100.108",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 5959,
      "code": 721006,
      "name_in_thai": "ทัพหลวง",
      "name_in_english": "Thap Luang",
      "latitude": "14.749",
      "longitude": "99.806",
      "district_id": 748,
      "zip_code": 72240
    },
    {
      "id": 1263,
      "code": 240802,
      "name_in_thai": "ท่ากระดาน",
      "name_in_english": "Tha Kradan",
      "latitude": "13.606",
      "longitude": "101.710",
      "district_id": 174,
      "zip_code": 24160
    },
    {
      "id": 6324,
      "code": 800603,
      "name_in_thai": "ท่าขนาน",
      "name_in_english": "Tha Khanan",
      "latitude": "8.140",
      "longitude": "100.165",
      "district_id": 783,
      "zip_code": 80190
    },
    {
      "id": 1231,
      "code": 240410,
      "name_in_thai": "ท่าข้าม",
      "name_in_english": "Tha Kham",
      "latitude": "13.479",
      "longitude": "100.994",
      "district_id": 170,
      "zip_code": 24130
    },
    {
      "id": 6346,
      "code": 800803,
      "name_in_thai": "ท่าขึ้น",
      "name_in_english": "Tha Khuen",
      "latitude": "8.714",
      "longitude": "99.887",
      "district_id": 785,
      "zip_code": 80160
    },
    {
      "id": 1185,
      "code": 240102,
      "name_in_thai": "ท่าไข่",
      "name_in_english": "Tha Khai",
      "latitude": "13.736",
      "longitude": "101.060",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 6450,
      "code": 802304,
      "name_in_thai": "ทางพูน",
      "name_in_english": "Thang Phun",
      "latitude": "8.239",
      "longitude": "99.981",
      "district_id": 800,
      "zip_code": 80190
    },
    {
      "id": 6292,
      "code": 800116,
      "name_in_thai": "ท่างิ้ว",
      "name_in_english": "Tha Ngio",
      "latitude": "8.452",
      "longitude": "99.835",
      "district_id": 778,
      "zip_code": 80280
    },
    {
      "id": 773,
      "code": 180204,
      "name_in_thai": "ท่าฉนวน",
      "name_in_english": "Tha Chanuan",
      "latitude": "15.379",
      "longitude": "100.138",
      "district_id": 111,
      "zip_code": 17110
    },
    {
      "id": 763,
      "code": 180103,
      "name_in_thai": "ท่าชัย",
      "name_in_english": "Tha Chai",
      "latitude": "15.163",
      "longitude": "100.113",
      "district_id": 110,
      "zip_code": 17000
    },
    {
      "id": 1342,
      "code": 260102,
      "name_in_thai": "ท่าช้าง",
      "name_in_english": "Tha Chang",
      "latitude": "14.192",
      "longitude": "101.176",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 6419,
      "code": 801608,
      "name_in_thai": "ท่าซอม",
      "name_in_english": "Tha Som",
      "latitude": "8.146",
      "longitude": "100.246",
      "district_id": 793,
      "zip_code": 80170
    },
    {
      "id": 6296,
      "code": 800121,
      "name_in_thai": "ท่าซัก",
      "name_in_english": "Tha Sak",
      "latitude": "8.510",
      "longitude": "100.032",
      "district_id": 778,
      "zip_code": 80000
    },
    {
      "id": 6305,
      "code": 800303,
      "name_in_thai": "ท่าดี",
      "name_in_english": "Tha Di",
      "latitude": "8.443",
      "longitude": "99.804",
      "district_id": 780,
      "zip_code": 80230
    },
    {
      "id": 1270,
      "code": 241001,
      "name_in_thai": "ท่าตะเกียบ",
      "name_in_english": "Tha Takiap",
      "latitude": "13.508",
      "longitude": "101.639",
      "district_id": 176,
      "zip_code": 24160
    },
    {
      "id": 1256,
      "code": 240606,
      "name_in_thai": "ท่าถ่าน",
      "name_in_english": "Tha Than",
      "latitude": "13.760",
      "longitude": "101.383",
      "district_id": 172,
      "zip_code": 24120
    },
    {
      "id": 1345,
      "code": 260105,
      "name_in_thai": "ท่าทราย",
      "name_in_english": "Tha Sai",
      "latitude": "14.174",
      "longitude": "101.111",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 1207,
      "code": 240210,
      "name_in_thai": "ท่าทองหลาง",
      "name_in_english": "Tha Thong Lang",
      "latitude": "13.694",
      "longitude": "101.229",
      "district_id": 168,
      "zip_code": 24110
    },
    {
      "id": 6335,
      "code": 800703,
      "name_in_thai": "ท่าประจะ",
      "name_in_english": "Tha Pracha",
      "latitude": "7.973",
      "longitude": "99.960",
      "district_id": 784,
      "zip_code": 80180
    },
    {
      "id": 6391,
      "code": 801216,
      "name_in_thai": "ท่าพญา",
      "name_in_english": "Tha Phaya",
      "latitude": "8.267",
      "longitude": "100.258",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 1241,
      "code": 240508,
      "name_in_thai": "ท่าพลับ",
      "name_in_english": "Tha Phlap",
      "latitude": "13.616",
      "longitude": "101.075",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 5851,
      "code": 720101,
      "name_in_thai": "ท่าพี่เลี้ยง",
      "name_in_english": "Tha Phi Liang",
      "latitude": "14.471",
      "longitude": "100.116",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 6438,
      "code": 802003,
      "name_in_thai": "ท้ายสำเภา",
      "name_in_english": "Thai Samphao",
      "latitude": "8.302",
      "longitude": "99.909",
      "district_id": 797,
      "zip_code": 80000
    },
    {
      "id": 6370,
      "code": 801101,
      "name_in_thai": "ท่ายาง",
      "name_in_english": "Tha Yang",
      "latitude": "8.305",
      "longitude": "99.346",
      "district_id": 788,
      "zip_code": 80240
    },
    {
      "id": 5854,
      "code": 720104,
      "name_in_thai": "ท่าระหัด",
      "name_in_english": "Tha Rahat",
      "latitude": "14.445",
      "longitude": "100.164",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 1358,
      "code": 260205,
      "name_in_thai": "ท่าเรือ",
      "name_in_english": "Tha Ruea",
      "latitude": "14.085",
      "longitude": "101.235",
      "district_id": 186,
      "zip_code": 26130
    },
    {
      "id": 6297,
      "code": 800122,
      "name_in_thai": "ท่าเรือ",
      "name_in_english": "Tha Ruea",
      "latitude": "8.321",
      "longitude": "100.013",
      "district_id": 778,
      "zip_code": 80290
    },
    {
      "id": 6285,
      "code": 800106,
      "name_in_thai": "ท่าไร่",
      "name_in_english": "Tha Rai",
      "latitude": "8.430",
      "longitude": "100.041",
      "district_id": 778,
      "zip_code": 80000
    },
    {
      "id": 6283,
      "code": 800102,
      "name_in_thai": "ท่าวัง",
      "name_in_english": "Tha Wang",
      "latitude": "8.449",
      "longitude": "99.961",
      "district_id": 778,
      "zip_code": 80000
    },
    {
      "id": 6344,
      "code": 800801,
      "name_in_thai": "ท่าศาลา",
      "name_in_english": "Tha Sala",
      "latitude": "8.669",
      "longitude": "99.926",
      "district_id": 785,
      "zip_code": 80160
    },
    {
      "id": 1223,
      "code": 240402,
      "name_in_thai": "ท่าสะอ้าน",
      "name_in_english": "Tha Sa-An",
      "latitude": "13.553",
      "longitude": "100.995",
      "district_id": 170,
      "zip_code": 24130
    },
    {
      "id": 6334,
      "code": 800702,
      "name_in_thai": "ท่าเสม็ด",
      "name_in_english": "Tha Samet",
      "latitude": "7.949",
      "longitude": "100.017",
      "district_id": 784,
      "zip_code": 80180
    },
    {
      "id": 6362,
      "code": 800909,
      "name_in_thai": "ที่วัง",
      "name_in_english": "Thi Wang",
      "latitude": "8.099",
      "longitude": "99.670",
      "district_id": 786,
      "zip_code": 80110
    },
    {
      "id": 5876,
      "code": 720206,
      "name_in_thai": "ทุ่งคลี",
      "name_in_english": "Thung Khli",
      "latitude": "14.863",
      "longitude": "100.189",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 5930,
      "code": 720712,
      "name_in_thai": "ทุ่งคอก",
      "name_in_english": "Thung Khok",
      "latitude": "14.166",
      "longitude": "99.959",
      "district_id": 745,
      "zip_code": 72190
    },
    {
      "id": 6401,
      "code": 801402,
      "name_in_thai": "ทุ่งปรัง",
      "name_in_english": "Thung Prang",
      "latitude": "8.958",
      "longitude": "99.876",
      "district_id": 791,
      "zip_code": 80120
    },
    {
      "id": 1264,
      "code": 240803,
      "name_in_thai": "ทุ่งพระยา",
      "name_in_english": "Thung Phraya",
      "latitude": "13.687",
      "longitude": "101.745",
      "district_id": 174,
      "zip_code": 24160
    },
    {
      "id": 6433,
      "code": 801904,
      "name_in_thai": "ทุ่งโพธิ์",
      "name_in_english": "Thung Pho",
      "latitude": "8.109",
      "longitude": "99.829",
      "district_id": 796,
      "zip_code": 80130
    },
    {
      "id": 6368,
      "code": 801002,
      "name_in_thai": "ทุ่งสง",
      "name_in_english": "Thung Song",
      "latitude": "8.255",
      "longitude": "99.487",
      "district_id": 787,
      "zip_code": 80220
    },
    {
      "id": 6371,
      "code": 801102,
      "name_in_thai": "ทุ่งสัง",
      "name_in_english": "Thung Sang",
      "latitude": "8.372",
      "longitude": "99.342",
      "district_id": 788,
      "zip_code": 80240
    },
    {
      "id": 6408,
      "code": 801409,
      "name_in_thai": "ทุ่งใส",
      "name_in_english": "Thung Sai",
      "latitude": "9.060",
      "longitude": "99.890",
      "district_id": 791,
      "zip_code": 80120
    },
    {
      "id": 6372,
      "code": 801103,
      "name_in_thai": "ทุ่งใหญ่",
      "name_in_english": "Thung Yai",
      "latitude": "8.366",
      "longitude": "99.429",
      "district_id": 788,
      "zip_code": 80240
    },
    {
      "id": 1240,
      "code": 240507,
      "name_in_thai": "เทพราช",
      "name_in_english": "Theppharat",
      "latitude": "13.641",
      "longitude": "100.982",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 6406,
      "code": 801407,
      "name_in_thai": "เทพราช",
      "name_in_english": "Theppharat",
      "latitude": "8.841",
      "longitude": "99.735",
      "district_id": 791,
      "zip_code": 80340
    },
    {
      "id": 6354,
      "code": 800901,
      "name_in_thai": "เทศบาลเมืองทุ่งสง-ปากแพรก",
      "name_in_english": "Pak Phraek",
      "latitude": "8.168",
      "longitude": "99.689",
      "district_id": 786,
      "zip_code": 80110
    },
    {
      "id": 792,
      "code": 180502,
      "name_in_thai": "เที่ยงแท้",
      "name_in_english": "Thiang Thae",
      "latitude": "15.089",
      "longitude": "100.161",
      "district_id": 114,
      "zip_code": 17140
    },
    {
      "id": 6350,
      "code": 800809,
      "name_in_thai": "ไทยบุรี",
      "name_in_english": "Thai Buri",
      "latitude": "8.665",
      "longitude": "99.879",
      "district_id": 785,
      "zip_code": 80160
    },
    {
      "id": 767,
      "code": 180107,
      "name_in_thai": "ธรรมามูล",
      "name_in_english": "Thammamun",
      "latitude": "15.264",
      "longitude": "100.133",
      "district_id": 110,
      "zip_code": 17000
    },
    {
      "id": 1341,
      "code": 260101,
      "name_in_thai": "นครนายก",
      "name_in_english": "Nakhon Nayok",
      "latitude": "14.198",
      "longitude": "101.233",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 6440,
      "code": 802101,
      "name_in_thai": "นบพิตำ",
      "name_in_english": "Nopphitam",
      "latitude": "8.744",
      "longitude": "99.772",
      "district_id": 798,
      "zip_code": 80160
    },
    {
      "id": 6313,
      "code": 800407,
      "name_in_thai": "นากะชะ",
      "name_in_english": "Na Kacha",
      "latitude": "8.415",
      "longitude": "99.476",
      "district_id": 781,
      "zip_code": 80150
    },
    {
      "id": 6316,
      "code": 800415,
      "name_in_thai": "นาเขลียง",
      "name_in_english": "Na Khliang",
      "latitude": "8.533",
      "longitude": "99.500",
      "district_id": 781,
      "zip_code": 80260
    },
    {
      "id": 6291,
      "code": 800115,
      "name_in_thai": "นาเคียน",
      "name_in_english": "Na Khian",
      "latitude": "8.452",
      "longitude": "99.919",
      "district_id": 778,
      "zip_code": 80000
    },
    {
      "id": 5873,
      "code": 720203,
      "name_in_thai": "นางบวช",
      "name_in_english": "Nang Buat",
      "latitude": "14.811",
      "longitude": "100.120",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 769,
      "code": 180109,
      "name_in_thai": "นางลือ",
      "name_in_english": "Nang Lue",
      "latitude": "15.122",
      "longitude": "100.082",
      "district_id": 110,
      "zip_code": 17000
    },
    {
      "id": 6343,
      "code": 800711,
      "name_in_thai": "นางหลง",
      "name_in_english": "Nang Long",
      "latitude": "7.901",
      "longitude": "99.988",
      "district_id": 784,
      "zip_code": 80180
    },
    {
      "id": 6287,
      "code": 800108,
      "name_in_thai": "นาทราย",
      "name_in_english": "NULL",
      "latitude": "8.479",
      "longitude": "99.932",
      "district_id": 778,
      "zip_code": 80280
    },
    {
      "id": 6367,
      "code": 801001,
      "name_in_thai": "นาบอน",
      "name_in_english": "Na Bon",
      "latitude": "8.243",
      "longitude": "99.600",
      "district_id": 787,
      "zip_code": 80220
    },
    {
      "id": 6436,
      "code": 802001,
      "name_in_thai": "นาพรุ",
      "name_in_english": "Na Phru",
      "latitude": "8.331",
      "longitude": "99.907",
      "district_id": 797,
      "zip_code": 80000
    },
    {
      "id": 6365,
      "code": 800912,
      "name_in_thai": "นาโพธิ์",
      "name_in_english": "Na Pho",
      "latitude": "8.209",
      "longitude": "99.574",
      "district_id": 786,
      "zip_code": 80110
    },
    {
      "id": 6358,
      "code": 800905,
      "name_in_thai": "นาไม้ไผ่",
      "name_in_english": "Na Mai Phai",
      "latitude": "8.119",
      "longitude": "99.590",
      "district_id": 786,
      "zip_code": 80110
    },
    {
      "id": 6302,
      "code": 800205,
      "name_in_thai": "นาเรียง",
      "name_in_english": "Na Riang",
      "latitude": "8.504",
      "longitude": "99.866",
      "district_id": 779,
      "zip_code": 80320
    },
    {
      "id": 6310,
      "code": 800404,
      "name_in_thai": "นาแว",
      "name_in_english": "Na Wae",
      "latitude": "8.483",
      "longitude": "99.523",
      "district_id": 781,
      "zip_code": 80260
    },
    {
      "id": 6437,
      "code": 802002,
      "name_in_thai": "นาสาร",
      "name_in_english": "Na San",
      "latitude": "8.370",
      "longitude": "99.920",
      "district_id": 797,
      "zip_code": 80000
    },
    {
      "id": 6434,
      "code": 801905,
      "name_in_thai": "นาหมอบุญ",
      "name_in_english": "Na Mo Bun",
      "latitude": "8.030",
      "longitude": "99.813",
      "district_id": 796,
      "zip_code": 80130
    },
    {
      "id": 6359,
      "code": 800906,
      "name_in_thai": "นาหลวงเสน",
      "name_in_english": "Na Luang Sen",
      "latitude": "8.240",
      "longitude": "99.705",
      "district_id": 786,
      "zip_code": 80110
    },
    {
      "id": 1360,
      "code": 260207,
      "name_in_thai": "นาหินลาด",
      "name_in_english": "Na Hin Lat",
      "latitude": "14.317",
      "longitude": "101.457",
      "district_id": 186,
      "zip_code": 26130
    },
    {
      "id": 6443,
      "code": 802104,
      "name_in_thai": "นาเหรง",
      "name_in_english": "Na Reng",
      "latitude": "8.660",
      "longitude": "99.745",
      "district_id": 798,
      "zip_code": 80160
    },
    {
      "id": 6363,
      "code": 800910,
      "name_in_thai": "น้ำตก",
      "name_in_english": "Namtok",
      "latitude": "7.971",
      "longitude": "99.780",
      "district_id": 786,
      "zip_code": 80110
    },
    {
      "id": 5889,
      "code": 720306,
      "name_in_thai": "นิคมกระเสียว",
      "name_in_english": "Nikhom Krasiao",
      "latitude": "14.844",
      "longitude": "99.548",
      "district_id": 741,
      "zip_code": 72180
    },
    {
      "id": 811,
      "code": 180801,
      "name_in_thai": "เนินขาม",
      "name_in_english": "Noen Kham",
      "latitude": "14.957",
      "longitude": "99.901",
      "district_id": 117,
      "zip_code": 17130
    },
    {
      "id": 5926,
      "code": 720708,
      "name_in_thai": "เนินพระปรางค์",
      "name_in_english": "Noen Phraprang",
      "latitude": "14.194",
      "longitude": "100.048",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 761,
      "code": 180101,
      "name_in_thai": "ในเมือง",
      "name_in_english": "Nai Mueang",
      "latitude": "15.181",
      "longitude": "100.127",
      "district_id": 110,
      "zip_code": 17000
    },
    {
      "id": 6282,
      "code": 800101,
      "name_in_thai": "ในเมือง",
      "name_in_english": "Nai Mueang",
      "latitude": "8.408",
      "longitude": "99.972",
      "district_id": 778,
      "zip_code": 80000
    },
    {
      "id": 5880,
      "code": 720210,
      "name_in_thai": "บ่อกรุ",
      "name_in_english": "Bo Kru",
      "latitude": "14.893",
      "longitude": "99.905",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 782,
      "code": 180307,
      "name_in_thai": "บ่อแร่",
      "name_in_english": "Bo Rae",
      "latitude": "15.283",
      "longitude": "99.958",
      "district_id": 112,
      "zip_code": 17120
    },
    {
      "id": 5932,
      "code": 720714,
      "name_in_thai": "บ่อสุพรรณ",
      "name_in_english": "Bo Suphan",
      "latitude": "14.130",
      "longitude": "99.849",
      "district_id": 745,
      "zip_code": 72190
    },
    {
      "id": 1205,
      "code": 240208,
      "name_in_thai": "บางกระเจ็ด",
      "name_in_english": "Bang Krachet",
      "latitude": "13.852",
      "longitude": "101.208",
      "district_id": 168,
      "zip_code": 24110
    },
    {
      "id": 1197,
      "code": 240114,
      "name_in_thai": "บางกระไห",
      "name_in_english": "Bang Kahai",
      "latitude": "13.670",
      "longitude": "101.002",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 1245,
      "code": 240512,
      "name_in_thai": "บางกรูด",
      "name_in_english": "Bang Krut",
      "latitude": "13.633",
      "longitude": "101.078",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 5865,
      "code": 720115,
      "name_in_thai": "บางกุ้ง",
      "name_in_english": "Bang Kung",
      "latitude": "14.457",
      "longitude": "100.003",
      "district_id": 739,
      "zip_code": 72210
    },
    {
      "id": 1227,
      "code": 240406,
      "name_in_thai": "บางเกลือ",
      "name_in_english": "Bang Kluea",
      "latitude": "13.526",
      "longitude": "100.919",
      "district_id": 170,
      "zip_code": 24180
    },
    {
      "id": 1191,
      "code": 240108,
      "name_in_thai": "บางแก้ว",
      "name_in_english": "Bang Kaeo",
      "latitude": "13.765",
      "longitude": "101.094",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 1213,
      "code": 240302,
      "name_in_thai": "บางขนาก",
      "name_in_english": "Bang Khanak",
      "latitude": "13.858",
      "longitude": "101.115",
      "district_id": 169,
      "zip_code": 24150
    },
    {
      "id": 1192,
      "code": 240109,
      "name_in_thai": "บางขวัญ",
      "name_in_english": "Bang Khwan",
      "latitude": "13.780",
      "longitude": "101.054",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 6423,
      "code": 801701,
      "name_in_thai": "บางขัน",
      "name_in_english": "Bang Khan",
      "latitude": "8.069",
      "longitude": "99.422",
      "district_id": 794,
      "zip_code": 80360
    },
    {
      "id": 795,
      "code": 180505,
      "name_in_thai": "บางขุด",
      "name_in_english": "Bang Khut",
      "latitude": "14.991",
      "longitude": "100.194",
      "district_id": 114,
      "zip_code": 17140
    },
    {
      "id": 1203,
      "code": 240201,
      "name_in_thai": "บางคล้า",
      "name_in_english": "Bang Khla",
      "latitude": "13.722",
      "longitude": "101.210",
      "district_id": 168,
      "zip_code": 24110
    },
    {
      "id": 1259,
      "code": 240701,
      "name_in_thai": "บางคา",
      "name_in_english": "Bang Kha",
      "latitude": "13.788",
      "longitude": "101.278",
      "district_id": 173,
      "zip_code": 24120
    },
    {
      "id": 5908,
      "code": 720504,
      "name_in_thai": "บางงาม",
      "name_in_english": "Bang Ngam",
      "latitude": "14.601",
      "longitude": "100.097",
      "district_id": 743,
      "zip_code": 72140
    },
    {
      "id": 6294,
      "code": 800119,
      "name_in_thai": "บางจาก",
      "name_in_english": "Bang Chak",
      "latitude": "8.376",
      "longitude": "100.061",
      "district_id": 778,
      "zip_code": 80330
    },
    {
      "id": 1244,
      "code": 240511,
      "name_in_thai": "บางซ่อน",
      "name_in_english": "Bang Son",
      "latitude": "13.558",
      "longitude": "101.058",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 1276,
      "code": 241105,
      "name_in_thai": "บางตลาด",
      "name_in_english": "Bang Talat",
      "latitude": "13.736",
      "longitude": "101.165",
      "district_id": 177,
      "zip_code": 24110
    },
    {
      "id": 5922,
      "code": 720704,
      "name_in_thai": "บางตะเคียน",
      "name_in_english": "Bang Takhian",
      "latitude": "14.213",
      "longitude": "100.103",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 6388,
      "code": 801213,
      "name_in_thai": "บางตะพง",
      "name_in_english": "Bang Taphong",
      "latitude": "8.232",
      "longitude": "100.153",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 5921,
      "code": 720703,
      "name_in_thai": "บางตาเถร",
      "name_in_english": "Bang Ta Then",
      "latitude": "14.199",
      "longitude": "100.174",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 1188,
      "code": 240105,
      "name_in_thai": "บางตีนเป็ด",
      "name_in_english": "Bang Tin Pet",
      "latitude": "13.661",
      "longitude": "101.075",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 1202,
      "code": 240119,
      "name_in_thai": "บางเตย",
      "name_in_english": "Bang Toei",
      "latitude": "13.706",
      "longitude": "100.993",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 6418,
      "code": 801607,
      "name_in_thai": "บางนบ",
      "name_in_english": "Bang Nop",
      "latitude": "8.104",
      "longitude": "100.261",
      "district_id": 793,
      "zip_code": 80170
    },
    {
      "id": 1212,
      "code": 240301,
      "name_in_thai": "บางน้ำเปรี้ยว",
      "name_in_english": "Bang Nam Priao",
      "latitude": "13.829",
      "longitude": "101.002",
      "district_id": 169,
      "zip_code": 24150
    },
    {
      "id": 1377,
      "code": 260407,
      "name_in_thai": "บางปลากด",
      "name_in_english": "Bang Pla Kot",
      "latitude": "14.166",
      "longitude": "100.971",
      "district_id": 188,
      "zip_code": 26120
    },
    {
      "id": 5892,
      "code": 720402,
      "name_in_thai": "บางปลาม้า",
      "name_in_english": "Bang Pla Ma",
      "latitude": "14.402",
      "longitude": "100.102",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 1222,
      "code": 240401,
      "name_in_thai": "บางปะกง",
      "name_in_english": "Bang Pakong",
      "latitude": "13.496",
      "longitude": "100.966",
      "district_id": 170,
      "zip_code": 24130
    },
    {
      "id": 1226,
      "code": 240405,
      "name_in_thai": "บางผึ้ง",
      "name_in_english": "Bang Phueng",
      "latitude": "13.527",
      "longitude": "101.054",
      "district_id": 170,
      "zip_code": 24130
    },
    {
      "id": 1189,
      "code": 240106,
      "name_in_thai": "บางไผ่",
      "name_in_english": "Bang Phai",
      "latitude": "13.692",
      "longitude": "101.102",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 6387,
      "code": 801212,
      "name_in_thai": "บางพระ",
      "name_in_english": "Bang Phra",
      "latitude": "8.326",
      "longitude": "100.230",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 1196,
      "code": 240113,
      "name_in_thai": "บางพระ",
      "name_in_english": "Bang Phra",
      "latitude": "13.653",
      "longitude": "101.020",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 5925,
      "code": 720707,
      "name_in_thai": "บางพลับ",
      "name_in_english": "Bang Phlap",
      "latitude": "14.252",
      "longitude": "100.046",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 6375,
      "code": 801106,
      "name_in_thai": "บางรูป",
      "name_in_english": "Bang Rup",
      "latitude": "8.400",
      "longitude": "99.279",
      "district_id": 788,
      "zip_code": 80240
    },
    {
      "id": 1275,
      "code": 241104,
      "name_in_thai": "บางโรง",
      "name_in_english": "Bang Rong",
      "latitude": "13.824",
      "longitude": "101.137",
      "district_id": 177,
      "zip_code": 24000
    },
    {
      "id": 1378,
      "code": 260408,
      "name_in_thai": "บางลูกเสือ",
      "name_in_english": "Bang Luk Suea",
      "latitude": "14.054",
      "longitude": "101.066",
      "district_id": 188,
      "zip_code": 26120
    },
    {
      "id": 5920,
      "code": 720702,
      "name_in_thai": "บางเลน",
      "name_in_english": "Bang Len",
      "latitude": "14.169",
      "longitude": "100.085",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 1274,
      "code": 241103,
      "name_in_thai": "บางเล่า",
      "name_in_english": "Bang Lao",
      "latitude": "13.721",
      "longitude": "101.150",
      "district_id": 177,
      "zip_code": 24000
    },
    {
      "id": 1224,
      "code": 240403,
      "name_in_thai": "บางวัว",
      "name_in_english": "Bang Wua",
      "latitude": "13.569",
      "longitude": "100.964",
      "district_id": 170,
      "zip_code": 24180
    },
    {
      "id": 6386,
      "code": 801211,
      "name_in_thai": "บางศาลา",
      "name_in_english": "Bang Sala",
      "latitude": "8.246",
      "longitude": "100.185",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 1375,
      "code": 260405,
      "name_in_thai": "บางสมบูรณ์",
      "name_in_english": "Bang Sombun",
      "latitude": "14.021",
      "longitude": "101.112",
      "district_id": 188,
      "zip_code": 26120
    },
    {
      "id": 1225,
      "code": 240404,
      "name_in_thai": "บางสมัคร",
      "name_in_english": "Bang Samak",
      "latitude": "13.575",
      "longitude": "100.936",
      "district_id": 170,
      "zip_code": 24180
    },
    {
      "id": 1204,
      "code": 240204,
      "name_in_thai": "บางสวน",
      "name_in_english": "Bang Suan",
      "latitude": "13.696",
      "longitude": "101.177",
      "district_id": 168,
      "zip_code": 24110
    },
    {
      "id": 789,
      "code": 180406,
      "name_in_thai": "บางหลวง",
      "name_in_english": "Bang Luang",
      "latitude": "15.143",
      "longitude": "100.197",
      "district_id": 113,
      "zip_code": 17150
    },
    {
      "id": 5894,
      "code": 720404,
      "name_in_thai": "บางใหญ่",
      "name_in_english": "Bang Yai",
      "latitude": "14.300",
      "longitude": "100.102",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 1366,
      "code": 260306,
      "name_in_thai": "บางอ้อ",
      "name_in_english": "Bang O",
      "latitude": "14.176",
      "longitude": "101.069",
      "district_id": 187,
      "zip_code": 26110
    },
    {
      "id": 5906,
      "code": 720502,
      "name_in_thai": "บ้านกร่าง",
      "name_in_english": "Ban Krang",
      "latitude": "14.638",
      "longitude": "100.104",
      "district_id": 743,
      "zip_code": 72140
    },
    {
      "id": 762,
      "code": 180102,
      "name_in_thai": "บ้านกล้วย",
      "name_in_english": "Ban Kluai",
      "latitude": "15.182",
      "longitude": "100.153",
      "district_id": 110,
      "zip_code": 17000
    },
    {
      "id": 6325,
      "code": 800604,
      "name_in_thai": "บ้านกลาง",
      "name_in_english": "Ban Klang",
      "latitude": "8.156",
      "longitude": "100.197",
      "district_id": 783,
      "zip_code": 80190
    },
    {
      "id": 5923,
      "code": 720705,
      "name_in_thai": "บ้านกุ่ม",
      "name_in_english": "Ban Kum",
      "latitude": "14.260",
      "longitude": "100.114",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 6299,
      "code": 800202,
      "name_in_thai": "บ้านเกาะ",
      "name_in_english": "Ban Ko",
      "latitude": "8.539",
      "longitude": "99.814",
      "district_id": 779,
      "zip_code": 80320
    },
    {
      "id": 5950,
      "code": 720910,
      "name_in_thai": "บ้านโข้ง",
      "name_in_english": "Ban Khong",
      "latitude": "14.578",
      "longitude": "99.864",
      "district_id": 747,
      "zip_code": 72160
    },
    {
      "id": 6430,
      "code": 801901,
      "name_in_thai": "บ้านควนมุด",
      "name_in_english": "Ban Khuan Mut",
      "latitude": "8.028",
      "longitude": "99.924",
      "district_id": 796,
      "zip_code": 80180
    },
    {
      "id": 6431,
      "code": 801902,
      "name_in_thai": "บ้านชะอวด",
      "name_in_english": "Ban Cha-Uat",
      "latitude": "8.058",
      "longitude": "99.933",
      "district_id": 796,
      "zip_code": 80180
    },
    {
      "id": 5927,
      "code": 720709,
      "name_in_thai": "บ้านช้าง",
      "name_in_english": "Ban Chang",
      "latitude": "14.234",
      "longitude": "100.206",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 800,
      "code": 180602,
      "name_in_thai": "บ้านเชี่ยน",
      "name_in_english": "Ban Chian",
      "latitude": "14.942",
      "longitude": "99.997",
      "district_id": 115,
      "zip_code": 17130
    },
    {
      "id": 1252,
      "code": 240602,
      "name_in_thai": "บ้านซ่อง",
      "name_in_english": "Ban Song",
      "latitude": "13.803",
      "longitude": "101.403",
      "district_id": 172,
      "zip_code": 24120
    },
    {
      "id": 5944,
      "code": 720904,
      "name_in_thai": "บ้านดอน",
      "name_in_english": "Ban Don",
      "latitude": "14.303",
      "longitude": "99.923",
      "district_id": 747,
      "zip_code": 72160
    },
    {
      "id": 6338,
      "code": 800706,
      "name_in_thai": "บ้านตูล",
      "name_in_english": "Ban Tun",
      "latitude": "8.070",
      "longitude": "100.000",
      "district_id": 784,
      "zip_code": 80180
    },
    {
      "id": 1361,
      "code": 260301,
      "name_in_thai": "บ้านนา",
      "name_in_english": "Ban Na",
      "latitude": "14.262",
      "longitude": "101.059",
      "district_id": 187,
      "zip_code": 26110
    },
    {
      "id": 6426,
      "code": 801704,
      "name_in_thai": "บ้านนิคม",
      "name_in_english": "Ban Nikhom",
      "latitude": "7.933",
      "longitude": "99.507",
      "district_id": 794,
      "zip_code": 80360
    },
    {
      "id": 6326,
      "code": 800605,
      "name_in_thai": "บ้านเนิน",
      "name_in_english": "Ban Noen",
      "latitude": "8.166",
      "longitude": "100.170",
      "district_id": 783,
      "zip_code": 80190
    },
    {
      "id": 1362,
      "code": 260302,
      "name_in_thai": "บ้านพร้าว",
      "name_in_english": "Ban Phrao",
      "latitude": "14.222",
      "longitude": "101.101",
      "district_id": 187,
      "zip_code": 26110
    },
    {
      "id": 1363,
      "code": 260303,
      "name_in_thai": "บ้านพริก",
      "name_in_english": "Ban Phrik",
      "latitude": "14.252",
      "longitude": "100.976",
      "district_id": 187,
      "zip_code": 26110
    },
    {
      "id": 6390,
      "code": 801215,
      "name_in_thai": "บ้านเพิง",
      "name_in_english": "Ban Phoeng",
      "latitude": "8.294",
      "longitude": "100.227",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 1234,
      "code": 240501,
      "name_in_thai": "บ้านโพธิ์",
      "name_in_english": "Ban Pho",
      "latitude": "13.588",
      "longitude": "101.086",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 5862,
      "code": 720112,
      "name_in_thai": "บ้านโพธิ์",
      "name_in_english": "Ban Pho",
      "latitude": "14.524",
      "longitude": "100.071",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 6417,
      "code": 801606,
      "name_in_thai": "บ้านราม",
      "name_in_english": "Ban Ram",
      "latitude": "8.081",
      "longitude": "100.257",
      "district_id": 793,
      "zip_code": 80170
    },
    {
      "id": 6424,
      "code": 801702,
      "name_in_thai": "บ้านลำนาว",
      "name_in_english": "Ban Lamnao",
      "latitude": "7.968",
      "longitude": "99.417",
      "district_id": 794,
      "zip_code": 80360
    },
    {
      "id": 5938,
      "code": 720805,
      "name_in_thai": "บ้านสระ",
      "name_in_english": "Ban Sa",
      "latitude": "14.708",
      "longitude": "100.041",
      "district_id": 746,
      "zip_code": 72130
    },
    {
      "id": 5900,
      "code": 720410,
      "name_in_thai": "บ้านแหลม",
      "name_in_english": "Ban Laem",
      "latitude": "14.346",
      "longitude": "100.140",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 1343,
      "code": 260103,
      "name_in_thai": "บ้านใหญ่",
      "name_in_english": "Ban Yai",
      "latitude": "14.221",
      "longitude": "101.225",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 6382,
      "code": 801207,
      "name_in_thai": "บ้านใหม่",
      "name_in_english": "Ban Mai",
      "latitude": "8.277",
      "longitude": "100.154",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 1186,
      "code": 240103,
      "name_in_thai": "บ้านใหม่",
      "name_in_english": "Ban Mai",
      "latitude": "13.707",
      "longitude": "101.100",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 1216,
      "code": 240305,
      "name_in_thai": "บึงน้ำรักษ์",
      "name_in_english": "Bueng Nam Rak",
      "latitude": "13.908",
      "longitude": "100.926",
      "district_id": 169,
      "zip_code": 24170
    },
    {
      "id": 1372,
      "code": 260402,
      "name_in_thai": "บึงศาล",
      "name_in_english": "Bueng San",
      "latitude": "14.052",
      "longitude": "100.938",
      "district_id": 188,
      "zip_code": 26120
    },
    {
      "id": 6374,
      "code": 801105,
      "name_in_thai": "ปริก",
      "name_in_english": "Prik",
      "latitude": "8.280",
      "longitude": "99.432",
      "district_id": 788,
      "zip_code": 80240
    },
    {
      "id": 5910,
      "code": 720506,
      "name_in_thai": "ปลายนา",
      "name_in_english": "Plai Na",
      "latitude": "14.660",
      "longitude": "100.200",
      "district_id": 743,
      "zip_code": 72140
    },
    {
      "id": 6286,
      "code": 800107,
      "name_in_thai": "ปากนคร",
      "name_in_english": "Pak Nakhon",
      "latitude": "8.421",
      "longitude": "99.996",
      "district_id": 778,
      "zip_code": 80000
    },
    {
      "id": 5875,
      "code": 720205,
      "name_in_thai": "ปากน้ำ",
      "name_in_english": "Pak Nam",
      "latitude": "14.931",
      "longitude": "100.087",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 1206,
      "code": 240209,
      "name_in_thai": "ปากน้ำ",
      "name_in_english": "Pak Nam",
      "latitude": "13.753",
      "longitude": "101.212",
      "district_id": 168,
      "zip_code": 24110
    },
    {
      "id": 6385,
      "code": 801210,
      "name_in_thai": "ปากพนังฝั่งตะวันตก",
      "name_in_english": "Pak Phanang Fang Tawan Tok",
      "latitude": "8.360",
      "longitude": "100.165",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 6389,
      "code": 801214,
      "name_in_thai": "ปากพนังฝั่งตะวันออก",
      "name_in_english": "Pak Phanang Fang Tawan Ok",
      "latitude": "8.397",
      "longitude": "100.200",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 1356,
      "code": 260203,
      "name_in_thai": "ปากพลี",
      "name_in_english": "Pak Phli",
      "latitude": "14.132",
      "longitude": "101.263",
      "district_id": 186,
      "zip_code": 26130
    },
    {
      "id": 6295,
      "code": 800120,
      "name_in_thai": "ปากพูน",
      "name_in_english": "Pak Phun",
      "latitude": "8.529",
      "longitude": "99.997",
      "district_id": 778,
      "zip_code": 80000
    },
    {
      "id": 6392,
      "code": 801217,
      "name_in_thai": "ปากแพรก",
      "name_in_english": "Pak Phraek",
      "latitude": "8.244",
      "longitude": "100.212",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 1368,
      "code": 260308,
      "name_in_thai": "ป่าขะ",
      "name_in_english": "Pa Kha",
      "latitude": "14.297",
      "longitude": "101.065",
      "district_id": 187,
      "zip_code": 26110
    },
    {
      "id": 6378,
      "code": 801203,
      "name_in_thai": "ป่าระกำ",
      "name_in_english": "Pa Rakam",
      "latitude": "8.244",
      "longitude": "100.120",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 6404,
      "code": 801405,
      "name_in_thai": "เปลี่ยน",
      "name_in_english": "Plian",
      "latitude": "8.833",
      "longitude": "99.870",
      "district_id": 791,
      "zip_code": 80120
    },
    {
      "id": 1266,
      "code": 240901,
      "name_in_thai": "แปลงยาว",
      "name_in_english": "Plaeng Yao",
      "latitude": "13.599",
      "longitude": "101.293",
      "district_id": 175,
      "zip_code": 24190
    },
    {
      "id": 5897,
      "code": 720407,
      "name_in_thai": "ไผ่กองดิน",
      "name_in_english": "Phai Kong Din",
      "latitude": "14.340",
      "longitude": "100.264",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 5855,
      "code": 720105,
      "name_in_thai": "ไผ่ขวาง",
      "name_in_english": "Phai Khwang",
      "latitude": "14.470",
      "longitude": "100.165",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 1253,
      "code": 240603,
      "name_in_thai": "พนมสารคาม",
      "name_in_english": "Phanom Sarakham",
      "latitude": "13.771",
      "longitude": "101.324",
      "district_id": 172,
      "zip_code": 24120
    },
    {
      "id": 1353,
      "code": 260113,
      "name_in_thai": "พรหมณี",
      "name_in_english": "Phrommani",
      "latitude": "14.264",
      "longitude": "101.164",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 6298,
      "code": 800201,
      "name_in_thai": "พรหมโลก",
      "name_in_english": "Phrom Lok",
      "latitude": "8.500",
      "longitude": "99.793",
      "district_id": 779,
      "zip_code": 80320
    },
    {
      "id": 1371,
      "code": 260401,
      "name_in_thai": "พระอาจารย์",
      "name_in_english": "NULL",
      "latitude": "13.986",
      "longitude": "101.020",
      "district_id": 188,
      "zip_code": 26120
    },
    {
      "id": 5949,
      "code": 720909,
      "name_in_thai": "พลับพลาไชย",
      "name_in_english": "Phlapphla Chai",
      "latitude": "14.517",
      "longitude": "99.887",
      "district_id": 747,
      "zip_code": 72160
    },
    {
      "id": 1367,
      "code": 260307,
      "name_in_thai": "พิกุลออก",
      "name_in_english": "Phikun Ok",
      "latitude": "14.244",
      "longitude": "101.027",
      "district_id": 187,
      "zip_code": 26110
    },
    {
      "id": 6318,
      "code": 800501,
      "name_in_thai": "พิปูน",
      "name_in_english": "Phipun",
      "latitude": "8.555",
      "longitude": "99.653",
      "district_id": 782,
      "zip_code": 80270
    },
    {
      "id": 1230,
      "code": 240409,
      "name_in_thai": "พิมพา",
      "name_in_english": "Phimpha",
      "latitude": "13.599",
      "longitude": "100.937",
      "district_id": 170,
      "zip_code": 24130
    },
    {
      "id": 5859,
      "code": 720109,
      "name_in_thai": "พิหารแดง",
      "name_in_english": "Phihan Daeng",
      "latitude": "14.506",
      "longitude": "100.107",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 791,
      "code": 180501,
      "name_in_thai": "แพรกศรีราชา",
      "name_in_english": "Phraek Si Racha",
      "latitude": "15.062",
      "longitude": "100.107",
      "district_id": 114,
      "zip_code": 17140
    },
    {
      "id": 794,
      "code": 180504,
      "name_in_thai": "โพงาม",
      "name_in_english": "Pho Ngam",
      "latitude": "14.995",
      "longitude": "100.249",
      "district_id": 114,
      "zip_code": 17140
    },
    {
      "id": 6353,
      "code": 800813,
      "name_in_thai": "โพธิ์ทอง",
      "name_in_english": "Pho Thong",
      "latitude": "8.613",
      "longitude": "99.923",
      "district_id": 785,
      "zip_code": 80160
    },
    {
      "id": 1374,
      "code": 260404,
      "name_in_thai": "โพธิ์แทน",
      "name_in_english": "Pho Thaen",
      "latitude": "14.208",
      "longitude": "100.949",
      "district_id": 188,
      "zip_code": 26120
    },
    {
      "id": 5869,
      "code": 720119,
      "name_in_thai": "โพธิ์พระยา",
      "name_in_english": "Pho Phraya",
      "latitude": "14.531",
      "longitude": "100.116",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 6293,
      "code": 800118,
      "name_in_thai": "โพธิ์เสด็จ",
      "name_in_english": "Pho Sadet",
      "latitude": "8.428",
      "longitude": "99.920",
      "district_id": 778,
      "zip_code": 80000
    },
    {
      "id": 787,
      "code": 180404,
      "name_in_thai": "โพนางดำตก",
      "name_in_english": "Pho Nang Dam Tok",
      "latitude": "15.084",
      "longitude": "100.272",
      "district_id": 113,
      "zip_code": 17150
    },
    {
      "id": 788,
      "code": 180405,
      "name_in_thai": "โพนางดำออก",
      "name_in_english": "Pho Nang Dam Ok",
      "latitude": "15.120",
      "longitude": "100.283",
      "district_id": 113,
      "zip_code": 17150
    },
    {
      "id": 1221,
      "code": 240310,
      "name_in_thai": "โพรงอากาศ",
      "name_in_english": "Phrong Akat",
      "latitude": "13.827",
      "longitude": "101.062",
      "district_id": 169,
      "zip_code": 24150
    },
    {
      "id": 801,
      "code": 180605,
      "name_in_thai": "ไพรนกยูง",
      "name_in_english": "Phrai Nok Yung",
      "latitude": "15.081",
      "longitude": "99.856",
      "district_id": 115,
      "zip_code": 17130
    },
    {
      "id": 5907,
      "code": 720503,
      "name_in_thai": "มดแดง",
      "name_in_english": "Mot Daeng",
      "latitude": "14.570",
      "longitude": "100.119",
      "district_id": 743,
      "zip_code": 72140
    },
    {
      "id": 778,
      "code": 180302,
      "name_in_thai": "มะขามเฒ่า",
      "name_in_english": "Makham Thao",
      "latitude": "15.227",
      "longitude": "100.040",
      "district_id": 112,
      "zip_code": 17120
    },
    {
      "id": 5901,
      "code": 720411,
      "name_in_thai": "มะขามล้ม",
      "name_in_english": "Makham Lom",
      "latitude": "14.370",
      "longitude": "100.043",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 6290,
      "code": 800114,
      "name_in_thai": "มะม่วงสองต้น",
      "name_in_english": "Mamuang Song Ton",
      "latitude": "8.397",
      "longitude": "99.952",
      "district_id": 778,
      "zip_code": 80000
    },
    {
      "id": 1254,
      "code": 240604,
      "name_in_thai": "เมืองเก่า",
      "name_in_english": "Mueang Kao",
      "latitude": "13.728",
      "longitude": "101.319",
      "district_id": 172,
      "zip_code": 24120
    },
    {
      "id": 1260,
      "code": 240702,
      "name_in_thai": "เมืองใหม่",
      "name_in_english": "Mueang Mai",
      "latitude": "13.715",
      "longitude": "101.278",
      "district_id": 173,
      "zip_code": 24120
    },
    {
      "id": 6332,
      "code": 800613,
      "name_in_thai": "แม่เจ้าอยู่หัว",
      "name_in_english": "Mae Chao Yu Hua",
      "latitude": "8.075",
      "longitude": "100.094",
      "district_id": 783,
      "zip_code": 80190
    },
    {
      "id": 6349,
      "code": 800807,
      "name_in_thai": "โมคลาน",
      "name_in_english": "Mo Khlan",
      "latitude": "8.589",
      "longitude": "99.885",
      "district_id": 785,
      "zip_code": 80160
    },
    {
      "id": 6311,
      "code": 800405,
      "name_in_thai": "ไม้เรียง",
      "name_in_english": "Mai Riang",
      "latitude": "8.457",
      "longitude": "99.477",
      "district_id": 781,
      "zip_code": 80150
    },
    {
      "id": 6321,
      "code": 800504,
      "name_in_thai": "ยางค้อม",
      "name_in_english": "Yang Khom",
      "latitude": "8.520",
      "longitude": "99.701",
      "district_id": 782,
      "zip_code": 80270
    },
    {
      "id": 5882,
      "code": 720213,
      "name_in_thai": "ยางนอน",
      "name_in_english": "Yang Non",
      "latitude": "14.857",
      "longitude": "100.132",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 5934,
      "code": 720801,
      "name_in_thai": "ย่านยาว",
      "name_in_english": "Yan Yao",
      "latitude": "14.710",
      "longitude": "100.112",
      "district_id": 746,
      "zip_code": 72130
    },
    {
      "id": 5945,
      "code": 720905,
      "name_in_thai": "ยุ้งทะลาย",
      "name_in_english": "Yung Thalai",
      "latitude": "14.322",
      "longitude": "99.898",
      "district_id": 747,
      "zip_code": 72160
    },
    {
      "id": 1218,
      "code": 240307,
      "name_in_thai": "โยธะกา",
      "name_in_english": "Yothaka",
      "latitude": "13.925",
      "longitude": "101.128",
      "district_id": 169,
      "zip_code": 24150
    },
    {
      "id": 6394,
      "code": 801301,
      "name_in_thai": "ร่อนพิบูลย์",
      "name_in_english": "Ron Phibun",
      "latitude": "8.189",
      "longitude": "99.832",
      "district_id": 790,
      "zip_code": 80130
    },
    {
      "id": 5852,
      "code": 720102,
      "name_in_thai": "รั้วใหญ่",
      "name_in_english": "Rua Yai",
      "latitude": "14.451",
      "longitude": "100.113",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 6421,
      "code": 801610,
      "name_in_thai": "รามแก้ว",
      "name_in_english": "Ram Kaeo",
      "latitude": "7.932",
      "longitude": "100.276",
      "district_id": 793,
      "zip_code": 80170
    },
    {
      "id": 775,
      "code": 180206,
      "name_in_thai": "ไร่พัฒนา",
      "name_in_english": "Rai Phatthana",
      "latitude": "15.333",
      "longitude": "100.225",
      "district_id": 111,
      "zip_code": 17170
    },
    {
      "id": 5916,
      "code": 720603,
      "name_in_thai": "ไร่รถ",
      "name_in_english": "Rai Rot",
      "latitude": "14.603",
      "longitude": "99.955",
      "district_id": 744,
      "zip_code": 72170
    },
    {
      "id": 6309,
      "code": 800403,
      "name_in_thai": "ละอาย",
      "name_in_english": "La-Ai",
      "latitude": "8.472",
      "longitude": "99.632",
      "district_id": 781,
      "zip_code": 80250
    },
    {
      "id": 1265,
      "code": 240805,
      "name_in_thai": "ลาดกระทิง",
      "name_in_english": "Lat Krathing",
      "latitude": "13.548",
      "longitude": "101.475",
      "district_id": 174,
      "zip_code": 24160
    },
    {
      "id": 1247,
      "code": 240514,
      "name_in_thai": "ลาดขวาง",
      "name_in_english": "Lat Khwang",
      "latitude": "13.605",
      "longitude": "101.023",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 6304,
      "code": 800302,
      "name_in_thai": "ลานสกา",
      "name_in_english": "Lan Saka",
      "latitude": "8.305",
      "longitude": "99.771",
      "district_id": 780,
      "zip_code": 80230
    },
    {
      "id": 1344,
      "code": 260104,
      "name_in_thai": "วังกระโจม",
      "name_in_english": "Wang Krachom",
      "latitude": "14.176",
      "longitude": "101.212",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 804,
      "code": 180608,
      "name_in_thai": "วังไก่เถื่อน",
      "name_in_english": "Wang Kai Thuean",
      "latitude": "15.004",
      "longitude": "100.056",
      "district_id": 115,
      "zip_code": 17130
    },
    {
      "id": 5888,
      "code": 720305,
      "name_in_thai": "วังคัน",
      "name_in_english": "Wang Khan",
      "latitude": "14.937",
      "longitude": "99.666",
      "district_id": 741,
      "zip_code": 72180
    },
    {
      "id": 1194,
      "code": 240111,
      "name_in_thai": "วังตะเคียน",
      "name_in_english": "Wang Takhian",
      "latitude": "13.719",
      "longitude": "101.034",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 808,
      "code": 180702,
      "name_in_thai": "วังตะเคียน",
      "name_in_english": "Wang Takhian",
      "latitude": "15.278",
      "longitude": "99.802",
      "district_id": 116,
      "zip_code": 17120
    },
    {
      "id": 5912,
      "code": 720508,
      "name_in_thai": "วังน้ำซับ",
      "name_in_english": "Wang Nam Sap",
      "latitude": "14.650",
      "longitude": "100.154",
      "district_id": 743,
      "zip_code": 72140
    },
    {
      "id": 5902,
      "code": 720412,
      "name_in_thai": "วังน้ำเย็น",
      "name_in_english": "Wang Nam Yen",
      "latitude": "14.377",
      "longitude": "100.015",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 5913,
      "code": 720509,
      "name_in_thai": "วังยาง",
      "name_in_english": "Wang Yang",
      "latitude": "14.559",
      "longitude": "100.167",
      "district_id": 743,
      "zip_code": 72140
    },
    {
      "id": 5890,
      "code": 720307,
      "name_in_thai": "วังยาว",
      "name_in_english": "Wang Yao",
      "latitude": "14.954",
      "longitude": "99.381",
      "district_id": 741,
      "zip_code": 72180
    },
    {
      "id": 1267,
      "code": 240902,
      "name_in_thai": "วังเย็น",
      "name_in_english": "Wang Yen",
      "latitude": "13.536",
      "longitude": "101.334",
      "district_id": 175,
      "zip_code": 24190
    },
    {
      "id": 5935,
      "code": 720802,
      "name_in_thai": "วังลึก",
      "name_in_english": "Wang Luek",
      "latitude": "14.758",
      "longitude": "100.158",
      "district_id": 746,
      "zip_code": 72130
    },
    {
      "id": 5881,
      "code": 720211,
      "name_in_thai": "วังศรีราช",
      "name_in_english": "Wang Si Rat",
      "latitude": "14.850",
      "longitude": "99.988",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 783,
      "code": 180311,
      "name_in_thai": "วังหมัน",
      "name_in_english": "Wang Man",
      "latitude": "15.171",
      "longitude": "99.916",
      "district_id": 112,
      "zip_code": 17120
    },
    {
      "id": 5911,
      "code": 720507,
      "name_in_thai": "วังหว้า",
      "name_in_english": "Wang Wa",
      "latitude": "14.661",
      "longitude": "100.095",
      "district_id": 743,
      "zip_code": 72140
    },
    {
      "id": 6425,
      "code": 801703,
      "name_in_thai": "วังหิน",
      "name_in_english": "Wang Hin",
      "latitude": "7.984",
      "longitude": "99.554",
      "district_id": 794,
      "zip_code": 80360
    },
    {
      "id": 6337,
      "code": 800705,
      "name_in_thai": "วังอ่าง",
      "name_in_english": "Wang Ang",
      "latitude": "7.927",
      "longitude": "99.886",
      "district_id": 784,
      "zip_code": 80180
    },
    {
      "id": 771,
      "code": 180202,
      "name_in_thai": "วัดโคก",
      "name_in_english": "Wat Khok",
      "latitude": "15.326",
      "longitude": "100.107",
      "district_id": 111,
      "zip_code": 17110
    },
    {
      "id": 5904,
      "code": 720414,
      "name_in_thai": "วัดดาว",
      "name_in_english": "Wat Dao",
      "latitude": "14.350",
      "longitude": "100.106",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 5903,
      "code": 720413,
      "name_in_thai": "วัดโบสถ์",
      "name_in_english": "Wat Bot",
      "latitude": "14.330",
      "longitude": "100.037",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 777,
      "code": 180301,
      "name_in_thai": "วัดสิงห์",
      "name_in_english": "Wat Sing",
      "latitude": "15.263",
      "longitude": "100.041",
      "district_id": 112,
      "zip_code": 17120
    },
    {
      "id": 1370,
      "code": 260310,
      "name_in_thai": "ศรีกะอาง",
      "name_in_english": "Si Ka-Ang",
      "latitude": "14.308",
      "longitude": "101.117",
      "district_id": 187,
      "zip_code": 26110
    },
    {
      "id": 1347,
      "code": 260107,
      "name_in_thai": "ศรีจุฬา",
      "name_in_english": "Si Chula",
      "latitude": "14.072",
      "longitude": "101.132",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 1349,
      "code": 260109,
      "name_in_thai": "ศรีนาวา",
      "name_in_english": "Si Nawa",
      "latitude": "14.209",
      "longitude": "101.267",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 5905,
      "code": 720501,
      "name_in_thai": "ศรีประจันต์",
      "name_in_english": "Si Prachan",
      "latitude": "14.609",
      "longitude": "100.179",
      "district_id": 743,
      "zip_code": 72140
    },
    {
      "id": 1373,
      "code": 260403,
      "name_in_thai": "ศรีษะกระบือ",
      "name_in_english": "Sisa Krabue",
      "latitude": "14.043",
      "longitude": "100.986",
      "district_id": 188,
      "zip_code": 26120
    },
    {
      "id": 5929,
      "code": 720711,
      "name_in_thai": "ศรีสำราญ",
      "name_in_english": "Si Samran",
      "latitude": "14.217",
      "longitude": "99.948",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 5866,
      "code": 720116,
      "name_in_thai": "ศาลาขาว",
      "name_in_english": "Sala Khao",
      "latitude": "14.433",
      "longitude": "99.973",
      "district_id": 739,
      "zip_code": 72210
    },
    {
      "id": 1220,
      "code": 240309,
      "name_in_thai": "ศาลาแดง",
      "name_in_english": "Sala Daeng",
      "latitude": "13.838",
      "longitude": "100.928",
      "district_id": 169,
      "zip_code": 24000
    },
    {
      "id": 772,
      "code": 180203,
      "name_in_thai": "ศิลาดาน",
      "name_in_english": "Sila Dan",
      "latitude": "15.354",
      "longitude": "100.122",
      "district_id": 111,
      "zip_code": 17110
    },
    {
      "id": 5870,
      "code": 720120,
      "name_in_thai": "สนามคลี",
      "name_in_english": "Sanam Khli",
      "latitude": "14.539",
      "longitude": "99.982",
      "district_id": 739,
      "zip_code": 72230
    },
    {
      "id": 1248,
      "code": 240515,
      "name_in_thai": "สนามจันทร์",
      "name_in_english": "Sanam Chan",
      "latitude": "13.594",
      "longitude": "101.066",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 5868,
      "code": 720118,
      "name_in_thai": "สนามชัย",
      "name_in_english": "Sanam Chai",
      "latitude": "14.492",
      "longitude": "100.169",
      "district_id": 739,
      "zip_code": 72000
    },
    {
      "id": 784,
      "code": 180401,
      "name_in_thai": "สรรพยา",
      "name_in_english": "Sapphaya",
      "latitude": "15.128",
      "longitude": "100.233",
      "district_id": 113,
      "zip_code": 17150
    },
    {
      "id": 5917,
      "code": 720604,
      "name_in_thai": "สระกระโจม",
      "name_in_english": "Sa Krachom",
      "latitude": "14.643",
      "longitude": "99.865",
      "district_id": 744,
      "zip_code": 72250
    },
    {
      "id": 6348,
      "code": 800806,
      "name_in_thai": "สระแก้ว",
      "name_in_english": "Sa Kaeo",
      "latitude": "8.752",
      "longitude": "99.867",
      "district_id": 785,
      "zip_code": 80160
    },
    {
      "id": 5863,
      "code": 720113,
      "name_in_thai": "สระแก้ว",
      "name_in_english": "Sa Kaeo",
      "latitude": "14.502",
      "longitude": "100.014",
      "district_id": 739,
      "zip_code": 72230
    },
    {
      "id": 5952,
      "code": 720912,
      "name_in_thai": "สระพังลาน",
      "name_in_english": "Sa Phang Lan",
      "latitude": "14.253",
      "longitude": "99.906",
      "district_id": 747,
      "zip_code": 72220
    },
    {
      "id": 5942,
      "code": 720902,
      "name_in_thai": "สระยายโสม",
      "name_in_english": "Sa Yai Som",
      "latitude": "14.273",
      "longitude": "99.874",
      "district_id": 747,
      "zip_code": 72220
    },
    {
      "id": 6446,
      "code": 802203,
      "name_in_thai": "สวนขัน",
      "name_in_english": "Suan Khan",
      "latitude": "8.416",
      "longitude": "99.643",
      "district_id": 799,
      "zip_code": 80250
    },
    {
      "id": 5867,
      "code": 720117,
      "name_in_thai": "สวนแตง",
      "name_in_english": "Suan Taeng",
      "latitude": "14.436",
      "longitude": "100.018",
      "district_id": 739,
      "zip_code": 72210
    },
    {
      "id": 6449,
      "code": 802303,
      "name_in_thai": "สวนหลวง",
      "name_in_english": "Suan Luang",
      "latitude": "8.139",
      "longitude": "100.037",
      "district_id": 800,
      "zip_code": 80190
    },
    {
      "id": 1228,
      "code": 240407,
      "name_in_thai": "สองคลอง",
      "name_in_english": "Song Khlong",
      "latitude": "13.484",
      "longitude": "100.910",
      "district_id": 170,
      "zip_code": 24130
    },
    {
      "id": 5919,
      "code": 720701,
      "name_in_thai": "สองพี่น้อง",
      "name_in_english": "Song Phi Nong",
      "latitude": "14.225",
      "longitude": "100.023",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 809,
      "code": 180703,
      "name_in_thai": "สะพานหิน",
      "name_in_english": "Saphan Hin",
      "latitude": "15.197",
      "longitude": "99.827",
      "district_id": 116,
      "zip_code": 17120
    },
    {
      "id": 6435,
      "code": 801906,
      "name_in_thai": "สาม",
      "name_in_english": "Sam Tambon",
      "latitude": "8.060",
      "longitude": "99.806",
      "district_id": 796,
      "zip_code": 80130
    },
    {
      "id": 806,
      "code": 180611,
      "name_in_thai": "สามง่ามท่าโบสถ์",
      "name_in_english": "Sam Ngam Tha Bot",
      "latitude": "15.065",
      "longitude": "100.026",
      "district_id": 115,
      "zip_code": 17160
    },
    {
      "id": 5936,
      "code": 720803,
      "name_in_thai": "สามชุก",
      "name_in_english": "Sam Chuk",
      "latitude": "14.763",
      "longitude": "100.095",
      "district_id": 746,
      "zip_code": 72130
    },
    {
      "id": 1350,
      "code": 260110,
      "name_in_thai": "สาริกา",
      "name_in_english": "Sarika",
      "latitude": "14.359",
      "longitude": "101.261",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 5896,
      "code": 720406,
      "name_in_thai": "สาลี",
      "name_in_english": "Sali",
      "latitude": "14.286",
      "longitude": "100.221",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 1208,
      "code": 240211,
      "name_in_thai": "สาวชะโงก",
      "name_in_english": "Sao Cha-Ngo",
      "latitude": "13.683",
      "longitude": "101.152",
      "district_id": 168,
      "zip_code": 24110
    },
    {
      "id": 1214,
      "code": 240303,
      "name_in_thai": "สิงโตทอง",
      "name_in_english": "Singto Thong",
      "latitude": "13.911",
      "longitude": "101.073",
      "district_id": 169,
      "zip_code": 24150
    },
    {
      "id": 6400,
      "code": 801401,
      "name_in_thai": "สิชล",
      "name_in_english": "Sichon",
      "latitude": "9.008",
      "longitude": "99.902",
      "district_id": 791,
      "zip_code": 80120
    },
    {
      "id": 1250,
      "code": 240517,
      "name_in_thai": "สิบเอ็ดศอก",
      "name_in_english": "Sip Et Sok",
      "latitude": "13.605",
      "longitude": "101.148",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 6405,
      "code": 801406,
      "name_in_thai": "สีขีด",
      "name_in_english": "Si Khit",
      "latitude": "9.023",
      "longitude": "99.786",
      "district_id": 791,
      "zip_code": 80120
    },
    {
      "id": 813,
      "code": 180803,
      "name_in_thai": "สุขเดือนห้า",
      "name_in_english": "Suk Duean Ha",
      "latitude": "14.968",
      "longitude": "99.828",
      "district_id": 117,
      "zip_code": 17130
    },
    {
      "id": 1210,
      "code": 240213,
      "name_in_thai": "เสม็ดใต้",
      "name_in_english": "Samet Tai",
      "latitude": "13.653",
      "longitude": "101.162",
      "district_id": 168,
      "zip_code": 24110
    },
    {
      "id": 1209,
      "code": 240212,
      "name_in_thai": "เสม็ดเหนือ",
      "name_in_english": "Samet Nuea",
      "latitude": "13.673",
      "longitude": "101.201",
      "district_id": 168,
      "zip_code": 24110
    },
    {
      "id": 6396,
      "code": 801303,
      "name_in_thai": "เสาธง",
      "name_in_english": "Sao Thong",
      "latitude": "8.252",
      "longitude": "99.924",
      "district_id": 790,
      "zip_code": 80350
    },
    {
      "id": 6403,
      "code": 801404,
      "name_in_thai": "เสาเภา",
      "name_in_english": "Sao Phao",
      "latitude": "8.890",
      "longitude": "99.904",
      "district_id": 791,
      "zip_code": 80340
    },
    {
      "id": 6329,
      "code": 800610,
      "name_in_thai": "เสือหึง",
      "name_in_english": "Suea Hueng",
      "latitude": "8.189",
      "longitude": "100.242",
      "district_id": 783,
      "zip_code": 80190
    },
    {
      "id": 768,
      "code": 180108,
      "name_in_thai": "เสือโฮก",
      "name_in_english": "Suea Hok",
      "latitude": "15.238",
      "longitude": "100.224",
      "district_id": 110,
      "zip_code": 17000
    },
    {
      "id": 1249,
      "code": 240516,
      "name_in_thai": "แสนภูดาษ",
      "name_in_english": "Saen Phu Dat",
      "latitude": "13.582",
      "longitude": "101.015",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 1195,
      "code": 240112,
      "name_in_thai": "โสธร",
      "name_in_english": "Sothon",
      "latitude": "13.680",
      "longitude": "101.053",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 6327,
      "code": 800606,
      "name_in_thai": "ไสหมาก",
      "name_in_english": "Sai Mak",
      "latitude": "8.203",
      "longitude": "100.163",
      "district_id": 783,
      "zip_code": 80190
    },
    {
      "id": 6315,
      "code": 800410,
      "name_in_thai": "ไสหร้า",
      "name_in_english": "Sai Ra",
      "latitude": "8.437",
      "longitude": "99.547",
      "district_id": 781,
      "zip_code": 80150
    },
    {
      "id": 5883,
      "code": 720214,
      "name_in_thai": "หนองกระทุ่ม",
      "name_in_english": "Nong Krathum",
      "latitude": "14.907",
      "longitude": "99.804",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 5958,
      "code": 721005,
      "name_in_thai": "หนองขาม",
      "name_in_english": "Nong Kham",
      "latitude": "14.796",
      "longitude": "99.693",
      "district_id": 748,
      "zip_code": 72240
    },
    {
      "id": 781,
      "code": 180306,
      "name_in_thai": "หนองขุ่น",
      "name_in_english": "Nong Khun",
      "latitude": "15.235",
      "longitude": "99.970",
      "district_id": 112,
      "zip_code": 17120
    },
    {
      "id": 1229,
      "code": 240408,
      "name_in_thai": "หนองจอก",
      "name_in_english": "Nong Chok",
      "latitude": "13.603",
      "longitude": "100.989",
      "district_id": 170,
      "zip_code": 24130
    },
    {
      "id": 802,
      "code": 180606,
      "name_in_thai": "หนองแซง",
      "name_in_english": "Nong Saeng",
      "latitude": "15.107",
      "longitude": "99.973",
      "district_id": 115,
      "zip_code": 17160
    },
    {
      "id": 1242,
      "code": 240509,
      "name_in_thai": "หนองตีนนก",
      "name_in_english": "Nong Tin Nok",
      "latitude": "13.585",
      "longitude": "101.107",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 779,
      "code": 180303,
      "name_in_thai": "หนองน้อย",
      "name_in_english": "Nong Noi",
      "latitude": "15.177",
      "longitude": "100.015",
      "district_id": 112,
      "zip_code": 17120
    },
    {
      "id": 5931,
      "code": 720713,
      "name_in_thai": "หนองบ่อ",
      "name_in_english": "Nong Bo",
      "latitude": "14.204",
      "longitude": "99.860",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 1243,
      "code": 240510,
      "name_in_thai": "หนองบัว",
      "name_in_english": "Nong Bua",
      "latitude": "13.617",
      "longitude": "101.101",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 780,
      "code": 180304,
      "name_in_thai": "หนองบัว",
      "name_in_english": "Nong Bua",
      "latitude": "15.283",
      "longitude": "100.013",
      "district_id": 112,
      "zip_code": 17120
    },
    {
      "id": 5937,
      "code": 720804,
      "name_in_thai": "หนองผักนาก",
      "name_in_english": "Nong Phak Nak",
      "latitude": "14.757",
      "longitude": "100.032",
      "district_id": 746,
      "zip_code": 72130
    },
    {
      "id": 5956,
      "code": 721003,
      "name_in_thai": "หนองโพธิ์",
      "name_in_english": "Nong Pho",
      "latitude": "14.831",
      "longitude": "99.919",
      "district_id": 748,
      "zip_code": 72240
    },
    {
      "id": 5884,
      "code": 720301,
      "name_in_thai": "หนองมะค่าโมง",
      "name_in_english": "Nong Makha Mong",
      "latitude": "14.882",
      "longitude": "99.737",
      "district_id": 741,
      "zip_code": 72180
    },
    {
      "id": 807,
      "code": 180701,
      "name_in_thai": "หนองมะโมง",
      "name_in_english": "Nong Mamong",
      "latitude": "15.216",
      "longitude": "99.772",
      "district_id": 116,
      "zip_code": 17120
    },
    {
      "id": 1269,
      "code": 240904,
      "name_in_thai": "หนองไม้แก่น",
      "name_in_english": "Nong Mai Kaen",
      "latitude": "13.504",
      "longitude": "101.404",
      "district_id": 175,
      "zip_code": 24190
    },
    {
      "id": 1255,
      "code": 240605,
      "name_in_thai": "หนองยาว",
      "name_in_english": "Nong Yao",
      "latitude": "13.816",
      "longitude": "101.351",
      "district_id": 172,
      "zip_code": 24120
    },
    {
      "id": 5955,
      "code": 721002,
      "name_in_thai": "หนองราชวัตร",
      "name_in_english": "Nong Ratchawat",
      "latitude": "14.720",
      "longitude": "99.931",
      "district_id": 748,
      "zip_code": 72240
    },
    {
      "id": 5939,
      "code": 720806,
      "name_in_thai": "หนองสะเดา",
      "name_in_english": "Nong Sadao",
      "latitude": "14.803",
      "longitude": "99.991",
      "district_id": 746,
      "zip_code": 72130
    },
    {
      "id": 5915,
      "code": 720602,
      "name_in_thai": "หนองสาหร่าย",
      "name_in_english": "Nong Sarai",
      "latitude": "14.671",
      "longitude": "100.011",
      "district_id": 744,
      "zip_code": 72170
    },
    {
      "id": 1359,
      "code": 260206,
      "name_in_thai": "หนองแสง",
      "name_in_english": "Nong Saeng",
      "latitude": "14.211",
      "longitude": "101.307",
      "district_id": 186,
      "zip_code": 26130
    },
    {
      "id": 6356,
      "code": 800903,
      "name_in_thai": "หนองหงส์",
      "name_in_english": "Nong Hong",
      "latitude": "8.195",
      "longitude": "99.614",
      "district_id": 786,
      "zip_code": 80110
    },
    {
      "id": 5954,
      "code": 721001,
      "name_in_thai": "หนองหญ้าไซ",
      "name_in_english": "Nong Ya Sai",
      "latitude": "14.776",
      "longitude": "99.885",
      "district_id": 748,
      "zip_code": 72240
    },
    {
      "id": 1257,
      "code": 240607,
      "name_in_thai": "หนองแหน",
      "name_in_english": "Nong Nae",
      "latitude": "13.661",
      "longitude": "101.335",
      "district_id": 172,
      "zip_code": 24120
    },
    {
      "id": 5947,
      "code": 720907,
      "name_in_thai": "หนองโอ่ง",
      "name_in_english": "Nong Ong",
      "latitude": "14.418",
      "longitude": "99.886",
      "district_id": 747,
      "zip_code": 72160
    },
    {
      "id": 1198,
      "code": 240115,
      "name_in_thai": "หนามแดง",
      "name_in_english": "Nam Daeng",
      "latitude": "13.736",
      "longitude": "100.989",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 1184,
      "code": 240101,
      "name_in_thai": "หน้าเมือง",
      "name_in_english": "Na Mueang",
      "latitude": "13.686",
      "longitude": "101.066",
      "district_id": 167,
      "zip_code": 24000
    },
    {
      "id": 6413,
      "code": 801602,
      "name_in_thai": "หน้าสตน",
      "name_in_english": "Na Saton",
      "latitude": "7.969",
      "longitude": "100.322",
      "district_id": 793,
      "zip_code": 80170
    },
    {
      "id": 1215,
      "code": 240304,
      "name_in_thai": "หมอนทอง",
      "name_in_english": "Mon Thong",
      "latitude": "13.874",
      "longitude": "101.043",
      "district_id": 169,
      "zip_code": 24150
    },
    {
      "id": 6445,
      "code": 802202,
      "name_in_thai": "หลักช้าง",
      "name_in_english": "Lak Chang",
      "latitude": "8.354",
      "longitude": "99.535",
      "district_id": 799,
      "zip_code": 80250
    },
    {
      "id": 793,
      "code": 180503,
      "name_in_thai": "ห้วยกรด",
      "name_in_english": "Huai Krot",
      "latitude": "15.096",
      "longitude": "100.203",
      "district_id": 114,
      "zip_code": 17140
    },
    {
      "id": 798,
      "code": 180508,
      "name_in_thai": "ห้วยกรดพัฒนา",
      "name_in_english": "Huai Krot Phatthana",
      "latitude": "15.074",
      "longitude": "100.228",
      "district_id": 114,
      "zip_code": 17140
    },
    {
      "id": 5886,
      "code": 720303,
      "name_in_thai": "ห้วยขมิ้น",
      "name_in_english": "Huai Khamin",
      "latitude": "14.922",
      "longitude": "99.534",
      "district_id": 741,
      "zip_code": 72180
    },
    {
      "id": 803,
      "code": 180607,
      "name_in_thai": "ห้วยงู",
      "name_in_english": "Huai Ngu",
      "latitude": "15.072",
      "longitude": "100.067",
      "district_id": 115,
      "zip_code": 17160
    },
    {
      "id": 6314,
      "code": 800409,
      "name_in_thai": "ห้วยปริก",
      "name_in_english": "Huai Prik",
      "latitude": "8.569",
      "longitude": "99.440",
      "district_id": 781,
      "zip_code": 80260
    },
    {
      "id": 1232,
      "code": 240411,
      "name_in_thai": "หอมศีล",
      "name_in_english": "Hom Sin",
      "latitude": "13.543",
      "longitude": "100.892",
      "district_id": 170,
      "zip_code": 24180
    },
    {
      "id": 799,
      "code": 180601,
      "name_in_thai": "หันคา",
      "name_in_english": "Han Kha",
      "latitude": "15.016",
      "longitude": "99.998",
      "district_id": 115,
      "zip_code": 17130
    },
    {
      "id": 5878,
      "code": 720208,
      "name_in_thai": "หัวเขา",
      "name_in_english": "Hua Khao",
      "latitude": "14.869",
      "longitude": "100.038",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 6347,
      "code": 800804,
      "name_in_thai": "หัวตะพาน",
      "name_in_english": "Hua Taphan",
      "latitude": "8.628",
      "longitude": "99.889",
      "district_id": 785,
      "zip_code": 80160
    },
    {
      "id": 1211,
      "code": 240214,
      "name_in_thai": "หัวไทร",
      "name_in_english": "Hua Sai",
      "latitude": "13.799",
      "longitude": "101.221",
      "district_id": 168,
      "zip_code": 24110
    },
    {
      "id": 6412,
      "code": 801601,
      "name_in_thai": "หัวไทร",
      "name_in_english": "Hua Sai",
      "latitude": "8.037",
      "longitude": "100.286",
      "district_id": 793,
      "zip_code": 80170
    },
    {
      "id": 5879,
      "code": 720209,
      "name_in_thai": "หัวนา",
      "name_in_english": "Hua Na",
      "latitude": "14.883",
      "longitude": "99.970",
      "district_id": 740,
      "zip_code": 72120
    },
    {
      "id": 5924,
      "code": 720706,
      "name_in_thai": "หัวโพธิ์",
      "name_in_english": "Hua Pho",
      "latitude": "14.302",
      "longitude": "99.981",
      "district_id": 745,
      "zip_code": 72110
    },
    {
      "id": 1268,
      "code": 240903,
      "name_in_thai": "หัวสำโรง",
      "name_in_english": "Hua Samrong",
      "latitude": "13.624",
      "longitude": "101.315",
      "district_id": 175,
      "zip_code": 24190
    },
    {
      "id": 774,
      "code": 180205,
      "name_in_thai": "หางน้ำสาคร",
      "name_in_english": "Hang Nam Sakhon",
      "latitude": "15.292",
      "longitude": "100.146",
      "district_id": 111,
      "zip_code": 17170
    },
    {
      "id": 766,
      "code": 180106,
      "name_in_thai": "หาดท่าเสา",
      "name_in_english": "Hat Tha Sao",
      "latitude": "15.200",
      "longitude": "100.079",
      "district_id": 110,
      "zip_code": 17000
    },
    {
      "id": 790,
      "code": 180407,
      "name_in_thai": "หาดอาษา",
      "name_in_english": "Hat A Sa",
      "latitude": "15.165",
      "longitude": "100.262",
      "district_id": 113,
      "zip_code": 17150
    },
    {
      "id": 6395,
      "code": 801302,
      "name_in_thai": "หินตก",
      "name_in_english": "Hin Tok",
      "latitude": "8.237",
      "longitude": "99.880",
      "district_id": 790,
      "zip_code": 80350
    },
    {
      "id": 1351,
      "code": 260111,
      "name_in_thai": "หินตั้ง",
      "name_in_english": "Hin Tang",
      "latitude": "14.408",
      "longitude": "101.352",
      "district_id": 185,
      "zip_code": 26000
    },
    {
      "id": 6383,
      "code": 801208,
      "name_in_thai": "หูล่อง",
      "name_in_english": "Hu Long",
      "latitude": "8.314",
      "longitude": "100.184",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 6415,
      "code": 801604,
      "name_in_thai": "แหลม",
      "name_in_english": "Laem",
      "latitude": "7.970",
      "longitude": "100.192",
      "district_id": 793,
      "zip_code": 80170
    },
    {
      "id": 6384,
      "code": 801209,
      "name_in_thai": "แหลมตะลุมพุก",
      "name_in_english": "Laem Talumphuk",
      "latitude": "8.458",
      "longitude": "100.196",
      "district_id": 789,
      "zip_code": 80140
    },
    {
      "id": 1246,
      "code": 240513,
      "name_in_thai": "แหลมประดู่",
      "name_in_english": "Laem Pradu",
      "latitude": "13.597",
      "longitude": "101.209",
      "district_id": 171,
      "zip_code": 24140
    },
    {
      "id": 5887,
      "code": 720304,
      "name_in_thai": "องค์พระ",
      "name_in_english": "Ong Phra",
      "latitude": "14.800",
      "longitude": "99.386",
      "district_id": 741,
      "zip_code": 72180
    },
    {
      "id": 5898,
      "code": 720408,
      "name_in_thai": "องครักษ์",
      "name_in_english": "Ongkharak",
      "latitude": "14.374",
      "longitude": "100.236",
      "district_id": 742,
      "zip_code": 72150
    },
    {
      "id": 1379,
      "code": 260409,
      "name_in_thai": "องครักษ์",
      "name_in_english": "Ongkharak",
      "latitude": "14.107",
      "longitude": "101.005",
      "district_id": 188,
      "zip_code": 26120
    },
    {
      "id": 1364,
      "code": 260304,
      "name_in_thai": "อาษา",
      "name_in_english": "A Sa",
      "latitude": "14.226",
      "longitude": "101.009",
      "district_id": 187,
      "zip_code": 26110
    },
    {
      "id": 6300,
      "code": 800203,
      "name_in_thai": "อินคีรี",
      "name_in_english": "In Khiri",
      "latitude": "8.540",
      "longitude": "99.874",
      "district_id": 779,
      "zip_code": 80320
    },
    {
      "id": 776,
      "code": 180207,
      "name_in_thai": "อู่ตะเภา",
      "name_in_english": "U Taphao",
      "latitude": "15.274",
      "longitude": "100.219",
      "district_id": 111,
      "zip_code": 17170
    },
    {
      "id": 5941,
      "code": 720901,
      "name_in_thai": "อู่ทอง",
      "name_in_english": "U Thong",
      "latitude": "14.377",
      "longitude": "99.880",
      "district_id": 747,
      "zip_code": 72160
    }
  ]
} as const
