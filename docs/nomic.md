curl https://api-atlas.nomic.ai/v1/embedding/text \
  -H "Authorization: Bearer $NOMIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "model": "nomic-embed-text-v1.5", "texts": ["example text"] }'