import Debug from 'debug';

Debug.enable('*,-express:router:route, -express:router, -body-parser:json,-express:application,-express:router:layer,-queue');

export function createDebugger(name: string) {
    return Debug(name);
}