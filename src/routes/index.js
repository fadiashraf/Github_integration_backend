import { authRoutes } from "./auth.routes.js"
import { githubDataRoutes } from "./githubData.router.js"

export const initializeRoutes = (app) => {
    app.use(`/api/auth`, authRoutes)
    app.use(`/api/github`, githubDataRoutes)
}