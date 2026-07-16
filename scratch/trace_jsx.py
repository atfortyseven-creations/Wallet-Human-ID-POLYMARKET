import re
import sys

def analyze_jsx():
    with open('components/landing/ConnectPage.tsx', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    depth = 0
    stack = []
    
    # Simple regex to match tags. Ignores attributes for counting.
    # It catches <div, <motion.div, </div, </motion.div
    tag_pattern = re.compile(r'<(/?(?:div|motion\.div))[^>]*>')
    
    for i in range(523, len(lines)):
        line = lines[i]
        
        # Strip comments to avoid matching commented out tags
        line_no_comments = re.sub(r'\{/\*.*?\*/\}', '', line)
        line_no_comments = re.sub(r'//.*', '', line_no_comments)
        
        matches = tag_pattern.finditer(line_no_comments)
        for match in matches:
            full_tag = match.group(0)
            tag_name = match.group(1)
            
            if full_tag.endswith('/>'):
                continue
                
            if tag_name.startswith('/'):
                if len(stack) == 0:
                    print(f"Error: Found closing tag {tag_name} but stack is empty at line {i+1}")
                    return
                popped = stack.pop()
                depth -= 1
                print(f"{i+1:4d} | Depth: {depth:2d} | CLOSE: {tag_name} (Matches {popped})")
                
                if depth == 0:
                    print(f"ROOT CLOSED AT LINE {i+1}")
            else:
                stack.append(tag_name)
                depth += 1
                print(f"{i+1:4d} | Depth: {depth:2d} | OPEN: {tag_name}")

if __name__ == '__main__':
    analyze_jsx()
