/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest, brazeApiRequestAllItems } from '../../transport';
import { toExecutionData } from '../../utils';

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', index) as string;
	const preferenceCenterTitle = this.getNodeParameter('preferenceCenterTitle', index, '') as string;
	const preferenceCenterPageHtml = this.getNodeParameter('preferenceCenterPageHtml', index, '') as string;
	const confirmationPageHtml = this.getNodeParameter('confirmationPageHtml', index, '') as string;
	const state = this.getNodeParameter('state', index, 'active') as string;
	const optionsJson = this.getNodeParameter('options', index, '[]') as string;

	const body: IDataObject = {
		name,
		state,
	};

	if (preferenceCenterTitle) {
		body.preference_center_title = preferenceCenterTitle;
	}

	if (preferenceCenterPageHtml) {
		body.preference_center_page_html = preferenceCenterPageHtml;
	}

	if (confirmationPageHtml) {
		body.confirmation_page_html = confirmationPageHtml;
	}

	try {
		const options = JSON.parse(optionsJson);
		if (Array.isArray(options) && options.length > 0) {
			body.options = options;
		}
	} catch {
		// Ignore invalid JSON
	}

	const response = await brazeApiRequest.call(this, 'POST', '/preference_center/v1', body);

	return toExecutionData(response);
}

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const preferenceCenterId = this.getNodeParameter('preferenceCenterId', index) as string;

	const response = await brazeApiRequest.call(
		this,
		'GET',
		`/preference_center/v1/${preferenceCenterId}`,
		undefined,
	);

	return toExecutionData(response);
}

export async function getMany(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;

	if (returnAll) {
		const preferenceCenters = await brazeApiRequestAllItems.call(
			this,
			'GET',
			'/preference_center/v1/list',
			'preference_centers',
		);
		return toExecutionData(preferenceCenters);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	const preferenceCenters = await brazeApiRequestAllItems.call(
		this,
		'GET',
		'/preference_center/v1/list',
		'preference_centers',
		undefined,
		undefined,
		limit,
	);
	return toExecutionData(preferenceCenters);
}

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const preferenceCenterId = this.getNodeParameter('preferenceCenterId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.name) {
		body.name = updateFields.name;
	}

	if (updateFields.preferenceCenterTitle) {
		body.preference_center_title = updateFields.preferenceCenterTitle;
	}

	if (updateFields.preferenceCenterPageHtml) {
		body.preference_center_page_html = updateFields.preferenceCenterPageHtml;
	}

	if (updateFields.confirmationPageHtml) {
		body.confirmation_page_html = updateFields.confirmationPageHtml;
	}

	if (updateFields.state) {
		body.state = updateFields.state;
	}

	if (updateFields.options) {
		try {
			body.options = JSON.parse(updateFields.options as string);
		} catch {
			// Ignore invalid JSON
		}
	}

	const response = await brazeApiRequest.call(
		this,
		'PUT',
		`/preference_center/v1/${preferenceCenterId}`,
		body,
	);

	return toExecutionData(response);
}

export async function getUrl(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const preferenceCenterId = this.getNodeParameter('preferenceCenterId', index) as string;
	const userId = this.getNodeParameter('userId', index) as string;

	const body: IDataObject = {
		preference_center_api_id: preferenceCenterId,
		external_id: userId,
	};

	const response = await brazeApiRequest.call(
		this,
		'POST',
		'/preference_center/v1/url',
		body,
	);

	return toExecutionData(response);
}
