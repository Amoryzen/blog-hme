// src/lib/datocms.ts
import { GraphQLClient } from "graphql-request";

// Ganti 'YOUR_DATOCMS_API_TOKEN' dengan token asli dari dashboard DatoCMS kamu.
// Tips: Jangan lupa tanda kutipnya tetap ada.
const API_TOKEN = process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN;

export function request({ query, variables, includeDrafts, excludeInvalid }: any) {
  const headers = {
    authorization: `Bearer ${API_TOKEN}`,
  };

  const client = new GraphQLClient('https://graphql.datocms.com', { headers });
  return client.request(query, variables);
}