/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest, brazeApiRequestAllItems } from '../../transport';
import { toExecutionData, stringToArray } from '../../utils';

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', index) as string;
	const content = this.getNodeParameter('content', index) as string;
	const description = this.getNodeParameter('description', index, '') as string;
	const state = this.getNodeParameter('state', index, 'active') as string;
	const tags = this.getNodeParameter('tags', index, '') as string;

	const body: IDataObject = {
		name,
		content,
		state,
	};

	if (description) {
		body.description = description;
	}

	if (tags) {
		body.tags = stringToArray(tags);
	}

	const response = await brazeApiRequest.call(this, 'POST', '/content_blocks/create', body);

	return toExecutionData(response);
}

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contentBlockId = this.getNodeParameter('contentBlockId', index) as string;
	const includeInclusionData = this.getNodeParameter('includeInclusionData', index, false) as boolean;

	const qs: IDataObject = {
		content_block_id: contentBlockId,
		include_inclusion_data: includeInclusionData,
	};

	const response = await brazeApiRequest.call(this, 'GET', '/content_blocks/info', undefined, qs);

	return toExecutionData(response);
}

export async function getMany(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const qs: IDataObject = {};

	if (filters.modifiedAfter) {
		qs.modified_after = filters.modifiedAfter;
	}

	if (filters.modifiedBefore) {
		qs.modified_before = filters.modifiedBefore;
	}

	if (filters.sortDirection) {
		qs.sort_direction = filters.sortDirection;
	}

	if (returnAll) {
		const contentBlocks = await brazeApiRequestAllItems.call(
			this,
			'GET',
			'/content_blocks/list',
			'content_blocks',
			undefined,
			qs,
		);
		return toExecutionData(contentBlocks);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	const contentBlocks = await brazeApiRequestAllItems.call(
		this,
		'GET',
		'/content_blocks/list',
		'content_blocks',
		undefined,
		qs,
		limit,
	);
	return toExecutionData(contentBlocks);
}

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contentBlockId = this.getNodeParameter('contentBlockId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {
		content_block_id: contentBlockId,
	};

	if (updateFields.name) {
		body.name = updateFields.name;
	}

	if (updateFields.content) {
		body.content = updateFields.content;
	}

	if (updateFields.description) {
		body.description = updateFields.description;
	}

	if (updateFields.state) {
		body.state = updateFields.state;
	}

	if (updateFields.tags) {
		body.tags = stringToArray(updateFields.tags as string);
	}

	const response = await brazeApiRequest.call(this, 'POST', '/content_blocks/update', body);

	return toExecutionData(response);
}

export async function getInfo(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const contentBlockId = this.getNodeParameter('contentBlockId', index) as string;

	const qs: IDataObject = {
		content_block_id: contentBlockId,
		include_inclusion_data: true,
	};

	const response = await brazeApiRequest.call(this, 'GET', '/content_blocks/info', undefined, qs);

	// Return just metadata
	return toExecutionData({
		content_block_id: response.content_block_id,
		name: response.name,
		description: response.description,
		state: response.state,
		tags: response.tags,
		created_at: response.created_at,
		last_edited: response.last_edited,
		inclusion_count: response.inclusion_count,
		message_variation_ids: response.message_variation_ids,
	});
}
