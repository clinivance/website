import type { ImageMetadata } from 'astro';
import type { HTMLAttributes } from 'astro/types';
import { getImage } from 'astro:assets';
import { parseUrl, transformUrl } from 'unpic';

type Layout = 'constrained' | 'contained' | 'cover' | 'fixed' | 'fullWidth' | 'responsive';

export type AttributesProps = {} & HTMLAttributes<'img'>;

export type ImageProps = {
  alt?: null | string;
  aspectRatio?: null | number | string;
  decoding?: 'async' | 'auto' | 'sync' | null;
  fetchpriority?: 'auto' | 'high' | 'low' | null;
  height?: null | number | string;
  layout?: Layout;
  loading?: 'eager' | 'lazy' | null;
  sizes?: null | string;
  src?: ImageMetadata | null | string;
  srcset?: null | string;

  style?: string;
  width?: null | number | string;
  widths?: null | number[];
} & Omit<HTMLAttributes<'img'>, 'src'>;

export type ImagesOptimizer = (
  image: ImageMetadata | string,
  breakpoints: number[],
  width?: number,
  height?: number
) => Promise<{ src: string; width: number }[]>;

/* ******* */
const config = {
  deviceSizes: [
    640, // older and lower-end phones
    750, // iPhone 6-8
    828, // iPhone XR/11
    960, // older horizontal phones
    1080, // iPhone 6-8 Plus
    1280, // 720p
    1668, // Various iPads
    1920, // 1080p
    2048, // QXGA
    2560, // WQXGA
    3200, // QHD+
    3840, // 4K
    4480, // 4.5K
    5120, // 5K
    6016 // 6K
  ],

  formats: ['image/webp'],

  // FIXME: Use this when image.width is minor than deviceSizes
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
};

const computeHeight = (width: number, aspectRatio: number) => {
  return Math.floor(width / aspectRatio);
};

const parseAspectRatio = (aspectRatio: null | number | string | undefined): number | undefined => {
  if (typeof aspectRatio === 'number') return aspectRatio;

  if (typeof aspectRatio === 'string') {
    const match = /(\d+)\s*[/:]\s*(\d+)/.exec(aspectRatio);

    if (match) {
      const [, num, den] = match.map(Number);
      if (den && !isNaN(num)) return num / den;
    } else {
      const numericValue = parseFloat(aspectRatio);
      if (!isNaN(numericValue)) return numericValue;
    }
  }

  return undefined;
};

/**
 * Gets the `sizes` attribute for an image, based on the layout and width
 */
export const getSizes = (width?: number, layout?: Layout): string | undefined => {
  if (!width || !layout) {
    return undefined;
  }
  switch (layout) {
    // If screen is wider than the max size, image width is the max size,
    // otherwise it's the width of the screen
    case `constrained`:
      return `(min-width: ${width}px) ${width}px, 100vw`;

    // Image is always the same width, whatever the size of the screen
    case `fixed`:
      return `${width}px`;

    // Image is always the width of the screen
    case `fullWidth`:
      return `100vw`;

    default:
      return undefined;
  }
};

const pixelate = (value?: number) => (value || value === 0 ? `${value}px` : undefined);

const getStyle = ({
  aspectRatio,
  background,
  height,
  layout,
  objectFit = 'cover',
  objectPosition = 'center',
  width
}: {
  aspectRatio?: number;
  background?: string;
  height?: number;
  layout?: string;
  objectFit?: string;
  objectPosition?: string;
  width?: number;
}) => {
  const styleEntries: [prop: string, value: string | undefined][] = [
    ['object-fit', objectFit],
    ['object-position', objectPosition]
  ];

  // If background is a URL, set it to cover the image and not repeat
  if (background?.startsWith('https:') || background?.startsWith('http:') || background?.startsWith('data:')) {
    styleEntries.push(['background-image', `url(${background})`]);
    styleEntries.push(['background-size', 'cover']);
    styleEntries.push(['background-repeat', 'no-repeat']);
  } else {
    styleEntries.push(['background', background]);
  }
  if (layout === 'fixed') {
    styleEntries.push(['width', pixelate(width)]);
    styleEntries.push(['height', pixelate(height)]);
    styleEntries.push(['object-position', 'top left']);
  }
  if (layout === 'constrained') {
    styleEntries.push(['max-width', pixelate(width)]);
    styleEntries.push(['max-height', pixelate(height)]);
    styleEntries.push(['aspect-ratio', aspectRatio ? `${aspectRatio}` : undefined]);
    styleEntries.push(['width', '100%']);
  }
  if (layout === 'fullWidth') {
    styleEntries.push(['width', '100%']);
    styleEntries.push(['aspect-ratio', aspectRatio ? `${aspectRatio}` : undefined]);
    styleEntries.push(['height', pixelate(height)]);
  }
  if (layout === 'responsive') {
    styleEntries.push(['width', '100%']);
    styleEntries.push(['height', 'auto']);
    styleEntries.push(['aspect-ratio', aspectRatio ? `${aspectRatio}` : undefined]);
  }
  if (layout === 'contained') {
    styleEntries.push(['max-width', '100%']);
    styleEntries.push(['max-height', '100%']);
    styleEntries.push(['object-fit', 'contain']);
    styleEntries.push(['aspect-ratio', aspectRatio ? `${aspectRatio}` : undefined]);
  }
  if (layout === 'cover') {
    styleEntries.push(['max-width', '100%']);
    styleEntries.push(['max-height', '100%']);
  }

  const styles = Object.fromEntries(styleEntries.filter(([, value]) => value));

  return Object.entries(styles)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
};

