# Repository guidance

## Netlify branch deploys

After pushing a branch, use the authenticated Netlify CLI to find its deploy URL. This repository uses Netlify branch deploys, not the `deploy-preview-<pr>` URL convention.

One-time setup:

```bash
npm install --global netlify-cli
netlify login
netlify link --id 04cbea43-9305-440d-afdb-a5d6b8ed2702
```

`netlify link` creates local metadata in `.netlify/`, which is intentionally ignored by Git. It links this checkout to the existing `festive-yonath-89aaee` site; do not create a new Netlify site.

Query the current branch and commit:

```bash
SITE_ID='04cbea43-9305-440d-afdb-a5d6b8ed2702'
BRANCH="$(git branch --show-current)"
HEAD_SHA="$(git rev-parse HEAD)"

DEPLOYS="$(netlify api listSiteDeploys --data "$(
  jq -nc \
    --arg site_id "$SITE_ID" \
    --arg branch "$BRANCH" \
    '{site_id: $site_id, branch: $branch, per_page: 20}'
)")"

printf '%s\n' "$DEPLOYS" \
  | jq --arg sha "$HEAD_SHA" \
      'map(select(.context == "branch-deploy" and .commit_ref == $sha))[0]
       | {state, commit_ref, deploy_ssl_url, permalink: .links.permalink}'
```

Poll until `state` is `ready`. Filtering for `context == "branch-deploy"` matters after a pull request is opened because the newest deploy for the branch may instead be a `deploy-preview`.

Before returning a URL, open the immutable `permalink` in a real browser and verify that the expected portfolio page title and content render. Do not treat an HTTP `200`, a `ready` API state, or HTML fetched by `curl` alone as proof: Netlify can render its own `Site not found` page. Return only a URL that passed the browser check. `netlify deploy` creates a new draft deploy, so do not use it merely to look up an existing Git branch deploy.

### Public API fallback

If the CLI cannot be authenticated, the public API works while this Netlify site and its deploys remain public:

```bash
SITE_ID="$(curl -sS https://api.netlify.com/api/v1/sites/owenwillia.ms | jq -r '.id')"
BRANCH="$(git branch --show-current)"
HEAD_SHA="$(git rev-parse HEAD)"

curl -sS \
  "https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys?branch=$(printf %s "$BRANCH" | jq -sRr @uri)&per_page=20" \
  | jq --arg sha "$HEAD_SHA" \
      'map(select(.context == "branch-deploy" and .commit_ref == $sha))[0] | {state, commit_ref, deploy_ssl_url}'
```

Private sites require a Netlify access token.
