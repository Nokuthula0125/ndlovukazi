const router = require('express').Router();
const prisma = require('../utils/prisma');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const alerts = await prisma.jobAlert.findMany({ where: { userId: req.user.id } });
  res.json({ alerts });
});

router.post('/', auth, async (req, res) => {
  const { categories, keywords, jobTypes, frequency } = req.body;
  const alert = await prisma.jobAlert.create({
    data: { userId: req.user.id, categories: categories?.join(',') || '',
      keywords: keywords?.join(',') || '', jobTypes: jobTypes?.join(',') || '',
      frequency: frequency || 'daily' },
  });
  res.status(201).json({ alert });
});

router.put('/:id', auth, async (req, res) => {
  const alert = await prisma.jobAlert.findUnique({ where: { id: req.params.id } });
  if (!alert || alert.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const updated = await prisma.jobAlert.update({ where: { id: alert.id }, data: req.body });
  res.json({ alert: updated });
});

router.delete('/:id', auth, async (req, res) => {
  const alert = await prisma.jobAlert.findUnique({ where: { id: req.params.id } });
  if (!alert || alert.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  await prisma.jobAlert.delete({ where: { id: alert.id } });
  res.json({ message: 'Alert deleted' });
});

module.exports = router;
