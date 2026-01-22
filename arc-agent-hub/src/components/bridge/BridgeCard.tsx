import { useState } from "react";
import { BridgeHeader } from "./BridgeHeader";
import { StepCard } from "./StepCard";
import { BridgeInfoTab } from "./BridgeInfoTab";

const STEPS = [
  {
    title: "Approve USDC",
    gasEth: "0.00000006421",
    gasUsd: "$0.000191",
    buttonLabel: "Approve",
    iconType: "op" as const,
  },
  {
    title: "Start on OP Sepolia",
    gasEth: "0.000000156",
    gasUsd: "$0.000464",
    buttonLabel: "Start",
    iconType: "op" as const,
  },
  {
    title: "Wait 25 mins",
    iconType: "clock" as const,
  },
  {
    title: "Get 5 USDC on Arc Testnet",
    gasEth: "0.0576",
    gasUsd: "$0.06",
    buttonLabel: "Mint",
    iconType: "arc" as const,
  },
];

export const BridgeCard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"steps" | "info">("steps");
  const amount = "5";

  const handleStepAction = (stepIndex: number) => {
    if (stepIndex === currentStep) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "current";
    return "pending";
  };

  return (
    <div className="w-full max-w-[440px] mx-auto">
      <div className="rounded-[32px] bg-card overflow-hidden">
        <BridgeHeader currentStep={currentStep} totalSteps={4} />

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
                <span>Bridge <span className="break-all">{amount}</span> USDC</span>
                <span className="flex gap-1 justify-center items-center">
                  <span className="text-xs text-muted-foreground leading-none">Via CCTP</span>
                </span>
              </h2>
            </div>

            {/* Tabs */}
            <div className="mx-auto">
              <div className="inline-flex h-10 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground">
                <button
                  onClick={() => setActiveTab("steps")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 font-medium ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 text-xs ${
                    activeTab === "steps"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : ""
                  }`}
                >
                  Steps
                </button>
                <button
                  onClick={() => setActiveTab("info")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 font-medium ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 text-xs ${
                    activeTab === "info"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : ""
                  }`}
                >
                  Bridge info
                </button>
              </div>
            </div>

            {/* Content */}
            {activeTab === "steps" ? (
              <div className="flex flex-col p-5 pt-4 gap-1">
                {STEPS.map((step, index) => (
                  <StepCard
                    key={index}
                    title={step.title}
                    gasEth={step.gasEth}
                    gasUsd={step.gasUsd}
                    buttonLabel={step.buttonLabel}
                    iconType={step.iconType}
                    status={getStepStatus(index)}
                    onAction={() => handleStepAction(index)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-5 pt-4">
                <BridgeInfoTab
                  amount={amount}
                  sourceNetwork="OP Sepolia"
                  destinationNetwork="Arc Testnet"
                />
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-6 flex flex-row gap-1 justify-center pt-3">
              <button className="inline-flex items-center justify-center font-medium ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.03] transition-all border bg-transparent h-8 rounded-full px-3 text-xs pl-1.5">
                <div className="relative mr-3">
                  <img 
                    loading="lazy" 
                    className="rounded-full overflow-hidden h-5 w-5" 
                    alt="USDC" 
                    src="https://djvebdd83rbuw.cloudfront.net/tokens/usdc.png" 
                  />
                  <img 
                    className="h-3.5 w-3.5 rounded-sm absolute -bottom-0 -right-2" 
                    alt="Arc Testnet" 
                    src="/img/networks/5042002.svg" 
                  />
                </div>
                <span>Add USDC</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
