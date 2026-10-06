export async function crossPostToDevTo(title: string, contentMarkdown: string, coverImage: string, canonicalUrl: string, token: string) {
  const res = await fetch("https://dev.to/api/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": token,
    },
    body: JSON.stringify({
      article: {
        title: title,
        body_markdown: contentMarkdown,
        published: true,
        main_image: coverImage || undefined,
        canonical_url: canonicalUrl,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Dev.to API Error: ${errorText}`);
  }

  const data = await res.json();
  return data.url; // Returns the public URL of the post
}

export async function crossPostToMedium(title: string, contentMarkdown: string, canonicalUrl: string, token: string) {
  // First, get the user ID
  const meRes = await fetch("https://api.medium.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!meRes.ok) {
    throw new Error(`Medium API Auth Error: ${await meRes.text()}`);
  }

  const meData = await meRes.json();
  const authorId = meData.data.id;

  // Now, publish the post
  const publishRes = await fetch(`https://api.medium.com/v1/users/${authorId}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: title,
      contentFormat: "markdown",
      content: `# ${title}\n\n${contentMarkdown}`,
      canonicalUrl: canonicalUrl,
      publishStatus: "public",
    }),
  });

  if (!publishRes.ok) {
    throw new Error(`Medium API Publish Error: ${await publishRes.text()}`);
  }

  const publishData = await publishRes.json();
  return publishData.data.url;
}

export async function crossPostToHashnode(title: string, contentMarkdown: string, coverImage: string, canonicalUrl: string, token: string, publicationId: string) {
  // Using the new Hashnode GraphQL API (https://gql.hashnode.com/)
  const query = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          url
        }
      }
    }
  `;

  const variables = {
    input: {
      title: title,
      contentMarkdown: contentMarkdown,
      publicationId: publicationId,
      settings: {
        enableToc: true,
        isOriginalArticle: false, // Since it's a cross-post
      },
      coverImageOptions: coverImage ? { coverImageURL: coverImage } : undefined,
      originalArticleURL: canonicalUrl,
    },
  };

  const res = await fetch("https://gql.hashnode.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Hashnode API Error: ${await res.text()}`);
  }

  const data = await res.json();
  
  if (data.errors && data.errors.length > 0) {
    throw new Error(`Hashnode API GraphQL Error: ${data.errors[0].message}`);
  }

  return data.data.publishPost.post.url;
}

export async function crossPostToSteem(title: string, contentMarkdown: string, canonicalUrl: string, username: string, token: string) {
  const permlink = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
  
  const content = `# ${title}\n\n${contentMarkdown}\n\n---\n*Originalmente publicado en [alonsorios.dev](${canonicalUrl})*`;

  const operations = [
    [
      "comment",
      {
        parent_author: "",
        parent_permlink: "blog",
        author: username,
        permlink: permlink,
        title: title,
        body: content,
        json_metadata: JSON.stringify({ tags: ["blog", "programming"], app: "alonsorios.dev" }),
      }
    ]
  ];

  const res = await fetch("https://steemconnect.com/api/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token,
    },
    body: JSON.stringify({ operations }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Steem API Error: ${errorText}`);
  }

  return `https://steemit.com/blog/@${username}/${permlink}`;
}
