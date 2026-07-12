import { Check } from "lucide-react";



export function ProgressSteps({ steps, currentStep }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  index < currentStep
                    ? "bg-[#6FB3B5] border-[#6FB3B5] text-white"
                    : index === currentStep
                    ? "bg-[#6FB3B5] border-[#6FB3B5] text-white"
                    : "bg-white border-[#DCE8EE] text-[#7A8A92]"
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              {/* Step Label */}
              <div
                className={`mt-2 text-sm text-center px-2 ${
                  index === currentStep
                    ? "text-[#6FB3B5] font-semibold"
                    : index < currentStep
                    ? "text-[#2F3A40] font-medium"
                    : "text-[#7A8A92]"
                }`}
              >
                {step}
              </div>
            </div>
            {/* Progress Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-8">
                <div
                  className={`h-full transition-all ${
                    index < currentStep ? "bg-[#6FB3B5]" : "bg-[#DCE8EE]"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
