import * as shell from 'shelljs';

export function init () {
    process.env.JWT_KEY = "qwertz";
    shell.exec('npm run mongo export')
    shell.exec('npm run mongo importtest')
}