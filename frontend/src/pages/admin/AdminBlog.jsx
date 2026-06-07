import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Eye } from 'lucide-react'

const blank = { title: '', content: '', excerpt: '', published: false, metaTitle: '', metaDesc: '' }

export default function AdminBlog() {
  const qc = useQueryClient()
  const [form, setForm] = useState(blank)
  const [showForm, setShowForm] = useState(false)

  const { data } = useQuery({ queryKey: ['admin-blog'], queryFn: () => api.get('/blog').then(r => r.data) })

  const create = async (e) => {
    e.preventDefault()
    await api.post('/blog', form)
    qc.invalidateQueries(['admin-blog'])
    toast.success('Post published!')
    setForm(blank); setShowForm(false)
  }

  const del = async (id) => {
    if (!confirm('Delete post?')) return
    await api.delete(`/blog/${id}`)
    qc.invalidateQueries(['admin-blog'])
    toast.success('Post deleted')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Blog Posts</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2">
          <Plus size={15} /> New Post
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="card p-6 mb-6 space-y-4">
          <h2 className="font-serif text-lg font-bold">New Blog Post</h2>
          <div><label className="label">Title</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} className="input" required /></div>
          <div><label className="label">Excerpt</label><input value={form.excerpt} onChange={e => setForm({...form,excerpt:e.target.value})} className="input" /></div>
          <div><label className="label">Content (Markdown supported)</label><textarea value={form.content} onChange={e => setForm({...form,content:e.target.value})} className="input resize-none h-48" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Meta Title</label><input value={form.metaTitle} onChange={e => setForm({...form,metaTitle:e.target.value})} className="input text-sm" /></div>
            <div><label className="label">Meta Description</label><input value={form.metaDesc} onChange={e => setForm({...form,metaDesc:e.target.value})} className="input text-sm" /></div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => setForm({...form,published:e.target.checked})} className="w-4 h-4 rounded" />
            <span className="text-sm text-white/70">Publish immediately</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Publish</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {data?.posts?.length === 0 && <p className="text-white/40">No posts yet.</p>}
        {data?.posts?.map(p => (
          <div key={p.id} className="card p-5 flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-white/40 mt-1">{new Date(p.publishedAt).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2">
              <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-white/30 hover:text-gold transition-colors"><Eye size={15}/></a>
              <button onClick={() => del(p.id)} className="p-2 text-white/30 hover:text-red-400 transition-colors"><Trash2 size={15}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
