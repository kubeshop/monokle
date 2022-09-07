sha256=$(shasum -a 256 dist/Monokle-mac-universal.dmg | awk '{print $1}')
version=$(jq -r .version package.json)
description=$(jq -r .description package.json)

cat  << EOF
cask "monokle" do  
    version "$version"
    url "https://github.com/kubeshop/monokle/releases/download/${TAG}/Monokle-mac-universal.dmg"
    sha256 "$sha256"
    name "Monokle"
    desc "$description"
    homepage "https://monokle.io/"
    app "Monokle.app"
  end
EOF