// Purpose: Logger class to log messages to the console.
export class Logger { 
    
    public logname: string; 
    
    constructor(name: string) {
        this.logname = name;            
    }


    log(message: string) {
        const info = debug.getinfo(2, "Sl");
        print(`[${this.logname}][Log]: ${message} was printed from ${info.short_src}:${info.currentline}`);
    }

    info(message: string) {
        const info = debug.getinfo(2, "Sl");
        PrintInfo(`[${this.logname}][Info]: ${message} was printed from ${info.short_src}:${info.currentline}`);
    }

    warn(message: string) {
        const info = debug.getinfo(2, "Sl");
        print(`\\27[33m[${this.logname}][Warn]: ${message} was printed from ${info.short_src}:${info.currentline}\\27[0m`);
    }

    error(message: string) {
        const info = debug.getinfo(2, "Sl");
        PrintError(`[${this.logname}][Error]: ${message} was printed from ${info.short_src}:${info.currentline}`);
    }
    
}