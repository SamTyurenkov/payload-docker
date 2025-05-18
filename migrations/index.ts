import * as migration_20250518_144354_create_admin_user from './20250518_144354_create_admin_user';
import * as migration_20250518_152323_seed_test_projects from './20250518_152323_seed_test_projects';
import * as migration_20250518_190614_seed_test_homepage from './20250518_190614_seed_test_homepage';

export const migrations = [
  {
    up: migration_20250518_144354_create_admin_user.up,
    down: migration_20250518_144354_create_admin_user.down,
    name: '20250518_144354_create_admin_user',
  },
  {
    up: migration_20250518_152323_seed_test_projects.up,
    down: migration_20250518_152323_seed_test_projects.down,
    name: '20250518_152323_seed_test_projects',
  },
  {
    up: migration_20250518_190614_seed_test_homepage.up,
    down: migration_20250518_190614_seed_test_homepage.down,
    name: '20250518_190614_seed_test_homepage'
  },
];
