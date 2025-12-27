---
layout: post
comments: true
author: Karun Japhet
title: "Version controlled configuration and secrets management for Terraform"
description: "Version control Terraform configuration and secrets safely using encrypted tfsecrets files with OpenSSL. Complete CI/CD pipeline setup included."
category: Platform Engineering
tags:
  - infrastructure-as-code
  - security
  - ci-cd
cross_post: [devto, medium]
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

```bash
#!/bin/bash
set -e

cd $MODULE_NAME

echo "init default.tfstate"
terraform init -backend-config="key=default.tfstate"

echo "select or create new workspace $WORKSPACE_NAME"
terraform workspace select $WORKSPACE_NAME || terraform workspace new $WORKSPACE_NAME

echo "init $MODULE_NAME/terraform.tfstate"
terraform init -backend-config="key=$MODULE_NAME/terraform.tfstate" -force-copy -reconfigure
```

`plan.sh` ran the `terraform plan` stage allowing users to review their changes before applying them.

```bash
#!/bin/bash
set -e

cd $MODULE_NAME

echo "select or create new workspace $WORKSPACE_NAME"
terraform workspace select $WORKSPACE_NAME || terraform workspace new $WORKSPACE_NAME

echo "plan with var file ~/terraform_variables/$WORKSPACE_NAME/$MODULE_NAME.tfvars"
terraform plan -var-file=~/terraform_variables/$WORKSPACE_NAME/$MODULE_NAME.tfvars -out=$MODULE_NAME.tfplan -input=false
```

`apply.sh` applied the changes onto an environment. Developers do not run this command from local to ensure consistency on the environment

```bash
#!/bin/bash
set -e

cd $MODULE_NAME

echo "select or create new workspace $WORKSPACE_NAME"
terraform workspace select $WORKSPACE_NAME || terraform workspace new $WORKSPACE_NAME

echo "apply with var file ~/terraform_variables/$WORKSPACE_NAME/$MODULE_NAME.tfvars"
terraform apply -var-file=~/terraform_variables/$WORKSPACE_NAME/$MODULE_NAME.tfvars -auto-approve
```

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

```bash
#!/bin/bash

function fetch_variables() {
    workspace_name=$1
    module_name=$2

    echo $(cat ../config/$workspace_name/$module_name.tfvars | sed '/^$/D' | sed 's/.*/TF_VAR_& /' | tr -d '\n')
}
```

`fetch_variables` read the `tfvars` file, removes empty lines (that were added for readability), prefixed the name with `TF_VAR` and joined all entries into a single line. The string this method returns can be used as a prefix to the `terraform` command while running `plan` and `apply` making them environment variables.

*Updated plan and apply scripts are placed in the secrets management section for brevity*

