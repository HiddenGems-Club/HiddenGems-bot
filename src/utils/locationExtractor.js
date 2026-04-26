// God I hate REGEX. Thanks Claude
const LOCATION_REGEX = /https?:\/\/(www\.)?(google\.com\/maps|maps\.google\.com|maps\.app\.goo\.gl)\S*/gi;

function extractLocationLink(content) {
    if (!content) return null;
    const matches = content.match(LOCATION_REGEX);
    return matches ? matches[0] : null;
}

module.exports = { extractLocationLink };