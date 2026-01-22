import { useState, useEffect } from "react";
import { BridgeHeader } from "./BridgeHeader";
import { StepCard } from "./StepCard";
import { BridgeInfoTab } from "./BridgeInfoTab";
import { useWallet } from "@/contexts/WalletContext";
import { createPublicClient, http, parseAbi, parseUnits, createWalletClient, custom } from "viem";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import arcIcon from '@/assets/chains/arc.png';

// Chain configurations
interface ChainConfig {
    name: string;
    icon: string;
    chainId: number;
    rpcUrl: string;
    usdcAddress: `0x${string}`;
    tokenMessengerAddress: `0x${string}`;
    domain: number;
    viemChain: any;
    explorerUrl: string;
}

interface CCTPBridgeCardProps {
    amount: string;
    sourceChain: ChainConfig;
    onClose: () => void;
    onComplete: (burnTx: string) => void;
    onProgress?: (txHash: string, step: BridgeStep) => void;
    resumeTxHash?: string;
}

// Arc Testnet destination config
const ARC_TESTNET = {
    domain: 26,
    chainId: 5042002,
    rpcUrl: "https://rpc.testnet.arc.network",
    messageTransmitterAddress: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275" as `0x${string}`,
    explorerUrl: "https://explorer.testnet.arc.network/tx/",
};

// CCTP Attestation API
const CCTP_API_BASE = "https://iris-api-sandbox.circle.com";

type BridgeStep = "idle" | "approve" | "burn" | "waiting" | "ready" | "minting" | "complete" | "error";

