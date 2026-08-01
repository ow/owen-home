# Repository guidance

## Netlify branch deploys

After pushing a branch, use Netlify's public API to find its deploy URL. This repository uses Netlify branch deploys, not the `deploy-preview-<pr>` URL convention.

```bash
SITE_ID="$(curl -sS https://api.netlify.com/api/v1/sites/owenwillia.ms | jq -r '.id')"
BRANCH="$(git branch --show-current)"
HEAD_SHA="$(git rev-parse HEAD)"

curl -sS \
  "https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys?branch=$(printf %s "$BRANCH" | jq -sRr @uri)&per_page=20" \
  | jq --arg sha "$HEAD_SHA" \
      'map(select(.context == "branch-deploy" and .commit_ref == $sha))[0] | {state, commit_ref, deploy_ssl_url}'
```

Poll until `state` is `ready`, then return `deploy_ssl_url`. Filtering for `context == "branch-deploy"` matters after a pull request is opened because the newest deploy for the branch may instead be a `deploy-preview`. The unauthenticated endpoint works while the Netlify site and deploys are public; private sites require a Netlify access token.
