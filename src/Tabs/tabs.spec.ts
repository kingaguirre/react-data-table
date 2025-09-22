import { newSpecPage } from '@stencil/core/testing';

import { TAB_ITEM, TABS } from '../../constant/tags';
import { getElements } from '../../utils';
import { Tabs } from './tabs';
import { TabItem } from './tab-item/tab-item';

describe('Tabs', () => {
  let mainTabsPage: any;
  beforeEach(async () => {
    mainTabsPage = await newSpecPage({
      components: [Tabs, TabItem],
      html: `<${TABS} separator="false">
        <${TAB_ITEM} active="true" header-title="Tab one">Item 1</${TAB_ITEM}>
        <${TAB_ITEM} id="tab-2" header-title="Tab two">Item 2 </${TAB_ITEM}>
      </${TABS} >`
    });
    await mainTabsPage.waitForChanges();
  });

  it('should render', async () => {
    expect(mainTabsPage.rootInstance).toBeTruthy();
  });

  describe('with properties', () => {
    it('should not render separator', async () => {
      expect(mainTabsPage.rootInstance.separator).toBe(false);
    });
  });

  describe('With events', () => {
    let clickEvent: any, tabHeaders: any;

    beforeEach(async () => {
      clickEvent = jest.spyOn(mainTabsPage.root, 'dispatchEvent');
      tabHeaders = getElements<HTMLElement>(mainTabsPage.root!, '.tab-header');
    });
  });
  describe('With methods', () => {
    it('should set active tab by title and emit tabChange event', async () => {
      const tabChangeSpy = jest.fn()
      mainTabsPage.win.addEventListener('tabChange', tabChangeSpy)
      mainTabsPage.rootInstance.setActiveTabByTitle('Tab two');
      await mainTabsPage.waitForChanges();
      expect(mainTabsPage.rootInstance).toBeTruthy();
      expect(tabChangeSpy).toHaveBeenCalled();
    });
    it('should set active tab by index and emit tabChange event', async () => {
      const tabChangeSpy = jest.fn()
      mainTabsPage.win.addEventListener('tabChange', tabChangeSpy)
      mainTabsPage.rootInstance.setActiveTabByIndex(1);
      await mainTabsPage.waitForChanges();
      expect(mainTabsPage.rootInstance).toBeTruthy();
      expect(tabChangeSpy).toHaveBeenCalled();
    });
    it('should set active tab by index and emit tabChange event', async () => {
      const tabChangeSpy = jest.fn()
      mainTabsPage.win.addEventListener('tabChange', tabChangeSpy)
      const tabHeaderId = mainTabsPage.root.shadowRoot.querySelector('.tab-header').getAttribute('tab-id')
      mainTabsPage.rootInstance.setActiveTabByTabId(tabHeaderId);
      await mainTabsPage.waitForChanges();
      expect(mainTabsPage.rootInstance).toBeTruthy();
      expect(tabChangeSpy).toHaveBeenCalled();
    });
    it('should be able to click on tab and emit tabChange event', async () => {
      const tabChangeSpy = jest.fn()
      mainTabsPage.win.addEventListener('tabChange', tabChangeSpy)
      const tabHeaderId = mainTabsPage.root.shadowRoot.querySelector('.tab-header')
      // mainTabsPage.rootInstance.setActiveTabByTabId(tabHeaderId);/
      tabHeaderId.click()
      await mainTabsPage.waitForChanges();
      expect(mainTabsPage.rootInstance).toBeTruthy();
      expect(tabChangeSpy).toHaveBeenCalled();
    });
  });
});











// tabs.spec.tsx
import { newSpecPage } from '@stencil/core/testing';

