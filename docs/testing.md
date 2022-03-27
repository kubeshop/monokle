# Testing

Monokle tests are written with [Playwright](https://playwright.dev/docs/api/class-electron).

## **Run Tests**

First create a build to run the tests

`npm run electron:build`

To run specific tests

`npm run ui-test -- tests/<filename>.test.ts`

To run all the tests

`npm run ui-test`

## **Write & Extend Tests**

To start writing tests first create a build(tests are run against the build which will be published), any changes made to the source code, adding identifiers, changing logic will need a new build for those changes to be in the tests

`npm run electron:build`

The `startApp()` function should be called and that will start a new monokle instance with the `automation` flag set. More examples of tests can be found in the `./tests` folder
The `automation` flag is used to change some handlers which cannot be automated by playwright since they are open by the specific OS's

Models should contain most of the logic, we can think of models a mirror for some components in the app with some logic and identifiers for certain elements. Having most of the logic in the models can help with reusing most of the logic we have around tests and more lightweight tests.

## **Overriding OS Actions**

To change handlers such as `dialog.showOpenDialogSync` the function `getChannelName('channel-name')` should be called when creating a new handler on `ipcRenderer`, this will create different handler just for automation.
To add a new handler in automation something like this is required:
```
const name = 'some-value';
const chanel = getChannelName('channel-name', true);
await electronApp.evaluate(({ ipcMain }, params) => {
  ipcMain.handle(params.chanel, () => {
    return [params.name];
  });
}, { chanel, name });
```

Examples:

- [override in electron](https://github.com/kubeshop/monokle/blob/main/src/components/atoms/FileExplorer/FileExplorer.tsx)
- [override in tests](https://github.com/kubeshop/monokle/blob/main/tests/models/projectsDropdown.ts)
