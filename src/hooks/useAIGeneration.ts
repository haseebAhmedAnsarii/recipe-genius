import { useState } from "react";
import toast from "react-hot-toast";

export function useAIGeneration<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState("");
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const generate = async (endpoint: string, payload: any, resultKey: string) => {
    setLoading(true);
    setError("");
    setData(null);
    setProvider("");
    setIsSaved(false);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await response.json();
      
      if (resData.error) {
        setError(resData.error + (resData.details ? "\n" + resData.details.join("\n") : ""));
        return;
      }
      
      setData(resData[resultKey] as T);
      setProvider(resData.provider || "");
    } catch (err: unknown) {
      const error = err as Error;
      setError("Failed to generate. Please try again. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const save = async (saveFn: () => Promise<void>, successMessage: string, errorMessage: string) => {
    setSaving(true);
    try {
      await saveFn();
      setIsSaved(true);
      toast.success(successMessage);
    } catch (err: unknown) {
      const error = err as Error;
      setError(`Failed to save: ${error.message}`);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return {
    data,
    loading,
    error,
    provider,
    saving,
    isSaved,
    generate,
    save
  };
}
