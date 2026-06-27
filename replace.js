const fs = require('fs');
const path = require('path');

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
    content = content.replace(/"\/login"/g, '"/signin"');
    content = content.replace(/'\/login'/g, "'/signin'");
    content = content.replace(/"\/login\?error=credentials"/g, '"/signin?error=credentials"');
    content = content.replace(/"\/login\?error=default"/g, '"/signin?error=default"');
    if (content !== original) {
        fs.writeFileSync(file, content);
    }
}
