import { authRoutes } from "./auth.router.js"
import { collectionsRouter } from "./collections.router.js"
import { reposRouter } from "./repo.router.js"

export const initializeRoutes = (app) => {
    app.use(`/api/auth`, authRoutes)
    app.use(`/api/github`, collectionsRouter)
    app.use(`/api/github/repos`, reposRouter)
}