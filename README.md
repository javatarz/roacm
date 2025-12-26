# Ramblings of a Coder's Mind (Source)

Source for the "Ramblings of a Coder's Mind" blog that's hosted at [karun.me](https://karun.me) (previously [blog.karun.me](https://blog.karun.me) and [karunab.com](https://karunab.com))

## Local development

```
./local_run.sh
docker run -v $(pwd):/srv/jekyll --user $(id -u):$(id -g) local-jekyll thor jekyll:new Title for the new post

echo "Find all categories: "
awk '/^categories:/{flag=1; next} /^[a-zA-Z]/ && flag{flag=0} flag && /^  - /{gsub(/^  - /, ""); print}' _posts/*.markdown | sort -u

echo "Find articles by category"
awk -v cat="Tutorials" '/^categories:/{flag=1; next} /^[a-zA-Z]/ && flag{flag=0} flag && /^- /{gsub(/^  - /, ""); if($0==cat) print FILENAME}' _posts/*.markdown
```
