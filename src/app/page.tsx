// src/app/page.tsx
import { request } from "@/lib/datocms"; // Import fungsi jembatan tadi
import Link from "next/link"; // Untuk navigasi antar halaman

// 1. Ini "Menu Pesanan" (Query GraphQL) ke DatoCMS
const HOMEPAGE_QUERY = `
query HomePage {
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

// 2. Definisi tipe data (Agar TypeScript tidak marah)
type Article = {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  coverImage: { url: string };
};

export default async function Home() {
  // 3. Eksekusi pengambilan data
  const data: any = await request({
    query: HOMEPAGE_QUERY,
  });

  const posts: Article[] = data.allArticles;

  return (
    <main className="container mx-auto p-4 md:p-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Blog HME ITB</h1>
      
      {/* 4. Grid Layout untuk daftar artikel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            {/* Gambar Cover */}
            <img 
              src={post.coverImage.url} 
              alt={post.title} 
              className="w-full h-48 object-cover"
            />
            
            <div className="p-4">
              {/* Judul & Tanggal */}
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-gray-500 text-sm mb-2">{post.date}</p>
              
              {/* Ringkasan */}
              <p className="text-gray-700 mb-4">{post.excerpt}</p>
              
              {/* Tombol Baca Selengkapnya */}
              <Link 
                href={`/blog/${post.slug}`} 
                className="text-blue-600 font-semibold hover:underline"
              >
                Baca Selengkapnya →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}