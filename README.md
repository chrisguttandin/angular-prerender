![logo](https://repository-images.githubusercontent.com/142886533/bd323700-e8ff-11e9-9645-75bc009ee359)

# angular-prerender

**An experimental command line tool to prerender an Angular App.**

[![tests](https://img.shields.io/travis/com/chrisguttandin/angular-prerender/master.svg?style=flat-square)](https://travis-ci.com/chrisguttandin/angular-prerender)
[![dependencies](https://img.shields.io/david/chrisguttandin/angular-prerender.svg?style=flat-square)](https://www.npmjs.com/package/angular-prerender)
[![version](https://img.shields.io/npm/v/angular-prerender.svg?style=flat-square)](https://www.npmjs.com/package/angular-prerender)

This command line tool is meant to simplify the build process of static [Angular](https://angular.io/) apps. It works by analyzing the config file created by the [Angular CLI](https://cli.angular.io/). It looks for a client and server app target defined in the angular.json file. It does then execute the server side rendering for each route and merges the output into the static build for the client.

## Usage

angular-prerender is available on [npm](https://www.npmjs.com/package/angular-prerender). It will most likely be a dev dependency of your project. The command to install it will then look like this:

```shell
npm install angular-prerender --save-dev
```

In case you used all the default settings of the CLI angular-prerender will be able to pick up all the necessary information on its own and can be executed by simply calling it on the command line.

```shell
npx angular-prerender
```

It is also possible to skip the explicit installation of angular-prerender.

The following is a complete example which will generate a very basic static Angular app called "universe".

```shell
npx @angular/cli new universe --routing
cd universe
ng generate universal --client-project universe
npm install angular-prerender --save-dev
ng build
ng run universe:server
npx angular-prerender
```

## Arguments

In some scenarios angular-prerender will not be able to grab all the information by analyzing the angular.json file alone. In that case you can help it by specifying some command line arguments.

### --browser-target

This lets you specify the name of the target of your client app. The Angular CLI will normally call it "build" and this is also used as a default value. It is also possible to use a full target specifier which does also include the project and an optional configuration separated by colons. This works similar as the target parameter of the [ng run command](https://angular.io/cli/run).

### --config

The config option expects a path (including the filename) to the angular.json file of your project. By default it will look for it in the current working directory.

### --exclude-routes

This option can be used to tell angular-prerender not to render specified routes.

```shell
npm angular-prerender --exclude-routes /do-not-render-1 /do-not-render-2
```

### --parameter-values

Some URLs of your app might accept parameters. This option can be used to tell angular-prerender about the possible values those parameters could have. It expects a stringified JSON value which can be described with this TypeScript interface:

```typescript
interface IParameterValuesMap {

    [ segment: string ]: string[];

}
```

Lets imagine your app has a route with a `:name` parameter in it: `/team/:name`. A call to angular-prerender like this would render two routes by replacing the parameter with the given values:

```shell
npx angular-prerender --parameter-values '{":name":["amelia","oliver"]}'
```

```text
/team/amelia
/team/oliver
```

Please note that it might be necessary to escape the string differently dependending on the command-line interface you use.

### --server-target

This lets you specify the name of the target of your server app. The Angular CLI will normally call it "server" and this is also used as a default value. It is also possible to use a full target specifier which does also include the project and an optional configuration separated by colons. This works similar as the target parameter of the [ng run command](https://angular.io/cli/run).

### --verbose (-v)

This flag enables more detailed log messages.

## Acknowledgement

This command line tool is only possible by bringing together the great power of [Angular Universal](https://github.com/angular/universal) (which is now on its way into the main [Angular repository](https://github.com/angular/angular)) and [Guess.js](https://github.com/guess-js) (which provides an excellent parser to retrieve the routes of an Angular app).
