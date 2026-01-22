import { NetworkIcon } from "./NetworkIcon";
import { Loader2, Check, ExternalLink } from "lucide-react";

type StepStatus = "pending" | "current" | "completed";

interface StepCardProps {
  title: string;
  gasEth?: string;
  gasUsd?: string;
  status: StepStatus;
  buttonLabel?: string;
  onAction?: () => void;
  iconType: "op" | "arc" | "clock";
  isLoading?: boolean;
  explorerUrl?: string;
  timeRemaining?: number;
  iconUrl?: string;
}

const GasIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" className="w-3 h-auto fill-muted-foreground">
    <path fillRule="evenodd" clipRule="evenodd" d="M54.8643 24.5435C54.8643 23.1708 54.3371 21.864 53.3927 20.8757L41.4888 8.43368C40.3358 7.2367 40.4566 5.282 41.7963 4.23876C42.9603 3.32729 44.6735 3.5579 45.6947 4.63409L57.6206 17.0651C58.4003 17.746 59.0482 18.5586 59.5424 19.4701C60.1134 20.4584 60.5417 21.6334 60.5417 22.9951V43.5744C60.5417 47.923 57.1923 51.7116 52.8546 51.8434C48.517 51.9752 44.6735 48.3733 44.6735 43.9148V37.3918C44.6735 35.8215 41.7414 34.5586 40.171 34.5586H38.6776V54.6766C38.6776 54.8743 38.6776 55.061 38.6446 55.2587C38.5348 56.3239 38.1285 57.3012 37.5245 58.1029C36.4923 59.4646 34.856 60.3431 33.0111 60.3431H10.3234C8.36872 60.3431 6.64463 59.3547 5.62335 57.8393C5.00839 56.9388 4.65698 55.8407 4.65698 54.6657V12.1564C4.65698 7.45633 8.46755 3.65674 13.1566 3.65674H30.156C34.856 3.65674 38.6556 7.46731 38.6556 12.1564V28.8812H40.1491C44.8492 28.8812 50.3179 32.6917 50.3179 37.3808V43.772C50.3179 44.958 51.1745 46.0342 52.3605 46.155C53.7222 46.2868 54.8533 45.2326 54.8533 43.9038V24.5435H54.8643ZM13.7387 8.77441C11.2679 8.77441 9.26929 10.9487 9.26929 13.6392V27.0805C9.26929 29.771 11.2679 31.9453 13.7387 31.9453H28.8712C31.342 31.9453 33.3407 29.771 33.3407 27.0805V13.6392C33.3407 10.9487 31.342 8.77441 28.8712 8.77441H13.7387Z"></path>
  </svg>
);

