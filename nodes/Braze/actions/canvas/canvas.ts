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

	if (returnAll) {
		const canvases = await brazeApiRequestAllItems.call(
			this,
			'GET',
			'/canvas/list',
			'canvases',
			undefined,
			qs,
		);
		return toExecutionData(canvases);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	const canvases = await brazeApiRequestAllItems.call(
		this,
		'GET',
		'/canvas/list',
		'canvases',
		undefined,
		qs,
		limit,
	);
	return toExecutionData(canvases);
}

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const canvasId = this.getNodeParameter('canvasId', index) as string;

	const qs: IDataObject = {
		canvas_id: canvasId,
	};

	const response = await brazeApiRequest.call(this, 'GET', '/canvas/details', undefined, qs);

	return toExecutionData(response);
}

export async function getAnalytics(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const canvasId = this.getNodeParameter('canvasId', index) as string;
	const startDate = this.getNodeParameter('startDate', index) as string;
	const endDate = this.getNodeParameter('endDate', index) as string;
	const includeVariantBreakdown = this.getNodeParameter('includeVariantBreakdown', index, false) as boolean;
	const includeStepBreakdown = this.getNodeParameter('includeStepBreakdown', index, false) as boolean;

	const qs: IDataObject = {
		canvas_id: canvasId,
		length: 14,
		include_variant_breakdown: includeVariantBreakdown,
		include_step_breakdown: includeStepBreakdown,
	};

	if (startDate) {
		qs.ending_at = endDate || new Date().toISOString();
		const start = new Date(startDate);
		const end = new Date(qs.ending_at as string);
		const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
		qs.length = Math.min(diffDays, 100);
	}

	const response = await brazeApiRequest.call(this, 'GET', '/canvas/data_series', undefined, qs);

	return toExecutionData(response);
}

export async function getSummary(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const canvasId = this.getNodeParameter('canvasId', index) as string;
	const startDate = this.getNodeParameter('startDate', index) as string;
	const endDate = this.getNodeParameter('endDate', index) as string;
	const includeVariantBreakdown = this.getNodeParameter('includeVariantBreakdown', index, false) as boolean;

	const qs: IDataObject = {
		canvas_id: canvasId,
		length: 14,
		include_variant_breakdown: includeVariantBreakdown,
	};

	if (startDate) {
		qs.ending_at = endDate || new Date().toISOString();
		const start = new Date(startDate);
		const end = new Date(qs.ending_at as string);
		const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
		qs.length = Math.min(diffDays, 100);
	}

	const response = await brazeApiRequest.call(this, 'GET', '/canvas/data_summary', undefined, qs);

	return toExecutionData(response);
}

export async function trigger(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const canvasId = this.getNodeParameter('canvasId', index) as string;
	const broadcast = this.getNodeParameter('broadcast', index, false) as boolean;

	const body: IDataObject = {
		canvas_id: canvasId,
		broadcast,
	};

	const canvasEntryPropertiesJson = this.getNodeParameter('canvasEntryProperties', index, '{}') as string;
	const canvasEntryProperties = buildTriggerProperties(canvasEntryPropertiesJson);
	if (Object.keys(canvasEntryProperties).length > 0) {
		body.canvas_entry_properties = canvasEntryProperties;
	}

	if (!broadcast) {
		const recipientsInput = this.getNodeParameter('recipients', index, '') as string;
		if (recipientsInput) {
			body.recipients = buildRecipients(recipientsInput);
		}
	}

	const response = await brazeApiRequest.call(this, 'POST', '/canvas/trigger/send', body);

	return toExecutionData(response);
}

export async function schedule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const canvasId = this.getNodeParameter('canvasId', index) as string;
	const scheduleTime = this.getNodeParameter('scheduleTime', index) as string;
	const broadcast = this.getNodeParameter('broadcast', index, false) as boolean;
	const inLocalTime = this.getNodeParameter('inLocalTime', index, false) as boolean;

	const body: IDataObject = {
		canvas_id: canvasId,
		schedule: buildSchedule(scheduleTime, inLocalTime),
		broadcast,
	};

	if (!broadcast) {
		const recipientsInput = this.getNodeParameter('recipients', index, '') as string;
		if (recipientsInput) {
			body.recipients = buildRecipients(recipientsInput);
		}
	}

	const response = await brazeApiRequest.call(this, 'POST', '/canvas/trigger/schedule/create', body);

	return toExecutionData(response);
}

export async function updateSchedule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const canvasId = this.getNodeParameter('canvasId', index) as string;
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;
	const scheduleTime = this.getNodeParameter('scheduleTime', index) as string;
	const inLocalTime = this.getNodeParameter('inLocalTime', index, false) as boolean;

	const body: IDataObject = {
		canvas_id: canvasId,
		schedule_id: scheduleId,
		schedule: buildSchedule(scheduleTime, inLocalTime),
	};

	const response = await brazeApiRequest.call(this, 'POST', '/canvas/trigger/schedule/update', body);

	return toExecutionData(response);
}

export async function deleteSchedule(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const canvasId = this.getNodeParameter('canvasId', index) as string;
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;

	const body: IDataObject = {
		canvas_id: canvasId,
		schedule_id: scheduleId,
	};

	const response = await brazeApiRequest.call(this, 'POST', '/canvas/trigger/schedule/delete', body);

	return toExecutionData(response);
}

export async function getEntrySteps(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const canvasId = this.getNodeParameter('canvasId', index) as string;

	const qs: IDataObject = {
		canvas_id: canvasId,
	};

	const response = await brazeApiRequest.call(this, 'GET', '/canvas/details', undefined, qs);

	// Extract entry steps from canvas details
	if (response.steps && Array.isArray(response.steps)) {
		const entrySteps = (response.steps as IDataObject[]).filter(
			(step) => step.type === 'entry',
		);
		return toExecutionData(entrySteps);
	}

	return toExecutionData(response);
}
