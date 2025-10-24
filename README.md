# IndustrialParkDashboard

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```



We want to connect to GitHub via API using OAuth (2) authentication.
a. Documentation: https://docs.github.com/en/rest?apiVersion=2022-11-28.
b. When the Connect button is clicked, we will redirect the user to GitHub for
Authentication using OAuth (2)
c. After the successful integration, we display the success status.
d. We will store the authentication details in a MongoDB DB integrations and
collection: github-integration

e. When we refresh the page, if we have already connected the page should
have the green checkmark and it should display the date when the
integration was connected.
f. • Store the information of the user who authenticated.