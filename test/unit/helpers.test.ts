/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	simplifyOutput,
	buildUserIdentifier,
	parseAdditionalFields,
	validateRequiredFields,
	buildRecipients,
	buildSchedule,
	buildTriggerProperties,
	snakeToCamel,
	camelToSnake,
	convertKeysToSnakeCase,
} from '../../nodes/Braze/utils/helpers';

describe('Braze Helpers', () => {
	describe('simplifyOutput', () => {
		it('should remove null values', () => {
			const data = { a: 1, b: null, c: 3 };
			expect(simplifyOutput(data)).toEqual({ a: 1, c: 3 });
		});

		it('should remove undefined values', () => {
			const data = { a: 1, b: undefined, c: 3 };
			expect(simplifyOutput(data)).toEqual({ a: 1, c: 3 });
		});

		it('should remove empty arrays', () => {
			const data = { a: 1, b: [], c: [1, 2] };
			expect(simplifyOutput(data)).toEqual({ a: 1, c: [1, 2] });
		});
	});

	describe('buildUserIdentifier', () => {
		it('should build external_id identifier', () => {
			expect(buildUserIdentifier('externalId', 'user123')).toEqual({
				external_id: 'user123',
			});
		});

		it('should build braze_id identifier', () => {
			expect(buildUserIdentifier('brazeId', 'braze123')).toEqual({
				braze_id: 'braze123',
			});
		});

		it('should build user_alias from string', () => {
			expect(buildUserIdentifier('userAlias', 'myalias:mylabel')).toEqual({
				user_alias: {
					alias_name: 'myalias',
					alias_label: 'mylabel',
				},
			});
		});

		it('should default alias_label to "default"', () => {
			expect(buildUserIdentifier('userAlias', 'myalias')).toEqual({
				user_alias: {
					alias_name: 'myalias',
					alias_label: 'default',
				},
			});
		});
	});

	describe('parseAdditionalFields', () => {
		it('should parse JSON strings', () => {
			const fields = { data: '{"key": "value"}' };
			expect(parseAdditionalFields(fields)).toEqual({
				data: { key: 'value' },
			});
		});

		it('should split comma-separated strings to arrays', () => {
			const fields = { tags: 'tag1, tag2, tag3' };
			expect(parseAdditionalFields(fields)).toEqual({
				tags: ['tag1', 'tag2', 'tag3'],
			});
		});

		it('should skip empty values', () => {
			const fields = { a: 1, b: '', c: null, d: 4 };
			expect(parseAdditionalFields(fields)).toEqual({ a: 1, d: 4 });
		});
	});

	describe('validateRequiredFields', () => {
		it('should not throw when all required fields present', () => {
			const data = { a: 1, b: 2 };
			expect(() => validateRequiredFields(data, ['a', 'b'])).not.toThrow();
		});

		it('should throw when required fields missing', () => {
			const data = { a: 1 };
			expect(() => validateRequiredFields(data, ['a', 'b'])).toThrow(
				'Missing required fields: b',
			);
		});

		it('should throw for empty string values', () => {
			const data = { a: 1, b: '' };
			expect(() => validateRequiredFields(data, ['a', 'b'])).toThrow(
				'Missing required fields: b',
			);
		});
	});

	describe('buildRecipients', () => {
		it('should return array as-is', () => {
			const recipients = [{ external_user_id: 'user1' }];
			expect(buildRecipients(recipients)).toEqual(recipients);
		});

		it('should build recipients from comma-separated string', () => {
			expect(buildRecipients('user1, user2, user3')).toEqual([
				{ external_user_id: 'user1' },
				{ external_user_id: 'user2' },
				{ external_user_id: 'user3' },
			]);
		});
	});

	describe('buildSchedule', () => {
		it('should build basic schedule', () => {
			expect(buildSchedule('2024-01-15T10:00:00Z')).toEqual({
				time: '2024-01-15T10:00:00Z',
			});
		});

		it('should include in_local_time', () => {
			expect(buildSchedule('2024-01-15T10:00:00Z', true)).toEqual({
				time: '2024-01-15T10:00:00Z',
				in_local_time: true,
			});
		});

		it('should include at_optimal_time', () => {
			expect(buildSchedule('2024-01-15T10:00:00Z', false, true)).toEqual({
				time: '2024-01-15T10:00:00Z',
				in_local_time: false,
				at_optimal_time: true,
			});
		});
	});

	describe('buildTriggerProperties', () => {
		it('should parse JSON string', () => {
			expect(buildTriggerProperties('{"key": "value"}')).toEqual({
				key: 'value',
			});
		});

		it('should return object as-is', () => {
			const props = { key: 'value' };
			expect(buildTriggerProperties(props)).toEqual(props);
		});

		it('should return empty object for invalid JSON', () => {
			expect(buildTriggerProperties('invalid json')).toEqual({});
		});
	});

	describe('snakeToCamel', () => {
		it('should convert snake_case to camelCase', () => {
			expect(snakeToCamel('hello_world')).toBe('helloWorld');
			expect(snakeToCamel('external_user_id')).toBe('externalUserId');
		});
	});

	describe('camelToSnake', () => {
		it('should convert camelCase to snake_case', () => {
			expect(camelToSnake('helloWorld')).toBe('hello_world');
			expect(camelToSnake('externalUserId')).toBe('external_user_id');
		});
	});

	describe('convertKeysToSnakeCase', () => {
		it('should convert all keys to snake_case', () => {
			const input = {
				firstName: 'John',
				lastName: 'Doe',
			};
			expect(convertKeysToSnakeCase(input)).toEqual({
				first_name: 'John',
				last_name: 'Doe',
			});
		});

		it('should handle nested objects', () => {
			const input = {
				userData: {
					firstName: 'John',
				},
			};
			expect(convertKeysToSnakeCase(input)).toEqual({
				user_data: {
					first_name: 'John',
				},
			});
		});

		it('should handle arrays', () => {
			const input = {
				userList: [{ firstName: 'John' }, { firstName: 'Jane' }],
			};
			expect(convertKeysToSnakeCase(input)).toEqual({
				user_list: [{ first_name: 'John' }, { first_name: 'Jane' }],
			});
		});
	});
});
