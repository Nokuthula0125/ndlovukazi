import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { format } from 'date-fns'

export default function BlogPage() {
  const { data } = useQuery({ queryKey:['blog'], queryFn:()=>api.get('/blog').then(r=>r.data) })
  return (<>
    <Helmet><title>Blog — Ndlovukazi</title></Helmet>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-4xl font-bold mb-2">Blog</h1>
      <p className="text-white/40 mb-10">Career tips, remote work insights, and platform updates</p>
      <div className="space-y-6">
        {data?.posts?.map(p=>(
          <Link key={p.id} to={`/blog/${p.slug}`} className="card p-6 block hover:border-gold/20">
            <div className="text-xs text-white/30 mb-2">{p.publishedAt ? format(new Date(p.publishedAt),'dd MMM yyyy') : ''} · {p.author?.name}</div>
            <h2 className="font-serif text-xl font-bold mb-2">{p.title}</h2>
            <p className="text-white/50 text-sm line-clamp-2">{p.excerpt}</p>
            <span className="text-gold text-sm mt-3 inline-block">Read more →</span>
          </Link>
        ))}
        {data?.posts?.length===0 && <p className="text-white/40 text-center py-16">No posts yet. Check back soon!</p>}
      </div>
    </div>
  </>)
}
