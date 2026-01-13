/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { BRAZE_CLUSTERS, getBaseUrl, formatPhoneNumber, formatDate, stringToArray } from '../../nodes/Braze/transport/brazeApi';

describe('Braze Transport Layer', () => {
	describe('BRAZE_CLUSTERS', () => {
		it('should have all US clusters defined', () => {
			expect(BRAZE_CLUSTERS['US-01']).toBe('https://rest.iad-01.braze.com');
			expect(BRAZE_CLUSTERS['US-02']).toBe('https://rest.iad-02.braze.com');
			expect(BRAZE_CLUSTERS['US-03']).toBe('https://rest.iad-03.braze.com');
			expect(BRAZE_CLUSTERS['US-04']).toBe('https://rest.iad-04.braze.com');
			expect(BRAZE_CLUSTERS['US-05']).toBe('https://rest.iad-05.braze.com');
			expect(BRAZE_CLUSTERS['US-06']).toBe('https://rest.iad-06.braze.com');
			expect(BRAZE_CLUSTERS['US-07']).toBe('https://rest.iad-07.braze.com');
			expect(BRAZE_CLUSTERS['US-08']).toBe('https://rest.iad-08.braze.com');
			expect(BRAZE_CLUSTERS['US-0A']).toBe('https://rest.iad-0a.braze.com');
			expect(BRAZE_CLUSTERS['US-0B']).toBe('https://rest.iad-0b.braze.com');
		});

		it('should have all EU clusters defined', () => {
			expect(BRAZE_CLUSTERS['EU-01']).toBe('https://rest.fra-01.braze.eu');
			expect(BRAZE_CLUSTERS['EU-02']).toBe('https://rest.fra-02.braze.eu');
			expect(BRAZE_CLUSTERS['EU-03']).toBe('https://rest.fra-03.braze.eu');
		});
	});

	describe('getBaseUrl', () => {
		it('should return cluster URL when no custom endpoint', () => {
			const credentials = { cluster: 'US-01', apiKey: 'test' };
			expect(getBaseUrl(credentials)).toBe('https://rest.iad-01.braze.com');
		});

		it('should return custom endpoint when provided', () => {
			const credentials = {
				cluster: 'US-01',
				apiKey: 'test',
				customEndpoint: 'https://custom.braze.com',
			};
			expect(getBaseUrl(credentials)).toBe('https://custom.braze.com');
		});

		it('should remove trailing slash from custom endpoint', () => {
			const credentials = {
				cluster: 'US-01',
				apiKey: 'test',
				customEndpoint: 'https://custom.braze.com/',
			};
			expect(getBaseUrl(credentials)).toBe('https://custom.braze.com');
		});

		it('should default to US-01 for unknown cluster', () => {
			const credentials = { cluster: 'UNKNOWN', apiKey: 'test' };
			expect(getBaseUrl(credentials)).toBe('https://rest.iad-01.braze.com');
		});
	});

	describe('formatPhoneNumber', () => {
		it('should format 10-digit US number', () => {
			expect(formatPhoneNumber('5551234567')).toBe('+15551234567');
		});

		it('should format 11-digit US number with country code', () => {
			expect(formatPhoneNumber('15551234567')).toBe('+15551234567');
		});

		it('should preserve existing + prefix', () => {
			expect(formatPhoneNumber('+15551234567')).toBe('+15551234567');
		});

		it('should strip non-numeric characters', () => {
			expect(formatPhoneNumber('(555) 123-4567')).toBe('+15551234567');
		});
	});

	describe('formatDate', () => {
		it('should format Date object to ISO string', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			expect(formatDate(date)).toBe('2024-01-15T10:30:00.000Z');
		});

		it('should parse and format date string', () => {
			const result = formatDate('2024-01-15');
			expect(result).toContain('2024-01-15');
		});

		it('should return ISO string as-is', () => {
			const isoString = '2024-01-15T10:30:00.000Z';
			expect(formatDate(isoString)).toBe(isoString);
		});
	});

	describe('stringToArray', () => {
		it('should return array as-is', () => {
			const arr = ['a', 'b', 'c'];
			expect(stringToArray(arr)).toEqual(['a', 'b', 'c']);
		});

		it('should split comma-separated string', () => {
			expect(stringToArray('a, b, c')).toEqual(['a', 'b', 'c']);
		});

		it('should trim whitespace', () => {
			expect(stringToArray('  a  ,  b  ,  c  ')).toEqual(['a', 'b', 'c']);
		});

		it('should filter empty strings', () => {
			expect(stringToArray('a,,b,  ,c')).toEqual(['a', 'b', 'c']);
		});
	});
});
