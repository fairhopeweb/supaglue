---
sidebar_custom_props:
  icon: /img/connector_icons/ms_dynamics_365_sales.png
  category: 'CRM'
description: ''
---

# HubSpot

## Overview

Supaglue interfaces with the HubSpot V3 API.

| Feature                                          | Available |
| ------------------------------------------------ | --------- |
| Auth                                             | Yes       |
| Managed syncs (common, standard, custom objects) | Yes       |
| Point reads                                      | Yes       |
| Creates                                          | Yes       |
| Updates                                          | Yes       |
| Real-time events                                 | No        |

Supported common object types:

- Company
- Contact
- Deal
- User

Supported standard object types: `company`, `contact`, `deal`, `line_item`, `product`, `ticket`, `quote`, `call`, `communication`, `email`, `meeting`, `note`, `postal_mail`, `task`.

## Provider setup

import BrowserWindow from '@site/src/components/BrowserWindow';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To connect to your customers' HubSpot instances, you'll need to update the redirect URL to point to Supaglue and fetch the API access credentials in your [HubSpot developer account](https://developers.hubspot.com).

### Add Redirect URL to your HubSpot app.

Supaglue provides a redirect URL to send information to your app. To add the redirect URL to your HubSpot app:

1. Login to your HubSpot developer account: https://app.hubspot.com/developer
1. Navigate to your Public Application under "Apps" and go to the "Auth" tab.

    <BrowserWindow url="app.hubspot.com/developer/12345678/application/123456">

    ![hubspot_connected_app_oauth](/img/hubspot_connected_app_oauth.png 'hubspot connected app oauth')

    </BrowserWindow>

1. Under "Redirect URLs", paste Supaglue's redirect URL:

    <Tabs>
    <TabItem value="supaglue-cloud" label="Supaglue Cloud" default>

    ```
    https://api.supaglue.io/oauth/callback
    ```

    </TabItem>
    <TabItem value="localhost" label="Localhost">

    ```
    http://localhost:8080/oauth/callback
    ```
    </TabItem>
    </Tabs>

1. Check the following scopes under "Scopes":

    Required for reads:

    - `crm.objects.owners.read`
    - `crm.objects.companies.read`
    - `crm.lists.read`
    - `crm.objects.deals.read`
    - `crm.objects.contacts.read`
    - `crm.objects.custom.read` (required for custom objects)
    - `crm.schemas.custom.read` (required for custom objects)

    Required for writes:

    - `crm.objects.contacts.write`
    - `crm.objects.companies.write`
    - `crm.objects.deals.write`
    - `crm.lists.write`
    - `crm.objects.custom.write`
    - `crm.schemas.custom.write`

    :::info
    Supaglue requires a set of minimum scopes to support reads and writes to common model objects.
    :::

1. Click Save to update your changes.

### Fetch HubSpot Public App credentials

1. Copy the Consumer Key, Consumer Secret, and scopes (comma-separated), and paste them into the HubSpot configuration form in the management portal.

1. Copy the "Client ID" and "Client secret" values into the Supaglue Management Portal.
