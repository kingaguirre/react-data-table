import { newE2EPage } from '@stencil/core/testing';

describe('my-portal (e2e)', () => {
  it('should append and remove the portal container when toggling active attribute', async () => {
    const page = await newE2EPage();

    // 1) render a host with active="false"
    await page.setContent(`
      <my-portal selector="body" active="false">
        <div id="child">Hello E2E</div>
      </my-portal>
    `);

    // ensure nothing under <body> yet
    let portalRoot = await page.evaluate(() => !!document.querySelector('[data-portal-root="body"]'));
    expect(portalRoot).toBe(false);

    // 2) flip to active="true"
    const host = await page.find('my-portal');
    await host.setAttribute('active', 'true');
    await page.waitForChanges();

    // now container should exist
    portalRoot = await page.evaluate(() => !!document.querySelector('[data-portal-root="body"]'));
    expect(portalRoot).toBe(true);

    // child should be moved there
    const childText = await page.evaluate(() => {
      const root = document.querySelector('[data-portal-root="body"]');
      return root?.querySelector('#child')?.textContent;
    });
    expect(childText).toBe('Hello E2E');

    // 3) flip back to false
    await host.setAttribute('active', 'false');
    await page.waitForChanges();

    // container removed again
    portalRoot = await page.evaluate(() => !!document.querySelector('[data-portal-root="body"]'));
    expect(portalRoot).toBe(false);
  });
});
