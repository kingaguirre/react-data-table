import { newSpecPage } from '@stencil/core/testing';

import { TAB_ITEM, TABS } from '../../constant/tags';
import { getElements } from '../../utils';
import { Tabs } from './tabs';
import { TabItem } from './tab-item/tab-item';

/**
 * Small helpers
 */
const qsa = (root: Element | ShadowRoot, sel: string) =>
  Array.from(root.querySelectorAll(sel)) as HTMLElement[];

const qs = (root: Element | ShadowRoot, sel: string) =>
  root.querySelector(sel) as HTMLElement;

const mockClientWidth = (el: HTMLElement, width: number) => {
  Object.defineProperty(el, 'clientWidth', {
    configurable: true,
    get: () => width,
  });
};

const mockOffset = (
  el: HTMLElement,
  { offsetLeft = 0, clientWidth = 0 }: { offsetLeft?: number; clientWidth?: number },
) => {
  Object.defineProperty(el, 'offsetLeft', {
    configurable: true,
    get: () => offsetLeft,
  });
  Object.defineProperty(el, 'clientWidth', {
    configurable: true,
    get: () => clientWidth,
  });
};

describe('Tabs', () => {
  let page: any;

  beforeEach(async () => {
    page = await newSpecPage({
      components: [Tabs, TabItem],
      html: `<${TABS} separator="false">
        <${TAB_ITEM} active="true" header-title="Tab one" tab-id="t1">Item 1</${TAB_ITEM}>
        <${TAB_ITEM} header-title="Tab two" tab-id="t2">Item 2</${TAB_ITEM}>
      </${TABS}>`,
    });
    await page.waitForChanges();
  });

  it('renders', () => {
    expect(page.rootInstance).toBeTruthy();
  });

  it('honors separator=false (host should have .no-separator)', () => {
    expect(page.root.classList.contains('no-separator')).toBe(true);
  });

  it('applies contentHeight when set', async () => {
    page.rootInstance.contentHeight = '200px';
    await page.waitForChanges();
    const wrap = qs(page.root.shadowRoot, '.tab-content-wrap');
    expect(wrap.getAttribute('style')).toContain('max-height: 200px');
  });

  it('applies fullHeader class when set', async () => {
    page.rootInstance.fullHeader = true;
    await page.waitForChanges();
    const container = qs(page.root.shadowRoot, '.tab-header-container');
    expect(container.classList.contains('is-full-header')).toBe(true);
  });

  describe('events & methods', () => {
    it('setActiveTabByTitle emits with payload', async () => {
      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);
      await page.rootInstance.setActiveTabByTitle('Tab two');
      await page.waitForChanges();
      expect(spy).toHaveBeenCalled();
      const evt = spy.mock.calls[0][0].detail;
      expect(evt.index).toBe(1);
      expect(evt.title).toBe('Tab two');
      expect(evt.item).toBeTruthy();
    });

    it('setActiveTabByIndex emits even if selecting same active tab again', async () => {
      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);
      // already on index 0; re-select index 0:
      await page.rootInstance.setActiveTabByIndex(0);
      await page.waitForChanges();
      expect(spy).toHaveBeenCalled();
    });

    it('setActiveTabByTabId emits', async () => {
      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);
      await page.rootInstance.setActiveTabByTabId('t2');
      await page.waitForChanges();
      expect(spy).toHaveBeenCalled();
      const { index, title } = spy.mock.calls[0][0].detail;
      expect(index).toBe(1);
      expect(title).toBe('Tab two');
    });

    it('setActiveTabByTitle (not found) does not emit', async () => {
      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);
      await page.rootInstance.setActiveTabByTitle('does-not-exist');
      await page.waitForChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('setActiveTabByIndex respects emitEvent=false (changes active, no event)', async () => {
      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);
      await page.rootInstance.setActiveTabByIndex(1, false);
      await page.waitForChanges();
      expect(spy).not.toHaveBeenCalled();
      const headers = qsa(page.root.shadowRoot, '.tab-header');
      expect(headers[1].classList.contains('active')).toBe(true);
      expect(headers[0].classList.contains('active')).toBe(false);
    });
  });

  describe('click & keyboard', () => {
    it('clicking a header emits tabChange', async () => {
      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);
      const headers = qsa(page.root.shadowRoot, '.tab-header');
      headers[1].click();
      await page.waitForChanges();
      expect(spy).toHaveBeenCalled();
    });

    it('Enter on header triggers click', async () => {
      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);
      const headers = qsa(page.root.shadowRoot, '.tab-header');
      headers[1].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Enter' }));
      await page.waitForChanges();
      expect(spy).toHaveBeenCalled();
    });

    it('Space on header triggers click', async () => {
      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);
      const headers = qsa(page.root.shadowRoot, '.tab-header');
      headers[1].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space' }));
      await page.waitForChanges();
      expect(spy).toHaveBeenCalled();
    });

    it('ArrowLeft and ArrowRight move focus to sibling headers', async () => {
      const headers = qsa(page.root.shadowRoot, '.tab-header');
      // stub focus/blur so we can assert
      headers[0].focus = jest.fn();
      headers[1].focus = jest.fn();
      headers[0].blur = jest.fn();
      headers[1].blur = jest.fn();

      // Focus on second, ArrowLeft should move to first
      headers[1].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'ArrowLeft' }));
      expect(headers[1].blur).toHaveBeenCalled();
      expect(headers[0].focus).toHaveBeenCalled();

      // Focus on first, ArrowRight should move to second
      headers[0].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'ArrowRight' }));
      expect(headers[0].blur).toHaveBeenCalled();
      expect(headers[1].focus).toHaveBeenCalled();
    });

    it('Pressing Tab on host focuses active header and emits (click on active)', async () => {
      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);

      const headers = qsa(page.root.shadowRoot, '.tab-header');
      headers[0].focus = jest.fn();
      headers[0].click = jest.fn(() => {
        // mimic default handler path; real component will handle onClick
      });

      page.root.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Tab' }));
      await page.waitForChanges();

      // Because component’s hostKeyDown clicks active header (and setActiveTab emits even if same tab)
      expect(spy).toHaveBeenCalled();
      expect(headers[0].focus).toHaveBeenCalled();
    });
  });

  describe('disabled behavior', () => {
    it('disabled tab cannot become active via click or methods; no event emitted; style/tabindex reflect disabled', async () => {
      // Rebuild page with disabled second tab
      page = await newSpecPage({
        components: [Tabs, TabItem],
        html: `<${TABS}>
          <${TAB_ITEM} active="true" header-title="Tab one" tab-id="t1">Item 1</${TAB_ITEM}>
          <${TAB_ITEM} header-title="Tab two" tab-id="t2" disabled>Item 2</${TAB_ITEM}>
        </${TABS}>`,
      });
      await page.waitForChanges();

      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);

      const headers = qsa(page.root.shadowRoot, '.tab-header');
      expect(headers[1].classList.contains('disabled')).toBe(true);
      expect(headers[1].getAttribute('tabindex')).toBe('-1');

      // Click should be ignored for disabled
      headers[1].click();
      await page.waitForChanges();
      expect(spy).not.toHaveBeenCalled();
      expect(headers[0].classList.contains('active')).toBe(true);
      expect(headers[1].classList.contains('active')).toBe(false);

      // Keyboard Enter/Space on disabled should also be ignored
      headers[1].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Enter' }));
      headers[1].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space' }));
      await page.waitForChanges();
      expect(spy).not.toHaveBeenCalled();

      // Public API should also ignore disabled target
      await page.rootInstance.setActiveTabByIndex(1);
      await page.waitForChanges();
      expect(spy).not.toHaveBeenCalled();
      expect(headers[0].classList.contains('active')).toBe(true);
    });

    it('toggling disabled at runtime updates class and tabindex, then becomes clickable', async () => {
      const items = (page.rootInstance as Tabs).tabItems!;
      // Disable second tab
      items[1].setAttribute('disabled', '');
      await page.waitForChanges();

      let headers = qsa(page.root.shadowRoot, '.tab-header');
      expect(headers[1].classList.contains('disabled')).toBe(true);
      expect(headers[1].getAttribute('tabindex')).toBe('-1');

      // Re-enable
      items[1].removeAttribute('disabled');
      await page.waitForChanges();

      headers = qsa(page.root.shadowRoot, '.tab-header');
      expect(headers[1].classList.contains('disabled')).toBe(false);
      expect(headers[1].getAttribute('tabindex')).toBe('1');

      // Now click should work
      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);

      headers[1].click();
      await page.waitForChanges();

      expect(spy).toHaveBeenCalled();
      expect(headers[1].classList.contains('active')).toBe(true);
    });
  });

  describe('badge / attribute mutation re-render', () => {
    it('adding badge attribute reflects in header (data-badge and <badge> element)', async () => {
      // add badge on second tab item
      const items = (page.rootInstance as Tabs).tabItems!;
      items[1].setAttribute('badge', '3');
      items[1].setAttribute('badge-radius', '6px');
      await page.waitForChanges();

      const headers = qsa(page.root.shadowRoot, '.tab-header');
      const span = qs(headers[1], 'span');
      expect(span.getAttribute('data-badge')).toBe('3');

      // Custom element renders anyway in JSDOM
      const badgeEl = qs(headers[1], 'i > badge, i > tx-core-badge, i > BADGE');
      expect(badgeEl).toBeTruthy();
      expect(badgeEl.textContent?.trim()).toBe('3');
    });

    it('header mirrors tab-id attribute from item', async () => {
      const headers = qsa(page.root.shadowRoot, '.tab-header');
      expect(headers[0].getAttribute('tab-id')).toBe('t1');
      expect(headers[1].getAttribute('tab-id')).toBe('t2');
    });
  });

  describe('overflow nav controls', () => {
    it('auto-scrolls active tab into view when it overflows', async () => {
      page = await newSpecPage({
        components: [Tabs, TabItem],
        html: `<${TABS}>
          <${TAB_ITEM} header-title="A" tab-id="a" active="true">A</${TAB_ITEM}>
          <${TAB_ITEM} header-title="B" tab-id="b">B</${TAB_ITEM}>
        </${TABS}>`,
      });
      await page.waitForChanges();

      const container = qs(page.root.shadowRoot, '.tab-header-container') as HTMLDivElement;
      const list = qs(page.root.shadowRoot, '.tab-headers') as HTMLDivElement;

      // Make list wider than container to trigger controls/scroll math
      mockClientWidth(container, 100);
      mockClientWidth(list, 300);
      container.scrollLeft = 0;

      // Activate the second tab and make it appear far to the right
      const headers = qsa(page.root.shadowRoot, '.tab-header');
      mockOffset(headers[1], { offsetLeft: 150, clientWidth: 80 }); // right edge = 230

      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);

      // move to index 1 => componentDidUpdate computes scrollLeft = 230 - 100 = 130
      await page.rootInstance.setActiveTabByIndex(1);
      await page.waitForChanges();

      expect(spy).toHaveBeenCalled();
      expect(container.scrollLeft).toBe(130);
    });

    it('first/prev/next/last controls navigate and reflect disabled state at edges', async () => {
      page = await newSpecPage({
        components: [Tabs, TabItem],
        html: `<${TABS} first-last-nav-control="true">
          <${TAB_ITEM} header-title="A" tab-id="a" active="true">A</${TAB_ITEM}>
          <${TAB_ITEM} header-title="B" tab-id="b">B</${TAB_ITEM}>
        </${TABS}>`,
      });
      await page.waitForChanges();

      // Force overflow so controls render
      const container = qs(page.root.shadowRoot, '.tab-header-container') as HTMLDivElement;
      const list = qs(page.root.shadowRoot, '.tab-headers') as HTMLDivElement;
      mockClientWidth(container, 100);
      mockClientWidth(list, 300);
      await page.waitForChanges();

      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);

      const controlGroups = qsa(page.root.shadowRoot, '.tab-controls');
      const leftControls = Array.from(controlGroups[0].querySelectorAll('span.tab-control')) as HTMLElement[];
      const rightControls = Array.from(controlGroups[1].querySelectorAll('span.tab-control')) as HTMLElement[];

      // At start (index 0): left controls are disabled
      expect(leftControls[0].classList.contains('disabled')).toBe(true); // first
      expect(leftControls[1].classList.contains('disabled')).toBe(true); // prev

      // Next: go to index 1
      rightControls[0].click();
      await page.waitForChanges();
      expect(spy).toHaveBeenCalled();
      const headers = qsa(page.root.shadowRoot, '.tab-header');
      expect(headers[1].classList.contains('active')).toBe(true);

      // At end: right controls disabled
      expect(rightControls[0].classList.contains('disabled')).toBe(true); // next
      expect(rightControls[1].classList.contains('disabled')).toBe(true); // last

      // Go to first using "first" control (keyboard activation)
      leftControls[0].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Enter' }));
      await page.waitForChanges();
      expect(headers[0].classList.contains('active')).toBe(true);

      // From first, use "last" via Space key
      rightControls[1].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space' }));
      await page.waitForChanges();
      expect(headers[1].classList.contains('active')).toBe(true);
    });

    it('prev/next do nothing if neighbor is disabled', async () => {
      page = await newSpecPage({
        components: [Tabs, TabItem],
        html: `<${TABS} first-last-nav-control="true">
          <${TAB_ITEM} header-title="A" tab-id="a" active="true">A</${TAB_ITEM}>
          <${TAB_ITEM} header-title="B" tab-id="b" disabled>B</${TAB_ITEM}>
          <${TAB_ITEM} header-title="C" tab-id="c">C</${TAB_ITEM}>
        </${TABS}>`,
      });
      await page.waitForChanges();

      // Force overflow so controls render
      const container = qs(page.root.shadowRoot, '.tab-header-container') as HTMLDivElement;
      const list = qs(page.root.shadowRoot, '.tab-headers') as HTMLDivElement;
      mockClientWidth(container, 100);
      mockClientWidth(list, 500);
      await page.waitForChanges();

      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);

      const controlGroups = qsa(page.root.shadowRoot, '.tab-controls');
      const rightControls = Array.from(controlGroups[1].querySelectorAll('span.tab-control')) as HTMLElement[];

      const headers = qsa(page.root.shadowRoot, '.tab-header');
      expect(headers[0].classList.contains('active')).toBe(true);

      // Try "next" (neighbor is disabled) -> should do nothing
      rightControls[0].click();
      await page.waitForChanges();
      expect(spy).not.toHaveBeenCalled();
      expect(headers[0].classList.contains('active')).toBe(true);
    });
  });
});
