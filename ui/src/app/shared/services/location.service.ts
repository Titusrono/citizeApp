import { Injectable } from '@angular/core';

export interface SubCounty {
  name: string;
  wards: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  // Master list of subcounties and wards - Used consistently across registration, proposals, and votes
  private readonly SUBCOUNTIES: SubCounty[] = [
    { name: 'Kajiado North', wards: ['Oloolua', 'Enkarasha', 'Illoodokilani', 'Inkisanjani'] },
    { name: 'Kajiado Central', wards: ['Kitengela', 'Magadi', 'Ngong', 'Isinya', 'Oibor'] },
    { name: 'Kajiado East', wards: ['Imaroro', 'Oloolua', 'Oltepesi', 'Ongata Rongai'] },
    { name: 'Kajiado South', wards: ['Loitokitok', 'Kimana', 'Amboseli', 'Entonet'] },
    { name: 'Kajiado West', wards: ['Kajiado', 'Daraja Mbili', 'Oloosirkon', 'Shompole'] },
  ];

  constructor() {}

  /**
   * Get all subcounties
   */
  getSubCounties(): SubCounty[] {
    return this.SUBCOUNTIES;
  }

  /**
   * Get subcounty names only
   */
  getSubCountyNames(): string[] {
    return this.SUBCOUNTIES.map(sc => sc.name);
  }

  /**
   * Get wards for a specific subcounty
   */
  getWardsForSubCounty(subCountyName: string): string[] {
    const subCounty = this.SUBCOUNTIES.find(sc => sc.name === subCountyName);
    return subCounty ? subCounty.wards : [];
  }

  /**
   * Get all wards across all subcounties
   */
  getAllWards(): string[] {
    return this.SUBCOUNTIES.flatMap(sc => sc.wards);
  }

  /**
   * Validate if a subcounty exists
   */
  isValidSubCounty(subCountyName: string): boolean {
    return this.SUBCOUNTIES.some(sc => sc.name === subCountyName);
  }

  /**
   * Validate if a ward belongs to a subcounty
   */
  isValidWardForSubCounty(wardName: string, subCountyName: string): boolean {
    const wards = this.getWardsForSubCounty(subCountyName);
    return wards.includes(wardName);
  }

  /**
   * Get subcounty that contains a specific ward
   */
  getSubCountyForWard(wardName: string): string | null {
    for (const subCounty of this.SUBCOUNTIES) {
      if (subCounty.wards.includes(wardName)) {
        return subCounty.name;
      }
    }
    return null;
  }
}
