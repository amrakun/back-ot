import debug from 'debug';

export const debugExternalApi = debug('ot-api:external-api-fetcher');
export const debugInit = debug('ot-api:init');
export const debugDb = debug('ot-api:db');
export const debugBase = debug('ot-api:base');

export const debugRequest = (debugInstance, req) =>
  debugInstance(`
        Receiving ${req.path} request from ${req.headers.origin}
        body: ${JSON.stringify(req.body || {})}
        queryParams: ${JSON.stringify(req.query)}
    `);

export const debugResponse = (debugInstance, req, data = 'success') =>
  debugInstance(`Responding ${req.path} request to ${req.headers.origin} with ${data}`);
