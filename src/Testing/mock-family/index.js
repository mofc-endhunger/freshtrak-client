import { build, fake } from 'test-data-bot';

const mockFamilyBuilder = build('Family').fields({
  id: fake((f) => f.random.number()),
  first_name: fake((f) => f.name.firstName()),
  last_name: fake((f) => f.name.lastName()),
  zip_code: fake((f) => f.address.zipCode()),
  adults_in_household: 2,
  identification_code: 'W3R-B2S',
  user_type: 'guest',
  created_at: fake((f) => f.date.past()),
  updated_at: fake((f) => f.date.past()),
  middle_name: null,
  suffix: null,
  date_of_birth: fake((f) => f.date.past()),
  gender: null,
  phone: fake((f) => f.phone.phoneNumber()),
  permission_to_text: null,
  email: fake((f) => f.internet.email()),
  permission_to_email: null,
  address_line_1: fake((f) => f.address.streetAddress()),
  address_line_2: null,
  city: fake((f) => f.address.city()),
  state: fake((f) => f.address.state()),
  license_plate: null,
  seniors_in_household: null,
  children_in_household: null,
});

export const mockFamily = mockFamilyBuilder();
