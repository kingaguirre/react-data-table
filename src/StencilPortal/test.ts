// portal.spec.ts
import { newSpecPage } from '@stencil/core/dist/testing';
import { MyPortal } from './portal';

describe('my-portal (unit)', () => {
  beforeEach(() => {
    // clean out any leftover portal roots
    document
      .querySelectorAll('[data-portal-root="body"]')
      .forEach(el => el.remove());
  });

  it('does not append when active=false', async () => {
    const page = await newSpecPage({
      components: [MyPortal],
      html: `<my-portal selector="body" active="false">
               <div id="child">Hidden</div>
             </my-portal>`,
    });

    const root = page.win.document.querySelector('[data-portal-root="body"]');
    expect(root).toBeNull();
  });

  it('mounts content when active=true and unmounts when toggled off', async () => {
    const page = await newSpecPage({
      components: [MyPortal],
      html: `<my-portal selector="body" active="true">
               <span id="child">Hello</span>
             </my-portal>`,
    });

    // initial mount
    let root = page.win.document.querySelector('[data-portal-root="body"]') as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.querySelector('#child')?.textContent).toBe('Hello');

    // toggle off
    (page.root as any).active = false;
    await page.waitForChanges();
    root = page.win.document.querySelector('[data-portal-root="body"]');
    expect(root).toBeNull();

    // toggle on again
    (page.root as any).active = true;
    await page.waitForChanges();
    root = page.win.document.querySelector('[data-portal-root="body"]') as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.querySelector('#child')?.textContent).toBe('Hello');
  });

  it('removes portal root when component is removed', async () => {
    // attach a host container to the real document
    const container = document.createElement('div');
    document.body.appendChild(container);

    const page = await newSpecPage({
      components: [MyPortal],
      template: () => container,
    });

    // insert the portal host
    const host = page.win.document.createElement('my-portal');
    host.setAttribute('selector', 'body');
    (host as any).active = true;
    host.innerHTML = `<b id="x">X</b>`;
    container.appendChild(host);
    await page.waitForChanges();

    // ensure mounted
    let root = page.win.document.querySelector('[data-portal-root="body"]') as HTMLElement;
    expect(root.querySelector('#x')).not.toBeNull();

    // remove the host
    container.removeChild(host);
    await page.waitForChanges();

    // portal root should be gone
    root = page.win.document.querySelector('[data-portal-root="body"]');
    expect(root).toBeNull();
  });
});