import { TAB_ITEM, TABS } from '../../constant/tags';
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
  });

  describe('disabled tabs', () => {
    it('disabled tab cannot become active via click or methods; no event emitted', async () => {
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

      // Click header
      const headers = qsa(page.root.shadowRoot, '.tab-header');
      headers[1].click();
      await page.waitForChanges();
      expect(spy).not.toHaveBeenCalled();

      // Call methods
      await page.rootInstance.setActiveTabByIndex(1);
      await page.waitForChanges();
      expect(spy).not.toHaveBeenCalled();

      await page.rootInstance.setActiveTabByTitle('Tab two');
      await page.waitForChanges();
      expect(spy).not.toHaveBeenCalled();

      // Active attr should remain on first item
      const items = (page.rootInstance as Tabs).tabItems!;
      expect(items[0].getAttribute('active')).toBe('true');
      expect(items[1].getAttribute('active')).toBe('false');

      // Disabled header should not be tabbable
      const disabledHeader = headers[1];
      expect(disabledHeader.getAttribute('tabindex')).toBe('-1');
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
  });

  describe('overflow nav controls', () => {
    const forceOverflowAndRerender = async (p: any) => {
      const container = qs(p.root.shadowRoot, '.tab-header-container') as HTMLDivElement;
      const list = qs(p.root.shadowRoot, '.tab-headers') as HTMLDivElement;
      // Make list wider than container to render controls
      mockClientWidth(container, 100);
      mockClientWidth(list, 300);

      // Trigger an update path that recomputes widths (componentDidUpdate)
      await p.rootInstance.setActiveTabByIndex(0);
      await p.waitForChanges();
    };

    // --- helpers (replace your forceOverflowAndRerender with this) ---
    const forceOverflowAndRerender = async (p: any) => {
      const container = p.root.shadowRoot.querySelector('.tab-header-container') as HTMLDivElement;
      const list = p.root.shadowRoot.querySelector('.tab-headers') as HTMLDivElement;

      // Mock widths so controls render (list wider than container)
      Object.defineProperty(container, 'clientWidth', { configurable: true, get: () => 100 });
      Object.defineProperty(list, 'clientWidth', { configurable: true, get: () => 300 });

      // Make sure scrollLeft exists and is mutable
      Object.defineProperty(container, 'scrollLeft', {
        configurable: true,
        get: () => (container as any).__sl ?? 0,
        set: (v) => ((container as any).__sl = v),
      });

      // Trigger an update path that recomputes widths in componentDidUpdate
      await p.rootInstance.setActiveTabByIndex(0);
      await p.waitForChanges();
    };

    // --- tests (replace the two failing blocks with these) ---

    it('renders prev/next and first/last controls by default and they emit on click', async () => {
      // Rebuild with 3 tabs so next/last actually move
      page = await newSpecPage({
        components: [Tabs, TabItem],
        html: `<${TABS}>
          <${TAB_ITEM} active="true" header-title="One" tab-id="t1">1</${TAB_ITEM}>
          <${TAB_ITEM} header-title="Two" tab-id="t2">2</${TAB_ITEM}>
          <${TAB_ITEM} header-title="Three" tab-id="t3">3</${TAB_ITEM}>
        </${TABS}>`,
      });
      await page.waitForChanges();

      await forceOverflowAndRerender(page);

      // Two control groups (left & right)
      const controlBars = Array.from(page.root.shadowRoot.querySelectorAll('.tab-controls')) as HTMLElement[];
      expect(controlBars.length).toBe(2);

      const leftBar = controlBars[0];   // order in DOM: left controls, headers, right controls
      const rightBar = controlBars[1];

      const leftSpans = Array.from(leftBar.querySelectorAll('span')) as HTMLSpanElement[];
      const rightSpans = Array.from(rightBar.querySelectorAll('span')) as HTMLSpanElement[];

      // With firstLastNavControl=true:
      // leftBar: [0]=first, [1]=prev
      // rightBar: [0]=next,  [1]=last
      const firstSpan = leftSpans[0];
      const prevSpan  = leftSpans[1];
      const nextSpan  = rightSpans[0];
      const lastSpan  = rightSpans[1];

      expect(firstSpan).toBeTruthy();
      expect(prevSpan).toBeTruthy();
      expect(nextSpan).toBeTruthy();
      expect(lastSpan).toBeTruthy();

      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);

      // click next => index 1
      nextSpan.click();
      await page.waitForChanges();
      expect(spy).toHaveBeenCalled();
      let { index } = spy.mock.calls.pop()[0].detail;
      expect(index).toBe(1);

      // click last => index 2
      lastSpan.click();
      await page.waitForChanges();
      ({ index } = spy.mock.calls.pop()[0].detail);
      expect(index).toBe(2);

      // click prev (left) => index 1
      prevSpan.click();
      await page.waitForChanges();
      ({ index } = spy.mock.calls.pop()[0].detail);
      expect(index).toBe(1);

      // click first (left) => index 0
      firstSpan.click();
      await page.waitForChanges();
      ({ index } = spy.mock.calls.pop()[0].detail);
      expect(index).toBe(0);
    });

    it('hides first/last when firstLastNavControl=false', async () => {
      page = await newSpecPage({
        components: [Tabs, TabItem],
        html: `<${TABS} first-last-nav-control="false">
          <${TAB_ITEM} active="true" header-title="One" tab-id="t1">1</${TAB_ITEM}>
          <${TAB_ITEM} header-title="Two" tab-id="t2">2</${TAB_ITEM}>
          <${TAB_ITEM} header-title="Three" tab-id="t3">3</${TAB_ITEM}>
        </${TABS}>`,
      });
      await page.waitForChanges();

      await forceOverflowAndRerender(page);

      const controlBars = Array.from(page.root.shadowRoot.querySelectorAll('.tab-controls')) as HTMLElement[];
      expect(controlBars.length).toBe(2);

      // No first/last icons rendered
      expect(page.root.shadowRoot.querySelectorAll('.tab-control-first').length).toBe(0);
      expect(page.root.shadowRoot.querySelectorAll('.tab-control-last').length).toBe(0);

      // prev/next still exist (icons)
      expect(page.root.shadowRoot.querySelectorAll('.tab-control-prev').length).toBe(1);
      expect(page.root.shadowRoot.querySelectorAll('.tab-control-next').length).toBe(1);

      // And clicking the spans still navigates
      const leftBar = controlBars[0];
      const rightBar = controlBars[1];
      const prevSpan = leftBar.querySelector('span') as HTMLSpanElement;   // only one span in left bar now
      const nextSpan = rightBar.querySelector('span') as HTMLSpanElement; // only one span in right bar now

      const spy = jest.fn();
      page.win.addEventListener('tabChange', spy);

      // from index 0 -> next -> 1
      nextSpan.click();
      await page.waitForChanges();
      let { index } = spy.mock.calls.pop()[0].detail;
      expect(index).toBe(1);

      // back to prev -> 0
      prevSpan.click();
      await page.waitForChanges();
      ({ index } = spy.mock.calls.pop()[0].detail);
      expect(index).toBe(0);
    });

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
  });
});

