from pathlib import Path
import urllib.request
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

output_dir = Path(r'D:\Mileston')
output_dir.mkdir(parents=True, exist_ok=True)
font_dir = output_dir / 'fonts'
font_dir.mkdir(parents=True, exist_ok=True)

font_url = 'https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/Nunito%5Bwght%5D.ttf'
font_path = font_dir / 'Nunito[wght].ttf'
if not font_path.exists():
    urllib.request.urlretrieve(font_url, font_path)
pdfmetrics.registerFont(TTFont('Nunito', str(font_path)))
pdfmetrics.registerFont(TTFont('Nunito-Bold', str(font_path)))

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='CustomTitle', fontName='Nunito-Bold', fontSize=22, leading=28, alignment=TA_CENTER, spaceAfter=14))
styles.add(ParagraphStyle(name='CustomHeading', fontName='Nunito-Bold', fontSize=16, leading=20, spaceBefore=12, spaceAfter=8))
styles.add(ParagraphStyle(name='CustomSubHeading', fontName='Nunito-Bold', fontSize=13, leading=18, spaceBefore=10, spaceAfter=6))
styles.add(ParagraphStyle(name='CustomBody', fontName='Nunito', fontSize=11.5, leading=18, alignment=TA_JUSTIFY, spaceAfter=8))
styles.add(ParagraphStyle(name='CustomBodyBold', fontName='Nunito-Bold', fontSize=11.5, leading=18, alignment=TA_JUSTIFY, spaceAfter=8))
styles.add(ParagraphStyle(name='CustomBullet', fontName='Nunito', fontSize=11.5, leading=18, leftIndent=12, bulletIndent=0, spaceAfter=4))

def add_bulleted_section(title, bullets):
    if title:
        content.append(Paragraph(title, styles['CustomSubHeading']))
    items = [ListItem(Paragraph(item, styles['CustomBullet'])) for item in bullets]
    content.append(KeepTogether([ListFlowable(items, bulletType='bullet', leftIndent=12)]))

content = []
content.append(Paragraph('Dear Aztec team,', styles['CustomBody']))
content.append(Paragraph('I am writing to provide a clear and professional update on Whale Network, highlighting the real progress we have delivered so far and the work plan we will follow in the coming months.', styles['CustomBody']))

content.append(Paragraph('1. Current state of Whale Network', styles['CustomHeading']))
content.append(Paragraph('Since our proposal on May 23, we have made consistent technical progress. Whale Network is now an operational Web3 platform that natively integrates the Aztec ecosystem and applies programmable privacy in key product components.', styles['CustomBody']))
add_bulleted_section('What is already built', [
    'Core user platform built in Next.js, React, and Tailwind.',
    'Real Aztec integration through context/AztecContext.tsx and context/AztecNativeContext.tsx.',
    'Internal Aztec APIs for address derivation, identity airdrops, QD balance queries, transaction history, and transfers between Aztec addresses.',
    'Operational modules: Whale Chat, Humanity Ledger, Portfolio, QR synchronization, and Aztec Identity.',
    'ZK sandbox implementation for any user to compile circuits such as Balance Commitment (Pedersen), Merkle Membership Proof, SHA-256 Preimage, ECDSA Signature Verifier, Range Proof (u64 bounds), Multi-Input + Struct, Keccak-256 Hash Gate, Blake2s Hash Gate, Boolean Logic Gate, and Array Sum Constraint.',
    'Technical documentation and compliance embedded in the application: Aztec architecture, Noir circuits, $QD token model, and security policies.'
])

add_bulleted_section('Key technical achievements', [
    'The platform dynamically loads @aztec/aztec.js in the browser to avoid server build conflicts.',
    'We have a PXE architecture that protects the user’s private execution locally.',
    'The repository already contains multiple relevant Noir circuits, including whale_chat, private-portfolio-balance, qr_session_sync, mint_private_license, and humanity_ledger.',
    'The current QD accounting model is implemented with verifiable balances and transaction records within the system.'
])

content.append(Paragraph('2. What we have delivered so far', styles['CustomHeading']))
add_bulleted_section('Functional modules', [
    'Whale Chat: private wallet-to-wallet communication.',
    'Portfolio: private asset management with full actions.',
    'Humanity Ledger: privacy-preserving analytics and insights.',
    'QR Sync: reliable cross-device access.',
    'Aztec Identity: account derivation and QD balance operations.'
])

