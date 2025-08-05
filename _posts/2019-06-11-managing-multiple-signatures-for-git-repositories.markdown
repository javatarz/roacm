---
layout: post
comments: true
author: Karun Japhet
title: "Managing multiple signatures for git repositories"
categories:
  - Tutorials
tags:
  - Git
  - Signing
---

Github explains pretty well [how to sign commits](https://help.github.com/en/articles/signing-commits). You can make it automatic by globally setting `commit.gpgsign = true` by using

```bash
git config --global commit.gpgsign true
```
What if you have different signatures for your personal ID and your work ID?

{{ site.excerpt_separator }}

First, you create multiple signatures. It is important that the **email address in the signature is the same as the one for the user who has authored the commit**. Run `gpg -K --keyid-format SHORT` to see all available keys. The output looks like

```
/Users/karun/.gnupg/pubring.kbx
-------------------------------
sec   rsa4096/11111111 2019-06-11 [SC]
      1234567890123456789012345678901211111111
uid         [ultimate] Karun Japhet <karun@personal.com>
ssb   rsa4096/22222222 2019-06-11 [E]

sec   rsa4096/33333333 2019-06-11 [SC]
      0987654321098765432109876543210933333333
uid         [ultimate] Karun Japhet <karunj@work.com>
ssb   rsa4096/44444444 2019-06-11 [E]
```

Fetch the ID for each of the signatures. The ID for the personal signature is 11111111 and that for the work signature is 33333333. To assign a signature to the repo, execute `git config user.signingkey <ID>`.

Personally, I have aliases for personal and work signatures and every time I checkout a project, run the alias once.
```bash
alias signpersonal= "git config user.signingkey 11111111 && git config user.email \"karun@personal.com\""
alias signwork    = "git config user.signingkey 33333333 && git config user.email \"karun@work.com\""
```

Run `git log --show-signature` to verify if a commit used the right signature. Happy commit-signing.
