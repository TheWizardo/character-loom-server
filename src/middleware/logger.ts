import { NextFunction, Request, Response } from "express";

// mostly for debugging
// logs incoming requests
function logger(req: Request, res: Response, next: NextFunction): void {
    const urlParts = (req.baseUrl + req.originalUrl).split("?")
    if (urlParts.length === 1) {
        console.log(`${req.method} ${urlParts[0]}`);
    }
    else {
        const url = [];
        for (let u of urlParts[1].split("&")) {
            if (!u.includes("privateKey")) {
                url.push(u);
            }
        }
        if (url.length === 0) {
            console.log(`${req.method} ${urlParts[0]}`);
        }
        else {
            
        console.log(`${req.method} ${urlParts[0]}?${url.join("&")}`);
        }
    }
    next();
}

export default logger;