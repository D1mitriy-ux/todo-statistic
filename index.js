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
            allTODO.forEach(t => console.log(t));
            break;
            
        case 'important':
            allTODO.forEach(t => {
                if (t.includes('!')) console.log(t);
            });
            break;
            
        case 'user':
            if (!argument)
                break;
            const searchUser = argument.toLowerCase();
            allTODO.forEach(todo => {
                const p = parseTodo(todo);
                if (p.user === searchUser) {
                    console.log(todo);
                }
            });
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

            parsed.forEach(p => console.log(p.text));
            break;

        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
