import type { BackendSdsStatus, SdsFile } from '../../api/sds';
import type { ChemicalCardDraft } from '../../utils/miniSdsPdf';

export type ChemicalCardForm = ChemicalCardDraft;

export type SdsStatus = 'current' | 'expiring_soon' | 'expired';

export type MiniSdsMode = 'create' | 'edit';

export type SdsListRow = {
  id: string;
  productName: string;
  casNumber: string;
  revision: string;
  supplierName: string;
  expiryDate: string;
  status: SdsStatus;
  currentFile: SdsFile | null;
};

export type MiniSdsForm = {
  productName: string;
  supplierNameRaw: string;
  language: string;
  countryFormat: string;
  revisionDate: string;
  expiryDate: string;
  status: BackendSdsStatus;
  section1Identification: string;
  section2Hazards: string;
  section3Composition: string;
  section4FirstAid: string;
  section5Firefighting: string;
  section6AccidentalRelease: string;
  section7HandlingStorage: string;
  section8ExposureControl: string;
};

export type SectionKey =
  | 'section1Identification'
  | 'section2Hazards'
  | 'section3Composition'
  | 'section4FirstAid'
  | 'section5Firefighting'
  | 'section6AccidentalRelease'
  | 'section7HandlingStorage'
  | 'section8ExposureControl';

export type SectionDefinition = {
  key: SectionKey;
  number: number;
  title: string;
};

export type FilterCounts = {
  all: number;
  current: number;
  expiring_soon: number;
  expired: number;
};