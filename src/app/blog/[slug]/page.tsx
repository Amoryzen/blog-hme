// src/app/blog/[slug]/page.tsx
import { request } from "@/lib/datocms";
import { StructuredText } from "react-datocms"; // Komponen untuk render isi artikel
import Link from "next/link";

type Article = {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  coverImage?: { url: string };
};

type ArticleResponse = {
  article: Article & { content: { value: unknown }; coverImage: { url: string } };
  allArticles: Article[];
};

// 1. Query untuk ambil SATU artikel berdasarkan SLUG
const POST_QUERY = `
query PostBySlug($slug: String) {
  article(filter: {slug: {eq: $slug}}) {
    id
    title
    slug
    date
    excerpt
    content {
      value
    }
    coverImage {
      url
    }
  }
  allArticles {
    id
    title
    slug
    date
    excerpt
    coverImage {
      url
    }
  }
}
`;

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const buildVector = (tokens: string[]) => {
  const counts: Record<string, number> = {};
  tokens.forEach((token) => {
    counts[token] = (counts[token] || 0) + 1;
  });
  return counts;
};

const cosineSimilarity = (aText: string, bText: string) => {
  const aTokens = tokenize(aText);
  const bTokens = tokenize(bText);
  if (!aTokens.length || !bTokens.length) return 0;

  const aVec = buildVector(aTokens);
  const bVec = buildVector(bTokens);

  const vocabulary = new Set([...Object.keys(aVec), ...Object.keys(bVec)]);

  let dot = 0;
  let aMag = 0;
  let bMag = 0;

  vocabulary.forEach((term) => {
    const aVal = aVec[term] || 0;
    const bVal = bVec[term] || 0;
    dot += aVal * bVal;
    aMag += aVal * aVal;
    bMag += bVal * bVal;
  });

  const denominator = Math.sqrt(aMag) * Math.sqrt(bMag);
  return denominator === 0 ? 0 : dot / denominator;
};

const scoreCandidates = (current: Article, candidates: Article[]) => {
  const currentText = `${current.title} ${current.excerpt ?? ""}`;

  return candidates
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => {
      const candidateText = `${candidate.title} ${candidate.excerpt ?? ""}`;
      const textScore = cosineSimilarity(currentText, candidateText);
      return { ...candidate, score: textScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  // 2. Await params first (Next.js 15 requirement)
  const { slug } = await params;
  
  // 3. Ambil data spesifik berdasarkan slug dari URL
  const data: ArticleResponse = await request({
    query: POST_QUERY,
    variables: { slug },
  });

  const post = data.article;
  const relatedPosts = scoreCandidates(post, data.allArticles);

  // Jika artikel tidak ditemukan (misal user asal ketik URL)
  if (!post) {
    return <div className="p-10 text-center">Artikel tidak ditemukan :(</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      <article className="max-w-4xl mx-auto p-5 md:p-10">
        {/* Tombol Kembali */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold mb-8 group transition-colors"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Kembali ke Home
        </Link>

        {/* Header Artikel dengan Background Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6 md:p-10 mb-8">
          {/* Badge Tanggal */}
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full shadow-md">
              {new Date(post.date).toLocaleDateString('id-ID', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          
          {/* Judul Artikel */}
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 leading-tight">
            {post.title}
          </h1>
        </div>

        {/* Gambar Utama dengan Efek */}
        <div className="relative mb-10 rounded-2xl overflow-hidden shadow-2xl group">
          <img 
            src={post.coverImage.url} 
            alt={post.title} 
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Isi Konten (Rich Text) dengan Background Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6 md:p-10">
          <div className="prose prose-lg md:prose-xl max-w-none prose-invert prose-headings:font-bold prose-headings:text-gray-100 prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-100 prose-img:rounded-xl prose-img:shadow-md">
            <StructuredText data={post.content} />
          </div>
        </div>

        {/* Rekomendasi Artikel */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Artikel Terkait</h2>
          {relatedPosts.length === 0 ? (
            <p className="text-gray-400">Belum ada artikel lain untuk direkomendasikan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="group flex gap-4 bg-gray-800 border border-gray-700 rounded-2xl p-4 hover:border-blue-500/60 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative w-32 h-24 overflow-hidden rounded-xl flex-shrink-0">
                    <img
                      src={item.coverImage?.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(item.date).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">{item.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tombol Kembali di Bawah */}
        <div className="mt-10 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
          >
            <span>←</span>
            Kembali ke Semua Artikel
          </Link>
        </div>
      </article>
    </div>
  );
}