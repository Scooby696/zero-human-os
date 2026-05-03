// Cypress support file for E2E tests

beforeEach(() => {
  // Mock authentication
  cy.window().then((win) => {
    win.localStorage.setItem('test_user_id', 'test_user_001');
    win.localStorage.setItem('test_workspace_id', 'workspace_001');
  });
});

// Custom commands
Cypress.Commands.add('login', (userId = 'test_user_001') => {
  cy.window().then((win) => {
    win.localStorage.setItem('test_user_id', userId);
  });
});

Cypress.Commands.add('selectWorkspace', (workspaceId = 'workspace_001') => {
  cy.window().then((win) => {
    win.localStorage.setItem('test_workspace_id', workspaceId);
  });
});

Cypress.Commands.add('addNode', (nodeType) => {
  cy.get(`[data-test="node-type-${nodeType}"]`).click();
});

Cypress.Commands.add('connectNodes', (fromNodeId, toNodeId) => {
  cy.get(`[data-test="node-${fromNodeId}"]`).within(() => {
    cy.get('[data-test="connect-button"]').click();
  });
  cy.get(`[data-test="node-${toNodeId}"]`).click();
});