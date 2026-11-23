# Publish with GitHub Desktop and GitHub Pages

The project is published at [mullojo/3d-value-blocks](https://github.com/mullojo/3d-value-blocks).

- [Live playground](https://mullojo.github.io/3d-value-blocks/)
- [Design gallery](https://mullojo.github.io/3d-value-blocks/gallery.html)

The playground and gallery are static files, published together. The steps below document the setup and can also be used for a new fork. No npm installation, build service, or separate gallery repository is needed.

## 1. Create the local repository in GitHub Desktop

Open GitHub Desktop and sign in to the GitHub account you want to use.

Choose **File → New Repository…** (on Mac), then use these fields:

| Field | Value |
| --- | --- |
| Name | `3d-value-blocks` |
| Description | A visual playground for 3D value blocks, human contributions, and New Game economy experiments. |
| Local path | The existing **parent folder** named `Value Blocks` in your Labs directory |
| Initialize with README | Leave unchecked; the project already has one. |
| Git ignore | None; the project already has `.gitignore`. |
| License | None in this dialog; the project already has an MIT `LICENSE`. |

Desktop combines Local path + Name. Check that the resulting repository location is the **existing `Value Blocks/3d-value-blocks` folder**. Selecting the project folder itself as Local path would create an unwanted nested folder.

Click **Create Repository**. Desktop should initialize Git in the existing project folder. If you started with **File → Add Local Repository…** and selected this folder, Desktop may offer a “create a repository here” link instead; use the same name and parent-path check.

Review the Changes and History tabs. If the project files appear as uncommitted changes, use the summary `Open source the Value Blocks playground` and click **Commit to main**. If Desktop already included them in its initial commit, there may be nothing left to commit. Confirm the current branch is `main`; use Desktop’s branch menu to rename it if needed.

The 46 gallery images are included in `gallery-assets/captures/` so the gallery is self-contained. Loose `preview*` captures and local browser benchmark files remain ignored. Original off-project captures remain preserved separately.

## 2. Publish the public repository

Click **Publish repository** in Desktop. Choose the account or organization, keep the name `3d-value-blocks` (or your preferred public name), and **uncheck “Keep this code private”** for the open-source release. Click **Publish Repository**.

You can create the GitHub repository through Desktop; you do not need to create another empty repository on the website first. Use **Repository → View on GitHub** when publishing finishes.

## 3. Turn on GitHub Pages

On the repository website:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose branch **main** and folder **/(root)**.
4. Click **Save**.

The included `.nojekyll` file tells Pages to serve this static project without Jekyll processing. The existing checks workflow validates the project; it does not deploy it. GitHub handles branch-based Pages deployment separately.

Wait for GitHub to show the published site URL in Pages settings. For a project repository it normally looks like:

```text
https://YOUR-ACCOUNT.github.io/3d-value-blocks/
https://YOUR-ACCOUNT.github.io/3d-value-blocks/gallery.html
```

Use the actual account and repository name you chose. The site’s links and asset URLs are relative, so the repository prefix works without source changes. Add the live playground URL to the repository’s **About → Website** field. The README links directly to the live playground and gallery. If publishing a fork, update those absolute URLs to your account and repository.

## 4. Future updates

Make changes locally, review them in Desktop, write a commit summary, click **Commit to main**, then **Push origin**. Pages republishes after pushes to its selected branch. Check the repository’s Actions tab if a deployment fails.

Local journal entries are stored per browser origin. A journal saved on localhost will not automatically appear on the GitHub Pages site. Sharing a repository or deploying the static site does not upload those browser records.

## Refreshing the gallery

Add image files to `gallery-assets/captures/` and corresponding captions to `gallery-assets/captures.json`, then run:

```sh
node scripts/build-gallery.cjs
node scripts/check.cjs
```

The generated HTML is committed so the gallery remains build-free at viewing time. Update the gallery’s displayed totals and README overview if the number of captures changes. To refresh the overview image, open `gallery.html?overview=1`, show all studies at a desktop width, and save a full-page browser screenshot as `docs/images/gallery-overview.jpg`.

## Another static host later

The same directory can be deployed to another static host, including Cloudflare Pages. The current site needs no server-side process or build output transformation. Retain the relative asset paths and all local vendor/gallery files when moving hosts. Set up that host’s deployment separately when you are ready.

## References

- [GitHub Desktop: creating a repository](https://docs.github.com/en/desktop/overview/creating-your-first-repository-using-github-desktop)
- [GitHub Desktop: publishing an existing project](https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-an-existing-project-to-github-using-github-desktop)
- [GitHub Pages: choosing a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
