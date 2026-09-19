import type { ImageMetadata } from 'astro';
import type { Icons } from '@/components/ui/icons/icons';
import datanova from './assets/images/datanova.webp';
import ifCloud from './assets/images/if_cloud.webp';
import ifPlanner from './assets/images/if_planner.webp';
import ifVisualizer from './assets/images/if_visualizer.webp';

/**
 * The site's navigation tree: every mega menu, top-level link and breadcrumb
 * root, typed so a bad icon name or image is a compile error. The navbar,
 * expanded footer, 404 page and support breadcrumbs all read from here.
 */

export type IconName = keyof typeof Icons;

export interface Crumb {
  label: string;
  href?: string;
}

export interface MenuLink {
  title: string;
  description: string;
  href: string;
  icon: IconName;
}

export interface MenuCard {
  title: string;
  description: string;
  href: string;
  image: ImageMetadata;
}

export interface MenuSection<Item> {
  title?: string;
  items: readonly Item[];
}

interface MenuBase {
  id: string;
  label: string;
  /** Intro line at the top of the dropdown. */
  description?: string;
  /** Pages under this prefix show the menu as active. */
  pathPrefix?: string;
}

export type Menu = MenuBase &
  (
    | { layout: 'list'; sections: readonly MenuSection<MenuLink>[] }
    | { layout: 'cards'; sections: readonly MenuSection<MenuCard>[] }
  );

export const menus = {
  features: {
    id: 'features',
    label: 'Features',
    description: 'Discover how DataNova can empower your business',
    layout: 'list',
    sections: [
      {
        title: 'AI-Powered Insights',
        items: [
          {
            icon: 'chartPie',
            title: 'Predictive Modeling',
            description:
              'Use AI-driven simulations to forecast outcomes with confidence.',
            href: '#',
          },
          {
            icon: 'portfolio',
            title: 'Market Trends',
            description:
              'Identify key trends and make strategic decisions with real-time insights.',
            href: '#',
          },
        ],
      },
      {
        title: 'Advanced Data Tools',
        items: [
          {
            icon: 'presentationChart',
            title: 'Automated Reports',
            description: 'Generate detailed reports and dashboards in seconds.',
            href: '#',
          },
        ],
      },
    ],
  },
  platform: {
    id: 'platform',
    label: 'Platform',
    description: 'Transform data into strategies with predictive analytics',
    pathPrefix: '/platform',
    layout: 'cards',
    sections: [
      {
        items: [
          {
            href: '/platform',
            title: 'DataNova Core',
            description: 'AI-powered risk analysis and data modeling engine.',
            image: datanova,
          },
          {
            href: '/platform',
            title: 'InsightFlow Cloud',
            description:
              'A web-based platform for collaborative data analytics.',
            image: ifCloud,
          },
          {
            href: '/platform',
            title: 'InsightFlow Planner',
            description:
              'Advanced forecasting and scenario planning for business strategy.',
            image: ifPlanner,
          },
          {
            href: '/platform',
            title: 'InsightFlow Visualizer',
            description: 'Custom dashboards and interactive data storytelling.',
            image: ifVisualizer,
          },
        ],
      },
    ],
  },
  downloads: {
    id: 'downloads',
    label: 'Downloads',
    description: 'Get started with a free trial or explore licensing options',
    pathPrefix: '/downloads',
    layout: 'list',
    sections: [
      {
        title: 'Download',
        items: [
          {
            icon: 'download',
            title: 'DataNova Core',
            description:
              'Download the free trial version of the DataNova Core.',
            href: '/downloads/datanova-core',
          },
        ],
      },
      {
        title: 'Licensing',
        items: [
          {
            icon: 'badge',
            title: 'License Options',
            description:
              'Choose the best license for your needs and unlock full features.',
            href: '/downloads/license-options',
          },
          {
            icon: 'chatBubble',
            title: 'Request a Quote',
            description:
              'Inquire about custom pricing, volume discounts, or tailored solutions.',
            href: '/downloads/request-quote',
          },
          {
            icon: 'arrowPath',
            title: 'Subscription Licensing',
            description:
              'Register the DataNova Core with a subscription license for seamless updates.',
            href: '/downloads/subscription-licensing',
          },
        ],
      },
    ],
  },
  support: {
    id: 'support',
    label: 'Support',
    pathPrefix: '/support',
    layout: 'list',
    sections: [
      {
        title: 'Documentation',
        items: [
          {
            icon: 'articles',
            title: 'Articles',
            description: 'Learn from our collection of insightful articles.',
            href: '/support/articles',
          },
          {
            icon: 'documentChartBar',
            title: 'Sample Spreadsheets',
            description: 'Download sample spreadsheets to practice with.',
            href: '/support/sample-spreadsheets',
          },
          {
            icon: 'blankDocument',
            title: 'Whitepapers',
            description:
              'Access detailed reports on advanced analytics techniques.',
            href: '/support/whitepapers',
          },
          {
            icon: 'documentMagnifyingGlass',
            title: 'Reference',
            description:
              'Find technical documentation and reference materials.',
            href: '/support/reference',
          },
        ],
      },
      {
        title: 'Knowledge Base',
        items: [
          {
            icon: 'info',
            title: 'Search the Knowledge Base',
            description:
              'Search for answers to your questions in our Knowledge Base.',
            href: '/support/knowledge-base',
          },
        ],
      },
    ],
  },
} as const satisfies Record<string, Menu>;

/** Mega menus in navbar order. */
export const menuList: readonly Menu[] = Object.values(menus);

/** Plain top-level links rendered after the mega menus. */
export const navigationLinks: readonly Required<Crumb>[] = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/** Every link in a menu, sections flattened. */
export function menuItems<M extends Menu>(
  menu: M
): M['sections'][number]['items'][number][] {
  return menu.sections.flatMap(section => [...section.items]);
}

export const home: Crumb = { label: 'Home', href: '/' };
export const supportHome: Crumb = {
  label: 'Support',
  href: '/support/articles',
};

/** Breadcrumb trail for a page under the support hub. */
export function supportTrail(...rest: Crumb[]): Crumb[] {
  return [home, supportHome, ...rest];
}
