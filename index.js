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
            for (const todo of allTODO) {
                console.log(todo);
            }
            break;

        case 'important':
            const importantTODO = allTODO.filter(todo => todo.includes('!'));
            for (const todo of importantTODO) {
                console.log(todo);
            }
            break;

        case 'user':
            if (!argument) {
                console.log('Please, specify username');
                break;
            }

            const userName = argument.toLowerCase();

            for (const todo of allTODO) {
                if (todo.includes(';')) {
                    const todoParts = todo.split(';');
                    const author = todoParts[0].substring(8).trim().toLowerCase();

                    if (author === userName) {
                        console.log(todo);
                    }
                }
            }
            break;

        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
