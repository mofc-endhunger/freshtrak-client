export interface ExternalAgencyHour {
  hour_type: string;
  freq: string;
  byday: string;
  start_time: string;
  end_time: string;
  sort_order: number;
}

export interface ExternalAgency {
  id: string;
  name: string;
  nickname: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  latitude: number;
  longitude: number;
  estimated_distance: number;
  images: string[];
  hours: ExternalAgencyHour[];
  system_id: string;
  source: string;
  org_name: string;
  description: string;
  website: string;
  directory_url: string;
  service_category: string;
  freshtrak_loc_id: string;
  last_updated: string;
  attributes: Record<string, any>;
}

export interface ExternalAgenciesApiResponse {
  external_agencies: ExternalAgency[];
}
