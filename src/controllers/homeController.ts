import { Request, Response } from "express";

export const homeController = {
    async handleHomePage(req: Request, res: Response): Promise<void> {
        res.send("Home Page");
    },
};
