# n8n-nodes-braze

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with Braze's customer engagement platform. With 7 resources and extensive operations, it enables automated customer lifecycle management, campaign orchestration, and personalized messaging workflows directly from your n8n automation platform.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Braze API](https://img.shields.io/badge/Braze-API%20v3-orange)
![Customer Engagement](https://img.shields.io/badge/Customer-Engagement-green)
![Marketing Automation](https://img.shields.io/badge/Marketing-Automation-purple)

## Features

- **User Management** - Create, update, delete, and track user profiles with custom attributes and events
- **Campaign Orchestration** - Launch, pause, and monitor email, push, and in-app messaging campaigns
- **Canvas Automation** - Manage multi-step customer journey workflows and trigger sequences
- **Audience Segmentation** - Create and manage dynamic user segments based on behavior and attributes
- **Message Personalization** - Send targeted messages across email, SMS, push, and in-app channels
- **Event Tracking** - Record custom events, purchases, and user interactions for behavioral targeting
- **Template Management** - Create and manage reusable email and message templates
- **Real-time Analytics** - Access campaign performance metrics and user engagement data

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-braze`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-braze
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-braze.git
cd n8n-nodes-braze
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-braze
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Braze REST API key with appropriate permissions | Yes |
| Instance URL | Your Braze instance URL (e.g., rest.iad-01.braze.com) | Yes |
| App ID | Your app identifier for app-specific operations | No |

## Resources & Operations

### 1. User

| Operation | Description |
|-----------|-------------|
| Create | Create a new user profile with attributes and events |
| Update | Update existing user attributes and custom properties |
| Get | Retrieve user profile information and engagement history |
| Delete | Remove user profile from your Braze workspace |
| Track Event | Record custom events for behavioral targeting |
| Track Purchase | Log purchase events with product details and revenue |
| Export | Export user data for analysis and compliance |

### 2. Campaign

| Operation | Description |
|-----------|-------------|
| Create | Create new email, push, or in-app messaging campaigns |
| Launch | Start campaign delivery to target audiences |
| Pause | Temporarily halt active campaign delivery |
| Resume | Restart paused campaign delivery |
| Get Details | Retrieve campaign configuration and performance metrics |
| List | Get all campaigns with filtering and pagination |
| Update | Modify campaign settings and targeting criteria |
| Delete | Remove campaign from workspace |

### 3. Canvas

| Operation | Description |
|-----------|-------------|
| Create | Build multi-step customer journey workflows |
| Launch | Activate canvas for user entry and progression |
| Pause | Stop canvas entry while preserving in-progress journeys |
| Resume | Restart canvas entry for new users |
| Get Details | Retrieve canvas configuration and performance data |
| List | Get all canvases with filtering options |
| Update | Modify canvas steps and entry criteria |
| Delete | Remove canvas from workspace |

### 4. Segment

| Operation | Description |
|-----------|-------------|
| Create | Build user segments based on attributes and behaviors |
| Update | Modify segment criteria and filters |
| Get Details | Retrieve segment definition and user count |
| List | Get all segments with metadata |
| Export Users | Export segment member list for analysis |
| Delete | Remove segment from workspace |

### 5. Message

| Operation | Description |
|-----------|-------------|
| Send | Deliver immediate messages to users or segments |
| Schedule | Schedule future message delivery |
| Get Status | Check delivery status and engagement metrics |
| Cancel | Cancel scheduled messages before delivery |
| Send Transactional | Send triggered transactional emails |
| Send Push | Deliver push notifications to mobile devices |
| Send SMS | Send SMS messages to user phone numbers |

### 6. Event

| Operation | Description |
|-----------|-------------|
| Track Custom | Record custom events for user behavior tracking |
| Track Purchase | Log purchase events with product and revenue data |
| Get Analytics | Retrieve event analytics and funnel data |
| List Events | Get all custom events with usage statistics |
| Update Properties | Modify event property definitions |
| Delete | Remove custom event definitions |

### 7. Template

| Operation | Description |
|-----------|-------------|
| Create | Design email and message templates |
| Update | Modify template content and styling |
| Get | Retrieve template HTML and configuration |
| List | Get all templates with metadata |
| Preview | Generate template preview with sample data |
| Duplicate | Create copies of existing templates |
| Delete | Remove templates from workspace |

## Usage Examples

```javascript
// Create a new user with custom attributes
{
  "external_id": "user_12345",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "custom_attributes": {
    "subscription_tier": "premium",
    "last_login": "2024-01-15T10:30:00Z",
    "total_purchases": 15
  }
}
```

```javascript
// Launch a promotional email campaign
{
  "campaign_id": "abc123-def456-ghi789",
  "send_id": "promo_spring_2024",
  "recipients": {
    "segment_id": "premium_users_segment"
  },
  "schedule": {
    "time": "2024-03-15T09:00:00Z",
    "in_local_time": true
  }
}
```

```javascript
// Track a purchase event with product details
{
  "external_id": "user_12345",
  "purchases": [{
    "product_id": "widget_pro_v2",
    "currency": "USD",
    "price": 49.99,
    "quantity": 2,
    "time": "2024-01-15T14:22:00Z",
    "properties": {
      "category": "widgets",
      "discount_applied": true
    }
  }]
}
```

```javascript
// Send immediate push notification
{
  "external_user_ids": ["user_12345", "user_67890"],
  "messages": {
    "apple_push": {
      "alert": "Your order has shipped! Track it now.",
      "badge": 1,
      "sound": "default",
      "custom": {
        "tracking_id": "TRK123456789"
      }
    }
  }
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and has required permissions |
| Rate Limit Exceeded | Too many requests sent in time window | Implement exponential backoff and respect rate limits |
| User Not Found | Specified user ID does not exist in workspace | Check external_id format or create user first |
| Campaign Already Launched | Cannot modify campaign that is already active | Pause campaign before making modifications |
| Invalid Segment Query | Segment filter criteria contains syntax errors | Review segment logic and field names |
| Template Validation Failed | Template HTML or content has formatting issues | Check template syntax and required fields |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-braze/issues)
- **Braze Documentation**: [Braze REST API Guide](https://www.braze.com/docs/api/basics/)
- **Braze Community**: [Braze Developer Community](https://community.braze.com/)