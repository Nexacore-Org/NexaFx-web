"use client";

import { useState } from "react";
import {
  ConvertForm,
  type ConvertFormProps,
  type ConvertValues,
} from "@/components/convert/convert-form";
import { ConvertReview } from "@/components/convert/convert-review";
import { ConvertSuccess } from "@/components/convert/convert-success";
import type { ConvertQuote } from "@/hooks/use-convert-quote";
import type { Transaction } from "@/lib/api/transactions";

type Step =
  | { name: "form" }
  | { name: "review"; values: ConvertValues; quote: ConvertQuote }
  | {
      name: "success";
      values: ConvertValues;
      quote: ConvertQuote;
      transaction: Transaction;
    };

/**
 * Form, review and success steps. The form stays mounted (hidden) while
 * reviewing so going back, or a failed confirm, keeps everything entered.
 */
export function ConvertFlow({
  defaultValues,
}: Pick<ConvertFormProps, "defaultValues">) {
  const [step, setStep] = useState<Step>({ name: "form" });
  const [formKey, setFormKey] = useState(0);

  return (
    <>
      <div hidden={step.name !== "form"}>
        <ConvertForm
          key={formKey}
          defaultValues={defaultValues}
          onContinue={(values, quote) =>
            setStep({ name: "review", values, quote })
          }
        />
      </div>
      {step.name === "review" && (
        <ConvertReview
          key={step.quote.quoteId}
          values={step.values}
          quote={step.quote}
          onBack={() => setStep({ name: "form" })}
          onSuccess={(transaction, quote) =>
            setStep({
              name: "success",
              values: step.values,
              quote,
              transaction,
            })
          }
        />
      )}
      {step.name === "success" && (
        <ConvertSuccess
          values={step.values}
          quote={step.quote}
          transaction={step.transaction}
          onReset={() => {
            setFormKey((key) => key + 1);
            setStep({ name: "form" });
          }}
        />
      )}
    </>
  );
}