const getBreakpoints = ({
  breakpoints,
  layout,
  width
}: {
  breakpoints?: number[];
  layout: Layout;
  width?: number;
}): number[] => {
  if (layout === 'fullWidth' || layout === 'cover' || layout === 'responsive' || layout === 'contained') {
    return breakpoints || config.deviceSizes;
  }
  if (!width) {
    return [];
  }
  const doubleWidth = width * 2;
  if (layout === 'fixed') {
    return [width, doubleWidth];
  }
  if (layout === 'constrained') {
    return [
      // Always include the image at 1x and 2x the specified width
      width,
      doubleWidth,
      // Filter out any resolutions that are larger than the double-res image
      ...(breakpoints || config.deviceSizes).filter((w) => w < doubleWidth)
    ];
  }

  return [];
};

/* ** */
export const astroAsseetsOptimizer: ImagesOptimizer = async (image, breakpoints, _width, _height) => {
  if (!image) {
    return [];
  }

  return Promise.all(
    breakpoints.map(async (w: number) => {
      const url = (await getImage({ inferSize: true, src: image, width: w })).src;
      return {
        src: url,
        width: w
      };
    })
  );
};

export const isUnpicCompatible = (image: string) => {
  return typeof parseUrl(image) !== 'undefined';
};

/* ** */
export const unpicOptimizer: ImagesOptimizer = async (image, breakpoints, width, height) => {
  if (!image || typeof image !== 'string') {
    return [];
  }

  const urlParsed = parseUrl(image);
  if (!urlParsed) {
    return [];
  }

  return Promise.all(
    breakpoints.map(async (w: number) => {
      const url =
        transformUrl({
          cdn: urlParsed.cdn,
          height: width && height ? computeHeight(w, width / height) : height,
          url: image,
          width: w
        }) || image;
      return {
        src: String(url),
        width: w
      };
    })
  );
};

/* ** */
export async function getImagesOptimized(
  image: ImageMetadata | string,
  { aspectRatio, height, layout = 'constrained', sizes, src: _, style = '', width, widths, ...rest }: ImageProps,
  transform: ImagesOptimizer = () => Promise.resolve([])
): Promise<{ attributes: AttributesProps; src: string }> {
  if (typeof image !== 'string') {
    width ||= Number(image.width) || undefined;
    height ||= typeof width === 'number' ? computeHeight(width, image.width / image.height) : undefined;
  }

  width = (width && Number(width)) || undefined;
  height = (height && Number(height)) || undefined;

  widths ||= config.deviceSizes;
  sizes ||= getSizes(Number(width) || undefined, layout);
  aspectRatio = parseAspectRatio(aspectRatio);

  // Calculate dimensions from aspect ratio
  if (aspectRatio) {
    if (width) {
      if (height) {
        /* empty */
      } else {
        height = width / aspectRatio;
      }
    } else if (height) {
      width = Number(height * aspectRatio);
    } else if (layout !== 'fullWidth') {
      // Fullwidth images have 100% width, so aspectRatio is applicable
      console.error('When aspectRatio is set, either width or height must also be set');
      console.error('Image', image);
    }
  } else if (width && height) {
    aspectRatio = width / height;
  } else if (layout !== 'fullWidth') {
    // Fullwidth images don't need dimensions
    console.error('Either aspectRatio or both width and height must be set');
    console.error('Image', image);
  }

  let breakpoints = getBreakpoints({ breakpoints: widths, layout: layout, width: width });
  breakpoints = [...new Set(breakpoints)].sort((a, b) => a - b);

  const srcset = (await transform(image, breakpoints, Number(width) || undefined, Number(height) || undefined))
    .map(({ src, width }) => `${src} ${width}w`)
    .join(', ');

  return {
    attributes: {
      height: height,
      sizes: sizes,
      srcset: srcset || undefined,
      style: `${getStyle({
        aspectRatio: aspectRatio,
        height: height,
        layout: layout,
        width: width
      })}${style ?? ''}`,
      width: width,
      ...rest
    },
    src: typeof image === 'string' ? image : image.src
  };
}
