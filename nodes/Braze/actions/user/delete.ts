/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest, brazeBatchRequest } from '../../transport';
import { toExecutionData, stringToArray } from '../../utils';

export async function deleteUser(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const identifierType = this.getNodeParameter('identifierType', index) as string;
	const identifierValues = this.getNodeParameter('identifierValues', index) as string;

	const body: IDataObject = {};
	const values = stringToArray(identifierValues);

	if (identifierType === 'externalId') {
		body.external_ids = values;
	} else if (identifierType === 'brazeId') {
		body.braze_ids = values;
	} else if (identifierType === 'userAlias') {
		// For user aliases, expect format: alias_name:alias_label
		body.user_aliases = values.map((v: string) => {
			const [alias_name, alias_label] = v.split(':');
			return {
				alias_name,
				alias_label: alias_label || 'default',
			};
		});
	}

	// Batch delete respects 50 user limit
	if (values.length > 50) {
		if (identifierType === 'externalId') {
			const results = await brazeBatchRequest.call(this, '/users/delete', values.map((id: string) => ({ external_id: id })), 'external_ids', 50);
			return toExecutionData(results);
		}
	}

	const response = await brazeApiRequest.call(this, 'POST', '/users/delete', body);

	return toExecutionData(response);
}
