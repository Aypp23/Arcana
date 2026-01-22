// Escrow Contract Configuration & ABI
export const ESCROW_CONTRACT = {
    address: "0xdced5cd3b4991a0eb00fd57fafec667f26ad0375" as `0x${string}`,
    chainId: 5042002,
} as const;

// ABI for Escrow.createEscrow function
export const ESCROW_ABI = [
    {
        inputs: [
            { name: "seller", type: "address" },
            { name: "taskHash", type: "bytes32" },
            { name: "sellerAgentId", type: "uint256" },
        ],
        name: "createEscrow",
        outputs: [{ name: "escrowId", type: "uint256" }],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [{ name: "escrowId", type: "uint256" }],
        name: "release",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "escrowId", type: "uint256" }],
        name: "getEscrow",
        outputs: [
            {
                components: [
                    { name: "buyer", type: "address" },
                    { name: "seller", type: "address" },
                    { name: "amount", type: "uint256" },
                    { name: "taskHash", type: "bytes32" },
                    { name: "deadline", type: "uint256" },
                    { name: "sellerAgentId", type: "uint256" },
                    { name: "status", type: "uint8" },
                ],
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
] as const;

// Provider Agent Address (from backend)
export const PROVIDER_AGENT_ADDRESS = "0x2BD5A85BFdBFB9B6CD3FB17F552a39E899BFcd40" as `0x${string}`;
export const PROVIDER_AGENT_ID = 1n;
