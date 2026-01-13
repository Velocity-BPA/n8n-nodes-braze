/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Simplifies the output data structure for n8n
 */
export function simplifyOutput(data: IDataObject): IDataObject {
	// Remove empty arrays and null values
	const simplified: IDataObject = {};

	for (const [key, value] of Object.entries(data)) {
		if (value === null || value === undefined) {
			continue;
		}
		if (Array.isArray(value) && value.length === 0) {
			continue;
		}
		simplified[key] = value;
	}

	return simplified;
}

/**
 * Converts API response to n8n execution data
 */
export function toExecutionData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
	if (Array.isArray(data)) {
		return data.map((item) => ({
			json: simplifyOutput(item),
		}));
	}

	return [
		{
			json: simplifyOutput(data),
		},
	];
}

/**
 * Builds user identifier object from options
 */
export function buildUserIdentifier(
	identifierType: string,
	identifierValue: string | IDataObject,
): IDataObject {
	switch (identifierType) {
		case 'externalId':
			return { external_id: identifierValue };
		case 'brazeId':
			return { braze_id: identifierValue };
		case 'userAlias':
			if (typeof identifierValue === 'string') {
				const [alias_name, alias_label] = identifierValue.split(':');
				return {
					user_alias: {
						alias_name,
						alias_label: alias_label || 'default',
					},
				};
			}
			return { user_alias: identifierValue };
		default:
			return { external_id: identifierValue };
	}
}

/**
 * Parses additional fields from n8n UI
 */
export function parseAdditionalFields(
	additionalFields: IDataObject,
): IDataObject {
	const result: IDataObject = {};

	for (const [key, value] of Object.entries(additionalFields)) {
		if (value === undefined || value === null || value === '') {
			continue;
		}

		// Handle nested objects (like user_alias)
		if (typeof value === 'string' && value.startsWith('{')) {
			try {
				result[key] = JSON.parse(value);
				continue;
			} catch {
				// Not JSON, use as-is
			}
		}

		// Handle arrays
		if (typeof value === 'string' && value.includes(',')) {
			result[key] = value.split(',').map((v) => v.trim());
			continue;
		}

		result[key] = value;
	}

	return result;
}

/**
 * Validates required fields are present
 */
export function validateRequiredFields(
	data: IDataObject,
	requiredFields: string[],
): void {
	const missingFields: string[] = [];

	for (const field of requiredFields) {
		if (data[field] === undefined || data[field] === null || data[field] === '') {
			missingFields.push(field);
		}
	}

	if (missingFields.length > 0) {
		throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
	}
}

/**
 * Builds recipients array from UI input
 */
export function buildRecipients(
	recipientsInput: IDataObject[] | string,
): IDataObject[] {
	if (typeof recipientsInput === 'string') {
		// Assume comma-separated external IDs
		return recipientsInput.split(',').map((id) => ({
			external_user_id: id.trim(),
		}));
	}

	return recipientsInput;
}

/**
 * Builds schedule object from UI input
 */
export function buildSchedule(
	time: string,
	inLocalTime?: boolean,
	atOptimalTime?: boolean,
): IDataObject {
	const schedule: IDataObject = {
		time,
	};

	if (inLocalTime !== undefined) {
		schedule.in_local_time = inLocalTime;
	}

	if (atOptimalTime !== undefined) {
		schedule.at_optimal_time = atOptimalTime;
	}

	return schedule;
}

/**
 * Formats trigger properties from UI input
 */
export function buildTriggerProperties(
	propertiesInput: IDataObject | string,
): IDataObject {
	if (typeof propertiesInput === 'string') {
		try {
			return JSON.parse(propertiesInput) as IDataObject;
		} catch {
			return {};
		}
	}

	return propertiesInput;
}

/**
 * Converts snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts camelCase to snake_case
 */
export function camelToSnake(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Deep converts object keys from camelCase to snake_case
 */
export function convertKeysToSnakeCase(obj: IDataObject): IDataObject {
	const result: IDataObject = {};

	for (const [key, value] of Object.entries(obj)) {
		const snakeKey = camelToSnake(key);

		if (value && typeof value === 'object' && !Array.isArray(value)) {
			result[snakeKey] = convertKeysToSnakeCase(value as IDataObject);
		} else if (Array.isArray(value)) {
			result[snakeKey] = value.map((item) =>
				typeof item === 'object' && item !== null
					? convertKeysToSnakeCase(item as IDataObject)
					: item,
			);
		} else {
			result[snakeKey] = value;
		}
	}

	return result;
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
