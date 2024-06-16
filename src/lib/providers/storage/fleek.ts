import { FleekSdk, ApplicationAccessTokenService } from '@fleekxyz/sdk';

let fleekSdk!:FleekSdk;

const initialize = Object.freeze((clientId: string) => {
  const applicationService = new ApplicationAccessTokenService({
      clientId,
  });
  fleekSdk = new FleekSdk({ accessTokenService: applicationService });
});

const uploadToIPFS = Object.freeze(async (filename: string, content: Buffer) => {
  if (!fleekSdk) {
      throw new Error('Fleek SDK not initialized');
  }
  const result = await fleekSdk.ipfs().add({
      path: filename,
      content: content,
  })
  
  return result
});

const FleekStorageProvider = {
  initialize,
  uploadToIPFS,
}

export default FleekStorageProvider;