/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import * as user from './actions/user';
import * as campaign from './actions/campaign';
import * as canvas from './actions/canvas';
import * as message from './actions/message';
import * as segment from './actions/segment';
import * as contentBlock from './actions/contentBlock';
import * as template from './actions/template';
import * as subscriptionGroup from './actions/subscriptionGroup';
import * as catalog from './actions/catalog';
import * as preferenceCenter from './actions/preferenceCenter';
import * as customEvent from './actions/customEvent';

const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licenseNoticeEmitted = false;
if (!licenseNoticeEmitted) {
	console.warn(LICENSING_NOTICE);
	licenseNoticeEmitted = true;
}

export class Braze implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Braze',
		name: 'braze',
		icon: 'file:braze.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Braze customer engagement platform',
		defaults: {
			name: 'Braze',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'brazeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Campaign', value: 'campaign' },
					{ name: 'Canvas', value: 'canvas' },
					{ name: 'Catalog', value: 'catalog' },
					{ name: 'Content Block', value: 'contentBlock' },
					{ name: 'Custom Event', value: 'customEvent' },
					{ name: 'Message', value: 'message' },
					{ name: 'Preference Center', value: 'preferenceCenter' },
					{ name: 'Segment', value: 'segment' },
					{ name: 'Subscription Group', value: 'subscriptionGroup' },
					{ name: 'Template', value: 'template' },
					{ name: 'User', value: 'user' },
				],
				default: 'user',
			},
			// User Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['user'] } },
				options: [
					{ name: 'Delete', value: 'delete', description: 'Delete users', action: 'Delete users' },
					{ name: 'Get', value: 'get', description: 'Get user profile', action: 'Get user profile' },
					{ name: 'Get by Segment', value: 'getBySegment', description: 'Export users from segment', action: 'Export users from segment' },
					{ name: 'Get Subscription Status', value: 'getSubscriptionStatus', description: 'Get subscription status', action: 'Get subscription status' },
					{ name: 'Identify', value: 'identify', description: 'Alias user profiles', action: 'Alias user profiles' },
					{ name: 'Merge', value: 'merge', description: 'Merge duplicate profiles', action: 'Merge duplicate profiles' },
					{ name: 'New Alias', value: 'newAlias', description: 'Create new user alias', action: 'Create new user alias' },
					{ name: 'Remove External ID', value: 'removeExternalId', description: 'Remove external ID', action: 'Remove external ID' },
					{ name: 'Rename External ID', value: 'renameExternalId', description: 'Rename external ID', action: 'Rename external ID' },
					{ name: 'Set Subscription Status', value: 'setSubscriptionStatus', description: 'Update subscription status', action: 'Update subscription status' },
					{ name: 'Track', value: 'track', description: 'Track attributes, events, purchases', action: 'Track attributes events purchases' },
				],
				default: 'track',
			},
			// Campaign Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['campaign'] } },
				options: [
					{ name: 'Delete Schedule', value: 'deleteSchedule', description: 'Delete scheduled campaign', action: 'Delete scheduled campaign' },
					{ name: 'Get', value: 'get', description: 'Get campaign details', action: 'Get campaign details' },
					{ name: 'Get Analytics', value: 'getAnalytics', description: 'Get campaign analytics', action: 'Get campaign analytics' },
					{ name: 'Get Many', value: 'getMany', description: 'List campaigns', action: 'List campaigns' },
					{ name: 'Get Send Info', value: 'getSendInfo', description: 'Get send analytics', action: 'Get send analytics' },
					{ name: 'Schedule', value: 'schedule', description: 'Schedule campaign', action: 'Schedule campaign' },
					{ name: 'Trigger', value: 'trigger', description: 'Trigger campaign', action: 'Trigger campaign' },
					{ name: 'Update Schedule', value: 'updateSchedule', description: 'Update scheduled campaign', action: 'Update scheduled campaign' },
				],
				default: 'getMany',
			},
			// Canvas Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['canvas'] } },
				options: [
					{ name: 'Delete Schedule', value: 'deleteSchedule', description: 'Delete canvas schedule', action: 'Delete canvas schedule' },
					{ name: 'Get', value: 'get', description: 'Get canvas details', action: 'Get canvas details' },
					{ name: 'Get Analytics', value: 'getAnalytics', description: 'Get canvas analytics', action: 'Get canvas analytics' },
					{ name: 'Get Entry Steps', value: 'getEntrySteps', description: 'Get canvas entry steps', action: 'Get canvas entry steps' },
					{ name: 'Get Many', value: 'getMany', description: 'List canvases', action: 'List canvases' },
					{ name: 'Get Summary', value: 'getSummary', description: 'Get canvas summary', action: 'Get canvas summary' },
					{ name: 'Schedule', value: 'schedule', description: 'Schedule canvas', action: 'Schedule canvas' },
					{ name: 'Trigger', value: 'trigger', description: 'Trigger canvas', action: 'Trigger canvas' },
					{ name: 'Update Schedule', value: 'updateSchedule', description: 'Update canvas schedule', action: 'Update canvas schedule' },
				],
				default: 'getMany',
			},
			// Message Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['message'] } },
				options: [
					{ name: 'Delete Schedule', value: 'deleteSchedule', description: 'Delete scheduled message', action: 'Delete scheduled message' },
					{ name: 'Get Live Activity', value: 'getLiveActivity', description: 'Get Live Activity status', action: 'Get live activity status' },
					{ name: 'Schedule', value: 'schedule', description: 'Schedule message', action: 'Schedule message' },
					{ name: 'Send', value: 'send', description: 'Send immediate message', action: 'Send immediate message' },
					{ name: 'Send Transactional', value: 'sendTransactional', description: 'Send transactional email', action: 'Send transactional email' },
					{ name: 'Update Live Activity', value: 'updateLiveActivity', description: 'Update Live Activity', action: 'Update live activity' },
					{ name: 'Update Schedule', value: 'updateSchedule', description: 'Update scheduled message', action: 'Update scheduled message' },
				],
				default: 'send',
			},
			// Segment Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['segment'] } },
				options: [
					{ name: 'Create', value: 'create', description: 'Create segment', action: 'Create segment' },
					{ name: 'Export Users', value: 'exportUsers', description: 'Export segment users', action: 'Export segment users' },
					{ name: 'Get', value: 'get', description: 'Get segment details', action: 'Get segment details' },
					{ name: 'Get Analytics', value: 'getAnalytics', description: 'Get segment analytics', action: 'Get segment analytics' },
					{ name: 'Get Many', value: 'getMany', description: 'List segments', action: 'List segments' },
					{ name: 'Get Size', value: 'getSize', description: 'Get segment size', action: 'Get segment size' },
				],
				default: 'getMany',
			},
			// Content Block Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contentBlock'] } },
				options: [
					{ name: 'Create', value: 'create', description: 'Create content block', action: 'Create content block' },
					{ name: 'Get', value: 'get', description: 'Get content block', action: 'Get content block' },
					{ name: 'Get Info', value: 'getInfo', description: 'Get content block metadata', action: 'Get content block metadata' },
					{ name: 'Get Many', value: 'getMany', description: 'List content blocks', action: 'List content blocks' },
					{ name: 'Update', value: 'update', description: 'Update content block', action: 'Update content block' },
				],
				default: 'getMany',
			},
			// Template Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['template'] } },
				options: [
					{ name: 'Create Email', value: 'createEmail', description: 'Create email template', action: 'Create email template' },
					{ name: 'Create Link', value: 'createLink', description: 'Create link template', action: 'Create link template' },
					{ name: 'Delete Email', value: 'deleteEmail', description: 'Delete email template', action: 'Delete email template' },
					{ name: 'Get Email', value: 'getEmail', description: 'Get email template', action: 'Get email template' },
					{ name: 'Get Email Info', value: 'getEmailInfo', description: 'Get email template metadata', action: 'Get email template metadata' },
					{ name: 'Get Link', value: 'getLink', description: 'Get link template', action: 'Get link template' },
					{ name: 'Get Many Email', value: 'getManyEmail', description: 'List email templates', action: 'List email templates' },
					{ name: 'Get Many Link', value: 'getManyLink', description: 'List link templates', action: 'List link templates' },
					{ name: 'Update Email', value: 'updateEmail', description: 'Update email template', action: 'Update email template' },
					{ name: 'Update Link', value: 'updateLink', description: 'Update link template', action: 'Update link template' },
				],
				default: 'getManyEmail',
			},
			// Subscription Group Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['subscriptionGroup'] } },
				options: [
					{ name: 'Get', value: 'get', description: 'Get subscription group status', action: 'Get subscription group status' },
					{ name: 'Get Global', value: 'getGlobal', description: 'Get global subscription state', action: 'Get global subscription state' },
					{ name: 'Get Many', value: 'getMany', description: 'List subscription groups', action: 'List subscription groups' },
					{ name: 'Get Users', value: 'getUsers', description: 'Get users in subscription group', action: 'Get users in subscription group' },
					{ name: 'Update Status', value: 'updateStatus', description: 'Update subscription status', action: 'Update subscription status' },
				],
				default: 'getMany',
			},
			// Catalog Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['catalog'] } },
				options: [
					{ name: 'Create', value: 'create', description: 'Create catalog', action: 'Create catalog' },
					{ name: 'Create Items', value: 'createItems', description: 'Create catalog items', action: 'Create catalog items' },
					{ name: 'Delete', value: 'delete', description: 'Delete catalog', action: 'Delete catalog' },
					{ name: 'Delete Items', value: 'deleteItems', description: 'Delete catalog items', action: 'Delete catalog items' },
					{ name: 'Get', value: 'get', description: 'Get catalog details', action: 'Get catalog details' },
					{ name: 'Get Item', value: 'getItem', description: 'Get catalog item', action: 'Get catalog item' },
					{ name: 'Get Items', value: 'getItems', description: 'List catalog items', action: 'List catalog items' },
					{ name: 'Get Many', value: 'getMany', description: 'List catalogs', action: 'List catalogs' },
					{ name: 'Replace Items', value: 'replaceItems', description: 'Replace catalog items', action: 'Replace catalog items' },
					{ name: 'Update Items', value: 'updateItems', description: 'Update catalog items', action: 'Update catalog items' },
				],
				default: 'getMany',
			},
			// Preference Center Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['preferenceCenter'] } },
				options: [
					{ name: 'Create', value: 'create', description: 'Create preference center', action: 'Create preference center' },
					{ name: 'Get', value: 'get', description: 'Get preference center', action: 'Get preference center' },
					{ name: 'Get Many', value: 'getMany', description: 'List preference centers', action: 'List preference centers' },
					{ name: 'Get URL', value: 'getUrl', description: 'Generate preference center URL', action: 'Generate preference center url' },
					{ name: 'Update', value: 'update', description: 'Update preference center', action: 'Update preference center' },
				],
				default: 'getMany',
			},
			// Custom Event Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['customEvent'] } },
				options: [
					{ name: 'Get Analytics', value: 'getAnalytics', description: 'Get event analytics', action: 'Get event analytics' },
					{ name: 'Get Hourly Data', value: 'getHourlyData', description: 'Get hourly event counts', action: 'Get hourly event counts' },
					{ name: 'Get Many', value: 'getMany', description: 'List custom events', action: 'List custom events' },
					{ name: 'Get Property Info', value: 'getPropertyInfo', description: 'Get event property info', action: 'Get event property info' },
				],
				default: 'getMany',
			},
			// Common fields - will be in next file
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: INodeExecutionData[] = [];

				if (resource === 'user') {
					if (operation === 'track') responseData = await user.track.call(this, i);
					else if (operation === 'identify') responseData = await user.identify.call(this, i);
					else if (operation === 'delete') responseData = await user.deleteUser.call(this, i);
					else if (operation === 'get') responseData = await user.get.call(this, i);
					else if (operation === 'getBySegment') responseData = await user.getBySegment.call(this, i);
					else if (operation === 'merge') responseData = await user.merge.call(this, i);
					else if (operation === 'newAlias') responseData = await user.newAlias.call(this, i);
					else if (operation === 'renameExternalId') responseData = await user.renameExternalId.call(this, i);
					else if (operation === 'removeExternalId') responseData = await user.removeExternalId.call(this, i);
					else if (operation === 'getSubscriptionStatus') responseData = await user.getSubscriptionStatus.call(this, i);
					else if (operation === 'setSubscriptionStatus') responseData = await user.setSubscriptionStatus.call(this, i);
				} else if (resource === 'campaign') {
					if (operation === 'getMany') responseData = await campaign.getMany.call(this, i);
					else if (operation === 'get') responseData = await campaign.get.call(this, i);
					else if (operation === 'getAnalytics') responseData = await campaign.getAnalytics.call(this, i);
					else if (operation === 'trigger') responseData = await campaign.trigger.call(this, i);
					else if (operation === 'schedule') responseData = await campaign.schedule.call(this, i);
					else if (operation === 'updateSchedule') responseData = await campaign.updateSchedule.call(this, i);
					else if (operation === 'deleteSchedule') responseData = await campaign.deleteSchedule.call(this, i);
					else if (operation === 'getSendInfo') responseData = await campaign.getSendInfo.call(this, i);
				} else if (resource === 'canvas') {
					if (operation === 'getMany') responseData = await canvas.getMany.call(this, i);
					else if (operation === 'get') responseData = await canvas.get.call(this, i);
					else if (operation === 'getAnalytics') responseData = await canvas.getAnalytics.call(this, i);
					else if (operation === 'getSummary') responseData = await canvas.getSummary.call(this, i);
					else if (operation === 'trigger') responseData = await canvas.trigger.call(this, i);
					else if (operation === 'schedule') responseData = await canvas.schedule.call(this, i);
					else if (operation === 'updateSchedule') responseData = await canvas.updateSchedule.call(this, i);
					else if (operation === 'deleteSchedule') responseData = await canvas.deleteSchedule.call(this, i);
					else if (operation === 'getEntrySteps') responseData = await canvas.getEntrySteps.call(this, i);
				} else if (resource === 'message') {
					if (operation === 'send') responseData = await message.send.call(this, i);
					else if (operation === 'schedule') responseData = await message.schedule.call(this, i);
					else if (operation === 'updateSchedule') responseData = await message.updateSchedule.call(this, i);
					else if (operation === 'deleteSchedule') responseData = await message.deleteSchedule.call(this, i);
					else if (operation === 'getLiveActivity') responseData = await message.getLiveActivity.call(this, i);
					else if (operation === 'updateLiveActivity') responseData = await message.updateLiveActivity.call(this, i);
					else if (operation === 'sendTransactional') responseData = await message.sendTransactional.call(this, i);
				} else if (resource === 'segment') {
					if (operation === 'getMany') responseData = await segment.getMany.call(this, i);
					else if (operation === 'get') responseData = await segment.get.call(this, i);
					else if (operation === 'getAnalytics') responseData = await segment.getAnalytics.call(this, i);
					else if (operation === 'getSize') responseData = await segment.getSize.call(this, i);
					else if (operation === 'exportUsers') responseData = await segment.exportUsers.call(this, i);
					else if (operation === 'create') responseData = await segment.create.call(this, i);
				} else if (resource === 'contentBlock') {
					if (operation === 'create') responseData = await contentBlock.create.call(this, i);
					else if (operation === 'get') responseData = await contentBlock.get.call(this, i);
					else if (operation === 'getMany') responseData = await contentBlock.getMany.call(this, i);
					else if (operation === 'update') responseData = await contentBlock.update.call(this, i);
					else if (operation === 'getInfo') responseData = await contentBlock.getInfo.call(this, i);
				} else if (resource === 'template') {
					if (operation === 'createEmail') responseData = await template.createEmail.call(this, i);
					else if (operation === 'getEmail') responseData = await template.getEmail.call(this, i);
					else if (operation === 'getManyEmail') responseData = await template.getManyEmail.call(this, i);
					else if (operation === 'updateEmail') responseData = await template.updateEmail.call(this, i);
					else if (operation === 'deleteEmail') responseData = await template.deleteEmail.call(this, i);
					else if (operation === 'getEmailInfo') responseData = await template.getEmailInfo.call(this, i);
					else if (operation === 'createLink') responseData = await template.createLink.call(this, i);
					else if (operation === 'getLink') responseData = await template.getLink.call(this, i);
					else if (operation === 'getManyLink') responseData = await template.getManyLink.call(this, i);
					else if (operation === 'updateLink') responseData = await template.updateLink.call(this, i);
				} else if (resource === 'subscriptionGroup') {
					if (operation === 'getMany') responseData = await subscriptionGroup.getMany.call(this, i);
					else if (operation === 'get') responseData = await subscriptionGroup.get.call(this, i);
					else if (operation === 'getUsers') responseData = await subscriptionGroup.getUsers.call(this, i);
					else if (operation === 'updateStatus') responseData = await subscriptionGroup.updateStatus.call(this, i);
					else if (operation === 'getGlobal') responseData = await subscriptionGroup.getGlobal.call(this, i);
				} else if (resource === 'catalog') {
					if (operation === 'create') responseData = await catalog.create.call(this, i);
					else if (operation === 'get') responseData = await catalog.get.call(this, i);
					else if (operation === 'getMany') responseData = await catalog.getMany.call(this, i);
					else if (operation === 'delete') responseData = await catalog.deleteCatalog.call(this, i);
					else if (operation === 'createItems') responseData = await catalog.createItems.call(this, i);
					else if (operation === 'getItem') responseData = await catalog.getItem.call(this, i);
					else if (operation === 'getItems') responseData = await catalog.getItems.call(this, i);
					else if (operation === 'updateItems') responseData = await catalog.updateItems.call(this, i);
					else if (operation === 'deleteItems') responseData = await catalog.deleteItems.call(this, i);
					else if (operation === 'replaceItems') responseData = await catalog.replaceItems.call(this, i);
				} else if (resource === 'preferenceCenter') {
					if (operation === 'create') responseData = await preferenceCenter.create.call(this, i);
					else if (operation === 'get') responseData = await preferenceCenter.get.call(this, i);
					else if (operation === 'getMany') responseData = await preferenceCenter.getMany.call(this, i);
					else if (operation === 'update') responseData = await preferenceCenter.update.call(this, i);
					else if (operation === 'getUrl') responseData = await preferenceCenter.getUrl.call(this, i);
				} else if (resource === 'customEvent') {
					if (operation === 'getMany') responseData = await customEvent.getMany.call(this, i);
					else if (operation === 'getAnalytics') responseData = await customEvent.getAnalytics.call(this, i);
					else if (operation === 'getHourlyData') responseData = await customEvent.getHourlyData.call(this, i);
					else if (operation === 'getPropertyInfo') responseData = await customEvent.getPropertyInfo.call(this, i);
				}

				returnData.push(...responseData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
