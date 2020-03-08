export interface INgServiceWorker {

    assetGroups?: { urls: string[] }[];

    assethashTable?: { [ key: string ]: string };

    hashTable?: { [ key: string ]: string | undefined };

    index: string;

}
