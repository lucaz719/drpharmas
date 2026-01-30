import { Selector } from 'testcafe';

fixture`Admin UI Tests`
    .page`http://localhost:8082/superadmin/login`; // Running via Vite Dev Server

// Page Object Model (simplified)
const loginPage = {
    emailInput: Selector('input[type="email"]'),
    passwordInput: Selector('input[type="password"]'),
    loginButton: Selector('button').withText('Sign in'),
};

const dashboardPage = {
    header: Selector('h1').withText('Super Admin Dashboard'),
    orgManagementLink: Selector('a').withText('Organization Management'),
};

const orgPage = {
    createButton: Selector('button').withText('Create Organization'),
    dialogTitle: Selector('h2').withText('Create New Organization'),
    nameInput: Selector('input#org-name'),
    editButton: Selector('button').find('svg.lucide-edit').parent(),
    deleteButton: Selector('button').find('svg.lucide-trash-2').parent(),
};

test('Login and Navigate to Organization Management', async t => {
    // 1. Login
    await t
        .typeText(loginPage.emailInput, 'admin@drpharma.com')
        .typeText(loginPage.passwordInput, 'admin123') // Replace with known test creds if different
        .click(loginPage.loginButton);

    // 2. Verify Dashboard
    await t
        .expect(dashboardPage.header.exists).ok('Dashboard header should be visible', { timeout: 10000 });

    // 3. Navigate to Org Management
    await t
        .click(dashboardPage.orgManagementLink)
        .expect(orgPage.createButton.exists).ok('Create Organization button should be visible');
});

test('Organization Create Modal Opens', async t => {
    // Assumes already logged in or session persistence, but TestCafe resets. 
    // For simplicity in this quick check, we re-login or use roles. 
    // Let's just re-login for stability in this first pass.
    await t
        .typeText(loginPage.emailInput, 'admin@drpharma.com')
        .typeText(loginPage.passwordInput, 'admin123')
        .click(loginPage.loginButton)
        .click(dashboardPage.orgManagementLink);

    await t
        .click(orgPage.createButton)
        .expect(orgPage.dialogTitle.exists).ok('Create Organization dialog should open');
});
