# RevenueCat MCP Setup

This document explains how to set up RevenueCat MCP (Model Context Protocol) for AI-powered subscription management.

## Overview

RevenueCat MCP allows AI assistants to manage RevenueCat subscription configurations using natural language commands. This enables you to:
- Create subscription products
- Manage entitlements
- Configure offerings
- All without directly accessing the RevenueCat dashboard

## Setup Steps

### 1. Get Your RevenueCat API v2 Secret Key

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Navigate to **Project Settings** → **API Keys**
3. Create a new **API v2 Secret Key** (starts with `sk_`)
4. Copy the key - you'll need it in the next step

**⚠️ Important:** Use the **Secret Key** (starts with `sk_`), not the Public API Key (starts with `appl_` or `goog_`).

### 2. Configure MCP for Cursor

1. Copy the example file:
   ```bash
   cp mcp.json.example mcp.json
   ```

2. Edit `mcp.json` and replace `YOUR_REVENUECAT_API_V2_SECRET_KEY` with your actual secret key:
   ```json
   {
     "mcpServers": {
       "revenuecat": {
         "url": "https://mcp.revenuecat.ai/mcp",
         "headers": {
           "Authorization": "Bearer sk_your_actual_secret_key_here"
         }
       }
     }
   }
   ```

3. **Restart Cursor** for the changes to take effect.

### 3. Verify Setup

After restarting Cursor, you can test the MCP connection by asking the AI assistant:
- "Show me my RevenueCat project details"
- "List my RevenueCat products"
- "What offerings do I have configured?"

If configured correctly, the AI should be able to access your RevenueCat project information.

## Security Notes

- ✅ `mcp.json` is already in `.gitignore` - it won't be committed to version control
- ✅ Never commit your secret key to version control
- ✅ Use different API keys for different environments (development, staging, production)
- ✅ Rotate your API keys regularly

## Available MCP Commands

Once configured, you can use natural language commands like:

- **Products:**
  - "Create a monthly subscription product"
  - "List all my products"
  - "Update product pricing"

- **Entitlements:**
  - "Create a premium entitlement"
  - "Show my entitlements"

- **Offerings:**
  - "Create a new offering"
  - "Add products to my offering"
  - "List all offerings"

- **Project Management:**
  - "Show project details"
  - "Get project statistics"

## Troubleshooting

### "API Key not recognized" Error

- Make sure you're using the **API v2 Secret Key** (starts with `sk_`)
- Verify the key is correct in RevenueCat Dashboard
- Check that the key has the necessary permissions

### MCP Not Working

1. Verify `mcp.json` exists in the project root
2. Check the JSON syntax is valid
3. Restart Cursor completely
4. Check Cursor's MCP settings/preferences

### Connection Issues

- Ensure you have internet connectivity
- Verify the RevenueCat MCP endpoint is accessible: `https://mcp.revenuecat.ai/mcp`
- Check RevenueCat service status

## Additional Resources

- [RevenueCat MCP Documentation](https://www.revenuecat.com/docs/tools/mcp/setup)
- [RevenueCat API v2 Documentation](https://www.revenuecat.com/docs/api-v2)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)

## Current Configuration

The MCP configuration file (`mcp.json`) should be located at the project root and contain:

```json
{
  "servers": {
    "revenuecat": {
      "url": "https://mcp.revenuecat.ai/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SECRET_KEY"
      }
    }
  }
}
```

**Note:** The actual `mcp.json` file with your secret key is git-ignored for security.

