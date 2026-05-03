export function createConnectorBuilder() {
  let customConnectors = [];

  const parseOpenAPISpec = (spec) => {
    try {
      const parsed = typeof spec === 'string' ? JSON.parse(spec) : spec;
      
      const endpoints = [];
      if (parsed.paths) {
        Object.entries(parsed.paths).forEach(([path, methods]) => {
          Object.entries(methods).forEach(([method, details]) => {
            if (method.toUpperCase() !== 'PARAMETERS') {
              endpoints.push({
                path,
                method: method.toUpperCase(),
                summary: details.summary || '',
                description: details.description || '',
                parameters: details.parameters || [],
                requestBody: details.requestBody || null,
                responses: details.responses || {},
              });
            }
          });
        });
      }

      return {
        name: parsed.info?.title || 'API',
        version: parsed.info?.version || '1.0.0',
        baseUrl: parsed.servers?.[0]?.url || '',
        description: parsed.info?.description || '',
        endpoints,
        raw: parsed,
      };
    } catch (e) {
      return { error: 'Invalid OpenAPI spec: ' + e.message };
    }
  };

  const createConnectorFromSchema = (config) => {
    const connector = {
      id: `connector_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: config.name,
      description: config.description || '',
      baseUrl: config.baseUrl,
      authentication: config.authentication || {
        type: 'none', // none, api_key, bearer, oauth2
        location: 'header', // header, query, body
        paramName: '',
      },
      endpoints: config.endpoints || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: config.isPublic || false,
      metadata: {
        source: config.source, // openapi, manual
        version: config.version || '1.0.0',
      },
    };
    customConnectors.push(connector);
    return connector;
  };

  const addEndpoint = (connectorId, endpoint) => {
    const connector = customConnectors.find((c) => c.id === connectorId);
    if (!connector) return null;

    const newEndpoint = {
      id: `endpoint_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      path: endpoint.path,
      method: endpoint.method.toUpperCase(),
      summary: endpoint.summary || '',
      description: endpoint.description || '',
      parameters: endpoint.parameters || [],
      requestBody: endpoint.requestBody || null,
      responses: endpoint.responses || {},
    };
    connector.endpoints.push(newEndpoint);
    connector.updatedAt = new Date().toISOString();
    return newEndpoint;
  };

  const updateConnector = (connectorId, updates) => {
    const connector = customConnectors.find((c) => c.id === connectorId);
    if (!connector) return null;

    Object.assign(connector, updates);
    connector.updatedAt = new Date().toISOString();
    return connector;
  };

  const deleteConnector = (connectorId) => {
    const index = customConnectors.findIndex((c) => c.id === connectorId);
    if (index > -1) {
      const deleted = customConnectors.splice(index, 1);
      return deleted[0];
    }
    return null;
  };

  const getConnectors = (filters = {}) => {
    let results = customConnectors;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      results = results.filter(
        (c) => c.name.toLowerCase().includes(search) || c.description.toLowerCase().includes(search)
      );
    }
    return results;
  };

  const getConnector = (connectorId) => {
    return customConnectors.find((c) => c.id === connectorId);
  };

  const generateNodeFromEndpoint = (connectorId, endpointId) => {
    const connector = getConnector(connectorId);
    if (!connector) return null;

    const endpoint = connector.endpoints.find((e) => e.id === endpointId);
    if (!endpoint) return null;

    return {
      id: `node_${Date.now()}`,
      type: 'custom_api',
      label: endpoint.summary || `${endpoint.method} ${endpoint.path}`,
      x: 300,
      y: 100,
      config: {
        connectorId,
        endpointId,
        baseUrl: connector.baseUrl,
        path: endpoint.path,
        method: endpoint.method,
        parameters: endpoint.parameters.reduce((acc, p) => {
          acc[p.name] = '';
          return acc;
        }, {}),
        headers: connector.authentication.type !== 'none' ? {} : {},
        authentication: connector.authentication,
      },
    };
  };

  const testEndpoint = (connectorId, endpointId, params = {}) => {
    const connector = getConnector(connectorId);
    if (!connector) return { success: false, error: 'Connector not found' };

    const endpoint = connector.endpoints.find((e) => e.id === endpointId);
    if (!endpoint) return { success: false, error: 'Endpoint not found' };

    // Simulate API call
    return {
      success: true,
      method: endpoint.method,
      path: endpoint.path,
      baseUrl: connector.baseUrl,
      url: `${connector.baseUrl}${endpoint.path}`,
      statusCode: 200,
      responseTime: Math.floor(Math.random() * 500) + 100,
      response: { success: true, data: {} },
    };
  };

  return {
    parseOpenAPISpec,
    createConnectorFromSchema,
    addEndpoint,
    updateConnector,
    deleteConnector,
    getConnectors,
    getConnector,
    generateNodeFromEndpoint,
    testEndpoint,
  };
}

export const connectorBuilder = createConnectorBuilder();