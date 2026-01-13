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
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const qs: IDataObject = {};

	if (filters.sortDirection) {
		qs.sort_direction = filters.sortDirection;
	}

	if (returnAll) {
		const segments = await brazeApiRequestAllItems.call(
			this,
			'GET',
			'/segments/list',
			'segments',
			undefined,
			qs,
		);
		return toExecutionData(segments);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	const segments = await brazeApiRequestAllItems.call(
		this,
		'GET',
		'/segments/list',
		'segments',
		undefined,
		qs,
		limit,
	);
	return toExecutionData(segments);
}

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const segmentId = this.getNodeParameter('segmentId', index) as string;

	const qs: IDataObject = {
		segment_id: segmentId,
	};

	const response = await brazeApiRequest.call(this, 'GET', '/segments/details', undefined, qs);

	return toExecutionData(response);
}

export async function getAnalytics(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const segmentId = this.getNodeParameter('segmentId', index) as string;
	const length = this.getNodeParameter('length', index, 14) as number;
	const endingAt = this.getNodeParameter('endingAt', index, '') as string;

	const qs: IDataObject = {
		segment_id: segmentId,
		length: Math.min(length, 100),
	};

	if (endingAt) {
		qs.ending_at = endingAt;
	}

	const response = await brazeApiRequest.call(this, 'GET', '/segments/data_series', undefined, qs);

	return toExecutionData(response);
}

export async function getSize(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const segmentId = this.getNodeParameter('segmentId', index) as string;

	// Get segment details which includes size
	const qs: IDataObject = {
		segment_id: segmentId,
	};

	const response = await brazeApiRequest.call(this, 'GET', '/segments/details', undefined, qs);

	// Return just the size info
	return toExecutionData({
		segment_id: segmentId,
		size: response.size,
		name: response.name,
	});
}

export async function exportUsers(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const segmentId = this.getNodeParameter('segmentId', index) as string;
	const fieldsToExport = this.getNodeParameter('fieldsToExport', index, []) as string[];
	const callbackEndpoint = this.getNodeParameter('callbackEndpoint', index, '') as string;
	const outputFormat = this.getNodeParameter('outputFormat', index, 'json') as string;

	const body: IDataObject = {
		segment_id: segmentId,
		output_format: outputFormat,
	};

	if (fieldsToExport.length > 0) {
		body.fields_to_export = fieldsToExport;
	}

	if (callbackEndpoint) {
		body.callback_endpoint = callbackEndpoint;
	}

	const response = await brazeApiRequest.call(this, 'POST', '/users/export/segment', body);

	return toExecutionData(response);
}

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', index) as string;
	const filtersJson = this.getNodeParameter('filters', index, '[]') as string;

	const body: IDataObject = {
		name,
	};

	try {
		body.filters = JSON.parse(filtersJson);
	} catch {
		body.filters = [];
	}

	const response = await brazeApiRequest.call(this, 'POST', '/segments/create', body);

	return toExecutionData(response);
}
