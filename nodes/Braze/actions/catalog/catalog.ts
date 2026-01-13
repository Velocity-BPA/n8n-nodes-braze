/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest, brazeBatchRequest } from '../../transport';
import { toExecutionData, stringToArray } from '../../utils';

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const catalogName = this.getNodeParameter('catalogName', index) as string;
	const description = this.getNodeParameter('description', index, '') as string;
	const fieldsJson = this.getNodeParameter('fields', index, '[]') as string;

	let fields: IDataObject[] = [];
	try {
		fields = JSON.parse(fieldsJson);
	} catch {
		fields = [];
	}

	const body: IDataObject = {
		catalogs: [
			{
				name: catalogName,
				description,
				fields,
			},
		],
	};

	const response = await brazeApiRequest.call(this, 'POST', '/catalogs', body);

	return toExecutionData(response);
}

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const catalogName = this.getNodeParameter('catalogName', index) as string;

	const response = await brazeApiRequest.call(this, 'GET', `/catalogs/${catalogName}`, undefined);

	return toExecutionData(response);
}

export async function getMany(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const response = await brazeApiRequest.call(this, 'GET', '/catalogs', undefined);

	const catalogs = response.catalogs || [];
	return toExecutionData(catalogs as IDataObject[]);
}

export async function deleteCatalog(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const catalogName = this.getNodeParameter('catalogName', index) as string;

	const response = await brazeApiRequest.call(this, 'DELETE', `/catalogs/${catalogName}`, undefined);

	return toExecutionData({ message: 'Catalog deleted', catalog_name: catalogName, ...response });
}

export async function createItems(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const catalogName = this.getNodeParameter('catalogName', index) as string;
	const itemsJson = this.getNodeParameter('items', index) as string;

	let items: IDataObject[] = [];
	try {
		items = JSON.parse(itemsJson);
	} catch {
		throw new Error('Invalid JSON format for items');
	}

	// Batch items (max 50 per request)
	if (items.length > 50) {
		const results = await brazeBatchRequest.call(
			this,
			`/catalogs/${catalogName}/items`,
			items,
			'items',
			50,
		);
		return toExecutionData(results);
	}

	const body: IDataObject = {
		items,
	};

	const response = await brazeApiRequest.call(this, 'POST', `/catalogs/${catalogName}/items`, body);

	return toExecutionData(response);
}

export async function getItem(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const catalogName = this.getNodeParameter('catalogName', index) as string;
	const itemId = this.getNodeParameter('itemId', index) as string;

	const response = await brazeApiRequest.call(
		this,
		'GET',
		`/catalogs/${catalogName}/items/${itemId}`,
		undefined,
	);

	return toExecutionData(response);
}

export async function getItems(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const catalogName = this.getNodeParameter('catalogName', index) as string;
	const cursor = this.getNodeParameter('cursor', index, '') as string;

	const qs: IDataObject = {};
	if (cursor) {
		qs.cursor = cursor;
	}

	const response = await brazeApiRequest.call(
		this,
		'GET',
		`/catalogs/${catalogName}/items`,
		undefined,
		qs,
	);

	const items = response.items || [];
	return toExecutionData(items as IDataObject[]);
}

export async function updateItems(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const catalogName = this.getNodeParameter('catalogName', index) as string;
	const itemsJson = this.getNodeParameter('items', index) as string;

	let items: IDataObject[] = [];
	try {
		items = JSON.parse(itemsJson);
	} catch {
		throw new Error('Invalid JSON format for items');
	}

	// Batch items (max 50 per request)
	if (items.length > 50) {
		const results = await brazeBatchRequest.call(
			this,
			`/catalogs/${catalogName}/items`,
			items,
			'items',
			50,
		);
		return toExecutionData(results);
	}

	const body: IDataObject = {
		items,
	};

	const response = await brazeApiRequest.call(this, 'PATCH', `/catalogs/${catalogName}/items`, body);

	return toExecutionData(response);
}

export async function deleteItems(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const catalogName = this.getNodeParameter('catalogName', index) as string;
	const itemIds = this.getNodeParameter('itemIds', index) as string;

	const ids = stringToArray(itemIds);

	const body: IDataObject = {
		items: ids.map((id: string) => ({ id })),
	};

	const response = await brazeApiRequest.call(
		this,
		'DELETE',
		`/catalogs/${catalogName}/items`,
		body,
	);

	return toExecutionData(response);
}

export async function replaceItems(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const catalogName = this.getNodeParameter('catalogName', index) as string;
	const itemsJson = this.getNodeParameter('items', index) as string;

	let items: IDataObject[] = [];
	try {
		items = JSON.parse(itemsJson);
	} catch {
		throw new Error('Invalid JSON format for items');
	}

	// Batch items (max 50 per request)
	if (items.length > 50) {
		const results = await brazeBatchRequest.call(
			this,
			`/catalogs/${catalogName}/items`,
			items,
			'items',
			50,
		);
		return toExecutionData(results);
	}

	const body: IDataObject = {
		items,
	};

	const response = await brazeApiRequest.call(this, 'PUT', `/catalogs/${catalogName}/items`, body);

	return toExecutionData(response);
}
