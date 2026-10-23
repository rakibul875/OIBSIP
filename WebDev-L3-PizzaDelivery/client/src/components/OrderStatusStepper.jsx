import React from "react";
import { ClipboardCheck, Flame, Bike, CheckCircle2 } from "lucide-react";

const steps = [
  { id: "Order Received", label: "Order Received", icon: ClipboardCheck },
  { id: "In Kitchen", label: "In Kitchen", icon: Flame },
  { id: "Sent to Delivery", label: "Sent to Delivery", icon: Bike },
  { id: "Delivered", label: "Delivered", icon: CheckCircle2 },
];

const OrderStatusStepper = ({ currentStatus }) => {
  const getStepIndex = (status) => {
    return steps.findIndex((s) => s.id === status);
  };

  const currentIndex = getStepIndex(currentStatus);

  const getProgressWidth = () => {
    if (currentIndex <= 0) return "0%";
    if (currentIndex >= steps.length - 1) return "100%";
    return `${(currentIndex / (steps.length - 1)) * 100}%`;
  };

  return (
    <div style={{ margin: "1.5rem 0" }}>
      <div className="stepper-container">
        <div className="stepper-track">
          <div
            className="stepper-progress"
            style={{ width: getProgressWidth() }}
          />
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          let nodeClass = "step-node";
          if (isCompleted) nodeClass += " completed";
          if (isActive) nodeClass += " active";

          return (
            <div key={step.id} className={nodeClass}>
              <div className="step-circle">
                <Icon size={20} />
              </div>
              <span className="step-label">{step.label}</span>
              {isActive && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--accent-orange)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    marginTop: "2px",
                    letterSpacing: "0.05em",
                  }}
                >
                  In Progress
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusStepper;
