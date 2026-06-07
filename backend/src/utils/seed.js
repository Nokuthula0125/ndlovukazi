require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Admin user
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@Ndlovukazi2025!', 12);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@ndlovukazi.com' },
    update: { role: 'ADMIN' },
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@ndlovukazi.com',
      password: hash,
      name: process.env.ADMIN_NAME || 'Nokuthula Ndlovu',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // Seed ATS keywords
  const keywords = [
    'leadership','management','communication','teamwork','problem-solving',
    'excel','microsoft office','google workspace','crm','salesforce',
    'customer service','project management','data analysis','budget',
    'kpi','sla','stakeholder','agile','scrum','reporting',
  ];
  for (const kw of keywords) {
    await prisma.atsKeyword.upsert({ where: { keyword: kw }, update: {}, create: { keyword: kw } });
  }
  console.log(`✅ Seeded ${keywords.length} ATS keywords`);

  // Sample blog post
  await prisma.blogPost.upsert({
    where: { slug: 'welcome-to-ndlovukazi' },
    update: {},
    create: {
      authorId: admin.id,
      title: 'Welcome to Remote Jobs with Ndlovukazi',
      slug: 'welcome-to-ndlovukazi',
      content: `## Welcome!\n\nWe are Africa's most trusted remote job platform...\n\nNever pay for a job. We will never ask for money.`,
      excerpt: "Africa's most trusted remote job platform is here.",
      published: true,
      publishedAt: new Date(),
    },
  });
  console.log('✅ Sample blog post created');

  console.log('\n🎉 Seed complete!');
  console.log(`   Admin email: ${admin.email}`);
  console.log(`   Admin password: ${process.env.ADMIN_PASSWORD || 'Admin@Ndlovukazi2025!'}`);
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
