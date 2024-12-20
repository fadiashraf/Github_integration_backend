import { logger } from "../config/logger.config.js";
import { integrationRepo } from "../repos/integration.repo.js";
import { ApiError } from "../helpers/ApiError.js";
import { orgsRepo } from "../repos/orgs.repo.js";
import { commitsRepo } from "../repos/Commits.repo.js";
import { reposRepo } from "../repos/repos.repo.js";
import { pullRequestRepo } from "../repos/pullRequest.repo.js";
import { issuesRepo } from "../repos/issues.repo.js";
import { usersRepo } from "../repos/users.repo.js";
import { generateToken } from "./token.service.js";
import { OctokitService } from "./octokit.service.js";


class GitHubService {
    constructor() {
        this.octokitService = new OctokitService();
    }

    async generateAuthUrl () {
        return this.octokitService.generateAuthUrl();
    }

    async getGithubIntegration (integrationId) {
        try {
            const integration = (await integrationRepo.findById(integrationId, "-accessToken"))?.toJSON();
            if (!integration) {
                logger.error(`Integration not found: ${integrationId}`);
                throw new ApiError("404", "Integration not found");
            }
            return integration;
        } catch (error) {
            logger.error(`Error in getGithubIntegration for ID ${integrationId}:`, error);
            throw new ApiError(error.status || 500, error.message || "Failed to get GitHub integration");
        }
    }

    async processCommits ({ token, repoName, owner, repoId, orgId, integrationId }) {
        try {
            logger.info(`Start syncing commits of ${repoId}`);

            const commits = await this.octokitService.getCommitsOfRepo({ token, repo: repoName, owner });
            if (!commits.length) {
                logger.info(`No commits found for ${owner}/${repoName}`);
                return;
            }

            const newCommits = commits.map(commit => ({
                url: commit.url,
                sha: commit.sha,
                authorName: commit.commit.author?.name,
                authorEmail: commit.commit.author?.email,
                authorDate: commit.commit.author?.date,
                committerName: commit.commit.committer?.name,
                committerEmail: commit.commit.committer?.email,
                committedDate: commit.commit.committer?.date,
                tree: commit.commit.tree,
                message: commit.commit.message,
                repoId,
                orgId,
                integrationId
            }));

            await commitsRepo.bulkWriteUpsert(newCommits);
            logger.info(`Successfully synced ${newCommits.length} commits for ${owner}/${repoName}`);
        } catch (error) {
            logger.error(`Error processing commits for ${owner}/${repoName}:`, error);
        }
    }

    async processUsers ({ token, owner, orgId, integrationId }) {
        try {
            logger.info(`Start syncing users of organization ${owner}`);

            const users = await this.octokitService.getUsersOfOrg({ token, owner });
            if (!users.length) {
                logger.info(`No users found for organization ${owner}`);
                return;
            }

            const newUsers = users.map(user => ({
                login: user.login,
                githubId: user.id,
                nodeId: user.node_id,
                followersUrl: user.followers_url,
                followingUrl: user.following_url,
                subscriptionsUrl: user.subscriptions_url,
                organizationsUrl: user.organizations_url,
                reposUrl: user.repos_url,
                type: user.type,
                siteAdmin: user.site_admin,
                integrationId,
                orgId,
            }));

            await usersRepo.bulkWriteUpsert(newUsers);
            logger.info(`Successfully synced ${newUsers.length} users for organization ${owner}`);
        } catch (error) {
            logger.error(`Error processing users for org ${owner}:`, error);
        }
    }

