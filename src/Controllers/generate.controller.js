const crypto = require("crypto");
const {
  initiateDeveloperControlledWalletsClient,
} = require("@circle-fin/developer-controlled-wallets");
const forge = require("node-forge");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const secret = crypto.randomBytes(32).toString("hex");
const entitySecret = forge.util.hexToBytes(secret);
const circleSDK = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_DEVELOPER_API_KEY,
  entitySecret: secret,
});
let entitySecretCiphertext = "";
let idempotencyKey = uuidv4();

const generateWalletSet = async (req, res, next) => {
  try {
    const fetch = (await import("node-fetch")).default;

    // const getPublicKey = await circleSDK.getPublicKey({});

    if (entitySecret.length != 32) {
      res.send("Invalid entity secret");
      return;
    } else {
      const publicKey = forge.pki.publicKeyFromPem(
        process.env.PUBLIC_KEY_STRING
      );
      const encryptedData = publicKey.encrypt(entitySecret, "RSA-OAEP", {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create(),
        },
      });
      entitySecretCiphertext = forge.util.encode64(encryptedData);

      const res = await fetch(
        "https://api.circle.com/v1/w3s/developer/walletSets",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            authorization: `Bearer ${process.env.CIRCLE_DEVELOPER_API_KEY}`,
          },
          body: JSON.stringify({
            idempotencyKey,
            entitySecretCiphertext: entitySecretCiphertext,
            name: "qd-wallet",
          }),
        }
      );

      const walletDetails = await res.json();
      return walletDetails;

      /* The below is the response of the above lines of code. 

      {
    "data": {
    "walletSet": {
      "id": "286f32c4-685f-550f-b240-cbf1fcda0f72",
      "custodyType": "DEVELOPER",
      "name": "qd-wallet",
      "updateDate": "2024-08-26T18:38:28Z",
      "createDate": "2024-08-26T18:38:28Z"
    }
  }
}  
      */
    }
  } catch (error) {
    console.log(error);
  }
};

const generateWallet = async (req, res) => {
  const fetch = (await import("node-fetch")).default;
  const resP = await fetch("https://api.circle.com/v1/w3s/developer/wallets", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${process.env.CIRCLE_DEVELOPER_API_KEY}`,
    },
    body: JSON.stringify({
      idempotencyKey,
      blockchains: ["MATIC-AMOY"],
      entitySecretCiphertext,
      walletSetId: process.env.WALLET_SET_ID,
    }),
  });

  const walletDetails = await resP.json();
  return walletDetails;

  /* The Below is the response for the above lines of code
  {
    "data": {
        "wallets": [
            {
                "id": "55bc8014-1839-54d2-81aa-57ee27bf9f0e",
                "state": "LIVE",
                "walletSetId": "286f32c4-685f-550f-b240-cbf1fcda0f72",
                "custodyType": "DEVELOPER",
                "address": "0x5fa0021a356b932780eb934bd404081bd718aab2",
                "blockchain": "MATIC-AMOY",
                "accountType": "EOA",
                "updateDate": "2024-08-26T19:04:51Z",
                "createDate": "2024-08-26T19:04:51Z"
            }
        ]
    }
}
  */
};

const transferToken = async (req, res) => {
  const fetch = (await import("node-fetch")).default;
  const transferTokenResponse = await fetch(
    `https://api.circle.com/v1/w3s/wallets/${process.env.WALLET_ID}/balances`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${process.env.CIRCLE_DEVELOPER_API_KEY}`,
      },
    }
  );
  const tokenDetails = await transferTokenResponse.json();
  return tokenDetails;

  /* The Below is the response for the above lines of code 
  
  { data: { tokenBalances: [] } }
  
  */
};

module.exports = { generateWalletSet, generateWallet, transferToken };
