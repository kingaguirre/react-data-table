// src/components/tabs/tab-item/tab-item.tsx
import { Component, Prop, h, Host, Element } from '@stencil/core';
import { TAB_ITEM } from '../../../constant/tags';
import { randomString } from '../../../utils';

@Component({
  tag: 'tx-core-tab-item',
  styleUrl: 'tab-item.scss',
  shadow: true
})
export class TabItem {
  TAB_CONTENT: string = `${TAB_ITEM}-content`;
  ACTIVE: string = 'active';
  TAB_ID: string = 'tab-id';

  /** Host el */
  @Element() tabItem!: HTMLElement;

  /** Disabled status (reflected for parent to read & style) */
  @Prop({ reflect: true }) disabled: boolean = false;

  /** Optional badge content */
  @Prop({ reflect: true }) badge?: string;

  /** Badge border radius (e.g., "6px") */
  @Prop({ reflect: true, attribute: 'badge-radius' }) badgeRadius: string = '6px';

  /** Header title (string HTML accepted) */
  @Prop({ reflect: true, attribute: 'header-title' }) headerTitle: string;

  /** Optional id used to link header & content */
  @Prop({ reflect: true, attribute: 'tab-id' }) tabId?: string | number;

  /** Active status (presence of attribute is the source of truth) */
  @Prop({ mutable: true, reflect: true }) active: boolean = false;

  componentDidLoad() {
    // Ensure a persistent tab-id
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
        active={this.active}
        data-active={this.active ? 'true' : 'false'}
        class={`tx-core-tab-item ${this.active ? 'active' : ''} ${this.disabled ? 'disabled' : ''}`}
      >
        <div class="tx-core-tab-item-content">
          <slot />
        </div>
      </Host>
    );
  }
}
