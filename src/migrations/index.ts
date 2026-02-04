import * as migration_20260204_191002 from './20260204_191002';

export const migrations = [
  {
    up: migration_20260204_191002.up,
    down: migration_20260204_191002.down,
    name: '20260204_191002'
  },
];
