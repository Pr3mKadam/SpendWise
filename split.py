import re
import os

src_file = r'D:\Projects\Hackathon\SpendWise\SpendWise\src\features\shared\components\SharedModals.tsx'
with open(src_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all export functions
functions = list(re.finditer(r'export function (\w+)\s*\(', content))
indices = [m.start() for m in functions]
names = [m.group(1) for m in functions]

if not indices:
    print('No functions found')
    exit(1)

out_dir = r'D:\Projects\Hackathon\SpendWise\SpendWise\src\features\shared\components\modals'
os.makedirs(out_dir, exist_ok=True)

import_statement = """import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Btn } from '@/components/ui/Button';
import { Field, Inp } from '@/components/ui/Input';
import { Sel } from '@/components/ui/Select';
import { Err, Ok } from '@/components/ui/Alert';
import { EmojiBtn } from '@/components/ui/Avatar';
import { Ico } from '@/components/ui/Icons';
import { SharedGoal, SharedGroupMember } from '@/features/shared/hooks/useSharedWallets';
import { formatLocalYYYYMMDD } from '@/utils/date';
import { MEMBER_EMOJIS, GOAL_EMOJIS, GOAL_COLORS } from '../sharedConstants';
"""

for i in range(len(indices)):
    start = indices[i]
    end = indices[i+1] if i+1 < len(indices) else len(content)
    func_content = content[start:end].strip()
    
    file_path = os.path.join(out_dir, f'{names[i]}.tsx')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(import_statement + '\n' + func_content + '\n')
    print(f'Created {names[i]}.tsx')

# Create index.ts
index_path = os.path.join(out_dir, 'index.ts')
with open(index_path, 'w', encoding='utf-8') as f:
    for name in names:
        f.write(f"export {{ {name} }} from './{name}';\n")
print('Created index.ts')
