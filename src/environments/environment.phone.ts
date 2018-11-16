// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    BEARER_KEY: 'myapp_bearer_key',
    restServer: 'http://10.1.10.111:9091',
    graphQlServer: 'http://10.1.10.111:9091/graphql',
    googleMapApi: 'AIzaSyAhA6DuRTMwb8RrYNnD39C96xoTxqWiMSk',
    // restServer: 'http://192.168.1.67:9091',
    // graphQlServer: 'http://192.168.1.67:9091/graphql',
    subdomain: 'd.atlaskpi.com',

    integrationUrl: 'http://localhost:9091/integration',
    twitterIntegrationUrl: 'http://localhost:9091/integration/twitter/request-token/?company_name={hostname}',
    remoteSupportModuleUrl: 'https://get.teamviewer.com/atlasremotesupport'
};
