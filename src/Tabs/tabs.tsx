import { Component, h, Host, Event, EventEmitter, Element, Method, Prop, State } from '@stencil/core';
import { getElement, getChildren, removeInvalidElements, randomString } from '../../utils'; // ⬅ add randomString
import { TAB_ITEM, BADGE, ICON } from '../../constant/tags';

type TabChangeDetail = {
  tabId: string | null;
  tabHeader: HTMLElement | null;
  tabContent: HTMLElement;
  index: number;
  title: string | null;
};

@Component({
  tag: 'tx-core-tabs',
  styleUrl: 'tabs.scss',
  shadow: true
})
export class Tabs {
  // CSS/attr/class constants
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

  /** Host el */
  @Element() element: HTMLElement;

  /** Show separators between headers */
  @Prop() separator: boolean = false;

  /** Show first/last nav buttons */
  @Prop() firstLastNavControl: boolean = true;

  /** Max height for content area */
  @Prop() contentHeight: string;

  /** Make headers full width (flex: 1) */
  @Prop() fullHeader: boolean = false;

  /** Emits when active tab changes */
  @Event({ eventName: 'tabChange' }) tabChange: EventEmitter<TabChangeDetail>; // ⬅ rename event

  /** Internal: tab items */
  @State() tabItems: HTMLElement[] | null;

  /** Internal sizes */
  @State() tabHeaderContainerWidth: number = 0;
  @State() tabHeaderListWidth: number = 0;

  /** Active index */
  @State() activeIndex: number = 0;

  /** Internal tick to force re-render on child attr changes */
  @State() _tick: number = 0;

  private mo?: MutationObserver;

  /**
   * Set active by index
   */
  @Method() async setActiveTabByIndex(index: number, emitEvent: boolean = true) {
    const item = this.tabItems?.[index];
    if (item) {
      const isDisabled = item.hasAttribute(this.DISABLED);
      this.setActiveTab(index, isDisabled, emitEvent);
    }
  }

  /**
   * Set active by header title
   */
  @Method() async setActiveTabByTitle(title: string, emitEvent: boolean = true) {
    if (!this.tabItems) return;
    const indexVal = this.tabItems.findIndex((item: any) => item.headerTitle === title);
    if (indexVal > -1) {
      const isDisabled = this.tabItems[indexVal].hasAttribute(this.DISABLED);
      this.setActiveTab(indexVal, isDisabled, emitEvent);
    }
  }

  /**
   * Set active by tab-id
   */
  @Method() async setActiveTabByTabId(tabId: string, emitEvent: boolean = true) {
    if (!this.tabItems) return;
    const indexVal = this.tabItems.findIndex((item: any) => {
      // Prefer attribute to avoid any prop timing issues
      return item.getAttribute?.(this.TAB_ID) === String(tabId) || (item as any).tabId === tabId;
    });
    if (indexVal > -1) {
      const isDisabled = this.tabItems[indexVal].hasAttribute(this.DISABLED);
      this.setActiveTab(indexVal, isDisabled, emitEvent);
    }
  }

  componentWillLoad() {
    this.tabItems = getChildren<HTMLElement>(this.element, [TAB_ITEM]);
    removeInvalidElements(this.element, TAB_ITEM, this.tabItems);

    // Ensure every tab item has a stable tab-id BEFORE initial render (headers read it)
    this.tabItems?.forEach((item) => {
      if (!item.hasAttribute(this.TAB_ID)) {
        item.setAttribute(this.TAB_ID, randomString('tab-'));
      }
    });

    // Initial active item (attribute presence, not value)
    if (this.tabItems?.[0]) {
      const currentActiveIndex = this.tabItems.findIndex(item => item.hasAttribute(this.ACTIVE_CLASS));
      const activeIndex = currentActiveIndex === -1 ? 0 : currentActiveIndex;

      // Ensure exactly one active flag is present
      this.tabItems.forEach((item, idx) => {
        item.toggleAttribute(this.ACTIVE_CLASS, idx === activeIndex);
      });

      this.activeIndex = activeIndex;
    }
  }

