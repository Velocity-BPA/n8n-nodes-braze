# n8n-nodes-braze

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Braze, the leading customer engagement platform for personalized messaging across channels. This node enables workflow automation for user management, campaign orchestration, messaging, segmentation, content blocks, and analytics.

![n8n](https://img.shields.io/badge/n8n-community--node-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **11 Resource Categories** with 60+ operations
- **User Management**: Track attributes, events, purchases; manage aliases and identities
- **Campaign Orchestration**: Trigger, schedule, and analyze API-triggered campaigns
- **Canvas Management**: Control multi-step customer journeys
- **Multi-Channel Messaging**: Send push, email, SMS, webhooks, and content cards
- **Segmentation**: Create, manage, and export user segments
- **Content Blocks & Templates**: Manage reusable content components
- **Subscription Management**: Handle email and SMS subscription groups
- **Catalogs**: Manage product catalogs for personalization
- **Preference Centers**: Create and manage user preference pages
- **Custom Events**: Track and analyze custom event data
- **Multi-Cluster Support**: Works with all US and EU Braze clusters

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-braze`
5. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-braze
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-braze.git
cd n8n-nodes-braze

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-braze

# Restart n8n
```

## Credentials Setup

| Field | Description |
|-------|-------------|
| **API Key** | REST API Key from Braze dashboard (Settings > API Keys) |
| **Cluster** | Your Braze cluster (US-01 through US-0B, EU-01 through EU-03) |
| **Custom Endpoint** | Optional: Custom REST endpoint URL for dedicated infrastructure |

### Finding Your Cluster

1. Log into your Braze dashboard
2. Check the URL (e.g., `dashboard-01.braze.com` indicates US-01)
3. Or go to **Settings** → **APIs** → **SDK Endpoint**

## Resources & Operations

### User

| Operation | Description |
|-----------|-------------|
| Track | Track user attributes, events, and purchases |
| Identify | Alias user profiles |
| Delete | Delete users by external ID or alias |
| Get | Export user profile by identifier |
| Get by Segment | Export users from segment |
| Merge | Merge duplicate user profiles |
| New Alias | Create new user alias |
| Rename External ID | Rename user external ID |
| Remove External ID | Remove external ID from profile |
| Get Subscription Status | Get email/SMS subscription status |
| Set Subscription Status | Update subscription status |

### Campaign

| Operation | Description |
|-----------|-------------|
| Get Many | List campaigns |
| Get | Get campaign details |
| Get Analytics | Get campaign analytics |
| Trigger | Trigger API-triggered campaign |
| Schedule | Schedule campaign delivery |
| Update Schedule | Update scheduled campaign |
| Delete Schedule | Delete scheduled campaign |
| Get Send Info | Get send analytics |

### Canvas

| Operation | Description |
|-----------|-------------|
| Get Many | List canvases |
| Get | Get canvas details |
| Get Analytics | Get canvas analytics |
| Get Summary | Get canvas summary metrics |
| Trigger | Trigger API-triggered canvas |
| Schedule | Schedule canvas entry |
| Update Schedule | Update canvas schedule |
| Delete Schedule | Delete canvas schedule |
| Get Entry Steps | Get canvas entry steps |

### Message

| Operation | Description |
|-----------|-------------|
| Send | Send immediate message |
| Schedule | Schedule message |
| Update Schedule | Update scheduled message |
| Delete Schedule | Delete scheduled message |
| Get Live Activity | Get Live Activity status (iOS) |
| Update Live Activity | Update Live Activity |
| Send Transactional | Send transactional email |

### Segment

| Operation | Description |
|-----------|-------------|
| Get Many | List segments |
| Get | Get segment details |
| Get Analytics | Get segment analytics |
| Get Size | Get segment size |
| Export Users | Export segment users |
| Create | Create segment via API |

### Content Block

| Operation | Description |
|-----------|-------------|
| Create | Create content block |
| Get | Get content block details |
| Get Many | List content blocks |
| Update | Update content block |
| Get Info | Get content block metadata |

### Template

| Operation | Description |
|-----------|-------------|
| Create Email | Create email template |
| Get Email | Get email template |
| Get Many Email | List email templates |
| Update Email | Update email template |
| Delete Email | Delete email template |
| Get Email Info | Get email template metadata |
| Create Link | Create link template |
| Get Link | Get link template |
| Get Many Link | List link templates |
| Update Link | Update link template |

### Subscription Group

| Operation | Description |
|-----------|-------------|
| Get Many | List subscription groups |
| Get | Get subscription group status |
| Get Users | Get users in subscription group |
| Update Status | Update user subscription status |
| Get Global | Get user global subscription state |

### Catalog

| Operation | Description |
|-----------|-------------|
| Create | Create catalog |
| Get | Get catalog details |
| Get Many | List catalogs |
| Delete | Delete catalog |
| Create Items | Create catalog items |
| Get Item | Get catalog item |
| Get Items | List catalog items |
| Update Items | Update catalog items |
| Delete Items | Delete catalog items |
| Replace Items | Replace catalog items |

### Preference Center

| Operation | Description |
|-----------|-------------|
| Create | Create preference center |
| Get | Get preference center details |
| Get Many | List preference centers |
| Update | Update preference center |
| Get URL | Generate preference center URL |

### Custom Event

| Operation | Description |
|-----------|-------------|
| Get Many | List custom event names |
| Get Analytics | Get event analytics |
| Get Hourly Data | Get hourly event counts |
| Get Property Info | Get event property info |

## Trigger Node

The **Braze Trigger** node receives webhooks from Braze campaigns and Currents.

### Supported Events

- `campaign.sent` - Campaign message sent
- `campaign.converted` - Campaign conversion event
- `canvas.entered` - User entered canvas
- `canvas.exited` - User exited canvas
- `user.identified` - New user identified
- `subscription.changed` - Subscription status change
- `email.sent` / `email.opened` / `email.clicked` / `email.bounced`
- `push.sent` / `push.opened`
- `sms.sent` / `sms.delivered`

### Configuration

1. In Braze, create a Campaign with Webhook channel
2. Set the webhook URL to your n8n endpoint
3. Optionally add a verification token header

## Usage Examples

### Track User Event

```javascript
// Track a purchase event for a user
{
  "resource": "user",
  "operation": "track",
  "trackType": "purchases",
  "identifierType": "externalId",
  "identifierValue": "user_123",
  "purchasesUi": {
    "purchaseValues": [
      {
        "productId": "SKU-001",
        "currency": "USD",
        "price": 29.99,
        "quantity": 1
      }
    ]
  }
}
```

### Trigger Campaign

```javascript
// Trigger an API campaign with dynamic content
{
  "resource": "campaign",
  "operation": "trigger",
  "campaignId": "campaign_abc123",
  "recipients": "user_123,user_456",
  "triggerProperties": "{\"offer_code\": \"SAVE20\"}"
}
```

### Send Push Notification

```javascript
// Send push notification to users
{
  "resource": "message",
  "operation": "send",
  "messageType": "push",
  "externalUserIds": "user_123",
  "pushOptions": {
    "platform": "both",
    "alert": "Your order has shipped!",
    "title": "Order Update"
  }
}
```

## Braze Concepts

### User Identifiers

Braze supports multiple user identifier types:

- **External ID**: Your system's user ID (recommended primary identifier)
- **Braze ID**: Braze-generated internal user ID
- **User Alias**: Secondary identifier with name and label

### API-Triggered Campaigns vs Canvas

- **Campaigns**: Single-send messages with A/B testing
- **Canvas**: Multi-step customer journeys with branching logic

### Subscription States

- **opted_in**: User has explicitly opted in
- **subscribed**: User is subscribed (default state)
- **unsubscribed**: User has opted out

## Braze Clusters

| Cluster | REST API Endpoint |
|---------|-------------------|
| US-01 | rest.iad-01.braze.com |
| US-02 | rest.iad-02.braze.com |
| US-03 | rest.iad-03.braze.com |
| US-04 | rest.iad-04.braze.com |
| US-05 | rest.iad-05.braze.com |
| US-06 | rest.iad-06.braze.com |
| US-07 | rest.iad-07.braze.com |
| US-08 | rest.iad-08.braze.com |
| US-0A | rest.iad-0a.braze.com |
| US-0B | rest.iad-0b.braze.com |
| EU-01 | rest.fra-01.braze.eu |
| EU-02 | rest.fra-02.braze.eu |
| EU-03 | rest.fra-03.braze.eu |

## Rate Limits

- Default: 250,000 requests/hour (varies by contract)
- `/users/track`: 50,000 requests/minute
- `/messages/send`: 250 requests/minute
- Batch limits: 75 users per track request, 50 per delete

## Error Handling

The node handles common Braze API errors:

- **400**: Invalid parameters - check your input data
- **401**: Invalid API key - verify credentials
- **403**: Insufficient permissions - check API key permissions
- **404**: Resource not found - verify IDs
- **429**: Rate limited - reduce request frequency
- **500/503**: Server issues - retry with backoff

## Security Best Practices

1. **API Key Security**: Use workspace-scoped API keys with minimum required permissions
2. **Webhook Verification**: Always use verification tokens for trigger webhooks
3. **Data Minimization**: Only export fields you need
4. **PII Handling**: Be mindful of personal data in attributes and events

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Format code
npm run format
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-braze/issues)
- **Documentation**: [Braze API Docs](https://www.braze.com/docs/api/basics/)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [Braze](https://www.braze.com/) for their comprehensive API
- [n8n](https://n8n.io/) for the workflow automation platform
- The n8n community for inspiration and support
