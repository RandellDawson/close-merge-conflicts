const { owner, repo, octokitConfig, octokitAuth } = require('../constants');

const octokit = require('@octokit/rest')(octokitConfig);

octokit.authenticate(octokitAuth);

const paginate = async function paginate(method, octokit, prPropsToGet) {

  const prFilter = (prs, prPropsToGet) => {
    const filtered = [];
    for (let pr of prs) {
      const propsObj = prPropsToGet.reduce((obj, prop) => {
        obj[prop] = pr[prop];
        return obj;
      }, {});
      filtered.push(propsObj);
    }
    return filtered;
  };

  const methodProps = {
    owner, repo, state: 'open',
    base: 'master', sort: 'created',
    direction: 'asc', page: 1, per_page: 100
  };

  let response = await method(methodProps);
  let { data } = response;
  data = prFilter(data, prPropsToGet);
  while (octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response);
    let dataFiltered = prFilter(response.data, prPropsToGet);
    data = data.concat(dataFiltered);
  }
  return data;
};

const getPRs = async (prPropsToGet) => {
  let openPRs = await paginate(octokit.pullRequests.list, octokit, prPropsToGet)
    .catch(err => console.log(err));
  return openPRs;
}

module.exports = { getPRs };
