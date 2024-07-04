import type { ImageMetadata } from 'astro';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { HTMLAttributes } from 'astro/types';

export type Post = {
  Content?: AstroComponentFactory;
  author?: string;
  category?: Taxonomy;
  content?: string;
  draft?: boolean;
  /** Optional summary of post content. */
  excerpt?: string;
  /** A unique ID number that identifies a post. */
  id: string;
  image?: ImageMetadata | string;
  metadata?: MetaData;
  permalink?: string;
  publishDate: Date;
  readingTime?: number;
  /** A post’s unique slug – part of the post’s URL based on its name, i.e. a post called “My Sample Page” has a slug “my-sample-page”. */
  slug: string;
  tags?: Taxonomy[];
  title: string;
  updateDate?: Date;
};

export type Taxonomy = {
  slug: string;
  title: string;
};

export type MetaData = {
  canonical?: string;
  description?: string;
  ignoreTitleTemplate?: boolean;
  openGraph?: MetaDataOpenGraph;
  robots?: MetaDataRobots;
  title?: string;
  twitter?: MetaDataTwitter;
};

export type MetaDataRobots = {
  follow?: boolean;
  index?: boolean;
};

export type MetaDataImage = {
  height?: number;
  url: string;
  width?: number;
};

export type MetaDataOpenGraph = {
  images?: MetaDataImage[];
  locale?: string;
  siteName?: string;
  type?: string;
  url?: string;
};

export type MetaDataTwitter = {
  cardType?: string;
  handle?: string;
  site?: string;
};

export type Image = {
  alt?: string;
  src: string;
};

export type Video = {
  src: string;
  type?: string;
};

export type Widget = {
  bg?: string;
  classes?: { [key: string]: { [key: string]: string } | string };
  id?: string;
  isDark?: boolean;
};

export type Headline = {
  classes?: { [key: string]: string };
  subtitle?: string;
  tagline?: string;
  title?: string;
};

type TeamMember = {
  classes?: { [key: string]: string };
  description?: string;
  image?: Image;
  job?: string;
  name?: string;
  socials?: Social[];
};

type Social = {
  href?: string;
  icon?: string;
};

export type Stat = {
  amount?: number | string;
  icon?: string;
  title?: string;
};

export type Item = {
  callToAction?: CallToAction;
  classes?: { [key: string]: string };
  description?: string;
  icon?: string;
  image?: Image;
  title?: string;
};

export type Price = {
  callToAction?: CallToAction;
  description?: string;
  hasRibbon?: boolean;
  items?: Item[];
  period?: string;
  price?: number | string;
  ribbonTitle?: string;
  subtitle?: string;
  title?: string;
};

export type Testimonial = {
  image?: unknown;
  job?: string;
  name?: string;
  testimonial?: string;
  title?: string;
};

export type Input = {
  autocomplete?: string;
  label?: string;
  name: string;
  placeholder?: string;
  type: HTMLInputTypeAttribute;
};

export type Textarea = {
  label?: string;
  name?: string;
  placeholder?: string;
  rows?: number;
};

export type Disclaimer = {
  label?: string;
};

// COMPONENTS
export type CallToAction = {
  classes?: { [key: string]: string };
  icon?: string;
  text?: string;
  type?: 'button' | 'reset' | 'submit';
  variant?: 'link' | 'primary' | 'secondary' | 'tertiary';
} & Omit<HTMLAttributes<'a'>, 'slot'>;

export type ItemGrid = {
  classes?: { [key: string]: string };
  columns?: number;
  defaultIcon?: string;
  items?: Item[];
};

export type Collapse = {
  classes?: { [key: string]: string };
  columns?: number;
  iconDown?: string;
  iconUp?: string;
  items?: Item[];
};

export type Form = {
  button?: string;
  description?: string;
  disclaimer?: Disclaimer;
  inputs?: Input[];
  textarea?: Textarea;
};

// WIDGETS
export type Hero = {
  actions?: CallToAction[] | string;
  content?: string;
  image?: unknown;
} & Omit<Headline, 'classes'> &
  Omit<Widget, 'classes' | 'isDark'>;

export type Team = {
  team?: TeamMember[];
} & Omit<Headline, 'classes'> &
  Widget;

export type Stats = {
  stats?: Stat[];
} & Omit<Headline, 'classes'> &
  Widget;

export type Pricing = {
  prices?: Price[];
} & Omit<Headline, 'classes'> &
  Widget;

export type Testimonials = {
  callToAction?: CallToAction;
  testimonials?: Testimonial[];
} & Omit<Headline, 'classes'> &
  Widget;

export type Brands = {
  icons?: string[];
  images?: Image[];
} & Omit<Headline, 'classes'> &
  Widget;

export type Features = {
  callToAction1?: CallToAction;
  callToAction2?: CallToAction;
  columns?: number;
  defaultIcon?: string;
  image?: unknown;
  isAfterContent?: boolean;
  isBeforeContent?: boolean;
  isReversed?: boolean;
  items?: Item[];
  video?: Video;
} & Omit<Headline, 'classes'> &
  Widget;

export type Faqs = {
  columns?: number;
  iconDown?: string;
  iconUp?: string;
  items?: Item[];
} & Omit<Headline, 'classes'> &
  Widget;

export type Steps = {
  callToAction?: CallToAction | string;
  image?: Image | string;
  isReversed?: boolean;
  items: {
    classes?: { [key: string]: string };
    description?: string;
    icon?: string;
    title: string;
  }[];
} & Omit<Headline, 'classes'> &
  Widget;

export type Content = {
  callToAction?: CallToAction;
  columns?: number;
  content?: string;
  image?: unknown;
  isAfterContent?: boolean;
  isReversed?: boolean;
  items?: Item[];
} & Omit<Headline, 'classes'> &
  Widget;

export type Contact = {} & Form & Omit<Headline, 'classes'> & Widget;
