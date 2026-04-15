import { mainPhotoSrc } from "./person-main-photo-src.js";
import {
  personPlaceholderPath,
  type PersonPlaceholderGender,
} from "./person-placeholder.js";

/**
 * URL аватара: фото с API или SVG-заглушка по полу и признаку смерти.
 * При `photoBroken === true` всегда заглушка (ошибка загрузки файла).
 */
export function personAvatarSrc(params: {
  mainPhoto: string | null;
  gender: PersonPlaceholderGender;
  dead: boolean;
  photoBroken: boolean;
}): string {
  if (!params.photoBroken) {
    const url = mainPhotoSrc(params.mainPhoto);
    if (url) {
      return url;
    }
  }
  return personPlaceholderPath(params.gender, params.dead);
}
