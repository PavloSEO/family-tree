# 09 — Photo system

---

## Storage

Filesystem, Docker volume `/data/photos/`.

Directory layout:
```
/data/photos/
  {personId}/
    {albumId}/
      {photoId}.jpg         <- original (EXIF-rotated)
      thumbs/
        {photoId}.jpg       <- 300px thumbnail
  shared/
    {albumId}/
      {photoId}.jpg
      thumbs/
        {photoId}.jpg
```

`shared/` — albums not tied to a person card.

## Upload

Endpoint: `POST /api/photos/upload` (multipart/form-data).

Fields:
- `albumId` (required) — album UUID
- `file` (required) — image file
- `description` (optional)
- `dateTaken` (optional, ISO date)
- `location` (optional)

### Processing pipeline

```
1. MIME validation
   Allowed: image/jpeg, image/png, image/webp
   Check: magic bytes, NOT extension only
   -> Error: "Unsupported format"

2. Size validation
   Max: 10 MB (env MAX_UPLOAD_SIZE_MB)
   -> Error: "File too large. Maximum 10 MB."

3. EXIF parsing (exifr)
   Extract:
   - DateTimeOriginal -> dateTaken (if not set manually)
   - GPSLatitude + GPSLongitude -> location (if not set)
   - Orientation -> auto-rotate in step 4

4. Save original (sharp)
   sharp(buffer).rotate().toFile(filePath)
   .rotate() with no args = EXIF auto-rotate

5. Generate thumbnail (sharp)
   sharp(buffer).rotate().resize(300, 300, {
     fit: 'inside',
     withoutEnlargement: true
   }).toFile(thumbPath)

6. DB insert
   INSERT INTO photos (id, album_id, src, thumbnail, ...)

7. Response
   { id, src, thumbnail, dateTaken, location }
```

## File serving

Endpoint: `GET /api/photos/file/*`

Hono middleware serves files under `/data/photos/`. Directory traversal guard: resolved path must start with `/data/photos/`.

## People tagging

Coordinates are normalized (0.0–1.0) relative to image dimensions:
- `x` — left edge of region
- `y` — top edge of region
- `width` — region width
- `height` — region height

Normalized coords scale with the image at any display size.

### Tagging UI (admin only)

1. Open photo in edit mode
2. Canvas overlay on top of image
3. mousedown + mousemove — draw rectangle
4. mouseup — open dropdown to pick person (`md-menu` with name search)
5. Pick person — POST /api/photos/:id/tag
6. Display: semi-transparent frame + name

### Showing tags (everyone)

- Semi-transparent frames (border: 2px solid, background: rgba) on photo
- Hover/tap: tooltip with name + mini avatar + link to card
- Toggle “Hide tags” (`md-switch`)

## Albums

Two types:
- Personal: `owner_id = person_uuid` — tied to a card, shown in profile and global section
- Shared: `owner_id = null` — global section only

UI:
- Album grid: CSS Grid, `md-elevated-card` (labs) with cover, title, year
- Click — photo gallery (yet-another-react-lightbox)

## Fallbacks

| Situation | Handling |
|----------|----------|
| No thumbnail | Generated on upload. If missing — show original |
| No taggedPersons | No frames |
| tag.personId points to deleted card | Show “Unknown” |
| No dateTaken, year set | Show year |
| No dateTaken and no year | “Date unknown” |
| Broken src | Placeholder: gray box + Material Symbol `broken_image` |
| Photo < 100px | Warning on upload |
