/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/mxlp_swap.json`.
 */
export type MxlpSwap = {
  "address": "8KYGPUeMKA8vPfzfzu3qCZYHAqhbY3n31iHPCdHDPgpN",
  "metadata": {
    "name": "mxlpSwap",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createMxlp",
      "discriminator": [
        131,
        69,
        203,
        205,
        189,
        27,
        193,
        157
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "usdcPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  100,
                  99,
                  45,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "mxlpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  120,
                  108,
                  112,
                  45,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxlpManage",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  120,
                  108,
                  112,
                  45,
                  109,
                  97,
                  110,
                  97,
                  103,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "mxlpPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  120,
                  108,
                  112,
                  45,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "purchaseMxlp",
      "discriminator": [
        222,
        10,
        143,
        85,
        156,
        41,
        192,
        144
      ],
      "accounts": [
        {
          "name": "usdcMint"
        },
        {
          "name": "mxlpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  120,
                  108,
                  112,
                  45,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxlpManage",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  120,
                  108,
                  112,
                  45,
                  109,
                  97,
                  110,
                  97,
                  103,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "usdcPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  100,
                  99,
                  45,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "lpVault",
          "writable": true
        },
        {
          "name": "purchaseUsdcAccount",
          "writable": true
        },
        {
          "name": "purchaseMxlpAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mxlpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "usdcAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "redeemAudit",
      "discriminator": [
        208,
        117,
        222,
        149,
        182,
        187,
        77,
        8
      ],
      "accounts": [
        {
          "name": "usdcMint",
          "writable": true
        },
        {
          "name": "mxlpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  120,
                  108,
                  112,
                  45,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxlpManage",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  120,
                  108,
                  112,
                  45,
                  109,
                  97,
                  110,
                  97,
                  103,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "usdcPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  100,
                  99,
                  45,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "mxlpPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  120,
                  108,
                  112,
                  45,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "redeemUsdcAccount",
          "writable": true
        },
        {
          "name": "redeemMxlpAccount",
          "writable": true
        },
        {
          "name": "redeemRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  100,
                  101,
                  101,
                  109,
                  45,
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "redeemAddress"
              }
            ]
          }
        },
        {
          "name": "lpVault",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "redeemAddress",
          "type": "pubkey"
        },
        {
          "name": "audit",
          "type": "bool"
        }
      ]
    },
    {
      "name": "redeemMxlp",
      "discriminator": [
        53,
        245,
        241,
        138,
        100,
        12,
        176,
        98
      ],
      "accounts": [
        {
          "name": "mxlpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  120,
                  108,
                  112,
                  45,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "redeemMxlpAccount",
          "writable": true
        },
        {
          "name": "mxlpPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  120,
                  108,
                  112,
                  45,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "redeemRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  100,
                  101,
                  101,
                  109,
                  45,
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "mxlpAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "mxlpManage",
      "discriminator": [
        251,
        77,
        224,
        56,
        147,
        74,
        246,
        166
      ]
    },
    {
      "name": "redeemRecord",
      "discriminator": [
        138,
        97,
        1,
        147,
        115,
        88,
        157,
        158
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "repeatApplyRedeem",
      "msg": "Repeat Apply Redeem"
    },
    {
      "code": 6001,
      "name": "notOwner",
      "msg": "Only owner can call this function!"
    }
  ],
  "types": [
    {
      "name": "mxlpManage",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalMinted",
            "type": "u64"
          },
          {
            "name": "totalBurned",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "redeemRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "redeemAddress",
            "type": "pubkey"
          },
          {
            "name": "mxlpAmount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