  componentDidLoad() {
    const { tabHeaderContainer, tabHeaderList } = this;
    if (this.tabItems?.[0] && tabHeaderContainer && tabHeaderList) {
      this.tabHeaderContainerWidth = tabHeaderContainer.clientWidth;
      this.tabHeaderListWidth = tabHeaderList.clientWidth;
    }

    // Observe attribute changes on slotted tab items (disabled, badge, header-title, active, tab-id)
    this.mo = new MutationObserver(muts => {
      const relevant = muts.some(
        m =>
          m.type === 'attributes' &&
          (m.target as Element).tagName.toLowerCase() === 'tx-core-tab-item'
      );
      if (relevant) {
        // Re-read children and trigger re-render
        this.tabItems = Array.from(
          this.element.querySelectorAll('tx-core-tab-item')
        ) as HTMLElement[];
        this._tick++;
      }
    });

    this.mo.observe(this.element, {
      attributes: true,
      subtree: true,
      attributeFilter: ['disabled', 'badge', 'badge-radius', 'header-title', 'active', 'tab-id'] // ⬅ include tab-id
    });
  }

  disconnectedCallback() {
    this.mo?.disconnect();
  }

  componentDidUpdate() {
    const { tabHeaderContainer, tabHeaderList } = this;
    if (this.tabItems?.[0] && tabHeaderContainer && tabHeaderList) {
      this.tabHeaderContainerWidth = tabHeaderContainer.clientWidth;
      this.tabHeaderListWidth = tabHeaderList.clientWidth;

      // Auto-scroll active header into view
      const scrollLeft = tabHeaderContainer.scrollLeft;
      const activeTab = getElement<HTMLElement>(this.headerContainer!, `.${this.ACTIVE_CLASS}`);
      if (activeTab) {
        const right = activeTab.offsetLeft + activeTab.clientWidth;
        const left = activeTab.offsetLeft;
        if (right > this.tabHeaderContainerWidth + scrollLeft) {
          tabHeaderContainer.scrollLeft = right - this.tabHeaderContainerWidth;
        } else if (left < scrollLeft) {
          tabHeaderContainer.scrollLeft = left;
        }
      }
    }
  }

  get headerContainer(): Element | null {
    return getElement(this.element, `.${this.TAB_HEADER_CONTAINER}`);
  }

  get contentStyle() {
    return this.contentHeight ? { 'max-height': this.contentHeight } : {};
  }

  /** Treat attribute presence OR class as "has this state" */
  checkAndRenderClass(el: Element, name: string): string {
    return el.hasAttribute(name) || el.classList.contains(name) ? ` ${name}` : '';
  }

  private emitChangeFor(indexVal: number, item: HTMLElement) {
    const id = item.getAttribute(this.TAB_ID);
    const header = this.headerContainer?.querySelector<HTMLElement>(
      `.${this.TAB_HEADER_CLASS}[${this.TAB_ID}="${id}"]`
    ) || null;

    this.tabChange.emit({
      tabId: id,
      tabHeader: header,
      tabContent: item,
      index: indexVal,
      title: item.getAttribute(this.HEADER_TITLE)
    });
  }

  setActiveTab(indexVal: number, isDisabled: boolean, emitEvent: boolean) {
    if (isDisabled || !this.tabItems?.[0]) return;

    // If same tab is requested, still emit when asked (tests expect this)
    if (indexVal === this.activeIndex) {
      if (emitEvent) {
        const item = this.tabItems[indexVal];
        this.emitChangeFor(indexVal, item);
      }
      return;
    }

    this.tabItems = this.tabItems.map((item: HTMLElement, itemIndex) => {
      const shouldBeActive = itemIndex === indexVal;
      item.toggleAttribute(this.ACTIVE_CLASS, shouldBeActive);
      return item;
    });

    this.activeIndex = indexVal;
    if (emitEvent) {
      const item = this.tabItems[indexVal];
      this.emitChangeFor(indexVal, item);
    }
  }

