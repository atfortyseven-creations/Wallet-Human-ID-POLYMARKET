import os
import re

def migrate_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    orig_content = content
    
    content = content.replace("dep::aztec::", "aztec::")
    content = content.replace("dep::value_note::", "value_note::")
    
    if "aztec::prelude::{" in content or "aztec::prelude" in content:
        content = re.sub(
            r'use aztec::prelude::\{[^}]+\};',
            '''use aztec::{
        macros::{
            functions::{external, internal, initializer, view},
            storage::storage,
        },
        protocol::address::AztecAddress,
        state_vars::{Map, PublicMutable, PrivateSet},
    };''',
            content
        )

    content = content.replace("#[aztec(private)]", '#[external("private")]')
    content = content.replace("#[aztec(public)]", '#[external("public")]')
    content = content.replace("#[aztec(internal)]", '#[internal]')
    content = content.replace("#[aztec(initializer)]", '#[initializer]')
    content = content.replace("#[aztec(storage)]", '#[storage]')
    content = content.replace("#[aztec(view)]", '#[view]')
    content = content.replace("#[private]", '#[external("private")]')
    content = content.replace("#[public]", '#[external("public")]')

    content = re.sub(r'\bstorage\.', 'self.storage.', content)
    content = re.sub(r'\bcontext\.this_address\(\)', 'self.address', content)
    content = re.sub(r'&mut context', '&mut self.context', content)
    
    def replacer(m):
        ret_type = m.group(2)
        if "Field" in ret_type or "bool" in ret_type:
            if not ret_type.startswith("pub"):
                ret_type = "pub " + ret_type
        return m.group(1) + ret_type

    content = re.sub(r'(fn\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*->\s*)([A-Z][a-zA-Z0-9_a-z]*)', replacer, content)

    if content != orig_content:
        with open(filepath, 'w') as f:
            f.write(content)

def migrate_toml(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    orig_content = content
    content = re.sub(r'^name\s*=\s*"([^"]+)"', lambda m: f'name = "{m.group(1).replace("-", "_")}"', content, flags=re.MULTILINE)
    content = re.sub(r'compiler_version\s*=\s*"[^"]+"', 'compiler_version = ">=0.25.0"', content)
    content = re.sub(r'aztec\s*=\s*\{[^\}]+\}', 'aztec = { git = "https://github.com/AztecProtocol/aztec-packages", tag = "v6.0.0-nightly.20260604", directory = "noir-projects/aztec-nr/aztec" }', content)

    if content != orig_content:
        with open(filepath, 'w') as f:
            f.write(content)

if __name__ == "__main__":
    for root, dirs, files in os.walk("."):
        if "/." in root or "\\." in root:
            continue
        for file in files:
            filepath = os.path.join(root, file)
            if file.endswith(".nr"):
                migrate_file(filepath)
            elif file == "Nargo.toml":
                migrate_toml(filepath)
