import {
  type ApplicationConfig,
  ENVIRONMENT_INITIALIZER,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import {
  withComponentInputBinding,
  withNavigationErrorHandler,
} from '@angular/router';

import { provideFileRouter } from '@analogjs/router';
import { provideSanityLoader } from '@limitless-angular/sanity/image-loader';
import { type InitializedClientConfig } from '@sanity/client';
import {
  provideSanity,
  withLivePreview,
} from '@limitless-angular/sanity/preview-kit';

import { cookieInterceptor } from './interceptors/cookies.interceptor';
import { client, getClient } from '../sanity/lib/client';
import { updateMetaTagsOnRouteChange } from './utils/meta-tags';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideFileRouter(
      withComponentInputBinding(),
      withNavigationErrorHandler(console.error),
    ),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([cookieInterceptor])),
    provideSanity(getClient, withLivePreview()),
    provideSanityLoader(client.config() as Required<InitializedClientConfig>),
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => updateMetaTagsOnRouteChange(),
    },
  ],
};
