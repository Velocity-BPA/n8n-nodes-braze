/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest, brazeApiRequestAllItems } from '../../transport';
import { toExecutionData } from '../../utils';

export async function getMany(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const includeArchived = this.getNodeParameter('includeArchived', index, false) as boolean;

	const qs: IDataObject = {
		include_archived: includeArchived,
	};

	if (returnAll) {
		const events = await brazeApiRequestAllItems.call(
			this,
			'GET',
			'/events/list',
			'events',
			undefined,
			qs,
		);
		return toExecutionData(events);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	const events = await brazeApiRequestAllItems.call(
		this,
		'GET',
		'/events/list',
		'events',
		undefined,
		qs,
		limit,
	);
	return toExecutionData(events);
}

export async function getAnalytics(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const eventName = this.getNodeParameter('eventName', index) as string;
	const length = this.getNodeParameter('length', index, 14) as number;
	const unit = this.getNodeParameter('unit', index, 'day') as string;
	const endingAt = this.getNodeParameter('endingAt', index, '') as string;
	const appId = this.getNodeParameter('appId', index, '') as string;
	const segmentId = this.getNodeParameter('segmentId', index, '') as string;

	const qs: IDataObject = {
		event: eventName,
		length: Math.min(length, 100),
		unit,
	};

	if (endingAt) {
		qs.ending_at = endingAt;
	}

	if (appId) {
		qs.app_id = appId;
	}

	if (segmentId) {
		qs.segment_id = segmentId;
	}

	const response = await brazeApiRequest.call(this, 'GET', '/events/data_series', undefined, qs);

	return toExecutionData(response);
}

export async function getHourlyData(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const eventName = this.getNodeParameter('eventName', index) as string;
	const length = this.getNodeParameter('length', index, 24) as number;
	const endingAt = this.getNodeParameter('endingAt', index, '') as string;
	const appId = this.getNodeParameter('appId', index, '') as string;
	const segmentId = this.getNodeParameter('segmentId', index, '') as string;

	const qs: IDataObject = {
		event: eventName,
		length: Math.min(length, 168), // Max 168 hours (1 week)
		unit: 'hour',
	};

	if (endingAt) {
		qs.ending_at = endingAt;
	}

	if (appId) {
		qs.app_id = appId;
	}

	if (segmentId) {
		qs.segment_id = segmentId;
	}

	const response = await brazeApiRequest.call(this, 'GET', '/events/data_series', undefined, qs);

	return toExecutionData(response);
}

export async function getPropertyInfo(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const eventName = this.getNodeParameter('eventName', index) as string;

	const qs: IDataObject = {
		event_name: eventName,
	};

	// This endpoint returns event property information
	const response = await brazeApiRequest.call(this, 'GET', '/events/list', undefined, qs);

	// Filter to just the requested event and return its properties
	if (response.events && Array.isArray(response.events)) {
		const event = (response.events as IDataObject[]).find((e) => e.name === eventName);
		if (event) {
			return toExecutionData(event);
		}
	}

	return toExecutionData(response);
}
