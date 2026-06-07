import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'

export default function BlogPostPage() {
  const { slug } = useParams()
  const { data } = useQuery({ queryKey:['blog-post',slug], queryFn:()=>api.get(`/blog/${slug}`).then(r=>r.data) })
  const p = data?.post
  if (!p) return <div className="max-w-3xl mx-auto px-4 py-20 animate-pulse"><div className="h-8 bg-white/[0.05] rounded mb-4 w-2/3"/><div className="space-y-2">{[...Array(6)].map((_,i)=><div key={i} className="h-4 bg-white/[0.03] rounded"/>)}</div></div>
  return (<>
    <Helmet>
      <title>{p.metaTitle||p.title} — Ndlovukazi</title>
      {p.metaDesc && <meta name="description" content={p.metaDesc}/>}
    </Helmet>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/blog" className="btn-ghost mb-6 -ml-2 text-sm"><ArrowLeft size={15}/>Blog</Link>
      <div className="text-xs text-white/30 mb-4">{p.publishedAt ? format(new Date(p.publishedAt),'dd MMMM yyyy') : ''} · {p.author?.name}</div>
      <h1 className="font-serif text-4xl font-bold mb-8 leading-tight">{p.title}</h1>
      <div className="text-white/70 leading-relaxed whitespace-pre-wrap text-base space-y-4">{p.content}</div>
    </div>
  </>)
}
