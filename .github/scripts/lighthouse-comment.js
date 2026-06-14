const fs = require('fs');

module.exports = async ({ github, context }) => {
  const reportPath = './test-suite/reports/lighthouse/manifest.json';
  if (!fs.existsSync(reportPath)) {
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(reportPath));
  const summary = manifest[0].summary;

  const comment = `## 🔦 Lighthouse Results

| Metric | Score |
|--------|-------|
| Performance | ${summary.performance * 100}% |
| Accessibility | ${summary.accessibility * 100}% |
| Best Practices | ${summary['best-practices'] * 100}% |
| SEO | ${summary.seo * 100}% |
`;

  await github.rest.issues.createComment({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    body: comment,
  });
};
