#!/bin/bash
git filter-branch -f --env-filter '
if [ "$GIT_AUTHOR_NAME" = "Cursor Agent" ] || [ "$GIT_AUTHOR_NAME" = "cursoragent" ]; then
    export GIT_AUTHOR_NAME="Ledger Network™"
    export GIT_AUTHOR_EMAIL="josejordan20222@gmail.com"
fi
if [ "$GIT_COMMITTER_NAME" = "Cursor Agent" ] || [ "$GIT_COMMITTER_NAME" = "cursoragent" ]; then
    export GIT_COMMITTER_NAME="Ledger Network™"
    export GIT_COMMITTER_EMAIL="josejordan20222@gmail.com"
fi
' --tag-name-filter cat -- --branches --tags
