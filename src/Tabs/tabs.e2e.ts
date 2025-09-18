import { newE2EPage } from '@stencil/core/testing';

describe('tab', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<tx-core-tabs></tx-core-tabs>');
    const element = await page.find('.tx-core-tabs');
    expect(element).toHaveClass('hydrated');
  });
});
