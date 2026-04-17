/**
 * M&M Holiday Planner — Lambda handler
 *
 * Amplify wires TABLE_NAME automatically when you add the DynamoDB storage
 * as a dependency of this function during `amplify add api`.
 *
 * Routes:
 *   GET  /planner  → return shared planner state
 *   PUT  /planner  → replace shared planner state
 */
const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE  = process.env.STORAGE_MMPLANNERTABLE_NAME;
const PK     = 'shared-planner';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
};

exports.handler = async (event) => {
  const method = event.httpMethod;

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (method === 'GET') {
      const result = await dynamo.get({ TableName: TABLE, Key: { pk: PK } }).promise();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Item?.data ?? {}),
      };
    }

    if (method === 'PUT') {
      const data = JSON.parse(event.body || '{}');
      await dynamo.put({
        TableName: TABLE,
        Item: { pk: PK, data, updatedAt: Date.now() },
      }).promise();
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('[planner-lambda]', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
