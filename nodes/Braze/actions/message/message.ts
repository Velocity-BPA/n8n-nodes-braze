/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest } from '../../transport';
import { toExecutionData, stringToArray, buildSchedule } from '../../utils';

export async function send(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const messageType = this.getNodeParameter('messageType', index) as string;
	const externalUserIds = this.getNodeParameter('externalUserIds', index, '') as string;
	const segmentId = this.getNodeParameter('segmentId', index, '') as string;
	const campaignId = this.getNodeParameter('campaignId', index, '') as string;
	const overrideFrequencyCapping = this.getNodeParameter('overrideFrequencyCapping', index, false) as boolean;

	const body: IDataObject = {
		override_frequency_capping: overrideFrequencyCapping,
	};

	if (externalUserIds) {
		body.external_user_ids = stringToArray(externalUserIds);
	}

	if (segmentId) {
		body.segment_id = segmentId;
	}

	if (campaignId) {
		body.campaign_id = campaignId;
	}

	// Build message object based on type
	const messages: IDataObject = {};

	if (messageType === 'email' || messageType === 'all') {
		const emailOptions = this.getNodeParameter('emailOptions', index, {}) as IDataObject;
		if (Object.keys(emailOptions).length > 0) {
			messages.email = {
				app_id: emailOptions.appId,
				subject: emailOptions.subject,
				from: emailOptions.from,
				reply_to: emailOptions.replyTo,
				body: emailOptions.body,
				plaintext_body: emailOptions.plaintextBody,
				preheader: emailOptions.preheader,
				email_template_id: emailOptions.emailTemplateId,
			};
			// Remove undefined values
			messages.email = Object.fromEntries(
				Object.entries(messages.email as object).filter(([, v]) => v !== undefined && v !== ''),
			);
		}
	}

	if (messageType === 'push' || messageType === 'all') {
		const pushOptions = this.getNodeParameter('pushOptions', index, {}) as IDataObject;
		if (Object.keys(pushOptions).length > 0) {
			if (pushOptions.platform === 'ios' || pushOptions.platform === 'both') {
				messages.apple_push = {
					alert: pushOptions.alert,
					badge: pushOptions.badge,
					sound: pushOptions.sound || 'default',
					extra: pushOptions.extra ? JSON.parse(pushOptions.extra as string) : undefined,
				};
			}
			if (pushOptions.platform === 'android' || pushOptions.platform === 'both') {
				messages.android_push = {
					alert: pushOptions.alert,
					title: pushOptions.title,
					extra: pushOptions.extra ? JSON.parse(pushOptions.extra as string) : undefined,
				};
			}
		}
	}

	if (messageType === 'sms' || messageType === 'all') {
		const smsOptions = this.getNodeParameter('smsOptions', index, {}) as IDataObject;
		if (Object.keys(smsOptions).length > 0) {
			messages.sms = {
				subscription_group_id: smsOptions.subscriptionGroupId,
				body: smsOptions.body,
				app_id: smsOptions.appId,
			};
		}
	}

	if (messageType === 'webhook') {
		const webhookOptions = this.getNodeParameter('webhookOptions', index, {}) as IDataObject;
		if (Object.keys(webhookOptions).length > 0) {
			messages.webhook = {
				url: webhookOptions.url,
				request_method: webhookOptions.requestMethod || 'POST',
				request_headers: webhookOptions.requestHeaders
					? JSON.parse(webhookOptions.requestHeaders as string)
					: undefined,
				body: webhookOptions.body,
			};
		}
	}

	if (messageType === 'contentCard') {
		const contentCardOptions = this.getNodeParameter('contentCardOptions', index, {}) as IDataObject;
		if (Object.keys(contentCardOptions).length > 0) {
			messages.content_card = {
				type: contentCardOptions.type || 'CLASSIC',
				title: contentCardOptions.title,
				description: contentCardOptions.description,
				image_url: contentCardOptions.imageUrl,
				url: contentCardOptions.url,
				pinned: contentCardOptions.pinned,
				dismissible: contentCardOptions.dismissible,
			};
		}
	}

	if (Object.keys(messages).length > 0) {
		body.messages = messages;
	}

	const response = await brazeApiRequest.call(this, 'POST', '/messages/send', body);

	return toExecutionData(response);
}

