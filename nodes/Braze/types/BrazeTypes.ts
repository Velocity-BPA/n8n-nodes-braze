/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

// User Types
export interface IBrazeUserAlias {
	alias_name: string;
	alias_label: string;
}

export interface IBrazeUserAttributes {
	external_id?: string;
	user_alias?: IBrazeUserAlias;
	braze_id?: string;
	email?: string;
	phone?: string;
	first_name?: string;
	last_name?: string;
	gender?: string;
	dob?: string;
	country?: string;
	home_city?: string;
	language?: string;
	time_zone?: string;
	email_subscribe?: string;
	push_subscribe?: string;
	[key: string]: unknown;
}

export interface IBrazeEvent {
	external_id?: string;
	user_alias?: IBrazeUserAlias;
	braze_id?: string;
	app_id?: string;
	name: string;
	time: string;
	properties?: IDataObject;
	_update_existing_only?: boolean;
}

export interface IBrazePurchase {
	external_id?: string;
	user_alias?: IBrazeUserAlias;
	braze_id?: string;
	app_id?: string;
	product_id: string;
	currency: string;
	price: number;
	quantity?: number;
	time: string;
	properties?: IDataObject;
	_update_existing_only?: boolean;
}

export interface IBrazeUserTrackRequest {
	attributes?: IBrazeUserAttributes[];
	events?: IBrazeEvent[];
	purchases?: IBrazePurchase[];
}

export interface IBrazeUserDeleteRequest {
	external_ids?: string[];
	user_aliases?: IBrazeUserAlias[];
	braze_ids?: string[];
}

export interface IBrazeUserMergeRequest {
	merge_updates: Array<{
		identifier_to_merge: {
			external_id?: string;
			user_alias?: IBrazeUserAlias;
		};
		identifier_to_keep: {
			external_id?: string;
			user_alias?: IBrazeUserAlias;
		};
	}>;
}

// Campaign Types
export interface IBrazeCampaign {
	id: string;
	name: string;
	description?: string;
	archived: boolean;
	draft: boolean;
	tags: string[];
	created_at: string;
	updated_at: string;
	schedule_type: string;
}

export interface IBrazeCampaignTriggerRequest {
	campaign_id: string;
	send_id?: string;
	trigger_properties?: IDataObject;
	broadcast?: boolean;
	audience?: IBrazeAudience;
	recipients?: IBrazeRecipient[];
}

export interface IBrazeCampaignScheduleRequest {
	campaign_id: string;
	send_id?: string;
	schedule: IBrazeSchedule;
	recipients?: IBrazeRecipient[];
	audience?: IBrazeAudience;
	broadcast?: boolean;
}

// Canvas Types
export interface IBrazeCanvas {
	id: string;
	name: string;
	description?: string;
	archived: boolean;
	draft: boolean;
	tags: string[];
	created_at: string;
	updated_at: string;
}

export interface IBrazeCanvasTriggerRequest {
	canvas_id: string;
	canvas_entry_properties?: IDataObject;
	broadcast?: boolean;
	audience?: IBrazeAudience;
	recipients?: IBrazeRecipient[];
}

export interface IBrazeCanvasScheduleRequest {
	canvas_id: string;
	schedule: IBrazeSchedule;
	recipients?: IBrazeRecipient[];
	audience?: IBrazeAudience;
	broadcast?: boolean;
}

// Message Types
export interface IBrazeMessage {
	apple_push?: IBrazeApplePush;
	android_push?: IBrazeAndroidPush;
	email?: IBrazeEmail;
	sms?: IBrazeSms;
	webhook?: IBrazeWebhook;
	content_card?: IBrazeContentCard;
}

export interface IBrazeApplePush {
	alert?: string | IBrazePushAlert;
	badge?: number;
	sound?: string;
	extra?: IDataObject;
	content_available?: boolean;
	mutable_content?: boolean;
	category?: string;
	thread_id?: string;
	target_content_id?: string;
}

