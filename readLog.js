const fs = require('fs');

try {
    const data = fs.readFileSync('backend_logs.txt', 'utf16le');
    const lines = data.split('\n');
    let exceptions = [];
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes('exception') || lines[i].toLowerCase().includes('error')) {
            // Get a few lines of context around the error
            const start = Math.max(0, i - 1);
            const end = Math.min(lines.length, i + 10);
            exceptions.push(lines.slice(start, end).join('\n'));
        }
    }
    
    if (exceptions.length > 0) {
        console.log("FOUND ERRORS:");
        console.log(exceptions[exceptions.length - 1]); // Print the last error block
    } else {
        console.log("NO ERRORS FOUND IN LOG PARSING");
    }
} catch (e) {
    try {
        const data = fs.readFileSync('backend_logs.txt', 'utf8');
        const lines = data.split('\n');
        let exceptions = [];
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes('exception') || lines[i].toLowerCase().includes('error')) {
                // Get a few lines of context around the error
                const start = Math.max(0, i - 1);
                const end = Math.min(lines.length, i + 10);
                exceptions.push(lines.slice(start, end).join('\n'));
            }
        }
        
        if (exceptions.length > 0) {
            console.log("FOUND ERRORS (UTF8):");
            console.log(exceptions[exceptions.length - 1]); // Print the last error block
        } else {
            console.log("NO ERRORS FOUND IN LOG PARSING (UTF8)");
        }
    } catch(err) {
        console.error(err);
    }
}
