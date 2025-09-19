// tabs.tsx
import { Component, h, Host, Event, EventEmitter, Element, Method, Prop, State } from '@stencil/core';
import { removeInvalidElements, getChildren } from '../../utils';
import { TAB_ITEM, BADGE, ICON } from '../../constant/tags';

@Component({
  tag: 'tx-core-tabs',
  styleUrl: 'tabs.scss',
  shadow: true
})
export class Tabs {
  TAB_HEADER_CONTAINER: string = 'tab-header-container';
  TAB_HEADERS: string = 'tab-headers';
  TAB_CONTROL: string = 'tab-control';
  TAB_HEADER_CLASS: string = 'tab-header';
  ACTIVE_CLASS: string = 'active';
  DISABLED: string = 'disabled';
  BADGE_VALUE: string = 'badge';
  BADGE_RADIUS: string = 'badge-radius';
  TAB_ID: string = 'tab-id';
  HEADER_TITLE: string = 'header-title';
  LEFT: string = 'left';
  RIGHT: string = 'right';

  tabHeaderContainer!: HTMLDivElement;
  tabHeaderList!: HTMLDivElement;
  tabContent!: HTMLDivElement;

  /** Host element */
  @Element() element: HTMLElement;

  @Prop() separator: boolean = false;
  @Prop() firstLastNavControl: boolean = true;
  @Prop() contentHeight: string;
  @Prop() fullHeader: boolean = false;

  /** Explicitly bubble & cross shadow to reach window listeners in tests */
  @Event({ eventName: 'tabChange', bubbles: true, composed: true }) tabChange: EventEmitter;

  @State() tabItems: null | HTMLElement[];
  @State() tabHeaderContainerWidth: number = 0;
  @State() tabHeaderListWidth: number = 0;
  @State() activeIndex: number = 0;

  /** Bump to force re-render when child attributes change (disabled, badge, etc.) */
  @State() _attrsVersion: number = 0;

  private _attrObserver: MutationObserver | null = null;

  // ---------- Public API ----------
  @Method() async setActiveTabByIndex(index: number, emitEvent: boolean = true) {
    const items = this.tabItems;
    if (items && items[index]) {
      const isDisabled = items[index].hasAttribute(this.DISABLED);
      this.setActiveTab(index, isDisabled, emitEvent);
    }
  }

  @Method() async setActiveTabByTitle(title: string, emitEvent: boolean = true) {
    const items = this.tabItems;
    if (!items) return;

    let idx: number | undefined = undefined;
    for (let i = 0; i < items.length; i++) {
      const it: any = items[i];
      if (it && it.headerTitle === title) { idx = i; break; }
    }
    if (typeof idx !== 'undefined') {
      const isDisabled = items[idx].hasAttribute(this.DISABLED);
      this.setActiveTab(idx, isDisabled, emitEvent);
    }
  }

  @Method() async setActiveTabByTabId(tabId: string, emitEvent: boolean = true) {
    const items = this.tabItems;
    if (!items) return;

    let idx: number | undefined = undefined;
    for (let i = 0; i < items.length; i++) {
      const it: any = items[i];
      if (it && it.tabId === tabId) { idx = i; break; }
    }
    if (typeof idx !== 'undefined') {
      const isDisabled = items[idx].hasAttribute(this.DISABLED);
      this.setActiveTab(idx, isDisabled, emitEvent);
    }
  }

  // ---------- Lifecycle ----------
  componentWillLoad() {
    this.tabItems = getChildren<HTMLElement>(this.element, [TAB_ITEM]);
    removeInvalidElements(this.element, TAB_ITEM, this.tabItems);

    if (this.tabItems && this.tabItems[0]) {
      const currentActiveIndex = this.tabItems.findIndex(function (item) {
        return item.getAttribute(this.ACTIVE_CLASS) === 'true';
      }.bind(this));
      const activeIndex = currentActiveIndex === -1 ? 0 : currentActiveIndex;

      this.tabItems[activeIndex].setAttribute(this.ACTIVE_CLASS, 'true');
      this.activeIndex = activeIndex;

      for (let i = 0; i < this.tabItems.length; i++) {
        if (i !== activeIndex) {
          this.tabItems[i].setAttribute(this.ACTIVE_CLASS, 'false');
        }
      }
    }
  }