export interface IBrazeAndroidPush {
	alert?: string;
	title?: string;
	extra?: IDataObject;
	message_variation_id?: string;
	notification_channel_id?: string;
	priority?: number;
	send_to_sync?: boolean;
	collapse_key?: string;
	sound?: string;
	custom_uri?: string;
}

export interface IBrazePushAlert {
	title?: string;
	body?: string;
	subtitle?: string;
}

export interface IBrazeEmail {
	app_id?: string;
	subject?: string;
	from?: string;
	reply_to?: string;
	body?: string;
	plaintext_body?: string;
	preheader?: string;
	email_template_id?: string;
	message_variation_id?: string;
	extras?: IDataObject;
	headers?: IDataObject;
	should_inline_css?: boolean;
	attachments?: IBrazeEmailAttachment[];
}

export interface IBrazeEmailAttachment {
	file_name: string;
	url: string;
}

export interface IBrazeSms {
	subscription_group_id: string;
	message_variation_id?: string;
	body: string;
	app_id?: string;
	media_items?: IBrazeSmsMediaItem[];
}

export interface IBrazeSmsMediaItem {
	url: string;
	content_type?: string;
}

export interface IBrazeWebhook {
	url: string;
	request_method?: string;
	request_headers?: IDataObject;
	body?: string;
	message_variation_id?: string;
}

export interface IBrazeContentCard {
	type: 'CLASSIC' | 'CAPTIONED_IMAGE' | 'BANNER';
	title?: string;
	description?: string;
	image_url?: string;
	url?: string;
	use_webview?: boolean;
	pinned?: boolean;
	dismissible?: boolean;
	extras?: IDataObject;
	message_variation_id?: string;
}

export interface IBrazeMessageSendRequest {
	external_user_ids?: string[];
	user_aliases?: IBrazeUserAlias[];
	segment_id?: string;
	audience?: IBrazeAudience;
	campaign_id?: string;
	send_id?: string;
	override_frequency_capping?: boolean;
	recipient_subscription_state?: 'all' | 'opted_in' | 'subscribed';
	messages?: IBrazeMessage;
}

export interface IBrazeMessageScheduleRequest {
	schedule: IBrazeSchedule;
	external_user_ids?: string[];
	user_aliases?: IBrazeUserAlias[];
	segment_id?: string;
	audience?: IBrazeAudience;
	campaign_id?: string;
	send_id?: string;
	override_frequency_capping?: boolean;
	recipient_subscription_state?: 'all' | 'opted_in' | 'subscribed';
	messages?: IBrazeMessage;
}

// Schedule Types
export interface IBrazeSchedule {
	time: string;
	in_local_time?: boolean;
	at_optimal_time?: boolean;
}

// Recipient Types
export interface IBrazeRecipient {
	external_user_id?: string;
	user_alias?: IBrazeUserAlias;
	trigger_properties?: IDataObject;
	canvas_entry_properties?: IDataObject;
	send_to_existing_only?: boolean;
	attributes?: IBrazeUserAttributes;
}

// Audience Types
export interface IBrazeAudience {
	AND?: IBrazeAudienceFilter[];
	OR?: IBrazeAudienceFilter[];
}

export interface IBrazeAudienceFilter {
	custom_attribute?: {
		custom_attribute_name: string;
		comparison: string;
		value?: unknown;
	};
	push_subscription_status?: {
		comparison: string;
		value: string;
	};
	email_subscription_status?: {
		comparison: string;
		value: string;
	};
	last_used_app?: {
		comparison: string;
		value: string;
	};
	[key: string]: unknown;
}

// Segment Types
export interface IBrazeSegment {
	id: string;
	name: string;
	analytics_tracking_enabled: boolean;
	tags: string[];
	created_at: string;
	updated_at: string;
}

