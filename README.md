This is a one-off script to close PRs with a special comment made on each one.
The script gets a list of all PRs currently labelled "scope: guide" which also 
have a "status: merge conflict" and "staus: needs update" label attached to them.
While iterating through the list of PRs, the script will still validate that a 
merge conflict exists (in case someone accidentally attached the label) before
closing and adding a comment.  
To execute this script:

1. Copy the `sample.env file` to the `.env` file and use your GitHub credentials
   where specified.
2. Running the script
  2.1 In the `.env` file you will need to set `PRODUCTION_RUN` to `false` if you
    just want to see which PRs will be closed with the applicable comment.  
    Setting `PRODUCTION_RUN` to `true` will actually close and comment on the PRs.
  2.2 Use the following command:
  > node close-guide-prs-with-merge-conflicts.js

3. You can view a log file created at the following location to see the actions
  taken on each PR.

> logs/<test|production>_close-guide-prs-with-merge-conflicts_xxxxx-xxxxx_datetime.JSON

**NOTE:** The xxxxx-xxxxx represents the starting and ending PR numbers in the 
log file name.