    async processPullRequests ({ token, repoName, owner, repoId, orgId, integrationId }) {
        try {
            const prs = await this.octokitService.getPRsOfRepo({ token, repo: repoName, owner });
            if (!prs.length) {
                logger.info(`No PRs found for ${owner}/${repoName}`);
                return;
            }

            const newPRs = prs.map(pr => ({
                pullReqGithubId: pr.id,
                title: pr.title,
                state: pr.state,
                url: pr.url,
                createdAt: pr.created_at,
                updatedAt: pr.updated_at,
                closedAt: pr.closed_at,
                mergedAt: pr.merged_at,
                merge_commit_sha: pr.merge_commit_sha,
                authorLogin: pr.user?.login,
                assignees: pr.assignees,
                repoId,
                orgId,
                integrationId
            }));

            await pullRequestRepo.bulkWriteUpsert(newPRs);
            logger.info(`Successfully synced ${newPRs.length} PRs for ${owner}/${repoName}`);
        } catch (error) {
            logger.error(`Error processing PRs for ${owner}/${repoName}:`, error);
        }
    }

    async processIssues ({ token, repoName, owner, repoId, orgId, integrationId }) {
        try {
            const issues = await this.octokitService.getIssuesOfRepo({ token, repo: repoName, owner });
            if (!issues.length) {
                logger.info(`No issues found for ${owner}/${repoName}`);
                return;
            }

            const newIssues = issues.map(issue => ({
                issueId: issue.id,
                title: issue.title,
                state: issue.state,
                url: issue.url,
                createdAt: issue.created_at,
                updatedAt: issue.updated_at,
                closedAt: issue.closed_at,
                authorLogin: issue.user?.login,
                labels: issue.labels,
                repoId,
                orgId,
                integrationId
            }));

            await issuesRepo.bulkWriteUpsert(newIssues);
            logger.info(`Successfully synced ${newIssues.length} issues for ${owner}/${repoName}`);
        } catch (error) {
            logger.error(`Error processing issues for ${owner}/${repoName}:`, error);
        }
    }

    async processRepository ({ repo, token, org, integrationId }) {
        try {
            const repoData = {
                githubRepoId: repo.id,
                integrationId,
                orgId: org._id,
                name: repo.name,
                description: repo.description,
                url: repo.html_url,
                defaultBranch: repo.default_branch,
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                createdAt: repo.created_at,
                updatedAt: repo.updated_at
            };

            const createdRepo = await reposRepo.updateOne(
                { githubRepoId: repo.id },
                repoData,
                { upsert: true }
            );
            logger.info(`Start syncing repo ${repo.name}`);

            await Promise.allSettled([
                this.processCommits({ token, repoName: repo.name, owner: org.name, repoId: createdRepo._id, orgId: org._id, integrationId }),
                this.processPullRequests({ token, repoName: repo.name, owner: org.name, repoId: createdRepo._id, orgId: org._id, integrationId }),
                this.processIssues({ token, repoName: repo.name, owner: org.name, repoId: createdRepo._id, orgId: org._id, integrationId })
            ]);

            logger.info(`Finish syncing repo ${repo.name}`);
        } catch (error) {
            logger.error(`Error processing repository ${repo?.name}:`, error);
        }
    }

    async processOrganization (org, token, integrationId) {
        try {
            const orgData = {
                githubOrgId: org.id,
                url: org.url,
                name: org.login,
                description: org.description,
                avatarUrl: org.avatar_url,
                integrationId
            };
            logger.info(`Syncing organization ${org.login}`);

            const createdOrg = await orgsRepo.updateOne(
                { githubOrgId: org.id },
                orgData,
                { upsert: true }
            );

            await this.processUsers({ token, orgId: createdOrg._id, owner: org.login, integrationId });

            const repos = await this.octokitService.getReposOfOrg(token, createdOrg.name);
            if (repos?.length) {
                await Promise.allSettled(
                    repos.map(repo => this.processRepository({ repo, token, org: createdOrg, integrationId }))
                );
            }

            logger.info(`Finished syncing organization ${org.login}`);
        } catch (error) {
            logger.error(`Error processing organization ${org?.login}:`, error);
        }
    }

    async validateSyncAvailability (integrationId) {
        const integration = await integrationRepo.findById(integrationId);

        if (!integration) {
            throw new ApiError(404, "Integration not found");
        }

        if (integration.isSyncLoading) {
            throw new ApiError(409, "Integration sync already in progress");
        }
    }

