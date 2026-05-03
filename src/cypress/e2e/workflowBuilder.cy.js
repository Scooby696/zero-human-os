/* eslint-env cypress */
/* global cy, describe, beforeEach, it */

describe('Workflow Builder E2E Tests', () => {
  beforeEach(() => {
    cy.login('test_user_001');
    cy.visit('/workflow');
  });

  describe('Canvas and Node Management', () => {
    it('should load workflow builder page', () => {
      cy.get('[data-test="workflow-canvas"]').should('be.visible');
      cy.get('[data-test="workflow-sidebar"]').should('be.visible');
    });

    it('should display sidebar with node types', () => {
      cy.get('[data-test="workflow-sidebar"]').within(() => {
        cy.contains('Trigger').should('be.visible');
        cy.contains('Action').should('be.visible');
        cy.contains('Condition').should('be.visible');
        cy.contains('Response').should('be.visible');
        cy.contains('End').should('be.visible');
      });
    });

    it('should add node to canvas by clicking sidebar', () => {
      cy.get('[data-test="node-type-trigger"]').click();
      cy.get('[data-test="workflow-canvas"]').click(400, 300);
      cy.get('[data-test^="node-"]').should('have.length', 1);
    });

    it('should add multiple nodes to canvas', () => {
      cy.get('[data-test="node-type-trigger"]').click();
      cy.get('[data-test="workflow-canvas"]').click(200, 200);
      
      cy.get('[data-test="node-type-action"]').click();
      cy.get('[data-test="workflow-canvas"]').click(400, 200);
      
      cy.get('[data-test="node-type-response"]').click();
      cy.get('[data-test="workflow-canvas"]').click(600, 200);
      
      cy.get('[data-test^="node-"]').should('have.length', 3);
    });

    it('should drag node on canvas', () => {
      cy.get('[data-test="node-type-trigger"]').click();
      cy.get('[data-test="workflow-canvas"]').click(300, 300);
      
      cy.get('[data-test^="node-"]').first().as('node');
      cy.get('@node').drag('[data-test="workflow-canvas"]', { position: 'center', deltaX: 100, deltaY: 50 });
      
      cy.get('@node').should('be.visible');
    });

    it('should delete node from canvas', () => {
      cy.get('[data-test="node-type-trigger"]').click();
      cy.get('[data-test="workflow-canvas"]').click(300, 300);
      
      cy.get('[data-test^="node-"]').first().as('node');
      cy.get('@node').within(() => {
        cy.get('[data-test="delete-node"]').click();
      });
      
      cy.get('[data-test^="node-"]').should('have.length', 0);
    });
  });

  describe('Edge Management', () => {
    beforeEach(() => {
      // Create two nodes
      cy.get('[data-test="node-type-trigger"]').click();
      cy.get('[data-test="workflow-canvas"]').click(200, 300);
      
      cy.get('[data-test="node-type-action"]').click();
      cy.get('[data-test="workflow-canvas"]').click(500, 300);
    });

    it('should connect two nodes', () => {
      cy.get('[data-test^="node-"]').first().as('sourceNode');
      cy.get('@sourceNode').within(() => {
        cy.get('[data-test="connect-button"]').click();
      });
      
      cy.get('[data-test^="node-"]').last().click();
      cy.get('[data-test^="edge-"]').should('have.length', 1);
    });

    it('should not allow self-connection', () => {
      cy.get('[data-test^="node-"]').first().as('node');
      cy.get('@node').within(() => {
        cy.get('[data-test="connect-button"]').click();
      });
      
      cy.get('@node').click();
      cy.get('[data-test^="edge-"]').should('have.length', 0);
    });

    it('should not allow duplicate edges', () => {
      // Create first edge
      cy.get('[data-test^="node-"]').first().as('source');
      cy.get('@source').within(() => {
        cy.get('[data-test="connect-button"]').click();
      });
      cy.get('[data-test^="node-"]').last().click();
      
      // Try to create same edge again
      cy.get('@source').within(() => {
        cy.get('[data-test="connect-button"]').click();
      });
      cy.get('[data-test^="node-"]').last().click();
      
      cy.get('[data-test^="edge-"]').should('have.length', 1);
    });

    it('should delete edge', () => {
      // Create edge first
      cy.get('[data-test^="node-"]').first().as('source');
      cy.get('@source').within(() => {
        cy.get('[data-test="connect-button"]').click();
      });
      cy.get('[data-test^="node-"]').last().click();
      
      cy.get('[data-test^="edge-"]').first().within(() => {
        cy.get('[data-test="delete-edge"]').click();
      });
      
      cy.get('[data-test^="edge-"]').should('have.length', 0);
    });
  });

  describe('Workflow Operations', () => {
    it('should save workflow', () => {
      cy.get('[data-test="node-type-trigger"]').click();
      cy.get('[data-test="workflow-canvas"]').click(300, 300);
      
      cy.get('[data-test="save-workflow"]').click();
      cy.contains('Workflow saved').should('be.visible');
    });

    it('should load workflow template', () => {
      cy.get('[data-test="template-button"]').click();
      cy.get('[data-test="template-list"]').should('be.visible');
      
      cy.get('[data-test="template-item"]').first().click();
      cy.get('[data-test^="node-"]').should('have.length.greaterThan', 0);
    });

    it('should export workflow as JSON', () => {
      cy.get('[data-test="node-type-trigger"]').click();
      cy.get('[data-test="workflow-canvas"]').click(300, 300);
      
      cy.get('[data-test="export-button"]').click();
      cy.contains('Download').should('be.visible');
    });

    it('should clear canvas with confirmation', () => {
      cy.get('[data-test="node-type-trigger"]').click();
      cy.get('[data-test="workflow-canvas"]').click(300, 300);
      
      cy.get('[data-test="clear-button"]').click();
      cy.contains('Clear canvas').should('be.visible');
      cy.get('[data-test="confirm-clear"]').click();
      
      cy.get('[data-test^="node-"]').should('have.length', 0);
    });
  });

  describe('Simulation', () => {
    it('should simulate workflow', () => {
      cy.get('[data-test="node-type-trigger"]').click();
      cy.get('[data-test="workflow-canvas"]').click(200, 300);
      
      cy.get('[data-test="node-type-response"]').click();
      cy.get('[data-test="workflow-canvas"]').click(500, 300);
      
      cy.get('[data-test="simulate-button"]').click();
      cy.get('[data-test="simulation-log"]').should('be.visible');
    });

    it('should stop simulation', () => {
      cy.get('[data-test="node-type-trigger"]').click();
      cy.get('[data-test="workflow-canvas"]').click(300, 300);
      
      cy.get('[data-test="simulate-button"]').click();
      cy.get('[data-test="stop-simulation"]').click();
      
      cy.get('[data-test="simulation-log"]').should('not.be.visible');
    });
  });

  describe('Node Configuration', () => {
    it('should edit node label', () => {
      cy.get('[data-test="node-type-trigger"]').click();
      cy.get('[data-test="workflow-canvas"]').click(300, 300);
      
      cy.get('[data-test^="node-"]').first().dblclick();
      cy.get('[data-test="edit-label"]').clear().type('Custom Trigger');
      cy.get('[data-test="save-label"]').click();
      
      cy.get('[data-test^="node-"]').first().should('contain', 'Custom Trigger');
    });

    it('should open node config panel', () => {
      cy.get('[data-test="node-type-action"]').click();
      cy.get('[data-test="workflow-canvas"]').click(300, 300);
      
      cy.get('[data-test^="node-"]').first().click();
      cy.get('[data-test="node-config-panel"]').should('be.visible');
    });

    it('should update node configuration', () => {
      cy.get('[data-test="node-type-action"]').click();
      cy.get('[data-test="workflow-canvas"]').click(300, 300);
      
      cy.get('[data-test^="node-"]').first().click();
      cy.get('[data-test="node-config-panel"]').within(() => {
        cy.get('[data-test="endpoint-url"]').type('https://api.example.com/test');
        cy.get('[data-test="http-method"]').select('POST');
      });
      
      cy.get('[data-test="node-config-panel"]').should('be.visible');
    });
  });
});