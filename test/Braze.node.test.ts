/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Braze } from '../nodes/Braze/Braze.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Braze Node', () => {
  let node: Braze;

  beforeAll(() => {
    node = new Braze();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Braze');
      expect(node.description.name).toBe('braze');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 7 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(7);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(7);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('User Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://rest.iad-01.braze.com' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn().mockResolvedValue({ success: true }) 
      },
    };
  });

  describe('trackUser operation', () => {
    it('should track user successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('trackUser')
        .mockReturnValueOnce('user123')
        .mockReturnValueOnce('{"first_name": "John"}')
        .mockReturnValueOnce('[]');

      const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://rest.iad-01.braze.com/users/track',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        body: {
          external_id: 'user123',
          attributes: { first_name: 'John' },
          events: []
        },
        json: true,
      });
      expect(result[0].json.success).toBe(true);
    });

    it('should handle trackUser errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('trackUser');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('identifyUser operation', () => {
    it('should identify user successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('identifyUser')
        .mockReturnValueOnce('[{"external_id": "user123", "user_alias": {"alias_name": "alias1"}}]');

      const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://rest.iad-01.braze.com/users/identify',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        body: {
          aliases_to_identify: [{"external_id": "user123", "user_alias": {"alias_name": "alias1"}}]
        },
        json: true,
      });
      expect(result[0].json.success).toBe(true);
    });
  });

  describe('deleteUser operation', () => {
    it('should delete user successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deleteUser')
        .mockReturnValueOnce('user123,user456')
        .mockReturnValueOnce('[]')
        .mockReturnValueOnce('braze123,braze456');

      const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://rest.iad-01.braze.com/users/delete',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        body: {
          external_ids: ['user123', 'user456'],
          user_aliases: [],
          braze_ids: ['braze123', 'braze456']
        },
        json: true,
      });
      expect(result[0].json.success).toBe(true);
    });
  });

  describe('exportUsersBySegment operation', () => {
    it('should export users by segment successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('exportUsersBySegment')
        .mockReturnValueOnce('segment123')
        .mockReturnValueOnce('https://callback.example.com');

      const result = await executeUserOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://rest.iad-01.braze.com/users/export/segment',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        body: {
          segment_id: 'segment123',
          callback_endpoint: 'https://callback.example.com'
        },
        json: true,
      });
      expect(result[0].json.success).toBe(true);
    });
  });
});

describe('Campaign Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-api-key',
        baseUrl: 'https://rest.iad-01.braze.com'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Braze Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('getAllCampaigns', () => {
    it('should get all campaigns successfully', async () => {
      const mockResponse = { campaigns: [{ id: 'camp1', name: 'Test Campaign' }] };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllCampaigns')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(false);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCampaignOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://rest.iad-01.braze.com/campaigns/list',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        qs: { page: 0, include_archived: false },
        json: true,
      });
    });

    it('should handle getAllCampaigns error', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllCampaigns');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeCampaignOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('triggerCampaign', () => {
    it('should trigger campaign successfully', async () => {
      const mockResponse = { message: 'success' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('triggerCampaign')
        .mockReturnValueOnce('campaign123')
        .mockReturnValueOnce([{ external_id: 'user1' }])
        .mockReturnValueOnce(false);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCampaignOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://rest.iad-01.braze.com/campaigns/trigger/send',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          campaign_id: 'campaign123',
          recipients: [{ external_id: 'user1' }],
        },
        json: true,
      });
    });
  });

  describe('scheduleCampaign', () => {
    it('should schedule campaign successfully', async () => {
      const mockResponse = { schedule_id: 'schedule123' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('scheduleCampaign')
        .mockReturnValueOnce('campaign123')
        .mockReturnValueOnce([{ external_id: 'user1' }])
        .mockReturnValueOnce('2024-12-31T12:00:00Z');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCampaignOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('updateScheduledCampaign', () => {
    it('should update scheduled campaign successfully', async () => {
      const mockResponse = { message: 'success' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updateScheduledCampaign')
        .mockReturnValueOnce('schedule123')
        .mockReturnValueOnce('2024-12-31T15:00:00Z');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCampaignOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('deleteScheduledCampaign', () => {
    it('should delete scheduled campaign successfully', async () => {
      const mockResponse = { message: 'success' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('deleteScheduledCampaign')
        .mockReturnValueOnce('schedule123');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCampaignOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getCampaignDetails', () => {
    it('should get campaign details successfully', async () => {
      const mockResponse = { campaign: { id: 'campaign123', stats: {} } };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getCampaignDetails')
        .mockReturnValueOnce('campaign123');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCampaignOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Canvas Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://rest.iad-01.braze.com' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn().mockResolvedValue({ success: true }) 
      },
    };
  });

  it('should get all canvas campaigns successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAllCanvas')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce('desc');

    const result = await executeCanvasOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/canvas/list')
      })
    );
    expect(result).toHaveLength(1);
    expect(result[0].json.success).toBe(true);
  });

  it('should trigger canvas successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('triggerCanvas')
      .mockReturnValueOnce('canvas-123')
      .mockReturnValueOnce([{ external_id: 'user-123' }])
      .mockReturnValueOnce(false);

    const result = await executeCanvasOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: expect.stringContaining('/canvas/trigger/send'),
        body: expect.objectContaining({
          canvas_id: 'canvas-123',
          recipients: [{ external_id: 'user-123' }]
        })
      })
    );
    expect(result).toHaveLength(1);
  });

  it('should handle errors gracefully when continue on fail is enabled', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllCanvas');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeCanvasOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });

  it('should schedule canvas successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('scheduleCanvas')
      .mockReturnValueOnce('canvas-123')
      .mockReturnValueOnce([{ external_id: 'user-123' }])
      .mockReturnValueOnce('2024-01-01T12:00:00Z');

    const result = await executeCanvasOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: expect.stringContaining('/canvas/trigger/schedule/create')
      })
    );
    expect(result).toHaveLength(1);
  });

  it('should get canvas details successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getCanvasDetails')
      .mockReturnValueOnce('canvas-123');

    const result = await executeCanvasOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/canvas/details')
      })
    );
    expect(result).toHaveLength(1);
  });
});

