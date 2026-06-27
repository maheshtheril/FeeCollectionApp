const fs = require('fs');
const path = require('path');

// 1. Create org directory and move [orgSlug] into it
const srcApp = 'C:/MyProjects_2025/FeeCollectionApp/src/app';
const orgSlugDir = path.join(srcApp, '[orgSlug]');
const orgDir = path.join(srcApp, 'org');
const newOrgSlugDir = path.join(orgDir, '[orgSlug]');

if (!fs.existsSync(orgDir)) {
    fs.mkdirSync(orgDir);
}
if (fs.existsSync(orgSlugDir)) {
    fs.renameSync(orgSlugDir, newOrgSlugDir);
}

// 2. Find and replace `/${org...}` with `/org/${org...}`
function walkDir(dir) {
    let files = [];
    for (const item of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            files = files.concat(walkDir(fullPath));
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            files.push(fullPath);
        }
    }
    return files;
}

const files = walkDir('C:/MyProjects_2025/FeeCollectionApp/src');
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace /${org.slug} -> /org/${org.slug}
    content = content.replace(/\/\$\{org\.slug\}/g, '/org/${org.slug}');
    
    // Replace /${orgSlug} -> /org/${orgSlug}
    content = content.replace(/\/\$\{orgSlug\}/g, '/org/${orgSlug}');
    
    // Replace /${orgMember.organization.slug} -> /org/${orgMember.organization.slug}
    content = content.replace(/\/\$\{orgMember\.organization\.slug\}/g, '/org/${orgMember.organization.slug}');

    if (content !== original) {
        fs.writeFileSync(file, content);
    }
}
