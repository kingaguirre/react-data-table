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
import { randomString } from '../../utils';

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

  /** Show/hide separator line between headers */
  @Prop() separator: boolean = false;

  /** Show/hide first & last nav controls */
  @Prop() firstLastNavControl: boolean = true;

  /** Max height for content area */
  @Prop() contentHeight: string;

  /** Make headers flex:1 */
  @Prop() fullHeader: boolean = false;

  /** Fired when tab is (re)activated — must bubble & be composed for tests */
  @Event({ eventName: 'tabChange', bubbles: true, composed: true }) tabChange: EventEmitter<TabChangeDetail>;

  /** Internal: tab items (light DOM children) */
  @State() tabItems: HTMLElement[] | null;

  /** Internal widths */
  @State() tabHeaderContainerWidth: number = 0;
  @State() tabHeaderListWidth: number = 0;

  /** Active index */
  @State() activeIndex: number = 0;

  /**
   * Set active by index.
   */
  @Method() async setActiveTabByIndex(index: number, emitEvent: boolean = true) {
    if (!this.tabItems || !this.tabItems[index]) return;
    const isDisabled = this.tabItems[index].hasAttribute(this.DISABLED);
    this.setActiveTab(index, isDisabled, emitEvent);
  }

  /**
   * Set active by header title.
   */
  @Method() async setActiveTabByTitle(title: string, emitEvent: boolean = true) {
    if (!this.tabItems) return;
    var indexVal: number | undefined = undefined;
    for (var i = 0; i < this.tabItems.length; i++) {
      var item: any = this.tabItems[i] as any;
      // Prefer property, but support attribute fallback
      var itemTitle = item && typeof item.headerTitle !== 'undefined'
        ? item.headerTitle
        : this.tabItems[i].getAttribute(this.HEADER_TITLE);
      if (itemTitle === title) {
        indexVal = i;
        break;
      }
    }
    if (typeof indexVal === 'number') {
      const isDisabled = this.tabItems[indexVal].hasAttribute(this.DISABLED);
      this.setActiveTab(indexVal, isDisabled, emitEvent);
    }
  }

  /**
   * Set active by tab-id.
   */
  @Method() async setActiveTabByTabId(tabId: string, emitEvent: boolean = true) {
    if (!this.tabItems) return;
    var indexVal: number | undefined = undefined;
    for (var i = 0; i < this.tabItems.length; i++) {
      var attrId = this.tabItems[i].getAttribute(this.TAB_ID);
      var propId: any = (this.tabItems[i] as any).tabId;
      if (attrId === String(tabId) || propId === tabId) {
        indexVal = i;
        break;
      }
    }
    if (typeof indexVal === 'number') {
      const isDisabled = this.tabItems[indexVal].hasAttribute(this.DISABLED);
      this.setActiveTab(indexVal, isDisabled, emitEvent);
    }
  }

  componentWillLoad() {
    this.tabItems = getChildren<HTMLElement>(this.element, [TAB_ITEM]);
    removeInvalidElements(this.element, TAB_ITEM, this.tabItems);

    // Ensure every tab-item has a tab-id BEFORE first render (headers read it)
    if (this.tabItems && this.tabItems.length > 0) {
      for (var i = 0; i < this.tabItems.length; i++) {
        var el = this.tabItems[i];
        if (!el.hasAttribute(this.TAB_ID)) {
          el.setAttribute(this.TAB_ID, randomString('tab-'));
        }
      }
    }

    // Determine initial active index. Accept: active="true", active="", class "active", or presence (not "false")
    if (this.tabItems && this.tabItems.length > 0) {
      var currentActiveIndex = -1;
      for (var j = 0; j < this.tabItems.length; j++) {
        var it = this.tabItems[j];
        var hasAttr = it.hasAttribute(this.ACTIVE_CLASS);
        var hasClass = it.classList.contains(this.ACTIVE_CLASS);
        var val = it.getAttribute(this.ACTIVE_CLASS);
        if ((hasAttr && val !== 'false') || hasClass) {
          currentActiveIndex = j;
          break;
        }
      }
      var activeIndex = currentActiveIndex === -1 ? 0 : currentActiveIndex;

      // Normalize: exactly one active (both attr and class for immediate header reflect)
      for (var k = 0; k < this.tabItems.length; k++) {
        var isActive = k === activeIndex;
        this.tabItems[k].setAttribute(this.ACTIVE_CLASS, isActive ? 'true' : 'false');
        if (isActive) this.tabItems[k].classList.add(this.ACTIVE_CLASS);
        else this.tabItems[k].classList.remove(this.ACTIVE_CLASS);
      }
      this.activeIndex = activeIndex;
    }
  }

  componentDidLoad() {
    if (this.tabItems && this.tabItems[0] && this.tabHeaderContainer && this.tabHeaderList) {
      this.tabHeaderContainerWidth = this.tabHeaderContainer.clientWidth;
      this.tabHeaderListWidth = this.tabHeaderList.clientWidth;
    }
  }

  componentDidUpdate() {
    if (this.tabItems && this.tabItems[0] && this.tabHeaderContainer && this.tabHeaderList) {
      this.tabHeaderContainerWidth = this.tabHeaderContainer.clientWidth;
      this.tabHeaderListWidth = this.tabHeaderList.clientWidth;

      var headerWrap = this.headerContainer;
      if (!headerWrap) return;
      var activeTab = getElement<HTMLElement>(headerWrap, '.' + this.ACTIVE_CLASS);
      if (!activeTab) return; // guard to avoid test-time crashes

      var containerScrollLeft = this.tabHeaderContainer.scrollLeft;
      var right = activeTab.offsetLeft + activeTab.clientWidth;
      var left = activeTab.offsetLeft;

      if (right > this.tabHeaderContainerWidth + containerScrollLeft) {
        this.tabHeaderContainer.scrollLeft = right - this.tabHeaderContainerWidth;
      } else if (left < containerScrollLeft) {
        this.tabHeaderContainer.scrollLeft = left;
      }
    }
  }

  get headerContainer(): Element | null {
    return getElement(this.element, '.' + this.TAB_HEADER_CONTAINER);
  }

  get contentStyle() {
    if (this.contentHeight) {
      return { 'max-height': this.contentHeight };
    }
    return {};
  }

  /** Derive header classes from child: class OR active="true" attribute */
  checkAndRenderClass(el: Element, cls: string): string {
    if (el.classList.contains(cls)) return ' ' + cls;
    if (cls === this.ACTIVE_CLASS) {
      var v = el.getAttribute(this.ACTIVE_CLASS);
      if (v === 'true') return ' ' + cls;
    }
    return '';
  }

  private emitChangeFor(indexVal: number, item: HTMLElement) {
    var id = item.getAttribute(this.TAB_ID);
    var headerWrap = this.headerContainer;
    var header: HTMLElement | null = null;
    if (headerWrap) {
      header = headerWrap.querySelector('.' + this.TAB_HEADER_CLASS + '[' + this.TAB_ID + '="' + id + '"]');
    }
    this.tabChange.emit({
      tabId: id,
      tabHeader: header,
      tabContent: item,
      index: indexVal,
      title: item.getAttribute(this.HEADER_TITLE)
    });
  }

  setActiveTab(indexVal: number, isDisabled: boolean, emitEvent: boolean) {
    if (isDisabled) return;
    if (!this.tabItems || this.tabItems.length === 0) return;

    // If same tab requested, still emit (tests expect this)
    if (indexVal === this.activeIndex) {
      if (emitEvent) {
        this.emitChangeFor(indexVal, this.tabItems[indexVal]);
      }
      return;
    }

    for (var i = 0; i < this.tabItems.length; i++) {
      var isActive = i === indexVal;
      this.tabItems[i].setAttribute(this.ACTIVE_CLASS, isActive ? 'true' : 'false');
      if (isActive) this.tabItems[i].classList.add(this.ACTIVE_CLASS);
      else this.tabItems[i].classList.remove(this.ACTIVE_CLASS);
    }

    this.activeIndex = indexVal;
    if (emitEvent) {
      this.emitChangeFor(indexVal, this.tabItems[indexVal]);
    }
  }

  navControlClick(direction: string, isFirstLast: boolean = false) {
    if (!this.tabItems || this.tabItems.length === 0) return;

    if (direction === this.LEFT) {
      if (isFirstLast) {
        var leftDisabled = this.tabItems[0].hasAttribute(this.DISABLED);
        if (!leftDisabled) this.setActiveTab(0, leftDisabled, true);
      } else {
        if (this.activeIndex > 0) {
          var prevDisabled = this.tabItems[this.activeIndex - 1].hasAttribute(this.DISABLED);
          if (!prevDisabled) this.setActiveTab(this.activeIndex - 1, prevDisabled, true);
        }
      }
    } else {
      var lastIndex = this.tabItems.length - 1;
      if (isFirstLast) {
        var rightDisabled = this.tabItems[lastIndex].hasAttribute(this.DISABLED);
        if (!rightDisabled) this.setActiveTab(lastIndex, rightDisabled, true);
      } else {
        if (this.activeIndex < lastIndex) {
          var nextDisabled = this.tabItems[this.activeIndex + 1].hasAttribute(this.DISABLED);
          if (!nextDisabled) this.setActiveTab(this.activeIndex + 1, nextDisabled, true);
        }
      }
    }
  }

  hostKeyDown = (event: KeyboardEvent): void => {
    if (!event) return;
    var code = (event as any).code;
    if (code === 'Tab' && this.tabItems && this.tabItems[this.activeIndex]) {
      var activeHeader: any = this.tabItems[this.activeIndex] as any;
      if (activeHeader && typeof activeHeader.focus === 'function') activeHeader.focus();
      if (activeHeader && typeof activeHeader.click === 'function') activeHeader.click();
    }
  };

  handleKeyDown = (event: KeyboardEvent): void => {
    if (!event) return;
    var target = event.target as HTMLElement;
    if (!target) return;

    var code = (event as any).code;
    if (code === 'Enter' || code === 'Space') {
      target.focus();
      (target as any).click();
      event.preventDefault();
    }
    if (code === 'ArrowLeft' && target.previousElementSibling) {
      (target as any).blur();
      (target.previousElementSibling as any).focus();
      event.preventDefault();
    }
    if (code === 'ArrowRight' && target.nextElementSibling) {
      (target as any).blur();
      (target.nextElementSibling as any).focus();
      event.preventDefault();
    }
  };

  render() {
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
            <div
              class={this.TAB_HEADER_CONTAINER + (this.fullHeader ? ' is-full-header' : '')}
              ref={(el) => (this.tabHeaderContainer = el as HTMLDivElement)}
            >
              <div
                class={this.TAB_HEADERS}
                ref={(el) => (this.tabHeaderList = el as HTMLDivElement)}
              >
                {this.tabItems.map((tabItem, index) => (
                  <div
                    tab-id={tabItem.getAttribute(this.TAB_ID)}
                    class={
                      this.TAB_HEADER_CLASS +
                      this.checkAndRenderClass(tabItem, this.ACTIVE_CLASS) +
                      this.checkAndRenderClass(tabItem, this.DISABLED)
                    }
                    onClick={() => this.setActiveTab(index, tabItem.hasAttribute(this.DISABLED), true)}
                    onKeyDown={this.handleKeyDown}
                    tabindex={tabItem.hasAttribute(this.DISABLED) ? '-1' : '1'}
                  >
                    <span
                      data-badge={tabItem.getAttribute(this.BADGE_VALUE)}
                      data-active={this.checkAndRenderClass(tabItem, this.ACTIVE_CLASS)}
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
        <div
          class="tab-content-wrap"
          ref={(el) => (this.tabContent = el as HTMLDivElement)}
          style={this.contentStyle as any}
        >
          <slot />
        </div>
      </Host>
    );
  }
}
