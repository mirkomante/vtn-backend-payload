import * as migration_20260204_191002 from './20260204_191002';
import * as migration_20260221_125418 from './20260221_125418';

export const migrations = [
  {
    up: migration_20260204_191002.up,
    down: migration_20260204_191002.down,
    name: '20260204_191002',
  },
  {
    up: migration_20260221_125418.up,
    down: migration_20260221_125418.down,
    name: '20260221_125418',
  },
];
