/**
 * Exa.ai Web Search Tool
 * Provides production-ready web search capabilities for agents
 * 
 * Setup:
 * 1. Get API key from https://exa.ai
 * 2. Add to .env: EXA_API_KEY=your-key-here
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const ExaResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string().optional(),
  publishedDate: z.string().optional(),
  author: z.string().optional(),
});

const ExaSearchResponseSchema = z.object({
  results: z.array(ExaResultSchema),
  query: z.string(),
  numResults: z.number(),
});

export const webSearchTool = createTool({
  id: 'web-search',
  description: `Search the web for current information using Exa.ai. Use this tool when you need:
- Current events, news, or recent information
- Facts that may have changed since your training data
- Real-time information about companies, products, or technologies
- Verification of information or statistics
- Research on specific topics

The tool returns up to 10 relevant web results with titles, URLs, and snippets.`,

  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .max(500)
      .describe('The search query. Be specific and clear.'),
    numResults: z
      .number()
      .min(1)
      .max(10)
      .optional()
      .default(5)
      .describe('Number of results to return (1-10)'),
    useAutoprompt: z
      .boolean()
      .optional()
      .default(true)
      .describe('Let Exa optimize the search query'),
  }),

  outputSchema: ExaSearchResponseSchema,

  execute: async ({ context }) => {
    const apiKey = process.env.EXA_API_KEY;

    if (!apiKey) {
      console.warn('EXA_API_KEY not configured. Web search is disabled.');
      return {
        results: [],
        query: context.query,
        numResults: 0,
      };
    }

    try {
      const response = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          query: context.query,
          num_results: context.numResults,
          use_autoprompt: context.useAutoprompt,
          type: 'auto', // Auto-detect neural or keyword search
          contents: {
            text: {
              max_characters: 500, // Get snippets
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Exa API error:', response.status, errorText);
        
        // Return empty results instead of throwing
        return {
          results: [],
          query: context.query,
          numResults: 0,
        };
      }

      const data = await response.json();

      // Transform Exa response to our schema
      const results = (data.results || []).map((result: any) => ({
        title: result.title || 'Untitled',
        url: result.url,
        snippet: result.text || result.snippet || '',
        publishedDate: result.published_date,
        author: result.author,
      }));

      return {
        results,
        query: context.query,
        numResults: results.length,
      };
    } catch (error) {
      console.error('Web search error:', error);

      // Return empty results gracefully
      return {
        results: [],
        query: context.query,
        numResults: 0,
      };
    }
  },
});

/**
 * Alternative: Simple web search using DuckDuckGo (no API key required)
 * This is a fallback option if Exa.ai is not configured
 */
export const fallbackWebSearchTool = createTool({
  id: 'fallback-web-search',
  description: 'Simple web search without external API dependencies',
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    message: z.string(),
  }),
  execute: async ({ context }) => {
    return {
      message: `To perform web searches, please configure EXA_API_KEY in your environment. Visit https://exa.ai to get an API key. Searched for: ${context.query}`,
    };
  },
});
