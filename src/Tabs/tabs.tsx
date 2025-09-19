// tabs.tsx
import { Component, h, Host, Event, EventEmitter, Element, Method, Prop, State } from '@stencil/core';
import {
  slottedElements,
  removeInvalidElements,
  getElement,
  getElements,
  slottedElement,
  getChildren
} from '../../utils';
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

  /** Tab element */
  @Element() element: HTMLElement;

  /** Property to hide/show the separator line between items in the header */
  @Prop() separator: boolean = false;

  /** Property to hide/show the first and last navigation button/control in tab header */
  @Prop() firstLastNavControl: boolean = true;

  /** Property to set max height on tab content section */
  @Prop() contentHeight: string;

  /** Property to set full header item */
  @Prop() fullHeader: boolean = false;

  /** Event is fired when the tab is changed */
  @Event() tabChange: EventEmitter;

  /** Internal state that contain tab items */
  @State() tabItems: null | HTMLElement[];

  /** Internal state that contain tab container width */
  @State() tabHeaderContainerWidth: number = 0;

  /** Internal state that contain tab list width */
  @State() tabHeaderListWidth: number = 0;

  /** Internal state that contain active index */
  @State() activeIndex: number = 0;

  /** Bump to force re-render when child attributes (e.g., disabled) change */
  @State() _attrsVersion: number = 0;

  /** Observer to watch child attribute changes (disabled, active, etc.) */
  private _attrObserver: MutationObserver | null = null;

  /**
   * Method to set the active tab by array index.
   *
   * @param index Array index
   * @param emitEvent Boolean to emit tabChange event
   */
  @Method() async setActiveTabByIndex(index: number, emitEvent: boolean = true) {
    const items = this.tabItems;
    if (items && items[index]) {
      const isDisabled = items[index].hasAttribute(this.DISABLED);
      this.setActiveTab(index, isDisabled, emitEvent);
    }
  }

  /**
   * Method to set the active tab by header title.
   *
   * @param title Tab header title
   * @param emitEvent Boolean to emit tabChange event
   */
  @Method() async setActiveTabByTitle(title: string, emitEvent: boolean = true) {
    const items = this.tabItems;
    if (!items) return;

    let indexVal: number | undefined = undefined;
    for (let i = 0; i < items.length; i++) {
      const item: any = items[i];
      if (item && item.headerTitle === title) {
        indexVal = i;
        break;
      }
    }

    if (typeof indexVal !== 'undefined') {
      const isDisabled = items[indexVal].hasAttribute(this.DISABLED);
      this.setActiveTab(indexVal, isDisabled, emitEvent);
    }
  }

  /**
   * Method to set the active tab by the tab ID.
   *
   * @param tabId Tab id
   * @param emitEvent Boolean to emit tabChange event
   */
  @Method() async setActiveTabByTabId(tabId: string, emitEvent: boolean = true) {
    const items = this.tabItems;
    if (!items) return;

    let indexVal: number | undefined = undefined;
    for (let i = 0; i < items.length; i++) {
      const item: any = items[i];
      if (item && item.tabId === tabId) {
        indexVal = i;
        break;
      }
    }

    if (typeof indexVal !== 'undefined') {
      const isDisabled = items[indexVal].hasAttribute(this.DISABLED);
      this.setActiveTab(indexVal, isDisabled, emitEvent);
    }
  }

  componentWillLoad() {
    this.tabItems = getChildren<any>(this.element, [TAB_ITEM]);
    removeInvalidElements(this.element, TAB_ITEM, this.tabItems);

    if (this.tabItems && this.tabItems[0]) {
      const currentActiveIndex = this.tabItems.findIndex(item => item.getAttribute(this.ACTIVE_CLASS) === 'true');
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
      const activeTab = getElement<HTMLElement>(this.headerContainer, `.${this.ACTIVE_CLASS}`);

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

    // Re-attach observers in case children changed
    this.attachAttributeObservers();
  }

  disconnectedCallback() {
    if (this._attrObserver) {
      this._attrObserver.disconnect();
      this._attrObserver = null;
    }
  }

  private attachAttributeObservers() {
    if (!this.tabItems || this.tabItems.length === 0) return;

    if (this._attrObserver) {
      this._attrObserver.disconnect();
    }

    const self = this;

    this._attrObserver = new MutationObserver(function (mutations) {
      // If any of the headers-critical attributes flip, bump state to refresh header classes/tabindex
      let shouldUpdate = false;
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        if (m.type === 'attributes') {
          const name = m.attributeName;
          if (
            name === self.DISABLED ||
            name === self.ACTIVE_CLASS ||
            name === self.BADGE_VALUE ||
            name === self.BADGE_RADIUS ||
            name === self.HEADER_TITLE ||
            name === self.TAB_ID
          ) {
            shouldUpdate = true;
            break;
          }
        }
      }
      if (shouldUpdate) {
        self._attrsVersion = self._attrsVersion + 1;
      }
    });

    // Watch each tab item for attribute changes
    for (let i = 0; i < this.tabItems.length; i++) {
      const item = this.tabItems[i];
      if (item) {
        this._attrObserver.observe(item, { attributes: true });
      }
    }
  }

  get headerContainer(): Element | null {
    return getElement(this.element, `.${this.TAB_HEADER_CONTAINER}`);
  }

  get contentStyle() {
    if (this.contentHeight) {
      return {
        'max-height': this.contentHeight
      } as any;
    } else {
      return {} as any;
    }
  }

  checkAndRenderClass(el: Element, cls: string): string {
    return el.classList.contains(cls) ? ` ${cls}` : '';
  }

  setActiveTab(indexVal: number, isDisabled: boolean, emitEvent: boolean) {
    if (isDisabled) return;
    const items = this.tabItems;
    if (!items || !items[0]) return;

    if (indexVal !== this.activeIndex) {
      // Remove active attr from all, then set on the target
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.hasAttribute(this.ACTIVE_CLASS)) {
          it.removeAttribute(this.ACTIVE_CLASS);
        }
        if (i === indexVal) {
          it.setAttribute(this.ACTIVE_CLASS, 'true');
          if (emitEvent) {
            this.tabChange.emit({ item: it, index: i, title: (it as any).headerTitle });
          }
        } else {
          // Normalize others to false (keeps child styles deterministic)
          it.setAttribute(this.ACTIVE_CLASS, 'false');
        }
      }
      this.activeIndex = indexVal;
      // Header needs to reflect the change immediately
      this._attrsVersion = this._attrsVersion + 1;
    }
  }

  navControlClick(direction: string, isFirstLast: boolean = false) {
    const items = this.tabItems;
    if (!items || !items[0]) return;

    if (direction === this.LEFT) {
      if (isFirstLast) {
        const isDisabled = items[0].hasAttribute(this.DISABLED);
        if (!isDisabled) {
          this.setActiveTab(0, isDisabled, true);
        }
      } else {
        if (this.activeIndex > 0) {
          const isDisabled = items[this.activeIndex - 1].hasAttribute(this.DISABLED);
          if (!isDisabled) {
            this.setActiveTab(this.activeIndex - 1, isDisabled, true);
          }
        }
      }
    } else {
      const lastIndex = items.length - 1;
      if (isFirstLast) {
        const isDisabled = items[lastIndex].hasAttribute(this.DISABLED);
        if (!isDisabled) {
          this.setActiveTab(lastIndex, isDisabled, true);
        }
      } else {
        if (this.activeIndex < lastIndex) {
          const isDisabled = items[this.activeIndex + 1].hasAttribute(this.DISABLED);
          if (!isDisabled) {
            this.setActiveTab(this.activeIndex + 1, isDisabled, true);
          }
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
    // Reference _attrsVersion to ensure we re-render header when children mutate.
    const _ = this._attrsVersion;

    return (
      <Host
        class={{ 'no-separator': !this.separator }}
        onKeyDown={this.hostKeyDown}
      >
        {this.tabItems && this.tabItems[0] && (
          <div class="tab-header-wrap">
            {this.tabHeaderContainerWidth < this.tabHeaderListWidth && (
              <div class={`${this.TAB_CONTROL}s`}>
                {this.firstLastNavControl && (
                  <span
                    class={`${this.TAB_CONTROL}${this.activeIndex === 0 ? ' disabled' : ''}`}
                    onClick={() => this.navControlClick(this.LEFT, true)}
                    onKeyDown={this.handleKeyDown}
                  >
                    <ICON
                      icon="chevron-left-to-line"
                      size="xs"
                      class={`${this.TAB_CONTROL}-first`}
                      title="First item"
                      disabled={this.activeIndex === 0}
                    />
                  </span>
                )}
                <span
                  class={`${this.TAB_CONTROL}${this.activeIndex === 0 ? ' disabled' : ''}`}
                  onClick={() => this.navControlClick(this.LEFT)}
                  onKeyDown={this.handleKeyDown}
                >
                  <ICON
                    icon="chevron-left"
                    size="xs"
                    class={`${this.TAB_CONTROL}-prev`}
                    title="Previous item"
                    disabled={this.activeIndex === 0}
                  />
                </span>
              </div>
            )}
            <div class={`${this.TAB_HEADER_CONTAINER} ${this.fullHeader ? 'is-full-header' : ''}`} ref={el => (this.tabHeaderContainer = el as HTMLDivElement)}>
              <div class={this.TAB_HEADERS} ref={el => (this.tabHeaderList = el as HTMLDivElement)}>
                {this.tabItems.map((tabItem, index) => {
                  const isActiveClass = this.checkAndRenderClass(tabItem, this.ACTIVE_CLASS);
                  const isDisabledClass = this.checkAndRenderClass(tabItem, this.DISABLED);
                  const isDisabledAttr = tabItem.hasAttribute(this.DISABLED);
                  const headerCls = `${this.TAB_HEADER_CLASS}${isActiveClass}${isDisabledClass}`;
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
                        data-active={`${isActiveClass}`}
                        innerHTML={
                          tabItem.hasAttribute(this.HEADER_TITLE)
                            ? `${tabItem.getAttribute(this.HEADER_TITLE)}`
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
              <div class={`${this.TAB_CONTROL}s`}>
                <span
                  class={`${this.TAB_CONTROL}${this.activeIndex === this.tabItems.length - 1 ? ' disabled' : ''}`}
                  onClick={() => this.navControlClick(this.RIGHT)}
                  onKeyDown={this.handleKeyDown}
                >
                  <ICON
                    icon="chevron-right"
                    size="xs"
                    class={`${this.TAB_CONTROL}-next`}
                    title="Next item"
                    disabled={this.activeIndex === this.tabItems.length - 1}
                  />
                </span>
                {this.firstLastNavControl && (
                  <span
                    class={`${this.TAB_CONTROL}${this.activeIndex === this.tabItems.length - 1 ? ' disabled' : ''}`}
                    onClick={() => this.navControlClick(this.RIGHT, true)}
                    onKeyDown={this.handleKeyDown}
                  >
                    <ICON
                      icon="chevron-right-to-line"
                      size="xs"
                      class={`${this.TAB_CONTROL}-last`}
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
