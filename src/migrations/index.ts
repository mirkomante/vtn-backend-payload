import * as migration_20260204_191002 from './20260204_191002';
import * as migration_20260221_125418 from './20260221_125418';
import * as migration_20260221_163732 from './20260221_163732';
import * as migration_20260221_164516 from './20260221_164516';
import * as migration_20260221_165818 from './20260221_165818';
import * as migration_20260228_121154 from './20260228_121154';
import * as migration_20260301_094851 from './20260301_094851';
import * as migration_20260301_112246 from './20260301_112246';
import * as migration_20260301_114921 from './20260301_114921';
import * as migration_20260301_131512_add_order_fields from './20260301_131512_add_order_fields';
import * as migration_20260301_150108_create_ordinamento_menu from './20260301_150108_create_ordinamento_menu';

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
  {
    up: migration_20260221_163732.up,
    down: migration_20260221_163732.down,
    name: '20260221_163732',
  },
  {
    up: migration_20260221_164516.up,
    down: migration_20260221_164516.down,
    name: '20260221_164516',
  },
  {
    up: migration_20260221_165818.up,
    down: migration_20260221_165818.down,
    name: '20260221_165818',
  },
  {
    up: migration_20260228_121154.up,
    down: migration_20260228_121154.down,
    name: '20260228_121154',
  },
  {
    up: migration_20260301_094851.up,
    down: migration_20260301_094851.down,
    name: '20260301_094851',
  },
  {
    up: migration_20260301_112246.up,
    down: migration_20260301_112246.down,
    name: '20260301_112246',
  },
  {
    up: migration_20260301_114921.up,
    down: migration_20260301_114921.down,
    name: '20260301_114921',
  },
  {
    up: migration_20260301_131512_add_order_fields.up,
    down: migration_20260301_131512_add_order_fields.down,
    name: '20260301_131512_add_order_fields',
  },
  {
    up: migration_20260301_150108_create_ordinamento_menu.up,
    down: migration_20260301_150108_create_ordinamento_menu.down,
    name: '20260301_150108_create_ordinamento_menu'
  },
];
