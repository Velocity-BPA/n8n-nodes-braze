/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest } from '../../transport';
import { toExecutionData } from '../../utils';

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const identifierType = this.getNodeParameter('identifierType', index) as string;
	const identifierValue = this.getNodeParameter('identifierValue', index) as string;
	const fieldsToExport = this.getNodeParameter('fieldsToExport', index, []) as string[];

	const body: IDataObject = {};

	if (identifierType === 'externalId') {
		body.external_ids = [identifierValue];
	} else if (identifierType === 'brazeId') {
		body.braze_ids = [identifierValue];
	} else if (identifierType === 'userAlias') {
		const aliasName = this.getNodeParameter('aliasName', index) as string;
		const aliasLabel = this.getNodeParameter('aliasLabel', index) as string;
		body.user_aliases = [
			{
				alias_name: aliasName,
				alias_label: aliasLabel,
			},
		];
	} else if (identifierType === 'email') {
		body.email_address = identifierValue;
	} else if (identifierType === 'phone') {
		body.phone = identifierValue;
	}

	if (fieldsToExport.length > 0) {
		body.fields_to_export = fieldsToExport;
	}

	const response = await brazeApiRequest.call(this, 'POST', '/users/export/ids', body);

	// Return the users array if present
	if (response.users && Array.isArray(response.users)) {
		return toExecutionData(response.users as IDataObject[]);
	}

	return toExecutionData(response);
}

export async function getBySegment(
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

export async function getSubscriptionStatus(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const channelType = this.getNodeParameter('channelType', index) as string;
	const identifierValue = this.getNodeParameter('identifierValue', index) as string;

	const qs: IDataObject = {};

	if (channelType === 'email') {
		qs.email = identifierValue;
	} else {
		qs.phone = identifierValue;
	}

	const subscriptionGroupId = this.getNodeParameter('subscriptionGroupId', index, '') as string;
	if (subscriptionGroupId) {
		qs.subscription_group_id = subscriptionGroupId;
	}

	const response = await brazeApiRequest.call(this, 'GET', '/subscription/status/get', undefined, qs);

	return toExecutionData(response);
}