  navControlClick(direction: string, isFirstLast: boolean = false) {
    if (!this.tabItems?.length) return;

    if (direction === this.LEFT) {
      if (isFirstLast) {
        const isDisabled = this.tabItems[0].hasAttribute(this.DISABLED);
        if (!isDisabled) this.setActiveTab(0, isDisabled, true);
      } else if (this.activeIndex > 0) {
        const isDisabled = this.tabItems[this.activeIndex - 1].hasAttribute(this.DISABLED);
        if (!isDisabled) this.setActiveTab(this.activeIndex - 1, isDisabled, true);
      }
    } else {
      const lastIndex = this.tabItems.length - 1;
      if (isFirstLast) {
        const isDisabled = this.tabItems[lastIndex].hasAttribute(this.DISABLED);
        if (!isDisabled) this.setActiveTab(lastIndex, isDisabled, true);
      } else if (this.activeIndex < lastIndex) {
        const isDisabled = this.tabItems[this.activeIndex + 1].hasAttribute(this.DISABLED);
        if (!isDisabled) this.setActiveTab(this.activeIndex + 1, isDisabled, true);
      }
    }
  }

  hostKeyDown = (event: KeyboardEvent): void => {
    if (!event) return;
    const { code } = event;
    if (code === 'Tab' && this.tabItems?.[this.activeIndex]) {
      const activeHeader = this.tabItems[this.activeIndex] as any;
      activeHeader.focus?.();
      activeHeader.click?.();
    }
  };

  handleKeyDown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const { code } = event;
    if (code === 'Enter' || code === 'Space') {
      target.focus();
      target.click();
      event.preventDefault();
    }
    if (code === 'ArrowLeft' && target.previousElementSibling) {
      (target as HTMLElement).blur();
      (target.previousElementSibling as HTMLElement).focus();
      event.preventDefault();
    }
    if (code === 'ArrowRight' && target.nextElementSibling) {
      (target as HTMLElement).blur();
      (target.nextElementSibling as HTMLElement).focus();
      event.preventDefault();
    }
  };

  render() {
    return (
      <Host
        class={{ 'no-separator': !this.separator }}
        onKeyDown={this.hostKeyDown}
      >
        {this.tabItems?.[0] && (
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
            <div
              class={`${this.TAB_HEADER_CONTAINER} ${this.fullHeader ? 'is-full-header' : ''}`}
              ref={el => (this.tabHeaderContainer = el as HTMLDivElement)}
            >
              <div
                class={this.TAB_HEADERS}
                ref={el => (this.tabHeaderList = el as HTMLDivElement)}
              >
                {this.tabItems.map((tabItem, index) => (
                  <div
                    tab-id={tabItem.getAttribute(this.TAB_ID)}
                    class={`
                      ${this.TAB_HEADER_CLASS}
                      ${this.checkAndRenderClass(tabItem, this.ACTIVE_CLASS)}
                      ${this.checkAndRenderClass(tabItem, this.DISABLED)}
                    `}
                    onClick={() => this.setActiveTab(index, tabItem.hasAttribute(this.DISABLED), true)}
                    onKeyDown={this.handleKeyDown}
                    tabindex={tabItem.hasAttribute(this.DISABLED) ? '-1' : '1'}
                  >
                    <span
                      data-badge={tabItem.getAttribute(this.BADGE_VALUE)}
                      data-active={`${this.checkAndRenderClass(tabItem, this.ACTIVE_CLASS)}`}
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
                            variation={this.checkAndRenderClass(tabItem, this.ACTIVE_CLASS) ? 'danger' : 'default'}
                          >
                            {tabItem.getAttribute(this.BADGE_VALUE)}
                          </BADGE>
                        </i>
                      )}
                    </span>
                  </div>
                ))}
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
