import { build, fake } from 'test-data-bot';

const mockGuestRegistrationResponseBuilder = build().fields({
  id: fake((f) => f.random.number()),
  user_id: fake((f) => f.random.number()),
  token: fake((f) => f.random.uuid()),
  expires_at: fake((f) => f.date.future()),
  created_at: fake((f) => f.date.past()),
  updated_at: fake((f) => f.date.past()),
});

export const mockGuestRegistrationResponse = mockGuestRegistrationResponseBuilder();
