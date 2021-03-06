import * as path from 'path';

import type { Client } from '../client/interfaces/Client';
import { HttpClient } from '../index';
import { mkdir, rmdir } from './fileSystem';
import { isSubDirectory } from './isSubdirectory';
import { Templates } from './registerHandlebarTemplates';
import { writeClientCore } from './writeClientCore';
import { writeClientIndex } from './writeClientIndex';
import { writeClientModels } from './writeClientModels';
import { writeClientSchemas } from './writeClientSchemas';
import { writeClientServices } from './writeClientServices';

/**
 * Write our OpenAPI client, using the given templates at the given output path.
 * @param client Client object with all the models, services, etc.
 * @param templates Templates wrapper with all loaded Handlebars templates
 * @param output The relative location of the output directory
 * @param httpClient The selected httpClient (fetch, xhr or node)
 * @param useOptions Use options or arguments functions
 * @param useUnionTypes Use union types instead of enums
 * @param exportCore: Generate core client classes
 * @param exportServices: Generate services
 * @param exportModels: Generate models
 * @param exportSchemas: Generate schemas
 * @param httpClientLibrary: Library for httpClient
 */
export async function writeClient(
    client: Client,
    templates: Templates,
    output: string,
    httpClient: HttpClient,
    useOptions: boolean,
    useUnionTypes: boolean,
    exportCore: boolean,
    exportServices: boolean,
    exportModels: boolean,
    exportSchemas: boolean,
    httpClientLibrary: string
): Promise<void> {
    const outputPath = path.resolve(process.cwd(), output);
    const outputPathCore = path.resolve(outputPath, 'core');
    const outputPathModels = path.resolve(outputPath, 'models');
    const outputPathSchemas = path.resolve(outputPath, 'schemas');
    const outputPathServices = path.resolve(outputPath, 'services');

    if (!isSubDirectory(process.cwd(), output)) {
        throw new Error(`Output folder is not a subdirectory of the current working directory`);
    }

    if (exportCore) {
        await rmdir(outputPathCore);
        await mkdir(outputPathCore);
        await writeClientCore(client, templates, outputPathCore, httpClient, httpClientLibrary);
    }

    if (exportServices) {
        await rmdir(outputPathServices);
        await mkdir(outputPathServices);
        await writeClientServices(client.services, templates, outputPathServices, httpClient, useUnionTypes, useOptions);
    }

    if (exportSchemas) {
        await rmdir(outputPathSchemas);
        await mkdir(outputPathSchemas);
        await writeClientSchemas(client.models, templates, outputPathSchemas, httpClient, useUnionTypes);
    }

    if (exportModels) {
        await rmdir(outputPathModels);
        await mkdir(outputPathModels);
        await writeClientModels(client.models, templates, outputPathModels, httpClient, useUnionTypes);
    }

    if (exportCore || exportServices || exportSchemas || exportModels) {
        await mkdir(outputPath);
        await writeClientIndex(client, templates, outputPath, useUnionTypes, exportCore, exportServices, exportModels, exportSchemas);
    }
}
