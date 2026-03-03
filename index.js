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

    for (const fileContent of files) {
        const matches = fileContent.match(TODOregEx);
        if (matches) {
            allTodos.push(...matches);
        }
    }

    return allTodos;
}

function processCommand(command) {
    switch (command) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            const todos = processTODO()
            for (const todo of todos) {
                console.log(todo);
            }
            break;

        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
