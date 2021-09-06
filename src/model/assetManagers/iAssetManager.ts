export interface IAssetManager {
  _name: string;

  getLatestVersion(): Promise<string>;
  getContent(assetVersion: string): Promise<Buffer>;
}
