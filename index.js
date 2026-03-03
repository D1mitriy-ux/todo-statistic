const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processTODO() {
    const TODOregEx = /\/\/ TODO .*/g;
    const allTodos = [];
    const importantTODO = [];

    for (const fileContent of files) {
        const matches = fileContent.match(TODOregEx);
        if (matches) {
            allTodos.push(...matches);
        }
    }

    return allTodos;
}


function parseTodo(todo) {
    let importance = 0;
    for (let i = 0; i < todo.length; i++) {
        if (todo[i] === '!') {
            importance++;
        }
    }

    let user = null;
    let date = null;
    if (todo.includes(';')) {
        const parts = todo.split(';');
        if (parts.length >= 3) {
            const userName = parts[0].substring(8).trim().toLowerCase();
            user = userName !== "" ? userName : null;

            const dateStr = parts[1].trim();
            if (dateStr !== "") {
                const parsedDate = new Date(dateStr);
                if (!isNaN(parsedDate.getTime())) {
                    date = parsedDate;
                }
            }
        }
    }

    return { user, date, importance, text: todo };
}

function extractComment(todo) {
    let comment = todo.replace(/\/\/ TODO\s*/, '');
    
    if (comment.includes(';')) {
        comment = comment.split(';')[0].trim();
    }
 
    comment = comment.replace(/^!+\s*/, '');
    
    return comment;
}

function truncateAndPad(text, width) {
    if (text.length > width) {
        return text.substring(0, width - 3) + '...';
    }
    return text.padEnd(width);
}

function printTable(todos) {
    todos.forEach(todo => {
        const parsed = parseTodo(todo);

        const importance = parsed.importance > 0 ? '!' : '';

        const user = parsed.user ? parsed.user : '';

        const date = parsed.date ? parsed.date.toISOString().split('T')[0] : '';

        const comment = extractComment(todo);
        
        const col1 = truncateAndPad(importance, 1);
        const col2 = truncateAndPad(user, 10);
        const col3 = truncateAndPad(date, 10);
        const col4 = truncateAndPad(comment, 50);
        
        console.log(`${col1}  | ${col2}  | ${col3}  | ${col4}`);
    });
}

function processCommand(command) {
    const allTODO = processTODO();
    const parts = command.split(' ');
    const action = parts[0];
    const argument = parts[1];

    switch (action) {
        case 'exit':
            process.exit(0);
            break;
            
        case 'show':
            printTable(allTODO);
            break;
            
        case 'important':
            const importantTodos = allTODO.filter(t => t.includes('!'));
            printTable(importantTodos);
            break;
            
        case 'user':
            if (!argument)
                break;
            const searchUser = argument.toLowerCase();
            const userTodos = allTODO.filter(todo => {
                const p = parseTodo(todo);
                return p.user === searchUser;
            });
            printTable(userTodos);
            break;

        case 'date':
            if (!argument) {
                console.log('Please, specify date in format: yyyy, yyyy-mm, or yyyy-mm-dd');
                break;
            }
            
            let filterDate;
            const dateParts = argument.split('-');
            
            if (dateParts.length === 1) {
                filterDate = new Date(parseInt(dateParts[0]), 0, 1);
            } else if (dateParts.length === 2) {
                filterDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, 1);
            } else if (dateParts.length === 3) {
                filterDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            } else {
                console.log('Invalid date format');
                break;
            }

            const dateTodos = allTODO.filter(todo => {
                const parsed = parseTodo(todo);
                return parsed.date && parsed.date > filterDate;
            });
            printTable(dateTodos);
            break; 

        case 'sort':
            const parsed = allTODO.map(parseTodo);

            if (argument === 'importance') {
                parsed.sort((a, b) => b.importance - a.importance);
            }
            
            else if (argument === 'user') {
                parsed.sort((a, b) => {
                    if (a.user && b.user) return a.user.localeCompare(b.user);
                    if (a.user) return -1;
                    if (b.user) return 1;
                    return 0;
                });
            }
            
            else if (argument === 'date') {
                parsed.sort((a, b) => {
                    if (a.date && b.date) 
                        return b.date - a.date;
                    if (a.date) 
                        return -1;
                    if (b.date) 
                        return 1;
                    return 0;
                });
            }

            const sortedTodos = parsed.map(p => p.text);
            printTable(sortedTodos);
            break;

        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!