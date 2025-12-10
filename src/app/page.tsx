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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      <div className="container mx-auto p-4 md:p-10">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16 py-8">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Blog HME ITB
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-4">
            Dibuat oleh <span className="font-semibold text-blue-400">Rafi Ananta Alden</span> (13222087)
          </p>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Temukan artikel menarik dan inspiratif dari Himpunan Mahasiswa Elektroteknik ITB
          </p>
        </div>
        
        {/* 4. Grid Layout untuk daftar artikel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="group bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Gambar Cover */}
              <div className="relative overflow-hidden h-56">
                <img 
                  src={post.coverImage.url} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div className="p-6">
                {/* Tanggal dengan Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-900 text-blue-300 text-xs font-semibold rounded-full">
                    {new Date(post.date).toLocaleDateString('id-ID', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                
                {/* Judul */}
                <h2 className="text-xl font-bold mb-3 text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                
                {/* Ringkasan */}
                <p className="text-gray-300 mb-4 line-clamp-3 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
                
                {/* Tombol Baca Selengkapnya */}
                <Link 
                  href={`/blog/${post.slug}`} 
                  className="inline-flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors group/link"
                >
                  Baca Selengkapnya 
                  <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}