// src/components/portal/portal.tsx
import { Component, Prop, h, Host, Element, Watch } from '@stencil/core';

@Component({
  tag: 'my-portal',
  shadow: false
})
export class MyPortal {
  @Element() private host!: HTMLElement;

  /** CSS selector to portal into (default: <body>) */
  @Prop() selector: string = 'body';

  /** controls whether we are mounted or not */
  @Prop() active: boolean = true;

  private portalRoot!: HTMLElement;

  componentWillLoad() {
    // create the container in memory, but *do not* append it yet
    this.portalRoot = document.createElement('div');
    this.portalRoot.setAttribute('data-portal-root', this.selector);
  }

  componentDidLoad() {
    // if it started active, mount immediately
    if (this.active) {
      this.mount();
    }
  }

  @Watch('active')
  protected onActiveChange(isActive: boolean) {
    if (isActive) {
      this.mount();
    } else {
      this.unmount();
    }
  }

  private mount() {
    // append the root to the target selector
    const target = document.querySelector(this.selector);
    if (!target || this.portalRoot.parentElement === target) return;
    target.appendChild(this.portalRoot);

    // move *all* current host children into portalRoot
    Array.from(this.host.childNodes).forEach(node => {
      this.portalRoot.appendChild(node);
    });
  }

  private unmount() {
    // remove the portalRoot (and its contents) from the DOM
    if (this.portalRoot.parentElement) {
      this.portalRoot.parentElement.removeChild(this.portalRoot);
    }
  }

  disconnectedCallback() {
    // just in case, clean up
    this.unmount();
  }

  render() {
    // the portal host itself renders nothing
    return <Host />;
  }
}
