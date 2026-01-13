/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest, brazeApiRequestAllItems } from '../../transport';
import { toExecutionData, buildRecipients, buildSchedule, buildTriggerProperties } from '../../utils';

export async function getMany(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const qs: IDataObject = {};

	if (filters.includeArchived) {
		qs.include_archived = filters.includeArchived;
	}

	if (filters.sortDirection) {
		qs.sort_direction = filters.sortDirection;
	}

	if (filters.lastEditTimeGt) {
		qs['last_edit.time[gt]'] = filters.lastEditTimeGt;
	}

	if (returnAll) {
		const campaigns = await brazeApiRequestAllItems.call(
			this,
			'GET',
			'/campaigns/list',
			'campaigns',
			undefined,
			qs,
		);
		return toExecutionData(campaigns);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	const campaigns = await brazeApiRequestAllItems.call(
		this,
		'GET',
		'/campaigns/list',
		'campaigns',
		undefined,
		qs,
		limit,
	);
	return toExecutionData(campaigns);
}

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const campaignId = this.getNodeParameter('campaignId', index) as string;

	const qs: IDataObject = {
		campaign_id: campaignId,
	};

	const response = await brazeApiRequest.call(this, 'GET', '/campaigns/details', undefined, qs);

	return toExecutionData(response);
}

export async function getAnalytics(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const campaignId = this.getNodeParameter('campaignId', index) as string;
	const startDate = this.getNodeParameter('startDate', index) as string;
	const endDate = this.getNodeParameter('endDate', index) as string;

	const qs: IDataObject = {
		campaign_id: campaignId,
		length: 14, // Default to 14 days
	};

	if (startDate) {
		qs.ending_at = endDate || new Date().toISOString();
		// Calculate length from dates
		const start = new Date(startDate);
		const end = new Date(qs.ending_at as string);
		const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
		qs.length = Math.min(diffDays, 100); // Max 100 days
	}

	const response = await brazeApiRequest.call(this, 'GET', '/campaigns/data_series', undefined, qs);

	return toExecutionData(response);
}

export async function trigger(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const campaignId = this.getNodeParameter('campaignId', index) as string;
	const sendId = this.getNodeParameter('sendId', index, '') as string;
	const broadcast = this.getNodeParameter('broadcast', index, false) as boolean;

	const body: IDataObject = {
		campaign_id: campaignId,
		broadcast,
	};

	if (sendId) {
		body.send_id = sendId;
	}

	const triggerPropertiesJson = this.getNodeParameter('triggerProperties', index, '{}') as string;
	const triggerProperties = buildTriggerProperties(triggerPropertiesJson);
	if (Object.keys(triggerProperties).length > 0) {
		body.trigger_properties = triggerProperties;
	}

	if (!broadcast) {
		const recipientsInput = this.getNodeParameter('recipients', index, '') as string;
		if (recipientsInput) {
			body.recipients = buildRecipients(recipientsInput);
		}
	}

	const response = await brazeApiRequest.call(this, 'POST', '/campaigns/trigger/send', body);

	return toExecutionData(response);
}

export async function schedule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const campaignId = this.getNodeParameter('campaignId', index) as string;
	const scheduleTime = this.getNodeParameter('scheduleTime', index) as string;
	const sendId = this.getNodeParameter('sendId', index, '') as string;
	const broadcast = this.getNodeParameter('broadcast', index, false) as boolean;
	const inLocalTime = this.getNodeParameter('inLocalTime', index, false) as boolean;
	const atOptimalTime = this.getNodeParameter('atOptimalTime', index, false) as boolean;

	const body: IDataObject = {
		campaign_id: campaignId,
		schedule: buildSchedule(scheduleTime, inLocalTime, atOptimalTime),
		broadcast,
	};

	if (sendId) {
		body.send_id = sendId;
	}

	if (!broadcast) {
		const recipientsInput = this.getNodeParameter('recipients', index, '') as string;
		if (recipientsInput) {
			body.recipients = buildRecipients(recipientsInput);
		}
	}

	const response = await brazeApiRequest.call(this, 'POST', '/campaigns/trigger/schedule/create', body);

	return toExecutionData(response);
}

export async function updateSchedule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const campaignId = this.getNodeParameter('campaignId', index) as string;
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;
	const scheduleTime = this.getNodeParameter('scheduleTime', index) as string;
	const inLocalTime = this.getNodeParameter('inLocalTime', index, false) as boolean;
	const atOptimalTime = this.getNodeParameter('atOptimalTime', index, false) as boolean;

	const body: IDataObject = {
		campaign_id: campaignId,
		schedule_id: scheduleId,
		schedule: buildSchedule(scheduleTime, inLocalTime, atOptimalTime),
	};

	const response = await brazeApiRequest.call(this, 'POST', '/campaigns/trigger/schedule/update', body);

	return toExecutionData(response);
}

export async function deleteSchedule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const campaignId = this.getNodeParameter('campaignId', index) as string;
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;

	const body: IDataObject = {
		campaign_id: campaignId,
		schedule_id: scheduleId,
	};

	const response = await brazeApiRequest.call(this, 'POST', '/campaigns/trigger/schedule/delete', body);

	return toExecutionData(response);
}

export async function getSendInfo(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const campaignId = this.getNodeParameter('campaignId', index) as string;
	const sendId = this.getNodeParameter('sendId', index, '') as string;

	const qs: IDataObject = {
		campaign_id: campaignId,
	};

	if (sendId) {
		qs.send_id = sendId;
	}

	const response = await brazeApiRequest.call(this, 'GET', '/sends/data_series', undefined, qs);

	return toExecutionData(response);
}
