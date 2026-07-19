import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';
const fs = require('fs');
const path = require('path');

const MAPPINGS = [
  {
    md: 'C:\\Users\\admin\\Desktop\\Documentoslegales\\04_Privacy_Policy_GDPR.md',
    tsx: 'app\\legal\\privacy\\page.tsx',
    title: 'Privacy Policy',
    category: 'Legal'
  },
  {
    md: 'C:\\Users\\admin\\Desktop\\Documentoslegales\\06_Platform_Terms_and_Conditions.md',
    tsx: 'app\\legal\\terms\\page.tsx',
    title: 'Terms of Service',
    category: 'Legal'
  },
  {
    md: 'C:\\Users\\admin\\Desktop\\Documentoslegales\\17_Security_Incident_Response_Plan.md',
    tsx: 'app\\legal\\security\\page.tsx',
    title: 'Security Architecture',
    category: 'Legal & Security'
  },
  {
    md: 'C:\\Users\\admin\\Desktop\\Documentoslegales\\07_AML_CFT_Prevention_Manual.md',
    tsx: 'app\\legal\\compliance\\page.tsx',
    title: 'Regulatory Attestation',
    category: 'Legal & Security'
  }
];

function escapeJSX(str) {
  return str.replace(/\{/g, '{"{"}').replace(/\}/g, '{"}"}').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function processMarkdown(mdContent, title, category) {
  // Split by ## 
  const parts = mdContent.split(/^##\s+/m);
  
  const toc = [];
  const sections = [];
  
  // Extract subtitle from first part if possible
  let subtitle = "This policy sets forth the legal and attestation rules governing the Whale Network ecosystem.";
  
  let sectionIndex = 1;
  for (let i = 1; i < parts.length; i++) {
    const lines = parts[i].split('\n');
    let headerRaw = lines[0].trim();
    let header = headerRaw.replace(/\*\*/g, '').replace(/\*/g, '').replace(/<[^>]+>/g, '');
    
    // Create an id
    const id = header.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!id) continue;
    
    // Add to TOC
    toc.push({ id, label: header });
    
    // Process content lines
    const contentLines = lines.slice(1);
    let sectionJSX = `
        {/* ${sectionIndex} */}
        <section id="${id}">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            ${escapeJSX(header)}
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
`;

    let paragraphBuffer = [];
    let inList = false;
    let listBuffer = [];
    let inTable = false;

    for (let j = 0; j < contentLines.length; j++) {
      let line = contentLines[j].trim();
      
      // Handle empty lines
      if (!line) {
        if (paragraphBuffer.length > 0) {
          sectionJSX += `            <p>\n              ${paragraphBuffer.join(' ')}\n            </p>\n`;
          paragraphBuffer = [];
        }
        if (inList && listBuffer.length > 0) {
          sectionJSX += `            <ul className="list-disc pl-5 space-y-2">\n${listBuffer.join('\n')}\n            </ul>\n`;
          listBuffer = [];
          inList = false;
        }
        continue;
      }
      
      // Ignore markdown horizontal rules or blockquotes simply for now
      if (line.startsWith('---') || line.startsWith('>')) {
        if (line.startsWith('>')) {
            line = line.substring(1).trim();
            sectionJSX += `            <div className="bg-black/5 p-4 rounded-lg font-medium border-l-4 border-black">\n              ${escapeJSX(line).replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')}\n            </div>\n`;
        }
        continue;
      }
      
      // Handle tables (skip for simplicity or render as code block?)
      if (line.startsWith('|')) {
         if (!inTable) {
           inTable = true;
           sectionJSX += `            <div className="overflow-x-auto"><table className="min-w-full border text-sm text-left"><tbody className="divide-y divide-black/10">\n`;
         }
         let cells = line.split('|').filter(c => c.trim().length > 0);
         if (line.includes('---')) continue; // skip separator
         sectionJSX += `              <tr>\n`;
         for(let cell of cells) {
            let c = escapeJSX(cell.trim()).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            sectionJSX += `                <td className="px-4 py-2 border-r border-black/10">${c}</td>\n`;
         }
         sectionJSX += `              </tr>\n`;
         continue;
      } else if (inTable) {
         inTable = false;
         sectionJSX += `            </tbody></table></div>\n`;
      }
      
      // Handle Headings inside sections (###)
      if (line.startsWith('### ')) {
        if (paragraphBuffer.length > 0) {
          sectionJSX += `            <p>\n              ${paragraphBuffer.join(' ')}\n            </p>\n`;
          paragraphBuffer = [];
        }
        if (inList && listBuffer.length > 0) {
          sectionJSX += `            <ul className="list-disc pl-5 space-y-2">\n${listBuffer.join('\n')}\n            </ul>\n`;
          listBuffer = [];
          inList = false;
        }
        let h3 = escapeJSX(line.substring(4)).replace(/\*\*(.*?)\*\*/g, '');
        sectionJSX += `            <h3 className="text-[14px] font-bold uppercase tracking-[0.06em] text-black mt-6 mb-3">${h3}</h3>\n`;
        continue;
      }

      // Format basic markdown
      let formattedLine = escapeJSX(line);
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong className="text-black font-semibold">$1</strong>');
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // replace links
      formattedLine = formattedLine.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" className="text-black underline underline-offset-2">$1</a>');

      if (line.startsWith('- ')) {
        if (paragraphBuffer.length > 0) {
          sectionJSX += `            <p>\n              ${paragraphBuffer.join(' ')}\n            </p>\n`;
          paragraphBuffer = [];
        }
        inList = true;
        let liText = formattedLine.substring(2);
        listBuffer.push(`              <li className="flex items-start gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" /><span>${liText}</span></li>`);
      } else {
        if (inList && listBuffer.length > 0) {
          sectionJSX += `            <ul className="space-y-2 pl-5">\n${listBuffer.join('\n')}\n            </ul>\n`;
          listBuffer = [];
          inList = false;
        }
        paragraphBuffer.push(formattedLine);
      }
    }
    
    if (paragraphBuffer.length > 0) {
      sectionJSX += `            <p>\n              ${paragraphBuffer.join(' ')}\n            </p>\n`;
    }
    if (inList && listBuffer.length > 0) {
      sectionJSX += `            <ul className="space-y-2 pl-5">\n${listBuffer.join('\n')}\n            </ul>\n`;
    }
    if (inTable) {
       sectionJSX += `            </tbody></table></div>\n`;
    }
    
    sectionJSX += `          </div>\n        </section>\n`;
    sections.push(sectionJSX);
    sectionIndex++;
  }
  
  const tocStr = toc.map(t => `  { id: '${t.id}', label: \`${t.label}\` }`).join(',\n');
  
  return `'use client';


const TOC: TocItem[] = [
${tocStr}
];

export default function LegalPage() {
  return (
    <LegalDocLayout
      title="${title}"
      subtitle="${subtitle}"
      lastUpdated="June 2026"
      category="${category}"
      toc={TOC}
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-10 sm:space-y-14 text-black">
${sections.join('\n')}
      </div>
    </LegalDocLayout>
  );
}
`;
}

for (const map of MAPPINGS) {
  if (!fs.existsSync(map.md)) {
    console.log("Missing " + map.md);
    continue;
  }
  const content = fs.readFileSync(map.md, 'utf8');
  const jsx = processMarkdown(content, map.title, map.category);
  const target = path.join(process.cwd(), map.tsx);
  fs.writeFileSync(target, jsx);
  console.log("Wrote " + target);
}
