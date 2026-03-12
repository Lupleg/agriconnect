export type ZambiaFarmingAreaOption = {
  id: string;
  province: string;
  district: string;
  label: string;
  value: string;
};

const option = (province: string, district: string): ZambiaFarmingAreaOption => ({
  id: `${province}:${district}`.toLowerCase().replace(/\s+/g, '-'),
  province,
  district,
  label: `${district} (${province})`,
  value: `${district}, ${province}`,
});

export const ZAMBIA_PROVINCES = [
  'Central Province',
  'Copperbelt Province',
  'Eastern Province',
  'Luapula Province',
  'Lusaka Province',
  'Muchinga Province',
  'Northern Province',
  'North-Western Province',
  'Southern Province',
  'Western Province',
] as const;

// Curated, not exhaustive. These are commonly referenced agricultural districts/areas.
export const ZAMBIA_MAJOR_FARMING_AREAS: ZambiaFarmingAreaOption[] = [
  option('Central Province', 'Mkushi'),
  option('Central Province', 'Kabwe'),
  option('Central Province', 'Kapiri Mposhi'),
  option('Central Province', 'Serenje'),
  option('Central Province', 'Chibombo'),
  option('Central Province', 'Mumbwa'),

  option('Eastern Province', 'Chipata'),
  option('Eastern Province', 'Katete'),
  option('Eastern Province', 'Petauke'),
  option('Eastern Province', 'Lundazi'),
  option('Eastern Province', 'Chadiza'),

  option('Southern Province', 'Mazabuka'),
  option('Southern Province', 'Monze'),
  option('Southern Province', 'Choma'),
  option('Southern Province', 'Kalomo'),
  option('Southern Province', 'Namwala'),

  option('Lusaka Province', 'Chongwe'),
  option('Lusaka Province', 'Kafue'),
  option('Lusaka Province', 'Rufunsa'),

  option('Copperbelt Province', 'Mpongwe'),
  option('Copperbelt Province', 'Masaiti'),
  option('Copperbelt Province', 'Lufwanyama'),

  option('Northern Province', 'Kasama'),
  option('Northern Province', 'Mbala'),
  option('Northern Province', 'Mungwi'),

  option('Muchinga Province', 'Mpika'),
  option('Muchinga Province', 'Chinsali'),
  option('Muchinga Province', 'Nakonde'),

  option('North-Western Province', 'Solwezi'),
  option('North-Western Province', 'Mufumbwe'),
  option('North-Western Province', 'Kasempa'),

  option('Western Province', 'Mongu'),
  option('Western Province', 'Kalabo'),
  option('Western Province', 'Senanga'),

  option('Luapula Province', 'Mansa'),
  option('Luapula Province', 'Samfya'),
  option('Luapula Province', 'Kawambwa'),
];

