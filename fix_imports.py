import json
import re

# Read the eslint JSON output
with open('eslint_output.json', 'r', encoding='utf-8') as f:
    results = json.load(f)

for result in results:
    file_path = result['filePath']
    messages = result['messages']
    
    # Collect unused vars
    unused_vars = []
    for msg in messages:
        if msg['ruleId'] == '@typescript-eslint/no-unused-vars':
            # Extract the variable name
            match = re.search(r"'(.*?)'", msg['message'])
            if match:
                unused_vars.append(match.group(1))
    
    if not unused_vars:
        continue
        
    print(f"Fixing {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    for var in set(unused_vars):
        # 1. Try removing from import lists e.g., `import { A, var, B }` -> `import { A, B }`
        # Using a regex that handles it safely
        content = re.sub(r'(\s*,\s*)?\b' + re.escape(var) + r'\b(\s*,\s*)?', lambda m: m.group(1) if (m.group(1) and m.group(2)) else '', content)
        # 2. Fix empty braces `import {} from ...`
        content = re.sub(r'import\s*{\s*}\s*from\s*[\'"][^\'"]+[\'"];?\n?', '', content)
        # 3. Handle unused functions/variables defined in the file
        content = re.sub(r'function\s+' + re.escape(var) + r'\s*\(.*?\)\s*{.*?}?\n', '', content, flags=re.DOTALL)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done fixing unused imports")
