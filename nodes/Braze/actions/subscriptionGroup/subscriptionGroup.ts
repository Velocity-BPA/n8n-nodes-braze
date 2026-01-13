/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest } from '../../transport';
import { toExecutionData, stringToArray } from '../../utils';

export async function getMany(
	this: IExecuteFunctions,
	_index: number,
): Promise<INodeExecutionData[]> {
	const qs: IDataObject = {};

	const response = await brazeApiRequest.call(this, 'GET', '/subscription/user/status', undefined, qs);

	// Return subscription groups
	const groups = response.subscription_groups || [];
	return toExecutionData(groups as IDataObject[]);
}

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const subscriptionGroupId = this.getNodeParameter('subscriptionGroupId', index) as string;
	const channelType = this.getNodeParameter('channelType', index) as string;
	const identifierValue = this.getNodeParameter('identifierValue', index) as string;

	const qs: IDataObject = {
		subscription_group_id: subscriptionGroupId,
	};

	if (channelType === 'email') {
		qs.email = identifierValue;
	} else {
		qs.phone = identifierValue;
	}

	const response = await brazeApiRequest.call(this, 'GET', '/subscription/status/get', undefined, qs);

	return toExecutionData(response);
}

export async function getUsers(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const subscriptionGroupId = this.getNodeParameter('subscriptionGroupId', index) as string;
	const limit = this.getNodeParameter('limit', index, 100) as number;
	const offset = this.getNodeParameter('offset', index, 0) as number;

	const qs: IDataObject = {
		subscription_group_id: subscriptionGroupId,
		limit: Math.min(limit, 500), // Max 500 per request
		offset,
	};

	const response = await brazeApiRequest.call(this, 'GET', '/subscription/user/status', undefined, qs);

	return toExecutionData(response);
}

export async function updateStatus(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const subscriptionGroupId = this.getNodeParameter('subscriptionGroupId', index) as string;
	const subscriptionState = this.getNodeParameter('subscriptionState', index) as string;
	const channelType = this.getNodeParameter('channelType', index) as string;
	const identifiers = this.getNodeParameter('identifiers', index) as string;

	const body: IDataObject = {
		subscription_group_id: subscriptionGroupId,
		subscription_state: subscriptionState,
	};

	const identifierArray = stringToArray(identifiers);

	if (channelType === 'email') {
		body.email = identifierArray;
	} else {
		body.phone = identifierArray;
	}

	// Optionally add external_ids
	const externalIds = this.getNodeParameter('externalIds', index, '') as string;
	if (externalIds) {
		body.external_id = stringToArray(externalIds);
	}

	const response = await brazeApiRequest.call(this, 'POST', '/subscription/status/set', body);

	return toExecutionData(response);
}

export async function getGlobal(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const identifierType = this.getNodeParameter('identifierType', index) as string;
	const identifierValue = this.getNodeParameter('identifierValue', index) as string;

	const qs: IDataObject = {};

	if (identifierType === 'email') {
		qs.email = identifierValue;
	} else if (identifierType === 'phone') {
		qs.phone = identifierValue;
	} else {
		qs.external_id = identifierValue;
	}

	const response = await brazeApiRequest.call(this, 'GET', '/subscription/status/get', undefined, qs);

	return toExecutionData(response);
}
