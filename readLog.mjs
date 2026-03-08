import fs from 'fs';

try {
    const data = fs.readFileSync('backend_logs.txt', 'utf16le');
    const lines = data.split('\n');
    let exceptions = [];
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes('exception') || lines[i].toLowerCase().includes('error')) {
            const start = Math.max(0, i - 1);
            const end = Math.min(lines.length, i + 15);
            exceptions.push(lines.slice(start, end).join('\n'));
        }
    }
    
    if (exceptions.length > 0) {
        console.log("FOUND ERRORS:");
        console.log(exceptions[exceptions.length - 1]);
    } else {
        console.log("NO ERRORS FOUND IN LOG PARSING");
    }
} catch (e) {
    console.error(e);
}
