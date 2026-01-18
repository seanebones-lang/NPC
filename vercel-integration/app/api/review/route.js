/**
 * Next.js API Route for Git Diff Review
 * Accepts git diff as plain text and returns commit message + review
 */

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const diff = await request.text();

    if (!diff) {
      return NextResponse.json(
        { error: 'Git diff is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual agent implementation
    const review = await analyzeGitDiff(diff);

    return NextResponse.json({
      commitMessage: review.commitMessage,
      review: review.analysis,
      suggestions: review.suggestions || [],
    });
  } catch (error) {
    console.error('Git review error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function analyzeGitDiff(diff) {
  // TODO: Use your agent to analyze the git diff
  // This could use LLM to generate smart commit messages
  
  // Placeholder implementation
  const lines = diff.split('\n');
  const additions = lines.filter(line => line.startsWith('+') && !line.startsWith('+++')).length;
  const deletions = lines.filter(line => line.startsWith('-') && !line.startsWith('---')).length;

  return {
    commitMessage: generateCommitMessage(diff),
    analysis: `Changes: ${additions} additions, ${deletions} deletions`,
    suggestions: [],
  };
}

function generateCommitMessage(diff) {
  // TODO: Use your agent/LLM to generate smart commit messages
  // Placeholder: simple heuristic
  if (diff.includes('feat') || diff.includes('add')) {
    return 'feat: add new feature';
  } else if (diff.includes('fix')) {
    return 'fix: resolve issue';
  } else if (diff.includes('refactor')) {
    return 'refactor: improve code structure';
  }
  return 'chore: update code';
}
