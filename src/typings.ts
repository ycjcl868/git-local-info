export interface ICommit {
  commitMessage?: string;
  committer?: string;
}

export interface IGitInfo {
  /** The current branch */
  branch: string;
  /** The current repository url */
  repository: string | null;
  /** SHA of the current commit */
  sha: string;
  /** The committer of the current SHA */
  commit: ICommit;
  /** The commit message for the current SHA */
  rootDir: string;
}

export interface IGitInfoParams {
  gitPath?: string;
  GIT_DIR?: string;
}
