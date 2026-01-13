/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest, brazeBatchRequest } from '../../transport';
import { toExecutionData, formatDate, parseAdditionalFields } from '../../utils';

export async function track(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const trackType = this.getNodeParameter('trackType', index) as string;
	const identifierType = this.getNodeParameter('identifierType', index) as string;
	const identifierValue = this.getNodeParameter('identifierValue', index) as string;

	const body: IDataObject = {};

	// Build user identifier
	const identifier: IDataObject = {};
	if (identifierType === 'externalId') {
		identifier.external_id = identifierValue;
	} else if (identifierType === 'brazeId') {
		identifier.braze_id = identifierValue;
	} else if (identifierType === 'userAlias') {
		const aliasName = this.getNodeParameter('aliasName', index) as string;
		const aliasLabel = this.getNodeParameter('aliasLabel', index) as string;
		identifier.user_alias = {
			alias_name: aliasName,
			alias_label: aliasLabel,
		};
	}

	if (trackType === 'attributes' || trackType === 'all') {
		const attributesUi = this.getNodeParameter('attributesUi', index, {}) as IDataObject;
		const attributes: IDataObject = { ...identifier };

		if (attributesUi.attributeValues) {
			const attrValues = attributesUi.attributeValues as IDataObject[];
			for (const attr of attrValues) {
				if (attr.key && attr.value !== undefined) {
					attributes[attr.key as string] = attr.value;
				}
			}
		}

		const additionalAttributes = this.getNodeParameter('additionalAttributes', index, {}) as IDataObject;
		const parsed = parseAdditionalFields(additionalAttributes);
		Object.assign(attributes, parsed);

		if (Object.keys(attributes).length > 1) {
			body.attributes = [attributes];
		}
	}

	if (trackType === 'events' || trackType === 'all') {
		const eventsUi = this.getNodeParameter('eventsUi', index, {}) as IDataObject;

		if (eventsUi.eventValues) {
			const eventValues = eventsUi.eventValues as IDataObject[];
			const events: IDataObject[] = [];

			for (const event of eventValues) {
				const eventObj: IDataObject = {
					...identifier,
					name: event.name,
					time: event.time ? formatDate(event.time as string) : new Date().toISOString(),
				};

				if (event.appId) {
					eventObj.app_id = event.appId;
				}

				if (event.properties) {
					try {
						eventObj.properties = typeof event.properties === 'string'
							? JSON.parse(event.properties)
							: event.properties;
					} catch {
						eventObj.properties = {};
					}
				}

				events.push(eventObj);
			}

			if (events.length > 0) {
				body.events = events;
			}
		}
	}

	if (trackType === 'purchases' || trackType === 'all') {
		const purchasesUi = this.getNodeParameter('purchasesUi', index, {}) as IDataObject;

		if (purchasesUi.purchaseValues) {
			const purchaseValues = purchasesUi.purchaseValues as IDataObject[];
			const purchases: IDataObject[] = [];

			for (const purchase of purchaseValues) {
				const purchaseObj: IDataObject = {
					...identifier,
					product_id: purchase.productId,
					currency: purchase.currency || 'USD',
					price: parseFloat(purchase.price as string),
					time: purchase.time ? formatDate(purchase.time as string) : new Date().toISOString(),
				};

				if (purchase.quantity) {
					purchaseObj.quantity = parseInt(purchase.quantity as string, 10);
				}

				if (purchase.appId) {
					purchaseObj.app_id = purchase.appId;
				}

				if (purchase.properties) {
					try {
						purchaseObj.properties = typeof purchase.properties === 'string'
							? JSON.parse(purchase.properties)
							: purchase.properties;
					} catch {
						purchaseObj.properties = {};
					}
				}

				purchases.push(purchaseObj);
			}

			if (purchases.length > 0) {
				body.purchases = purchases;
			}
		}
	}

	const response = await brazeApiRequest.call(this, 'POST', '/users/track', body);

	return toExecutionData(response);
}

export async function trackBatch(
	this: IExecuteFunctions,
	items: IDataObject[],
): Promise<IDataObject[]> {
	const attributes: IDataObject[] = [];
	const events: IDataObject[] = [];
	const purchases: IDataObject[] = [];

	for (const item of items) {
		if (item.attributes) {
			attributes.push(...(item.attributes as IDataObject[]));
		}
		if (item.events) {
			events.push(...(item.events as IDataObject[]));
		}
		if (item.purchases) {
			purchases.push(...(item.purchases as IDataObject[]));
		}
	}

	const body: IDataObject = {};
	if (attributes.length > 0) body.attributes = attributes;
	if (events.length > 0) body.events = events;
	if (purchases.length > 0) body.purchases = purchases;

	// Batch request respects 75 user limit
	if (attributes.length > 75) {
		return await brazeBatchRequest.call(this, '/users/track', attributes, 'attributes', 75);
	}

	const response = await brazeApiRequest.call(this, 'POST', '/users/track', body);
	return [response];
}
