// src/app/blog/[slug]/page.tsx
import { request } from "@/lib/datocms";
import { StructuredText } from "react-datocms"; // Komponen untuk render isi artikel
import Link from "next/link";

// 1. Query untuk ambil SATU artikel berdasarkan SLUG
const POST_QUERY = `
query PostBySlug($slug: String) {
  article(filter: {slug: {eq: $slug}}) {
    title
    date
    content {
      value
    }
    coverImage {
      url
    }
  }
}
`;

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  // 2. Await params first (Next.js 15 requirement)
  const { slug } = await params;
  
  // 3. Ambil data spesifik berdasarkan slug dari URL
  const data: any = await request({
    query: POST_QUERY,
    variables: { slug },
  });

  const post = data.article;

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