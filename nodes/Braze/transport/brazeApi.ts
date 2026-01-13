/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	ICredentialDataDecryptedObject,
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IPollFunctions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Braze cluster URL mapping
 */
export const BRAZE_CLUSTERS: Record<string, string> = {
	'US-01': 'https://rest.iad-01.braze.com',
	'US-02': 'https://rest.iad-02.braze.com',
	'US-03': 'https://rest.iad-03.braze.com',
	'US-04': 'https://rest.iad-04.braze.com',
	'US-05': 'https://rest.iad-05.braze.com',
	'US-06': 'https://rest.iad-06.braze.com',
	'US-07': 'https://rest.iad-07.braze.com',
	'US-08': 'https://rest.iad-08.braze.com',
	'US-0A': 'https://rest.iad-0a.braze.com',
	'US-0B': 'https://rest.iad-0b.braze.com',
	'EU-01': 'https://rest.fra-01.braze.eu',
	'EU-02': 'https://rest.fra-02.braze.eu',
	'EU-03': 'https://rest.fra-03.braze.eu',
};

/**
 * Gets the base URL for the Braze API based on credentials
 */
export function getBaseUrl(credentials: ICredentialDataDecryptedObject): string {
	if (credentials.customEndpoint && (credentials.customEndpoint as string).trim() !== '') {
		let endpoint = credentials.customEndpoint as string;
		// Remove trailing slash if present
		if (endpoint.endsWith('/')) {
			endpoint = endpoint.slice(0, -1);
		}
		return endpoint;
	}
	const cluster = credentials.cluster as string;
	return BRAZE_CLUSTERS[cluster] || BRAZE_CLUSTERS['US-01'];
}

/**
 * Makes a request to the Braze API
 */
export async function brazeApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('brazeApi');
	const baseUrl = getBaseUrl(credentials);

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${endpoint}`,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${credentials.apiKey}`,
		},
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (qs && Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	try {
		const response = await this.helpers.httpRequest(options);

		// Check for Braze-specific errors
		if (response && response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
			throw new NodeApiError(this.getNode(), {
				message: `Braze API Error: ${(response.errors as string[]).join(', ')}`,
			});
		}

		return response as IDataObject;
	} catch (error) {
		if (error instanceof NodeApiError) {
			throw error;
		}
		throw new NodeApiError(this.getNode(), { message: (error as Error).message });
	}
}

/**
 * Makes a batch request to the Braze API, splitting items into smaller batches
 */
export async function brazeBatchRequest(
	this: IExecuteFunctions,
	endpoint: string,
	items: IDataObject[],
	batchKey: string,
	batchSize: number = 75,
): Promise<IDataObject[]> {
	const results: IDataObject[] = [];

	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		const response = await brazeApiRequest.call(this, 'POST', endpoint, {
			[batchKey]: batch,
		});
		results.push(response);
	}

	return results;
}

/**
 * Makes paginated requests to the Braze API and returns all items
 */
export async function brazeApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	dataKey: string,
	body?: IDataObject,
	query?: IDataObject,
	limit?: number,
): Promise<IDataObject[]> {
	const results: IDataObject[] = [];
	let page = 0;
	const pageSize = 100;
	let hasMore = true;

	while (hasMore) {
		const qs: IDataObject = {
			...query,
			page,
			page_size: pageSize,
		};

		const response = await brazeApiRequest.call(this, method, endpoint, body, qs);

		const items = (response[dataKey] as IDataObject[]) || [];

		if (items.length === 0) {
			hasMore = false;
		} else {
			results.push(...items);

			if (limit && results.length >= limit) {
				return results.slice(0, limit);
			}

			if (items.length < pageSize) {
				hasMore = false;
			} else {
				page++;
			}
		}
	}

	return results;
}

/**
 * Validates and formats a phone number to E.164 format
 */
export function formatPhoneNumber(phone: string): string {
	// Remove all non-numeric characters except leading +
	let cleaned = phone.replace(/[^\d+]/g, '');

	// Ensure it starts with +
	if (!cleaned.startsWith('+')) {
		// Assume US number if no country code
		if (cleaned.length === 10) {
			cleaned = `+1${cleaned}`;
		} else if (cleaned.length === 11 && cleaned.startsWith('1')) {
			cleaned = `+${cleaned}`;
		} else {
			cleaned = `+${cleaned}`;
		}
	}

	return cleaned;
}

/**
 * Formats a date to ISO 8601 format
 */
export function formatDate(date: string | Date): string {
	if (date instanceof Date) {
		return date.toISOString();
	}

	// Try to parse the string as a date
	const parsed = new Date(date);
	if (!isNaN(parsed.getTime())) {
		return parsed.toISOString();
	}

	// Return as-is if already in ISO format
	return date;
}

/**
 * Parses JSON safely, returning undefined if parsing fails
 */
export function parseJson(json: string): IDataObject | undefined {
	try {
		return JSON.parse(json) as IDataObject;
	} catch {
		return undefined;
	}
}

/**
 * Converts a comma-separated string to an array
 */
export function stringToArray(value: string | string[]): string[] {
	if (Array.isArray(value)) {
		return value;
	}
	return value.split(',').map((item) => item.trim()).filter((item) => item !== '');
}

/**
 * Handles rate limiting by waiting and retrying
 */
export async function handleRateLimit(
	this: IExecuteFunctions,
	fn: () => Promise<IDataObject>,
	maxRetries: number = 3,
): Promise<IDataObject> {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;

			// Check if it's a rate limit error
			if (error instanceof NodeApiError) {
				const statusCode = String((error as NodeApiError).httpCode);
				if (statusCode === '429') {
					// Wait with exponential backoff
					const waitTime = Math.pow(2, attempt) * 1000;
					await new Promise((resolve) => setTimeout(resolve, waitTime));
					continue;
				}
			}

			throw error;
		}
	}

	throw lastError;
}
