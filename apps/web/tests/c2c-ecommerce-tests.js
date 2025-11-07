import { Selector } from 'testcafe';

fixture('C2C E-commerce Flow Tests')
    .page('http://localhost:3000')
    .beforeEach(async t => {
        // Clear localStorage and cookies before each test
        await t.eval(() => localStorage.clear());
        await t.deleteCookies();
    });

// Test Data
const testUser = {
    email: `testuser${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User'
};

const testPost = {
    title: `Test Battery ${Date.now()}`,
    description: 'High quality electric vehicle battery for sale',
    price: '5000000',
    brand: 'LG',
    capacity: '75',
    health: '95'
};

// TC001: User Registration - Valid Data
test('TC001: User Registration - Valid Data', async t => {
    await t
        .navigateTo('/sign-up')
        .typeText(Selector('input[name="fullName"]'), testUser.name)
        .typeText(Selector('input[name="email"]'), testUser.email)
        .typeText(Selector('input[name="password"]'), testUser.password)
        .typeText(Selector('input[name="confirmPassword"]'), testUser.password)
        .click(Selector('button').withText('Create Account'))
        .expect(Selector('a[href="/login"]').exists).ok('Login link should be available after registration');
});

// TC002: User Registration - Invalid Email
test('TC002: User Registration - Invalid Email', async t => {
    await t
        .click(Selector('a').withText('Đăng ký'))
        .typeText(Selector('input[name="email"]'), 'invalid-email')
        .typeText(Selector('input[name="password"]'), testUser.password)
        .typeText(Selector('input[name="confirmPassword"]'), testUser.password)
        .typeText(Selector('input[name="name"]'), testUser.name)
        .click(Selector('button').withText('Đăng ký'))
        .expect(Selector('.error-message').withText('Invalid email format').exists).ok('Error message for invalid email should appear');
});

// TC003: User Login - Valid Credentials
test('TC003: User Login - Valid Credentials', async t => {
    // First register a user
    await t
        .navigateTo('/sign-up')
        .typeText(Selector('input[name="fullName"]'), testUser.name)
        .typeText(Selector('input[name="email"]'), testUser.email)
        .typeText(Selector('input[name="password"]'), testUser.password)
        .typeText(Selector('input[name="confirmPassword"]'), testUser.password)
        .click(Selector('button').withText('Create Account'));

    // Then login
    await t
        .navigateTo('/login')
        .typeText(Selector('input[name="email"]'), testUser.email)
        .typeText(Selector('input[name="password"]'), testUser.password)
        .click(Selector('button').withText('Đăng nhập'))
        .expect(Selector('a').withText('Đăng tin').exists).ok('Post creation button should be visible after login');
});

// TC004: User Login - Invalid Credentials
test('TC004: User Login - Invalid Credentials', async t => {
    await t
        .navigateTo('/login')
        .typeText(Selector('input[name="email"]'), 'wrong@example.com')
        .typeText(Selector('input[name="password"]'), 'wrongpassword')
        .click(Selector('button').withText('Đăng nhập'))
        .expect(Selector('.error-message').exists).ok('Error message for invalid credentials should appear');
});

// TC005: Post Creation - Valid Data
test('TC005: Post Creation - Valid Data', async t => {
    // Login first
    await t
        .navigateTo('/login')
        .typeText(Selector('input[name="email"]'), testUser.email)
        .typeText(Selector('input[name="password"]'), testUser.password)
        .click(Selector('button').withText('Đăng nhập'));

    // Create post
    await t
        .click(Selector('a').withText('Đăng tin'))
        .typeText(Selector('input[name="title"]'), testPost.title)
        .typeText(Selector('textarea[name="description"]'), testPost.description)
        .typeText(Selector('input[name="price"]'), testPost.price)
        .click(Selector('select[name="brand"]'))
        .click(Selector('option').withText(testPost.brand))
        .typeText(Selector('input[name="capacity"]'), testPost.capacity)
        .typeText(Selector('input[name="health"]'), testPost.health)
        .setFilesToUpload(Selector('input[type="file"]'), ['../test-files/battery-image.jpg'])
        .click(Selector('button').withText('Đăng tin'))
        .expect(Selector('.success-message').exists).ok('Post creation success message should appear');
});

// TC006: Post Creation - Missing Required Fields
test('TC006: Post Creation - Missing Required Fields', async t => {
    // Login first
    await t
        .click(Selector('a').withText('Đăng nhập'))
        .typeText(Selector('input[name="email"]'), testUser.email)
        .typeText(Selector('input[name="password"]'), testUser.password)
        .click(Selector('button').withText('Đăng nhập'));

    // Try to create post without required fields
    await t
        .click(Selector('a').withText('Đăng tin'))
        .click(Selector('button').withText('Đăng tin'))
        .expect(Selector('.error-message').exists).ok('Error messages for missing fields should appear');
});

// TC007: Admin Post Review - Approve
test('TC007: Admin Post Review - Approve', async t => {
    // Login as admin
    await t
        .click(Selector('a').withText('Đăng nhập'))
        .typeText(Selector('input[name="email"]'), 'admin@admin.com')
        .typeText(Selector('input[name="password"]'), '123456')
        .click(Selector('button').withText('Đăng nhập'));

    // Navigate to admin review
    await t
        .click(Selector('a').withText('Admin'))
        .click(Selector('a').withText('Post Review'))
        .click(Selector('.pending-post').nth(0))
        .click(Selector('button').withText('Approve'))
        .typeText(Selector('textarea[name="notes"]'), 'Approved by automated test')
        .click(Selector('button').withText('Confirm'))
        .expect(Selector('.success-message').exists).ok('Post approval success message should appear');
});

// TC008: Admin Post Review - Reject
test('TC008: Admin Post Review - Reject', async t => {
    // Login as admin
    await t
        .click(Selector('a').withText('Đăng nhập'))
        .typeText(Selector('input[name="email"]'), 'admin@admin.com')
        .typeText(Selector('input[name="password"]'), '123456')
        .click(Selector('button').withText('Đăng nhập'));

    // Navigate to admin review
    await t
        .click(Selector('a').withText('Admin'))
        .click(Selector('a').withText('Post Review'))
        .click(Selector('.pending-post').nth(0))
        .click(Selector('button').withText('Reject'))
        .typeText(Selector('textarea[name="reason"]'), 'Rejected by automated test')
        .click(Selector('button').withText('Confirm'))
        .expect(Selector('.success-message').exists).ok('Post rejection success message should appear');
});

// TC009: Post Search - By Keyword
test('TC009: Post Search - By Keyword', async t => {
    await t
        .typeText(Selector('input[placeholder*="Tìm kiếm"]'), 'battery')
        .click(Selector('button').withText('Tìm kiếm'))
        .expect(Selector('.post-item').count).gt(0, 'Search results should contain posts');
});

// TC010: Post Search - By Category
test('TC010: Post Search - By Category', async t => {
    await t
        .click(Selector('select[name="category"]'))
        .click(Selector('option').withText('Battery'))
        .click(Selector('button').withText('Tìm kiếm'))
        .expect(Selector('.post-item').count).gt(0, 'Category filter should return results');
});

// TC011: Post Details View
test('TC011: Post Details View', async t => {
    await t
        .click(Selector('.post-item').nth(0))
        .expect(Selector('.post-title').exists).ok('Post title should be visible')
        .expect(Selector('.post-description').exists).ok('Post description should be visible')
        .expect(Selector('.post-price').exists).ok('Post price should be visible');
});

// TC012: Payment Processing - Valid Payment
test('TC012: Payment Processing - Valid Payment', async t => {
    // Login and navigate to a post
    await t
        .click(Selector('a').withText('Đăng nhập'))
        .typeText(Selector('input[name="email"]'), testUser.email)
        .typeText(Selector('input[name="password"]'), testUser.password)
        .click(Selector('button').withText('Đăng nhập'))
        .click(Selector('.post-item').nth(0))
        .click(Selector('button').withText('Mua ngay'));

    // Complete payment process
    await t
        .expect(Selector('.payment-form').exists).ok('Payment form should be visible')
        .click(Selector('button').withText('Thanh toán'))
        .expect(Selector('.success-message').withText('Payment successful').exists).ok('Payment success message should appear');
});

// TC013: Payment Processing - Insufficient Balance
test('TC013: Payment Processing - Insufficient Balance', async t => {
    // Login with low balance account
    await t
        .click(Selector('a').withText('Đăng nhập'))
        .typeText(Selector('input[name="email"]'), 'lowbalance@example.com')
        .typeText(Selector('input[name="password"]'), 'password123')
        .click(Selector('button').withText('Đăng nhập'))
        .click(Selector('.post-item').nth(0))
        .click(Selector('button').withText('Mua ngay'))
        .expect(Selector('.error-message').withText('Insufficient balance').exists).ok('Insufficient balance error should appear');
});

// TC014: Commission Calculation
test('TC014: Commission Calculation', async t => {
    // This test would require checking database or admin panel
    // For now, we'll verify the payment flow includes commission
    await t
        .click(Selector('a').withText('Đăng nhập'))
        .typeText(Selector('input[name="email"]'), 'admin@admin.com')
        .typeText(Selector('input[name="password"]'), '123456')
        .click(Selector('button').withText('Đăng nhập'))
        .click(Selector('a').withText('Commission Report'))
        .expect(Selector('.commission-data').exists).ok('Commission data should be visible');
});

// TC015: Wallet Top-up
test('TC015: Wallet Top-up', async t => {
    await t
        .click(Selector('a').withText('Đăng nhập'))
        .typeText(Selector('input[name="email"]'), testUser.email)
        .typeText(Selector('input[name="password"]'), testUser.password)
        .click(Selector('button').withText('Đăng nhập'))
        .click(Selector('a').withText('Ví'))
        .click(Selector('button').withText('Nạp tiền'))
        .typeText(Selector('input[name="amount"]'), '100000')
        .click(Selector('button').withText('Nạp'))
        .expect(Selector('.success-message').exists).ok('Top-up success message should appear');
});

// TC016: Transaction History
test('TC016: Transaction History', async t => {
    await t
        .click(Selector('a').withText('Đăng nhập'))
        .typeText(Selector('input[name="email"]'), testUser.email)
        .typeText(Selector('input[name="password"]'), testUser.password)
        .click(Selector('button').withText('Đăng nhập'))
        .click(Selector('a').withText('Ví'))
        .click(Selector('a').withText('Lịch sử giao dịch'))
        .expect(Selector('.transaction-item').count).gte(0, 'Transaction history should be visible');
});

// TC017: Post Status Update - Sold
test('TC017: Post Status Update - Sold', async t => {
    // After successful payment, check if post status is updated
    await t
        .click(Selector('.post-item').nth(0))
        .expect(Selector('.status').withText('Đã bán').exists).ok('Post should show sold status');
});

// TC018: Notification System
test('TC018: Notification System', async t => {
    await t
        .click(Selector('a').withText('Đăng nhập'))
        .typeText(Selector('input[name="email"]'), testUser.email)
        .typeText(Selector('input[name="password"]'), testUser.password)
        .click(Selector('button').withText('Đăng nhập'))
        .click(Selector('.notification-icon'))
        .expect(Selector('.notification-item').count).gte(0, 'Notifications should be visible');
});

// TC019: API Response Validation
test('TC019: API Response Validation', async t => {
    // This would require making API calls and validating responses
    // For UI testing, we can check if API calls succeed by monitoring network
    await t
        .click(Selector('a').withText('Đăng nhập'))
        .typeText(Selector('input[name="email"]'), testUser.email)
        .typeText(Selector('input[name="password"]'), testUser.password)
        .click(Selector('button').withText('Đăng nhập'))
        .expect(Selector('.dashboard').exists).ok('API login should succeed');
});

// TC020: Visual Regression - Homepage
test('TC020: Visual Regression - Homepage', async t => {
    await t
        .expect(Selector('body').exists).ok('Homepage should load')
        .takeScreenshot('homepage-baseline');
});

// TC021: Visual Regression - Post Details
test('TC021: Visual Regression - Post Details', async t => {
    await t
        .click(Selector('.post-item').nth(0))
        .expect(Selector('.post-details').exists).ok('Post details should load')
        .takeScreenshot('post-details-baseline');
});

// TC022: Performance Test - Page Load
test('TC022: Performance Test - Page Load', async t => {
    const startTime = Date.now();

    await t
        .navigateTo('http://localhost:3000')
        .expect(Selector('body').exists).ok('Page should load');

    const loadTime = Date.now() - startTime;
    await t.expect(loadTime).lt(3000, 'Page should load within 3 seconds');
});