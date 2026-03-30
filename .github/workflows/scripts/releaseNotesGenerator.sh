JIRA_TOKEN=$1
JIRA_FIXED_VERSION=$2
RELEASE_NOTES_FILE="$JIRA_FIXED_VERSION-releasenotes.txt"

echo "Trying to fetch release notes for $JIRA_FIXED_VERSION"

curl -X GET https://appsflyer.atlassian.net/rest/api/3/project/11723/versions --user $JIRA_TOKEN | jq -r '.[] | .name+""+.id' | while read version ; do
if [[ "$version" == *"$JIRA_FIXED_VERSION"* ]] ;then
    echo "$JIRA_FIXED_VERSION Found!"
    version_id=${version#"$JIRA_FIXED_VERSION"}
    echo $(curl -X GET https://appsflyer.atlassian.net/rest/api/3/search?jql=fixVersion=$version_id --user $JIRA_TOKEN | jq -r '.issues[] | "- " + .fields["summary"]+"@"') > "$RELEASE_NOTES_FILE"
    sed -i -r -e "s/@ /\n/gi" "$RELEASE_NOTES_FILE"
    sed -i -r -e "s/@/\n/gi" "$RELEASE_NOTES_FILE"
    cat "$RELEASE_NOTES_FILE"
fi
done

if [ ! -f "$RELEASE_NOTES_FILE" ]; then
    echo "WARNING: Jira fix version '$JIRA_FIXED_VERSION' was not found. Continuing without release notes."
    echo "No release notes available for $JIRA_FIXED_VERSION" > "$RELEASE_NOTES_FILE"
fi