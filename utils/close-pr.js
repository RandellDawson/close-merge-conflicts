const { owner, repo, octokitConfig, octokitAuth } = require('../constants');
const octokit = require('@octokit/rest')(octokitConfig);
octokit.authenticate(octokitAuth);

const closePR = async (number) => {
  let result;
  try {
    result = await octokit.pullRequests.update(
      { owner, repo, number, state: 'closed' }
    );
  }
  catch (err) {
    return { status: 'failed', error: err };
  }
  return result
    ? { status: 'success' }
    : { status: 'failed', error: 'Unable to close PR' };
};

module.exports = { closePR };