describe('Segment Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://rest.iad-01.braze.com'
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('getAllSegments operation', () => {
		it('should get all segments successfully', async () => {
			const mockResponse = {
				segments: [
					{ id: 'segment1', name: 'Test Segment 1' },
					{ id: 'segment2', name: 'Test Segment 2' }
				]
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAllSegments')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce('asc');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://rest.iad-01.braze.com/segments/list',
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
				},
				qs: {
					page: 0,
					sort_direction: 'asc',
				},
				json: true,
			});

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
		});

		it('should handle getAllSegments error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAllSegments');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: { error: 'API Error' },
				pairedItem: { item: 0 },
			}]);
		});
	});

	describe('getSegmentDetails operation', () => {
		it('should get segment details successfully', async () => {
			const mockResponse = {
				segment: {
					id: 'segment123',
					name: 'Test Segment',
					size: 1000
				}
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getSegmentDetails')
				.mockReturnValueOnce('segment123');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://rest.iad-01.braze.com/segments/details',
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
				},
				qs: {
					segment_id: 'segment123',
				},
				json: true,
			});

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
		});

		it('should handle getSegmentDetails error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getSegmentDetails');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Segment not found'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: { error: 'Segment not found' },
				pairedItem: { item: 0 },
			}]);
		});
	});

	describe('getSegmentAnalytics operation', () => {
		it('should get segment analytics successfully', async () => {
			const mockResponse = {
				data: [
					{ time: '2023-01-01', size: 1000 },
					{ time: '2023-01-02', size: 1050 }
				]
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getSegmentAnalytics')
				.mockReturnValueOnce('segment123')
				.mockReturnValueOnce(7)
				.mockReturnValueOnce('day');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://rest.iad-01.braze.com/segments/data_series',
				headers: {
					'Authorization': 'Bearer test-api-key',
					'Content-Type': 'application/json',
				},
				body: {
					segment_id: 'segment123',
					length: 7,
					unit: 'day',
				},
				json: true,
			});

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
		});

		it('should handle getSegmentAnalytics error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getSegmentAnalytics');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Analytics unavailable'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeSegmentOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: { error: 'Analytics unavailable' },
				pairedItem: { item: 0 },
			}]);
		});
	});
});

describe('Message Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-key', 
        baseUrl: 'https://rest.iad-01.braze.com' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  it('should send immediate message successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'sendMessage';
        case 'external_user_ids': return 'user1,user2';
        case 'messages': return { email: { subject: 'Test' } };
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      message: 'success',
      dispatch_id: 'test-dispatch-id'
    });

    const result = await executeMessageOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.message).toBe('success');
  });

  it('should schedule message successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'scheduleMessage';
        case 'send_at': return '2024-01-01T12:00:00Z';
        case 'messages': return { push: { alert: 'Scheduled message' } };
        case 'recipients': return { segment_id: 'test-segment' };
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
      message: 'success',
      schedule_id: 'test-schedule-id'
    });

    const result = await executeMessageOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.schedule_id).toBe('test-schedule-id');
  });

  it('should handle errors when continue on fail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValue('sendMessage');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
      new Error('API Error')
    );

    const result = await executeMessageOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
});

