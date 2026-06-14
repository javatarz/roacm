const fs = require('fs');
const xml = fs.readFileSync('_site/atom.xml', 'utf8');

if (!xml.includes('<feed') || !xml.includes('</feed>')) {
  console.error('❌ Atom feed missing <feed> element');
  process.exit(1);
}

const entries = (xml.match(/<entry>/g) || []).length;
if (entries === 0) {
  console.error('❌ Atom feed has no entries');
  process.exit(1);
}

console.log(`✅ Atom feed valid with ${entries} entries`);