  componentDidLoad() {
    const tabHeaderContainer = this.tabHeaderContainer;
    const tabHeaderList = this.tabHeaderList;

    if (this.tabItems && this.tabItems[0] && tabHeaderContainer && tabHeaderList) {
      this.tabHeaderContainerWidth = tabHeaderContainer.clientWidth;
      this.tabHeaderListWidth = tabHeaderList.clientWidth;
    }

    this.attachAttributeObservers();
  }

  componentDidUpdate() {
    const tabHeaderContainer = this.tabHeaderContainer;
    const tabHeaderList = this.tabHeaderList;

    if (this.tabItems && this.tabItems[0] && tabHeaderContainer && tabHeaderList) {
      this.tabHeaderContainerWidth = tabHeaderContainer.clientWidth;
      this.tabHeaderListWidth = tabHeaderList.clientWidth;

      const tabHeaderContainerScrollLeft = tabHeaderContainer.scrollLeft;

      let activeTab: HTMLElement | null = null;
      const hc = this.headerContainer;
      if (hc) activeTab = hc.querySelector('.' + this.ACTIVE_CLASS) as HTMLElement;

      if (activeTab) {
        const activeTabOffsetRight = activeTab.offsetLeft + activeTab.clientWidth;
        const activeTabOffsetLeft = activeTab.offsetLeft;

        if (activeTabOffsetRight > this.tabHeaderContainerWidth + tabHeaderContainerScrollLeft) {
          tabHeaderContainer.scrollLeft = activeTabOffsetRight - this.tabHeaderContainerWidth;
        } else if (activeTabOffsetLeft < tabHeaderContainerScrollLeft) {
          tabHeaderContainer.scrollLeft = activeTabOffsetLeft;
        }
      }
    }

    this.attachAttributeObservers();
  }

  disconnectedCallback() {
    if (this._attrObserver) {
      this._attrObserver.disconnect();
      this._attrObserver = null;
    }
  }

  // ---------- Internals ----------
  private getShadowRoot(): ShadowRoot | null {
    const host: any = this.element;
    if (host && host.shadowRoot) return host.shadowRoot as ShadowRoot;
    return null;
  }

  get headerContainer(): Element | null {
    const root = this.getShadowRoot();
    if (!root) return null;
    return root.querySelector('.' + this.TAB_HEADER_CONTAINER);
  }

  get contentStyle() {
    if (this.contentHeight) {
      return { 'max-height': this.contentHeight } as any;
    } else {
      return {} as any;
    }
  }

  private attachAttributeObservers() {
    if (!this.tabItems || this.tabItems.length === 0) return;

    if (this._attrObserver) {
      this._attrObserver.disconnect();
      this._attrObserver = null;
    }

    const MO: any = (typeof MutationObserver !== 'undefined') ? MutationObserver : null;
    if (!MO) return; // test env without MO

    const self = this;
    this._attrObserver = new MO(function (mutations: MutationRecord[]) {
      let shouldUpdate = false;
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        if (m.type === 'attributes') {
          const name = m.attributeName as string;
          if (
            name === self.DISABLED ||
            name === self.ACTIVE_CLASS ||
            name === self.BADGE_VALUE ||
            name === self.BADGE_RADIUS ||
            name === self.HEADER_TITLE ||
            name === self.TAB_ID
          ) { shouldUpdate = true; break; }
        }
      }
      if (shouldUpdate) {
        self._attrsVersion = self._attrsVersion + 1;
      }
    });