### Testing configuration files
The only limitation is that **none of these variables can have a hyphen** in the name because of [shell variable naming rules](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html#Definitions). As with any potential mistake, a test providing feedback helps protect you from run time failures. `test_variable_names.sh` does this check for us.

```bash
#!/bin/bash

function parse_and_test_properties_entries() {
    prop=$1
    if [[ "$prop" == "" || $prop = \#* ]]; then
        continue
    fi

    key="$(cut -d'=' -f1 <<<"$prop")"
    if [[ $key =~ "-" ]]; then
        echo "$filename contains \"$key\" which contains a hyphen"
        exit 1
    fi
}

function parse_file() {
    filename=$1
    OLD_IFS=$IFS
    props=$(cat $filename)

    IFS=$'\n'
    for prop in ${props[@]}; do
        parse_and_test_properties_entries $prop
    done
    IFS=$OLD_IFS
}

base_dir="config"
for sub_dir in $(find $base_dir -mindepth 1 -maxdepth 1 -type d); do
    workspace_name=${sub_dir#"$base_dir/"}

    for input_file in config/$workspace_name/*.tfvars; do
        parse_file $input_file
    done

    echo "All variables are named correctly in config/$workspace_name"
done
```

## Version controlling secrets
Secrets like passwords can be version controlled in a similar way though they require encryption to keep them safe. We're using [OpenSSL](https://www.openssl.org/) with a [symmetric key](https://en.wikipedia.org/wiki/Symmetric-key_algorithm) to encrypt our secrets. Each secret is put into a `tfsecrets` file (internally a property file just like `tfvars` files for configuration). When encrypted, the file will have an extension of `.tfsecrets.enc`. When the `plan` or `apply` stages are executed, files are decrypted **in memory** (and not on disk, for security reasons) and used the same way.

`functions.sh` gets a new addition to support reading all secrets

```bash
function fetch_secrets() {
    workspace_name=$1
    module_name=$2
    secret_key_for_workspace=$(eval "echo \$SECRET_KEY_$workspace_name")
    echo $(openssl enc -aes-256-cbc -d -in ../config/$workspace_name/$module_name.tfsecrets.enc -pass pass:$secret_key_for_workspace | sed '/^$/D' | sed 's/.*/TF_VAR_& /' | tr -d '\n')
}
```

The astute amongst you probably noticed that we're using OpenSSL v1.0.2s because v1.1.x changes the syntax on encryption/decryption of files. Also, you might have noticed the use of environment variables like `SECRET_KEY_main`, `SECRET_KEY_uat` and `SECRET_KEY_production` as the encryption keys. These values are stored on our CI server (in our case [GitLab](https://gitlab.com/)) which makes these values available to our CI agent during execution.

For local development, we have scripts to encrypt and decrypt configuration files either one at a time or in bulk per environment. It's worth noting that re-encryption of the same file will show up on your `git diff` since the encrypted file's metadata changes. Only check in encrypted files when their contents have changed (helping you debug future issues)

`encrypt.sh` takes `SECRET_KEY` as an environment variable for making local usage easier.

```bash
#!/bin/bash
set -e

if [ -z "$SECRET_KEY" ]; then
    echo "Set a SECRET_KEY for \"$WORKSPACE_NAME\" encryption"
    exit 1
fi

function encrypt_file() {
    input_file=$1
    target_file="$input_file.enc"
    echo "Encrypting $input_file to $target_file"
    openssl enc -aes-256-cbc -salt -in $input_file -out $target_file -pass pass:$SECRET_KEY
    rm -f $input_file
}

if [ -z $1 ]; then
    echo "Usage:"
    echo "  ./scripts/encrypt.sh <filePathFromProjectRoot>"
    echo "  ./scripts/encrypt.sh all"
    exit 2
elif [ "$1" == "all" ]; then
    for input_file in config/$WORKSPACE_NAME/*.tfsecrets; do
        encrypt_file $input_file
    done
else
    encrypt_file $1
fi
```

`decrypt.sh` also takes the same `SECRET_KEY` as an environment variable for making local usage easier.

```bash
#!/bin/bash
set -e

if [ -z "$SECRET_KEY" ]; then
    echo "Set a SECRET_KEY for \"$WORKSPACE_NAME\" decryption"
    exit 1
fi

function decrypt_file() {
    input_file=$1
    target_file=${input_file%".enc"}
    echo "Decrypting $input_file to $target_file"
    openssl enc -aes-256-cbc -d -in $input_file -out $target_file -pass pass:$SECRET_KEY
    rm -f $input_file
}

if [ -z $1 ]; then
    echo "Usage:"
    echo "  ./scripts/decrypt.sh <filePathFromProjectRoot>"
    echo "  ./scripts/decrypt.sh all"
    exit 2
elif [ "$1" == "all" ]; then
    for input_file in config/$WORKSPACE_NAME/*.tfsecrets.enc
    do
        decrypt_file $input_file
    done
else
    decrypt_file $1
fi
```

### Testing secret files
If all files for an environment aren't checked with the same key, you'll face a runtime error. Since files can be encrypted individually, you must test if all files have been encrypted correctly. This test is also useful when you're rotating the `SECRET_KEY` for an environment.

`test_encryption.sh` needs `SECRET_KEY_<env>` values set so it can be executed locally.

```bash
#!/bin/bash

base_dir="config"

for sub_dir in $(find $base_dir -mindepth 1 -maxdepth 1 -type d); do
    workspace_name=${sub_dir#"$base_dir/"}
    password_var_name="\$SECRET_KEY_$workspace_name"
    secret_key_for_workspace=$(eval "echo $password_var_name")

    if [ -z "$secret_key_for_workspace" ]; then
        echo "Variable $password_var_name has not been set. Unable to test"
        exit 1
    fi

    for input_file in config/$workspace_name/*.tfsecrets.enc
    do
        openssl enc -aes-256-cbc -d -in $input_file -pass pass:$secret_key_for_workspace &> /dev/null
        if [ $? != 0 ]; then
            echo "Unable to decrypt $input_file with $password_var_name"
            exit 1
        fi
    done

    echo "Successfully decrypted all secrets in config/$workspace_name"
done
```

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

```bash
#!/bin/bash
set -e

source $(dirname "$0")/functions.sh

cd $MODULE_NAME

echo "select or create new workspace $WORKSPACE_NAME"
terraform workspace select $WORKSPACE_NAME || terraform workspace new $WORKSPACE_NAME

echo "plan with var file config/$WORKSPACE_NAME/$MODULE_NAME.tfvars"
config=$(fetch_variables $WORKSPACE_NAME $MODULE_NAME)
secrets=$(fetch_secrets $WORKSPACE_NAME $MODULE_NAME)
eval "$secrets $config terraform plan -out=$MODULE_NAME.tfplan -input=false"
```

`apply.sh` uses `functions.sh` in a similar fashion

```bash
#!/bin/bash
set -e

source $(dirname "$0")/functions.sh

cd $MODULE_NAME

echo "select or create new workspace $WORKSPACE_NAME"
terraform workspace select $WORKSPACE_NAME || terraform workspace new $WORKSPACE_NAME

echo "apply with var file config/$WORKSPACE_NAME/$MODULE_NAME.tfvars"
config=$(fetch_variables $WORKSPACE_NAME $MODULE_NAME)
secrets=$(fetch_secrets $WORKSPACE_NAME $MODULE_NAME)
eval "$secrets $config terraform apply -auto-approve"
```

And thus, our terraform project requires no data from the CI agent and can be executed perfectly from any box as long as it has the latest code checked out and the correct version of terraform.
