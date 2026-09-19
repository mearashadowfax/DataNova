import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Icons } from '@ui/icons/icons';
import {
  menuItems,
  menuList,
  navigationLinks,
  supportTrail,
} from './navigation';

/** Astro file routing: `/a/b` is served by `a/b.astro` or `a/b/index.astro`. */
function pageExists(href: string): boolean {
  return (
    existsSync(`src/pages${href}.astro`) ||
    existsSync(`src/pages${href}/index.astro`)
  );
}

const links = [
  ...menuList.flatMap(menu =>
    menuItems(menu).map(item => ({ ...item, menu: menu.id }))
  ),
  ...navigationLinks.map(link => ({
    title: link.label,
    href: link.href,
    menu: 'navbar',
  })),
];

/** The README documents the Features menu's `#` links as showcase placeholders. */
const PLACEHOLDER_MENUS = ['features'];

describe('navigation tree', () => {
  it.each(links.filter(link => !PLACEHOLDER_MENUS.includes(link.menu)))(
    '$title links to an existing page ($href)',
    link => {
      expect(pageExists(link.href)).toBe(true);
    }
  );

  it('only the documented showcase menu uses placeholder links', () => {
    const placeholders = links.filter(link => link.href === '#');
    expect(placeholders.length).toBeGreaterThan(0);
    for (const link of placeholders) {
      expect(PLACEHOLDER_MENUS, `${link.title} in ${link.menu}`).toContain(
        link.menu
      );
    }
  });

  it('uses only icons that exist', () => {
    for (const item of menuList.flatMap(menu => menuItems(menu))) {
      if ('icon' in item) expect(Icons).toHaveProperty(item.icon);
    }
  });

  it('roots support breadcrumbs at Home › Support', () => {
    expect(supportTrail({ label: 'Whitepapers' })).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Support', href: '/support/articles' },
      { label: 'Whitepapers' },
    ]);
  });
});
