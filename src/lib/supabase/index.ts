
// Export client
export { supabase } from './client';

// Export authentication functions
export { signUp, signIn, signOut, getSession } from './auth';

// Export project functions
export {
  createProjectInDB,
  getProjectsFromDB,
  updateProjectInDB,
  deleteProjectFromDB,
  deleteAllProjectsFromDB
} from './projects';

// Export sprint functions
export {
  createSprintInDB,
  getSprintsFromDB,
  updateSprintInDB,
  completeSprintInDB,
  deleteSprintFromDB
} from './sprints';

// Export column functions
export {
  getColumnsForSprint,
  createColumnInDB,
  deleteColumnFromDB
} from './columns';