    async startSync (integrationId) {
        await this.validateSyncAvailability(integrationId);
        this.executeSyncProcess(integrationId);
    }

    async executeSyncProcess (integrationId) {
        try {
            logger.info(`Starting integration sync: ${integrationId}`);

            await this.markSyncInProgress(integrationId);
            await this.syncOrganizations(integrationId);
            await this.markSyncComplete(integrationId);

            logger.info(`Integration sync completed successfully: ${integrationId}`);
        } catch (error) {
            await this.handleSyncError(integrationId, error);
        }
    }

    async syncOrganizations (integrationId) {
        const integration = await integrationRepo.findById(integrationId);
        const organizations = await this.octokitService.getOrgs(integration.accessToken);

        if (organizations?.length) {
            await Promise.allSettled(
                organizations.map(org =>
                    this.processOrganization(org, integration.accessToken, integrationId)
                )
            );
        }
    }

    async markSyncInProgress(integrationId) {
        await integrationRepo.updateOne(
            { _id: integrationId },
            { isSyncLoading: true }
        );
    }

    async markSyncComplete (integrationId) {
        await integrationRepo.findByIdAndUpdate(
            integrationId,
            {
                lastSyncAt: new Date(),
                isSyncLoading: false
            }
        );
    }

    async handleSyncError (integrationId, error) {
        logger.error(`Integration sync failed: ${integrationId}`, error);

        if (error instanceof ApiError) {
            throw error;
        }

        await integrationRepo.findByIdAndUpdate(
            integrationId,
            { isSyncLoading: false }
        );



        throw new ApiError(500, "Integration sync failed");
    }

    async handleCallback ({ code, state }) {
        try {
            const { token: access_token, scopes } = await this.octokitService.getTokenFromGithub({ code, state });
            const user = await this.octokitService.getGithubUser(access_token);

            const existedIntegration = await integrationRepo.findOne({ userId: user.id });
            const integration = await integrationRepo.updateOne(
                { userId: user.id },
                {
                    userId: user.id,
                    accessToken: access_token,
                    scope: scopes.join(','),
                    username: user.login,
                    email: user.email,
                    name: user.name,
                    isActive: true
                },
                { upsert: true, new: true }
            );

            const integrationId = integration._id.toString();
            const internalToken = await generateToken(integrationId);

            if (!existedIntegration) {
                setTimeout(() => {
                    this.syncData(integrationId).catch(error => {
                        logger.error(`Initial sync failed for integration ${integrationId}:`, error);
                    });
                }, 0);
            }

            const { accessToken, ...integrationData } = integration?.toJSON();
            return {
                token: internalToken,
                ...integrationData
            };
        } catch (error) {
            logger.error("Handle callback error:", error);
            throw new ApiError(500, 'Authentication failed');
        }
    }

    async getStatus (integrationId) {
        try {
            const integration = await integrationRepo.findById(integrationId);
            if (!integration) {
                throw new ApiError(404, "Integration not found");
            }
            const { accessToken, scope, ...result } = integration.toJSON();
            return result;
        } catch (error) {
            logger.error(`Error getting status for integration ${integrationId}:`, error);
            throw new ApiError(error.status || 500, error.message || "Failed to get integration status");
        }
    }

    async removeConnection (integrationId) {
        try {
            logger.info(`Removing connection for integration ${integrationId}`);

            const integration = await integrationRepo.findByIdAndUpdate(
                integrationId,
                { isActive: false },
                { new: true }
            );

            if (!integration) {
                throw new ApiError(404, "Integration not found");
            }

            // TODO: Add cleanup job for associated data
            logger.info(`Successfully deactivated integration ${integrationId}`);
            return integration;
        } catch (error) {
            logger.error(`Error removing connection for integration ${integrationId}:`, error);
            throw new ApiError(error.status || 500, error.message || "Failed to remove connection");
        }
    }
}

export const githubService = new GitHubService();