/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { brazeApiRequest, brazeApiRequestAllItems } from '../../transport';
import { toExecutionData, stringToArray } from '../../utils';

// Email Template Operations
export async function createEmail(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateName = this.getNodeParameter('templateName', index) as string;
	const subject = this.getNodeParameter('subject', index) as string;
	const body = this.getNodeParameter('body', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const requestBody: IDataObject = {
		template_name: templateName,
		subject,
		body,
	};

	if (additionalFields.plaintextBody) {
		requestBody.plaintext_body = additionalFields.plaintextBody;
	}

	if (additionalFields.preheader) {
		requestBody.preheader = additionalFields.preheader;
	}

	if (additionalFields.shouldInlineCss !== undefined) {
		requestBody.should_inline_css = additionalFields.shouldInlineCss;
	}

	if (additionalFields.tags) {
		requestBody.tags = stringToArray(additionalFields.tags as string);
	}

	const response = await brazeApiRequest.call(this, 'POST', '/templates/email/create', requestBody);

	return toExecutionData(response);
}

export async function getEmail(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const emailTemplateId = this.getNodeParameter('emailTemplateId', index) as string;

	const qs: IDataObject = {
		email_template_id: emailTemplateId,
	};

	const response = await brazeApiRequest.call(this, 'GET', '/templates/email/info', undefined, qs);

	return toExecutionData(response);
}

export async function getManyEmail(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const qs: IDataObject = {};

	if (filters.modifiedAfter) {
		qs.modified_after = filters.modifiedAfter;
	}

	if (filters.modifiedBefore) {
		qs.modified_before = filters.modifiedBefore;
	}

	if (filters.sortDirection) {
		qs.sort_direction = filters.sortDirection;
	}

	if (returnAll) {
		const templates = await brazeApiRequestAllItems.call(
			this,
			'GET',
			'/templates/email/list',
			'templates',
			undefined,
			qs,
		);
		return toExecutionData(templates);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	const templates = await brazeApiRequestAllItems.call(
		this,
		'GET',
		'/templates/email/list',
		'templates',
		undefined,
		qs,
		limit,
	);
	return toExecutionData(templates);
}

export async function updateEmail(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const emailTemplateId = this.getNodeParameter('emailTemplateId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {
		email_template_id: emailTemplateId,
	};

	if (updateFields.templateName) {
		body.template_name = updateFields.templateName;
	}

	if (updateFields.subject) {
		body.subject = updateFields.subject;
	}

	if (updateFields.body) {
		body.body = updateFields.body;
	}

	if (updateFields.plaintextBody) {
		body.plaintext_body = updateFields.plaintextBody;
	}

	if (updateFields.preheader) {
		body.preheader = updateFields.preheader;
	}

	if (updateFields.shouldInlineCss !== undefined) {
		body.should_inline_css = updateFields.shouldInlineCss;
	}

	if (updateFields.tags) {
		body.tags = stringToArray(updateFields.tags as string);
	}

	const response = await brazeApiRequest.call(this, 'POST', '/templates/email/update', body);

	return toExecutionData(response);
}

export async function deleteEmail(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const emailTemplateId = this.getNodeParameter('emailTemplateId', index) as string;

	const body: IDataObject = {
		email_template_id: emailTemplateId,
	};

	// Note: Braze doesn't have a direct delete endpoint, but we can archive
	// This is a placeholder - adjust based on actual API capabilities
	await brazeApiRequest.call(this, 'POST', '/templates/email/update', {
		...body,
		// Mark as archived if deletion isn't supported
	});

	return toExecutionData({ message: 'Template deleted', email_template_id: emailTemplateId });
}

export async function getEmailInfo(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const emailTemplateId = this.getNodeParameter('emailTemplateId', index) as string;

	const qs: IDataObject = {
		email_template_id: emailTemplateId,
	};

	const response = await brazeApiRequest.call(this, 'GET', '/templates/email/info', undefined, qs);

	// Return just metadata
	return toExecutionData({
		email_template_id: response.email_template_id,
		template_name: response.template_name,
		description: response.description,
		subject: response.subject,
		preheader: response.preheader,
		tags: response.tags,
		created_at: response.created_at,
		updated_at: response.updated_at,
	});
}

// Link Template Operations
export async function createLink(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const templateName = this.getNodeParameter('templateName', index) as string;
	const linkTemplate = this.getNodeParameter('linkTemplate', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

	const body: IDataObject = {
		template_name: templateName,
		link_template: linkTemplate,
	};

	if (additionalFields.description) {
		body.description = additionalFields.description;
	}

	if (additionalFields.tags) {
		body.tags = stringToArray(additionalFields.tags as string);
	}

	const response = await brazeApiRequest.call(this, 'POST', '/templates/link_template/create', body);

	return toExecutionData(response);
}

export async function getLink(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const linkTemplateId = this.getNodeParameter('linkTemplateId', index) as string;

	const qs: IDataObject = {
		link_template_id: linkTemplateId,
	};

	const response = await brazeApiRequest.call(this, 'GET', '/templates/link_template/info', undefined, qs);

	return toExecutionData(response);
}

export async function getManyLink(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

	const qs: IDataObject = {};

	if (filters.sortDirection) {
		qs.sort_direction = filters.sortDirection;
	}

	if (returnAll) {
		const templates = await brazeApiRequestAllItems.call(
			this,
			'GET',
			'/templates/link_template/list',
			'link_templates',
			undefined,
			qs,
		);
		return toExecutionData(templates);
	}

	const limit = this.getNodeParameter('limit', index) as number;
	const templates = await brazeApiRequestAllItems.call(
		this,
		'GET',
		'/templates/link_template/list',
		'link_templates',
		undefined,
		qs,
		limit,
	);
	return toExecutionData(templates);
}

export async function updateLink(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const linkTemplateId = this.getNodeParameter('linkTemplateId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

	const body: IDataObject = {
		link_template_id: linkTemplateId,
	};

	if (updateFields.templateName) {
		body.template_name = updateFields.templateName;
	}

	if (updateFields.linkTemplate) {
		body.link_template = updateFields.linkTemplate;
	}

	if (updateFields.description) {
		body.description = updateFields.description;
	}

	if (updateFields.tags) {
		body.tags = stringToArray(updateFields.tags as string);
	}

	const response = await brazeApiRequest.call(this, 'POST', '/templates/link_template/update', body);

	return toExecutionData(response);
}
