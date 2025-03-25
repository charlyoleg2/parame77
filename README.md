Parame77
========


Presentation
------------

*Parame77* is the top-monorepo for the design-library *desi77*, which contains a collection of 3D shapes.

This monorepo contains the following *javascript* package:

1. desi77: a *parametrix* design library
2. desi77-cli: the cli of desi77
3. desi77-ui: the web-ui of desi77
4. desi77-uis: the web-server of desi77-ui

This repo is a typical designer-repository using [parametrix](https://charlyoleg2.github.io/parametrix/).
The design-library and its associated UI and CLI are published as *npm-packages*.
The UI is also available on the github-page.


Links
-----

- [desi77-ui](https://MYNAME.github.io/parame77/) : public instance of the UI
- [sources](https://github.com/MYNAME/parame77) : git-repository
- [pkg](https://www.npmjs.com/package/desi77) : desi77 as npm-package
- [pkg-cli](https://www.npmjs.com/package/desi77-cli) : desi77-cli as npm-package
- [pkg-uis](https://www.npmjs.com/package/desi77-uis) : desi77-uis as npm-package


Usage for Makers
----------------

Parametrize and generate your 3D-files with the online-app:

[https://MYNAME.github.io/parame77/](https://MYNAME.github.io/parame77/)

Or use the UI locally:

```bash
npx desi77-uis
```

Or use the command-line-interface (CLI):

```bash
npx desi77-cli
```

Getting started for Dev
-----------------------

```bash
git clone https://github.com/MYNAME/parame77
cd parame77
npm i
npm run ci
npm run preview
```

Other useful commands:
```bash
npm run clean
npm run ls-workspaces
npm -w desi77 run check
npm -w desi77 run build
npm -w desi77-ui run dev
```

Prerequisite
------------

- [node](https://nodejs.org) version 22.0.0 or higher
- [npm](https://docs.npmjs.com/cli/v11/commands/npm) version 11.0.0 or higher


Publish a new release
---------------------

```bash
npm run versions
git commit -am 'increment sub versions'
npm version patch
git push
git push origin v0.5.6
```
