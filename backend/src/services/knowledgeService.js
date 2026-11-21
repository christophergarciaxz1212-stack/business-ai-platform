const { prisma } = require('../db');

async function listDocs(tenantId) {
  return prisma.knowledgeDoc.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
}
async function addDoc(tenantId, title, content) {
  const doc = await prisma.knowledgeDoc.create({ data: { tenantId, title, content } });
  // simple chunking: split by paragraphs, ~500 chars
  const chunks = [];
  const paragraphs = content.split(/\n\n+/);
  let buf = '';
  for (const p of paragraphs) {
    if ((buf + p).length > 500 && buf) { chunks.push(buf.trim()); buf = ''; }
    buf += p + '\n\n';
  }
  if (buf.trim()) chunks.push(buf.trim());
  if (chunks.length === 0 && content.trim()) chunks.push(content.trim());
  for (const c of chunks) {
    const keywords = c.toLowerCase().split(/\W+/).filter((w) => w.length > 3).slice(0, 20).join(' ');
    await prisma.knowledgeChunk.create({ data: { tenantId, docId: doc.id, content: c, keywords } });
  }
  return doc;
}

module.exports = { listDocs, addDoc };