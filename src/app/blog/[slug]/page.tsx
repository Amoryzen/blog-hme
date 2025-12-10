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

export default async function BlogPost({ params }: { params: { slug: string } }) {
  // 2. Ambil data spesifik berdasarkan slug dari URL
  const data: any = await request({
    query: POST_QUERY,
    variables: { slug: params.slug },
  });

  const post = data.article;

  // Jika artikel tidak ditemukan (misal user asal ketik URL)
  if (!post) {
    return <div className="p-10 text-center">Artikel tidak ditemukan :(</div>;
  }

  return (
    <article className="max-w-3xl mx-auto p-5 md:p-10">
      {/* Tombol Kembali */}
      <Link href="/" className="text-blue-500 hover:underline mb-4 block">
        &larr; Kembali ke Home
      </Link>

      {/* Header Artikel */}
      <h1 className="text-3xl md:text-5xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-500 mb-8">{post.date}</p>

      {/* Gambar Utama */}
      <img 
        src={post.coverImage.url} 
        alt={post.title} 
        className="w-full h-auto rounded-lg mb-8 shadow-md"
      />

      {/* Isi Konten (Rich Text) */}
      <div className="prose lg:prose-xl">
        <StructuredText data={post.content} />
      </div>
    </article>
  );
}