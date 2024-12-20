import { Octokit } from "octokit";
import { config } from "../config/env.config.js";
import { logger } from "../config/logger.config.js";
import { ApiError } from "../helpers/ApiError.js";
import crypto from 'crypto';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';

export class OctokitService {
    constructor() {
        // Create OAuth app instance for app-level authentication
        this.oauthApp = createOAuthAppAuth({
            clientId: config.github.clientId,
            clientSecret: config.github.clientSecret,
        });

        // Create default Octokit instance for app-level operations
        this.octokit = this.createOctokitInstance();
    }

    createOctokitInstance(authToken = '') {
        const options = {
            baseUrl: config.github.apiUrl,
            throttle: {
                onRateLimit: (retryAfter, options, octokit) => {
                    logger.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
                    if (options.request.retryCount === 0) {
                        logger.info(`Retrying after ${retryAfter} seconds!`);
                        return true;
                    }
                },
                onSecondaryRateLimit: (retryAfter, options, octokit) => {
                    logger.warn(`Secondary rate limit hit for ${options.method} ${options.url}`);
                    return true;
                },
            },
            retry: {
                enabled: true,
                retries: 3
            }
        };

        // If token is provided, use token auth, otherwise use OAuth app auth
        if (authToken) {
            options.auth = authToken;
        }

        return new Octokit(options);
    }

    async generateAuthUrl() {
        try {
            const state = crypto.randomBytes(16).toString('hex');
            const params = new URLSearchParams({
                client_id: config.github.clientId,
                redirect_uri: config.github.redirectUri,
                scope: config.github.scope,
                state,
            });
            return { 
                authUrl: `${config.github.authUrl}?${params.toString()}`, 
                state 
            };
        } catch (error) {
            logger.error('Error generating auth URL:', error);
            throw new ApiError(500, "Failed to generate authentication URL");
        }
    }

    async getTokenFromGithub({ code, state }) {
        try {
            const response = await this.oauthApp({
                type: 'oauth-user',
                code,
                state
            });

            if (!response.token) {
                throw new Error('No token received from GitHub');
            }

            return {
                token: response.token,
                scopes: response.scopes || []
            };
        } catch (error) {
            logger.error('Error getting token from GitHub:', error);
            throw new ApiError(500, "Failed to get token from GitHub");
        }
    }

    async getGithubUser(token) {
        try {
            // Create a new Octokit instance with user token
            const userOctokit = this.createOctokitInstance(token);
            const { data: user } = await userOctokit.rest.users.getAuthenticated();
            return user;
        } catch (error) {
            logger.error('Failed to get GitHub user:', error);
            throw new ApiError(500, 'Failed to fetch user data');
        }
    }

    async fetchAllItems(method, token, params = {}) {
        try {
            // Create a new Octokit instance with user token
            const userOctokit = this.createOctokitInstance(token);
            const items = await userOctokit.paginate(method, params);
            return items;
        } catch (error) {
            logger.error(`Error fetching items for ${method}:`, error);
            if (error.status === 404) {
                return [];
            }
            throw new ApiError(error.status || 500, error.message || 'Failed to fetch items');
        }
    }

    async getOrgs(token) {
        try {
            return await this.fetchAllItems('GET /user/orgs', token);
        } catch (error) {
            logger.error('Error getting organizations:', error);
            throw new ApiError(error.status || 500, 'Failed to fetch organizations');
        }
    }

    async getReposOfOrg(token, orgName) {
        try {
            return await this.fetchAllItems('GET /orgs/{org}/repos', token, { 
                org: orgName,
                per_page: 100,
                sort: 'updated',
                direction: 'desc'
            });
        } catch (error) {
            logger.error(`Error getting repos for org ${orgName}:`, error);
            throw new ApiError(error.status || 500, `Failed to fetch repositories for ${orgName}`);
        }
    }

    async getCommitsOfRepo({ token, repo, owner }) {
        try {
            return await this.fetchAllItems('GET /repos/{owner}/{repo}/commits', token, {
                owner,
                repo,
                per_page: 100
            });
        } catch (error) {
            logger.error(`Error getting commits for ${owner}/${repo}:`, error);
            throw new ApiError(error.status || 500, `Failed to fetch commits for ${owner}/${repo}`);
        }
    }

    async getPRsOfRepo({ token, repo, owner }) {
        try {
            return await this.fetchAllItems('GET /repos/{owner}/{repo}/pulls', token, {
                owner,
                repo,
                state: 'all',
                per_page: 100,
                sort: 'updated',
                direction: 'desc'
            });
        } catch (error) {
            logger.error(`Error getting PRs for ${owner}/${repo}:`, error);
            throw new ApiError(error.status || 500, `Failed to fetch pull requests for ${owner}/${repo}`);
        }
    }

    async getIssuesOfRepo({ token, repo, owner }) {
        try {
            return await this.fetchAllItems('GET /repos/{owner}/{repo}/issues', token, {
                owner,
                repo,
                state: 'all',
                per_page: 100,
                sort: 'updated',
                direction: 'desc'
            });
        } catch (error) {
            logger.error(`Error getting issues for ${owner}/${repo}:`, error);
            throw new ApiError(error.status || 500, `Failed to fetch issues for ${owner}/${repo}`);
        }
    }

    async getUsersOfOrg({ token, owner }) {
        try {
            return await this.fetchAllItems('GET /orgs/{org}/members', token, {
                org: owner,
                per_page: 100,
                role: 'all'
            });
        } catch (error) {
            logger.error(`Error getting users for org ${owner}:`, error);
            throw new ApiError(error.status || 500, `Failed to fetch users for ${owner}`);
        }
    }
}