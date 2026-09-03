import pathlib
path = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/app/api/zk/verify/route.ts')
content = path.read_text(encoding='utf-8')

content = content.replace(
    "const ZK_SECRET = process.env.ZK_PIPELINE_SECRET || 'aztec-zk-pipeline-secret-key-3948';",
    "// Removed hardcoded fallback for security\n// const ZK_SECRET = process.env.ZK_PIPELINE_SECRET;"
)

content = content.replace(
    "const expectedSignature = crypto.createHmac('sha256', ZK_SECRET).update(payload).digest('hex');",
    "const zkSecret = process.env.ZK_PIPELINE_SECRET;\n    if (!zkSecret) { return NextResponse.json({ success: false, error: 'CRITICAL: ZK_PIPELINE_SECRET not configured. Verification halted.' }, { status: 500 }); }\n    const expectedSignature = crypto.createHmac('sha256', zkSecret).update(payload).digest('hex');"
)

path.write_text(content, encoding='utf-8')
print('Fixed ZK exploit')
