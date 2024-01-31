import { Router} from "express";

import CheckerController from "./CheckerController.js"; 

const checkerRouter = new Router()

checkerRouter.post('/checker', CheckerController.checker)

export default checkerRouter;
