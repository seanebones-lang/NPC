#!/usr/bin/env node

/**
 * Local MCP Server (stdio-based)
 * Runs locally and communicates with your Vercel app for agent queries
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// Configuration
const VERCEL_APP_URL = process.env.VERCEL_APP_URL || 'https://grokcode-30wnt049r-sean-mcdonnells-projects-4fbf31ab.vercel.app';
const API_KEY = process.env.API_KEY || '';

class GrokAgentMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'grok-agent-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'query_agent',
          description: 'Query your custom agent via the Vercel app for code suggestions, debugging, or planning',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'The query or prompt to send to the agent',
              },
              context: {
                type: 'string',
                description: 'Optional context or code snippet to include',
              },
            },
            required: ['prompt'],
          },
        },
        {
          name: 'git_review_and_commit',
          description: 'Generate smart commit message from git diff using agent analysis',
          inputSchema: {
            type: 'object',
            properties: {
              diff: {
                type: 'string',
                description: 'Git diff to analyze (optional, will fetch if not provided)',
              },
            },
          },
        },
        {
          name: 'process_browser_content',
          description: 'Process browser content through agent for analysis or summarization',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to process',
              },
              content: {
                type: 'string',
                description: 'Optional page content (will scrape if not provided)',
              },
              action: {
                type: 'string',
                enum: ['summarize', 'extract', 'analyze'],
                description: 'Action to perform on the content',
              },
            },
            required: ['url', 'action'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'query_agent':
            return await this.queryAgent(args.prompt, args.context);

          case 'git_review_and_commit':
            return await this.gitReviewAndCommit(args.diff);

          case 'process_browser_content':
            return await this.processBrowserContent(args.url, args.content, args.action);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'project://history',
          name: 'Project History',
          description: 'Recent project changes and history',
          mimeType: 'application/json',
        },
        {
          uri: 'project://context',
          name: 'Project Context',
          description: 'Project-specific context and preferences',
          mimeType: 'application/json',
        },
      ],
    }));

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        if (uri === 'project://history') {
          return await this.getProjectHistory();
        } else if (uri === 'project://context') {
          return await this.getProjectContext();
        } else {
          throw new Error(`Unknown resource: ${uri}`);
        }
      } catch (error) {
        throw new Error(`Failed to read resource ${uri}: ${error.message}`);
      }
    });
  }

  async queryAgent(prompt, context = '') {
    try {
      const response = await fetch(`${VERCEL_APP_URL}/api/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
        },
        body: JSON.stringify({
          prompt,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: data.response || data.message || JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to query agent: ${error.message}`);
    }
  }

  async gitReviewAndCommit(diff = null) {
    try {
      // If diff not provided, fetch it
      if (!diff) {
        const { execSync } = await import('child_process');
        diff = execSync('git diff', { encoding: 'utf-8' });
      }

      // Send to agent for review and commit message generation
      const response = await fetch(`${VERCEL_APP_URL}/api/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
        },
        body: diff,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: `Suggested commit message:\n\n${data.message || data.commitMessage}\n\n${data.review ? `Review:\n${data.review}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to review git diff: ${error.message}`);
    }
  }

  async processBrowserContent(url, content = null, action = 'summarize') {
    try {
      const response = await fetch(`${VERCEL_APP_URL}/api/process_page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
        },
        body: JSON.stringify({
          url,
          content,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: data.result || data.summary || JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to process browser content: ${error.message}`);
    }
  }

  async getProjectHistory() {
    try {
      const response = await fetch(`${VERCEL_APP_URL}/api/project/history`, {
        method: 'GET',
        headers: {
          ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        contents: [
          {
            uri: 'project://history',
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get project history: ${error.message}`);
    }
  }

  async getProjectContext() {
    try {
      const response = await fetch(`${VERCEL_APP_URL}/api/project/context`, {
        method: 'GET',
        headers: {
          ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        contents: [
          {
            uri: 'project://context',
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get project context: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Grok Agent MCP Server running on stdio');
  }
}

// Run the server
const server = new GrokAgentMCPServer();
server.run().catch(console.error);
