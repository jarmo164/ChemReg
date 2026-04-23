import { MiniSdsDocument, MiniSdsPayload } from "../types/sds";

const acetonePayload: MiniSdsPayload = {
  document: {
    productName: "Acetone",
    supplierNameRaw: "Sigma-Aldrich",
    language: "et",
    countryFormat: "EE",
    revisionDate: "2026-03-10",
    expiryDate: "2029-03-10",
    status: "active",
  },
  summary: {
    intendedUse: "Labori puhastuslahusti ja proovide ettevalmistus.",
    signalWord: "Danger",
    physicalState: "liquid",
    emergencyPhone: "+372 16662",
  },
  hazards: {
    hazardStatements: ["H225 Highly flammable liquid and vapour", "H319 Causes serious eye irritation"],
    precautionaryStatements: ["P210 Keep away from heat, sparks, open flames", "P280 Wear protective gloves/eye protection"],
    pictograms: ["GHS02", "GHS07"],
  },
  firstAid: {
    inhalation: "Viia kannatanu värske õhu kätte ja hoida puhkeasendis.",
    skinContact: "Pesta rohke vee ja seebiga.",
    eyeContact: "Loputada ettevaatlikult veega mitme minuti jooksul.",
    ingestion: "Loputada suu. Mitte kutsuda esile oksendamist.",
  },
  fireResponse: {
    extinguishingMedia: "Alkoholikindel vaht, CO2, kuivkemikaal.",
    specialHazards: "Aurud võivad moodustada plahvatusohtliku segu õhuga.",
    protectiveEquipment: "Kanda isoleerivat hingamisaparaati ja täiskaitseriietust.",
  },
  spillHandling: {
    personalPrecautions: "Eemaldada süüteallikad. Tagada ventilatsioon.",
    environmentalPrecautions: "Vältida sattumist kanalisatsiooni.",
    cleanupMethods: "Imada inertse absorbendiga ja koguda märgistatud anumasse.",
  },
  handlingStorage: {
    safeHandling: "Kasutada ainult hästi ventileeritud kohas.",
    safeStorage: "Hoida tihedalt suletuna jahedas tuleohutus kapis.",
    incompatibleMaterials: "Tugevad oksüdeerijad.",
  },
  exposureControl: {
    exposureLimits: "Atsetoon 8h TWA: 500 ppm.",
    engineeringControls: "Kohtäratõmme, üldventilatsioon.",
    ppe: "Nitriilkindad, kaitseprillid, laborikittel.",
  },
  composition: {
    components: [
      {
        substanceName: "Acetone",
        casNumber: "67-64-1",
        ecNumber: "200-662-2",
        concentrationMin: "95",
        concentrationMax: "100",
      },
    ],
  },
  transportDisposal: {
    unNumber: "UN1090",
    transportHazardClass: "3",
    packingGroup: "II",
    wasteHandling: "Käidelda ohtlike jäätmetena vastavalt kohalikele nõuetele.",
  },
};

const ammoniaPayload: MiniSdsPayload = {
  ...acetonePayload,
  document: {
    productName: "Ammonia Solution 25%",
    supplierNameRaw: "Merck",
    language: "en",
    countryFormat: "EE",
    revisionDate: "2025-11-02",
    expiryDate: "2028-11-02",
    status: "pending_review",
  },
  summary: {
    intendedUse: "Puhastus- ja protsessikemikaal.",
    signalWord: "Warning",
    physicalState: "liquid",
    emergencyPhone: "+372 16662",
  },
  hazards: {
    hazardStatements: ["H314 Causes severe skin burns and eye damage"],
    precautionaryStatements: ["P260 Do not breathe vapours", "P303+P361+P353 IF ON SKIN"],
    pictograms: ["GHS05"],
  },
  composition: {
    components: [
      {
        substanceName: "Ammonia",
        casNumber: "7664-41-7",
        ecNumber: "231-635-3",
        concentrationMin: "20",
        concentrationMax: "25",
      },
    ],
  },
};

export const miniSdsDocuments: MiniSdsDocument[] = [
  {
    id: "SDS-001",
    productName: "Acetone",
    supplierName: "Sigma-Aldrich",
    revisionDate: "2026-03-10",
    language: "et",
    countryFormat: "EE",
    status: "ready",
    payload: acetonePayload,
  },
  {
    id: "SDS-002",
    productName: "Ammonia Solution 25%",
    supplierName: "Merck",
    revisionDate: "2025-11-02",
    language: "en",
    countryFormat: "EE",
    status: "draft",
    payload: ammoniaPayload,
  },
];
