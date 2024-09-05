import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { load } from './(home).server';
import { FooterComponent } from './components/footer.component';
import { OnboardingComponent } from './components/onboarding.component';
import { MoreStoriesComponent } from './components/more-stories.component';
import { PortableTextComponent } from './components/portable-text.component';
import { RouterLink } from '@angular/router';
import { CoverImageComponent } from './components/cover-image';
import { DateComponent } from './components/date.component';
import { AvatarComponent } from './components/avatar.component';
import * as demo from '../../../sanity/lib/demo';

@Component({
  selector: 'intro',
  standalone: true,
  imports: [PortableTextComponent, PortableTextComponent],
  template: `
    <section
      class="mt-16 mb-16 flex flex-col items-center lg:mb-12 lg:flex-row lg:justify-between"
    >
      <h1
        class="text-balance text-6xl font-bold leading-tight tracking-tighter lg:pr-8 lg:text-8xl"
      >
        {{ title() || demo.title }}
      </h1>
      <h2 class="text-pretty mt-5 text-center text-lg lg:pl-8 lg:text-left">
        <portable-text class="prose-lg" [value]="descriptionToUse()" />
      </h2>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class IntroComponent {
  title = input<string | null | undefined>();
  description = input<any>();

  protected readonly demo = demo;

  descriptionToUse = computed(() =>
    this.description()?.length ? this.description() : demo.description,
  );
}

@Component({
  selector: 'hero-post',
  standalone: true,
  imports: [
    RouterLink,
    CoverImageComponent,
    DateComponent,
    AvatarComponent,
    AvatarComponent,
    DateComponent,
    CoverImageComponent,
  ],
  template: `
    <article>
      <a [routerLink]="['/posts', slug()]" class="group mb-8 block md:mb-16">
        <cover-image [image]="coverImage()" [priority]="true" />
      </a>
      <div class="mb-20 md:mb-28 md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8">
        <div>
          <h3 class="text-pretty mb-4 text-4xl leading-tight lg:text-6xl">
            <a [routerLink]="['/posts', slug()]" class="hover:underline">
              {{ title() }}
            </a>
          </h3>
          <div class="mb-4 text-lg md:mb-0">
            <date-component [dateString]="date()" />
          </div>
        </div>
        <div>
          @if (excerpt()) {
            <p class="text-pretty mb-4 text-lg leading-relaxed">
              {{ excerpt() }}
            </p>
          }
          @if (author()) {
            <avatar [name]="author().name" [picture]="author().picture" />
          }
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HeroPostComponent {
  title = input.required<string>();
  slug = input.required<string>();
  excerpt = input<string>();
  coverImage = input.required<any>();
  date = input.required<string>();
  author = input<any>();
}

@Component({
  selector: 'home-page',
  standalone: true,
  imports: [
    IntroComponent,
    HeroPostComponent,
    OnboardingComponent,
    MoreStoriesComponent,
    MoreStoriesComponent,
    FooterComponent,
  ],
  template: `
    <div class="container mx-auto px-5">
      <intro
        [title]="settings()?.title"
        [description]="settings()?.description"
      />
      @if (heroPost(); as post) {
        <hero-post
          [title]="post.title"
          [slug]="post.slug"
          [coverImage]="post.coverImage"
          [excerpt]="post.excerpt"
          [date]="post.date"
          [author]="post.author"
        />
      } @else {
        <onboarding />
      }
      @if (heroPost()?._id) {
        <aside>
          <h2
            class="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl"
          >
            More Stories
          </h2>
          <more-stories [moreStories]="posts()" />
        </aside>
      }
    </div>
    <footer app-footer [footer]="settings()?.footer"></footer>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  data = input.required<Awaited<ReturnType<typeof load>>>();

  settings = computed(() => this.data().settings);
  posts = computed(() => this.data().posts.slice(1));
  heroPost = computed(() => this.data().posts.at(0));
}
