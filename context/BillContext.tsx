import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { BillData, LineItem, CalculatedTotals } from "../types";
import { processReceipt } from "../lib/api";
import { 
  MOCK_DATA, 
  DEFAULT_NEW_PARTICIPANT_NAME, 
  DEFAULT_PRICE,
  DEFAULT_QUANTITY,
  WEIGHT_INCREMENT,
  WEIGHT_INITIAL,
  WEIGHT_MIN
} from "../lib/constants";
import { calculateTotals } from "../lib/bill-utils";
import { compressImage } from "../lib/image-utils";
import { 
  isValidWeight, 
  isValidPrice, 
  isValidBillData,
  canDeleteParticipant,
  sanitizeParticipantName,
  sanitizeItemDescription
} from "../lib/validation";
import { getOpenRouterApiKey } from "../lib/env";

interface BillContextType {
  // Input state
  imageUri: string | null;
  setImageUri: (uri: string | null) => void;
  promptText: string;
  setPromptText: (text: string) => void;
  error: string | null;
  isProcessing: boolean;
  
  // Bill data
  data: BillData | null;
  calculatedTotals: CalculatedTotals | null;
  
  // Actions
  processReceiptAction: () => Promise<boolean>;
  loadMockData: () => void;
  resetAll: () => void;
  
  // Bill editing
  updateItemSplit: (itemId: string, participantId: string, weight: number) => void;
  updateModifier: (key: "tax" | "tip", field: string, value: any) => void;
  updateParticipantName: (id: string, name: string) => void;
  addParticipant: () => void;
  deleteParticipant: (id: string) => void;
  saveItem: (item: Partial<LineItem>) => void;
  deleteItem: (itemId: string) => void;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

export function BillProvider({ children }: { children: React.ReactNode }) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [promptText, setPromptText] = useState("");
  const [data, setData] = useState<BillData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculatedTotals = useMemo(() => calculateTotals(data), [data]);

  const processReceiptAction = useCallback(async (): Promise<boolean> => {
    if (!imageUri && !promptText) return false;

    setIsProcessing(true);
    setError(null);

    try {
      const apiKey = getOpenRouterApiKey();
      const base64Data = imageUri ? await compressImage(imageUri) : ""; 

      const parsedData = await processReceipt(base64Data, promptText, apiKey) as BillData;

      if (!isValidBillData(parsedData)) {
        throw new Error("Invalid response structure from API");
      }

      parsedData.participants = parsedData.participants.map(
        (p, i) => ({ 
          ...p, 
          id: p.id || `p${i}`,
          name: sanitizeParticipantName(p.name)
        })
      );
      parsedData.line_items = parsedData.line_items.map(
        (item, i) => ({ 
          ...item,
          id: item.id || `item${i}`,
          description: sanitizeItemDescription(item.description),
          quantity: Math.max(1, item.quantity || 1),
          unit_price: Math.max(0, item.unit_price || 0),
          total_price: Math.max(0, item.total_price || 0)
        })
      );

      setData(parsedData);
      setIsProcessing(false);
      return true;
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError("Failed to process. " + errorMessage);
      setIsProcessing(false);
      return false;
    }
  }, [imageUri, promptText]);

  const loadMockData = useCallback(() => {
    setData(MOCK_DATA);
  }, []);

  const resetAll = useCallback(() => {
    setImageUri(null);
    setPromptText("");
    setData(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  const updateItemSplit = useCallback((
    itemId: string,
    participantId: string,
    newWeight: number
  ) => {
    if (!isValidWeight(newWeight)) return;

    setData((prev) => {
      if (!prev) return null;
      const newData = { ...prev };
      newData.split_logic = [...prev.split_logic];

      const logicIndex = newData.split_logic.findIndex((l) => l.item_id === itemId);

      if (logicIndex === -1) {
        if (newWeight > 0) {
          newData.split_logic.push({
            item_id: itemId,
            method: "ratio",
            allocations: [{ participant_id: participantId, weight: newWeight }],
          });
        }
      } else {
        const logic = {
          ...newData.split_logic[logicIndex],
          allocations: [...newData.split_logic[logicIndex].allocations],
        };
        const allocIndex = logic.allocations.findIndex((a) => a.participant_id === participantId);

        if (allocIndex > -1) {
          if (newWeight <= 0) logic.allocations.splice(allocIndex, 1);
          else logic.allocations[allocIndex] = { ...logic.allocations[allocIndex], weight: newWeight };
        } else if (newWeight > 0) {
          logic.allocations.push({ participant_id: participantId, weight: newWeight });
        }
        newData.split_logic[logicIndex] = logic;
      }
      return newData;
    });
  }, []);

  const updateModifier = useCallback((key: "tax" | "tip", field: string, value: any) => {
    setData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        modifiers: {
          ...prev.modifiers,
          [key]: { ...prev.modifiers[key], [field]: value },
        },
      };
    });
  }, []);

  const updateParticipantName = useCallback((id: string, name: string) => {
    const sanitizedName = sanitizeParticipantName(name);
    if (!sanitizedName) return;

    setData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        participants: prev.participants.map((p) =>
          p.id === id ? { ...p, name: sanitizedName } : p
        ),
      };
    });
  }, []);

  const addParticipant = useCallback(() => {
    setData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        participants: [
          ...prev.participants,
          { id: `p${Date.now()}`, name: DEFAULT_NEW_PARTICIPANT_NAME },
        ],
      };
    });
  }, []);

  const deleteParticipant = useCallback((id: string) => {
    setData((prev) => {
      if (!prev) return null;
      if (!canDeleteParticipant(prev, id)) return prev;

      return {
        ...prev,
        participants: prev.participants.filter((p) => p.id !== id),
        split_logic: prev.split_logic.map((logic) => ({
          ...logic,
          allocations: logic.allocations.filter((a) => a.participant_id !== id),
        })),
      };
    });
  }, []);

  const saveItem = useCallback((editingItem: Partial<LineItem>) => {
    if (!editingItem || !editingItem.description) return;

    const sanitizedDescription = sanitizeItemDescription(editingItem.description);
    if (!sanitizedDescription) return;

    const price = editingItem.total_price || DEFAULT_PRICE;
    if (!isValidPrice(price)) return;

    setData((prev) => {
      if (!prev) return null;
      const newItem: LineItem = {
        id: editingItem.id || `item-${Date.now()}`,
        description: sanitizedDescription,
        quantity: Math.max(DEFAULT_QUANTITY, editingItem.quantity || DEFAULT_QUANTITY),
        unit_price: price,
        total_price: price,
      };

      if (editingItem.id) {
        return {
          ...prev,
          line_items: prev.line_items.map((i) => i.id === editingItem.id ? newItem : i),
        };
      } else {
        return {
          ...prev,
          line_items: [...prev.line_items, newItem],
        };
      }
    });
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        line_items: prev.line_items.filter((i) => i.id !== itemId),
        split_logic: prev.split_logic.filter((l) => l.item_id !== itemId),
      };
    });
  }, []);

  const value: BillContextType = {
    imageUri,
    setImageUri,
    promptText,
    setPromptText,
    error,
    isProcessing,
    data,
    calculatedTotals,
    processReceiptAction,
    loadMockData,
    resetAll,
    updateItemSplit,
    updateModifier,
    updateParticipantName,
    addParticipant,
    deleteParticipant,
    saveItem,
    deleteItem,
  };

  return (
    <BillContext.Provider value={value}>
      {children}
    </BillContext.Provider>
  );
}

export function useBill() {
  const context = useContext(BillContext);
  if (context === undefined) {
    throw new Error("useBill must be used within a BillProvider");
  }
  return context;
}

