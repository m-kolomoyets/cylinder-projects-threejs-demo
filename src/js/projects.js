import { faker } from '@faker-js/faker';

export const MOCK_PROJECTS = Array.from({ length: 100 }, (_, index) => {
  return {
    id: faker.string.uuid(),
    name: `Project ${index + 1}`,
    priority: faker.number.int({
      min: 1, max: 3
    })
  };
});
