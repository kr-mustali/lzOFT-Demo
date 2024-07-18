const { ethers } = require("ethers");
const Options = require('@layerzerolabs/lz-v2-utilities')
require('dotenv').config();

async function sendTransaction() {
    const pkey = process.env.PRIVATE_KEY;
    const rpc = process.env.RPC;
    const refundAdd = "0x763993127af8383EF6d01AFc9c775Ad6fc8e3669"
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(pkey, provider);


    // FUJI_OFT=0x9873EA7812Cb81436920F9d013aa1ca9a0649a86
    // AMOY_OFT=0xb99A5b521F4361cb0B1A5D9f15D969724bB6E948
    // SEPOLIA_OFT=0x9d46ED447a850FA631f74aD65A6e2F1DfbC75B1D
    const amoycontractAddress = "0xb99A5b521F4361cb0B1A5D9f15D969724bB6E948";
    const contractABI = require("./MyOFT.json");

    const myContract = new ethers.Contract(amoycontractAddress, contractABI, wallet);

    const eidB = 40106;

    // 000000000000000000000000
    const ownerBAddress = "0x000000000000000000000000763993127af8383EF6d01AFc9c775Ad6fc8e3669";

    const tokensToSend = ethers.utils.parseEther('1')
    // const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

    const sendParam = [
        eidB,           // Destination endpoint ID.
        ownerBAddress,  // Recipient address.
        tokensToSend,   // Amount to send
        tokensToSend,   // Minimum amount to send
        '0x0003010011010000000000000000000000000000ea60', // Additional options supplied by the caller to be used in the LayerZero message.
        "0x",           // The composed message for the send() operation
        "0x"            // The OFT command to be executed, unused in default OFT implementations.
    ];

        const [nativeFee] = await myContract.quoteSend(sendParam, false);
        const valueToSend = ethers.utils.parseEther(ethers.utils.formatEther(nativeFee));



    const funcData = myContract.interface.encodeFunctionData(
        'send',
        [
            sendParam,
            [nativeFee, 0],
            refundAdd
        ]
    );

    const tx = {
        to: amoycontractAddress,
        data: funcData,
        value: valueToSend,
        gasLimit: 2500000,
    };

    const transactionResponse = await wallet.sendTransaction(tx);
    console.log("Transaction hash:", transactionResponse.hash);

    const receipt = await transactionResponse.wait();
    console.log("Transaction was mined in block:", receipt.blockNumber);
}

sendTransaction().catch((error) => {
    console.error("Error sending transaction:", error);
});
