import type { TFunction } from "i18next";
import { z } from "zod";

const bloodTypeEnum = z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);

export function createPersonFormFieldsSchema(t: TFunction<"person">) {
  return z.object({
    firstName: z.string().min(1, t("validation.firstNameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    gender: z.enum(["male", "female"]),
    patronymic: z.string(),
    maidenName: z.string(),
    dateOfBirth: z.string(),
    dateOfDeath: z.string(),
    birthPlace: z.string(),
    currentLocation: z.string(),
    country: z.string(),
    phone: z.string(),
    email: z.union([
      z.literal(""),
      z.string().email(t("validation.invalidEmail")),
    ]),
    bio: z.string(),
    occupation: z.string(),
    bloodType: z.union([z.literal(""), bloodTypeEnum]),
    hobbiesLines: z.string(),
    localizedNamesJson: z.string(),
    socialLinksJson: z.string(),
    customFieldsJson: z.string(),
  });
}

export type PersonFormInput = z.infer<
  ReturnType<typeof createPersonFormFieldsSchema>
>;

export const PERSON_FORM_DEFAULTS: PersonFormInput = {
  firstName: "",
  lastName: "",
  gender: "male",
  patronymic: "",
  maidenName: "",
  dateOfBirth: "",
  dateOfDeath: "",
  birthPlace: "",
  currentLocation: "",
  country: "",
  phone: "",
  email: "",
  bio: "",
  occupation: "",
  bloodType: "",
  hobbiesLines: "",
  localizedNamesJson: "",
  socialLinksJson: "[]",
  customFieldsJson: "{}",
};
