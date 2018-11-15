// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    BEARER_KEY: 'myapp_bearer_key',
    restServer: 'http://localhost:9091',
    graphQlServer: 'http://localhost:9091/graphql',
    subdomain: 'dev.atlaskpi.com',
    googleMapApi: 'AIzaSyAhA6DuRTMwb8RrYNnD39C96xoTxqWiMSk',

    // integrationUrl: 'https://af31c66b.ngrok.io/integration',
    integrationUrl: 'http://localhost:9091/integration',
    twitterIntegrationUrl: 'http://localhost:9091/integration/twitter/request-token/?company_name={hostname}',
    remoteSupportModule: 'https://get.teamviewer.com/atlasremotesupport'
};
