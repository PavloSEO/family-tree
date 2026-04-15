import type {
  Person,
  PersonCreate,
  PersonListQuery,
  PersonUpdate,
} from "../validation/person.js";

export type { Person, PersonCreate, PersonListQuery, PersonUpdate };

/** Группа возможных дубликатов (`GET /api/persons/duplicates`). */
export type PersonDuplicateGroup = {
  persons: Person[];
};

export {
  bloodTypeSchema,
  genderSchema,
  personCreateSchema,
  personListQuerySchema,
  personSchema,
  personUpdateSchema,
} from "../validation/person.js";
