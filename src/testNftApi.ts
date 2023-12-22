import { Alchemy, Network } from "alchemy-sdk";
import { getDefaultProvider, Wallet, Contract } from "ethers";
import "dotenv/config";

const contractAddress = "0x5997fbAf0a8757d1d13e61Fb05aFAf1514B68714";
const provider = getDefaultProvider(
    `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` as any
);
const wallet = new Wallet(process.env.PRIVATE_KEY as any, provider);

const recordNftLogs = async () => {
    const settings = {
        apiKey: process.env.ALCHEMY_API_KEY,
        network: Network.MATIC_MUMBAI,
    };
    const alchemy = new Alchemy(settings);

    const owners = await alchemy.nft.getOwnersForContract(contractAddress, {
        withTokenBalances: true,
    });
    console.log(owners.owners);

    const nftsForOwner = await alchemy.nft.getNftsForOwner(wallet.address);
    let nftsForOwnerAll = nftsForOwner.ownedNfts;

    // 100件以上NFTあった場合のページング
    let pageKey = nftsForOwner.pageKey;
    while (pageKey) {
        const nftsForOwner = await alchemy.nft.getNftsForOwner(wallet.address, {
            pageKey: pageKey,
        });
        nftsForOwnerAll = [...nftsForOwnerAll, ...nftsForOwner.ownedNfts];
        pageKey = nftsForOwner.pageKey;
    }

    console.log(nftsForOwnerAll.length);
};

async function main() {
    const abi = [
        "function mint(address _to, uint256 _tokenId) external",
        "function burn(uint256 _tokenId) external",
        "function ownerOf(uint256 tokenId) public view returns (address)",
    ];

    const contract = new Contract(contractAddress, abi, wallet);

    const recipientAddress = "0xeCd4Ed35092d2A9abc7800B43fE4c0896c61703D";
    
    await contract.mint(recipientAddress, 1);

    // console.log(await contract.ownerOf(1));
    await recordNftLogs();

    await contract.burn(1);

    await recordNftLogs();
}

main();
