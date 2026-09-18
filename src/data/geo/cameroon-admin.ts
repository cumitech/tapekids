import { normalizeGeoName } from "@/lib/geo/options";

type AdminTree = Record<string, Record<string, string[]>>;

export const CAMEROON_ADMIN: AdminTree = {
  Adamawa: {
    Djérem: ["Tibati", "Ngaoundal"],
    "Faro-et-Déo": ["Tignère", "Mayo-Baléo", "Kontcha"],
    "Mayo-Banyo": ["Banyo", "Bankim", "Mayo-Darlé"],
    Mbéré: ["Meiganga", "Dir", "Djohong", "Ngaoui"],
    Vina: [
      "Ngaoundéré I",
      "Ngaoundéré II",
      "Ngaoundéré III",
      "Belel",
      "Mbe",
      "Nganha",
      "Nyambaka",
      "Martap",
    ],
  },
  Centre: {
    "Haute-Sanaga": ["Nanga-Eboko", "Minta", "Nkoteng", "Bibey", "Nsem", "Lembe-Yezoum"],
    Lekié: ["Monatélé", "Evodoula", "Obala", "Okola", "Sa'a", "Ebebda", "Elig-Mfomo", "Batchenga"],
    "Mbam-et-Inoubou": ["Bafia", "Bokito", "Deuk", "Kiiki", "Kon-Yambetta", "Ndikiniméki", "Nitoukou", "Ombessa"],
    "Mbam-et-Kim": ["Ntui", "Mbangassina", "Ngambé-Tikar", "Ngoro", "Yoko"],
    "Méfou-et-Afamba": ["Mfou", "Awaé", "Edzendouan", "Esse", "Nkolafamba", "Soa", "Olanguina"],
    "Méfou-et-Akono": ["Ngoumou", "Akono", "Bikok", "Mbankomo"],
    Mfoundi: [
      "Yaoundé I",
      "Yaoundé II",
      "Yaoundé III",
      "Yaoundé IV",
      "Yaoundé V",
      "Yaoundé VI",
      "Yaoundé VII",
    ],
    "Nyong-et-Kéllé": ["Éséka", "Bot-Makak", "Dibang", "Bondjock", "Makak", "Ngog-Mapubi", "Messondo"],
    "Nyong-et-Mfoumou": ["Akonolinga", "Ayos", "Endom"],
    "Nyong-et-So'o": ["Mbalmayo", "Akoeman", "Dzeng", "Mengueme", "Nkolmetet"],
  },
  East: {
    "Boumba-et-Ngoko": ["Yokadouma", "Moloundou", "Gari-Gombo", "Salapoumbé"],
    "Haut-Nyong": ["Abong-Mbang", "Dimako", "Doumaintang", "Lomié", "Messamena", "Mindourou", "Ngoyla", "Somalomo"],
    Kadey: ["Batouri", "Ndelele", "Kette", "Mbang", "Nguelebok"],
    "Lom-et-Djerem": ["Bertoua I", "Bertoua II", "Bélabo", "Diang", "Bétaré-Oya", "Ngoura"],
  },
  "Far North": {
    Diamaré: ["Maroua I", "Maroua II", "Maroua III", "Bogo", "Gazawa", "Meri", "Petté"],
    "Logone-et-Chari": ["Kousseri", "Blitz", "Darak", "Fotokol", "Goulfey", "Hile-Alifa", "Logone-Birni", "Makary", "Waza", "Zina"],
    "Mayo-Danay": ["Yagoua", "Datcheka", "Gobo", "Gueme", "Guere", "Kai-Kai", "Kalfou", "Kar-Hay", "Maga", "Tchatibali", "Wina"],
    "Mayo-Kani": ["Kaélé", "Guidiguis", "Moulvoudaye", "Moutourwa", "Porhi", "Taibong"],
    "Mayo-Sava": ["Mora", "Kolofata", "Tokombéré"],
    "Mayo-Tsanaga": ["Mokolo", "Bourrha", "Hina", "Koza", "Mogodé", "Mozogo", "Souledé-Roua"],
  },
  Littoral: {
    Moungo: ["Nkongsamba I", "Nkongsamba II", "Nkongsamba III", "Bare-Bakem", "Dibombari", "Loum", "Manjo", "Mbanga", "Melong", "Njombe-Penja"],
    Nkam: ["Yabassi", "Nkondjock", "Nord-Makombé", "Yingui"],
    "Sanaga-Maritime": ["Édéa I", "Édéa II", "Dizangué", "Mouanko", "Ndom", "Ngwei", "Nyanon", "Pouma"],
    Wouri: [
      "Douala I",
      "Douala II",
      "Douala III",
      "Douala IV",
      "Douala V",
      "Douala VI",
    ],
  },
  North: {
    Bénoué: ["Garoua I", "Garoua II", "Garoua III", "Baschéo", "Bibemi", "Dembo", "Lagdo", "Pitoa", "Tcheboa", "Demsa"],
    Faro: ["Poli", "Beka"],
    "Mayo-Louti": ["Guider", "Figuil", "Mayo-Oulo"],
    "Mayo-Rey": ["Tcholliré", "Rey-Bouba", "Touboro", "Madingring"],
  },
  Northwest: {
    Boyo: ["Fundong", "Belo", "Bum", "Njinikom"],
    Bui: ["Kumbo", "Elak-Oku", "Jakiri", "Mbiame", "Nkum", "Noni"],
    "Donga-Mantung": ["Nkambe", "Ako", "Misaje", "Ndu", "Nwa"],
    Menchum: ["Wum", "Benakuma", "Furu-Awa", "Zhoa"],
    Mezam: ["Bamenda I", "Bamenda II", "Bamenda III", "Bafut", "Bali", "Santa", "Tubah"],
    Momo: ["Mbengwi", "Andek", "Batibo", "Njikwa", "Widikum"],
    "Ngo-Ketunjia": ["Ndop", "Babessi", "Balikumbat"],
  },
  South: {
    "Dja-et-Lobo": ["Sangmélima", "Bengbis", "Djoum", "Meyomessala", "Meyomessi", "Mintom", "Oveng", "Zoétélé"],
    Mvila: ["Ebolowa I", "Ebolowa II", "Biwong-Bane", "Biwong-Bulu", "Efoulan", "Mengong", "Mvangan", "Ngoulemakong"],
    Océan: ["Kribi I", "Kribi II", "Akom II", "Campo", "Lokoundje", "Lolodorf", "Mvengue", "Bipindi"],
    "Vallée-du-Ntem": ["Ambam", "Kye-Ossi", "Ma'an", "Olamze"],
  },
  Southwest: {
    Fako: ["Buea", "Limbe I", "Limbe II", "Limbe III", "Tiko", "Muyuka", "West Coast"],
    "Koupé-Manengouba": ["Bangem", "Nguti", "Tombel"],
    Lebialem: ["Menji", "Alou", "Wabane"],
    Manyu: ["Mamfe", "Akwaya", "Eyumojock", "Tinto"],
    Meme: ["Kumba I", "Kumba II", "Kumba III", "Konye", "Mbonge"],
    Ndian: ["Mundemba", "Bamusso", "Ekondo-Titi", "Idabato", "Isangele", "Kombo-Abedimo", "Kombo-Itindi", "Toko"],
  },
  West: {
    Bamboutos: ["Mbouda", "Batcham", "Galim", "Babadjou"],
    "Haut-Nkam": ["Bafang", "Bana", "Bandja", "Kekem", "Bakou", "Bannwa", "Banwa"],
    "Hauts-Plateaux": ["Baham", "Bamendjou", "Bangou", "Batié"],
    "Koung-Khi": ["Bandjoun", "Bayangam", "Djebem"],
    Menoua: ["Dschang", "Fokoué", "Fongo-Tongo", "Nkong-Zem", "Penka-Michel", "Santchou"],
    Mifi: ["Bafoussam I", "Bafoussam II", "Bafoussam III"],
    Ndé: ["Bangangté", "Bassamba", "Bazou", "Tonga"],
    Noun: ["Foumban", "Foumbot", "Koutaba", "Magba", "Malentouen", "Massangam", "Njimom"],
  },
};

export function findCameroonRegionKey(region: string): string | undefined {
  const needle = normalizeGeoName(region);
  return Object.keys(CAMEROON_ADMIN).find(
    (name) => normalizeGeoName(name) === needle
  );
}

export function listCameroonDivisions(region: string): string[] {
  const key = findCameroonRegionKey(region);
  if (!key) {
    return [];
  }
  return Object.keys(CAMEROON_ADMIN[key] ?? {});
}

export function listCameroonSubDivisions(
  region: string,
  division: string
): string[] {
  const key = findCameroonRegionKey(region);
  if (!key) {
    return [];
  }
  const divisions = CAMEROON_ADMIN[key] ?? {};
  const match = Object.keys(divisions).find(
    (name) => normalizeGeoName(name) === normalizeGeoName(division)
  );
  return match ? divisions[match] : [];
}