add_bulleted_section('Architecture and documentation', [
    'Explicit Aztec Network and Noir integration in the frontend.',
    'Support for proving backends such as Honk and UltraPlonk.',
    'Compliance and security policies incorporated into the product.',
    'Authentication and session architecture with a cryptographic-first approach.'
])

content.append(Paragraph('3. Legal framework and compliance', styles['CustomHeading']))
content.append(Paragraph('Whale Network combines Aztec’s privacy vision with a responsible legal framework that allows the platform to operate in regulated environments without degrading the user’s technical protections.', styles['CustomBody']))
add_bulleted_section('Legal framework and compliance details', [
    'Privacy remains the core of the design: ZK proofs are generated locally in the user’s PXE and only the proof itself is shared, not the underlying data.',
    'GDPR/KYC/AML compliance is presented as an additional governance layer required for lawful operation, not as a replacement for Aztec’s private architecture.',
    'Private transactions on Aztec remain private to unauthorized third parties; any regulatory verification is handled through selective disclosure mechanisms and controlled viewing.',
    'This legal framework is intended to preserve Aztec’s programmable privacy vision while ensuring Whale Network is viable and trusted in demanding jurisdictions.'
])

content.append(Paragraph('4. Funding request', styles['CustomHeading']))
content.append(Paragraph('We request your support with a total allocation of:', styles['CustomBody']))
add_bulleted_section('Funding breakdown', [
    '$30,000 USD for retroactive recognition of the work delivered so far.',
    '$20,000 USD for the planned Q3 2026 milestones.',
    'Total: $50,000 USD.'
])

content.append(Paragraph('5. Proposed use of funding', styles['CustomHeading']))
for title, items in [
    ('Phase 1 — Audit and secure', [
        'Deep audit of Noir circuits.',
        'Security review of Aztec integration.',
        'Audit of frontend, backend, and privacy architecture.'
    ]),
    ('Phase 2 — Complete mobile applications', [
        'Native iOS application.',
        'Native Android application.',
        'Complete QR synchronization.',
        'Robust mobile experience aligned with the web dashboard.'
    ]),
    ('Phase 3 — Optimize and scale', [
        'Enhance the private wallet experience.',
        'Optimize user flows and performance.',
        'Expand private ledger capabilities and data privacy features.'
    ]),
    ('Phase 4 — Documentation and transparency', [
        'Technical documentation for review.',
        'Audit access for the Aztec team.',
        'Regular updates and live demonstrations.'
    ])
]:
    add_bulleted_section(title, items)

content.append(Paragraph('6. Questions for the Aztec team', styles['CustomHeading']))
add_bulleted_section('', [
    'What is the preferred KYC process for fund disbursement? We propose ZKPassport as a private verification option.',
    'Can we coordinate a technical demo focusing on Studio Provenance, private Portfolio, Whale Chat, and QR sync?',
    'Which specific Aztec requirements should we prioritize in Q3 2026?',
    'Do you want additional technical documentation or direct access to the architecture?'
])

content.append(Paragraph('7. Founder commitment', styles['CustomHeading']))
content.append(Paragraph('As the founder of Whale Network, I personally commit to:', styles['CustomBody']))
add_bulleted_section('', [
    'The technical quality of the Aztec integration.',
    'Transparency in progress.',
    'Strict adherence to the proposed milestones.',
    'Delivering regular updates to the Aztec team.'
])

content.append(Paragraph('I deeply value the opportunity to collaborate with Aztec, and I build this project with the highest respect for the technology and community you are creating.', styles['CustomBody']))
content.append(Spacer(1, 12))
content.append(Paragraph('Thank you sincerely for your time and consideration. I am available to present a live technical demonstration and share the detailed work plan whenever you consider it convenient.', styles['CustomBody']))
content.append(Spacer(1, 16))
content.append(Paragraph('With respect and appreciation,', styles['CustomBody']))
content.append(Paragraph('Stefan Antonio Cirisanu', styles['CustomBodyBold']))
content.append(Paragraph('Founder, Whale Network', styles['CustomBody']))

output_path = output_dir / 'Whale_Network_Aztec_Grant_Update.pdf'
doc = SimpleDocTemplate(str(output_path), pagesize=A4,
                        rightMargin=25*mm, leftMargin=25*mm,
                        topMargin=20*mm, bottomMargin=20*mm)
doc.build(content)
print(f'PDF generado en: {output_path}')
