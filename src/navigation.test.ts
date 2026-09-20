import { describe, expect, it } from 'vitest';
import { pageExists } from '@/test/page-exists';
import { supportResources } from '@/support/resources';
import {
  menuItems,
  menuList,
  menus,
  navigationLinks,
  supportTrail,
} from './navigation';

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

  it('lists every registered support resource in the Support menu', () => {
    const hrefs = menuItems(menus.support).map(item => item.href);
    for (const resource of Object.values(supportResources)) {
      expect(hrefs).toContain(resource.basePath);
    }
  });

  it('only the documented showcase menu uses placeholder links', () => {
    const placeholders = links.filter(link => link.href === '#');
    expect(placeholders.length).toBeGreaterThan(0);
    for (const link of placeholders) {
      expect(PLACEHOLDER_MENUS, `${link.title} in ${link.menu}`).toContain(
        link.menu
      );
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
