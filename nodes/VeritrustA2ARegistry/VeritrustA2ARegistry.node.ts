import { IExecuteFunctions } from 'n8n-core';
import { INodeType, INodeTypeDescription, NodeApiError } from 'n8n-workflow';

export class VeritrustA2ARegistry implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Veritrust A2A Registry',
    name: 'veritrustA2ARegistry',
    group: ['transform'],
    version: 1,
    description: 'Interact with the Veritrust A2A Agent Registry',
    defaults: { name: 'Veritrust A2A Registry' },
    icon: 'file:icons/veritrust.svg',
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'veritrustA2AApi', required: true }],
    codex: { categories: ['ai', 'integrations', 'utilities'] },
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'List Agents', value: 'list', description: 'List agents' },
          { name: 'Get Agent', value: 'get', description: 'Get one agent by UUID' },
          { name: 'Search Agents', value: 'search', description: 'Search agents' },
          { name: 'Register Agent', value: 'register', description: 'Register an agent by Agent Card URL' },
          { name: 'Re-verify Agent', value: 'reverify', description: 'Re-verify an existing agent by UUID' }
        ],
        default: 'list',
      },
      // Common params
      {
        displayName: 'Verified Only',
        name: 'verified',
        type: 'boolean',
        default: false,
        displayOptions: { show: { operation: ['list'] } },
      },
      {
        displayName: 'Agent UUID',
        name: 'uuid',
        type: 'string',
        default: '',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        required: true,
        displayOptions: { show: { operation: ['get', 'reverify'] } },
      },
      {
        displayName: 'Agent Card URL',
        name: 'agentCardUrl',
        type: 'string',
        default: '',
        placeholder: 'https://agent.example.com/.well-known/agent.json',
        required: true,
        displayOptions: { show: { operation: ['register'] } },
      },
      // Search filters
      {
        displayName: 'Query',
        name: 'query',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['search'] } },
      },
      {
        displayName: 'Skills (CSV)',
        name: 'skills',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['search'] } },
      },
      {
        displayName: 'Protocols (CSV)',
        name: 'protocols',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['search'] } },
      },
      {
        displayName: 'Tags (CSV)',
        name: 'tags',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['search'] } },
      },
      {
        displayName: 'Owner DID',
        name: 'ownerDid',
        type: 'string',
        default: '',
        displayOptions: { show: { operation: ['search'] } },
      },
      {
        displayName: 'Verified Only',
        name: 'verifiedSearch',
        type: 'boolean',
        default: false,
        displayOptions: { show: { operation: ['search'] } },
      }
    ],
  };

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const out: any[] = [];

    const creds = (await this.getCredentials('veritrustA2AApi')) as {
      baseUrl: string;
      apiKey?: string;
      customHeader?: string;
      useBearer?: boolean;
    };

    const base = (creds.baseUrl || '').replace(/\/+$/,''); // trim trailing slashes
    const authHeaderName = (creds.customHeader || 'Authorization').trim() || 'Authorization';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (creds.apiKey) {
      headers[authHeaderName] = creds.useBearer === false ? String(creds.apiKey) : `Bearer ${creds.apiKey}`;
    }

    const http = async (opt: { url: string; method?: 'GET'|'POST'; qs?: any; body?: any; }) => {
      try {
        return await this.helpers.httpRequest({
          url: opt.url,
          method: opt.method || 'GET',
          headers,
          qs: opt.qs,
          body: opt.body,
          json: true,
        });
      } catch (e) {
        throw new NodeApiError(this.getNode(), e);
      }
    };

    const op = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      if (op === 'list') {
        const verified = this.getNodeParameter('verified', i) as boolean;
        const url = verified ? `${base}/api/agents.php?verified=true` : `${base}/api/agents.php`;
        out.push({ json: await http({ url }) });

      } else if (op === 'get') {
        const uuid = this.getNodeParameter('uuid', i) as string;
        const url = `${base}/api/agents.php?id=${encodeURIComponent(uuid)}`;
        out.push({ json: await http({ url }) });

      } else if (op === 'search') {
        const query = this.getNodeParameter('query', i) as string;
        const skillsCsv = this.getNodeParameter('skills', i) as string;
        const protocolsCsv = this.getNodeParameter('protocols', i) as string;
        const tagsCsv = this.getNodeParameter('tags', i) as string;
        const ownerDid = this.getNodeParameter('ownerDid', i) as string;
        const verified = this.getNodeParameter('verifiedSearch', i) as boolean;

        const body: any = {};
        if (query) body.query = query;
        if (ownerDid) body.owner_did = ownerDid;
        if (verified) body.verified = true;
        if (skillsCsv) body.skills = skillsCsv.split(',').map(s => s.trim()).filter(Boolean);
        if (protocolsCsv) body.protocols = protocolsCsv.split(',').map(s => s.trim()).filter(Boolean);
        if (tagsCsv) body.tags = tagsCsv.split(',').map(s => s.trim()).filter(Boolean);

        out.push({ json: await http({ url: `${base}/api/search.php`, method: 'POST', body }) });

      } else if (op === 'register') {
        const agentCardUrl = this.getNodeParameter('agentCardUrl', i) as string;
        out.push({ json: await http({ url: `${base}/api/register.php`, method: 'POST', body: { agent_card_url: agentCardUrl } }) });

      } else if (op === 'reverify') {
        const uuid = this.getNodeParameter('uuid', i) as string;
        out.push({ json: await http({ url: `${base}/api/reverify.php`, method: 'POST', body: { id: uuid } }) });
      }
    }

    return this.prepareOutputData(out);
  }
}
