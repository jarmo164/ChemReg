export type MiniSdsStatus = "draft" | "ready";

export type MiniSdsDocument = {
  id: string;
  productName: string;
  supplierName: string;
  revisionDate: string;
  language: string;
  countryFormat: string;
  status: MiniSdsStatus;
  payload: MiniSdsPayload;
};

export type MiniSdsPayload = {
  document: {
    productName: string;
    supplierNameRaw: string;
    language: string;
    countryFormat: string;
    revisionDate: string;
    expiryDate: string;
    status: "active" | "pending_review" | "archived";
  };
  summary: {
    intendedUse: string;
    signalWord: string;
    physicalState: string;
    emergencyPhone: string;
  };
  hazards: {
    hazardStatements: string[];
    precautionaryStatements: string[];
    pictograms: string[];
  };
  firstAid: {
    inhalation: string;
    skinContact: string;
    eyeContact: string;
    ingestion: string;
  };
  fireResponse: {
    extinguishingMedia: string;
    specialHazards: string;
    protectiveEquipment: string;
  };
  spillHandling: {
    personalPrecautions: string;
    environmentalPrecautions: string;
    cleanupMethods: string;
  };
  handlingStorage: {
    safeHandling: string;
    safeStorage: string;
    incompatibleMaterials: string;
  };
  exposureControl: {
    exposureLimits: string;
    engineeringControls: string;
    ppe: string;
  };
  composition: {
    components: Array<{
      substanceName: string;
      casNumber: string;
      ecNumber: string;
      concentrationMin: string;
      concentrationMax: string;
    }>;
  };
  transportDisposal: {
    unNumber: string;
    transportHazardClass: string;
    packingGroup: string;
    wasteHandling: string;
  };
};
