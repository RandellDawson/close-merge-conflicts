const { owner, repo, octokitConfig, octokitAuth } = require('../constants');
const octokit = require('@octokit/rest')(octokitConfig);
octokit.authenticate(octokitAuth);

const addComment = async (number, comment) => {
  const result = await octokit.issues.createComment({ owner, repo, number, body: comment })
  .catch((err) => {
    console.log(`PR #${number} had an error when trying to add a comment\n`);
    console.log(err);
  });
  return result;
};

module.exports = { addComment };
