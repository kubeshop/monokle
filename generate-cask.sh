output=$(shasum -a 256 dist/Monokle-mac-universal.dmg)
version=$(jq -r .version package.json)

cat  << EOF
cask "monokle" do  
    version "$version"
    url "https://github.com/kubeshop/monokle/releases/download/latest-version/Monokle-mac-universal.dmg"
    sha256 "$output"
    name "Monokle"
    desc "UI for managing k8s manifests"
    homepage "https://monokle.io/"
    app "Monokle.app"
  end
EOF