const ClockIcon = () => (
  <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="41" height="41" viewBox="0 0 41 41" fill="none" className="w-6 h-6 fill-foreground">
      <g clipPath="url(#clip0_253_760)">
        <path d="M20.8201 0.820312C9.79391 0.820312 0.820068 9.79416 0.820068 20.8203C0.820068 31.8465 9.79391 40.8203 20.8201 40.8203C31.8462 40.8203 40.8201 31.8465 40.8201 20.8203C40.8201 9.79416 31.8462 0.820312 20.8201 0.820312ZM31.2963 13.8585L34.1199 12.2355C34.482 12.0141 34.9716 12.1349 35.193 12.5172C35.4143 12.8995 35.2936 13.3891 34.9113 13.6104L32.0877 15.2335C31.9669 15.2938 31.8261 15.3341 31.6786 15.3341C31.417 15.3341 31.1286 15.1932 30.9877 14.9249C30.7664 14.5628 30.9073 14.0732 31.2896 13.8518L31.2963 13.8585ZM26.4002 9.55271L28.0233 6.7291C28.2446 6.3401 28.7342 6.21937 29.1165 6.44741C29.5055 6.64862 29.6262 7.13822 29.3982 7.52051L27.7751 10.3441C27.6343 10.6057 27.3459 10.7532 27.0843 10.7532C26.9435 10.7532 26.8228 10.713 26.6752 10.6526C26.313 10.4313 26.1655 9.94171 26.3935 9.55941L26.4002 9.55271ZM4.21376 20.8203C4.21376 20.371 4.57594 20.0289 5.00518 20.0289H8.27144C8.72081 20.0289 9.06286 20.371 9.06286 20.8203C9.06286 21.2697 8.72081 21.6117 8.27144 21.6117H5.00518C4.57594 21.6117 4.21376 21.2496 4.21376 20.8203ZM10.3439 27.7821L7.52027 29.4052C7.39955 29.4856 7.2587 29.5058 7.13127 29.5058C6.84958 29.5058 6.5813 29.3649 6.44046 29.1168C6.21913 28.7278 6.33985 28.2449 6.72215 28.0235L9.54576 26.4005C9.93476 26.1791 10.4177 26.2999 10.639 26.6822C10.8603 27.0644 10.7195 27.554 10.3372 27.7754L10.3439 27.7821ZM10.6457 14.9316C10.5048 15.1932 10.2164 15.3408 9.95488 15.3408C9.81403 15.3408 9.67319 15.3005 9.54576 15.2402L6.72215 13.6171C6.33315 13.3958 6.21242 12.9062 6.44046 12.5239C6.66849 12.1416 7.15139 12.0141 7.51356 12.2422L10.3372 13.8652C10.7262 14.0866 10.867 14.5762 10.639 14.9384L10.6457 14.9316ZM15.2332 32.0879L13.6101 34.9115C13.4693 35.153 13.1809 35.3005 12.9193 35.3005C12.7785 35.3005 12.6376 35.2804 12.5102 35.1999C12.1212 34.9786 12.0005 34.489 12.2285 34.1067L13.8516 31.2831C14.0729 30.9209 14.5625 30.7734 14.9448 31.0014C15.307 31.2227 15.4545 31.7123 15.2265 32.0946L15.2332 32.0879ZM14.9515 10.6459C14.8107 10.7063 14.69 10.7465 14.5424 10.7465C14.2607 10.7465 13.9924 10.6057 13.8516 10.3374L12.2285 7.51381C12.0072 7.12481 12.1279 6.64191 12.5102 6.4407C12.8992 6.21937 13.3821 6.3401 13.6034 6.72239L15.2265 9.546C15.4478 9.935 15.307 10.4179 14.9448 10.6392L14.9515 10.6459ZM21.6115 36.6151C21.6115 37.0644 21.2694 37.4266 20.8201 37.4266C20.3707 37.4266 20.0287 37.0644 20.0287 36.6151V33.3689C20.0287 32.9196 20.3707 32.5574 20.8201 32.5574C21.2694 32.5574 21.6115 32.9196 21.6115 33.3689V36.6151ZM29.1232 35.1932C29.0025 35.2737 28.8617 35.2938 28.7141 35.2938C28.4525 35.2938 28.1641 35.153 28.0233 34.9048L26.4002 32.0812C26.1789 31.6922 26.3197 31.2093 26.6819 30.988C27.0709 30.7667 27.5538 30.9075 27.7751 31.2697L29.3982 34.0933C29.6195 34.4823 29.4988 34.9652 29.1165 35.1865L29.1232 35.1932ZM20.8804 22.0812C20.4512 22.0812 20.089 21.8398 19.8878 21.491C19.7671 21.3099 19.7067 21.0819 19.7067 20.8606V4.92494C19.7067 4.25425 20.2567 3.74452 20.9274 3.74452C21.5981 3.74452 22.1078 4.29449 22.1078 4.94506V19.6868H30.1293C30.7999 19.6868 31.3499 20.2569 31.3499 20.8874C31.3499 21.5581 30.7597 22.0879 30.1293 22.0879H20.8938L20.8804 22.0812ZM35.193 29.1235C35.0521 29.3649 34.7839 29.5125 34.5022 29.5125C34.3814 29.5125 34.2406 29.4923 34.1132 29.4119L31.2896 27.7888C30.9006 27.5675 30.7597 27.0779 30.9877 26.6956C31.2158 26.3133 31.6987 26.1858 32.081 26.4139L34.9046 28.0369C35.2936 28.2583 35.4143 28.7479 35.1863 29.1302L35.193 29.1235ZM36.635 21.6117H33.3687C32.9193 21.6117 32.5773 21.2496 32.5773 20.8203C32.5773 20.3911 32.9193 20.0289 33.3687 20.0289H36.635C37.0642 20.0289 37.4264 20.371 37.4264 20.8203C37.4264 21.2697 37.0642 21.6117 36.635 21.6117Z"></path>
      </g>
      <defs>
        <clipPath id="clip0_253_760">
          <rect width="40" height="40" fill="white" transform="translate(0.820068 0.820312)"></rect>
        </clipPath>
      </defs>
    </svg>
  </div>
);