describe('Event Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://rest.iad-01.braze.com'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('trackEvent operation', () => {
    it('should track events successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('trackEvent')
        .mockReturnValueOnce([{ external_id: 'user123', name: 'test_event' }])
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce([]);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        events_processed: 1,
        message: 'success'
      });

      const result = await executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://rest.iad-01.braze.com/users/track',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        body: {
          events: [{ external_id: 'user123', name: 'test_event' }]
        },
        json: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].json.events_processed).toBe(1);
    });

    it('should handle track event errors', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('trackEvent')
        .mockReturnValueOnce([])
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce([]);

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getAllEvents operation', () => {
    it('should get all events successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllEvents')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce('desc');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        events: ['event1', 'event2']
      });

      const result = await executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://rest.iad-01.braze.com/events/list?page=0&sort_direction=desc',
        headers: {
          'Authorization': 'Bearer test-key',
        },
        json: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].json.events).toEqual(['event1', 'event2']);
    });
  });

  describe('getEventAnalytics operation', () => {
    it('should get event analytics successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getEventAnalytics')
        .mockReturnValueOnce('test_event')
        .mockReturnValueOnce(30)
        .mockReturnValueOnce('day')
        .mockReturnValueOnce('');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        data: [{ time: '2023-01-01', count: 100 }]
      });

      const result = await executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://rest.iad-01.braze.com/events/data_series?event=test_event&length=30&unit=day',
        headers: {
          'Authorization': 'Bearer test-key',
        },
        json: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].json.data).toHaveLength(1);
    });

    it('should handle analytics errors', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getEventAnalytics')
        .mockReturnValueOnce('invalid_event')
        .mockReturnValueOnce(30)
        .mockReturnValueOnce('day')
        .mockReturnValueOnce('');

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Event not found'));

      await expect(executeEventOperations.call(mockExecuteFunctions, [{ json: {} }]))
        .rejects.toThrow('Event not found');
    });
  });
});

describe('Template Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://rest.iad-01.braze.com'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Braze Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getAllEmailTemplates', () => {
    it('should retrieve email templates successfully', async () => {
      const mockResponse = {
        templates: [
          {
            email_template_id: 'template_123',
            template_name: 'Welcome Email',
            created_at: '2023-01-01T00:00:00Z'
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAllEmailTemplates')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTemplateOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://rest.iad-01.braze.com/templates/email/list',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        qs: {},
        json: true,
      });
    });

    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getAllEmailTemplates');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        executeTemplateOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('API Error');
    });
  });

  describe('createEmailTemplate', () => {
    it('should create email template successfully', async () => {
      const mockResponse = {
        email_template_id: 'template_123',
        message: 'success'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createEmailTemplate')
        .mockReturnValueOnce('Welcome Email')
        .mockReturnValueOnce('Welcome to our service')
        .mockReturnValueOnce('<h1>Welcome!</h1>');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTemplateOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://rest.iad-01.braze.com/templates/email/create',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          template_name: 'Welcome Email',
          subject: 'Welcome to our service',
          body: '<h1>Welcome!</h1>',
        },
        json: true,
      });
    });

    it('should handle creation errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('createEmailTemplate');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Creation failed'));

      await expect(
        executeTemplateOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Creation failed');
    });
  });

  describe('getEmailTemplate', () => {
    it('should retrieve email template details successfully', async () => {
      const mockResponse = {
        email_template_id: 'template_123',
        template_name: 'Welcome Email',
        subject: 'Welcome to our service',
        body: '<h1>Welcome!</h1>'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getEmailTemplate')
        .mockReturnValueOnce('template_123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTemplateOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://rest.iad-01.braze.com/templates/email/info',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        qs: {
          email_template_id: 'template_123',
        },
        json: true,
      });
    });

    it('should handle retrieval errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getEmailTemplate');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Template not found'));

      await expect(
        executeTemplateOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Template not found');
    });
  });

  describe('updateEmailTemplate', () => {
    it('should update email template successfully', async () => {
      const mockResponse = {
        message: 'success'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updateEmailTemplate')
        .mockReturnValueOnce('Updated Welcome Email')
        .mockReturnValueOnce('Updated subject')
        .mockReturnValueOnce('<h1>Updated content</h1>')
        .mockReturnValueOnce('template_123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTemplateOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://rest.iad-01.braze.com/templates/email/update',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          email_template_id: 'template_123',
          template_name: 'Updated Welcome Email',
          subject: 'Updated subject',
          body: '<h1>Updated content</h1>',
        },
        json: true,
      });
    });

    it('should handle update errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('updateEmailTemplate');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Update failed'));

      await expect(
        executeTemplateOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Update failed');
    });
  });
});
});
