import { build, fake } from 'test-data-bot';

const mockFoodbankTextBuilder = build('FbText').fields({
  text: fake((f) => f.name.title()),
  image_resource: fake((f) => f.image.imageUrl()),
  link_href: fake((f) => f.internet.url()),
});

const mockFoodBankBuilder = build('Food Bank').fields({
  address: fake((f) => f.address.streetAddress()),
  city: fake((f) => f.address.city()),
  state: fake((f) => f.address.state()),
  zip: fake((f) => f.address.zipCode()),
  name: fake((f) => f.random.word()),
  nickname: fake((f) => f.random.word()),
  display_url: fake((f) => f.internet.url()),
  fb_agency_locator_url: fake((f) => f.internet.url()),
  fb_url: fake((f) => f.internet.url()),
  fb_fano_url: fake((f) => f.internet.url()),
  foodbank_texts: [mockFoodbankTextBuilder()],
});

export const mockFoodBank = mockFoodBankBuilder();
export const mockFoodbankText = mockFoodbankTextBuilder();
