/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest } from '../../transport';
import { toExecutionData } from '../../utils';

export async function merge(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const mergeFromType = this.getNodeParameter('mergeFromType', index) as string;
	const mergeFromValue = this.getNodeParameter('mergeFromValue', index) as string;
	const mergeToType = this.getNodeParameter('mergeToType', index) as string;
	const mergeToValue = this.getNodeParameter('mergeToValue', index) as string;

	const buildIdentifier = (type: string, value: string, aliasName?: string, aliasLabel?: string): IDataObject => {
		if (type === 'externalId') {
			return { external_id: value };
		} else if (type === 'userAlias') {
			return {
				user_alias: {
					alias_name: aliasName || value.split(':')[0],
					alias_label: aliasLabel || value.split(':')[1] || 'default',
				},
			};
		}
		return { external_id: value };
	};

	let mergeFromAliasName: string | undefined;
	let mergeFromAliasLabel: string | undefined;
	let mergeToAliasName: string | undefined;
	let mergeToAliasLabel: string | undefined;

	if (mergeFromType === 'userAlias') {
		mergeFromAliasName = this.getNodeParameter('mergeFromAliasName', index, '') as string;
		mergeFromAliasLabel = this.getNodeParameter('mergeFromAliasLabel', index, '') as string;
	}

	if (mergeToType === 'userAlias') {
		mergeToAliasName = this.getNodeParameter('mergeToAliasName', index, '') as string;
		mergeToAliasLabel = this.getNodeParameter('mergeToAliasLabel', index, '') as string;
	}

	const body: IDataObject = {
		merge_updates: [
			{
				identifier_to_merge: buildIdentifier(mergeFromType, mergeFromValue, mergeFromAliasName, mergeFromAliasLabel),
				identifier_to_keep: buildIdentifier(mergeToType, mergeToValue, mergeToAliasName, mergeToAliasLabel),
			},
		],
	};

	const response = await brazeApiRequest.call(this, 'POST', '/users/merge', body);

	return toExecutionData(response);
}

export async function newAlias(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const externalId = this.getNodeParameter('externalId', index, '') as string;
	const aliasName = this.getNodeParameter('aliasName', index) as string;
	const aliasLabel = this.getNodeParameter('aliasLabel', index) as string;

	const aliasObject: IDataObject = {
		alias_name: aliasName,
		alias_label: aliasLabel,
	};

	if (externalId) {
		aliasObject.external_id = externalId;
	}

	const body: IDataObject = {
		user_aliases: [aliasObject],
	};

	const response = await brazeApiRequest.call(this, 'POST', '/users/alias/new', body);

	return toExecutionData(response);
}

export async function renameExternalId(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const currentExternalId = this.getNodeParameter('currentExternalId', index) as string;
	const newExternalId = this.getNodeParameter('newExternalId', index) as string;

	const body: IDataObject = {
		external_id_renames: [
			{
				current_external_id: currentExternalId,
				new_external_id: newExternalId,
			},
		],
	};

	const response = await brazeApiRequest.call(this, 'POST', '/users/external_ids/rename', body);

	return toExecutionData(response);
}

export async function removeExternalId(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const externalId = this.getNodeParameter('externalId', index) as string;

	const body: IDataObject = {
		external_ids: [externalId],
	};

	const response = await brazeApiRequest.call(this, 'POST', '/users/external_ids/remove', body);

	return toExecutionData(response);
}

export async function setSubscriptionStatus(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const subscriptionGroupId = this.getNodeParameter('subscriptionGroupId', index) as string;
	const subscriptionState = this.getNodeParameter('subscriptionState', index) as string;
	const channelType = this.getNodeParameter('channelType', index) as string;
	const identifierValue = this.getNodeParameter('identifierValue', index) as string;

	const body: IDataObject = {
		subscription_group_id: subscriptionGroupId,
		subscription_state: subscriptionState,
	};

	if (channelType === 'email') {
		body.email = [identifierValue];
	} else {
		body.phone = [identifierValue];
	}

	const externalId = this.getNodeParameter('externalId', index, '') as string;
	if (externalId) {
		body.external_id = [externalId];
	}

	const response = await brazeApiRequest.call(this, 'POST', '/subscription/status/set', body);

	return toExecutionData(response);
}
