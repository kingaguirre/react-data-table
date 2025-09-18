import { storiesOf } from '@storybook/html';
import { action } from '@storybook/addon-actions';
import notes from './tab-item/readme.md';
import '../../shared/storybook/styles.css';

storiesOf('atoms/Tabs', module).add(
  'Default',
  () => {
    const fragment = document.createRange().createContextualFragment(`
      <section>
        <h2>
          Tabs
          <small>Component name: <b>tx-core-tabs</b></small>
        </h2>
        <tx-core-grid align-items="stretch">
          <tx-core-column>
            <article>
              <h3>Description</h3>
              <p>
                Tabs are an easy way to organize content by grouping similar
                information on the same page. This allows content to be viewed without
                having to navigate away from that page.
              </p>
            </article>
          </tx-core-column>
          <tx-core-column>
            <article>
              <h3>When to use</h3>
              <p>
                When you want to render too much content or a very lengthy form can be
                split in to multiple tabs.
              </p>
            </article>
          </tx-core-column>
        </tx-core-grid>
      </section>

      <section>
        <article>
          <h3>Basic behaviour</h3>
          <tx-core-tabs>
            <tx-core-tab-item header-title="Tab one">
              <tx-core-grid>
                <tx-core-column>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?
                </tx-core-column>
                   <tx-core-column>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?
                </tx-core-column>
              </tx-core-grid>
            </tx-core-tab-item>
            <tx-core-tab-item active="true" disabled="false" header-title="Tab two">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
              pariatur, cumque qui ipsum consequatur temporibus velit nisi?
              Accusantium maxime modi, ducimus voluptatem perferendis consectetur
              quibusdam eligendi corporis ullam nostrum? Molestias!
            </tx-core-tab-item>
            <tx-core-tab-item active="true" disabled="true" header-title="Tab three">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
              temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
              officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
              laborum. Explicabo, aliquid optio?
            </tx-core-tab-item>
            <tx-core-tab-item disabled header-title="Tab four">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
              temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
              officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
              laborum. Explicabo, aliquid optio?
            </tx-core-tab-item>
          </tx-core-tabs>
          
          <div class="explanation">
            It's important to highlight that <code>tx-core-tabs</code> only accepts <code>tx-core-tab-item</code> tag
            as an immediate child component. Any other will be removed.
          </div>

           <tx-core-tabs full-header="true">
            <tx-core-tab-item header-title="Tab one">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
              velit consequuntur, unde mollitia ratione dolores voluptatum dicta
              nesciunt dolorem, sunt harum est voluptates consequatur aliquam
              recusandae dolor ex perferendis?
            </tx-core-tab-item>
            <tx-core-tab-item active header-title="Tab two">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
              pariatur, cumque qui ipsum consequatur temporibus velit nisi?
              Accusantium maxime modi, ducimus voluptatem perferendis consectetur
              quibusdam eligendi corporis ullam nostrum? Molestias!
            </tx-core-tab-item>
            <tx-core-tab-item header-title="Tab three">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
              temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
              officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
              laborum. Explicabo, aliquid optio?
            </tx-core-tab-item>
            <tx-core-tab-item disabled header-title="Tab four">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
              temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
              officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
              laborum. Explicabo, aliquid optio?
            </tx-core-tab-item>
          </tx-core-tabs>
          
          <div class="explanation">
            Prop <code>full-header="true"</code> to show full width header.
          </div>
        </article>
      </section>

      <section>
        <article>
          <h3>Header separator</h3>
          <p>Separators can be added between the tab items in the header if the <code>separator="true"</code> property is set or by just adding <code>separator</code> property.</p>

          <tx-core-tabs separator>
            <tx-core-tab-item header-title="Tab one" tab-id="tab-one">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
              velit consequuntur, unde mollitia ratione dolores voluptatum dicta
              nesciunt dolorem, sunt harum est voluptates consequatur aliquam
              recusandae dolor ex perferendis?
            </tx-core-tab-item>
            <tx-core-tab-item header-title="Tab two" tab-id="tab-two">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
              pariatur, cumque qui ipsum consequatur temporibus velit nisi?
              Accusantium maxime modi, ducimus voluptatem perferendis consectetur
              quibusdam eligendi corporis ullam nostrum? Molestias!
            </tx-core-tab-item>
            <tx-core-tab-item header-title="Tab three" tab-id="tab-three">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
              temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
              officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
              laborum. Explicabo, aliquid optio?
            </tx-core-tab-item>
            <tx-core-tab-item  header-title="Tab four">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
              temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
              officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
              laborum. Explicabo, aliquid optio?
            </tx-core-tab-item>
          </tx-core-tabs>
        </article>
      </section>

      <section>
        <article>
          <h3>Header title</h3>
          <p>HTML element can be added in tab header or you can use other web component as content, but take note that it only accept string html</p>

          <tx-core-tabs>
            <tx-core-tab-item active header-title="<tx-core-icon size='r' icon='mail'></tx-core-icon> &nbsp; Mail">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
              velit consequuntur, unde mollitia ratione dolores voluptatum dicta
              nesciunt dolorem, sunt harum est voluptates consequatur aliquam
              recusandae dolor ex perferendis?
            </tx-core-tab-item>
            <tx-core-tab-item header-title="Tab two &nbsp; <tx-core-icon size='r' icon='download'></tx-core-icon>">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
              pariatur, cumque qui ipsum consequatur temporibus velit nisi?
              Accusantium maxime modi, ducimus voluptatem perferendis consectetur
              quibusdam eligendi corporis ullam nostrum? Molestias!
            </tx-core-tab-item>
            <tx-core-tab-item header-title="<tx-core-icon size='r' icon='info'></tx-core-icon> &nbsp; More info">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
              temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
              officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
              laborum. Explicabo, aliquid optio?
            </tx-core-tab-item>
          </tx-core-tabs>
        </article>
      </section>

      <section>
        <article>
          <h3>Header badges</h3>
          <p>Badges can be added in tab header if the <code>badge-radius="6px" badge="VALUE"</code> property is set.</p>

          <tx-core-tabs>
            <tx-core-tab-item active header-title="Tab one" badge-radius="6px" badge="2">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
              velit consequuntur, unde mollitia ratione dolores voluptatum dicta
              nesciunt dolorem, sunt harum est voluptates consequatur aliquam
              recusandae dolor ex perferendis?
            </tx-core-tab-item>
            <tx-core-tab-item header-title="Tab two" badge-radius="6px" badge="4">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
              pariatur, cumque qui ipsum consequatur temporibus velit nisi?
              Accusantium maxime modi, ducimus voluptatem perferendis consectetur
              quibusdam eligendi corporis ullam nostrum? Molestias!
            </tx-core-tab-item>
            <tx-core-tab-item header-title="Tab three" badge-radius="6px" badge="6">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
              temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
              officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
              laborum. Explicabo, aliquid optio?
            </tx-core-tab-item>
            <tx-core-tab-item  header-title="Tab four">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
              temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
              officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
              laborum. Explicabo, aliquid optio?
            </tx-core-tab-item>
          </tx-core-tabs>
        </article>
      </section>

      <section>
        <article>
          <h3>Tab Header Navigation Controls</h3>
          <p>This controls will automatically show if the header width is longer than the container.</p>
          
          <tx-core-grid align-items="stretch">
            <tx-core-column>
              <p>With complete navigation controls.</p>
            </tx-core-column>
            <tx-core-column>
              <p>Without the first and last navigation controls. 
              Use this property <code>first-last-nav-control="true"</code> to show this controls, by default it is set to <code>false</code>.</p>
            </tx-core-column>
          </tx-core-grid>

          <tx-core-grid align-items="stretch" first-last-nav-control="true">
            <tx-core-column xs="12" sm="12" md="12" lg="12" xl="12">
              <tx-core-tabs>
                <tx-core-tab-item active header-title="Tab one">
                  Tab one - Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab two">
                  Tab two - Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
                  pariatur, cumque qui ipsum consequatur temporibus velit nisi?
                  Accusantium maxime modi, ducimus voluptatem perferendis consectetur
                  quibusdam eligendi corporis ullam nostrum? Molestias!
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab three">
                  Tab three - Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                  temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
                  officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
                  laborum. Explicabo, aliquid optio?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab four">
                  Tab four - Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab five">
                  Tab five - Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
                  pariatur, cumque qui ipsum consequatur temporibus velit nisi?
                  Accusantium maxime modi, ducimus voluptatem perferendis consectetur
                  quibusdam eligendi corporis ullam nostrum? Molestias!
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab six">
                  Tab six - Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                  temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
                  officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
                  laborum. Explicabo, aliquid optio?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab seven">
                  Tab seven - Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                  temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
                  officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
                  laborum. Explicabo, aliquid optio?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab eight">
                  Tab eight - Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                  temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
                  officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
                  laborum. Explicabo, aliquid optio?
                </tx-core-tab-item>
              </tx-core-tabs>
            </tx-core-column>

            
            <tx-core-column xs="12" sm="12" md="12" lg="12" xl="12">
              <tx-core-tabs first-last-nav-control="false">
                <tx-core-tab-item active header-title="Tab one" badge-radius="6px" badge="2">
                  Tab one - Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab two" badge-radius="6px" badge="4">
                  Tab two - Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
                  pariatur, cumque qui ipsum consequatur temporibus velit nisi?
                  Accusantium maxime modi, ducimus voluptatem perferendis consectetur
                  quibusdam eligendi corporis ullam nostrum? Molestias!
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab three" badge-radius="6px" badge="6">
                  Tab three - Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                  temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
                  officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
                  laborum. Explicabo, aliquid optio?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab four" badge-radius="6px" badge="2">
                  Tab four - Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab five" badge-radius="6px" badge="4">
                  Tab five - Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
                  pariatur, cumque qui ipsum consequatur temporibus velit nisi?
                  Accusantium maxime modi, ducimus voluptatem perferendis consectetur
                  quibusdam eligendi corporis ullam nostrum? Molestias!
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab six" badge-radius="6px" badge="6">
                  Tab six - Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                  temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
                  officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
                  laborum. Explicabo, aliquid optio?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab seven">
                  Tab seven - Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                  temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
                  officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
                  laborum. Explicabo, aliquid optio?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab eight">
                  Tab eight - Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                  temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
                  officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
                  laborum. Explicabo, aliquid optio?
                </tx-core-tab-item>
              </tx-core-tabs>
            </tx-core-column>
          </tx-core-grid>
        </article>
      </section>

      <section>
        <article>
          <h3>Content Height</h3>
          <p>Add custom height for the tab content by adding <code>content-height</code> parameter.</p>
          <p>Example: <code>content-height="200px"</code></p>

          <tx-core-grid align-items="stretch">
            <tx-core-column xs="12" sm="12" md="12" lg="12" xl="12">
              <tx-core-tabs content-height="200px">
                <tx-core-tab-item active header-title="Tab one">
                  Tab one - Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?

                  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
                  pariatur, cumque qui ipsum consequatur temporibus velit nisi?
                  Accusantium maxime modi, ducimus voluptatem perferendis consectetur
                  quibusdam eligendi corporis ullam nostrum? Molestias!

                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                  temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
                  officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
                  laborum. Explicabo, aliquid optio?

                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab two">
                  Tab two - Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
                  pariatur, cumque qui ipsum consequatur temporibus velit nisi?
                  Accusantium maxime modi, ducimus voluptatem perferendis consectetur
                  quibusdam eligendi corporis ullam nostrum? Molestias!

                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?

                  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
                  pariatur, cumque qui ipsum consequatur temporibus velit nisi?
                  Accusantium maxime modi, ducimus voluptatem perferendis consectetur
                  quibusdam eligendi corporis ullam nostrum? Molestias!

                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                  temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
                  officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
                  laborum. Explicabo, aliquid optio?

                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab three">
                  Tab three - Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                  temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
                  officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
                  laborum. Explicabo, aliquid optio?

                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?

                  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
                  pariatur, cumque qui ipsum consequatur temporibus velit nisi?
                  Accusantium maxime modi, ducimus voluptatem perferendis consectetur
                  quibusdam eligendi corporis ullam nostrum? Molestias!

                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                  temporibus omnis possimus incidunt quaerat, excepturi nihil quidem
                  officia sequi magni ullam, dolorem sapiente reiciendis at laboriosam
                  laborum. Explicabo, aliquid optio?

                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?
                </tx-core-tab-item>
                <tx-core-tab-item header-title="Tab four">
                  Tab four - Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
                  velit consequuntur, unde mollitia ratione dolores voluptatum dicta
                  nesciunt dolorem, sunt harum est voluptates consequatur aliquam
                  recusandae dolor ex perferendis?
                </tx-core-tab-item>
              </tx-core-tabs>
            </tx-core-column>
          </tx-core-grid>
        </article>
      </section>

      <section>
        <article>
          <h3>Event and function</h3>
          <p><code>change</code> Event that need to listen.</p>
          <p><code>onchange</code> Function that need to implement.</p>
          <p>Below are the properties which are attached in <code>event.detail</code></p>
          <p>
            <code>tabId</code> Current Tab ID  <br />
            <code>tabHeader</code> Current tab header element <br />
            <code>tabContent</code> Current TabItem element
          </p>

          <p>Code Example: </p>
          <pre class="margin-bottom">
            <code>

                // Event listener way

                tab.addEventListener('change', e => {
                  console.log(e.detail.tabId);
                  console.log(e.detail.tabHeader);
                  console.log(e.detail.tabContent);
                });

                // Functional way

                tab.onchange = e => {
                  console.log(e.detail.tabId);
                  console.log(e.detail.tabHeader);
                  console.log(e.detail.tabContent);
                };
  
            </code>
          </pre>

          <tx-core-tabs separator="false">
            <tx-core-tab-item active header-title="Tab one">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni
              velit consequuntur, unde mollitia ratione dolores voluptatum dicta
              nesciunt dolorem, sunt harum est voluptates consequatur aliquam
              recusandae dolor ex perferendis?
            </tx-core-tab-item>
            <tx-core-tab-item header-title="Tab two">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
              pariatur, cumque qui ipsum consequatur temporibus velit nisi?
              Accusantium maxime modi, ducimus voluptatem perferendis consectetur
              quibusdam eligendi corporis ullam nostrum? Molestias!
            </tx-core-tab-item>
          </tx-core-tabs>
        </article>
      </section>
      
      <section>
        <h3>Dynamic disabled toggle</h3>
        <p>Use the buttons to toggle <code>disabled</code> on Tab Two at runtime.</p>

        <div style="margin-bottom:12px; display:flex; gap:8px;">
          <button id="btn-disable" type="button">Disable Tab Two</button>
          <button id="btn-enable" type="button">Enable Tab Two</button>
          <button id="btn-toggle" type="button">Toggle Tab Two</button>
        </div>

        <tx-core-tabs id="demo-tabs">
          <tx-core-tab-item header-title="Tab one">
            Content one
          </tx-core-tab-item>
          <tx-core-tab-item id="tab-two" header-title="Tab two">
            Content two
          </tx-core-tab-item>
          <tx-core-tab-item header-title="Tab three">
            Content three
          </tx-core-tab-item>
        </tx-core-tabs>
      </section>
    `);

    const tabs = fragment.querySelectorAll(`tx-core-tabs`);

    tabs.forEach(tab => {
      tab.addEventListener('change', e => {
        action('tabId: ')(e.detail.tabId);
      });
    });

    const root = fragment as unknown as DocumentFragment;
    const demoTabs = root.querySelector('#demo-tabs') as HTMLElement;
    const tabTwo = root.querySelector('#tab-two') as HTMLElement;

    root.getElementById('btn-disable')!.addEventListener('click', () => {
      tabTwo.setAttribute('disabled', '');
      action('disabled-changed')('Tab Two -> disabled=true');
    });
    root.getElementById('btn-enable')!.addEventListener('click', () => {
      tabTwo.removeAttribute('disabled');
      action('disabled-changed')('Tab Two -> disabled=false');
    });
    root.getElementById('btn-toggle')!.addEventListener('click', () => {
      tabTwo.toggleAttribute('disabled');
      action('disabled-changed')(`Tab Two -> disabled=${tabTwo.hasAttribute('disabled')}`);
    });

    demoTabs.addEventListener('change', (e: any) => {
      action('tab-change')({
        tabId: e.detail.tabId,
        index: e.detail.index,
        title: e.detail.title
      });
    });

    return fragment;
  },
  { notes }
);
