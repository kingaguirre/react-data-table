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
