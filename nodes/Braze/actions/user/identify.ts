/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest } from '../../transport';
import { toExecutionData } from '../../utils';

export async function identify(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const externalId = this.getNodeParameter('externalId', index) as string;
	const aliasName = this.getNodeParameter('aliasName', index) as string;
	const aliasLabel = this.getNodeParameter('aliasLabel', index) as string;

	const body: IDataObject = {
		aliases_to_identify: [
			{
				external_id: externalId,
				user_alias: {
					alias_name: aliasName,
					alias_label: aliasLabel,
				},
			},
		],
	};

	const response = await brazeApiRequest.call(this, 'POST', '/users/identify', body);

	return toExecutionData(response);
}