// Spinning half-circle loader like in the reference
const HalfCircleSpinner = () => (
  <div className="w-8 h-8 flex items-center justify-center">
    <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  </div>
);

export const StepCard = ({
  title,
  gasEth,
  gasUsd,
  status,
  buttonLabel,
  onAction,
  iconType,
  isLoading = false,
  explorerUrl,
  timeRemaining,
  iconUrl,
}: StepCardProps) => {
  const isCurrent = status === "current";
  const isPending = status === "pending";
  const isCompleted = status === "completed";

  // Clock/Wait step - special handling with countdown and spinner
  if (iconType === "clock") {
    return (
      <div className="px-3.5 py-3 rounded-xl bg-transparent border border-border/30">
        <div className="flex gap-4 justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <ClockIcon />
            <span className="text-sm font-semibold leading-none">{title}</span>
          </div>
          {/* Show countdown and spinner when waiting */}
          {isCurrent && timeRemaining !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">~{timeRemaining}s to go</span>
              <HalfCircleSpinner />
            </div>
          )}
          {/* Show checkmark when completed */}
          {isCompleted && (
            <div className="w-8 h-8 rounded-full border-2 border-foreground/30 flex items-center justify-center">
              <Check className="w-4 h-4 text-foreground" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-3.5 py-3 rounded-xl bg-transparent border border-border/30">
      <div className="flex flex-col">
        <div className="flex gap-1 justify-between items-center relative">
          <div className="flex items-center gap-1.5">
            <NetworkIcon type={iconType} iconUrl={iconUrl} />
            <div className="flex flex-col gap-1 justify-center">
              <span className="text-sm font-semibold leading-none break-all">{title}</span>
              {/* Completed: show "View in explorer" link */}
              {isCompleted && explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  View in explorer <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {/* Pending/Current: show gas info */}
              {!isCompleted && gasEth && gasUsd && (
                <div className="flex gap-1 items-center">
                  <GasIcon />
                  <span className="text-xs text-muted-foreground leading-none">{gasEth} ETH</span>
                  <span className="text-xs text-muted-foreground leading-none opacity-50">{gasUsd}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side: button, checkmark, spinner, or greyed text */}
          <div className="flex flex-col gap-1.5 items-end">
            {isCompleted ? (
              // Completed: show checkmark
              <div className="w-8 h-8 rounded-full border-2 border-foreground/30 flex items-center justify-center">
                <Check className="w-4 h-4 text-foreground" />
              </div>
            ) : isLoading ? (
              // Loading: show half-circle spinner
              <HalfCircleSpinner />
            ) : isCurrent && buttonLabel ? (
              // Current step: show white/primary button
              <button
                onClick={onAction}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium leading-none h-9 rounded-full px-4 bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.03] transition-all"
              >
                {buttonLabel}
              </button>
            ) : buttonLabel ? (
              // Pending: show greyed out text (not a button)
              <span className="text-sm font-medium text-muted-foreground/50 px-3 h-9 flex items-center">
                {buttonLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
