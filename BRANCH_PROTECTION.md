# 🛡️ GitHub Branch Protection Setup Guide (`main`)

To secure your production repository, prevent accidental or malicious force-pushes and deletions, require cryptographic commit signatures, and enforce automated CI status checks before merging, follow these step-by-step instructions:

---

## Step 1: Access Repository Settings
1. Go to your GitHub repository (e.g., `https://github.com/piyyy314/satexpert-tsi`).
2. Click on the **Settings** tab in the top repository navigation bar (requires administrator or owner permissions).

---

## Step 2: Navigate to Branch Protection Rules
1. In the left sidebar menu, locate and click on **Code and automation** > **Branches**.
2. Under the **Branch protection rules** section, click the **Add branch protection rule** button.

---

## Step 3: Configure Target Branch Pattern
1. In the **Branch name pattern** input field, type:
   ```text
   main
   ```
   *(This ensures the rule applies specifically to your production default branch).*

---

## Step 4: Enable Core Security Protections
Check the following mandatory security checkboxes:

* ✅ **Require a pull request before merging**
  - Check **Require approvals** and set the required number of approving reviews (e.g., `1`).
  - (Recommended) Check **Dismiss stale pull request approvals when new commits are pushed**.
  - (Recommended) Check **Require review from Code Owners**.

* ✅ **Require status checks to pass before merging**
  - Check this option to ensure code cannot be merged unless automated CI workflows pass.
  - In the search bar that appears, search for and select your required status check:
    ```text
    SatExpert TSI CI / build-and-verify
    ```
  - Check **Require branches to be up to date before merging**.

* ✅ **Require signed commits**
  - Enforces that all commits merged into `main` must be cryptographically signed (using GPG, SSH, or S/MIME keys) to guarantee authenticity and prevent commit tampering.

* ✅ **Require linear history**
  - Prevents merge commits by requiring squash merging or rebase merging, maintaining a clean, auditable Git commit graph.

* ✅ **Do not allow bypassing the above settings**
  - Check **Enforce all above settings for administrators** to ensure repository owners and administrators are bound by the exact same compliance and security controls.

* ✅ **Restrict who can push to matching branches** *(Optional)*
  - If enabled, specify authorized deployment service accounts or release engineering teams permitted to push directly.

---

## Step 5: Prevent Force-Pushes & Deletions
By enabling **Require a pull request before merging** and **Do not allow bypassing**, GitHub automatically and permanently disables:
* 🚫 **Force-pushes** (`git push --force`) to `main`.
* 🚫 **Branch deletion** (`git branch -d main` or remote deletion).

---

## Step 6: Save Rule
1. Scroll to the bottom of the page and click the green **Create** (or **Save changes**) button.

---

### Verification
Once saved, any attempt to push directly to `main` without a pull request or force-push will be rejected by GitHub with:
```text
remote: error: GH006: Protected branch hook declined changes.
remote: error: Direct pushes to main are disabled.
```
