import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import "@ethersproject/shims";
import { ethers } from 'ethers';

const getContentHash = async(name: string) => {
  const provider = new ethers.providers.StaticJsonRpcProvider({
    url: 'https://rpc.eth.gateway.fm',
    skipFetchSetup: true
});

  const resolver = await provider.getResolver(name);

  return resolver!.getContentHash();
}

const getURL = (contentHash: string) => {
  const url = new URL(contentHash);

  return `https://cf-ipfs.com/${url.protocol.slice(0, -1)}/${url.host}`
}

const regex = /https:\/\/([\w]+)[.]ethdns[.]fyi/g;
const getSubdomain = (url: string) => {
  const result = regex.exec(url);

  if (result !== null) {
    return result[1];
  }

  return null;
}
 
export async function middleware(req: NextRequest) {
  try {
    const subdomain = getSubdomain(req.url);

    if (subdomain === null) {
      return new NextResponse('Use https://<ensname>.ethdns.fyi to get redirected to the IPFS content', { status: 200 });
    }

    const ch = await getContentHash(`${subdomain}.eth`);

    const url = getURL(ch);
  
    return NextResponse.redirect(url, 302)
  }
  catch {
    return new NextResponse('error', { status: 500 });
  }
}