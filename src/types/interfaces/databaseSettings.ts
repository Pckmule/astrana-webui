/* tslint:disable */

export interface IDatabaseSettings
{
    databaseProvider: string;
    connectionString: IDatabaseConnectionSettings;
}

export interface IDatabaseConnectionSettings
{
    hostAddress: string;
    hostAddressPort: string;
    databaseName: string;
    userId: string;
    password: string;
}

export interface IDatabaseConnectionTestSettings
{
    databaseProvider: string;
    databaseName: string;
    databaseHost: string;
    databaseHostPort?: string;
    databaseUsername: string;
    databasePassword: string;
}