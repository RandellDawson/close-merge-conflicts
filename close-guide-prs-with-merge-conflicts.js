require('dotenv').config();
const dedent = require("dedent");

const { 
  ProcessingLog, rateLimiter, getPRs, addComment, closePR, hasMergeConflict
} = require('./utils');

const customComment = dedent`
  We are restructuring a lot of the code and learning resources referenced in your pull request, so for now I am going to go ahead and close this pull request. Thanks again for opening this pull request and for contributing to the community.
`;

const log = new ProcessingLog('close-guide-prs-with-merge-conflicts');

const mode = process.env.PRODUCTION_RUN === 'true'
  ? 'Production' 
  : 'Test';

console.log(`script started in ${mode} mode...`);
log.start();

['SIGTERM', 'SIGINT', 'SIGKILL', 'SIGQUIT', 'uncaughtException'].forEach(signal => {
  process.on(signal, () => {
    log.finish();
    console.log('script was stopped prematurely');
    process.exit();
  });
});

(async () => {
  const prPropsToGet = ['number', 'labels'];
  return await getPRs(prPropsToGet);
})()
  .then(async (prs) => {
    const guidePrsWithMergeConflicts = prs.filter(({ labels }) => {
      const matchConditions = [
        'scope: guide',
        'status: merge conflict',
        'status: needs update'
      ];
      return matchConditions.every(
        label => labels.find(({ name }) => name === label)
      );
    });
    for (let { number, labels } of guidePrsWithMergeConflicts) {
      const conflict = await hasMergeConflict(number);
      const labelNames = labels.map(({ name }) => name);
      let data = { labels: labelNames, hasMergeConflict: conflict };
      let closed = false;
      let commentAdded = false;

      if (process.env.PRODUCTION_RUN === 'true' && conflict) {
        await rateLimiter(1000);
        const closeResult = await closePR(number);
        if (closeResult.status === 'success') {
          closed = true;
          data = { ...data, closed }
          const addCommentResult = await addComment(number, customComment);
          if (addCommentResult) {
            commentAdded = true;
          }
        } else {
          data = { ...data, closed, error: closeResult.error }
        }
        await rateLimiter();
      }
      data = { ...data, commentAdded };
      log.add(number, data);
    }
  })
  .then(() => {
    log.finish();
    console.log('script completed successfully');
  })
  .catch(err => {
    log.finish();
    console.log('script did not complete successfully');
    console.log(err);
  })
