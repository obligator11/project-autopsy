import os
import shutil
from git import Repo, GitCommandError

CACHE_DIR = os.path.join(os.path.expanduser("~"), ".project-autopsy", "repo-cache")


def get_cached_repo_path(clone_url: str, name: str) -> str:
    os.makedirs(CACHE_DIR, exist_ok=True)
    local_path = os.path.join(CACHE_DIR, name)

    if os.path.isdir(local_path) and os.path.isdir(os.path.join(local_path, ".git")):
        try:
            repo = Repo(local_path)
            repo.remotes.origin.pull()
        except GitCommandError:
            pass
        return local_path

    if os.path.isdir(local_path):
        shutil.rmtree(local_path)

    Repo.clone_from(clone_url, local_path)
    return local_path