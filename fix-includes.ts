import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(componentsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace log.includes -> (log || '').includes
    let modified = content.replace(/log\.includes/g, "(log || '').includes");
    modified = modified.replace(/log\.msg\.includes/g, "(log?.msg || '').includes");
    modified = modified.replace(/stat\.trend\.includes/g, "(stat?.trend || '').includes");
    modified = modified.replace(/step\.includes/g, "(step || '').includes");
    modified = modified.replace(/\.toLowerCase\(\)\.includes/g, "?.toLowerCase()?.includes");
    
    // Replace net.bssid -> net?.bssid
    modified = modified.replace(/net\.bssid/g, "net?.bssid");
    // Replace activeTarget.type -> activeTarget?.type
    modified = modified.replace(/activeTarget\.type/g, "activeTarget?.type");

    if (content !== modified) {
        fs.writeFileSync(filePath, modified, 'utf8');
        console.log(`Updated ${file}`);
    }
}
