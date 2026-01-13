/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

export class BrazeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Braze Trigger',
		name: 'brazeTrigger',
		icon: 'file:braze.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts workflow when Braze events occur via webhook',
		defaults: {
			name: 'Braze Trigger',
		},
		inputs: [],
		outputs: ['main'],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				options: [
					{ name: 'All Events', value: 'all' },
					{ name: 'Campaign Converted', value: 'campaign.converted' },
					{ name: 'Campaign Sent', value: 'campaign.sent' },
					{ name: 'Canvas Entered', value: 'canvas.entered' },
					{ name: 'Canvas Exited', value: 'canvas.exited' },
					{ name: 'Email Bounced', value: 'email.bounced' },
					{ name: 'Email Clicked', value: 'email.clicked' },
					{ name: 'Email Opened', value: 'email.opened' },
					{ name: 'Email Sent', value: 'email.sent' },
					{ name: 'Push Opened', value: 'push.opened' },
					{ name: 'Push Sent', value: 'push.sent' },
					{ name: 'SMS Delivered', value: 'sms.delivered' },
					{ name: 'SMS Sent', value: 'sms.sent' },
					{ name: 'Subscription Changed', value: 'subscription.changed' },
					{ name: 'User Identified', value: 'user.identified' },
				],
				default: 'all',
				description: 'Filter webhooks by event type',
			},
			{
				displayName: 'Webhook Token',
				name: 'webhookToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Optional token to verify webhook authenticity (set same value in Braze webhook header)',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Header Name for Token',
						name: 'tokenHeaderName',
						type: 'string',
						default: 'x-braze-webhook-token',
						description: 'Header name containing the verification token',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// Braze webhooks are configured in the Braze dashboard
				// We just verify the webhook endpoint is active
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// Webhook setup happens in Braze dashboard
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// Webhook removal happens in Braze dashboard
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;
		const eventType = this.getNodeParameter('eventType') as string;
		const webhookToken = this.getNodeParameter('webhookToken') as string;
		const options = this.getNodeParameter('options') as IDataObject;

		// Verify webhook token if configured
		if (webhookToken) {
			const headerName = (options.tokenHeaderName as string) || 'x-braze-webhook-token';
			const receivedToken = req.headers[headerName.toLowerCase()] as string;

			if (receivedToken !== webhookToken) {
				return {
					webhookResponse: {
						status: 401,
						body: 'Unauthorized',
					},
				};
			}
		}

		// Filter by event type if not "all"
		if (eventType !== 'all') {
			const bodyEventType = body.event_type as string;
			if (bodyEventType && bodyEventType !== eventType) {
				return {
					webhookResponse: {
						status: 200,
						body: 'Event filtered',
					},
				};
			}
		}

		// Parse and enhance the webhook data
		const webhookData: IDataObject = {
			...body,
			receivedAt: new Date().toISOString(),
			headers: req.headers,
		};

		return {
			workflowData: [this.helpers.returnJsonArray([webhookData])],
		};
	}
}
