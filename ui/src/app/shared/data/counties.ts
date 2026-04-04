// Comprehensive Kenya county, sub-county, and ward data
export interface Ward {
  name: string;
}

export interface SubCounty {
  name: string;
  wards: Ward[];
}

export interface County {
  name: string;
  subCounties: SubCounty[];
}

export const COUNTIES: County[] = [
  {
    name: 'Kajiado',
    subCounties: [
      {
        name: 'Kajiado North',
        wards: [
          { name: 'Oloolua' },
          { name: 'Enkarasha' },
          { name: 'Illoodokilani' },
          { name: 'Inkisanjani' },
        ]
      },
      {
        name: 'Kajiado Central',
        wards: [
          { name: 'Kitengela' },
          { name: 'Magadi' },
          { name: 'Ngong' },
          { name: 'Isinya' },
          { name: 'Oibor' },
        ]
      },
      {
        name: 'Kajiado East',
        wards: [
          { name: 'Imaroro' },
          { name: 'Oloolua' },
          { name: 'Oltepesi' },
          { name: 'Ongata Rongai' },
        ]
      },
      {
        name: 'Kajiado South',
        wards: [
          { name: 'Loitokitok' },
          { name: 'Kimana' },
          { name: 'Amboseli' },
          { name: 'Entonet' },
        ]
      },
      {
        name: 'Kajiado West',
        wards: [
          { name: 'Kajiado' },
          { name: 'Daraja Mbili' },
          { name: 'Oloosirkon' },
          { name: 'Shompole' },
        ]
      },
    ]
  },
];

export function getCountyNames(): string[] {
  return COUNTIES.map(county => county.name);
}

export function getSubCountiesByCounty(countyName: string): string[] {
  const county = COUNTIES.find(c => c.name === countyName);
  return county ? county.subCounties.map(sc => sc.name) : [];
}

export function getWardsBySubCounty(countyName: string, subCountyName: string): string[] {
  const county = COUNTIES.find(c => c.name === countyName);
  if (!county) return [];
  
  const subCounty = county.subCounties.find(sc => sc.name === subCountyName);
  return subCounty ? subCounty.wards.map(w => w.name) : [];
}
