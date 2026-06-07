const router = require('express').Router();
const prisma = require('../utils/prisma');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true,
      author: { select: { name: true } } },
  });
  res.json({ posts });
});

router.get('/:slug', async (req, res) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug: req.params.slug },
    include: { author: { select: { name: true } } },
  });
  if (!post || !post.published) return res.status(404).json({ error: 'Post not found' });
  res.json({ post });
});

router.post('/', auth, adminOnly, async (req, res) => {
  const { title, content, excerpt, published, metaTitle, metaDesc } = req.body;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    + '-' + Date.now();
  const post = await prisma.blogPost.create({
    data: { authorId: req.user.id, title, slug, content, excerpt,
      published: !!published, publishedAt: published ? new Date() : null, metaTitle, metaDesc },
  });
  res.status(201).json({ post });
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const post = await prisma.blogPost.update({ where: { id: req.params.id }, data: req.body });
  res.json({ post });
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  res.json({ message: 'Post deleted' });
});

module.exports = router;
