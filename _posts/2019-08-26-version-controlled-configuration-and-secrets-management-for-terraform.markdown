---
layout: post
comments: true
author: Karun Japhet
title: "Version controlled configuration and secrets management for Terraform"
categories:
  - Tutorials
tags:
  - terraform
  - gitlab
  - version control
  - continuous delivery
  - infrastructure as code
---

[Terraform](https://www.terraform.io/) is a tool to build your infrastructure as code. We've been having a few challenges while trying to figure out how to how to manage configuration and secrets when integrating terraform with our CD pipeline.

<!-- more -->
## Life before version control
Before we can do that, it's important to understand build process before we began on this journey.
[![Terraform managed environments]({{ site.url }}/assets/images/uploads/terraform-environments.jpg)]({{ site.url }}/assets/images/uploads/terraform-environments.jpg)

Our build model for this project was branch based. Each environment maps to a branch (`main -> dev`, `uat -> uat` and `production -> production`). All other (feature) branches only ran the plan stage against the `dev` environment.

As you can notice, the configurations, secrets and keys are all maintained on the build agent. This means, every developer wanting to run plan and test their changes needs to replicate the `terraform_variables` directory. Any mistakes in doing so masks actual issues that your pipeline might face leading to delayed feedback.

Next, let's look at what our codebase looked like
{% highlight bash %}
terraform
├── module-1
│   ├── backend.tf
│   ├── data.tf
│   ├── resources.tf
│   ├── provider.tf
│   └── variables.tf
├── module-2
│   ├── backend.tf
│   ├── data.tf
│   ├── resources.tf
│   ├── provider.tf
│   └── variables.tf
└── scripts
    └── provision
        ├── apply.sh
        ├── init.sh
        └── plan.sh
{% endhighlight %}

The provisioning scripts help us consistently run different stages across modules. Each module is an independent area of our infrastructure (such as core networking, HTTP services etc.)

Each of the provisioning scripts accepted a `WORKSPACE_NAME` (branch for execution that maps to the environment terraform is running for) and `MODULE_NAME` (module being executed).

`init.sh` ran the `terraform init` stage of the pipeline downloading the necessary plugins and initializing the backend
{% gist javatarz/52c755ca164de009f1e37bebfdac46ea %}

`plan.sh` ran the `terraform plan` stage allowing users to review their changes before applying them.
{% gist javatarz/5ab158cd0aa7ba492872cff7061d8814 %}

`apply.sh` applied the changes onto an environment. Developers do not run this command from local to ensure consistency on the environment
{% gist javatarz/48795c981c5495d38184a4cf52a1cd2c %}

## Version controlling configuration
We moved the variables into the `config` directory by making a directory for every branch for each of the 3 environments we had.

{% highlight bash %}
terraform
├── config
│   ├── main
│   │   ├── module-1.tfvars
│   │   └── module-2.tfvars
│   ├── production
│   │   ├── module-1.tfvars
│   │   └── module-2.tfvars
│   ├── uat
│   │   ├── module-1.tfvars
│   │   └── module-2.tfvars
├── module-1
│   └── ...
├── module-2
|   └── ...
└── scripts
    ├── provision
    │   ├── apply.sh
    │   ├── functions.sh
    │   ├── init.sh
    │   └── plan.sh
    └── test_variable_names.sh
{% endhighlight %}

According to [terraform's documentation](https://www.terraform.io/docs/configuration/variables.html#environment-variables), you can export a variable that your terraform codes need with a prefix of `TF_VAR`.

`functions.sh` provides convenience functions to read the configuration and secrets.
{% gist javatarz/d9314848516e919952fbfc7c681a5488 %}

`fetch_variables` read the `tfvars` file, removes empty lines (that were added for readability), prefixed the name with `TF_VAR` and joined all entries into a single line. The string this method returns can be used as a prefix to the `terraform` command while running `plan` and `apply` making them environment variables.

*Updated plan and apply scripts are placed in the secrets management section for brevity*

### Testing configuration files
The only limitation is that **none of these variables can have a hyphen** in the name because of [shell variable naming rules](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#Definitions). As with any potential mistake, a test providing feedback helps protect you from run time failures. `test_variable_names.sh` does this check for us.

{% gist javatarz/1497470a61c9f06689deaaf19a1610e1 %}

## Version controlling secrets
Secrets like passwords can be version controlled in a similar way though they require encryption to keep them safe. We're using [OpenSSL](https://www.openssl.org/) with a [symmetric key](https://en.wikipedia.org/wiki/Symmetric-key_algorithm) to encrypt our secrets. Each secret is put into a `tfsecrets` file (internally a property file just like `tfvars` files for configuration). When encrypted, the file will have an extension of `.tfsecrets.enc`. When the `plan` or `apply` stages are executed, files are decrypted **in memory** (and not on disk, for security reasons) and used the same way.

`functions.sh` gets a new addition to support reading all secrets
{% gist javatarz/f78a72e02ce9aced0636d61672a2b777 %}

The astute amongst you probably noticed that we're using OpenSSL v1.0.2s because v1.1.x changes the syntax on encryption/decryption of files. Also, you might have noticed the use of environment variables like `SECRET_KEY_main`, `SECRET_KEY_uat` and `SECRET_KEY_production` as the encryption keys. These values are stored on our CI server (in our case [GitLab](https://gitlab.com/)) which makes these values available to our CI agent during execution.

For local development, we have scripts to encrypt and decrypt configuration files either one at a time or in bulk per environment. It's worth noting that re-encryption of the same file will show up on your `git diff` since the encrypted file's metadata changes. Only check in encrypted files when their contents have changed (helping you debug future issues)

`encrypt.sh` takes `SECRET_KEY` as an environment variable for making local usage easier.
{% gist javatarz/8775d0d2a9ad124eefff9df6b2d431eb %}

`decrypt.sh` also takes the same `SECRET_KEY` as an environment variable for making local usage easier.
{% gist javatarz/f1e33a666587f4ade051e725e196742e %}

### Testing secret files
If all files for an environment aren't checked with the same key, you'll face a runtime error. Since files can be encrypted individually, you must test if all files have been encrypted correctly. This test is also useful when you're rotating the `SECRET_KEY` for an environment.

`test_encryption.sh` needs `SECRET_KEY_<env>` values set so it can be executed locally.
{% gist javatarz/5aedf7066b408511975d3cb97ce0ee5a %}

### End result
Our final project structure contains the following files
```
terraform
├── config
│   ├── main
│   │   ├── module-1.tfvars
│   │   ├── module-1.tfsecrets.enc
│   │   ├── module-2.tfvars
│   │   └── module-2.tfsecrets.enc
│   ├── production
│   │   ├── module-1.tfvars
│   │   ├── module-1.tfsecrets.enc
│   │   ├── module-2.tfvars
│   │   └── module-2.tfsecrets.enc
│   ├── uat
│   │   ├── module-1.tfvars
│   │   ├── module-1.tfsecrets.enc
│   │   ├── module-2.tfvars
│   │   └── module-2.tfsecrets.enc
├── module-1
│   └── ...
├── module-2
|   └── ...
└── scripts
    ├── decrypt.sh
    ├── encrypt.sh
    ├── provision
    │   ├── apply.sh
    │   ├── functions.sh
    │   ├── init.sh
    │   └── plan.sh
    ├── test_encryption.sh
    └── test_variable_names.sh
```

`plan.sh` uses `functions.sh` to load configuration and secrets
{% gist javatarz/3efb6a5d416d4149678b427bc37ff154 %}

`apply.sh` uses `functions.sh` in a similar fashion
{% gist javatarz/8e77d8ee1474a4d06faf9a4cc19ec0df %}

And thus, our terraform project requires no data from the CI agent and can be executed perfectly from any box as long as it has the latest code checked out and the correct version of terraform.
