![logo](https://repository-images.githubusercontent.com/142886533/bd323700-e8ff-11e9-9645-75bc009ee359)

# angular-prerender

**A command line tool to prerender Angular Apps.**

[![version](https://img.shields.io/npm/v/angular-prerender.svg?style=flat-square)](https://www.npmjs.com/package/angular-prerender)

This command line tool is meant to simplify the build process of static [Angular](https://angular.io/) apps. It works by analyzing the config file created by the [Angular CLI](https://cli.angular.io/). It looks for a client and server app target defined in the angular.json file. It does then render each route and merges the output with the static build for the client.

## Usage

angular-prerender is available on [npm](https://www.npmjs.com/package/angular-prerender). It will most likely be a dev dependency of your project. The command to install it will then look like this:

```shell
npm install angular-prerender --save-dev
```

In case you used all the default settings of the CLI angular-prerender will be able to pick up all the necessary information on its own. You can run it on the command line without specifying any options.

```shell
npx angular-prerender
```

It is also possible to skip the explicit installation of angular-prerender.

The following is a complete example which will generate a very basic static Angular app called "universe".

```shell
npx @angular/cli new universe --routing
cd universe
ng generate universal --project universe
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

This option can be used to tell angular-prerender not to render specified routes. The given routes can't contain any parameters.

```shell
npx angular-prerender --exclude-routes /do-not-render-1 /do-not-render-2
```

Alternatively routes can also be excluded when setting the status code as described below.

### --ignore-status-code

When set to false this flag will make sure that status codes set on the response will not be ignored. An example of a component which sets the status code looks as follows:

```typescript
import { Component, Inject } from '@angular/core';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { Response } from 'express';

@Component({
    // ...
})
class NotFoundComponent {
    constructor(@Inject(RESPONSE) response: Response) {
        response.status(404);
    }
}
```

If status codes are not ignored any route which sets the status code to 300 or above will be excluded.

### --include-routes

This option can be used to tell angular-prerender to explicitly render the given routes even though they could not be detected automatically.

```shell
npx angular-prerender --include-routes /render-even-if-not-detected
```

### --parameter-values

Some URLs of your app might accept parameters. This option can be used to tell angular-prerender about the possible values those parameters could have. It expects a stringified JSON value which can be described with this TypeScript interface:

```typescript
interface IParameterValuesMap {
    [segment: string]: string | string[] | IParameterValuesMap | IParameterValuesMap[];
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

By default all possible combinations of all given parameter values will be rendered. If there is a route like this `/blog/:slug/comments/:id` and we render it with two values for each parameter angular-prerender will render four routes.

```shell
npx angular-prerender --parameter-values '{":id":["comment-a","comment-b"],":slug":["story-a","story-b"]}'
```

```text
/blog/story-a/comments/comment-a
/blog/story-a/comments/comment-b
/blog/story-b/comments/comment-a
/blog/story-b/comments/comment-b
```

If this is not intended and `comment-a` exclusively belongs to `story-a` and `comment-b` belongs to `story-b` respectively the parameter values can be grouped.

```shell
npx angular-prerender --parameter-values '[{":id":"comment-a",":slug":"story-a"},{":id":"comment-b",":slug":"story-b"}]'
```

In this case angular-prerender will only renderer two routes.

```text
/blog/story-a/comments/comment-a
/blog/story-b/comments/comment-b
```

It's also possible to scope parameter values by routes. This comes in handy if the same name is used for different parameters in different routes. If your app has two routes (`/shirts/:id/:size` and `/shoes/:id/:size`) and they both use the same parameters (`:id` and `:size`) it is possible to nest the parameter values to specify a different set of values for each route.

```shell
npx angular-prerender --parameter-values '{"/shirts":[{":id":"polo-shirt",":size":"m"},{":id":"t-shirt",":size":"xl"}],"/shoes":{":id":"slipper",":size":["10","12"]}}'
```

It is not necessary to specify the full route as long as a part of the route is already enough to distinguish it from the other routes.

The command above will render two routes.

```text
/shirts/polo-shirt/m
/shirts/t-shirt/xl
/shoes/slipper/10
/shoes/slipper/12
```

Please note that it might be necessary to escape the string differently dependending on the command-line interface you use.

In case there is a prerendered page which links to all possible parameter combinations it might be an alternative to use the [`--recursive`](#--recursive) flag instead.

### --preserve-index-html

Setting this flag to true will preserve the index.html file generated by the browser build. It will be saved in the same directory as start.html. Additionally an existing ngsw.json file will be updated as well to reference the preserved start.html file instead of the prerendered index.html file.

### --recursive

When enabling this flag every prerendered HTML document will be scanned to discover further routes. If some of the found routes were previously unknown they get appended to the list of routes to prerender.

In case any of the newly discovered routes is one of the routes defined with [`--exclude-routes`](#--exclude-routes) it will not be prerendered.

### --scully-config

⚠️ This is currently very experimental and might not work with every possible Scully config. Please feel free to [open an issue](https://github.com/chrisguttandin/angular-prerender/issues/new) if it doesn't accept your config.

This option allows you to specify a path to a [Scully](https://scully.io) config file. `@scullyio/scully` and the respective plugins need to be installed for this to work. So far only the plugins specified as [`defaultPostRenderers`](https://scully.io/docs/Reference/config/#interface) and plugins of type [`routeProcess`](https://scully.io/docs/Reference/plugins/types/route-process) get applied.

### --server-target

This lets you specify the name of the target of your server app. The Angular CLI will normally call it "server" and this is also used as a default value. It is also possible to use a full target specifier which does also include the project and an optional configuration separated by colons. This works similar as the target parameter of the [ng run command](https://angular.io/cli/run).

### --verbose (-v)

This flag enables more detailed log messages.

## Acknowledgement

This command line tool is only possible by bringing together the great power of [Angular Universal](https://github.com/angular/universal) (which is now on its way into the main [Angular repository](https://github.com/angular/angular)) and [Guess.js](https://github.com/guess-js) (which provides an excellent parser to retrieve the routes of an Angular app).
