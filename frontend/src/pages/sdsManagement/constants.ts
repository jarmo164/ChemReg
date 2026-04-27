import type { SectionDefinition } from './types';

export const SECTION_DEFINITIONS: readonly SectionDefinition[] = [
  { key: 'section1Identification', number: 1, title: 'Identification' },
  { key: 'section2Hazards', number: 2, title: 'Hazard identification' },
  { key: 'section3Composition', number: 3, title: 'Composition / information on ingredients' },
  { key: 'section4FirstAid', number: 4, title: 'First aid measures' },
  { key: 'section5Firefighting', number: 5, title: 'Firefighting measures' },
  { key: 'section6AccidentalRelease', number: 6, title: 'Accidental release measures' },
  { key: 'section7HandlingStorage', number: 7, title: 'Handling and storage' },
  { key: 'section8ExposureControl', number: 8, title: 'Exposure controls / personal protection' },
] as const;

export const TABLE_COLUMNS = [
  'SDS ID',
  'Chemical Name',
  'CAS Number',
  'Revision',
  'Manufacturer',
  'Expiry Date',
  'Status',
  'Actions',
] as const;