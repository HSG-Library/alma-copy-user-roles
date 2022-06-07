# Development notes

## Environment to run the CloudApp locally

- `node.js` and `npm` the version to be used can be found in `.nvmrc`. If `node` is installed via `nvm` the correct version will be set automatically
- Install the ECA CLI if not already installed, see [Documentation](https://developers.exlibrisgroup.com/cloudapps/started/): 

       npm install -g @exlibris/exl-cloudapp-cli

- Start local environment `eca start`
- Build (do this at least before a release) `eca build`

## Dependencies
### Project dependencies:
None

### Dependencies added by the ECA framework:
<details><summary>dependecies</summary>
- `"@angular/animations": "~11.2.14"`
- `"@angular/cdk": "~11.2.12"`
- `"@angular/common": "~11.2.14"`
- `"@angular/compiler": "~11.2.14"`
- `"@angular/core": "~11.2.14"`
- `"@angular/forms": "~11.2.14"`
- `"@angular/language-service": "~11.2.14"`
- `"@angular/material": "~11.2.12"`
- `"@angular/platform-browser": "~11.2.14"`
- `"@angular/platform-browser-dynamic": "~11.2.14"`
- `"@angular/router": "~11.2.14"`
- `"@exlibris/exl-cloudapp-angular-lib": "^1.4.1"`
- `"@exlibris/exl-cloudapp-base": "^1.4.1"`
- `"@ngx-translate/core": "~13.0.0"`
- `"lodash": "~4.17.21"`
- `"rxjs": "~6.5.5"`
- `"zone.js": "~0.10.3"`
</details> <br>

<details><summary>devDependencies</summary>
- `"@angular-devkit/build-angular": "~0.1102.14"`
- `"@angular/cli": "~11.2.14"`
- `"@angular/compiler-cli": "~11.2.14"`
- `"@types/node": "~16.0.0"`
- `"postcss": "~8.3.0"`
- `"typescript": "~4.1.5"`
</details><br>

## Dependecy update
Dependencies added by the ECA framework can mostly be ignored.

- Look for outdated dependencies: `npm outdated`
- Update safley, according to `package.json` [syntax (`~`, `^`)](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#dependencies) : `npm update` 
