// Purpose: Logger class to log messages to the console.

export class Logger { 
    
    public logname: string; 
    public loglevel: number;
    
    constructor(name: string) {
        this.logname = name;            
        this.loglevel = _G["ets_loglevel"];

        PrintInfo(`Logger initialized for ${name} with loglevel ${this.loglevel}`);
    }

    log(message: string) {
        const info = debug.getinfo(2, "Sl");
        if(this.loglevel >= 5) {
            print(`[${this.logname}][Log]: ${message} was printed from ${info.short_src}:${info.currentline}`);
        }
    }

    debug(message: string) {
        const info = debug.getinfo(2, "Sl");
        if(this.loglevel >= 4) {
            PrintDebug(`[${this.logname}][Debug]: ${message} was printed from ${info.short_src}:${info.currentline}`);
        }
    }


    info(message: string) {
        const info = debug.getinfo(2, "Sl");
        if(this.loglevel >= 3) {
            PrintInfo(`[${this.logname}][Info]: ${message} was printed from ${info.short_src}:${info.currentline}`);
        }
    }

    warn(message: string) {
        const info = debug.getinfo(2, "Sl");
        if(this.loglevel >= 2) {
            print(`\\27[33m[${this.logname}][Warn]: ${message} was printed from ${info.short_src}:${info.currentline}\\27[0m`);
        }
    }

    error(message: string) {
        const info = debug.getinfo(2, "Sl");
        if(this.loglevel >= 1) {
            PrintError(`[${this.logname}][Error]: ${message} was printed from ${info.short_src}:${info.currentline}`);
        }
    }
    
}