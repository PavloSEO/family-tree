import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** `{ "en": { "firstName": "...", "lastName": "..." } }` */
export type LocalizedNamesJson = Record<
  string,
  { firstName: string; lastName: string }
>;

export type SocialLinkJson = { platform: string; url: string };

export const persons = sqliteTable(
  "persons",
  {
    id: text("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    patronymic: text("patronymic"),
    maidenName: text("maiden_name"),
    gender: text("gender", { enum: ["male", "female"] }).notNull(),
    dateOfBirth: text("date_of_birth"),
    dateOfDeath: text("date_of_death"),
    birthPlace: text("birth_place"),
    currentLocation: text("current_location"),
    country: text("country"),
    mainPhoto: text("main_photo"),
    bio: text("bio"),
    occupation: text("occupation"),
    bloodType: text("blood_type", {
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    }),
    phone: text("phone"),
    email: text("email"),
    localizedNames: text("localized_names", {
      mode: "json",
    }).$type<LocalizedNamesJson | null>(),
    hobbies: text("hobbies", { mode: "json" }).$type<string[] | null>(),
    socialLinks: text("social_links", {
      mode: "json",
    }).$type<SocialLinkJson[] | null>(),
    customFields: text("custom_fields", {
      mode: "json",
    }).$type<Record<string, string> | null>(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => ({
    nameIdx: index("idx_persons_name").on(t.firstName, t.lastName),
  }),
);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  login: text("login").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "viewer"] }).notNull(),
  linkedPersonId: text("linked_person_id").references(() => persons.id, {
    onDelete: "set null",
  }),
  status: text("status", { enum: ["active", "disabled"] }).notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  lastLoginAt: text("last_login_at"),
});

export const relationships = sqliteTable(
  "relationships",
  {
    id: text("id").primaryKey(),
    type: text("type", { enum: ["parent", "spouse"] }).notNull(),
    fromPersonId: text("from_person_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    toPersonId: text("to_person_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    marriageDate: text("marriage_date"),
    divorceDate: text("divorce_date"),
    isCurrentSpouse: integer("is_current_spouse", { mode: "boolean" }),
    notes: text("notes"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => ({
    fromIdx: index("idx_rel_from").on(t.fromPersonId),
    toIdx: index("idx_rel_to").on(t.toPersonId),
    typeIdx: index("idx_rel_type").on(t.type),
  }),
);

export const albums = sqliteTable("albums", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  year: integer("year"),
  ownerId: text("owner_id").references(() => persons.id, {
    onDelete: "set null",
  }),
  coverPhotoIndex: integer("cover_photo_index").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const photos = sqliteTable(
  "photos",
  {
    id: text("id").primaryKey(),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    src: text("src").notNull(),
    thumbnail: text("thumbnail"),
    description: text("description"),
    dateTaken: text("date_taken"),
    year: integer("year"),
    location: text("location"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => ({
    albumIdx: index("idx_photos_album").on(t.albumId),
  }),
);

export const taggedPersons = sqliteTable(
  "tagged_persons",
  {
    id: text("id").primaryKey(),
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    x: real("x").notNull(),
    y: real("y").notNull(),
    width: real("width").notNull(),
    height: real("height").notNull(),
  },
  (t) => ({
    photoIdx: index("idx_tagged_photo").on(t.photoId),
    personIdx: index("idx_tagged_person").on(t.personId),
  }),
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const loginAttempts = sqliteTable(
  "login_attempts",
  {
    id: text("id").primaryKey(),
    ip: text("ip").notNull(),
    login: text("login").notNull(),
    attemptedAt: text("attempted_at").notNull(),
    success: integer("success", { mode: "boolean" }).notNull().default(sql`0`),
  },
  (t) => ({
    ipAttemptedIdx: index("idx_login_ip").on(t.ip, t.attemptedAt),
  }),
);