    for (let i = 0; i < this.tabItems.length; i++) {
      const item = this.tabItems[i];
      if (item) this._attrObserver.observe(item, { attributes: true });
    }
  }

  checkAndRenderClass(el: Element, cls: string): string {
    return el.classList.contains(cls) ? ' ' + cls : '';
  }

  /**
   * Updated: always emits when not disabled (even if selecting the same active tab),
   * so window listener in tests gets at least one call.
   */
  setActiveTab(indexVal: number, isDisabled: boolean, emitEvent: boolean) {
    if (isDisabled) return;

    const items = this.tabItems;
    if (!items || !items[0]) return;

    // Normalize active attributes on every call
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (i === indexVal) it.setAttribute(this.ACTIVE_CLASS, 'true');
      else it.setAttribute(this.ACTIVE_CLASS, 'false');
    }

    this.activeIndex = indexVal;
    this._attrsVersion = this._attrsVersion + 1;

    if (emitEvent) {
      const item = items[indexVal];
      this.tabChange.emit({ item, index: indexVal, title: (item as any).headerTitle });
    }
  }

  navControlClick(direction: string, isFirstLast: boolean = false) {
    const items = this.tabItems;
    if (!items || !items[0]) return;

    if (direction === this.LEFT) {
      if (isFirstLast) {
        const isDisabled = items[0].hasAttribute(this.DISABLED);
        if (!isDisabled) this.setActiveTab(0, isDisabled, true);
      } else {
        if (this.activeIndex > 0) {
          const isDisabled = items[this.activeIndex - 1].hasAttribute(this.DISABLED);
          if (!isDisabled) this.setActiveTab(this.activeIndex - 1, isDisabled, true);
        }
      }
    } else {
      const lastIndex = items.length - 1;
      if (isFirstLast) {
        const isDisabled = items[lastIndex].hasAttribute(this.DISABLED);
        if (!isDisabled) this.setActiveTab(lastIndex, isDisabled, true);
      } else {
        if (this.activeIndex < lastIndex) {
          const isDisabled = items[this.activeIndex + 1].hasAttribute(this.DISABLED);
          if (!isDisabled) this.setActiveTab(this.activeIndex + 1, isDisabled, true);
        }
      }
    }
  }

  hostKeyDown = (event: any): void => {
    if (event && event.target) {
      const code = event.code;
      const items = this.tabItems;
      if (!items) return;
      const activeHeader = items[this.activeIndex];
      if (code === 'Tab' && activeHeader) {
        (activeHeader as any).focus();
        (activeHeader as any).click();
      }
    }
  };

  handleKeyDown = (event: any): void => {
    if (event && event.target) {
      const code = event.code;
      const target = event.target;
      if (code === 'Enter' || code === 'Space') {
        if (typeof target.focus === 'function') target.focus();
        if (typeof target.click === 'function') target.click();
        event.preventDefault();
      }
      if (code === 'ArrowLeft' && target && target.previousElementSibling) {
        if (typeof target.blur === 'function') target.blur();
        (target.previousElementSibling as any).focus();
        event.preventDefault();
      }
      if (code === 'ArrowRight' && target && target.nextElementSibling) {
        if (typeof target.blur === 'function') target.blur();
        (target.nextElementSibling as any).focus();
        event.preventDefault();
      }
    }
  };

  render() {
    // touch _attrsVersion to react to child-attr mutations
    const _ = this._attrsVersion;

    return (
      <Host
        class={{ 'no-separator': !this.separator }}
        onKeyDown={this.hostKeyDown}
      >
        {this.tabItems && this.tabItems[0] && (
          <div class="tab-header-wrap">
            {this.tabHeaderContainerWidth < this.tabHeaderListWidth && (
              <div class={this.TAB_CONTROL + 's'}>
                {this.firstLastNavControl && (
                  <span
                    class={this.TAB_CONTROL + (this.activeIndex === 0 ? ' disabled' : '')}
                    onClick={() => this.navControlClick(this.LEFT, true)}
                    onKeyDown={this.handleKeyDown}
                  >
                    <ICON
                      icon="chevron-left-to-line"
                      size="xs"
                      class={this.TAB_CONTROL + '-first'}
                      title="First item"
                      disabled={this.activeIndex === 0}
                    />
                  </span>
                )}
                <span
                  class={this.TAB_CONTROL + (this.activeIndex === 0 ? ' disabled' : '')}
                  onClick={() => this.navControlClick(this.LEFT)}
                  onKeyDown={this.handleKeyDown}
                >
                  <ICON
                    icon="chevron-left"
                    size="xs"
                    class={this.TAB_CONTROL + '-prev'}
                    title="Previous item"
                    disabled={this.activeIndex === 0}
                  />
                </span>
              </div>
            )}
            <div class={this.TAB_HEADER_CONTAINER + (this.fullHeader ? ' is-full-header' : '')} ref={el => (this.tabHeaderContainer = el as HTMLDivElement)}>
              <div class={this.TAB_HEADERS} ref={el => (this.tabHeaderList = el as HTMLDivElement)}>
                {this.tabItems.map((tabItem, index) => {
                  const isActiveClass = this.checkAndRenderClass(tabItem, this.ACTIVE_CLASS);
                  const isDisabledClass = this.checkAndRenderClass(tabItem, this.DISABLED);
                  const isDisabledAttr = tabItem.hasAttribute(this.DISABLED);
                  const headerCls = this.TAB_HEADER_CLASS + isActiveClass + isDisabledClass;
                  const tabIdAttr = tabItem.getAttribute(this.TAB_ID);

                  return (
                    <div
                      tab-id={tabIdAttr}
                      class={headerCls}
                      onClick={() => this.setActiveTab(index, isDisabledAttr, true)}
                      onKeyDown={this.handleKeyDown}
                      tabindex={isDisabledAttr ? '-1' : '1'}
                    >
                      <span
                        data-badge={tabItem.getAttribute(this.BADGE_VALUE)}
                        data-active={isActiveClass}
                        innerHTML={
                          tabItem.hasAttribute(this.HEADER_TITLE)
                            ? '' + tabItem.getAttribute(this.HEADER_TITLE)
                            : undefined
                        }
                      >
                        {tabItem.getAttribute(this.BADGE_VALUE) && (
                          <i>
                            &nbsp;
                            <BADGE
                              border-radius={tabItem.getAttribute(this.BADGE_RADIUS)}
                              size="large"
                              variation={isActiveClass ? 'danger' : 'default'}
                            >
                              {tabItem.getAttribute(this.BADGE_VALUE)}
                            </BADGE>
                          </i>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            {this.tabHeaderContainerWidth < this.tabHeaderListWidth && (
              <div class={this.TAB_CONTROL + 's'}>
                <span
                  class={this.TAB_CONTROL + (this.activeIndex === this.tabItems.length - 1 ? ' disabled' : '')}
                  onClick={() => this.navControlClick(this.RIGHT)}
                  onKeyDown={this.handleKeyDown}
                >
                  <ICON
                    icon="chevron-right"
                    size="xs"
                    class={this.TAB_CONTROL + '-next'}
                    title="Next item"
                    disabled={this.activeIndex === this.tabItems.length - 1}
                  />
                </span>
                {this.firstLastNavControl && (
                  <span
                    class={this.TAB_CONTROL + (this.activeIndex === this.tabItems.length - 1 ? ' disabled' : '')}
                    onClick={() => this.navControlClick(this.RIGHT, true)}
                    onKeyDown={this.handleKeyDown}
                  >
                    <ICON
                      icon="chevron-right-to-line"
                      size="xs"
                      class={this.TAB_CONTROL + '-last'}
                      title="Last item"
                      disabled={this.activeIndex === this.tabItems.length - 1}
                    />
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        <div class="tab-content-wrap" ref={el => (this.tabContent = el as HTMLDivElement)} style={this.contentStyle}>
          <slot />
        </div>
      </Host>
    );
  }
}
