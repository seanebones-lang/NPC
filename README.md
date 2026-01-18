# Cursor MCP Integration for Custom Agent Routing

This integration enables Cursor to use your custom agents (via your Vercel app) through the Model Context Protocol (MCP). It provides tools and resources that route queries through `https://grokcode-30wnt049r-sean-mcdonnells-projects-4fbf31ab.vercel.app`.

## Features

### 1. Agent Query Tool
- Query your custom agents directly from Cursor's chat/composer
- Routes through your Vercel app for consistent agent behavior
- Supports context and code snippets

### 2. Git Workflow Enhancer
- Smart commit message generation from git diffs
- Agent-powered code review suggestions
- Integrates with your existing git workflow

### 3. Project Context Provider (MCP Resource)
- Provides project history and context to Cursor
- Reduces repetitive explanations
- Dynamic context from your app

### 4. Browser Automation Booster
- Process browser content through your agents
- Summarize, extract, or analyze web pages
- Enhances Cursor's browser automation capabilities

## Setup

### Option 1: Local MCP Server (stdio)

1. **Install dependencies:**
   ```bash
   cd cursor-mcp-integration
   npm install
   ```

2. **Configure Cursor:**
   - Copy `.cursor/mcp.json` to your project's `.cursor/` directory or `~/.cursor/mcp.json` for global config
   - Update the path in `mcp.json` to match your installation
   - Set environment variable `API_KEY` if needed

3. **Test the server:**
   ```bash
   npm run dev
   ```

### Option 2: Remote MCP Server (HTTP/SSE)

1. **Deploy to Vercel:**
   - Copy the `vercel-integration/` folder contents to your Next.js app
   - Deploy to Vercel

2. **Configure Cursor:**
   - Copy `.cursor/mcp-remote.json` to your project's `.cursor/` directory or `~/.cursor/mcp.json`
   - Update the URL in `mcp-remote.json` if needed
   - Set environment variable `API_KEY`

3. **Implement Agent Logic:**
   - Update placeholder functions in the API routes with your actual agent implementations
   - Integrate with Grok API or your custom agent service

## Configuration

### Environment Variables

Set these in your environment or `.env` file:

```bash
VERCEL_APP_URL=https://grokcode-30wnt049r-sean-mcdonnells-projects-4fbf31ab.vercel.app
API_KEY=your_api_key_here  # Optional, for authentication
```

### Cursor MCP Configuration

**Local (stdio):**
```json
{
  "mcpServers": {
    "grok-agent-mcp": {
      "command": "node",
      "args": ["/path/to/cursor-mcp-integration/server/local-mcp-server.js"],
      "env": {
        "VERCEL_APP_URL": "https://grokcode-30wnt049r-sean-mcdonnells-projects-4fbf31ab.vercel.app",
        "API_KEY": "${env:API_KEY}"
      }
    }
  }
}
```

**Remote (HTTP/SSE):**
```json
{
  "mcpServers": {
    "grok-agent-mcp-remote": {
      "url": "https://grokcode-30wnt049r-sean-mcdonnells-projects-4fbf31ab.vercel.app/mcp",
      "headers": {
        "Authorization": "Bearer ${env:API_KEY}"
      }
    }
  }
}
```

## Usage in Cursor

### Tools

Once configured, you can use these tools in Cursor's chat:

1. **query_agent**: Ask questions or request code help
   - Example: "Use query_agent to help me debug this React component"

2. **git_review_and_commit**: Generate commit messages
   - Example: "Use git_review_and_commit to analyze my changes"

3. **process_browser_content**: Process web pages
   - Example: "Use process_browser_content to summarize this documentation"

### Resources

Access project context in Cursor:

- `@project://history` - Recent project changes
- `@project://context` - Project preferences and notes

Example: "What are the recent changes? @project://history"

## API Endpoints (for Vercel Integration)

The following endpoints should be implemented in your Vercel app:

- `POST /api/agent` - Handle agent queries
- `POST /api/review` - Review git diffs
- `POST /api/process_page` - Process browser content
- `GET /api/project/history` - Get project history
- `GET /api/project/context` - Get project context
- `POST /mcp` - MCP protocol endpoint (if using remote)

## Implementation Notes

### Placeholder Functions

The Vercel integration files contain `TODO` comments where you need to:

1. **Integrate your agent API** - Replace placeholder agent calls with your actual implementation
2. **Database/storage** - Implement data fetching for project history and context
3. **Authentication** - Add proper auth handling if needed
4. **Error handling** - Enhance error handling for production use

### Testing

1. Test MCP server locally: `npm run dev`
2. Test API routes: Use curl or Postman to hit your Vercel endpoints
3. Test in Cursor: Enable MCP in Cursor settings and try using tools in chat

## Security Considerations

- Store API keys in environment variables, not in code
- Use HTTPS for all remote MCP connections
- Implement proper authentication/authorization in API routes
- Validate and sanitize all inputs
- Rate limit API endpoints to prevent abuse

## Troubleshooting

### MCP Server Not Connecting

- Check Cursor logs: `Cmd/Ctrl + Shift + P` → "Output" → "MCP"
- Verify the path in `mcp.json` is correct
- Ensure Node.js is in PATH
- Check environment variables are set

### API Errors

- Verify your Vercel app is deployed and accessible
- Check API route responses in Vercel logs
- Ensure CORS is configured if needed
- Verify authentication headers if using API keys

### Tools Not Appearing

- Restart Cursor after changing MCP configuration
- Check MCP server is running (for local stdio)
- Verify tool definitions match MCP protocol spec

## Next Steps

1. **Customize Agent Logic**: Replace placeholder functions with your actual agent implementations
2. **Add More Tools**: Extend the tool list with additional capabilities
3. **Enhance Resources**: Add more project context resources as needed
4. **Production Hardening**: Add error handling, logging, monitoring

## Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [Cursor MCP Documentation](https://docs.cursor.com)
- Your Vercel App: https://grokcode-30wnt049r-sean-mcdonnells-projects-4fbf31ab.vercel.app