export interface IBrazeSegmentExportRequest {
	segment_id: string;
	callback_endpoint?: string;
	fields_to_export?: string[];
	output_format?: 'csv' | 'json';
}

// Content Block Types
export interface IBrazeContentBlock {
	content_block_id: string;
	name: string;
	content: string;
	description?: string;
	state: 'active' | 'draft';
	tags?: string[];
	created_at: string;
	last_edited: string;
}

export interface IBrazeContentBlockCreateRequest {
	name: string;
	content: string;
	description?: string;
	state?: 'active' | 'draft';
	tags?: string[];
}

export interface IBrazeContentBlockUpdateRequest {
	content_block_id: string;
	name?: string;
	content?: string;
	description?: string;
	state?: 'active' | 'draft';
	tags?: string[];
}

// Template Types
export interface IBrazeEmailTemplate {
	email_template_id: string;
	template_name: string;
	description?: string;
	subject: string;
	preheader?: string;
	body: string;
	plaintext_body?: string;
	should_inline_css?: boolean;
	tags?: string[];
	created_at: string;
	updated_at: string;
}

export interface IBrazeEmailTemplateCreateRequest {
	template_name: string;
	subject: string;
	body: string;
	plaintext_body?: string;
	preheader?: string;
	should_inline_css?: boolean;
	tags?: string[];
}

export interface IBrazeLinkTemplate {
	link_template_id: string;
	template_name: string;
	link_template: string;
	description?: string;
	tags?: string[];
	created_at: string;
	updated_at: string;
}

// Subscription Group Types
export interface IBrazeSubscriptionGroup {
	id: string;
	name: string;
	channel: 'email' | 'sms';
	is_default?: boolean;
}

export interface IBrazeSubscriptionStatusRequest {
	subscription_group_id: string;
	subscription_state: 'subscribed' | 'unsubscribed';
	external_id?: string[];
	email?: string[];
	phone?: string[];
}

// Catalog Types
export interface IBrazeCatalog {
	name: string;
	description?: string;
	fields: IBrazeCatalogField[];
	num_items?: number;
	created_at: string;
	updated_at: string;
}

export interface IBrazeCatalogField {
	name: string;
	type: 'string' | 'number' | 'boolean' | 'time' | 'array';
}

export interface IBrazeCatalogItem {
	id: string;
	[key: string]: unknown;
}

export interface IBrazeCatalogCreateRequest {
	catalogs: Array<{
		name: string;
		description?: string;
		fields: IBrazeCatalogField[];
	}>;
}

// Preference Center Types
export interface IBrazePreferenceCenter {
	preference_center_id: string;
	name: string;
	preference_center_title?: string;
	preference_center_page_html?: string;
	confirmation_page_html?: string;
	state: 'active' | 'draft';
	created_at: string;
	updated_at: string;
}

export interface IBrazePreferenceCenterCreateRequest {
	name: string;
	preference_center_title?: string;
	preference_center_page_html?: string;
	confirmation_page_html?: string;
	state?: 'active' | 'draft';
	options?: IDataObject[];
}

// Custom Event Types
export interface IBrazeCustomEvent {
	name: string;
	description?: string;
	included_in_analytics_report?: boolean;
}

// API Response Types
export interface IBrazeApiResponse {
	message?: string;
	errors?: string[];
	[key: string]: unknown;
}

export interface IBrazeListResponse<T> {
	message?: string;
	errors?: string[];
	[key: string]: T[] | string | string[] | undefined;
}

// Trigger Event Types (for webhook trigger)
export type BrazeTriggerEventType =
	| 'campaign.sent'
	| 'campaign.converted'
	| 'canvas.entered'
	| 'canvas.exited'
	| 'user.identified'
	| 'subscription.changed'
	| 'email.sent'
	| 'email.opened'
	| 'email.clicked'
	| 'email.bounced'
	| 'push.sent'
	| 'push.opened'
	| 'sms.sent'
	| 'sms.delivered';
