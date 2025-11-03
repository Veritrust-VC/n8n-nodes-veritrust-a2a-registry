import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class VeritrustA2AApi implements ICredentialType {
  name = 'veritrustA2AApi';
  displayName = 'Veritrust A2A Registry API';
  documentationUrl = 'https://veritrust.vc/.well-known/agent-registry.json';

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://a2a.veritrust.vc',
      required: true,
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description: 'Optional. If the registry requires a key.',
    },
    {
      displayName: 'Custom Header',
      name: 'customHeader',
      type: 'string',
      default: 'Authorization',
      description: 'Header used for the API key (default Authorization).',
    },
    {
      displayName: 'Use Bearer Prefix',
      name: 'useBearer',
      type: 'boolean',
      default: true,
    },
  ];
}
