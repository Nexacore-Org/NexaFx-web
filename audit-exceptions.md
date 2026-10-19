# Audit exceptions

Temporary acceptances of production dependency advisories.

Each exception must use this format (em dash between package and advisory id):

    ## package-name — advisory-id
    - reason: Why this is accepted
    - expires: YYYY-MM-DD

Expired entries cause `scripts/check-audit-exceptions.mjs` (and CI) to fail.
Remove or renew before the expiry date. Prefer upgrading the package over
extending an exception.

<!-- No active exceptions. -->