export const CCTPBridgeCard = ({ amount, sourceChain, onClose, onComplete, onProgress, resumeTxHash }: CCTPBridgeCardProps) => {
    const { address } = useWallet();
    const [currentStep, setCurrentStep] = useState(resumeTxHash ? 2 : 0);
    const [activeTab, setActiveTab] = useState<"steps" | "info">("steps");
    const [bridgeStep, setBridgeStep] = useState<BridgeStep>(resumeTxHash ? "waiting" : "idle");
    const [approveTx, setApproveTx] = useState<string>(resumeTxHash ? "resumed" : "");
    const [burnTx, setBurnTx] = useState<string>(resumeTxHash || "");
    const [mintTx, setMintTx] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [attestation, setAttestation] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(30);

    // Countdown timer and attestation polling
    useEffect(() => {
        if (bridgeStep === "waiting" && burnTx) {
            const startTime = Date.now();
            const waitMs = 30 * 1000; // 30 seconds for Fast Transfer

            const checkAttestation = async () => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, waitMs - elapsed);
                setTimeRemaining(Math.ceil(remaining / 1000));

                try {
                    const response = await fetch(
                        `${CCTP_API_BASE}/v2/messages/${sourceChain.domain}?transactionHash=${burnTx}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        if (data.messages?.[0]?.status === "complete") {
                            setMessage(data.messages[0].message);
                            setAttestation(data.messages[0].attestation);
                            setBridgeStep("ready");
                            setCurrentStep(3);
                            onProgress?.(burnTx, "ready");
                        }
                    }
                } catch (e) {
                    console.error("Failed to check attestation:", e);
                }
            };

            // Check immediately
            checkAttestation();

            // Then check every 3 seconds
            const interval = setInterval(checkAttestation, 3000);

            return () => clearInterval(interval);
        }
    }, [bridgeStep, burnTx, sourceChain.domain]);

    const handleApprove = async () => {
        if (!address || !(window as any).ethereum) {
            toast.error("Please connect your wallet");
            return;
        }

        setIsLoading(true);
        setBridgeStep("approve");

        try {
            // Switch to source chain
            await (window as any).ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x" + sourceChain.chainId.toString(16) }],
            });

            const publicClient = createPublicClient({
                chain: sourceChain.viemChain,
                transport: http(sourceChain.rpcUrl),
            });

            const walletClient = createWalletClient({
                chain: sourceChain.viemChain,
                transport: custom((window as any).ethereum),
            });

            const [account] = await walletClient.requestAddresses();
            const amountWei = parseUnits(amount, 6);

            // Check allowance
            const currentAllowance = (await publicClient.readContract({
                address: sourceChain.usdcAddress,
                abi: parseAbi(["function allowance(address owner, address spender) view returns (uint256)"]),
                functionName: "allowance",
                args: [account, sourceChain.tokenMessengerAddress],
            } as any)) as bigint;

            if (currentAllowance < amountWei) {
                const approveHash = await walletClient.writeContract({
                    address: sourceChain.usdcAddress,
                    abi: parseAbi(["function approve(address spender, uint256 amount) returns (bool)"]),
                    functionName: "approve",
                    args: [sourceChain.tokenMessengerAddress, amountWei],
                    account,
                    chain: sourceChain.viemChain,
                });

                await publicClient.waitForTransactionReceipt({ hash: approveHash });
                setApproveTx(approveHash);
                toast.success("USDC approved!");
            } else {
                // Already approved - skip approval
                setApproveTx("already-approved");
            }

            setCurrentStep(1);
            setIsLoading(false);
        } catch (err: any) {
            console.error("Approve failed:", err);
            setError(err.shortMessage || err.message);
            setBridgeStep("error");
            setIsLoading(false);
        }
    };

    const handleBurn = async () => {
        if (!address || !(window as any).ethereum) {
            toast.error("Please connect your wallet");
            return;
        }

        setIsLoading(true);
        setBridgeStep("burn");

        try {
            const publicClient = createPublicClient({
                chain: sourceChain.viemChain,
                transport: http(sourceChain.rpcUrl),
            });

            const walletClient = createWalletClient({
                chain: sourceChain.viemChain,
                transport: custom((window as any).ethereum),
            });

            const [account] = await walletClient.requestAddresses();
            const amountWei = parseUnits(amount, 6);
            const mintRecipient = ("0x" + address.slice(2).toLowerCase().padStart(64, "0")) as `0x${string}`;
            const destinationCaller = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;
            const maxFee = 1000n;
            const minFinalityThreshold = 1000;

            const depositHash = await walletClient.writeContract({
                address: sourceChain.tokenMessengerAddress,
                abi: parseAbi([
                    "function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken, bytes32 destinationCaller, uint256 maxFee, uint32 minFinalityThreshold)",
                ]),
                functionName: "depositForBurn",
                args: [
                    amountWei,
                    ARC_TESTNET.domain,
                    mintRecipient,
                    sourceChain.usdcAddress,
                    destinationCaller,
                    maxFee,
                    minFinalityThreshold,
                ],
                account,
                chain: sourceChain.viemChain,
            });

            await publicClient.waitForTransactionReceipt({ hash: depositHash });
            setBurnTx(depositHash);
            setBridgeStep("waiting");
            setCurrentStep(2);
            onProgress?.(depositHash, "waiting");
            toast.success("Transfer started! This usually takes about 30 seconds.");
            setIsLoading(false);
        } catch (err: any) {
            console.error("Burn failed:", err);
            setError(err.shortMessage || err.message);
            setBridgeStep("error");
            setIsLoading(false);
        }
    };

    const handleMint = async () => {
        if (!message || !attestation || !address) {
            toast.error("Attestation not ready");
            return;
        }

        setIsLoading(true);
        setBridgeStep("minting");

        try {
            // Switch to Arc Testnet
            try {
                await (window as any).ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: "0x" + ARC_TESTNET.chainId.toString(16) }],
                });
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    await (window as any).ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: "0x" + ARC_TESTNET.chainId.toString(16),
                                chainName: "Arc Testnet",
                                nativeCurrency: { name: "Arc", symbol: "ARC", decimals: 18 },
                                rpcUrls: [ARC_TESTNET.rpcUrl],
                                blockExplorerUrls: ["https://explorer.testnet.arc.network"],
                            },
                        ],
                    });
                }
            }

            const walletClient = createWalletClient({
                transport: custom((window as any).ethereum),
            });

            const [account] = await walletClient.requestAddresses();

            const mintHash = await walletClient.writeContract({
                address: ARC_TESTNET.messageTransmitterAddress,
                abi: parseAbi(["function receiveMessage(bytes message, bytes attestation) returns (bool)"]),
                functionName: "receiveMessage",
                args: [message as `0x${string}`, attestation as `0x${string}`],
                account,
                chain: {
                    id: ARC_TESTNET.chainId,
                    name: "Arc Testnet",
                    nativeCurrency: { name: "Arc", symbol: "ARC", decimals: 18 },
                    rpcUrls: { default: { http: [ARC_TESTNET.rpcUrl] } },
                } as any,
            });

            setBridgeStep("complete");
            setMintTx(mintHash);
            setCurrentStep(4);
            toast.success("USDC minted on Arc Testnet!");
            onComplete(burnTx);
            setIsLoading(false);
        } catch (err: any) {
            console.error("Mint failed:", err);
            setError(err.shortMessage || err.message);
            setBridgeStep("error");
            setIsLoading(false);
        }
    };

    const steps = [
        {
            title: "Approve USDC",
            buttonLabel: "Approve",
            iconType: "op" as const,
            iconUrl: sourceChain.icon,
            action: handleApprove,
            explorerUrl: approveTx && approveTx !== "resumed" && approveTx !== "already-approved" ? `${sourceChain.explorerUrl}${approveTx}` : undefined,
        },
        {
            title: `Start on ${sourceChain.name}`,
            buttonLabel: "Start",
            iconType: "op" as const,
            iconUrl: sourceChain.icon,
            action: handleBurn,
            explorerUrl: burnTx ? `${sourceChain.explorerUrl}${burnTx}` : undefined,
        },
        {
            title: "Wait ~30s",
            iconType: "clock" as const,
            timeRemaining: bridgeStep === "waiting" ? timeRemaining : undefined,
        },
        {
            title: `Get ${amount} USDC on Arc`,
            buttonLabel: "Mint",
            iconType: "arc" as const,
            iconUrl: arcIcon,
            action: handleMint,
            explorerUrl: mintTx ? `${ARC_TESTNET.explorerUrl}${mintTx}` : undefined,
        },
    ];

    const getStepStatus = (stepIndex: number) => {
        if (stepIndex < currentStep) return "completed";
        if (stepIndex === currentStep) return "current";
        return "pending";
    };

    const handleStepAction = (stepIndex: number) => {
        if (stepIndex !== currentStep || isLoading) return;
        steps[stepIndex].action?.();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-[440px] mx-auto">
                <div className="rounded-[32px] bg-card overflow-hidden relative">
                    <BridgeHeader
                        currentStep={currentStep}
                        totalSteps={4}
                        onBack={onClose}
                        onClose={onClose}
                    />

                    <div className="overflow-y-auto">
                        <div className="flex flex-col h-full w-full">
                            {/* Token Info */}
                            <div className="flex-col text-left px-6 py-6 flex items-center gap-3 pt-6 pb-4">
                                <img
                                    loading="lazy"
                                    className="rounded-full overflow-hidden h-12 w-12"
                                    alt="USDC"
                                    src="https://djvebdd83rbuw.cloudfront.net/tokens/usdc.png"
                                />
                                <h2 className="font-bold flex flex-col gap-1.5 text-3xl text-center leading-none">
                                    <span>
                                        Bridge <span className="break-all">{amount}</span> USDC
                                    </span>

                                </h2>
                            </div>

                            {/* Tabs */}
                            <div className="mx-auto">
                                <div className="inline-flex h-10 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground">
                                    {["steps", "info"].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 text-xs ${activeTab === tab ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                        >
                                            {activeTab === tab && (
                                                <motion.div
                                                    layoutId="active-pill"
                                                    className="absolute inset-0 bg-primary rounded-full shadow-sm -z-10"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            {tab === "steps" ? "Steps" : "Bridge info"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            {activeTab === "steps" ? (
                                <div className="flex flex-col p-5 pt-4 gap-1">
                                    {steps.map((step, index) => (
                                        <StepCard
                                            key={index}
                                            title={step.title}
                                            buttonLabel={step.buttonLabel}
                                            iconType={step.iconType}
                                            status={getStepStatus(index)}
                                            onAction={() => handleStepAction(index)}
                                            isLoading={isLoading && index === currentStep}
                                            explorerUrl={step.explorerUrl}
                                            timeRemaining={step.timeRemaining}
                                            iconUrl={step.iconUrl}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-5 pt-4">
                                    <BridgeInfoTab
                                        amount={amount}
                                        sourceNetwork={sourceChain.name}
                                        destinationNetwork="Arc Testnet"
                                        fromAddress={address || ""}
                                        toAddress={address || ""}
                                        sourceChainIcon={sourceChain.icon}
                                    />
                                </div>
                            )}

                            {/* Error state */}
                            {bridgeStep === "error" && (
                                <div className="mx-5 mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                    <p className="text-red-500 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Complete state */}
                            {bridgeStep === "complete" && (
                                <div className="mx-5 mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                                    <p className="text-green-500 font-medium">🎉 Bridge Complete!</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        USDC has been minted to your wallet on Arc Testnet
                                    </p>
                                </div>
                            )}


                            {/* Footer */}
                            <div className="px-6 py-4 flex flex-row gap-1 justify-center text-xs text-muted-foreground">
                                Powered by Circle CCTP
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
