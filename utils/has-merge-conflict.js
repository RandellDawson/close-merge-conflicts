const { rateLimiter } = require('./rate-limiter');
const { owner, repo, octokitConfig, octokitAuth } = require('../constants');
const octokit = require('@octokit/rest')(octokitConfig);
octokit.authenticate(octokitAuth);

const displayCatchError = (number, err) => {
  console.log(`Trouble retrieving PR #${number}\n${err}`);
};

const hasMergeConflict = async (number) => {
  let result;
  try {
    result = await octokit.pullRequests.get({ owner, repo, number });
  } 
  catch (err) {
    displayCatchError(number, err);
    return false;
  }
  let mergeableState = result ? result.data.mergeable_state : null;

  if (mergeableState === 'unknown') {
    // needs more time to let GitHub perform a test merge
    await rateLimiter(4000);
    try {
      result = await octokit.pullRequests.get({ owner, repo, number });
    }
    catch (err) {
      displayCatchError(number, err);
      return false;
    }
    mergeableState = result ? result.data.mergeable_state : null;
  }
  return mergeableState === 'dirty'
};

module.exports = { hasMergeConflict };