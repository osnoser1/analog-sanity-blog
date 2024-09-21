import createImageUrlBuilder from '@sanity/image-url';

import { dataset, projectId } from '../../sanity/lib/api';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

const imageBuilder = createImageUrlBuilder({ projectId, dataset });

export const urlForImage = (source: SanityImageSource) => {
  return imageBuilder?.image(source).auto('format').fit('max');
};

export function resolveOpenGraphImage(
  image: unknown,
  width = 1200,
  height = 627,
) {
  if (!image) {
    return undefined;
  }

  const url = urlForImage(image)?.width(1200).height(627).fit('crop').url();
  if (!url) {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { url, alt: (image as any)['alt'] as string, width, height };
}
