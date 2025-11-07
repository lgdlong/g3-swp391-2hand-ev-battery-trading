import { Selector } from 'testcafe';

fixture('Homepage Tests')
    .page('http://localhost:3000');

test('Homepage loads correctly', async t => {
    await t
        .expect(Selector('h1').exists).ok('Homepage should have a main heading')
        .expect(Selector('body').textContent).contains('2Hand EV Battery Trading', 'Page should contain app title');
});

test('Navigation works', async t => {
    // Test basic navigation elements exist
    await t
        .expect(Selector('nav').exists).ok('Navigation should exist')
        .expect(Selector('a[href="/"]').exists).ok('Home link should exist');
});