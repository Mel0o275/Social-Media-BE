import{ Router , type Request, type Response, type Router as RouterType } from "express";

const router:RouterType = Router();

router.get('/', (req:Request, res:Response) => {
    res.send('Hello from Post Service!');
})

export default router;