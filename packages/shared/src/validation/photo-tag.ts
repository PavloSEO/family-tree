import { z } from "zod";
import { uuidSchema } from "./common.js";

function refineTagBox(
  v: { x: number; y: number; width: number; height: number },
  ctx: z.RefinementCtx,
): void {
  const eps = 1e-6;
  if (v.x < -eps || v.y < -eps) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "x и y не могут быть отрицательными",
    });
  }
  if (v.x + v.width > 1 + eps || v.y + v.height > 1 + eps) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Прямоугольник должен помещаться в единичный кадр (нормализованные координаты 0–1)",
    });
  }
}

export const photoTagCreateSchema = z
  .object({
    personId: uuidSchema,
    x: z.number().finite(),
    y: z.number().finite(),
    width: z.number().positive().finite(),
    height: z.number().positive().finite(),
  })
  .superRefine(refineTagBox);

export type PhotoTagCreate = z.infer<typeof photoTagCreateSchema>;

export const photoTagSchema = z
  .object({
    id: uuidSchema,
    photoId: uuidSchema,
    personId: uuidSchema,
    x: z.number().finite(),
    y: z.number().finite(),
    width: z.number().positive().finite(),
    height: z.number().positive().finite(),
  })
  .superRefine(refineTagBox);

export type PhotoTag = z.infer<typeof photoTagSchema>;
