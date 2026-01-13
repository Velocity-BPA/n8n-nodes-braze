/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BrazeApi implements ICredentialType {
	name = 'brazeApi';
	displayName = 'Braze API';
	documentationUrl = 'https://www.braze.com/docs/api/basics/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'REST API Key from Braze dashboard (Settings > API Keys)',
		},
		{
			displayName: 'Cluster',
			name: 'cluster',
			type: 'options',
			default: 'US-01',
			required: true,
			description: 'The Braze cluster your account is on. Check your dashboard URL or Settings > APIs > SDK Endpoint.',
			options: [
				{ name: 'US-01', value: 'US-01' },
				{ name: 'US-02', value: 'US-02' },
				{ name: 'US-03', value: 'US-03' },
				{ name: 'US-04', value: 'US-04' },
				{ name: 'US-05', value: 'US-05' },
				{ name: 'US-06', value: 'US-06' },
				{ name: 'US-07', value: 'US-07' },
				{ name: 'US-08', value: 'US-08' },
				{ name: 'US-0A', value: 'US-0A' },
				{ name: 'US-0B', value: 'US-0B' },
				{ name: 'EU-01', value: 'EU-01' },
				{ name: 'EU-02', value: 'EU-02' },
				{ name: 'EU-03', value: 'EU-03' },
			],
		},
		{
			displayName: 'Custom Endpoint',
			name: 'customEndpoint',
			type: 'string',
			default: '',
			description: 'Custom REST endpoint URL if using dedicated infrastructure (overrides cluster selection)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.customEndpoint || ""}}',
			url: '/subscription/status/get',
			method: 'GET',
			qs: {
				email: 'test@example.com',
			},
		},
	};
}
