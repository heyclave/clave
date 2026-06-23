# This repo ships an agent skill — there is nothing to build or run here.
# These targets only lint the repo-authored Markdown. The Astro template under
# skills/clave/template/ is verbatim payload and is intentionally excluded
# (see .markdownlint-cli2.jsonc).
#
# No package.json, no lockfile: markdownlint-cli2 is fetched on demand by npx.
# The version is PINNED (not @latest) so a compromised fresh publish can't run
# here. Bump it deliberately, in lockstep with the CI action's `version` input
# in .github/workflows/lint.yml.

LINTER := markdownlint-cli2@0.22.1

.PHONY: lint check fmt format

lint check: ## Check Markdown against .markdownlint.jsonc
	npx --yes $(LINTER)

fmt format: ## Autofix the safe Markdown issues in place
	npx --yes $(LINTER) --fix
