# Workflows

We have pretty similar workflows for each OS.

## [Monokle publish]

Runs for every created reelase on Github

### Macos

- `Context`

- `Checkout Project`

- `Verify Runner Resources`

- `Install Tools`
jq is needed for adding these environment inside the application and defining the release version

- `Add MacOS certs`

- `Electron mac os security identities`

- `Get Node Version`

- `Use Node.js`

- `Install Dependencies`

- `Install dmg-license`

- `Build`
This step is need to add our ENV variables for the application. We need to add into this step, it will inject ENV into electron/env.json file

- `Package`

- `Create release and upload artifacts`
If we add new release, we need to extend its extension here.

- ` Archive Binary`

### Windows

- `Context`

- `Install Tools`
jq is needed for adding these environment inside the application and defining the release version

- `Checkout Project`

- `Get Node Version`

- `Use Node.js`

- `Install Dependencies`

- `Build`
This step is need to add our ENV variables for the application. We need to add into this step, it will inject ENV into electron/env.json file

- `Package`

- `Create release and upload artifacts`
If we add new release, we need to extend its extension here.

- `Archive Binary`

### Ubuntu

- `Context`

- `Checkout Project`

- `Get Node Version`

- `Use Node.js`

- `Install Dependencies`

- `Install Tools`
jq is needed for adding these environment inside the application and defining the release version

- `Build`
This step is need to add our ENV variables for the application. We need to add into this step, it will inject ENV into electron/env.json file

- `Package`

- `Create release and upload artifacts`
If we add new release, we need to extend its extension here.

- `Archive Binary`

## [Monokle publish updater]

Runs on every push to `auto-updater` branch

### MacOS

- `Delete release`

- Rest is same with [Monokle publish]

### Windows

- `Delete release`

- Rest is same with [Monokle publish]

### Ubuntu

- `Delete release`

- Rest is same with [Monokle publish]

## [Monokle publish downloads]

Runs on every push to `auto-updater` branch

### MacOS

- `Delete release`

- Rest is same with [Monokle publish]

### Windows

- `Delete release`

- Rest is same with [Monokle publish]

### Ubuntu

- `Delete release`

- Rest is same with [Monokle publish]

## [Monokle publish nightly]

### MACOS
Runs every day with pattern of `0 2 * * *`

- same with [Monokle publish]

### Windows

Runs every day with pattern of `0 2 * * *`

- same with [Monokle publish]

### Linux

Runs every day with pattern of `0 2 * * *`

- same with [Monokle publish]

## Comments

These workflows uses the same steps and they can be merged with the new feature Github intruced.

https://docs.github.com/en/actions/using-workflows/reusing-workflows