export async function schedule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const externalUserIds = this.getNodeParameter('externalUserIds', index, '') as string;
	const segmentId = this.getNodeParameter('segmentId', index, '') as string;
	const scheduleTime = this.getNodeParameter('scheduleTime', index) as string;
	const inLocalTime = this.getNodeParameter('inLocalTime', index, false) as boolean;
	const atOptimalTime = this.getNodeParameter('atOptimalTime', index, false) as boolean;

	const body: IDataObject = {
		schedule: buildSchedule(scheduleTime, inLocalTime, atOptimalTime),
	};

	if (externalUserIds) {
		body.external_user_ids = stringToArray(externalUserIds);
	}

	if (segmentId) {
		body.segment_id = segmentId;
	}

	// Get message configuration
	const messagesJson = this.getNodeParameter('messages', index, '{}') as string;
	try {
		body.messages = JSON.parse(messagesJson);
	} catch {
		// Use empty messages if parsing fails
	}

	const response = await brazeApiRequest.call(this, 'POST', '/messages/schedule/create', body);

	return toExecutionData(response);
}

export async function updateSchedule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;
	const scheduleTime = this.getNodeParameter('scheduleTime', index) as string;
	const inLocalTime = this.getNodeParameter('inLocalTime', index, false) as boolean;
	const atOptimalTime = this.getNodeParameter('atOptimalTime', index, false) as boolean;

	const body: IDataObject = {
		schedule_id: scheduleId,
		schedule: buildSchedule(scheduleTime, inLocalTime, atOptimalTime),
	};

	const response = await brazeApiRequest.call(this, 'POST', '/messages/schedule/update', body);

	return toExecutionData(response);
}

export async function deleteSchedule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;

	const body: IDataObject = {
		schedule_id: scheduleId,
	};

	const response = await brazeApiRequest.call(this, 'POST', '/messages/schedule/delete', body);

	return toExecutionData(response);
}

export async function getLiveActivity(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const activityId = this.getNodeParameter('activityId', index) as string;
	const pushToken = this.getNodeParameter('pushToken', index) as string;

	const qs: IDataObject = {
		activity_id: activityId,
		push_token: pushToken,
	};

	const response = await brazeApiRequest.call(this, 'GET', '/messages/live_activity/status', undefined, qs);

	return toExecutionData(response);
}

export async function updateLiveActivity(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const activityId = this.getNodeParameter('activityId', index) as string;
	const pushToken = this.getNodeParameter('pushToken', index) as string;
	const contentState = this.getNodeParameter('contentState', index, '{}') as string;
	const endActivity = this.getNodeParameter('endActivity', index, false) as boolean;
	const dismissalDate = this.getNodeParameter('dismissalDate', index, '') as string;

	const body: IDataObject = {
		activity_id: activityId,
		push_token: pushToken,
	};

	try {
		body.content_state = JSON.parse(contentState);
	} catch {
		body.content_state = {};
	}

	if (endActivity) {
		body.end_activity = true;
	}

	if (dismissalDate) {
		body.dismissal_date = dismissalDate;
	}

	const response = await brazeApiRequest.call(this, 'POST', '/messages/live_activity/update', body);

	return toExecutionData(response);
}

export async function sendTransactional(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const campaignId = this.getNodeParameter('campaignId', index) as string;
	const externalUserIds = this.getNodeParameter('externalUserIds', index) as string;
	const triggerPropertiesJson = this.getNodeParameter('triggerProperties', index, '{}') as string;

	const body: IDataObject = {
		campaign_id: campaignId,
		recipients: stringToArray(externalUserIds).map((id: string) => ({
			external_user_id: id,
		})),
	};

	try {
		body.trigger_properties = JSON.parse(triggerPropertiesJson);
	} catch {
		body.trigger_properties = {};
	}

	const response = await brazeApiRequest.call(
		this,
		'POST',
		`/transactional/v1/campaigns/${campaignId}/send`,
		body,
	);

	return toExecutionData(response);
}
