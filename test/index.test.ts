'use strict';

import * as assert from 'assert';
import * as path from 'path';
import GitInfo from '../src';

const root = process.cwd();
const testFixturesPath = path.join(__dirname, 'fixtures');
const gitDir = 'dot-git';

describe('git-repo-info', () => {
  afterEach(() => {
    process.chdir(root);
  });

  describe('repoInfo', () => {

    it('returns an object with repo info', () => {
      const project = 'branch-with-slashes';
      const repoRoot = path.join(testFixturesPath, project);
      const localGitDir = path.join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;
      const repository = `https://github.com/abc/${project}.git`;

      const expected = {
        branch: 'feature/branch/with/slashes',
        sha: '5359aabd3872d9ffd160712e9615c5592dfe6745',
        commit: null,
        rootDir: repoRoot,
        repository,
      };

      assert.deepEqual(result, expected);
    });

    it('returns an object with repo info', () => {
      const project = 'commit-packed';
      const repoRoot = path.join(testFixturesPath, project);
      const localGitDir = path.join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;
      const repository = `https://github.com/abc/${project}.git`;

      const expected = {
        branch: 'develop',
        sha: 'd670460b4b4aece5915caf5c68d12f560a9fe3e4',
        commit: null,
        rootDir: repoRoot,
        repository,
      };

      assert.deepEqual(result, expected);
    });

    it('returns an object with repo info', () => {
      const project = 'detached-head';
      const repoRoot = path.join(testFixturesPath, project);
      const localGitDir = path.join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;
      const repository = `https://github.com/abc/${project}.git`;

      const expected = {
        branch: null,
        sha: '9dac893d5a83c02344d91e79dad8904889aeacb1',
        commit: null,
        rootDir: repoRoot,
        repository,
      };

      assert.deepEqual(result, expected);
    });

    it('returns an object with repo info', () => {
      const repoRoot = path.join(testFixturesPath, 'linked-worktree');
      process.chdir(path.join(repoRoot, 'linked'));
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
      });
      const result = gitInfo.getGitInfo;
      const repository = 'https://github.com/abc/linked-worktree.git';

      const expected = {
        branch: null,
        sha: '409372f3bd07c11bfacee3963f48571d675268d7',
        commit: null,
        rootDir: path.join(repoRoot, 'dot-git', 'worktrees'),
        repository,
      };

      assert.deepEqual(result, expected);
    });

    it('returns an object with repo info', () => {
      const project = 'nested-repo';
      const repoRoot = path.join(testFixturesPath, project);
      const localGitDir = path.join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;
      const repository = `https://github.com/abc/${project}.git`;

      const expected = {
        branch: 'master',
        sha: '5359aabd3872d9ffd160712e9615c5592dfe6745',
        commit: null,
        rootDir: repoRoot,
        repository,
      };

      assert.deepEqual(result, expected);
    });

    it('returns an object with repo info', () => {
      const repoRoot = path.join(testFixturesPath, 'tag-on-parent');
      const localGitDir = path.join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      const expected = {
        branch: 'master',
        sha: 'fb26504da0ed5cd9ed366f7428c06a8433fd76e6',
        rootDir: repoRoot,
        commit: {
          committer: 'Lukas Kohler <lukas.kohler@ontheblueplanet.com>',
          commitMessage: 'second commit without tag',
        },
        repository: 'https://github.com/abc/tag-on-parent.git',
      };

      assert.deepEqual(result, expected);
    });

    it('returns an object with repo info', () => {
      const repoRoot = path.join(testFixturesPath, 'tag-on-parent-before-merge');
      const localGitDir = path.join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      const expected = {
        branch: 'master',
        sha: 'b60d665ae0978a7b46e2447f4c13d7909997f56c',
        rootDir: repoRoot,
        commit: {
          committer: 'Lukas Kohler <lukas.kohler@ontheblueplanet.com>',
          commitMessage: 'merge red and blue',
        },
        repository: 'https://github.com/abc/tag-on-parent-before-merge.git',
      };

      assert.deepEqual(result, expected);
    });

    it('returns an object with repo info', () => {
      const repoRoot = path.join(testFixturesPath, 'tagged-annotated');
      const localGitDir = path.join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      const expected = {
        branch: 'master',
        sha: 'c1ee41c325d54f410b133e0018c7a6b1316f6cda',
        rootDir: repoRoot,
        commit: {
          committer: 'Robert Jackson <robert.w.jackson@me.com>',
          commitMessage: 'Initial commit.',
        },
        repository: 'https://github.com/abc/tagged-annotated.git',
      };

      assert.deepEqual(result, expected);
    });

    it('returns an object with repo info', () => {
      const repoRoot = path.join(testFixturesPath, 'tagged-commit-mixed-packing');
      const localGitDir = path.join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      const expected = {
        branch: 'master',
        sha: '37ece7ad9ded5f2312bb6be8d0c21ecebca088ac',
        rootDir: repoRoot,
        commit: {
          committer: 'Jack Rowlingson <jrowlingson@esri.com>',
          commitMessage: 'initial commit',
        },
        repository: 'https://github.com/abc/tagged-commit-mixed-packing.git',
      };

      assert.deepEqual(result, expected);
    });

    it('returns an object with repo info', () => {
      const repoRoot = path.join(testFixturesPath, 'tagged-commit-packed');
      const localGitDir = path.join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      const expected = {
        branch: 'master',
        sha: '5359aabd3872d9ffd160712e9615c5592dfe6745',
        rootDir: repoRoot,
        commit: null,
        repository: 'https://github.com/abc/tagged-commit-packed.git',
      };

      assert.deepEqual(result, expected);
    });

    it('returns an object with repo info', () => {
      const repoRoot = path.join(testFixturesPath, 'tagged-commit-packed-annotated');
      const localGitDir = path.join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      const expected = {
        branch: 'master',
        sha: '5359aabd3872d9ffd160712e9615c5592dfe6745',
        rootDir: repoRoot,
        commit: null,
        repository: 'https://github.com/abc/tagged-commit-packed-annotated.git',
      };

      assert.deepEqual(result, expected);
    });

    it('returns an object with repo info', () => {
      const repoRoot = path.join(testFixturesPath, 'tagged-commit-unpacked');
      const localGitDir = path.join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      const expected = {
        branch: 'master',
        sha: 'c1ee41c325d54f410b133e0018c7a6b1316f6cda',
        rootDir: repoRoot,
        commit: {
          committer: 'Robert Jackson <robert.w.jackson@me.com>',
          commitMessage: 'Initial commit.',
        },
        repository: 'https://github.com/abc/tagged-commit-unpacked.git',
      };

      assert.deepEqual(result, expected);
    });

    it('returns an object with repo info', () => {
      const repoRoot = path.join(testFixturesPath, 'tagged-commit-unpacked-no-object');
      const localGitDir = path.join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      const expected = {
        branch: 'master',
        sha: 'c1ee41c325d54f410b133e0018c7a6b1316f6cda',
        rootDir: repoRoot,
        commit: null,
        repository: 'https://github.com/abc/tagged-commit-unpacked-no-object.git',
      };

      assert.deepEqual(result, expected);
    });
  });
});
