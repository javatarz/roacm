#!/usr/bin/env node

/**
 * Migrates Disqus comments to GitHub Discussions for use with Giscus
 *
 * Prerequisites:
 * - Disqus XML export file
 * - GitHub Personal Access Token with repo and discussion write permissions
 * - Node.js with support for ES modules
 *
 * Usage:
 *   export GITHUB_TOKEN=your_token_here
 *   node scripts/migrate-disqus-to-giscus.mjs path/to/disqus-export.xml
 */

import { readFile } from 'fs/promises';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

const REPO_OWNER = 'javatarz';
const REPO_NAME = 'roacm';
const CATEGORY_ID = 'DIC_kwDOArPTUM4C0dle'; // Comments category

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable not set');
  console.error('Create a token at: https://github.com/settings/tokens/new?scopes=repo,write:discussion');
  process.exit(1);
}

const xmlFilePath = process.argv[2];
if (!xmlFilePath) {
  console.error('Usage: node migrate-disqus-to-giscus.mjs <path-to-disqus-export.xml>');
  process.exit(1);
}

/**
 * GraphQL query to create a discussion
 */
async function createDiscussion(title, body, repositoryId) {
  const mutation = `
    mutation CreateDiscussion($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
      createDiscussion(input: {
        repositoryId: $repositoryId
        categoryId: $categoryId
        title: $title
        body: $body
      }) {
        discussion {
          id
          number
          url
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        repositoryId,
        categoryId: CATEGORY_ID,
        title,
        body,
      },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`);
  }

  return result.data.createDiscussion.discussion;
}

/**
 * GraphQL query to add a comment to a discussion
 */
async function addCommentToDiscussion(discussionId, body) {
  const mutation = `
    mutation AddComment($discussionId: ID!, $body: String!) {
      addDiscussionComment(input: {
        discussionId: $discussionId
        body: $body
      }) {
        comment {
          id
          url
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        discussionId,
        body,
      },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`);
  }

  return result.data.addDiscussionComment.comment;
}

/**
 * Get repository ID
 */
async function getRepositoryId() {
  const query = `
    query GetRepo($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        id
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        owner: REPO_OWNER,
        name: REPO_NAME,
      },
    }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`);
  }

  return result.data.repository.id;
}

/**
 * Parse Disqus XML export
 */
function parseDisqusXML(xmlData) {
  const threads = {};
  const comments = [];

  // Extract threads
  if (xmlData.disqus.thread) {
    for (const thread of xmlData.disqus.thread) {
      const threadId = thread.$['dsq:id'];
      const link = thread.link?.[0];
      const title = thread.title?.[0];

      threads[threadId] = {
        link,
        title,
        comments: [],
      };
    }
  }

  // Extract comments
  if (xmlData.disqus.post) {
    for (const post of xmlData.disqus.post) {
      const threadId = post.thread?.[0]?.$?.['dsq:id'];
      const comment = {
        id: post.id?.[0],
        author: post.author?.[0]?.name?.[0] || 'Anonymous',
        authorEmail: post.author?.[0]?.email?.[0] || '',
        message: post.message?.[0] || '',
        createdAt: post.createdAt?.[0],
        parentId: post.parent?.[0]?.$?.['dsq:id'],
      };

      if (threadId && threads[threadId]) {
        threads[threadId].comments.push(comment);
      }
    }
  }

  return threads;
}

/**
 * Extract pathname from URL for matching
 */
function extractPathname(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return url;
  }
}

/**
 * Main migration function
 */
async function migrateDisqusToGiscus() {
  console.log('🚀 Starting Disqus to Giscus migration...\n');

  // Read and parse XML
  console.log(`📖 Reading Disqus export from: ${xmlFilePath}`);
  const xmlContent = await readFile(xmlFilePath, 'utf-8');
  const xmlData = await parseXML(xmlContent);

  console.log('📝 Parsing Disqus data...');
  const threads = parseDisqusXML(xmlData);
  const threadCount = Object.keys(threads).length;
  console.log(`Found ${threadCount} threads with comments\n`);

  if (threadCount === 0) {
    console.log('No threads found in export. Exiting.');
    return;
  }

  // Get repository ID
  console.log('🔍 Fetching repository information...');
  const repositoryId = await getRepositoryId();
  console.log(`Repository ID: ${repositoryId}\n`);

  // Migrate each thread
  let migratedCount = 0;
  let errorCount = 0;

  for (const [threadId, thread] of Object.entries(threads)) {
    if (thread.comments.length === 0) {
      console.log(`⏭️  Skipping thread "${thread.title}" (no comments)`);
      continue;
    }

    try {
      const pathname = extractPathname(thread.link);
      const discussionTitle = `${pathname}`;
      const initialBody = `_This discussion was migrated from Disqus_\n\n**Original page:** ${thread.link}`;

      console.log(`\n📌 Creating discussion: "${discussionTitle}"`);
      const discussion = await createDiscussion(discussionTitle, initialBody, repositoryId);
      console.log(`   ✅ Created: ${discussion.url}`);

      // Add comments
      for (const comment of thread.comments) {
        const commentBody = `**${comment.author}** wrote on ${comment.createdAt}:\n\n${comment.message}\n\n---\n_Migrated from Disqus_`;

        try {
          await addCommentToDiscussion(discussion.id, commentBody);
          console.log(`   💬 Added comment by ${comment.author}`);

          // Rate limiting: wait 1 second between comments
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`   ❌ Failed to add comment: ${error.message}`);
          errorCount++;
        }
      }

      migratedCount++;

      // Rate limiting: wait 2 seconds between discussions
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Failed to migrate thread "${thread.title}": ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n\n✨ Migration complete!`);
  console.log(`   ✅ Migrated: ${migratedCount} threads`);
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`);
  }
}

// Run migration
migrateDisqusToGiscus().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
