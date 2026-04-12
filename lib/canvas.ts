export type Area = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * react-image-crop reports pixel crops in the coordinate system of the
 * displayed &lt;img&gt; box (same basis as getBoundingClientRect width/height).
 * Canvas drawImage needs source rectangles in natural image pixels.
 * This maps between the two, accounting for CSS object-fit (contain, cover, etc.).
 */
export function mapPixelCropToNatural(img: HTMLImageElement, crop: Area): Area {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const rect = img.getBoundingClientRect();
  const ew = rect.width;
  const eh = rect.height;

  if (!nw || !nh || !ew || !eh || crop.width <= 0 || crop.height <= 0) {
    return { ...crop };
  }

  const fit = (getComputedStyle(img).objectFit || "fill") as string;

  const mapFill = (): Area => {
    const scaleX = nw / ew;
    const scaleY = nh / eh;
    return {
      x: crop.x * scaleX,
      y: crop.y * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY,
    };
  };

  let mapped: Area;

  if (fit === "contain" || fit === "scale-down") {
    let scale = Math.min(ew / nw, eh / nh);
    if (fit === "scale-down") scale = Math.min(scale, 1);
    const rw = nw * scale;
    const rh = nh * scale;
    const ox = (ew - rw) / 2;
    const oy = (eh - rh) / 2;
    mapped = {
      x: (crop.x - ox) / scale,
      y: (crop.y - oy) / scale,
      width: crop.width / scale,
      height: crop.height / scale,
    };
  } else if (fit === "cover") {
    const scale = Math.max(ew / nw, eh / nh);
    const rw = nw * scale;
    const rh = nh * scale;
    const ox = (ew - rw) / 2;
    const oy = (eh - rh) / 2;
    mapped = {
      x: (crop.x - ox) / scale,
      y: (crop.y - oy) / scale,
      width: crop.width / scale,
      height: crop.height / scale,
    };
  } else {
    mapped = mapFill();
  }

  let { x: sx, y: sy, width: sw, height: sh } = mapped;
  sx = Math.max(0, Math.min(sx, nw));
  sy = Math.max(0, Math.min(sy, nh));
  sw = Math.max(1, Math.min(sw, nw - sx));
  sh = Math.max(1, Math.min(sh, nh - sy));

  return { x: sx, y: sy, width: sw, height: sh };
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputFormat: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
  /** The same &lt;img&gt; the user cropped; required for correct scaling / object-fit. */
  sourceImageEl?: HTMLImageElement | null,
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  const natural =
    sourceImageEl?.naturalWidth && sourceImageEl.naturalHeight
      ? mapPixelCropToNatural(sourceImageEl, pixelCrop)
      : pixelCrop;

  const cw = Math.max(1, Math.round(natural.width));
  const ch = Math.max(1, Math.round(natural.height));
  canvas.width = cw;
  canvas.height = ch;

  ctx.drawImage(
    image,
    natural.x,
    natural.y,
    natural.width,
    natural.height,
    0,
    0,
    cw,
    ch,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), outputFormat, 0.95);
  });
}
