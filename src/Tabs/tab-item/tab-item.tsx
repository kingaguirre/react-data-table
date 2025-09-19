import { Component, Prop, h, Host, Element } from '@stencil/core';
import { TAB_ITEM } from '../../../constant/tags';
import { randomString } from '../../../utils';

@Component({
  tag: 'tx-core-tab-item',
  styleUrl: 'tab-item.scss',
  shadow: true
})
export class TabItem {
  TAB_TITLE: string = TAB_ITEM + '-content';
  TAB_TITLE_PLACEHOLDER: string = 'Tab Header Title';
  TAB_CONTENT: string = TAB_ITEM + '-content';
  ACTIVE: string = 'active';
  TAB_ID: string = 'tab-id';

  /** Tab item element */
  @Element() tabItem: HTMLElement;

  /** Optional property to set the disabled status */
  @Prop() disabled?: boolean;

  /** Optional property to enable/set badge */
  @Prop() badge?: string = undefined;

  /** Optional property to set badge border radius (ex. 8px) */
  @Prop() badgeRadius?: string = '6px';

  /** Property to set the header title */
  @Prop() headerTitle: string;

  /** Optional property to set ID */
  @Prop() tabId?: string | number;

  /** Property to set the active status */
  @Prop({ mutable: true, reflectToAttr: true }) active = false;

  // Assign tab-id BEFORE first parent render (headers read it immediately)
  componentWillLoad() {
    if (!this.tabItem.hasAttribute(this.TAB_ID)) {
      this.tabItem.setAttribute(this.TAB_ID, randomString('tab-'));
    }
  }

  render() {
    return (
      <Host
        badge={this.badge}
        disabled={this.disabled}
        header-title={this.headerTitle}
        badge-radius={this.badgeRadius}
        active={this.active ? this.ACTIVE : ''}
        class={
          TAB_ITEM +
          (this.active ? ' ' + this.ACTIVE : '') +
          (this.disabled ? ' disabled' : '')
        }
      >
        <div class={this.TAB_CONTENT}>
          <slot />
        </div>
      </Host>
    );
  }
}
