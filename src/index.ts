'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as ini from 'ini';
import * as zlib from 'zlib';

import { IGitInfo, IGitInfoParams } from './typings';

export default class GitInfo {
  get getGitInfo(): IGitInfo {
    return {
      branch: this.getBranch(),
      repository: this.getRepository(),
      sha: this.getSha(),
      commit: this.getCommit(),
      rootDir:  path.dirname(path.resolve(this.gitPath)),
    };
  }
  private gitPath: string;
  private GIT_DIR: string = '.git';
  private headPath: string;
  constructor(args: IGitInfoParams = {}) {
    const { gitPath, GIT_DIR = '.git' } = args;
    this.GIT_DIR = GIT_DIR;
    this.gitPath = this._findRepo(gitPath);
    this.headPath = path.join(this.gitPath, 'HEAD');
  }

  // get branch
  public getBranch(): string {
    try {
      if (fs.existsSync(this.headPath)) {
        const headFile = this._readFile(this.headPath);
        const match = headFile.match(/refs\/heads\/(\S+$)/);
        const branchName = match && match[1];
        return branchName;
      }
    } catch (_) {}
  }
  // get repository
  public getRepository(): string {
    try {
      const configFilePath = path.join(this.gitPath, 'config');
      if (fs.existsSync(configFilePath)) {
        const config = ini.parse(this._readFile(configFilePath));
        const repository = config['remote "origin"'].url;
        return repository;
      }
    } catch (_) {}
  }
  // get sha/commit hash
  public getSha(): string {
    try {
      if (fs.existsSync(this.headPath)) {
        const headFile = fs.readFileSync(this.headPath, 'utf-8');
        let refPath = headFile.split(' ')[1];
        // Find branch and SHA
        if (refPath) {
          refPath = refPath.trim();
          const branchPath = path.join(this.gitPath, refPath);
          const hasBranchPath = fs.existsSync(branchPath);
          return hasBranchPath ? this._readFile(branchPath) : this._findPackedCommit(refPath);
        } else {
          let sha = headFile.split('/').slice(2).join('/').trim();
          if (!sha) {
            sha = headFile.split('/').slice(-1)[0].trim();
          }
          return sha;
        }
      }
    } catch (_) {}
  }
  public getCommit() {
    try {

      const sha = this.getSha();
      if (!sha) { return ''; }
      const objectPath = path.join(this.gitPath, 'objects', sha.slice(0, 2), sha.slice(2));
      if (zlib.inflateSync && fs.existsSync(objectPath)) {
        const objectContents = zlib.inflateSync(fs.readFileSync(objectPath)).toString();
        const commit = objectContents.split(/\0|\r?\n/)
          .filter((item) => {
            return !!item;
          })
          .reduce((data: any, section) => {
            const part = section.slice(0, section.indexOf(' ')).trim();

            switch (part) {
              case 'commit':
              case 'tag':
              case 'object':
              case 'type':
              case 'author':
              case 'parent':
              case 'tree':
                // ignore these for now
                break;
              case 'committer':
                const parts = section.match(/^(?:author|committer)\s(.+)\s(\d+\s(?:\+|\-)\d{4})$/);

                if (parts) {
                  data[part] = parts[1];
                }
                break;
              default:
                // should just be the commit message left
                data.commitMessage  = section;
            }
            return data;
          }, {});
        return commit;
      }
    } catch (_) {}
  }
  private _findPackedCommit(refPath) {
    return this._getPackedRefsForType(refPath, 'commit')[0];
  }
  private _getPackedRefsFile() {
    const packedRefsFilePath = path.join(this.gitPath, 'packed-refs');
    return fs.existsSync(packedRefsFilePath) ? this._readFile(packedRefsFilePath) : false;
  }
  private _getShaBasedOnType(type, shaLine) {
    let shaResult = '';
    if (type === 'tag') {
      shaResult = shaLine.split('tags/')[1];
    } else if (type === 'commit') {
      shaResult = shaLine.split(' ')[0];
    }
    return shaResult;
  }
  private _getLinesForRefPath(packedRefsFile, type, refPath) {
    return packedRefsFile.split(/\r?\n/).reduce((acc, line, idx, arr) => {
      const targetLine = line.indexOf('^') > -1 ? arr[idx - 1] : line;
      return this._doesLineMatchRefPath(type, line, refPath) ? acc.concat(targetLine) : acc;
    }, []);
  }
  private _doesLineMatchRefPath(type, line, refPath) {
    const refPrefix = type === 'tag' ? 'refs/tags' : 'refs/heads';
    return (line.indexOf(refPrefix) > -1 || line.indexOf('^') > -1) && line.indexOf(refPath) > -1;
  }
  private _getPackedRefsForType(refPath, type) {
    const packedRefsFile = this._getPackedRefsFile();
    if (packedRefsFile) {
      return this._getLinesForRefPath(packedRefsFile, type, refPath).map((shaLine) => {
        return this._getShaBasedOnType(type, shaLine);
      });
    }
    return [];
  }
  private _readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8').trim();
  }
  private _findRepoHandleLinkedWorktree(gitPath) {
    const stat = fs.statSync(gitPath);
    if (stat.isDirectory()) {
      return gitPath;
    } else {
      // We have a file that tells us where to find the worktree git dir.  Once we
      // look there we'll know how to find the common git dir, depending on
      // whether it's a linked worktree git dir, or a submodule dir

      const linkedGitDir = fs.readFileSync(gitPath).toString();
      const absolutePath = path.resolve(path.dirname(gitPath));
      const worktreeGitDirUnresolved = /gitdir: (.*)/.exec(linkedGitDir)[1];
      const worktreeGitDir = path.resolve(absolutePath, worktreeGitDirUnresolved);
      return worktreeGitDir;
    }
  }
  private _findRepo(startingPath): string {
    let gitPath;
    let lastPath;
    let currentPath = startingPath || process.cwd();

    do {
      gitPath = path.join(currentPath, this.GIT_DIR);

      if (fs.existsSync(gitPath)) {
        return this._findRepoHandleLinkedWorktree(gitPath);
      }

      lastPath = currentPath;
      currentPath = path.resolve(currentPath, '..');
    } while (lastPath !== currentPath);

    return '';
  }
}
